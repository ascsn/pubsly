
import React, { useState, useEffect } from 'react';
import { Presentation } from '../types';
import LoadingSpinner from './LoadingSpinner';

interface PresentationFormProps {
  onAddPresentation: (presentation: Presentation) => void;
  lastSpeakerName: string;
  showAlert: (message: string, type: 'success' | 'error' | 'info') => void;
  existingPresentations: Presentation[];
  itemToEdit?: Presentation;
  onCancelEdit: () => void;
}

const PresentationForm: React.FC<PresentationFormProps> = ({ 
  onAddPresentation, 
  lastSpeakerName, 
  showAlert, 
  existingPresentations,
  itemToEdit,
  onCancelEdit
}) => {
  const [title, setTitle] = useState('');
  const [speaker, setSpeaker] = useState('');
  const [date, setDate] = useState('');
  const [location, setLocation] = useState('');
  const [link, setLink] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false); // For future async operations like file upload

  const isEditing = !!itemToEdit;

  useEffect(() => {
    if (itemToEdit) {
      setTitle(itemToEdit.title);
      setSpeaker(itemToEdit.speaker);
      setDate(itemToEdit.date); // Assumes date is in YYYY-MM-DD format for input type="date"
      setLocation(itemToEdit.location);
      setLink(itemToEdit.link || '');
      // File handling for edit is tricky without actual upload; for now, we don't repopulate the file input
      // but we could show itemToEdit.fileName if it exists.
      setFile(null); // File input cannot be programmatically set for security reasons
    } else {
      // Reset for new entry, or if itemToEdit becomes null
      setTitle('');
      setSpeaker(lastSpeakerName || ''); // Pre-fill if adding new
      setDate('');
      setLocation('');
      setLink('');
      setFile(null);
    }
  }, [itemToEdit, lastSpeakerName]);
  
  // Separate effect for lastSpeakerName only when not editing
  useEffect(() => {
    if (!isEditing && lastSpeakerName) {
      setSpeaker(lastSpeakerName);
    }
  }, [lastSpeakerName, isEditing]);


  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    } else {
      setFile(null);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !speaker.trim() || !date.trim() || !location.trim()) {
      showAlert('Please fill in all required fields: Title, Speaker, Date, and Location.', 'error');
      return;
    }

    const trimmedTitle = title.trim().toLowerCase();
    const trimmedSpeaker = speaker.trim().toLowerCase();

    // Duplicate check should exclude the item being edited itself
    const isDuplicate = existingPresentations.some(pres => 
      pres.id !== itemToEdit?.id && // Exclude self if editing
      pres.title.trim().toLowerCase() === trimmedTitle &&
      pres.speaker.trim().toLowerCase() === trimmedSpeaker &&
      pres.date === date
    );

    if (isDuplicate) {
      showAlert('A presentation with the same title, speaker, and date already exists.', 'error');
      return;
    }

    setIsLoading(true);

    // Simulate async operation
    setTimeout(() => {
      const newPresentation: Presentation = {
        id: itemToEdit?.id || Date.now().toString(),
        title: title.trim(),
        speaker: speaker.trim(),
        date,
        location: location.trim(),
        link: link.trim() || undefined,
        fileName: file?.name || itemToEdit?.fileName, // Preserve old filename if not re-uploaded
        fileType: file?.type || itemToEdit?.fileType,   // Preserve old filetype
        timestamp: itemToEdit?.timestamp || Date.now(), // Preserve original timestamp if editing
      };
      
      const finalPresentation = { ...newPresentation, timestamp: Date.now() };

      onAddPresentation(finalPresentation);
      
      if (!isEditing) {
        setTitle('');
        // Speaker name logic from App.tsx takes care of lastSpeakerName
        setDate('');
        setLocation('');
        setLink('');
        setFile(null);
        const fileInput = document.getElementById('pres-file') as HTMLInputElement;
        if (fileInput) fileInput.value = '';
      }
      setIsLoading(false);
    }, 300); // Reduced delay
  };
  
  const commonInputClass = "mt-1 block w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500 sm:text-sm text-gray-200 placeholder-gray-400";

  return (
    <div className="bg-slate-800 p-6 md:p-8 rounded-xl shadow-2xl">
      <h2 className="text-3xl font-bold mb-8 text-sky-400">
        {isEditing ? 'Edit Presentation' : 'Add New Presentation'}
      </h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="pres-title" className="block text-sm font-medium text-gray-300">Title <span className="text-red-400">*</span></label>
          <input type="text" name="pres-title" id="pres-title" value={title} onChange={(e) => setTitle(e.target.value)} required className={commonInputClass} />
        </div>
        <div>
          <label htmlFor="pres-speaker" className="block text-sm font-medium text-gray-300">Speaker <span className="text-red-400">*</span></label>
          <input type="text" name="pres-speaker" id="pres-speaker" value={speaker} onChange={(e) => setSpeaker(e.target.value)} required className={commonInputClass} />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="pres-date" className="block text-sm font-medium text-gray-300">Date <span className="text-red-400">*</span></label>
            <input type="date" name="pres-date" id="pres-date" value={date} onChange={(e) => setDate(e.target.value)} required className={commonInputClass + " appearance-none"} />
          </div>
          <div>
            <label htmlFor="pres-location" className="block text-sm font-medium text-gray-300">Location <span className="text-red-400">*</span></label>
            <input type="text" name="pres-location" id="pres-location" value={location} onChange={(e) => setLocation(e.target.value)} required className={commonInputClass} />
          </div>
        </div>
        <div>
          <label htmlFor="pres-link" className="block text-sm font-medium text-gray-300">Link to Slides/Recording (Optional)</label>
          <input type="url" name="pres-link" id="pres-link" value={link} onChange={(e) => setLink(e.target.value)} className={commonInputClass} placeholder="https://example.com/slides" />
        </div>
        <div>
          <label htmlFor="pres-file" className="block text-sm font-medium text-gray-300">Upload File (Optional)</label>
          <input 
            type="file" 
            name="pres-file" 
            id="pres-file" 
            onChange={handleFileChange} 
            className={`${commonInputClass} file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-sky-50 file:text-sky-700 hover:file:bg-sky-100 text-gray-400`} 
          />
          {file && <p className="mt-1 text-xs text-gray-400">Selected: {file.name} ({Math.round(file.size / 1024)} KB)</p>}
          {!file && isEditing && itemToEdit?.fileName && (
             <p className="mt-1 text-xs text-gray-400">Current file: {itemToEdit.fileName} ({itemToEdit.fileType || 'N/A'}). Choose a new file to replace it.</p>
          )}
          <p className="mt-1 text-xs text-gray-500">Note: File content is not uploaded in this demo, only its name and type are stored.</p>
        </div>
        <div className="pt-5 flex space-x-3">
          <button
            type="submit"
            disabled={isLoading}
            className="flex-1 justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-green-500 disabled:opacity-60"
          >
            {isLoading ? <LoadingSpinner /> : (isEditing ? 'Update Presentation': 'Save Presentation')}
          </button>
          {isEditing && (
            <button
              type="button"
              onClick={onCancelEdit}
              className="flex-1 justify-center py-3 px-4 border border-gray-500 rounded-md shadow-sm text-sm font-medium text-gray-200 bg-slate-600 hover:bg-slate-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-gray-400"
            >
              Cancel
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default PresentationForm;
