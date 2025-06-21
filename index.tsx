import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { Auth0Provider } from '@auth0/auth0-react';
import config from './config'; // Import the config object

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const isAuth0Configured = config.auth0Domain !== 'YOUR_AUTH0_DOMAIN' && config.auth0Domain !== '' &&
                         config.auth0ClientId !== 'YOUR_AUTH0_CLIENT_ID' && config.auth0ClientId !== '';

if (config.enableAuth && !isAuth0Configured) {
  console.warn(
    `Auth0 is enabled in config.ts, but 'auth0Domain' or 'auth0ClientId' are not properly configured.
    Please update these values in config.ts with your actual Auth0 application credentials.
    The application will proceed with public read-only access where authentication is normally required.`
  );
}

const AppWrapper: React.FC = () => {
  // Only use Auth0Provider if auth is enabled AND configured
  if (config.enableAuth && isAuth0Configured) {
    return (
      <Auth0Provider
        domain={config.auth0Domain}
        clientId={config.auth0ClientId}
        authorizationParams={{
          redirect_uri: window.location.origin
        }}
      >
        <App />
      </Auth0Provider>
    );
  }
  // If auth is disabled, or enabled but not configured, render App directly
  return <App />;
};


const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <AppWrapper />
  </React.StrictMode>
);