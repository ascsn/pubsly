# Pubsly

Pubsly is a web-based application designed to help research groups and collaborations easily track, manage, and showcase their scholarly output. It provides a centralized platform for team members to log new publications (papers, articles, preprints) and presentations (talks, posters).

This portal is proudly developed by the [Advanced Scientific Computing and Statistics Network (ASCSN)](https://ascsn.net).

## Key Features

*   **Easy Data Entry:** Add publications via DOI/arXiv ID parsing or manual forms. Log presentations with relevant details.
*   **Bulk Import:** Import publications from ORCID profiles or BibTeX files (e.g., from Google Scholar).
*   **Comprehensive Data Management:** Store detailed metadata, including abstracts, URLs, and citation counts (from Semantic Scholar).
*   **Tagging System:** Organize publications with customizable tags for easy filtering and analysis.
*   **Data Visualization & Analytics:** View summary statistics and charts (publications over time, citations by year). Filter analytics by tags.
*   **Efficient Browsing:** Sortable lists of all entries, with tag-based filtering for publications.
*   **Bulk Operations:** Delete multiple entries at once.
*   **Data Export & Backup:** Export data in JSON (full backup), Plain Text, and BibTeX formats.
*   **Citation Management:** Fetches citation counts from Semantic Scholar and allows manual refresh.
*   **User Authentication (Optional & Configurable):**
    *   Supports Auth0 for secure login, distinguishing public read-only views from authenticated full-access.
    *   Can be disabled for full access without login.
    *   Auth0 credentials can be supplied via environment variables for deployment.
*   **Responsive Design:** Accessible on desktops, tablets, and mobile phones.
*   **Comprehensive Documentation:** Includes a full documentation site built with MkDocs.

## Technology Stack

*   **Frontend:** React, TypeScript
*   **Styling:** Tailwind CSS
*   **Charting:** Chart.js
*   **Authentication:** Auth0 (optional)
*   **Modules:** Loaded via ES Modules (esm.sh)

## Getting Started

### Prerequisites

*   A modern web browser (Chrome, Firefox, Safari, Edge).
*   No local build step is strictly required to run the application as-is, as dependencies are loaded via CDN and ES Modules.
*   To build the documentation, you'll need Python, pip, and MkDocs (see [Documentation](#documentation) section).

### Configuration

1.  **Clone the repository (if applicable):**
    ```bash
    git clone https://github.com/ascsn/pubsly.git
    cd pubsly
    ```

2.  **Configure the Portal:**
    *   Open the `config.ts` file in the root directory.
    *   **Application Name:** Modify `appName` to your desired portal name.
    *   **Default Tags:** Customize `defaultTags` for publication suggestions.
    *   **Authentication (Important):**
        *   Decide if you want to use authentication. Set `enableAuth` in `config.ts` to `true` or `false`.
        *   If `enableAuth` is `true`:
            *   You **must** create a Single Page Application in [Auth0](https://auth0.com/).
            *   **Supplying Auth0 Credentials:**
                *   **For Deployment (e.g., Netlify, Vercel - Recommended):**
                    *   Define environment variables in your deployment platform's settings (e.g., `AUTH0_DOMAIN`, `AUTH0_CLIENT_ID`).
                    *   These variables need to be injected into the `window.__APP_CONFIG__` object in `index.html` during the build/deployment process. The `index.html` file includes a `<script>` block showing where these would be set. Many platforms offer ways to replace placeholders in HTML files with environment variables (e.g., Netlify's snippet injection or using build scripts to modify `index.html`).
                    *   The application will prioritize these environment-injected values.
                *   **For Local Development (Fallback):**
                    *   If environment variables are not injected (common for local development), the application will fall back to using the `auth0Domain` and `auth0ClientId` values directly from `config.ts`.
                    *   Replace the placeholder values for `auth0Domain` and `auth0ClientId` in `config.ts` with your actual Auth0 application credentials for local testing if you don't set up local environment variable injection.
            *   In your Auth0 Application settings, configure:
                *   **Allowed Callback URLs:** Add `http://localhost:YOUR_PORT` (e.g., `http://localhost:8000` if serving locally) and `YOUR_APP_DEPLOYMENT_URL` (e.g., `https://ascsn.github.io/pubsly/`).
                *   **Allowed Logout URLs:** Add your local and deployed URLs.
                *   **Allowed Web Origins:** Add your local and deployed URLs.
        *   If `enableAuth` is `false`, users will have full access without login.

## Running the Application

1.  Ensure you have configured `config.ts` as described above.
2.  Open the `index.html` file directly in your web browser.
    *   Alternatively, you can serve the root directory using a simple HTTP server (e.g., `python -m http.server` or VS Code Live Server) and navigate to `index.html`.

## Documentation

Comprehensive documentation for using the portal and understanding its features is available in the `docs/` directory.

To build and view the documentation locally as a website:

1.  **Install MkDocs and a theme (e.g., Material for MkDocs):**
    ```bash
    pip install mkdocs mkdocs-material
    ```
2.  **Navigate to the project's root directory** (the one containing `mkdocs.yml` and the `docs/` folder).
3.  **Serve the documentation:**
    ```bash
    mkdocs serve
    ```
    This will typically start a local server at `http://127.0.0.1:8000/`. Open this URL in your browser.
4.  **Build static documentation site:**
    ```bash
    mkdocs build
    ```
    This generates a `site/` directory containing the HTML files, which you can deploy to any static web hosting service (e.g., GitHub Pages).

The `mkdocs.yml` file in the project root configures the documentation site structure and theme.

## Contributing

Contributions are welcome! If you'd like to contribute, please fork the repository and submit a pull request.

## License

This project is licensed under the **GNU General Public License v3.0**.
See the [LICENSE](https://www.gnu.org/licenses/gpl-3.0.html) file or website for details.

## Acknowledgements

Pubsly was developed by the [Advanced Scientific Computing and Statistics Network (ASCSN)](https://ascsn.net).