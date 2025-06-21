
export interface AppConfig {
  auth0Domain: string;
  auth0ClientId: string;
  enableAuth: boolean; // New flag
  defaultTags: string[];
  appName: string;
  apiBaseUrls: {
    semanticScholar: string;
    crossref: string;
    arxiv: string;
    orcidPublicApi: string; // Added for ORCID
  };
}

// Attempt to get Auth0 config from environment variables injected into window.__APP_CONFIG__
// These would be set by a script in index.html, populated by the deployment platform (e.g., Netlify)
const envAuth0Domain = (window as any).__APP_CONFIG__?.AUTH0_DOMAIN;
const envAuth0ClientId = (window as any).__APP_CONFIG__?.AUTH0_CLIENT_ID;

const config: AppConfig = {
  // === AUTH0 CONFIGURATION ===
  // Prioritize environment variables, then fall back to these hardcoded values.
  // IMPORTANT: For local development, if you don't inject env vars, these hardcoded values will be used.
  // Replace placeholders if enableAuth is true and env vars are not set for local dev.
  auth0Domain: envAuth0Domain, // Example: 'YOUR_AUTH0_DOMAIN' or 'dev-xxxxxxxx.us.auth0.com'
  auth0ClientId: envAuth0ClientId, // Example: 'YOUR_AUTH0_CLIENT_ID' or 'yourAuth0ApplicationClientId'
  
  // Set to true to enable Auth0 authentication. 
  // Set to false to bypass authentication and grant full access to all users.
  enableAuth: true, 

  // === APPLICATION SETTINGS ===
  appName: "Research Products Portal",
  defaultTags: ['research', 'portal-entry', 'collaboration-xyz', 'experiment'], // Example default tags

  // === API ENDPOINTS ===
  apiBaseUrls: {
    semanticScholar: 'https://api.semanticscholar.org/graph/v1/paper/',
    crossref: 'https://api.crossref.org/works/',
    arxiv: 'https://export.arxiv.org/api/query',
    orcidPublicApi: 'https://pub.orcid.org/v3.0/' // ORCID Public API endpoint
  }
};

export default config;
