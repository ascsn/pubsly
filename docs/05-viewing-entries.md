
# 5. Viewing Entries

The "View Entries" page is where you can see all the publications and presentations logged in the portal.

## Accessing the View

Navigate to "View Entries" from the Navbar or the Home page. The page is divided into two main sections: "Publications" and "Presentations".

## Browsing and Sorting

*   **Publications:**
    *   Displayed with title, authors, source, year, type (DOI/arXiv/Other), URL, citation count (if available), abstract (expandable), and tags.
    *   Sorted primarily by year (descending, newest first). Within the same year, they are sorted by the timestamp of when they were added or last updated (descending).
*   **Presentations:**
    *   Displayed with title, speaker, date, location, link, and associated file information (if any).
    *   Sorted primarily by date (descending, most recent first). Within the same date, they are sorted by timestamp (descending).

## Filtering by Tags (Publications Only)

Tags provide a powerful way to filter the list of publications.

1.  **Click a Tag:** In the "Publications" section, each publication's tags are displayed as clickable buttons.
2.  **Apply Filter:** Clicking on a tag will filter the publication list to show only those entries that include the selected tag.
    *   An indicator will appear at the top of the publications list, stating "Filtering by: [tag_name]".
3.  **Clear Filter:**
    *   To clear the filter and show all publications again, you can either click the "X" button next to the filter indicator or click the currently active tag button again.
    *   The filter is also automatically cleared if you navigate away from the "View Entries" page.

**Note:** Tag filtering currently applies only to publications, not presentations.

## Editing and Deleting Individual Entries

(This functionality requires you to be logged in, if authentication is enabled.)

Next to each publication and presentation entry, you will find:
*   **Pencil Icon:** Click to edit the entry (see [Managing Publications](./03-publications.md#editing-a-publication) or [Managing Presentations](./04-presentations.md#editing-a-presentation)).
*   **Trash Icon:** Click to delete the entry. A confirmation prompt will appear before deletion.

## Bulk Deletion

(This functionality requires you to be logged in, if authentication is enabled.)

The portal allows you to delete multiple publications and/or presentations at once.

1.  **Enter Select Mode:**
    *   At the top right of the "View Entries" page, click the "Enter Select Mode" button.
    *   The button text will change to "Cancel Select Mode".
    *   Checkboxes will appear next to each publication and presentation item.
    *   A "Delete Selected Items" button will become visible if any items are selected.
    *   "Select All / Deselect All" buttons will appear for publications and presentations respectively, near their section titles.
2.  **Select Items:**
    *   Click the checkbox next to each publication or presentation you wish to delete.
    *   Use the "Select All Pubs" or "SelectAll Pres." buttons to quickly select all items in the respective visible list (honors active tag filter for publications). Clicking it again will deselect all.
3.  **Delete Selected Items:**
    *   Once you have selected the desired items, the "Delete Selected Items ([count])" button at the top of the page (in the sticky selection bar) will show how many items are currently selected.
    *   Click this button.
4.  **Confirm Deletion:**
    *   A confirmation dialog will appear, asking you to confirm the deletion of the selected items.
    *   **Caution:** This action is permanent and cannot be undone.
5.  **Result:** If confirmed, the selected items will be deleted, and you will be returned to the normal view mode (select mode will be exited). An alert will confirm the number of items deleted.
6.  **Cancel Select Mode:**
    *   If you decide not to delete items, click "Cancel Select Mode". This will clear all selections and hide the checkboxes.

**Important Considerations for Bulk Actions:**
*   If a tag filter is active for publications, "Select All Pubs" will only select all *visible filtered* publications.
*   The selection interface is only available if you are authenticated (and authentication is enabled in the portal's configuration).
