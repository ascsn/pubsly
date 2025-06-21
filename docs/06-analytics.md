
# 6. Summary & Analytics

The "Summary & Analytics" page provides insights into your research collaboration's output through key statistics and visual charts.

## Accessing the Analytics Page

Navigate to "Summary & Analytics" from the Navbar or the Home page.

## Filtering Analytics by Tag

At the top of the analytics page, you'll find a dropdown menu labeled "Filter Statistics & Charts by Tag".

*   By default, "All Tags" is selected, and the statistics and charts reflect all publications in the portal.
*   You can select a specific tag from the dropdown. When a tag is selected:
    *   All "Key Statistics" related to publications (e.g., Total Publications, Total Citations, Average Citations, Most Cited Publication, Unique Authors, Top Tags) will update to reflect **only** the publications associated with that specific tag.
    *   The "Total Presentations" statistic remains global, as presentations are not currently filtered by these tags.
    *   The charts ("Publications Over Time" and "Citations by Publication Year") will also dynamically update to display data corresponding to the selected tag.
    *   The main view title and chart titles will indicate if a tag filter is active (e.g., "Summary & Analytics (Tag: research)").
*   To revert to viewing analytics for all publications, select "All Tags" from the dropdown.

## Key Statistics

This section displays important metrics as individual, styled cards for easy readability:

*   **Total Publications:** The total number of publications recorded (respects active tag filter).
*   **Total Presentations:** The total number of presentations recorded (global, not affected by tag filter).
*   **Total Citations:** The sum of citation counts from all publications that have citation data (respects active tag filter). Citation data is sourced from Semantic Scholar.
*   **Avg. Citations/Pub:** The average number of citations per publication that has citation data (respects active tag filter).
*   **Unique Authors:** The total number of unique author names found across publications (respects active tag filter).
*   **Most Cited Publication:**
    *   Displays the citation count of the publication with the highest number of citations.
    *   The title of this publication is shown as a description (respects active tag filter).
*   **Top Tags:**
    *   Lists the top 3 most frequently used tags across publications. The count of each tag is shown in parentheses.
    *   If a specific tag is selected for filtering analytics, this section will show the top tags *within that selection* if applicable (often, it will just show the selected tag itself).

## Visualizations (Charts)

The portal uses Chart.js to render two main charts, which are responsive and update based on the selected tag filter:

1.  **Publications Over Time:**
    *   **Type:** Bar chart.
    *   **X-axis:** Year.
    *   **Y-axis:** Number of publications.
    *   **Description:** This chart shows the trend of publication output per year. Each bar represents a year, and its height indicates the number of publications from that year.

2.  **Citations by Publication Year:**
    *   **Type:** Bar chart.
    *   **X-axis:** Year of publication.
    *   **Y-axis:** Total citations received.
    *   **Description:** This chart illustrates the cumulative citations received by publications, grouped by the year those publications were published. For example, a bar for "2020" would show the total citations accumulated by all papers published in 2020.

**Chart Interaction:**
*   **Tooltips:** Hovering over a bar in a chart will display a tooltip with the exact value for that data point.
*   **Responsiveness:** Charts will adjust their size and layout based on your screen size.

**Data Availability:**
*   If there is no data for a particular chart (e.g., no publications for the selected tag, or no publications with citation data), a message indicating this will be displayed instead of an empty chart.
