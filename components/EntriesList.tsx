
import React, { useState, useMemo } from 'react';
import { Publication, Presentation, Author } from '../types';

interface EntriesListProps {
  publications: Publication[];
  presentations: Presentation[];
  onDeletePublication: (id: string) => void;
  onDeletePresentation: (id: string) => void;
  onBulkDelete: (publicationIdsToDelete: string[], presentationIdsToDelete: string[]) => void;
  onEditPublication: (id: string) => void;
  onEditPresentation: (id: string) => void;
  activeTagFilter: string | null;
  setActiveTagFilter: (tag: string | null) => void;
  isAuthenticated: boolean; // App-level authentication status
}

// SVG Icons
const TrashIcon: React.FC<{className?: string}> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className || "w-5 h-5"}>
        <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12.56 0c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
    </svg>
);
const ExternalLinkIcon: React.FC<{className?: string}> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className || "w-4 h-4 ml-1"}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 0 0 3 8.25v10.5A2.25 2.25 0 0 0 5.25 21h10.5A2.25 2.25 0 0 0 18 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
  </svg>
);
const PencilIcon: React.FC<{className?: string}> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className || "w-5 h-5"}>
        <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
    </svg>
);
const CitationIcon: React.FC<{className?: string}> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className || "w-4 h-4 mr-1"}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 17.25c0 .34-.026.672-.077 1M13.5 8.25c0-1.036.84-1.875 1.875-1.875h.375A1.875 1.875 0 0 1 17.625 8.25v7.5A1.875 1.875 0 0 1 15.75 17.625h-.375a1.875 1.875 0 0 1-1.875-1.875V8.25ZM6.375 17.625c1.036 0 1.875-.84 1.875-1.875v-7.5A1.875 1.875 0 0 0 6.375 6.375h-.375A1.875 1.875 0 0 0 4.125 8.25v7.5A1.875 1.875 0 0 0 6 17.625h.375Z" />
  </svg>
);
const TagIcon: React.FC<{className?: string}> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className || "w-4 h-4 mr-1"}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.568 3H5.25A2.25 2.25 0 0 0 3 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 0 0 5.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 0 0 9.568 3Z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 6h.008v.008H6V6Z" />
    </svg>
);
const XMarkIcon: React.FC<{className?: string}> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className || "w-6 h-6"}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
    </svg>
);
const CheckCircleIcon: React.FC<{className?: string}> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className || "w-5 h-5"}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
    </svg>
);


const formatAuthors = (authors: Author[]): string => {
  if (!authors || authors.length === 0) return 'N/A';
  return authors.map(author => author.name || `${author.given || ''} ${author.family || ''}`.trim()).filter(name => name).join(', ');
};

interface PublicationItemProps {
  pub: Publication;
  onDelete: (id: string) => void;
  onEdit: (id: string) => void;
  activeTagFilter: string | null;
  setActiveTagFilter: (tag: string | null) => void;
  isAuthenticated: boolean;
  isSelectModeActive: boolean;
  isSelected: boolean;
  onToggleSelect: (id: string) => void;
}

const PublicationItem: React.FC<PublicationItemProps> = ({ 
    pub, onDelete, onEdit, activeTagFilter, setActiveTagFilter, isAuthenticated,
    isSelectModeActive, isSelected, onToggleSelect 
}) => (
  <li className={`bg-slate-800 p-5 rounded-lg shadow-lg hover:shadow-sky-500/30 transition-all duration-300 ${isSelectModeActive && isSelected ? 'ring-2 ring-sky-500 border-sky-500' : ''}`}>
    <div className="flex items-start">
        {isSelectModeActive && isAuthenticated && (
            <input 
                type="checkbox" 
                checked={isSelected} 
                onChange={() => onToggleSelect(pub.id)}
                className="mr-4 mt-1.5 h-5 w-5 rounded border-gray-500 bg-slate-700 text-sky-500 focus:ring-sky-400 accent-sky-500 cursor-pointer"
                aria-label={`Select publication ${pub.title}`}
            />
        )}
        <div className="flex-grow">
            <h3 className="text-xl font-semibold text-sky-400">{pub.title}</h3>
            <p className="text-sm text-gray-400 mt-1">Authors: {formatAuthors(pub.authors)}</p>
            <p className="text-sm text-gray-400">
                {pub.source && `${pub.source}, `}{pub.year ? pub.year : 'Year N/A'} ({pub.type})
            </p>
            <div className="flex items-center space-x-3 mt-1">
                {pub.url && (
                <a href={pub.url} target="_blank" rel="noopener noreferrer" className="text-sm text-sky-500 hover:text-sky-300 inline-flex items-center">
                    View Publication <ExternalLinkIcon />
                </a>
                )}
                {pub.citationCount !== undefined && (
                <span className="text-sm text-gray-400 inline-flex items-center">
                    <CitationIcon /> Cited by: {pub.citationCount}
                </span>
                )}
            </div>
             {pub.tags && pub.tags.length > 0 && (
              <div className="mt-2 flex items-start flex-wrap">
                <TagIcon className="text-gray-400 w-4 h-4 mr-1.5 mt-1.5" />
                <div className="flex flex-wrap gap-1.5">
                    {pub.tags.map(tag => (
                    <button
                        key={tag} 
                        onClick={() => setActiveTagFilter(activeTagFilter === tag ? null : tag)}
                        disabled={isSelectModeActive}
                        className={`inline-block text-xs font-medium px-2.5 py-1 rounded-full transition-all duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-opacity-75
                        ${activeTagFilter === tag
                            ? 'bg-sky-500 text-white ring-sky-300 shadow-md transform scale-105'
                            : 'bg-slate-700 text-sky-300 hover:bg-sky-700 hover:text-white ring-slate-600 hover:ring-sky-600'
                        } ${isSelectModeActive ? 'opacity-50 cursor-not-allowed' : ''}`}
                        aria-pressed={activeTagFilter === tag}
                        title={activeTagFilter === tag ? `Clear filter for '${tag}'` : `Filter by tag: '${tag}'`}
                    >
                        {tag}
                    </button>
                    ))}
                </div>
              </div>
            )}
        </div>
        {!isSelectModeActive && isAuthenticated && (
            <div className="flex-shrink-0 flex items-center space-x-2 ml-2">
                <button onClick={() => onEdit(pub.id)} title="Edit Publication" className="text-yellow-400 hover:text-yellow-300 p-1 rounded-full hover:bg-slate-700 transition-colors">
                    <PencilIcon className="w-5 h-5" />
                </button>
                <button onClick={() => { if(confirm(`Are you sure you want to delete the publication "${pub.title}"?`)) onDelete(pub.id); }} title="Delete Publication" className="text-red-400 hover:text-red-300 p-1 rounded-full hover:bg-slate-700 transition-colors">
                    <TrashIcon className="w-5 h-5" />
                </button>
            </div>
        )}
    </div>
    {pub.abstract && (
      <details className="mt-3 text-sm text-gray-300">
        <summary className="cursor-pointer text-gray-400 hover:text-gray-200">Abstract</summary>
        <p className="mt-1 pl-4 border-l-2 border-slate-700">{pub.abstract}</p>
      </details>
    )}
  </li>
);

interface PresentationItemProps {
  pres: Presentation;
  onDelete: (id: string) => void;
  onEdit: (id: string) => void;
  isAuthenticated: boolean;
  isSelectModeActive: boolean;
  isSelected: boolean;
  onToggleSelect: (id: string) => void;
}

const PresentationItem: React.FC<PresentationItemProps> = ({ 
    pres, onDelete, onEdit, isAuthenticated,
    isSelectModeActive, isSelected, onToggleSelect
 }) => (
  <li className={`bg-slate-800 p-5 rounded-lg shadow-lg hover:shadow-sky-500/30 transition-all duration-300 ${isSelectModeActive && isSelected ? 'ring-2 ring-sky-500 border-sky-500' : ''}`}>
    <div className="flex items-start">
        {isSelectModeActive && isAuthenticated && (
            <input 
                type="checkbox" 
                checked={isSelected} 
                onChange={() => onToggleSelect(pres.id)}
                className="mr-4 mt-1.5 h-5 w-5 rounded border-gray-500 bg-slate-700 text-sky-500 focus:ring-sky-400 accent-sky-500 cursor-pointer"
                aria-label={`Select presentation ${pres.title}`}
            />
        )}
        <div className="flex-grow">
            <h3 className="text-xl font-semibold text-sky-400">{pres.title}</h3>
            <p className="text-sm text-gray-400 mt-1">Speaker: {pres.speaker}</p>
            <p className="text-sm text-gray-400">Date: {new Date(pres.date).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' })}</p>
            <p className="text-sm text-gray-400">Location: {pres.location}</p>
            {pres.link && (
            <a href={pres.link} target="_blank" rel="noopener noreferrer" className="text-sm text-sky-500 hover:text-sky-300 inline-flex items-center mt-1">
                View Link <ExternalLinkIcon />
            </a>
            )}
            {pres.fileName && <p className="text-sm text-gray-400 mt-1">File: {pres.fileName} ({pres.fileType})</p>}
        </div>
        {!isSelectModeActive && isAuthenticated && (
            <div className="flex-shrink-0 flex items-center space-x-2 ml-2">
                <button onClick={() => onEdit(pres.id)} title="Edit Presentation" className="text-yellow-400 hover:text-yellow-300 p-1 rounded-full hover:bg-slate-700 transition-colors">
                    <PencilIcon className="w-5 h-5" />
                </button>
                <button onClick={() => { if(confirm(`Are you sure you want to delete the presentation "${pres.title}"?`)) onDelete(pres.id); }} title="Delete Presentation" className="text-red-400 hover:text-red-300 p-1 rounded-full hover:bg-slate-700 transition-colors">
                    <TrashIcon className="w-5 h-5" />
                </button>
            </div>
        )}
    </div>
  </li>
);


const EntriesList: React.FC<EntriesListProps> = ({ 
    publications, 
    presentations, 
    onDeletePublication, 
    onDeletePresentation,
    onBulkDelete,
    onEditPublication,
    onEditPresentation,
    activeTagFilter,
    setActiveTagFilter,
    isAuthenticated
}) => {
  
  const [isSelectModeActive, setIsSelectModeActive] = useState(false);
  const [selectedPublicationIds, setSelectedPublicationIds] = useState<Set<string>>(new Set());
  const [selectedPresentationIds, setSelectedPresentationIds] = useState<Set<string>>(new Set());

  const filteredPublications = useMemo(() => {
    if (!activeTagFilter) return publications;
    return publications.filter(pub => pub.tags && pub.tags.map(t => t.toLowerCase()).includes(activeTagFilter.toLowerCase()));
  }, [publications, activeTagFilter]);

  const sortedPublications = useMemo(() => {
    return [...filteredPublications].sort((a, b) => {
      if (a.year && b.year) {
        if (b.year !== a.year) {
          return b.year - a.year;
        }
      } else if (a.year) { 
        return -1; 
      } else if (b.year) { 
        return 1;  
      }
      return b.timestamp - a.timestamp;
    });
  }, [filteredPublications]);

  const sortedPresentations = useMemo(() => {
    return [...presentations].sort((a, b) => {
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();
      if (dateB !== dateA) {
        return dateB - dateA; 
      }
      return b.timestamp - a.timestamp;
    });
  }, [presentations]);

  const handleToggleSelectPublication = (id: string) => {
    setSelectedPublicationIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) newSet.delete(id);
      else newSet.add(id);
      return newSet;
    });
  };

  const handleToggleSelectPresentation = (id: string) => {
    setSelectedPresentationIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) newSet.delete(id);
      else newSet.add(id);
      return newSet;
    });
  };

  const handleSelectAllPublications = () => {
    if (selectedPublicationIds.size === sortedPublications.length) {
      setSelectedPublicationIds(new Set());
    } else {
      setSelectedPublicationIds(new Set(sortedPublications.map(p => p.id)));
    }
  };
  
  const handleSelectAllPresentations = () => {
    if (selectedPresentationIds.size === sortedPresentations.length) {
      setSelectedPresentationIds(new Set());
    } else {
      setSelectedPresentationIds(new Set(sortedPresentations.map(p => p.id)));
    }
  };

  const handleToggleSelectMode = () => {
    setIsSelectModeActive(prev => !prev);
    if (isSelectModeActive) { // Exiting select mode
      setSelectedPublicationIds(new Set());
      setSelectedPresentationIds(new Set());
    }
  };

  const handleDeleteSelected = () => {
    const totalSelected = selectedPublicationIds.size + selectedPresentationIds.size;
    if (totalSelected === 0) {
        alert("No items selected for deletion."); // Replace with showAlert if available
        return;
    }
    if (confirm(`Are you sure you want to delete ${totalSelected} selected item(s)? This action cannot be undone.`)) {
      onBulkDelete(Array.from(selectedPublicationIds), Array.from(selectedPresentationIds));
      setIsSelectModeActive(false); // Exit select mode after deletion
      setSelectedPublicationIds(new Set());
      setSelectedPresentationIds(new Set());
    }
  };

  return (
    <div className="space-y-12">
      {isAuthenticated && (
        <div className="flex justify-end mb-4 -mt-4">
          <button
            onClick={handleToggleSelectMode}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors
              ${isSelectModeActive 
                ? 'bg-amber-600 hover:bg-amber-700 text-white' 
                : 'bg-sky-600 hover:bg-sky-700 text-white'}`}
          >
            {isSelectModeActive ? 'Cancel Select Mode' : 'Enter Select Mode'}
          </button>
        </div>
      )}

      {isSelectModeActive && isAuthenticated && (
        <div className="bg-slate-700/50 p-4 rounded-lg mb-6 shadow-md sticky top-4 z-10 border border-slate-600">
          <div className="flex flex-col sm:flex-row justify-between items-center space-y-3 sm:space-y-0">
            <p className="text-gray-200 text-sm">
              Selected: {selectedPublicationIds.size} Publication(s), {selectedPresentationIds.size} Presentation(s)
            </p>
            <button
              onClick={handleDeleteSelected}
              disabled={selectedPublicationIds.size === 0 && selectedPresentationIds.size === 0}
              className="px-4 py-2 text-sm font-medium rounded-md bg-red-600 hover:bg-red-700 text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <TrashIcon className="w-4 h-4 inline mr-1.5 -ml-0.5" />
              Delete Selected ({selectedPublicationIds.size + selectedPresentationIds.size})
            </button>
          </div>
        </div>
      )}

      <section>
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6">
            <h2 className="text-3xl font-bold text-sky-400 border-b-2 border-slate-700 pb-2 flex-grow">
                Publications ({sortedPublications.length}{activeTagFilter ? ` of ${publications.length}` : ''})
            </h2>
            {isSelectModeActive && isAuthenticated && sortedPublications.length > 0 && (
                 <button
                    onClick={handleSelectAllPublications}
                    className="ml-4 px-3 py-1.5 text-xs font-medium rounded-md bg-slate-600 hover:bg-slate-500 text-white transition-colors"
                >
                    {selectedPublicationIds.size === sortedPublications.length ? 'Deselect All Pubs' : 'Select All Pubs'}
                </button>
            )}
            {!isSelectModeActive && activeTagFilter && (
                <div className="mt-3 sm:mt-0 sm:ml-4 p-2 bg-slate-700/50 rounded-md flex justify-between items-center text-sm">
                    <span className="text-gray-300 mr-2">
                        Filtering by: <strong className="font-semibold text-sky-300">{activeTagFilter}</strong>
                    </span>
                    <button
                        onClick={() => setActiveTagFilter(null)}
                        className="text-gray-400 hover:text-white p-1 rounded-full hover:bg-slate-600 transition-colors"
                        title="Clear filter"
                        aria-label="Clear tag filter"
                    >
                        <XMarkIcon className="w-5 h-5" />
                    </button>
                </div>
            )}
        </div>
        {sortedPublications.length > 0 ? (
          <ul className="space-y-6">
            {sortedPublications.map(pub => 
                <PublicationItem 
                    key={pub.id} 
                    pub={pub} 
                    onDelete={onDeletePublication} 
                    onEdit={onEditPublication}
                    activeTagFilter={activeTagFilter}
                    setActiveTagFilter={setActiveTagFilter}
                    isAuthenticated={isAuthenticated}
                    isSelectModeActive={isSelectModeActive}
                    isSelected={selectedPublicationIds.has(pub.id)}
                    onToggleSelect={handleToggleSelectPublication}
                />)}
          </ul>
        ) : (
          <p className="text-gray-400 italic">
            {activeTagFilter ? `No publications found with the tag "${activeTagFilter}".` : 'No publications added yet.'}
          </p>
        )}
      </section>

      <section>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold text-sky-400 border-b-2 border-slate-700 pb-2 flex-grow">Presentations ({sortedPresentations.length})</h2>
          {isSelectModeActive && isAuthenticated && sortedPresentations.length > 0 && (
             <button
                onClick={handleSelectAllPresentations}
                className="ml-4 px-3 py-1.5 text-xs font-medium rounded-md bg-slate-600 hover:bg-slate-500 text-white transition-colors"
            >
                {selectedPresentationIds.size === sortedPresentations.length ? 'Deselect All Pres.' : 'Select All Pres.'}
            </button>
          )}
        </div>
        {sortedPresentations.length > 0 ? (
          <ul className="space-y-6">
            {sortedPresentations.map(pres => 
                <PresentationItem 
                    key={pres.id} 
                    pres={pres} 
                    onDelete={onDeletePresentation}
                    onEdit={onEditPresentation}
                    isAuthenticated={isAuthenticated}
                    isSelectModeActive={isSelectModeActive}
                    isSelected={selectedPresentationIds.has(pres.id)}
                    onToggleSelect={handleToggleSelectPresentation}
                />)}
          </ul>
        ) : (
          <p className="text-gray-400 italic">No presentations added yet.</p>
        )}
      </section>
    </div>
  );
};

export default EntriesList;
