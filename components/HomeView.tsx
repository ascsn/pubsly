
import React from 'react';
import { ViewMode, Publication, Presentation } from '../types';
import { SpeakerWaveIcon, DocumentPlusIcon, ListBulletIcon, ChartPieIcon } from './Navbar'; // Import icons

interface HomeViewProps {
  setCurrentView: (view: ViewMode) => void;
  publications: Publication[];
  presentations: Presentation[];
  isAuthenticated: boolean; // App-level authentication status
}

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  onClick: () => void;
  ariaLabel: string;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ icon, title, description, onClick, ariaLabel }) => (
  <button
    onClick={onClick}
    aria-label={ariaLabel}
    className="bg-slate-800 hover:bg-slate-700/80 p-6 rounded-xl shadow-xl hover:shadow-sky-500/30 transition-all duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-sky-400 focus:ring-opacity-75 text-left w-full"
  >
    <div className="flex flex-col items-center text-center md:flex-row md:text-left md:items-start space-y-4 md:space-y-0 md:space-x-6">
      <div className="flex-shrink-0 text-sky-400">
        {icon}
      </div>
      <div>
        <h3 className="text-2xl font-bold text-gray-100 mb-2">{title}</h3>
        <p className="text-gray-300 text-base leading-relaxed">{description}</p>
      </div>
    </div>
  </button>
);


const HomeView: React.FC<HomeViewProps> = ({ setCurrentView, publications, presentations, isAuthenticated }) => {
  const totalPublications = publications.length;
  const totalPresentations = presentations.length;

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-extrabold text-sky-400 sm:text-5xl">
          Welcome to the Research Portal
        </h1>
        <p className="mt-4 text-xl text-gray-300">
          Manage your collaboration's publications and presentations with ease.
        </p>
        <p className="mt-6 text-lg text-sky-300">
          Currently tracking: 
          <span className="font-semibold text-white"> {totalPublications}</span> Publication{totalPublications !== 1 ? 's' : ''}
          <span className="mx-2 text-gray-500">•</span>
          <span className="font-semibold text-white">{totalPresentations}</span> Presentation{totalPresentations !== 1 ? 's' : ''}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-10">
        {isAuthenticated && (
          <>
            <FeatureCard
              icon={<DocumentPlusIcon className="w-12 h-12 md:w-16 md:h-16" />}
              title="Add New Publication"
              description="Enter details for a new research paper, article, or preprint. Supports DOI/arXiv parsing for quick metadata fetching and includes citation counts from Semantic Scholar."
              onClick={() => setCurrentView(ViewMode.AddPublication)}
              ariaLabel="Add New Publication"
            />
            <FeatureCard
              icon={<SpeakerWaveIcon className="w-12 h-12 md:w-16 md:h-16" />}
              title="Log New Presentation"
              description="Record a talk, poster, or other presentation given by a team member. Keep track of speakers, dates, locations, and related files."
              onClick={() => setCurrentView(ViewMode.AddPresentation)}
              ariaLabel="Log New Presentation"
            />
          </>
        )}
        <FeatureCard
          icon={<ListBulletIcon className="w-12 h-12 md:w-16 md:h-16" />}
          title="Browse All Entries"
          description="View, sort, edit, or delete all existing publications and presentations. Export your data in various formats including JSON, Text, and BibTeX."
          onClick={() => setCurrentView(ViewMode.ViewEntries)}
          ariaLabel="Browse All Entries"
        />
        <FeatureCard
          icon={<ChartPieIcon className="w-12 h-12 md:w-16 md:h-16" />}
          title="View Summary & Analytics"
          description="Explore statistics and visual charts about your publications, including citation counts, publication trends, and tag-based analysis."
          onClick={() => setCurrentView(ViewMode.Analytics)}
          ariaLabel="View Summary and Analytics"
        />
      </div>
    </div>
  );
};

export default HomeView;
