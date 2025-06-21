# 8. Configuration (For Administrators/Developers)

Pubsly's behavior can be customized through a central configuration file named `config.ts`, located in the root directory of the application source code. This file allows administrators or developers to tailor Pubsly to specific needs without modifying the core application logic.

## Overview of `config.ts`

The `config.ts` file exports a single `config` object with the `AppConfig` interface. Below are the key properties you can configure:

```typescript
export interface AppConfig {
  auth0Domain: string;
  auth0ClientId: string;
  enableAuth: boolean;
  defaultTags: string[];
  appName: string;
  apiBaseUrls: {
    semanticScholar: string;
    crossref: string;
    arxiv: string;
    orcidPublicApi: string;
  };
}

const config: AppConfig = {
  // ... values ...
};

export default config;
```

## Key Configuration Settings

### Authentication (`auth0Domain`, `auth0ClientId`, `enableAuth`)

*   **`enableAuth: boolean`**
    *   **`true` (Default behavior if not changed from template):** Enables user authentication via Auth0. Users will need to log in to access features for adding, editing, deleting, importing, or exporting data. Public users can view entries and analytics.
        *   If `true`, you **must** configure `auth0Domain` and `auth0ClientId` with your actual Auth0 application credentials.
    *   **`false`:** Disables authentication entirely. All users will have full access to all portal features without needing to log in. The Login/Logout UI will be hidden.

*   **`auth0Domain: string`**
    *   Required if `enableAuth` is `true`.
    *   Your Auth0 application domain (e.g., `your-tenant.us.auth0.com`).
    *   **Placeholder:** The template uses `'YOUR_AUTH0_DOMAIN'`. Replace this.

*   **`auth0ClientId: string`**
    *   Required if `enableAuth` is `true`.
    *   Your Auth0 application Client ID.
    *   **Placeholder:** The template uses `'YOUR_AUTH0_CLIENT_ID'`. Replace this.

**Important:** If `enableAuth` is `true` but `auth0Domain` or `auth0ClientId` are left as placeholders or are empty, the application will default to a public read-only mode for features that would normally require authentication, and a warning will be logged in the browser's developer console.

### Application Settings

*   **`appName: string`**
    *   The name of your portal (e.g., "Particle Physics Group Portal", "Marine Biology Research Hub").
    *   This name is displayed in the page title, Navbar (potentially, depending on styling), and footer.
    *   Example: `"Pubsly"`

*   **`defaultTags: string[]`**
    *   An array of strings representing default or suggested tags that will appear as clickable "pills" in the publication form. This helps ensure consistency in tagging.
    *   Example: `['research', 'portal-entry', 'collaboration-xyz', 'experiment']`

### API Endpoints (`apiBaseUrls`)

*   This object contains the base URLs for external APIs used by the portal:
    *   **`semanticScholar`**: For fetching citation counts.
    *   **`crossref`**: For fetching metadata from DOIs.
    *   **`arxiv`**: For fetching metadata from arXiv IDs.
    *   **`orcidPublicApi`**: For fetching publication summaries from ORCID profiles.
*   These URLs are pre-configured to point to the public endpoints of these services. **Generally, you should not need to change these** unless you are using a proxy or have specific reasons to point to different API versions (which should be done with caution as it might break parsing logic).

## Modifying the Configuration

1.  Locate the `config.ts` file in the application's source code.
2.  Open the file in a text editor.
3.  Modify the values for the properties as needed.
4.  Save the `config.ts` file.
5.  If the application is currently running, you will likely need to rebuild and redeploy it (or restart the development server) for the changes to take effect.

Careful configuration of `config.ts` is essential for the proper functioning and security of your Research Collaboration Portal, especially regarding authentication settings.
