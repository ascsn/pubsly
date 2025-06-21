# 2. Getting Started

This section will guide you through accessing Pubsly, understanding the authentication process (if applicable), and navigating its main features.

## Accessing Pubsly

To use Pubsly, simply open the provided URL in a modern web browser (e.g., Chrome, Firefox, Safari, Edge). Pubsly is designed to be responsive and should work well on desktops, tablets, and mobile devices.

## Authentication

Pubsly's authentication behavior depends on its configuration (`config.ts` file).

*   **If Authentication is DISABLED (`enableAuth: false`):**
    *   You will have immediate full access to all features of Pubsly without needing to log in. This includes adding, editing, deleting entries, and all data management functions.
    *   There will be no "Login" or "Logout" buttons visible.

*   **If Authentication is ENABLED (`enableAuth: true` and Auth0 is configured):**
    *   **Public View (Not Logged In):**
        *   You can browse existing publications and presentations.
        *   You can view the "Summary & Analytics" page.
        *   You will **not** be able to add new entries, edit or delete existing ones, or use import/export features.
        *   A "Login" button will be visible in the Navbar.
    *   **Logging In:**
        *   Click the "Login" button in the Navbar.
        *   You will be redirected to the Auth0 login page. Follow the prompts to authenticate with your credentials.
        *   Upon successful login, you will be redirected back to Pubsly.
    *   **Private View (Logged In):**
        *   You will have full access to all features, including adding, editing, deleting, importing, and exporting data.
        *   Your username (or email) will be displayed in the Navbar, along with a "Logout" button.
    *   **Logging Out:**
        *   Click the "Logout" button in the Navbar.
        *   You will be logged out and returned to the public view of Pubsly.
    *   **If Auth0 is enabled but NOT configured correctly by the administrator:**
        *   Pubsly will behave as if you are not logged in (public read-only access for most features).
        *   A warning message will appear in the browser's developer console for the administrator.

## Navigating Pubsly

The main navigation interface is the **Navbar** located at the top of the page.

*   **Portal Title/Logo (Top Left):** Clicking on the "Pubsly" title or the academic cap icon will always take you back to the **Home page**.
*   **Main Navigation Buttons:**
    *   **Add Publication:** (Authenticated users only) Takes you to the form for adding a new publication.
    *   **Add Presentation:** (Authenticated users only) Takes you to the form for adding a new presentation.
    *   **View Entries:** Displays a list of all publications and presentations.
    *   **Summary & Analytics:** Shows statistics and charts related to your research output.
*   **Data Management Tools (Right side of Navbar, Authenticated users only):**
    *   **Import:** Allows importing data from a JSON file.
    *   **Refresh Citations:** Initiates a process to update citation counts for publications.
    *   **Export:** Provides options to export data in JSON, Plain Text, or BibTeX formats.
*   **Authentication Section (Right side of Navbar, if Auth0 is enabled & configured):**
    *   Displays "Login" button if not authenticated.
    *   Displays user information and "Logout" button if authenticated.
*   **Mobile Menu (Hamburger Icon):** On smaller screens, navigation items and tools are collapsed into a mobile menu accessible via the hamburger icon.

### Home Page

The default landing page of Pubsly. It typically shows:
*   A welcome message.
*   A quick summary of the total number of publications and presentations tracked.
*   Feature cards that provide quick links to:
    *   Add New Publication (Authenticated users only)
    *   Log New Presentation (Authenticated users only)
    *   Browse All Entries
    *   View Summary & Analytics

Use the Navbar or the feature cards on the Home page to access different sections of Pubsly. If you are editing an entry, navigation may be disabled until you save or cancel your changes to prevent data loss.
