

import { Publication, Author, CrossRefResponse, CrossRefAuthor } from '../types';
import config from '../config'; // Import the configuration

// Basic DOI regex (simplified)
const DOI_REGEX = /\b(10\.\d{4,9}\/[-._;()/:A-Z0-9]+)\b/i;
// Basic arXiv ID regex (simplified, matches common formats like YYMM.NNNNN or category/YYMMNNN)
const ARXIV_ID_REGEX = /(\d{4}\.\d{4,5}(v\d+)?|[a-z-]+(\.[A-Z]{2})?\/\d{7}(v\d+)?)/i;
const ARXIV_URL_REGEX = /arxiv\.org\/(abs|pdf)\/([^#?\s]+)/i;
const ORCID_ID_REGEX = /^(\d{4}-){3}\d{3}[\dX]$/i;

// Utility function to strip HTML/XML tags
const stripHtmlTags = (str: string | undefined): string | undefined => {
  if (!str) return undefined;
  // Use a DOM element to parse and extract text content
  // This is generally safer and more robust than regex for HTML
  try {
    const doc = new DOMParser().parseFromString(str, 'text/html');
    return doc.body.textContent || "";
  } catch (e) {
    // Fallback for environments where DOMParser might not be ideal or if error
    // This regex is very basic and might not cover all edge cases perfectly.
    return str.replace(/<[^>]*>?/gm, '');
  }
};


const parseArXivId = (identifier: string): string | null => {
    const urlMatch = identifier.match(ARXIV_URL_REGEX);
    if (urlMatch && urlMatch[2]) {
        return urlMatch[2].replace(/\.pdf$/, '').replace(/v\d+$/, ''); // Extract ID from URL, remove .pdf and version
    }
    const idMatch = identifier.match(ARXIV_ID_REGEX);
    // Ensure the entire identifier is an arXiv ID, not just a part of it, unless it's a URL
    if (idMatch && idMatch[0].length === identifier.trim().length) {
         return identifier.trim().replace(/v\d+$/, ''); // Remove version if present
    }
    return null;
};

const getSingleElementText = (parentElement: Element, tagName: string, namespaceURI: string | null = "http://www.w3.org/2005/Atom"): string | undefined => {
    const elements = namespaceURI
        ? parentElement.getElementsByTagNameNS(namespaceURI, tagName)
        : parentElement.getElementsByTagName(tagName);
    return elements[0]?.textContent?.replace(/\s\s+/g, ' ').trim();
};

// Helper to extract authors from CrossRef message
const parseCrossRefAuthors = (authorsData?: CrossRefAuthor[]): Author[] => {
  if (!authorsData) return [];
  return authorsData.map(a => ({
    given: a.given,
    family: a.family,
    name: a.name || `${a.given || ''} ${a.family || ''}`.trim(),
    sequence: a.sequence,
    ORCID: a.ORCID
  })).filter(a => a.name); // Ensure authors have a name
};

// Helper to parse abstract from CrossRef message
const parseCrossRefAbstract = (abstractData?: string): string | undefined => {
  if (abstractData && typeof abstractData === 'string') {
    const cleanedAbstract = abstractData
      .replace(/<\/?jats:[^>]*>/g, '') // Remove JATS tags
      .replace(/<[^>]+>/g, '')         // Remove any other HTML tags
      .replace(/\s\s+/g, ' ')          // Replace multiple whitespace chars with a single space
      .trim();
    return cleanedAbstract || undefined; // Return undefined if abstract becomes empty after cleaning
  }
  return undefined;
};

export async function fetchCitationCountFromSemanticScholar(id: string, type: 'DOI' | 'arXiv'): Promise<number | undefined> {
  if (!id) return undefined;
  const queryType = type === 'DOI' ? `DOI:${id}` : `ARXIV:${id}`;
  const url = `${config.apiBaseUrls.semanticScholar}${encodeURIComponent(queryType)}?fields=citationCount`;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 8000); // 8-second timeout

  try {
    const response = await fetch(url, { 
      signal: controller.signal,
      headers: {
        'Accept': 'application/json'
      }
    });
    clearTimeout(timeoutId); 

    if (!response.ok) {
      let errorBody = '';
      try {
        // Attempt to read the error body for more context
        errorBody = await response.text();
      } catch (e) {
        // Ignore if reading the body fails
      }
      
      if (response.status !== 404) { 
        console.warn(`Semantic Scholar API request for ${queryType} failed: ${response.status} ${response.statusText}. Body: ${errorBody}`);
      }
      // For 404, it's a known "not found", console.info could be used if less noisy logging is desired
      // else { console.info(`Semantic Scholar: ${queryType} not found (404). Body: ${errorBody}`); }
      return undefined;
    }
    const data = await response.json();
    return data.citationCount as number ?? undefined;
  } catch (error: any) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      console.warn(`Semantic Scholar API request for ${queryType} timed out.`);
    } else {
      // Log more details from the error object for "Failed to fetch" or other network errors
      console.error(`Error fetching citation count from Semantic Scholar for ${queryType}: ${error.message} (Name: ${error.name})`, error);
    }
    return undefined;
  }
}

async function fetchDoiFromCrossRef(doi: string, sourceContext: string): Promise<Publication | null> {
  const logPrefix = `(Context: ${sourceContext}) `;
  try {
    const response = await fetch(`${config.apiBaseUrls.crossref}${encodeURIComponent(doi)}`);
    if (!response.ok) {
      if (response.status === 404) {
        console.warn(`${logPrefix}DOI ${doi} not found on CrossRef.`);
      } else {
        console.error(`${logPrefix}CrossRef API error for DOI ${doi}: ${response.status} ${response.statusText}`);
      }
      return null;
    }
    const data = (await response.json()) as CrossRefResponse;

    if (data.status === 'ok' && data.message) {
      const msg = data.message;
      const authors = parseCrossRefAuthors(msg.author);
      const abstract = parseCrossRefAbstract(msg.abstract);
      const citationCount = await fetchCitationCountFromSemanticScholar(msg.DOI || doi, 'DOI');
      const tags = msg.subject?.map(s => s.trim().toLowerCase()).filter(s => s) || [];
      const rawTitle = msg.title?.[0];


      return {
        id: msg.DOI || doi, // Prefer DOI from response, fallback to input DOI
        type: 'DOI',
        title: stripHtmlTags(rawTitle) || 'Title not found',
        authors,
        year: msg.created?.['date-parts']?.[0]?.[0],
        source: msg['container-title']?.[0] || msg.type || undefined,
        abstract: abstract,
        url: msg.URL || `https://doi.org/${doi}`,
        tags: tags.length > 0 ? Array.from(new Set(tags)) : undefined,
        timestamp: Date.now(),
        citationCount: citationCount,
      };
    } else {
      console.warn(`${logPrefix}CrossRef returned an unexpected response structure for DOI ${doi}.`);
      return null;
    }
  } catch (error) {
    console.error(`${logPrefix}Error during CrossRef fetch for DOI ${doi}:`, error);
    return null;
  }
}


export const fetchPublicationMetadata = async (identifier: string): Promise<Publication | null> => {
  const doiMatch = identifier.match(DOI_REGEX);
  const arXivIdCandidate = parseArXivId(identifier); // Use the refined parser

  if (doiMatch && doiMatch[1]) {
    const doi = doiMatch[1];
    const pub = await fetchDoiFromCrossRef(doi, `primary DOI input "${identifier}"`);
    if (!pub) {
        // Don't throw error here, return null to allow manual entry flow
        console.warn(`Failed to fetch metadata for DOI: ${doi}. Check CrossRef or the identifier.`);
        return null;
    }
    return pub;
  } else if (arXivIdCandidate) {
    const arXivId = arXivIdCandidate;
    try {
      const response = await fetch(`${config.apiBaseUrls.arxiv}?id_list=${arXivId}&max_results=1`);
      if (!response.ok) {
         console.warn(`arXiv API request failed for ID ${arXivId} with status ${response.status}.`);
         return null; // Return null on failure
      }
      const xmlText = await response.text();
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(xmlText, "application/xml");

      const parserErrorNode = xmlDoc.querySelector("parsererror");
      if (parserErrorNode) {
          console.error("XML parsing error:", parserErrorNode.textContent);
          return null; // Return null on failure
      }

      const atomNS = "http://www.w3.org/2005/Atom";
      const arxivNS = "http://arxiv.org/schemas/atom";
      const entryElement = xmlDoc.getElementsByTagNameNS(atomNS, "entry")[0];

      if (!entryElement) {
        const errorTitleInFeed = xmlDoc.querySelector("feed > title");
        if(errorTitleInFeed && errorTitleInFeed.textContent?.toLowerCase().includes("error")){
            console.warn(`arXiv API error for ID ${arXivId}: ${errorTitleInFeed.textContent}`);
        } else {
            console.warn(`No entry found in arXiv response for ID ${arXivId}. The paper might not exist or the ID is incorrect.`);
        }
        return null; // Return null on failure
      }
      
      let linkedDoi: string | null = null;
      const doiElement = entryElement.getElementsByTagNameNS(arxivNS, "doi")[0];
      if (doiElement && doiElement.textContent) {
        linkedDoi = doiElement.textContent.trim();
      } else {
        const linkElements = Array.from(entryElement.getElementsByTagNameNS(atomNS, "link"));
        for (const linkEl of linkElements) {
          if (linkEl.getAttribute("title") === "doi" && linkEl.getAttribute("href")) {
            const href = linkEl.getAttribute("href")!;
            const doiFromLinkMatch = href.match(DOI_REGEX); 
            if (doiFromLinkMatch && doiFromLinkMatch[1]) {
              linkedDoi = doiFromLinkMatch[1];
              break;
            }
          }
        }
      }

      if (linkedDoi) {
        console.info(`arXiv entry ${arXivId} links to DOI: ${linkedDoi}. Attempting to fetch via DOI.`);
        const doiPublication = await fetchDoiFromCrossRef(linkedDoi, `linked DOI from arXiv ${arXivId}`);
        if (doiPublication) {
          console.info(`Successfully fetched metadata using linked DOI ${linkedDoi} from arXiv ${arXivId}.`);
          return doiPublication; 
        } else {
          console.warn(`Failed to fetch metadata for linked DOI ${linkedDoi} from arXiv ${arXivId}. Falling back to arXiv data.`);
        }
      }

      // Proceed with arXiv data if no linked DOI or if linked DOI fetch failed
      const rawTitle = getSingleElementText(entryElement, "title", atomNS);
      const title = stripHtmlTags(rawTitle) || "Title not found from arXiv";
      
      const authors_arxiv: Author[] = Array.from(entryElement.getElementsByTagNameNS(atomNS, "author"))
          .map(authorEl => {
              const name = getSingleElementText(authorEl, "name", atomNS);
              return { name: name || "Unknown Author" };
          }).filter(a => a.name && a.name !== "Unknown Author");

      const publishedDateStr = getSingleElementText(entryElement, "published", atomNS);
      const year_arxiv = publishedDateStr ? new Date(publishedDateStr).getFullYear() : undefined;
      
      const abstractXMLText = getSingleElementText(entryElement, "summary", atomNS);
      let abstract_arxiv: string | undefined = undefined;
      if (abstractXMLText) {
          const cleanedAbstract = abstractXMLText
              .replace(/<\/?jats:[^>]*>/g, '')
              .replace(/<[^>]+>/g, '')
              .replace(/\s\s+/g, ' ')
              .trim();
          if (cleanedAbstract) abstract_arxiv = cleanedAbstract;
      }

      const primaryCategoryEl = entryElement.getElementsByTagNameNS(arxivNS, "primary_category")[0];
      const source_arxiv = primaryCategoryEl?.getAttribute("term") || "arXiv";
      
      const arxivTags: string[] = [];
      if (primaryCategoryEl?.getAttribute("term")) {
        arxivTags.push(primaryCategoryEl.getAttribute("term")!.trim().toLowerCase());
      }
      const categoryElements = entryElement.getElementsByTagNameNS(atomNS, "category");
      Array.from(categoryElements).forEach(catEl => {
        const term = catEl.getAttribute("term");
        if (term) {
          arxivTags.push(term.trim().toLowerCase());
        }
      });


      const idLink = getSingleElementText(entryElement, "id", atomNS);
      const url_arxiv = idLink || `https://arxiv.org/abs/${arXivId}`;
      
      const citationCount = await fetchCitationCountFromSemanticScholar(arXivId, 'arXiv');

      return {
        id: arXivId,
        type: 'arXiv',
        title,
        authors: authors_arxiv.length > 0 ? authors_arxiv : [{ name: "Authors not found" }],
        year: year_arxiv,
        source: source_arxiv,
        abstract: abstract_arxiv,
        url: url_arxiv,
        tags: arxivTags.length > 0 ? Array.from(new Set(arxivTags)) : undefined,
        timestamp: Date.now(),
        citationCount: citationCount,
      };

    } catch (error) {
      console.error(`Error processing arXiv ID ${arXivId}:`, error);
      return null; // Return null on failure
    }
  }

  console.warn(`Identifier "${identifier}" not recognized as DOI or arXiv, or parsing failed.`);
  return null;
};


// --- Bulk Import Functions ---

export const fetchPublicationsFromOrcid = async (orcidId: string): Promise<Partial<Publication>[]> => {
  if (!ORCID_ID_REGEX.test(orcidId)) {
    throw new Error("Invalid ORCID ID format. Expected XXXX-XXXX-XXXX-XXXX.");
  }
  const url = `${config.apiBaseUrls.orcidPublicApi}${orcidId}/works`;
  try {
    const response = await fetch(url, { headers: { 'Accept': 'application/json' } });
    if (!response.ok) {
      throw new Error(`ORCID API request failed: ${response.status} ${response.statusText}`);
    }
    const data = await response.json();
    const works = data.group;
    const publications: Partial<Publication>[] = [];

    if (works && Array.isArray(works)) {
      for (const workGroup of works) {
        const summary = workGroup['work-summary']?.[0];
        if (summary) {
          const rawTitle = summary.title?.title?.value;
          const title = stripHtmlTags(rawTitle) || 'Title not found';
          const year = summary['publication-date']?.year?.value ? parseInt(summary['publication-date'].year.value, 10) : undefined;
          
          let pubId: string | undefined;
          let pubType: 'DOI' | 'arXiv' | 'Other' = 'Other';
          let pubUrl = summary.url?.value;

          const externalIds = summary['external-ids']?.['external-id'];
          if (externalIds && Array.isArray(externalIds)) {
            const doiEntry = externalIds.find(id => id['external-id-type'] === 'doi');
            if (doiEntry) {
              pubId = doiEntry['external-id-value'];
              pubType = 'DOI';
              if (!pubUrl) pubUrl = `https://doi.org/${pubId}`;
            } else {
              const arxivEntry = externalIds.find(id => id['external-id-type'] === 'arxiv');
              if (arxivEntry) {
                pubId = arxivEntry['external-id-value'];
                pubType = 'arXiv';
                 if (!pubUrl) pubUrl = `https://arxiv.org/abs/${pubId}`;
              }
            }
          }
          // If no DOI or arXiv, use ORCID put-code or a generated ID for uniqueness during review
          if (!pubId) {
             pubId = `orcid-${orcidId}-${summary['put-code'] || Math.random().toString(36).substr(2, 9)}`;
          }

          const authors: Author[] = workGroup.contributors?.contributor?.map((c: any) => ({
             name: `${c['credit-name']?.value || 'Unknown Author'}`
          })) || [];


          publications.push({
            id: pubId.toLowerCase(), // Normalize ID
            type: pubType,
            title,
            authors: authors.length > 0 ? authors : undefined,
            year,
            source: summary['journal-title']?.value || summary.type || undefined,
            url: pubUrl,
            // Tags and abstract usually not in summary, will be fetched in enrichment step
          });
        }
      }
    }
    return publications;
  } catch (error) {
    console.error("Error fetching from ORCID:", error);
    throw error;
  }
};

const parseBibtexAuthors = (authorString: string): Author[] => {
  return authorString.split(/ and /i)
    .map(name => {
      name = name.trim();
      if (name.includes(',')) {
        const parts = name.split(',');
        return { family: parts[0].trim(), given: parts.slice(1).join(',').trim() };
      } else {
        const parts = name.split(' ');
        const family = parts.pop() || '';
        const given = parts.join(' ');
        return { family: family.trim(), given: given.trim() };
      }
    })
    .map(a => ({ ...a, name: `${a.given || ''} ${a.family || ''}`.trim() }))
    .filter(a => a.name);
};


export const parseBibtex = (bibtexContent: string): Partial<Publication>[] => {
  const publications: Partial<Publication>[] = [];
  // Regex to capture each BibTeX entry (e.g., @article{...})
  const entryRegex = /@(\w+)\s*\{\s*([^,]+),([\s\S]*?)\n\s*}(?=\s*@|\s*$)/g;
  let match;

  while ((match = entryRegex.exec(bibtexContent)) !== null) {
    const bibType = match[1].toLowerCase(); // article, inproceedings, etc.
    // const bibKey = match[2].trim(); // BibTeX key like AuthorYearTitle
    const fieldsText = match[3];

    const pub: Partial<Publication> = {};
    // Regex to capture individual fields (e.g., title = {Some Title},)
    const fieldRegex = /\b(\w+)\s*=\s*(?:\{([\s\S]*?)\}|"([\s\S]*?)"|(\S+))/g;
    let fieldMatch;
    const rawFields: {[key: string]: string} = {};

    while ((fieldMatch = fieldRegex.exec(fieldsText)) !== null) {
      const key = fieldMatch[1].toLowerCase().trim();
      // Value can be in curly braces, quotes, or a single word (like a number for year)
      const value = (fieldMatch[2] || fieldMatch[3] || fieldMatch[4] || '').trim().replace(/^[\{\"\s]+|[\}\"\s]+$/g, ''); // Remove outer braces/quotes and trim spaces
      rawFields[key] = value;
    }

    pub.title = stripHtmlTags(rawFields.title) || 'Title not found';
    if (rawFields.author) {
      pub.authors = parseBibtexAuthors(rawFields.author);
    }
    if (rawFields.year) {
      pub.year = parseInt(rawFields.year, 10);
    }
    pub.source = rawFields.journal || rawFields.booktitle || rawFields.publisher || undefined;
    
    if (rawFields.doi) {
      pub.id = rawFields.doi.toLowerCase();
      pub.type = 'DOI';
      pub.url = `https://doi.org/${rawFields.doi}`;
    } else if (rawFields.eprint) {
      pub.id = rawFields.eprint.toLowerCase();
      pub.type = 'arXiv';
      pub.url = `https://arxiv.org/abs/${rawFields.eprint}`;
    } else {
      // Create a temporary ID if no DOI/arXiv for review list uniqueness
      pub.id = `bibtex-${Date.now()}-${Math.random().toString(16).slice(2)}`;
      pub.type = 'Other';
    }
    if(rawFields.url && !pub.url) pub.url = rawFields.url;


    if (rawFields.abstract) pub.abstract = stripHtmlTags(rawFields.abstract);
    if (rawFields.keywords) {
      pub.tags = rawFields.keywords.split(/[,;]/).map(k => k.trim().toLowerCase()).filter(k => k);
    }
    
    // Add publication type based on BibTeX entry type if not DOI/arXiv
    if(pub.type === 'Other'){
        if(bibType === 'article') pub.source = rawFields.journal || pub.source || 'Journal';
        else if(bibType === 'inproceedings' || bibType === 'conference') pub.source = rawFields.booktitle || pub.source || 'Conference';
        else if(bibType === 'book') pub.source = rawFields.publisher || pub.source || 'Book';
        else pub.source = pub.source || bibType;
    }


    publications.push(pub);
  }
  return publications;
};


export const fetchFullPublicationDetails = async (
  partialPub: Partial<Publication>,
  existingPublications: Publication[] = [] // Pass existing to check for full data
): Promise<Publication> => {
  
  // If it's a temporary ID (like from BibTeX without DOI/arXiv or initial ORCID),
  // try to find a real ID from its content (e.g. title match in existing data if it has DOI)
  let foundExisting: Publication | undefined;
  if(partialPub.id?.startsWith('bibtex-') || partialPub.id?.startsWith('orcid-')){
      // Check if a similar publication (e.g. by title and year) already exists with a proper ID
      foundExisting = existingPublications.find(p => 
          p.title.toLowerCase() === partialPub.title?.toLowerCase() &&
          p.year === partialPub.year &&
          (p.type === 'DOI' || p.type === 'arXiv')
      );
  }

  // If a full existing entry is found, use its data primarily
  if(foundExisting && (foundExisting.type === 'DOI' || foundExisting.type === 'arXiv')){
      return { // Return a merged version, prioritizing existing complete data
          ...partialPub, // Start with partial data (like tags from bibtex if better)
          ...foundExisting, // Override with existing complete data
          title: stripHtmlTags(foundExisting.title) || stripHtmlTags(partialPub.title) || "Untitled", // Ensure title is cleaned
          authors: foundExisting.authors || partialPub.authors || [],
          tags: Array.from(new Set([...(foundExisting.tags || []), ...(partialPub.tags || [])])), // Merge tags
          timestamp: Date.now(),
      };
  }

  // If it's a DOI or arXiv, try to fetch fresh full metadata
  if (partialPub.type === 'DOI' && partialPub.id && !partialPub.id.startsWith('bibtex-') && !partialPub.id.startsWith('orcid-')) {
    const fetched = await fetchPublicationMetadata(partialPub.id); // fetchPublicationMetadata already strips tags
    if (fetched) {
      return { // Merge: fetched data is base, partialPub can override some fields if desired (e.g. tags)
        ...fetched,
        tags: Array.from(new Set([...(fetched.tags || []), ...(partialPub.tags || [])])),
        timestamp: Date.now(),
      };
    }
  } else if (partialPub.type === 'arXiv' && partialPub.id && !partialPub.id.startsWith('bibtex-') && !partialPub.id.startsWith('orcid-')) {
    const fetched = await fetchPublicationMetadata(partialPub.id); // fetchPublicationMetadata already strips tags
    if (fetched) {
       return {
        ...fetched,
        tags: Array.from(new Set([...(fetched.tags || []), ...(partialPub.tags || [])])),
        timestamp: Date.now(),
      };
    }
  }

  // If not DOI/arXiv, or fetch failed, or it's a temp ID with no existing match,
  // ensure essential fields and try to get at least citation count if an ID exists.
  let citationCount = partialPub.citationCount;
  if (partialPub.id && (partialPub.type === 'DOI' || partialPub.type === 'arXiv') && citationCount === undefined) {
    citationCount = await fetchCitationCountFromSemanticScholar(partialPub.id, partialPub.type);
  }

  return {
    id: partialPub.id || `manual-${Date.now()}`,
    type: partialPub.type || 'Other',
    title: stripHtmlTags(partialPub.title) || 'Untitled Publication',
    authors: partialPub.authors || [],
    year: partialPub.year,
    source: partialPub.source,
    abstract: stripHtmlTags(partialPub.abstract), // Also strip abstract
    url: partialPub.url,
    tags: partialPub.tags || [],
    timestamp: Date.now(),
    citationCount: citationCount,
  };
};