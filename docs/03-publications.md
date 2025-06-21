# 3. Managing Publications

This section covers all aspects of adding, importing, and managing research publications within Pubsly. Access to adding, editing, and deleting publications typically requires you to be logged in (if authentication is enabled).

## Adding a Single Publication

Navigate to "Add Publication" from the Navbar or the Home page. The form provides multiple ways to add a publication:

### 1. Using DOI or arXiv ID (Recommended)

This is the quickest way to add a publication with accurate metadata.

1.  **Enter Identifier:** In the "DOI or arXiv ID/Link" field, type or paste the Digital Object Identifier (DOI) (e.g., `10.1000/xyz123`) or an arXiv ID (e.g., `2101.00001` or `https://arxiv.org/abs/2101.00001`).
2.  **Fetch & Parse:** Click the "Fetch & Parse" button.
    *   The system will attempt to retrieve metadata from CrossRef (for DOIs) or the arXiv API.
    *   If successful, a "Fetched Data (Review or Edit Below)" section will appear, displaying the retrieved information (Title, Authors, Year, Source, Abstract, URL, Tags from source, Citation Count from Semantic Scholar).
3.  **Review and Edit:**
    *   The main form fields below (Title, Authors, Year, etc.) will be automatically populated with the fetched data.
    *   Review these details for accuracy. You can edit any field as needed.
    *   Add or modify tags (see [Tagging System](#tagging-system) below).
4.  **Save:** Click "Save Publication".

**Notes on Fetching:**
*   If an arXiv entry has a linked DOI, the portal will attempt to use the DOI for more comprehensive metadata.
*   Citation counts are fetched from Semantic Scholar. This process can sometimes fail due to network issues or if the publication is not indexed by Semantic Scholar. You can try refreshing citations later (see [Data Management](./07-data-management.md)).
*   If fetching fails or provides incomplete data, the system may prompt you to "Switch to Manual Entry".

### 2. Manual Entry

If you don't have a DOI/arXiv ID, or if parsing fails, you can enter all details manually.
1.  If you attempted parsing, click "Switch to Manual Entry" if prompted. Otherwise, you can directly start filling the fields.
2.  **Fill in Details:**
    *   **Title (Required):** The full title of the publication.
    *   **Authors (Required):** A comma-separated list of authors (e.g., "Doe, John and Smith, Jane").
    *   **Year:** The publication year (e.g., 2023).
    *   **Journal/Conference/Source:** The name of the journal, conference proceedings, book title, or other source.
    *   **URL:** A direct link to the publication (e.g., publisher's page, repository link).
    *   **Tags:** See [Tagging System](#tagging-system).
    *   **Abstract (Optional):** The abstract of the publication.
3.  **Save:** Click "Save Publication". The `ID` field will be automatically generated if not derived from a DOI/arXiv. The `Type` will be 'Other'.

### Fields Explained:
*   **ID:** The DOI or arXiv ID. Cannot be changed after initial save (unless editing an entry that had a temporary ID).
*   **Type:** Automatically determined as 'DOI', 'arXiv', or 'Other'.
*   **Title, Authors, Year, Source, URL, Abstract:** Standard publication metadata.
*   **Tags:** Keywords to categorize the publication.
*   **Citation Count:** Number of citations, typically fetched from Semantic Scholar.

## Bulk Importing Publications

The "Add Publication" page also offers modes for bulk importing. This is useful for adding multiple publications at once. This feature is typically available only to authenticated users.

### 1. Import from ORCID Profile

1.  **Switch Mode:** On the "Add Publication" page, select the "ORCID Import" entry mode.
2.  **Enter ORCID ID:** Input the 16-digit ORCID ID of the profile you want to import from (e.g., `0000-0001-2345-6789`).
3.  **Fetch from ORCID:** Click the "Fetch from ORCID" button.
    *   The portal will retrieve a list of publication summaries associated with that ORCID ID.
4.  **Review and Select:**
    *   The fetched publications will be displayed in a list. Each item will show basic details (Title, Authors, Year).
    *   **Checkboxes:** Use the checkboxes to select the publications you wish to import.
    *   **Select All/Deselect All:** A button is available to quickly select or deselect all items in the list.
    *   **Duplicate Detection:** The system will attempt to flag publications that might already exist in your portal based on ID (DOI/arXiv) or title and year similarity. These will be visually distinct (e.g., pre-unchecked or highlighted).
5.  **Add Selected to Portal:** Once you've made your selections, click the "Add Selected Publications to Portal" button.
    *   For each selected item, the portal will attempt to fetch more complete details (e.g., full author list, abstract, citation count from Semantic Scholar if not already present from ORCID or if a DOI/arXiv is found).
    *   A summary alert will inform you of how many publications were added and how many were skipped (e.g., as duplicates or due to errors).

### 2. Import from Google Scholar (via BibTeX)

1.  **Switch Mode:** On the "Add Publication" page, select the "BibTeX Import" entry mode.
2.  **Prepare BibTeX File:**
    *   Go to your Google Scholar profile page (or any researcher's public profile).
    *   Select the publications you wish to export by checking the boxes next to them.
    *   Click the "EXPORT" button that appears above the list.
    *   Choose "BibTeX" from the export options.
    *   A new page or a direct download will provide the BibTeX content. Save this content as a file with a `.bib` extension (e.g., `my_scholar_pubs.bib`).
3.  **Upload BibTeX File:**
    *   Back in the portal, click "Choose File" (or similar, depending on your browser) in the BibTeX import section.
    *   Select the `.bib` file you saved.
4.  **Process BibTeX File:** Click the "Process BibTeX File" button.
    *   The portal will parse the BibTeX file and extract publication entries.
5.  **Review and Select:**
    *   Similar to the ORCID import, a list of parsed publications will be shown with checkboxes.
    *   Review, select/deselect items, and note any potential duplicates.
6.  **Add Selected to Portal:** Click "Add Selected Publications to Portal".
    *   The system will enrich the selected entries (fetch citation counts, etc.) and add them to your portal.

## Tagging System

Tags help categorize and filter your publications.

*   **Suggested Tags:** A list of predefined tags (configured by the portal administrator in `config.ts`) may be displayed as clickable "pills". Clicking a pill toggles its selection.
*   **Manual Tag Entry:**
    *   A text input field allows you to type tags.
    *   Separate multiple tags with commas (e.g., "machine learning, astrophysics, data analysis").
    *   Pressing Enter or comma, or blurring the input field, will confirm the typed tags.
*   **Selection:** Both clicked pills and manually entered tags contribute to the "Selected Tags" for the publication. These are displayed in the input field as a comma-separated list and are saved with the publication.
*   Tags are case-insensitive internally (usually converted to lowercase).
*   When metadata is fetched (e.g., from CrossRef or arXiv), any "subject" or "category" fields from the source may be used as initial tags. These can be modified.

## Editing a Publication

1.  Go to the "View Entries" page.
2.  Find the publication you wish to edit.
3.  Click the **Pencil icon** (Edit) next to the publication.
4.  You will be taken to the "Add Publication" form, pre-filled with the publication's details. The mode will be "Single Entry", and the form title will indicate "Edit Publication".
5.  Modify any fields as needed (Title, Authors, Year, Source, URL, Abstract, Tags). The original ID (DOI/arXiv) cannot be changed.
6.  Click "Update Publication" to save your changes.
7.  Click "Cancel" to discard changes and return to the "View Entries" list.

## Deleting a Publication

1.  Go to the "View Entries" page.
2.  Find the publication you wish to delete.
3.  Click the **Trash icon** (Delete) next to the publication.
4.  A confirmation dialog will appear. Confirm that you want to delete the publication.
    **Caution:** Deletion is permanent and cannot be undone.

For deleting multiple publications at once, see [Bulk Deletion](./05-viewing-entries.md#bulk-deletion).
