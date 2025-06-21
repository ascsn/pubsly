

export interface Author {
  given?: string;
  family?: string;
  name?: string; // For simpler author lists
  sequence?: string;
  ORCID?: string;
}

export interface Publication {
  id: string; // DOI or arXiv ID
  type: 'DOI' | 'arXiv' | 'Other';
  title: string;
  authors: Author[];
  year?: number;
  source?: string; // Journal, conference, etc.
  abstract?: string;
  url?: string;
  tags?: string[]; // Added field for tags
  timestamp: number;
  citationCount?: number; // Added field for citation count
}

export interface Presentation {
  id: string; // Unique ID, e.g., timestamp or uuid
  title: string;
  speaker: string;
  date: string; // ISO string or simple date string
  location: string;
  link?: string;
  fileName?: string;
  fileType?: string;
  timestamp: number;
}

export enum ViewMode {
  Home = 'home', // Added Home view
  AddPublication = 'addPublication',
  AddPresentation = 'addPresentation',
  ViewEntries = 'viewEntries',
  Analytics = 'analytics', // Added Analytics view
}

export interface CrossRefAuthor {
  given?: string;
  family?: string;
  name?: string; 
  sequence?: string;
  ORCID?: string;
}
export interface CrossRefMessage {
  title?: string[];
  author?: CrossRefAuthor[];
  created?: { 'date-parts'?: number[][] };
  'container-title'?: string[];
  abstract?: string;
  DOI?: string;
  URL?: string;
  type?: string; // e.g. "journal-article"
  subject?: string[]; // Potential field for keywords/tags
}

export interface CrossRefResponse {
  status: string;
  message: CrossRefMessage;
}

export interface PortalData {
  publications: Publication[];
  presentations: Presentation[];
  lastSpeakerName: string;
}

export enum ExportFormat {
  JSON = 'json',
  TXT = 'txt',
  BIBTEX = 'bib',
}