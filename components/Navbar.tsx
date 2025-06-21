
import React, { useState, useEffect, useRef } from 'react';
import { ViewMode, ExportFormat } from '../types';
import { useAuth0 } from '@auth0/auth0-react';
import config from '../config'; // Import config

interface NavbarProps {
  currentView: ViewMode;
  setCurrentView: (view: ViewMode) => void;
  onExportData: (format: ExportFormat) => void;
  onImportData: (event: React.ChangeEvent<HTMLInputElement>) => void;
  showAlert: (message: string, type: 'success' | 'error' | 'info') => void;
  isEditing: boolean; // To disable nav buttons if an item is being edited
  isAuthenticated: boolean; // App-level effective authentication status (from App.tsx)
  onRefreshCitations: () => void; // New prop for refreshing citations
  isRefreshingCitations: boolean; // New prop to indicate if refresh is in progress
}

const NavButton: React.FC<React.PropsWithChildren<{
  label?: string;
  isActive?: boolean;
  onClick?: () => void;
  icon?: React.ReactNode;
  className?: string;
  title?: string;
  disabled?: boolean;
  isMobile?: boolean; // For mobile menu specific styling
  isLoading?: boolean; // For Auth0 loading state or other loading states
}>> = ({ label, isActive, onClick, icon, children, className, title, disabled, isMobile, isLoading }) => (
  <button
    onClick={onClick}
    title={title || label}
    disabled={disabled || isLoading}
    className={`flex items-center space-x-2 rounded-md text-sm font-medium transition-all duration-150 ease-in-out
                ${isMobile 
                  ? `w-full px-4 py-3 text-left ${isActive && !disabled ? 'bg-sky-600 text-white' : (disabled || isLoading) ? 'text-gray-500 bg-slate-700 cursor-not-allowed' : 'text-gray-300 hover:bg-slate-600 hover:text-white'}`
                  : `px-3 py-2.5 ${isActive && !disabled ? 'bg-sky-500 text-white shadow-lg transform scale-105' : (disabled || isLoading) ? 'text-gray-500 bg-slate-700 cursor-not-allowed' : 'text-gray-300 hover:bg-slate-700 hover:text-white focus:bg-slate-700 focus:text-white'}`
                }
                focus:outline-none focus:ring-2 focus:ring-sky-400 focus:ring-opacity-75 ${className || ''}`}
    aria-current={isActive ? 'page' : undefined}
  >
    {isLoading ? (
      <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
    ) : icon}
    {label && <span>{label}</span>}
    {children}
  </button>
);

// --- SVG Icons (Exported for use in other components) ---
export const AcademicCapIcon: React.FC<{className?: string}> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className || "w-5 h-5"}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.438 60.438 0 0 0-.491 6.347A48.627 48.627 0 0 1 12 20.904a48.627 48.627 0 0 1 8.232-4.41 60.46 60.46 0 0 0-.491-6.347m-15.482 0a50.57 50.57 0 0 0-2.658-.813A59.906 59.906 0 0 1 12 3.493a59.902 59.902 0 0 1 10.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0 1 12 13.489a50.702 50.702 0 0 1 7.74-3.342M6.75 15a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Zm0 0v-3.675A55.378 55.378 0 0 1 12 8.443m-7.007 11.55A5.981 5.981 0 0 0 6.75 15.75v-1.5" />
  </svg>
);
export const DocumentPlusIcon: React.FC<{className?: string}> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className || "w-5 h-5"}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m3.75 9v6m3-3H9m1.5-12H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
  </svg>
);

// New Presentation Icon: SpeakerWaveIcon (Solid from Heroicons)
export const SpeakerWaveIcon: React.FC<{className?: string}> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className || "w-5 h-5"}>
    <path d="M12.032 3.09a.75.75 0 0 1 .53-.22h.001c.414 0 .75.336.75.75v12.76a.75.75 0 0 1-.75.75h-.001a.75.75 0 0 1-.531-.22L8.09 13H5.75A.75.75 0 0 1 5 12.25V7.75A.75.75 0 0 1 5.75 7h2.34l3.942-3.91ZM14.75 7.75a.75.75 0 0 0 0 1.5c.828 0 1.5.672 1.5 1.5s-.672 1.5-1.5 1.5a.75.75 0 0 0 0 1.5c1.657 0 3-1.343 3-3s-1.343-3-3-3Z" />
  </svg>
);

export const ListBulletIcon: React.FC<{className?: string}> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className || "w-5 h-5"}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 6.75h7.5M8.25 12h7.5m-7.5 5.25h7.5M3.75 6.75h.007v.008H3.75V6.75Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0ZM3.75 12h.007v.008H3.75V12Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm-.375 5.25h.007v.008H3.75v-.008Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
  </svg>
);
export const ChartPieIcon: React.FC<{className?: string}> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className || "w-5 h-5"}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6a7.5 7.5 0 1 0 7.5 7.5h-7.5V6Z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 10.5H21A7.5 7.5 0 0 0 13.5 3v7.5Z" />
    </svg>
);
const ArrowDownTrayIcon: React.FC<{className?: string}> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className || "w-5 h-5"}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
  </svg>
);
const ArrowUpTrayIcon: React.FC<{className?: string}> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className || "w-5 h-5"}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5" />
  </svg>
);
const ArrowPathIcon: React.FC<{className?: string}> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className || "w-5 h-5"}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
  </svg>
);
const Bars3Icon: React.FC<{className?: string}> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className || "w-6 h-6"}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
  </svg>
);
const XMarkIcon: React.FC<{className?: string}> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className || "w-6 h-6"}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
    </svg>
);
const UserCircleIcon: React.FC<{className?: string}> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className || "w-6 h-6"}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M17.982 18.725A7.488 7.488 0 0 0 12 15.75a7.488 7.488 0 0 0-5.982 2.975m11.963 0a9 9 0 1 0-11.963 0m11.963 0A8.966 8.966 0 0 1 12 21a8.966 8.966 0 0 1-5.982-2.275M15 9.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
  </svg>
);
const ArrowRightOnRectangleIcon: React.FC<{className?: string}> = ({ className }) => ( // Login Icon
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className || "w-6 h-6"}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15m3 0 3-3m0 0-3-3m3 3H9" />
  </svg>
);
const ArrowLeftOnRectangleIcon: React.FC<{className?: string}> = ({ className }) => ( // Logout Icon
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className || "w-6 h-6"}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15M12 9l-3 3m0 0 3 3m-3-3h12.75" />
  </svg>
);
// --- End SVG Icons ---

const Navbar: React.FC<NavbarProps> = ({ 
    currentView, 
    setCurrentView, 
    onExportData, 
    onImportData, 
    showAlert, 
    isEditing, 
    isAuthenticated, // App-level effective authentication status
    onRefreshCitations,
    isRefreshingCitations
}) => {
  const [isExportDropdownOpen, setIsExportDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const exportDropdownRef = useRef<HTMLDivElement>(null);
  const mobileMenuButtonRef = useRef<HTMLButtonElement>(null);
  const mobileMenuPanelRef = useRef<HTMLDivElement>(null);
  const importFileRef = useRef<HTMLInputElement>(null);

  const auth0 = useAuth0(); // This will be undefined if Auth0Provider is not an ancestor
  
  const isAuth0ProperlyConfigured = config.auth0Domain !== 'YOUR_AUTH0_DOMAIN' && config.auth0Domain !== '' &&
                                  config.auth0ClientId !== 'YOUR_AUTH0_CLIENT_ID' && config.auth0ClientId !== '';

  // Use auth0 hook directly for UI related to login/logout (buttons, user name)
  // only if auth is enabled in config AND Auth0 is configured AND auth0 context is available.
  const showAuthUI = config.enableAuth && isAuth0ProperlyConfigured && auth0;


  useEffect(() => {
    if (showAuthUI && auth0.error) {
      showAlert(`Auth0 Error: ${auth0.error.message}`, 'error');
    }
  }, [showAuthUI, auth0?.error, showAlert]); // Add auth0?.error to dependency array

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (exportDropdownRef.current && !exportDropdownRef.current.contains(event.target as Node)) {
        setIsExportDropdownOpen(false);
      }
      if (
        isMobileMenuOpen &&
        mobileMenuPanelRef.current && 
        !mobileMenuPanelRef.current.contains(event.target as Node) &&
        mobileMenuButtonRef.current && 
        !mobileMenuButtonRef.current.contains(event.target as Node)
      ) {
        setIsMobileMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isMobileMenuOpen]);

  const handleExportOptionClick = (format: ExportFormat) => {
    // Guarding based on effective isAuthenticated from App.tsx
    if (!isAuthenticated) { 
        showAlert("Please log in to export data.", "info");
        return;
    }
    if (isEditing) {
      showAlert("Cannot export data while editing. Please save or cancel.", "info");
      return;
    }
    onExportData(format);
    setIsExportDropdownOpen(false);
    setIsMobileMenuOpen(false);
  };
  
  const handleImportClick = () => {
    // Guarding based on effective isAuthenticated from App.tsx
    if (!isAuthenticated) { 
        showAlert("Please log in to import data.", "info");
        return;
    }
    if (isEditing) {
      showAlert("Cannot import data while editing an entry. Please save or cancel current changes.", "info");
      return;
    }
    importFileRef.current?.click();
    setIsMobileMenuOpen(false);
  };

  const handleRefreshCitationsClick = () => {
    if (!isAuthenticated) {
        showAlert("Please log in to refresh citation counts.", "info");
        return;
    }
    if (isEditing) {
      showAlert("Cannot refresh citations while editing. Please save or cancel.", "info");
      return;
    }
    onRefreshCitations();
    setIsMobileMenuOpen(false);
  };

  const handleNavClick = (view: ViewMode) => {
    if (isEditing && currentView !== view) {
      showAlert("Please save or cancel your current changes before navigating.", "info");
      return;
    }
    // Guarding based on effective isAuthenticated from App.tsx
    if (!isAuthenticated && (view === ViewMode.AddPublication || view === ViewMode.AddPresentation)) {
      showAlert("Please log in to add new entries.", "info");
      return;
    }
    setCurrentView(view);
    setIsMobileMenuOpen(false);
  }
  
  const handleTitleClick = () => {
    if (isEditing && currentView !== ViewMode.Home) {
        showAlert("Please save or cancel your current changes before navigating to Home.", "info");
        return;
    }
    setCurrentView(ViewMode.Home);
    setIsMobileMenuOpen(false); 
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(prev => !prev);
  }

  const handleLogin = async () => {
    if (showAuthUI && auth0?.loginWithRedirect) {
      await auth0.loginWithRedirect();
      setIsMobileMenuOpen(false);
    } else {
      showAlert('Login service is not available. Ensure Auth0 is enabled and configured.', 'error');
    }
  };

  const handleLogout = () => {
    if (showAuthUI && auth0?.logout) {
      auth0.logout({ logoutParams: { returnTo: window.location.origin } });
      setIsMobileMenuOpen(false);
    } else {
      showAlert('Logout service is not available.', 'error');
    }
  };


  const renderNavItems = (isMobile = false) => (
    <>
      {/* Feature visibility controlled by effective isAuthenticated from App.tsx */}
      {isAuthenticated && (
          <>
            <NavButton
                label="Add Publication"
                icon={<DocumentPlusIcon />}
                isActive={currentView === ViewMode.AddPublication}
                onClick={() => handleNavClick(ViewMode.AddPublication)}
                disabled={isEditing && currentView !== ViewMode.AddPublication}
                isMobile={isMobile}
            />
            <NavButton
                label="Add Presentation"
                icon={<SpeakerWaveIcon />}
                isActive={currentView === ViewMode.AddPresentation}
                onClick={() => handleNavClick(ViewMode.AddPresentation)}
                disabled={isEditing && currentView !== ViewMode.AddPresentation}
                isMobile={isMobile}
            />
          </>
      )}
      <NavButton
        label="View Entries"
        icon={<ListBulletIcon />}
        isActive={currentView === ViewMode.ViewEntries}
        onClick={() => handleNavClick(ViewMode.ViewEntries)}
        disabled={isEditing && currentView !== ViewMode.ViewEntries}
        isMobile={isMobile}
      />
      <NavButton
        label="Summary & Analytics"
        icon={<ChartPieIcon />}
        isActive={currentView === ViewMode.Analytics}
        onClick={() => handleNavClick(ViewMode.Analytics)}
        disabled={isEditing && currentView !== ViewMode.Analytics}
        isMobile={isMobile}
      />
    </>
  );

  const renderDataActions = (isMobile = false) => {
    // Feature visibility controlled by effective isAuthenticated from App.tsx
    if (!isAuthenticated) return null;

    return (
    <>
      <input type="file" ref={importFileRef} onChange={onImportData} accept=".json" style={{ display: 'none' }} />
      <NavButton 
          icon={<ArrowUpTrayIcon />} 
          onClick={handleImportClick}
          title="Import Data (JSON)"
          className={isMobile ? "" : "px-3 py-2.5"}
          disabled={isEditing || isRefreshingCitations}
          isMobile={isMobile}
      >
           <span className={isMobile ? "ml-2" : "sr-only sm:not-sr-only sm:ml-2"}>Import</span>
      </NavButton>

      <NavButton
        icon={<ArrowPathIcon />}
        onClick={handleRefreshCitationsClick}
        title="Refresh Citation Counts"
        className={isMobile ? "" : "px-3 py-2.5"}
        disabled={isEditing || isRefreshingCitations}
        isLoading={isRefreshingCitations}
        isMobile={isMobile}
      >
        <span className={isMobile ? "ml-2" : "sr-only sm:not-sr-only sm:ml-2"}>
          {isRefreshingCitations ? 'Refreshing...' : 'Refresh Citations'}
        </span>
      </NavButton>

      {isMobile ? (
        <>
          <div className="px-4 pt-3 pb-1 text-sm text-gray-400">Export Options:</div>
          <NavButton
            label="Export as JSON"
            icon={<ArrowDownTrayIcon />}
            onClick={() => handleExportOptionClick(ExportFormat.JSON)}
            isMobile={isMobile}
            disabled={isEditing || isRefreshingCitations}
          />
          <NavButton
            label="Export as Plain Text"
            icon={<ArrowDownTrayIcon />}
            onClick={() => handleExportOptionClick(ExportFormat.TXT)}
            isMobile={isMobile}
            disabled={isEditing || isRefreshingCitations}
          />
          <NavButton
            label="Export as BibTeX"
            icon={<ArrowDownTrayIcon />}
            onClick={() => handleExportOptionClick(ExportFormat.BIBTEX)}
            isMobile={isMobile}
            disabled={isEditing || isRefreshingCitations}
          />
        </>
      ) : (
        <div className="relative" ref={exportDropdownRef}>
          <NavButton
            icon={<ArrowDownTrayIcon />}
            onClick={() => {
              if (isEditing || isRefreshingCitations) {
                 showAlert(isEditing ? "Cannot export data while editing. Please save or cancel." : "Cannot export data while refreshing citations.", "info");
                 return;
              }
              setIsExportDropdownOpen(prev => !prev);
            }}
            title="Export Data"
            className="px-3 py-2.5"
            disabled={isEditing || isRefreshingCitations}
            aria-haspopup="true"
            aria-expanded={isExportDropdownOpen}
          >
            <span className="sr-only sm:not-sr-only sm:ml-2">Export</span>
          </NavButton>
          {isExportDropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-slate-700 rounded-md shadow-lg py-1 z-50 ring-1 ring-black ring-opacity-5">
              <a
                href="#"
                onClick={(e) => { e.preventDefault(); handleExportOptionClick(ExportFormat.JSON); }}
                className="block px-4 py-2 text-sm text-gray-200 hover:bg-slate-600 hover:text-white"
              >
                Export as JSON
              </a>
              <a
                href="#"
                onClick={(e) => { e.preventDefault(); handleExportOptionClick(ExportFormat.TXT); }}
                className="block px-4 py-2 text-sm text-gray-200 hover:bg-slate-600 hover:text-white"
              >
                Export as Plain Text
              </a>
              <a
                href="#"
                onClick={(e) => { e.preventDefault(); handleExportOptionClick(ExportFormat.BIBTEX); }}
                className="block px-4 py-2 text-sm text-gray-200 hover:bg-slate-600 hover:text-white"
              >
                Export as BibTeX
              </a>
            </div>
          )}
        </div>
      )}
    </>
    );
  };

  const renderAuthSection = (isMobile = false) => {
    // Only show Auth UI if auth is enabled, configured, and Auth0 context is available
    if (!showAuthUI || !auth0) return null; 

    const { isLoading: isAuth0Loading, isAuthenticated: isAuth0Authenticated, user: auth0User } = auth0;

    if (isAuth0Loading) {
      return (
        <NavButton isMobile={isMobile} isLoading={true} label={isMobile ? "Loading..." : undefined} className={isMobile ? "" : "p-2.5"}>
          {!isMobile && <span className="sr-only">Loading user...</span>}
        </NavButton>
      );
    }

    if (isAuth0Authenticated && auth0User) { 
      return (
        <>
          {isMobile ? (
             <div className="px-4 pt-3 pb-1 text-sm text-gray-400">Authenticated as:</div>
          ) : (
            <div className="flex items-center space-x-2 text-sm text-gray-300 px-2 py-2.5">
              <UserCircleIcon className="w-6 h-6 text-sky-400" />
              <span className="truncate max-w-[100px] sm:max-w-[150px]">{auth0User.name || auth0User.nickname || auth0User.email}</span>
            </div>
          )}
           {isMobile && (
            <NavButton
                label={auth0User.name || auth0User.nickname || auth0User.email || "User"}
                icon={<UserCircleIcon className="text-sky-400"/>}
                onClick={() => {}} 
                isMobile={isMobile}
                disabled={true} 
                className="cursor-default hover:bg-slate-800"
            />
          )}
          <NavButton
            label="Logout"
            icon={<ArrowLeftOnRectangleIcon />}
            onClick={handleLogout}
            isMobile={isMobile}
            className={isMobile ? "" : "px-3 py-2.5"}
            disabled={isRefreshingCitations}
          />
        </>
      );
    }

    return (
      <NavButton
        label="Login"
        icon={<ArrowRightOnRectangleIcon />}
        onClick={handleLogin}
        isMobile={isMobile}
        className={isMobile ? "" : "px-3 py-2.5"}
        disabled={isRefreshingCitations}
      />
    );
  };


  return (
    <nav className="bg-slate-800 shadow-xl">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <button
            onClick={handleTitleClick}
            disabled={isEditing && currentView !== ViewMode.Home || isRefreshingCitations}
            className={`flex items-center group focus:outline-none focus:ring-2 focus:ring-sky-400 focus:ring-opacity-75 rounded-md p-2 -ml-2
                        ${(isEditing && currentView !== ViewMode.Home || isRefreshingCitations) ? 'cursor-not-allowed opacity-70' : 'cursor-pointer'}`}
            aria-label="Go to Home Page"
          >
            <AcademicCapIcon className="h-10 w-10 text-sky-400 group-hover:text-sky-300 transition-colors" />
            <span className="ml-3 text-xl sm:text-2xl font-bold text-gray-100 group-hover:text-gray-50 transition-colors tracking-tight">
              Research Portal
            </span>
          </button>

          <div className="hidden md:flex items-center space-x-1 lg:space-x-2">
            {renderNavItems()}
            {/* Vertical Separator before Data Actions if effectiveIsAuthenticated is true */}
            {isAuthenticated && <div className="h-6 w-px bg-slate-600 mx-2"></div>} 
            {renderDataActions()}
            {/* Vertical Separator before Auth Section if it's going to be rendered */}
            {showAuthUI && <div className="h-6 w-px bg-slate-600 mx-2"></div>}
            {renderAuthSection()}
          </div>

          <div className="md:hidden flex items-center">
            <button
              ref={mobileMenuButtonRef}
              onClick={toggleMobileMenu}
              type="button"
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-sky-500"
              aria-controls="mobile-menu"
              aria-expanded={isMobileMenuOpen}
              aria-label={isMobileMenuOpen ? "Close main menu" : "Open main menu"}
              disabled={isRefreshingCitations}
            >
              <span className="sr-only">{isMobileMenuOpen ? "Close main menu" : "Open main menu"}</span>
              {isMobileMenuOpen ? (
                <XMarkIcon className="block h-7 w-7" />
              ) : (
                <Bars3Icon className="block h-7 w-7" />
              )}
            </button>
          </div>
        </div>
      </div>

      {isMobileMenuOpen && (
        <div className="md:hidden bg-slate-800 border-t border-slate-700" id="mobile-menu" ref={mobileMenuPanelRef}>
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {renderNavItems(true)}
          </div>
          {/* Data Actions section in mobile menu, visibility controlled by effectiveIsAuthenticated */}
          {isAuthenticated && ( 
            <div className="pt-2 pb-3 border-t border-slate-700">
                <div className="px-2 space-y-1 sm:px-3">
                {renderDataActions(true)}
                </div>
            </div>
          )}
          {/* Auth section in mobile menu, visibility controlled by showAuthUI */}
          {showAuthUI && ( 
            <div className="pt-2 pb-3 border-t border-slate-700">
                <div className="px-2 space-y-1 sm:px-3">
                    {renderAuthSection(true)}
                </div>
            </div>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
