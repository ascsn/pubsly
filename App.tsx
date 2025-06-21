import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Publication, Presentation, ViewMode, PortalData, Author, ExportFormat } from './types';
import PublicationForm from './components/PublicationForm';
import PresentationForm from './components/PresentationForm';
import EntriesList from './components/EntriesList';
import Navbar from './components/Navbar';
import AlertMessage from './components/AlertMessage';
import HomeView from './components/HomeView';
import AnalyticsView from './components/AnalyticsView';
import config from './config'; // Import the config object
import { useAuth0 } from '@auth0/auth0-react';
import { fetchCitationCountFromSemanticScholar } from './services/publicationService';

const APP_DATA_KEY = 'pubslyData';

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

const App: React.FC = () => {
  const [publications, setPublications] = useState<Publication[]>([]);
  const [presentations, setPresentations] = useState<Presentation[]>([]);
  const [currentView, setCurrentView] = useState<ViewMode>(ViewMode.Home);
  const [lastSpeakerName, setLastSpeakerName] = useState<string>('');
  const [alert, setAlert] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [editingItem, setEditingItem] = useState<{ id: string; type: 'publication' | 'presentation' } | null>(null);
  const [activeTagFilter, setActiveTagFilter] = useState<string | null>(null); // For EntriesList filtering
  const [isRefreshingCitations, setIsRefreshingCitations] = useState<boolean>(false);

  const auth0 = useAuth0(); // This will be undefined if Auth0Provider is not used

  // Determine effective authentication status
  let effectiveIsAuthenticated: boolean;
  const isAuth0ProperlyConfigured = config.auth0Domain !== 'YOUR_AUTH0_DOMAIN' && config.auth0Domain !== '' &&
                                  config.auth0ClientId !== 'YOUR_AUTH0_CLIENT_ID' && config.auth0ClientId !== '';

  if (!config.enableAuth) {
    effectiveIsAuthenticated = true; // Auth disabled, grant full access
  } else {
    // Auth is enabled. Check if Auth0 is configured and if the user is authenticated via Auth0.
    if (isAuth0ProperlyConfigured && auth0) {
      effectiveIsAuthenticated = auth0.isAuthenticated;
    } else {
      // Auth enabled but either not configured or auth0 context not available,
      // treat as not authenticated for features.
      effectiveIsAuthenticated = false;
    }
  }

  // Set document title from config
  useEffect(() => {
    document.title = config.appName;
  }, []);

  // Load data from localStorage on initial render
  useEffect(() => {
    const storedData = localStorage.getItem(APP_DATA_KEY);
    if (storedData) {
      try {
        const parsedData: PortalData = JSON.parse(storedData);
        setPublications(parsedData.publications || []);
        setPresentations(parsedData.presentations || []);
        setLastSpeakerName(parsedData.lastSpeakerName || '');
      } catch (error) {
        console.error("Failed to parse stored data:", error);
        setPublications([]);
        setPresentations([]);
        setLastSpeakerName('');
      }
    }
  }, []);

  // Save data to localStorage whenever it changes
  useEffect(() => {
    const portalData: PortalData = {
      publications,
      presentations,
      lastSpeakerName,
    };
    localStorage.setItem(APP_DATA_KEY, JSON.stringify(portalData));
  }, [publications, presentations, lastSpeakerName]);
  
  // Effect to clear activeTagFilter if navigating away from ViewEntries
  const prevViewRef = useRef<ViewMode | undefined>(undefined);
  useEffect(() => {
    if (prevViewRef.current === ViewMode.ViewEntries && currentView !== ViewMode.ViewEntries) {
      setActiveTagFilter(null);
    }
    prevViewRef.current = currentView;
  }, [currentView]);


  const showAlert = (message: string, type: 'success' | 'error' | 'info') => {
    setAlert({ message, type });
    setTimeout(() => setAlert(null), 5000); 
  };

  const addPublication = useCallback((pub: Publication) => {
    if (!effectiveIsAuthenticated) {
      showAlert('Please log in to add or update publications.', 'info');
      return;
    }
    const isEditing = editingItem && editingItem.type === 'publication' && editingItem.id === pub.id;
    setPublications(prev => {
      const updated = [pub, ...prev.filter(p => p.id.toLowerCase() !== pub.id.toLowerCase())].sort((a,b) => b.timestamp - a.timestamp);
      return updated;
    });
    showAlert(isEditing ? 'Publication updated successfully!' : 'Publication added successfully!', 'success');
    setEditingItem(null);
    setCurrentView(ViewMode.ViewEntries);
  }, [editingItem, effectiveIsAuthenticated]);

  const addPresentation = useCallback((pres: Presentation) => {
    if (!effectiveIsAuthenticated) {
      showAlert('Please log in to add or update presentations.', 'info');
      return;
    }
    const isEditing = editingItem && editingItem.type === 'presentation' && editingItem.id === pres.id;
    setPresentations(prev => {
      const updated = [pres, ...prev.filter(p => p.id !== pres.id)].sort((a,b) => b.timestamp - a.timestamp);
      return updated;
    });
    setLastSpeakerName(pres.speaker);
    showAlert(isEditing ? 'Presentation updated successfully!' : 'Presentation added successfully!', 'success');
    setEditingItem(null);
    setCurrentView(ViewMode.ViewEntries);
  }, [editingItem, effectiveIsAuthenticated]);

  const deletePublication = useCallback((id: string) => {
    if (!effectiveIsAuthenticated) {
      showAlert('Please log in to delete publications.', 'info');
      return;
    }
    setPublications(prev => prev.filter(p => p.id !== id));
    showAlert('Publication removed.', 'success');
  }, [effectiveIsAuthenticated]);

  const deletePresentation = useCallback((id: string) => {
    if (!effectiveIsAuthenticated) {
      showAlert('Please log in to delete presentations.', 'info');
      return;
    }
    setPresentations(prev => prev.filter(p => p.id !== id));
    showAlert('Presentation removed.', 'success');
  }, [effectiveIsAuthenticated]);

  const handleBulkDelete = useCallback((publicationIdsToDelete: string[], presentationIdsToDelete: string[]) => {
    if (!effectiveIsAuthenticated) {
      showAlert('Please log in to delete entries.', 'info');
      return;
    }
    let pubDelCount = 0;
    let presDelCount = 0;

    if (publicationIdsToDelete.length > 0) {
      setPublications(prev => {
        const remaining = prev.filter(p => !publicationIdsToDelete.includes(p.id));
        pubDelCount = prev.length - remaining.length;
        return remaining;
      });
    }
    if (presentationIdsToDelete.length > 0) {
      setPresentations(prev => {
        const remaining = prev.filter(p => !presentationIdsToDelete.includes(p.id));
        presDelCount = prev.length - remaining.length;
        return remaining;
      });
    }
    
    let message = 'Bulk delete successful. ';
    if (pubDelCount > 0) message += `Removed ${pubDelCount} publication(s). `;
    if (presDelCount > 0) message += `Removed ${presDelCount} presentation(s).`;
    if (pubDelCount === 0 && presDelCount === 0) message = 'No items were deleted.';

    showAlert(message.trim(), 'success');
  }, [effectiveIsAuthenticated]);


  const handleEditPublication = useCallback((id: string) => {
    if (!effectiveIsAuthenticated) {
      showAlert("Please log in to edit publications.", "info");
      return;
    }
    const pubToEdit = publications.find(p => p.id === id);
    if (pubToEdit) {
      setEditingItem({ id, type: 'publication' });
      setCurrentView(ViewMode.AddPublication);
    }
  }, [publications, effectiveIsAuthenticated]);

  const handleEditPresentation = useCallback((id: string) => {
    if (!effectiveIsAuthenticated) {
      showAlert("Please log in to edit presentations.", "info");
      return;
    }
    const presToEdit = presentations.find(p => p.id === id);
    if (presToEdit) {
      setEditingItem({ id, type: 'presentation' });
      setCurrentView(ViewMode.AddPresentation);
    }
  }, [presentations, effectiveIsAuthenticated]);

  const handleCancelEdit = useCallback(() => {
    setEditingItem(null);
    setCurrentView(ViewMode.ViewEntries);
  }, []);


  const triggerDownload = (filename: string, content: string, mimeType: string) => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const exportPortalDataAsJson = () => {
    const portalData: PortalData = { publications, presentations, lastSpeakerName };
    const jsonString = JSON.stringify(portalData, null, 2);
    triggerDownload('pubsly_data.json', jsonString, 'application/json');
    showAlert('Data exported as JSON.', 'success');
  };

  const formatAuthorsPlainText = (authors: Author[]): string => {
    if (!authors || authors.length === 0) return 'N/A';
    return authors.map(author => author.name || `${author.given || ''} ${author.family || ''}`.trim()).filter(name => name).join(', ');
  };

  const exportPortalDataAsPlainText = (pubsToExport: Publication[]) => {
    let textContent = `${config.appName} Data Export\nGenerated: ${new Date().toLocaleString()}\n`;
    if (activeTagFilter) {
      textContent += `Filtering by Tag: ${activeTagFilter}\n`;
    }
    textContent += `\n`;

    let publicationsWithCitations = 0;
    let totalCitations = 0;
    let mostCitedPublication: Publication | null = null;

    pubsToExport.forEach((pub: Publication) => {
      if (typeof pub.citationCount === 'number') {
        publicationsWithCitations++;
        totalCitations += pub.citationCount;
        if (!mostCitedPublication || pub.citationCount > (mostCitedPublication.citationCount || 0)) {
          mostCitedPublication = pub;
        }
      }
    });

    textContent += `=== CITATION SUMMARY (for ${activeTagFilter ? 'filtered' : 'all'} publications) ===\n`;
    if (publicationsWithCitations > 0) {
      textContent += `Publications with citation data: ${publicationsWithCitations}\n`;
      textContent += `Total citations: ${totalCitations}\n`;
      textContent += `Average citations per publication (with data): ${(totalCitations / publicationsWithCitations).toFixed(2)}\n`;
      if (mostCitedPublication) {
        textContent += `Most cited: \"${stripHtmlTags((mostCitedPublication as Publication).title || 'N/A')}\" (${(mostCitedPublication as Publication).citationCount || 0} citations)\n`;
      }
    } else {
      textContent += `No citation data available for ${activeTagFilter ? 'filtered' : 'any'} publications.\n`;
    }
    textContent += `(Citation data sourced from Semantic Scholar, may not be exhaustive)\n\n`;


    textContent += `=== PUBLICATIONS (${pubsToExport.length}) ${activeTagFilter ? '(Filtered by tag: ' + activeTagFilter + ')' : ''} ===\n\n`;
    if (pubsToExport.length > 0) {
      pubsToExport.forEach((pub, index) => {
        textContent += `Publication #${index + 1}\n`;
        textContent += `Title: ${stripHtmlTags(pub.title)}\n`;
        textContent += `Authors: ${formatAuthorsPlainText(pub.authors)}\n`;
        textContent += `Year: ${pub.year || 'N/A'}\n`;
        textContent += `Source: ${pub.source || 'N/A'}\n`;
        textContent += `Type: ${pub.type}\n`;
        textContent += `ID: ${pub.id}\n`;
        if (pub.tags && pub.tags.length > 0) {
          textContent += `Tags: ${pub.tags.join(', ')}\n`;
        }
        if (pub.citationCount !== undefined) {
          textContent += `Citations (Semantic Scholar): ${pub.citationCount}\n`;
        }
        if (pub.url) textContent += `URL: ${pub.url}\n`;
        if (pub.abstract) textContent += `Abstract:\n${stripHtmlTags(pub.abstract)}\n`;
        textContent += `---------------------\n\n`;
      });
    } else {
      textContent += `No publications to export ${activeTagFilter ? 'for this tag' : ''}.\n\n`;
    }
    
    if (!activeTagFilter) {
        textContent += `\n=== PRESENTATIONS (${presentations.length}) ===\n\n`;
        if (presentations.length > 0) {
          presentations.forEach((pres, index) => {
            textContent += `Presentation #${index + 1}\n`;
            textContent += `Title: ${pres.title}\n`;
            textContent += `Speaker: ${pres.speaker}\n`;
            textContent += `Date: ${pres.date}\n`;
            textContent += `Location: ${pres.location}\n`;
            if (pres.link) textContent += `Link: ${pres.link}\n`;
            if (pres.fileName) textContent += `File: ${pres.fileName} (${pres.fileType || 'N/A'})\n`;
            textContent += `---------------------\n\n`;
          });
        } else {
          textContent += `No presentations to export.\n\n`;
        }
    } else {
        textContent += `\n=== PRESENTATIONS ===\nPresentations are not filtered by tags and are not included in this tagged export.\nTo export presentations, clear the tag filter or use JSON export.\n\n`;
    }
    
    const filename = `pubsly_data${activeTagFilter ? `_tag_${activeTagFilter.replace(/\s+/g, '_').toLowerCase()}` : ''}.txt`;
    triggerDownload(filename, textContent, 'text/plain;charset=utf-8');
    showAlert(`Data exported as Plain Text${activeTagFilter ? ` (Filtered by tag: ${activeTagFilter})` : ''}.`, 'success');
  };

  const generateBibtexKey = (pub: Publication, existingKeys: Set<string>): string => {
    let key = '';
    const firstAuthor = pub.authors?.[0];
    if (firstAuthor) {
      const lastName = firstAuthor.family || (firstAuthor.name?.includes(',') ? firstAuthor.name.split(',')[0] : firstAuthor.name?.split(' ').pop());
      key += (lastName || 'Anon').replace(/[^a-zA-Z]/g, '');
    } else {
      key += 'Anon';
    }
    key += pub.year || 'ND';
    const titleWords = (stripHtmlTags(pub.title) || 'Paper').split(' ');
    const significantWord = titleWords.find(word => word.length > 3 && /^[a-zA-Z]+$/.test(word));
    key += (significantWord || titleWords[0] || 'Paper').replace(/[^a-zA-Z]/g, '');

    let uniqueKey = key;
    let suffix = 'a';
    while (existingKeys.has(uniqueKey)) {
      uniqueKey = key + suffix;
      suffix = String.fromCharCode(suffix.charCodeAt(0) + 1);
    }
    existingKeys.add(uniqueKey);
    return uniqueKey;
  };
  
  const formatBibtexAuthors = (authors: Author[]): string => {
    return authors.map(author => {
      if (author.family && author.given) return `${author.family}, ${author.given}`;
      if (author.name) return author.name; 
      return 'Anonymous';
    }).join(' and ');
  };

  const exportPublicationsAsBibtex = (pubsToExport: Publication[]) => {
    if (pubsToExport.length === 0) {
      showAlert(`No publications to export for BibTeX${activeTagFilter ? ` (Filtered by tag: ${activeTagFilter})` : ''}.`, 'info');
      return;
    }

    const bibtexEntries: string[] = [];
    const bibtexKeys = new Set<string>();

    pubsToExport.forEach(pub => {
      const key = generateBibtexKey(pub, bibtexKeys);
      let entryType = '@misc';
      const sourceLower = pub.source?.toLowerCase() || '';

      if (pub.type === 'arXiv') {
        entryType = '@article'; 
      } else if (sourceLower.includes('journal') || sourceLower.includes('transactions') || sourceLower.includes('letters')) {
        entryType = '@article';
      } else if (sourceLower.includes('proceedings') || sourceLower.includes('conference') || sourceLower.includes('symposium') || sourceLower.includes('workshop')) {
        entryType = '@inproceedings';
      }
      
      let entry = `${entryType}{${key},\n`;
      entry += `  title        = {${stripHtmlTags(pub.title)}},\n`; // Strip HTML for BibTeX title
      entry += `  author       = {${formatBibtexAuthors(pub.authors)}},\n`;
      if (pub.year) entry += `  year         = {${pub.year}},\n`;
      
      if (entryType === '@article') {
        if (pub.type === 'arXiv') {
          entry += `  journal      = {arXiv preprint arXiv:${pub.id}},\n`;
           if (pub.url) entry += `  eprinttype   = {arXiv},\n`;
           if (pub.url) entry += `  eprint       = {${pub.id}},\n`;
        } else if (pub.source) {
          entry += `  journal      = {${pub.source}},\n`;
        }
      } else if (entryType === '@inproceedings') {
        if (pub.source) entry += `  booktitle    = {${pub.source}},\n`;
      } else { 
        if (pub.source) entry += `  howpublished = {${pub.source}},\n`;
      }

      if (pub.url) entry += `  url          = {${pub.url}},\n`;
      if (pub.id && pub.type === 'DOI') entry += `  doi          = {${pub.id}},\n`;
      if (pub.abstract) entry += `  abstract     = {${stripHtmlTags(pub.abstract)?.replace(/[\n\r]+/g, ' ')}},\n`; // Strip HTML for BibTeX abstract
      
      if (pub.tags && pub.tags.length > 0) {
        entry += `  keywords     = {${pub.tags.join(', ')}},\n`;
      }
      
      if (pub.citationCount !== undefined) {
        entry += `  annote       = {Cited by (Semantic Scholar): ${pub.citationCount}},\n`;
      }

      if (entry.endsWith(',\n')) {
        entry = entry.substring(0, entry.length - 2) + '\n';
      }
      entry += `}\n`;
      bibtexEntries.push(entry);
    });
    
    let bibtexContent = bibtexEntries.join('\n');
    if (activeTagFilter) {
      bibtexContent += `\n% Export filtered by tag: ${activeTagFilter}\n`;
    }
    bibtexContent += '\n% Note: Presentations are not included in BibTeX export as there is no standard entry type.\n';
    bibtexContent += '% Citation counts are from Semantic Scholar and included in the annote field.\n';
    bibtexContent += '% Tags are included in the keywords field.\n';

    const filename = `research_publications${activeTagFilter ? `_tag_${activeTagFilter.replace(/[\s/]+/g, '_').toLowerCase()}` : ''}.bib`;
    triggerDownload(filename, bibtexContent, 'application/x-bibtex;charset=utf-8');
    showAlert(`Publications exported as BibTeX${activeTagFilter ? ` (Filtered by tag: ${activeTagFilter})` : ''}.`, 'success');
  };
  
  const handleExportData = (format: ExportFormat) => {
    if (!effectiveIsAuthenticated) {
      showAlert("Please log in to export data.", "info");
      return;
    }
    let pubsToExport = publications;
    if (currentView === ViewMode.ViewEntries && activeTagFilter && (format === ExportFormat.TXT || format === ExportFormat.BIBTEX)) {
        pubsToExport = publications.filter(pub => pub.tags && pub.tags.includes(activeTagFilter));
    }

    switch (format) {
      case ExportFormat.JSON:
        exportPortalDataAsJson(); // Always exports all data
        break;
      case ExportFormat.TXT:
        exportPortalDataAsPlainText(pubsToExport);
        break;
      case ExportFormat.BIBTEX:
        exportPublicationsAsBibtex(pubsToExport);
        break;
      default:
        showAlert('Unknown export format selected.', 'error');
    }
  };
  
  const handleImportData = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!effectiveIsAuthenticated) {
      showAlert("Please log in to import data.", "info");
      if(event.target) event.target.value = ''; // Clear the file input
      return;
    }
    const file = event.target.files?.[0];
    if (!file) return;

    if (!confirm('Importing data will overwrite existing entries. Are you sure you want to proceed?')) {
        if(event.target) event.target.value = ''; 
        return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const importedData: PortalData = JSON.parse(content);
        
        if (typeof importedData.publications === 'undefined' || 
            typeof importedData.presentations === 'undefined' ||
            typeof importedData.lastSpeakerName === 'undefined') {
            throw new Error('Invalid JSON structure. Ensure it contains publications, presentations, and lastSpeakerName.');
        }

        setPublications(importedData.publications || []);
        setPresentations(importedData.presentations || []);
        setLastSpeakerName(importedData.lastSpeakerName || '');
        setActiveTagFilter(null); // Clear any active filter after import
        showAlert('Data imported successfully!', 'success');
        setCurrentView(ViewMode.ViewEntries); 
      } catch (err) {
        console.error('Failed to import data:', err);
        showAlert(`Error importing data: ${(err as Error).message}`, 'error');
      } finally {
        if(event.target) event.target.value = ''; 
      }
    };
    reader.readAsText(file);
  };

  const handleRefreshCitations = async () => {
    if (!effectiveIsAuthenticated) {
      showAlert("Please log in to refresh citation counts.", "info");
      return;
    }
    if (isRefreshingCitations) {
      showAlert("Citation refresh already in progress.", "info");
      return;
    }

    setIsRefreshingCitations(true);
    showAlert("Starting citation refresh for publications missing counts...", "info");

    const pubsToUpdate = publications.filter(p => p.citationCount === undefined && (p.type === 'DOI' || p.type === 'arXiv'));

    if (pubsToUpdate.length === 0) {
      showAlert("No publications currently require a citation count refresh (or all are 'Other' type).", "info");
      setIsRefreshingCitations(false);
      return;
    }

    let updatedCount = 0;
    let failedToUpdateCount = 0;
    const updatedPublicationsList = [...publications]; // Create a mutable copy

    for (let i = 0; i < pubsToUpdate.length; i++) {
      const pub = pubsToUpdate[i];
      // Type guard to satisfy TypeScript compiler for fetchCitationCountFromSemanticScholar
      if (pub.type === 'DOI' || pub.type === 'arXiv') {
        try {
          // showAlert(`Fetching for: ${pub.title.substring(0,30)}... (${i+1}/${pubsToUpdate.length})`, 'info'); // Optional: progress update
          const newCitationCount = await fetchCitationCountFromSemanticScholar(pub.id, pub.type);
          const pubIndexInOriginalList = updatedPublicationsList.findIndex(p => p.id === pub.id);

          if (newCitationCount !== undefined) {
            if (pubIndexInOriginalList !== -1) {
              updatedPublicationsList[pubIndexInOriginalList] = { ...updatedPublicationsList[pubIndexInOriginalList], citationCount: newCitationCount };
            }
            updatedCount++;
          } else {
            failedToUpdateCount++;
          }
          // Be polite to the API
          if (i < pubsToUpdate.length - 1) { // Don't delay after the last one
             await new Promise(resolve => setTimeout(resolve, 750)); // 750ms delay
          }
        } catch (error) {
          console.error(`Error refreshing citation for ${pub.id}:`, error);
          failedToUpdateCount++;
        }
      } else {
        // This branch should logically not be hit due to the filter creating pubsToUpdate.
        console.warn(`Skipping citation refresh for publication ${pub.id} due to unexpected type: ${pub.type}`);
        failedToUpdateCount++;
      }
    }
    
    setPublications(updatedPublicationsList);

    let summaryMessage = `Citation refresh complete. Updated: ${updatedCount}.`;
    if (failedToUpdateCount > 0) {
      summaryMessage += ` Failed/no data for: ${failedToUpdateCount}.`;
    }
    showAlert(summaryMessage, updatedCount > 0 ? 'success' : 'info');
    setIsRefreshingCitations(false);
  };


  // Handle Auth0 callback route
  if (window.location.pathname === '/callback') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800 text-gray-100">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Logging in...</h2>
          <p className="text-lg">Please wait while we complete authentication.</p>
        </div>
      </div>
    );
  }

  let itemToEditInstance: Publication | Presentation | undefined = undefined;
  if (editingItem) {
    if (editingItem.type === 'publication') {
      itemToEditInstance = publications.find(p => p.id === editingItem.id);
    } else {
      itemToEditInstance = presentations.find(p => p.id === editingItem.id);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 text-gray-100">
      <Navbar 
        currentView={currentView} 
        setCurrentView={setCurrentView}
        onExportData={handleExportData}
        onImportData={handleImportData}
        showAlert={showAlert}
        isEditing={!!editingItem}
        isAuthenticated={effectiveIsAuthenticated} 
        onRefreshCitations={handleRefreshCitations}
        isRefreshingCitations={isRefreshingCitations}
      />
      <main className="container mx-auto p-4 md:p-8">
        {alert && <AlertMessage message={alert.message} type={alert.type} onClose={() => setAlert(null)} />}
        
        {currentView === ViewMode.Home && (
          <HomeView 
            setCurrentView={setCurrentView} 
            publications={publications}
            presentations={presentations}
            isAuthenticated={effectiveIsAuthenticated}
          />
        )}
        {currentView === ViewMode.AddPublication && (
          <PublicationForm 
            onAddPublication={addPublication} 
            showAlert={showAlert}
            existingPublications={publications}
            itemToEdit={editingItem?.type === 'publication' ? itemToEditInstance as Publication : undefined}
            onCancelEdit={handleCancelEdit}
            defaultTags={config.defaultTags}
          />
        )}
        {currentView === ViewMode.AddPresentation && (
          <PresentationForm
            onAddPresentation={addPresentation}
            lastSpeakerName={lastSpeakerName}
            showAlert={showAlert}
            existingPresentations={presentations}
            itemToEdit={editingItem?.type === 'presentation' ? itemToEditInstance as Presentation : undefined}
            onCancelEdit={handleCancelEdit}
          />
        )}
        {currentView === ViewMode.ViewEntries && (
          <EntriesList 
            publications={publications} 
            presentations={presentations}
            onDeletePublication={deletePublication}
            onDeletePresentation={deletePresentation}
            onBulkDelete={handleBulkDelete} 
            onEditPublication={handleEditPublication}
            onEditPresentation={handleEditPresentation}
            activeTagFilter={activeTagFilter}
            setActiveTagFilter={setActiveTagFilter}
            isAuthenticated={effectiveIsAuthenticated}
          />
        )}
        {currentView === ViewMode.Analytics && (
          <AnalyticsView 
            publications={publications}
            presentations={presentations}
          />
        )}
      </main>
      <footer className="text-center p-4 text-sm text-gray-400 border-t border-slate-700">
        Developed by the <a href="https://ascsn.net" target="_blank" rel="noopener noreferrer" className="text-sky-400 hover:text-sky-300 underline">Advanced Scientific Computing and Statistics Network (ASCSN)</a>.
        <br />
        {config.appName} &copy; {new Date().getFullYear()}
      </footer>
    </div>
  );
};

export default App;
