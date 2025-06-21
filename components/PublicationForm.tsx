

import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Publication, Author } from '../types';
import { fetchPublicationMetadata, fetchPublicationsFromOrcid, parseBibtex, fetchFullPublicationDetails } from '../services/publicationService';
import LoadingSpinner from './LoadingSpinner';

interface PublicationFormProps {
  onAddPublication: (publication: Publication) => void;
  showAlert: (message: string, type: 'success' | 'error' | 'info') => void;
  existingPublications: Publication[];
  itemToEdit?: Publication;
  onCancelEdit: () => void;
  defaultTags: string[];
}

// Utility function to strip HTML/XML tags (copied here for self-containment, or could be imported if modularized)
const stripHtmlTags = (str: string | undefined): string | undefined => {
  if (!str) return undefined;
  try {
    const doc = new DOMParser().parseFromString(str, 'text/html');
    return doc.body.textContent || "";
  } catch (e) {
    return str.replace(/<[^>]*>?/gm, '');
  }
};


interface ReviewListItemProps {
  item: Partial<Publication>;
  isSelected: boolean;
  onToggleSelect: (id: string) => void;
  isDuplicate: boolean;
}

const ReviewListItem: React.FC<ReviewListItemProps> = ({ item, isSelected, onToggleSelect, isDuplicate }) => {
  return (
    <li className={`p-3 border rounded-md transition-all duration-150 ${isDuplicate ? 'bg-amber-800/50 border-amber-700' : 'bg-slate-700 border-slate-600'} ${isSelected ? 'ring-2 ring-sky-500 border-sky-500' : ''}`}>
      <div className="flex items-start space-x-3">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={() => onToggleSelect(item.id!)}
          className="mt-1 h-5 w-5 rounded border-gray-500 bg-slate-800 text-sky-500 focus:ring-sky-400 accent-sky-500"
          aria-labelledby={`item-title-${item.id}`}
        />
        <div className="flex-1">
          <h4 id={`item-title-${item.id}`} className="font-semibold text-gray-100">{stripHtmlTags(item.title) || 'N/A'}</h4>
          <p className="text-xs text-gray-400">
            {item.authors?.map(a => a.name).join(', ') || 'Authors N/A'} ({item.year || 'Year N/A'})
          </p>
          {item.source && <p className="text-xs text-gray-400">Source: {item.source}</p>}
          {item.id && !item.id.startsWith('bibtex-') && !item.id.startsWith('orcid-') && <p className="text-xs text-gray-500">ID: {item.id} ({item.type})</p>}
          {isDuplicate && <p className="text-xs font-semibold text-amber-400 mt-1">Likely duplicate (already in portal).</p>}
        </div>
      </div>
    </li>
  );
};


const PublicationForm: React.FC<PublicationFormProps> = ({ 
  onAddPublication, 
  showAlert, 
  existingPublications,
  itemToEdit,
  onCancelEdit,
  defaultTags
}) => {
  // Single entry states
  const [identifier, setIdentifier] = useState<string>('');
  const [isLoadingMetadata, setIsLoadingMetadata] = useState<boolean>(false);
  const [parsedData, setParsedData] = useState<Partial<Publication> | null>(null);
  const [manualEntry, setManualEntry] = useState<boolean>(false); 

  const [title, setTitle] = useState('');
  const [authors, setAuthors] = useState(''); 
  const [year, setYear] = useState<string>('');
  const [source, setSource] = useState('');
  const [abstract, setAbstract] = useState('');
  const [url, setUrl] = useState('');
  const [tagsInput, setTagsInput] = useState<string>('');
  const [selectedTags, setSelectedTags] = useState<Set<string>>(new Set());
  const [citationCount, setCitationCount] = useState<number | undefined>(undefined);

  // Bulk import states
  const [importMode, setImportMode] = useState<'single' | 'orcid' | 'bibtex'>('single');
  const [orcidIdInput, setOrcidIdInput] = useState<string>('');
  const [isOrcidLoading, setIsOrcidLoading] = useState<boolean>(false);
  const [fetchedOrcidPublications, setFetchedOrcidPublications] = useState<Partial<Publication>[]>([]);
  const [selectedForImport, setSelectedForImport] = useState<Set<string>>(new Set());
  
  const bibtexFileRef = useRef<HTMLInputElement>(null);
  const [isBibtexLoading, setIsBibtexLoading] = useState<boolean>(false);
  const [fetchedBibtexPublications, setFetchedBibtexPublications] = useState<Partial<Publication>[]>([]);
  const [isProcessingImport, setIsProcessingImport] = useState(false);


  const isEditing = !!itemToEdit;
  const tagsInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (itemToEdit) {
      setImportMode('single'); // Switch to single entry mode for editing
      setIdentifier(itemToEdit.id);
      setTitle(stripHtmlTags(itemToEdit.title) || '');
      setAuthors(itemToEdit.authors.map(a => a.name || `${a.given || ''} ${a.family || ''}`.trim()).join(', '));
      setYear(itemToEdit.year?.toString() || '');
      setSource(itemToEdit.source || '');
      setAbstract(stripHtmlTags(itemToEdit.abstract) || '');
      setUrl(itemToEdit.url || '');
      const currentItemTags = new Set((itemToEdit.tags || []).map(t => t.toLowerCase()));
      setSelectedTags(currentItemTags);
      setTagsInput(Array.from(currentItemTags).join(', '));
      setCitationCount(itemToEdit.citationCount);
      setParsedData(itemToEdit); 
      setManualEntry(true); 
    } else {
      resetSingleEntryForm();
    }
  }, [itemToEdit]);

  useEffect(() => {
    if (parsedData && !isEditing && importMode === 'single') {
      setTitle(stripHtmlTags(parsedData.title) || '');
      setAuthors(parsedData.authors?.map(a => a.name || `${a.given || ''} ${a.family || ''}`.trim()).join(', ') || '');
      setYear(parsedData.year?.toString() || '');
      setSource(parsedData.source || '');
      setAbstract(stripHtmlTags(parsedData.abstract) || '');
      setUrl(parsedData.url || '');
      const fetchedTagsSet = new Set((parsedData.tags || []).map(t => t.toLowerCase()));
      setSelectedTags(fetchedTagsSet);
      setTagsInput(Array.from(fetchedTagsSet).join(', '));
      setCitationCount(parsedData.citationCount);
    }
  }, [parsedData, isEditing, importMode]);

  const resetSingleEntryForm = () => {
    setIdentifier('');
    setTitle('');
    setAuthors('');
    setYear('');
    setSource('');
    setAbstract('');
    setUrl('');
    setSelectedTags(new Set<string>());
    setTagsInput('');
    setCitationCount(undefined);
    setParsedData(null);
    setManualEntry(false);
    setIsLoadingMetadata(false);
  };

  const resetBulkImportStates = () => {
    setOrcidIdInput('');
    setFetchedOrcidPublications([]);
    setFetchedBibtexPublications([]);
    setSelectedForImport(new Set());
    if (bibtexFileRef.current) bibtexFileRef.current.value = '';
  };

  const handleModeChange = (mode: 'single' | 'orcid' | 'bibtex') => {
    setImportMode(mode);
    resetSingleEntryForm(); // Reset single form if switching away
    resetBulkImportStates(); // Reset bulk states
    if (itemToEdit && mode !== 'single') onCancelEdit(); // Cancel edit if switching to bulk
  };

  const handleParseIdentifier = useCallback(async () => {
    if (isEditing) return; 

    if (!identifier.trim()) {
      showAlert('Please enter a DOI or arXiv ID.', 'error');
      return;
    }
    setIsLoadingMetadata(true);
    setParsedData(null); 
    setSelectedTags(new Set<string>()); 
    setTagsInput('');
    setManualEntry(false);
    setCitationCount(undefined);

    try {
      const metadata = await fetchPublicationMetadata(identifier.trim());
      if (metadata) {
        setParsedData(metadata); // metadata.title and .abstract are already stripped by fetchPublicationMetadata
        showAlert('Metadata fetched successfully. Review and save.', 'success');
      } else {
        showAlert('Could not fetch metadata. Check identifier or enter manually.', 'error');
        setManualEntry(true);
        setParsedData({ id: identifier, type: identifier.toLowerCase().includes('arxiv') ? 'arXiv' : 'DOI' });
        setTitle(''); setAuthors(''); setYear(''); setSource(''); setAbstract(''); setUrl(identifier.startsWith('http') ? identifier : '');
        setSelectedTags(new Set<string>());
        setTagsInput('');
      }
    } catch (error) {
      console.error("Error parsing identifier:", error);
      showAlert(`Error: ${(error as Error).message}. Try manual entry.`, 'error');
      setManualEntry(true);
      setParsedData({ id: identifier, type: identifier.toLowerCase().includes('arxiv') ? 'arXiv' : 'DOI' });
      setTitle(''); setAuthors(''); setYear(''); setSource(''); setAbstract(''); setUrl(identifier.startsWith('http') ? identifier : '');
      setSelectedTags(new Set<string>());
      setTagsInput('');
    } finally {
      setIsLoadingMetadata(false);
    }
  }, [identifier, showAlert, isEditing]);

  const processTagsFromInput = () => {
    const tagsArray = tagsInput.split(',').map(tag => tag.trim().toLowerCase()).filter(tag => tag);
    const newSelectedTags = new Set(tagsArray);
    setSelectedTags(newSelectedTags);
    setTagsInput(Array.from(newSelectedTags).join(', '));
  };

  const handleTagsInputChange = (e: React.ChangeEvent<HTMLInputElement>) => setTagsInput(e.target.value);
  const handleTagsInputBlur = () => processTagsFromInput();
  const handleTagsInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === ',' || e.key === 'Enter') {
      e.preventDefault();
      processTagsFromInput();
    }
  };

  const handleTagPillClick = (tag: string) => {
    const lowerTag = tag.toLowerCase();
    const newSelectedTags = new Set(selectedTags);
    if (newSelectedTags.has(lowerTag)) newSelectedTags.delete(lowerTag);
    else newSelectedTags.add(lowerTag);
    setSelectedTags(newSelectedTags);
    setTagsInput(Array.from(newSelectedTags).join(', '));
  };

  const handleSingleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isEditing && !manualEntry && !parsedData?.title && !title.trim()) {
        showAlert('Fetch/verify data, switch to manual, or ensure title.', 'error');
        return;
    }
    if ((manualEntry || isEditing || !parsedData) && !title.trim()) {
        showAlert('Title is required.', 'error');
        return;
    }

    const currentId = (itemToEdit?.id || parsedData?.id || identifier.trim()).toLowerCase();
    if (!isEditing && currentId && existingPublications.some(pub => pub.id.toLowerCase() === currentId)) {
        showAlert('This publication ID already exists.', 'error');
        return;
    }

    const finalTagsArray = Array.from(selectedTags).filter(tag => tag);
    const finalAuthors: Author[] = authors.split(',').map(name => name.trim()).filter(name => name).map(name => ({ name }));

    const publication: Publication = {
      id: itemToEdit?.id || parsedData?.id || identifier.trim() || Date.now().toString(),
      type: itemToEdit?.type || parsedData?.type || (identifier.toLowerCase().includes('arxiv') ? 'arXiv' : 'DOI'),
      title: stripHtmlTags(title.trim()) || "Untitled", // Ensure title is stripped
      authors: finalAuthors,
      year: year ? parseInt(year, 10) : undefined,
      source: source.trim() || undefined,
      abstract: stripHtmlTags(abstract.trim()) || undefined, // Ensure abstract is stripped
      url: url.trim() || (parsedData?.url) || undefined,
      tags: finalTagsArray.length > 0 ? finalTagsArray : undefined,
      timestamp: itemToEdit?.timestamp || Date.now(),
      citationCount: citationCount,
    };
    
    const finalPublication = { ...publication, timestamp: Date.now() };
    onAddPublication(finalPublication);
    if (!isEditing) resetSingleEntryForm();
  };

  // --- Bulk Import Logic ---
  const handleFetchOrcid = async () => {
    if (!orcidIdInput.trim()) {
      showAlert("Please enter an ORCID ID.", "error");
      return;
    }
    setIsOrcidLoading(true);
    setFetchedOrcidPublications([]);
    setSelectedForImport(new Set());
    try {
      const pubs = await fetchPublicationsFromOrcid(orcidIdInput.trim());
      setFetchedOrcidPublications(pubs);
      showAlert(`Fetched ${pubs.length} publication summaries from ORCID. Review and select for import.`, 'success');
    } catch (error) {
      showAlert(`Error fetching from ORCID: ${(error as Error).message}`, 'error');
    } finally {
      setIsOrcidLoading(false);
    }
  };

  const handleProcessBibtex = async () => {
    const file = bibtexFileRef.current?.files?.[0];
    if (!file) {
      showAlert("Please select a BibTeX file.", "error");
      return;
    }
    setIsBibtexLoading(true);
    setFetchedBibtexPublications([]);
    setSelectedForImport(new Set());
    try {
      const content = await file.text();
      const pubs = parseBibtex(content); // parseBibtex also strips titles/abstracts
      setFetchedBibtexPublications(pubs);
      showAlert(`Parsed ${pubs.length} entries from BibTeX file. Review and select for import.`, 'success');
    } catch (error) {
      showAlert(`Error parsing BibTeX: ${(error as Error).message}`, 'error');
    } finally {
      setIsBibtexLoading(false);
    }
  };

  const handleToggleSelectItem = (id: string) => {
    setSelectedForImport(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) newSet.delete(id);
      else newSet.add(id);
      return newSet;
    });
  };
  
  const handleToggleSelectAll = (source: 'orcid' | 'bibtex') => {
      const itemsToConsider = source === 'orcid' ? fetchedOrcidPublications : fetchedBibtexPublications;
      const allIds = itemsToConsider.map(p => p.id!);
      
      // If all are selected, deselect all. Otherwise, select all.
      const allCurrentlySelected = allIds.every(id => selectedForImport.has(id));

      if (allCurrentlySelected) {
          setSelectedForImport(new Set());
      } else {
          setSelectedForImport(new Set(allIds));
      }
  };

  const checkIsDuplicate = (item: Partial<Publication>): boolean => {
    if (!item.id || item.id.startsWith('bibtex-') || item.id.startsWith('orcid-')) { // For items without reliable ID yet
      return existingPublications.some(existingPub => 
        stripHtmlTags(existingPub.title)?.toLowerCase() === stripHtmlTags(item.title)?.toLowerCase() &&
        existingPub.year === item.year
      );
    }
    return existingPublications.some(existingPub => existingPub.id.toLowerCase() === item.id!.toLowerCase());
  };

  const handleBulkImport = async (source: 'orcid' | 'bibtex') => {
    const itemsToImport = (source === 'orcid' ? fetchedOrcidPublications : fetchedBibtexPublications)
      .filter(p => selectedForImport.has(p.id!));

    if (itemsToImport.length === 0) {
      showAlert("No publications selected for import.", "info");
      return;
    }
    setIsProcessingImport(true);
    let addedCount = 0;
    let skippedCount = 0;

    for (const partialPub of itemsToImport) {
      if (checkIsDuplicate(partialPub)) {
        skippedCount++;
        continue;
      }
      try {
        // Enrich with full details, including citation count and potentially better metadata
        // fetchFullPublicationDetails also strips titles/abstracts
        const fullPub = await fetchFullPublicationDetails(partialPub, existingPublications);
        onAddPublication(fullPub); // App.tsx handles its own duplicate check on final ID
        addedCount++;
      } catch (error) {
        console.error("Error processing item for import:", partialPub.title, error);
        skippedCount++;
      }
    }
    showAlert(`Import complete: Added ${addedCount} publications. Skipped ${skippedCount} (duplicates or errors).`, 'success');
    setIsProcessingImport(false);
    // Optionally reset specific import view after completion
    if (source === 'orcid') {
        setFetchedOrcidPublications([]);
    } else {
        setFetchedBibtexPublications([]);
    }
    setSelectedForImport(new Set());
  };


  const commonInputClass = "mt-1 block w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500 sm:text-sm text-gray-200 placeholder-gray-400";
  const disabledInputClass = "disabled:bg-slate-600 disabled:text-gray-400 disabled:cursor-not-allowed";
  
  const renderReviewList = (items: Partial<Publication>[], source: 'orcid' | 'bibtex') => {
    if (items.length === 0) return null;
    return (
      <div className="mt-6 space-y-4">
        <div className="flex justify-between items-center">
            <h4 className="text-lg font-semibold text-gray-200">Review and Select ({selectedForImport.size} / {items.length} selected)</h4>
            <button
                type="button"
                onClick={() => handleToggleSelectAll(source)}
                className="px-3 py-1.5 text-xs font-medium rounded-md bg-sky-600 hover:bg-sky-700 text-white transition-colors"
            >
                {items.every(item => selectedForImport.has(item.id!)) && items.length > 0 ? 'Deselect All' : 'Select All'}
            </button>
        </div>
        <ul className="space-y-3 max-h-96 overflow-y-auto pr-2 rounded-md bg-slate-800/50 p-3 border border-slate-700">
          {items.map(item => (
            <ReviewListItem
              key={item.id}
              item={item}
              isSelected={selectedForImport.has(item.id!)}
              onToggleSelect={handleToggleSelectItem}
              isDuplicate={checkIsDuplicate(item)}
            />
          ))}
        </ul>
        <button
          type="button"
          onClick={() => handleBulkImport(source)}
          disabled={isProcessingImport || selectedForImport.size === 0}
          className="w-full justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-green-500 disabled:opacity-60"
        >
          {isProcessingImport ? <LoadingSpinner /> : `Add ${selectedForImport.size} Selected to Portal`}
        </button>
      </div>
    );
  };


  return (
    <div className="bg-slate-800 p-6 md:p-8 rounded-xl shadow-2xl">
      <h2 className="text-3xl font-bold mb-6 text-sky-400">
        {isEditing ? 'Edit Publication' : 'Add New Publication'}
      </h2>
      
      {/* Mode Switcher */}
      {!isEditing && (
        <div className="mb-6 border-b border-slate-700 pb-4">
          <label className="block text-sm font-medium text-gray-300 mb-2">Entry Mode:</label>
          <div className="flex space-x-2 rounded-md bg-slate-700 p-1">
            {(['single', 'orcid', 'bibtex'] as const).map((mode) => (
              <button
                key={mode}
                type="button"
                onClick={() => handleModeChange(mode)}
                className={`w-full px-3 py-2 text-sm font-medium rounded-md transition-all
                  ${importMode === mode ? 'bg-sky-500 text-white shadow-md' : 'text-gray-300 hover:bg-slate-600 hover:text-white'}`}
              >
                {mode === 'single' ? 'Single Entry' : mode === 'orcid' ? 'ORCID Import' : 'BibTeX Import'}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* --- SINGLE ENTRY FORM --- */}
      {importMode === 'single' && (
        <form onSubmit={handleSingleSubmit} className="space-y-6">
          <div>
            <label htmlFor="identifier" className="block text-sm font-medium text-gray-300">
              DOI or arXiv ID/Link
            </label>
            <div className="mt-1 flex rounded-md shadow-sm">
              <input
                type="text" name="identifier" id="identifier"
                value={identifier}
                onChange={(e) => !isEditing && setIdentifier(e.target.value)}
                className={`flex-1 min-w-0 block w-full px-3 py-2 rounded-none rounded-l-md focus:ring-sky-500 focus:border-sky-500 sm:text-sm border-slate-600 bg-slate-700 text-gray-200 placeholder-gray-400 ${isEditing ? disabledInputClass : ''}`}
                placeholder="e.g., 10.1000/xyz123 or arXiv:2101.00001"
                aria-label="DOI or arXiv ID/Link"
                disabled={isEditing || isLoadingMetadata}
              />
              <button
                type="button" onClick={handleParseIdentifier}
                disabled={isLoadingMetadata || isEditing}
                className={`inline-flex items-center px-4 py-2 border border-l-0 border-sky-500 rounded-r-md bg-sky-500 text-white text-sm font-medium hover:bg-sky-600 focus:outline-none focus:ring-1 focus:ring-sky-500 focus:border-sky-500 disabled:opacity-50 ${isEditing ? 'cursor-not-allowed' : ''}`}
              >
                {isLoadingMetadata && !isEditing ? <LoadingSpinner size="sm" /> : 'Fetch & Parse'}
              </button>
            </div>
            {!isEditing && <p className="mt-2 text-xs text-gray-400">
              For arXiv, parsing is experimental. Manual review or entry is recommended. Citation counts from Semantic Scholar.
            </p>}
            {isEditing && <p className="mt-2 text-xs text-gray-400">Identifier cannot be changed during edit.</p>}
          </div>

          {isLoadingMetadata && !isEditing && <div className="text-center py-4"><LoadingSpinner /> <p className="text-gray-300">Fetching metadata...</p></div>}

          {(parsedData || manualEntry || isEditing) && (
            <div className="space-y-4 pt-4 border-t border-slate-700">
              {/* ... (rest of single entry details form: title, authors, year, source, tags, abstract) ... */}
              {!isEditing && !manualEntry && parsedData && parsedData.title && (
                 <div className="bg-slate-700 p-4 rounded-md shadow space-y-1">
                    <h3 className="text-lg font-semibold text-sky-300 mb-2">Fetched Data (Review or Edit Below)</h3>
                    <p className="text-sm text-gray-300"><strong>Title:</strong> {stripHtmlTags(parsedData.title)}</p>
                    <p className="text-sm text-gray-300"><strong>Authors:</strong> {parsedData.authors?.map(a => a.name || `${a.given || ''} ${a.family || ''}`.trim()).join(', ')}</p>
                    {parsedData.year && <p className="text-sm text-gray-300"><strong>Year:</strong> {parsedData.year}</p>}
                    {parsedData.source && <p className="text-sm text-gray-300"><strong>Source:</strong> {parsedData.source}</p>}
                    {parsedData.tags && parsedData.tags.length > 0 && <p className="text-sm text-gray-300"><strong>Fetched Tags:</strong> {parsedData.tags.join(', ')}</p>}
                    {citationCount !== undefined && <p className="text-sm text-gray-300"><strong>Cited by (Semantic Scholar):</strong> {citationCount}</p>}
                     {typeof parsedData.abstract === 'string' && (
                        <details className="text-sm text-gray-300">
                            <summary className="cursor-pointer text-gray-400 hover:text-gray-200"><strong>Abstract:</strong> Click to view/hide</summary>
                            <p className="mt-1 pl-2 italic text-gray-400 max-h-32 overflow-y-auto whitespace-pre-wrap">
                                {stripHtmlTags(parsedData.abstract) || "(Abstract is empty)"}
                            </p>
                        </details>
                    )}
                 </div>
             )}

            {!isEditing && !parsedData?.title && !manualEntry && !isLoadingMetadata && identifier && (
                 <button
                    type="button"
                    onClick={() => {
                        setManualEntry(true);
                        setParsedData({ 
                            id: identifier, 
                            type: identifier.toLowerCase().includes('arxiv') ? 'arXiv' : 'DOI'
                        }); 
                        setTitle(''); setAuthors(''); setYear(''); setSource(''); setAbstract(''); setUrl(identifier.startsWith('http') ? identifier : '');
                        setSelectedTags(new Set<string>());
                        setTagsInput('');
                        setCitationCount(undefined);
                    }}
                    className="text-sky-400 hover:text-sky-300 text-sm underline"
                >
                    Parsing failed or incomplete? Switch to Manual Entry
                </button>
            )}

            <h3 className="text-xl font-semibold text-gray-200 mt-6 mb-3">
              {isEditing ? 'Edit Details' : (manualEntry ? 'Manual Entry' : 'Review/Edit Details')}
            </h3>
            <div>
              <label htmlFor="pub-title" className="block text-sm font-medium text-gray-300">Title</label>
              <input type="text" name="pub-title" id="pub-title" value={title} onChange={e => setTitle(e.target.value)} required className={commonInputClass} />
            </div>
            <div>
              <label htmlFor="pub-authors" className="block text-sm font-medium text-gray-300">Authors (comma-separated)</label>
              <input type="text" name="pub-authors" id="pub-authors" value={authors} onChange={e => setAuthors(e.target.value)} required className={commonInputClass} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="pub-year" className="block text-sm font-medium text-gray-300">Year</label>
                <input type="number" name="pub-year" id="pub-year" value={year} onChange={e => setYear(e.target.value)} className={commonInputClass} />
              </div>
              <div>
                <label htmlFor="pub-source" className="block text-sm font-medium text-gray-300">Journal/Conference/Source</label>
                <input type="text" name="pub-source" id="pub-source" value={source} onChange={e => setSource(e.target.value)} className={commonInputClass} />
              </div>
            </div>
            <div>
              <label htmlFor="pub-url" className="block text-sm font-medium text-gray-300">URL (Link to publication)</label>
              <input type="url" name="pub-url" id="pub-url" value={url} onChange={e => setUrl(e.target.value)} className={commonInputClass} />
            </div>
            
            {defaultTags.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-300">Suggested Tags</label>
                <div className="mt-2 flex flex-wrap gap-2">
                  {defaultTags.map(tag => (
                    <button
                      type="button" key={tag} onClick={() => handleTagPillClick(tag)}
                      className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-opacity-75
                        ${selectedTags.has(tag.toLowerCase()) ? 'bg-sky-500 text-white ring-sky-500' : 'bg-slate-600 text-sky-200 hover:bg-slate-500 hover:text-white ring-slate-600 hover:ring-slate-500'}`}
                      aria-pressed={selectedTags.has(tag.toLowerCase())}
                    >{tag}</button>
                  ))}
                </div>
              </div>
            )}
             <div>
              <label htmlFor="pub-tags" className="block text-sm font-medium text-gray-300">Selected Tags (comma-separated)</label>
              <input type="text" name="pub-tags" id="pub-tags" ref={tagsInputRef} value={tagsInput} 
                onChange={handleTagsInputChange} onBlur={handleTagsInputBlur} onKeyDown={handleTagsInputKeyDown}
                className={commonInputClass} placeholder="e.g., machine learning, astrophysics" />
              <p className="mt-1 text-xs text-gray-400">Press Enter or comma to confirm typed tags.</p>
            </div>
            <div>
              <label htmlFor="pub-abstract" className="block text-sm font-medium text-gray-300">Abstract (Optional)</label>
              <textarea name="pub-abstract" id="pub-abstract" rows={4} value={abstract} onChange={e => setAbstract(e.target.value)} className={commonInputClass}></textarea>
            </div>

             <div className="pt-5 flex space-x-3">
                <button type="submit"
                    className="flex-1 justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-green-500 disabled:opacity-60"
                    disabled={isLoadingMetadata || (!isEditing && !manualEntry && !parsedData?.title && !title.trim())}>
                    {isLoadingMetadata ? <LoadingSpinner /> : (isEditing ? 'Update Publication' : 'Save Publication')}
                </button>
                {isEditing && (
                    <button type="button" onClick={onCancelEdit}
                    className="flex-1 justify-center py-3 px-4 border border-gray-500 rounded-md shadow-sm text-sm font-medium text-gray-200 bg-slate-600 hover:bg-slate-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-gray-400">
                    Cancel
                    </button>
                )}
            </div>
            </div>
          )}
        </form>
      )}

      {/* --- ORCID IMPORT --- */}
      {importMode === 'orcid' && !isEditing && (
        <div className="space-y-6 pt-4 border-t border-slate-700">
          <h3 className="text-xl font-semibold text-gray-200">Import from ORCID Profile</h3>
          <div>
            <label htmlFor="orcid-id" className="block text-sm font-medium text-gray-300">ORCID ID</label>
            <div className="mt-1 flex rounded-md shadow-sm">
              <input
                type="text" name="orcid-id" id="orcid-id" value={orcidIdInput}
                onChange={e => setOrcidIdInput(e.target.value)}
                className="flex-1 min-w-0 block w-full px-3 py-2 rounded-none rounded-l-md focus:ring-sky-500 focus:border-sky-500 sm:text-sm border-slate-600 bg-slate-700 text-gray-200 placeholder-gray-400"
                placeholder="e.g., 0000-0001-2345-6789"
              />
              <button
                type="button" onClick={handleFetchOrcid} disabled={isOrcidLoading}
                className="inline-flex items-center px-4 py-2 border border-l-0 border-sky-500 rounded-r-md bg-sky-500 text-white text-sm font-medium hover:bg-sky-600 focus:outline-none focus:ring-1 focus:ring-sky-500 focus:border-sky-500 disabled:opacity-50"
              >
                {isOrcidLoading ? <LoadingSpinner size="sm" /> : 'Fetch from ORCID'}
              </button>
            </div>
          </div>
          {isOrcidLoading && <div className="text-center py-4"><LoadingSpinner /> <p className="text-gray-300">Fetching ORCID data...</p></div>}
          {renderReviewList(fetchedOrcidPublications, 'orcid')}
        </div>
      )}

      {/* --- BIBTEX IMPORT --- */}
      {importMode === 'bibtex' && !isEditing && (
        <div className="space-y-6 pt-4 border-t border-slate-700">
          <h3 className="text-xl font-semibold text-gray-200">Import from Google Scholar (BibTeX File)</h3>
          <div className="text-sm text-gray-400 space-y-1 bg-slate-700/30 p-3 rounded-md border border-slate-600">
            <p><strong>Instructions:</strong></p>
            <ol className="list-decimal list-inside pl-2">
              <li>Go to your Google Scholar profile page.</li>
              <li>Select the publications you wish to export.</li>
              <li>Click the "EXPORT" button above the list and choose "BibTeX".</li>
              <li>Save the downloaded <code className="text-xs bg-slate-600 px-1 py-0.5 rounded">.bib</code> file.</li>
              <li>Upload that file below.</li>
            </ol>
          </div>
          <div>
            <label htmlFor="bibtex-file" className="block text-sm font-medium text-gray-300">Upload .bib File</label>
            <input
              type="file" name="bibtex-file" id="bibtex-file" ref={bibtexFileRef}
              accept=".bib"
              onChange={() => { setFetchedBibtexPublications([]); setSelectedForImport(new Set()); }} // Reset on new file selection
              className={`${commonInputClass} file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-sky-100 file:text-sky-700 hover:file:bg-sky-200 text-gray-400`}
            />
          </div>
          <button
            type="button" onClick={handleProcessBibtex}
            disabled={isBibtexLoading || !bibtexFileRef.current?.files?.length}
            className="w-full justify-center py-3 px-4 border border-sky-500 rounded-md shadow-sm text-sm font-medium text-sky-200 bg-sky-600 hover:bg-sky-700 hover:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-sky-400 disabled:opacity-50"
          >
            {isBibtexLoading ? <LoadingSpinner size="sm" /> : 'Process BibTeX File'}
          </button>
          {isBibtexLoading && <div className="text-center py-4"><LoadingSpinner /> <p className="text-gray-300">Processing BibTeX...</p></div>}
          {renderReviewList(fetchedBibtexPublications, 'bibtex')}
        </div>
      )}
    </div>
  );
};

export default PublicationForm;