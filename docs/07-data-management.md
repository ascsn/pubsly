
# 7. Data Management

The Research Collaboration Portal provides several tools for managing your data, including import, export, and citation count refreshing. These features are typically available only to authenticated users (if authentication is enabled).

## Importing Data

The portal supports importing data from a JSON file. This is primarily useful for restoring data from a previous backup or transferring data from another instance of the portal.

1.  **Access Import:** In the Navbar, click the "Import" button (usually an icon Pferdeup arrow in a tray).
2.  **Select File:** You will be prompted to select a JSON file from your computer.
3.  **Confirmation:** Before the import proceeds, a confirmation dialog will appear: **"Importing data will overwrite existing entries. Are you sure you want to proceed?"**
    *   **Caution:** Importing data will replace ALL current publications and presentations in the portal with the content of the JSON file. This action cannot be undone. Ensure you have a backup if needed.
4.  **Process:** If confirmed, the portal will read the JSON file.
    *   The JSON file must be in the specific format used by the portal (containing `publications`, `presentations`, and `lastSpeakerName` keys).
    *   If the file is valid, the data will be loaded, replacing any existing data.
    *   An alert message will confirm success or indicate any errors during the import process.
    *   Any active tag filter will be cleared, and you'll typically be navigated to the "View Entries" page.

## Exporting Data

You can export your portal data in several formats. Export options are usually found under an "Export" button or dropdown in the Navbar.

1.  **Export as JSON:**
    *   **Purpose:** This is the recommended format for creating a complete backup of your portal data or for transferring data to another instance of this portal.
    *   **Content:** Exports all publications, all presentations, and the last speaker name into a single JSON file (e.g., `research_portal_data.json`).
    *   **Filtering:** This export always includes *all* data, regardless of any active tag filters in the "View Entries" list.

2.  **Export as Plain Text (.txt):**
    *   **Purpose:** Useful for creating simple, human-readable reports or summaries.
    *   **Content:**
        *   A header with the portal name and generation date.
        *   A citation summary section (total citations, average citations, most cited publication) for the exported publications.
        *   A detailed list of publications, including title, authors, year, source, type, ID, tags, citation count, URL, and abstract.
        *   A detailed list of presentations, including title, speaker, date, location, link, and file info.
    *   **Filtering:**
        *   If a tag filter is active in the "View Entries" list when you initiate this export, **only the filtered publications** will be included in the export. The citation summary will also reflect only these filtered publications.
        *   The filename will indicate if a tag filter was applied (e.g., `research_portal_data_tag_machine-learning.txt`).
        *   Presentations are **not** filtered by tags in this export if a publication tag filter is active; a note will indicate this. To export all presentations, clear the tag filter or use JSON export.

3.  **Export as BibTeX (.bib):**
    *   **Purpose:** Ideal for exporting your publication list for use in reference management software (e.g., Zotero, Mendeley, EndNote) or for including in LaTeX documents.
    *   **Content:**
        *   Creates BibTeX entries for each publication. Common fields like title, author, year, journal/booktitle, DOI, arXiv ID, URL, abstract, and keywords (from tags) are included.
        *   Citation counts are often included in an `annote` field.
    *   **Filtering:**
        *   Similar to the Plain Text export, if a tag filter is active in the "View Entries" list, **only the filtered publications** will be exported.
        *   The filename will reflect any active tag filter.
    *   **Note:** Presentations are typically not included in BibTeX exports as there isn't a standard, universally supported BibTeX entry type for them. A comment in the BibTeX file will note this.

## Refreshing Citation Counts

The portal attempts to fetch citation counts from Semantic Scholar when publications are added or imported. However, this might fail or counts might update over time. The "Refresh Citations" feature helps keep this data current.

1.  **Access:** In the Navbar, click the "Refresh Citations" button (usually an icon like a circular arrow).
2.  **Process:**
    *   The portal will first identify all publications that currently have no citation count (`undefined`) and are of type 'DOI' or 'arXiv'.
    *   If no such publications exist, an alert will inform you.
    *   Otherwise, it will iterate through these publications one by one.
    *   For each, it will attempt to fetch the latest citation count from Semantic Scholar.
    *   To be polite to the Semantic Scholar API and avoid potential rate-limiting, a small delay (e.g., 750ms) is introduced between each API call.
    *   The "Refresh Citations" button will show a loading state while this process is active.
3.  **Completion:**
    *   Once all targeted publications have been processed, an alert will summarize how many citation counts were successfully updated and if any requests failed or returned no data.
    *   The `publications` list in the portal will be updated with any new citation counts.

**Note:** This feature prioritizes publications *missing* citation counts. It does not currently re-fetch for publications that already have a count, though this could be a future enhancement.
