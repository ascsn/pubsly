
import React, { useEffect, useRef, useMemo, useState } from 'react';
import { Publication, Presentation, Author } from '../types';
import { Chart, BarElement, BarController, CategoryScale, LinearScale, Title, Tooltip, Legend, ChartConfiguration, ChartItem } from 'chart.js';
import { SpeakerWaveIcon } from './Navbar'; // Import SpeakerWaveIcon

// Register Chart.js components
Chart.register(BarElement, BarController, CategoryScale, LinearScale, Title, Tooltip, Legend);

interface AnalyticsViewProps {
  publications: Publication[];
  presentations: Presentation[];
}

// Utility function to strip HTML/XML tags (copied here for self-containment, or could be imported if modularized)
const stripHtmlTags = (str: string | undefined): string | undefined => {
  if (!str) return undefined;
  try {
    const doc = new DOMParser().parseFromString(str, 'text/html');
    return doc.body.textContent || "";
  } catch (e) {
    return str.replace(/<[^>]*>?/gm, '');
  }
};

const StatCard: React.FC<{ title: string; value: string | number; description?: string; icon?: React.ReactNode }> = ({ title, value, description, icon }) => (
  <div className="bg-slate-800 p-6 rounded-xl shadow-lg hover:shadow-sky-500/20 transition-shadow duration-300 flex flex-col justify-between min-h-[160px]">
    <div>
      <div className="flex items-center text-sky-400 mb-2">
        {icon && <div className="mr-3 flex-shrink-0">{icon}</div>}
        <h3 className="text-lg font-semibold ">{title}</h3>
      </div>
      <p className="text-4xl font-bold text-gray-100 mb-1 break-words">{value}</p>
      {description && <p className="text-sm text-gray-400 break-words">{description}</p>}
    </div>
  </div>
);

// Icons for StatCards
const BookOpenIcon: React.FC<{className?: string}> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className || "w-8 h-8"}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" />
  </svg>
);
// Removed local Presentation Icon definition, will use imported one.
const UsersIcon: React.FC<{className?: string}> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className || "w-8 h-8"}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" />
  </svg>
);
const StarIcon: React.FC<{className?: string}> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className || "w-8 h-8"}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.822.672l-4.994-2.84a.562.562 0 0 0-.608 0l-4.994 2.84a.562.562 0 0 1-.822-.672l1.285-5.385a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z" />
  </svg>
);
const TagIconSolid: React.FC<{className?: string}> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className || "w-8 h-8"}>
        <path d="M3.505 2.365A4.25 4.25 0 0 0 2 6.016v0A4.253 4.253 0 0 0 6.25 10.25h0a4.253 4.253 0 0 0 4.25-4.234V6A4.25 4.25 0 0 0 6.135 1.765L3.505 2.365ZM10.25 10.25a4.253 4.253 0 0 0 4.25-4.25v0a4.25 4.25 0 0 0-4.25-4.25h0a4.25 4.25 0 0 0-4.25 4.25v0A4.253 4.253 0 0 0 10.25 10.25Z" />
        <path fillRule="evenodd" d="M12.243 1.306a.75.75 0 0 1 .53.22l4.158 4.158a.75.75 0 0 1 .22.53v4.342a.75.75 0 0 1-.22.53l-4.158 4.158a.75.75 0 0 1-.53.22H7.9a.75.75 0 0 1-.53-.22L3.212 11.13a.75.75 0 0 1-.22-.53V6.258a.75.75 0 0 1 .22-.53L7.37 1.526a.75.75 0 0 1 .53-.22h4.342ZM9.25 5.5a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Z" clipRule="evenodd" />
    </svg>
);


const AnalyticsView: React.FC<AnalyticsViewProps> = ({ publications, presentations }) => {
  const publicationsChartRef = useRef<HTMLCanvasElement>(null);
  const citationsByYearChartRef = useRef<HTMLCanvasElement>(null);
  const chartInstancesRef = useRef<{ pubs?: Chart; citations?: Chart }>({});
  const [selectedAnalyticsTag, setSelectedAnalyticsTag] = useState<string | null>(null);

  const allUniqueTags = useMemo(() => {
    const tagsSet = new Set<string>();
    publications.forEach(pub => pub.tags?.forEach(tag => tagsSet.add(tag)));
    return Array.from(tagsSet).sort((a,b) => a.localeCompare(b));
  }, [publications]);

  const filteredPublicationsForAnalytics = useMemo(() => {
    if (!selectedAnalyticsTag) return publications;
    return publications.filter(pub => pub.tags && pub.tags.map(t => t.toLowerCase()).includes(selectedAnalyticsTag.toLowerCase()));
  }, [publications, selectedAnalyticsTag]);

  const formatAuthorName = (author: Author): string => {
    return author.name || `${author.given || ''} ${author.family || ''}`.trim();
  };

  const stats = useMemo(() => {
    const currentPubs = filteredPublicationsForAnalytics;
    const totalPubs = currentPubs.length;
    const totalPres = presentations.length; // Presentations are not filtered by tag
    
    let totalCitations = 0;
    let mostCitedPub: Publication | null = null;
    currentPubs.forEach(p => {
      if (typeof p.citationCount === 'number') {
        totalCitations += p.citationCount;
        if (!mostCitedPub || p.citationCount > (mostCitedPub.citationCount || 0)) {
          mostCitedPub = p;
        }
      }
    });
    const pubsWithCitationData = currentPubs.filter(p => typeof p.citationCount === 'number').length;
    const avgCitations = pubsWithCitationData > 0 ? (totalCitations / pubsWithCitationData).toFixed(2) : 'N/A';

    const authorSet = new Set<string>();
    currentPubs.forEach(pub => {
      pub.authors.forEach(author => {
        const name = formatAuthorName(author);
        if (name) {
          authorSet.add(name);
        }
      });
    });
    const uniqueAuthorsCount = authorSet.size;

    const tagCounts: { [tag: string]: number } = {};
    currentPubs.forEach(pub => { // Use currentPubs for tag counts if a filter is active
      pub.tags?.forEach(tag => {
        tagCounts[tag] = (tagCounts[tag] || 0) + 1;
      });
    });
    const topTags = Object.entries(tagCounts)
      .sort(([,a],[,b]) => b-a)
      .slice(0, 3)
      .map(([tag, count]) => `${tag} (${count})`);

    return {
      totalPubs,
      totalPres, // Remains global
      totalCitations,
      avgCitations,
      mostCitedPub,
      uniqueAuthorsCount,
      topTags: topTags.length > 0 ? topTags.join(', ') : 'N/A',
    };
  }, [filteredPublicationsForAnalytics, presentations]);

  const publicationsByYear = useMemo(() => {
    const data: { [year: string]: number } = {};
    filteredPublicationsForAnalytics.forEach(pub => {
      if (pub.year) {
        data[pub.year.toString()] = (data[pub.year.toString()] || 0) + 1;
      }
    });
    return Object.entries(data).sort(([yearA], [yearB]) => parseInt(yearA) - parseInt(yearB));
  }, [filteredPublicationsForAnalytics]);

  const citationsByPubYear = useMemo(() => {
    const data: { [year: string]: number } = {};
    filteredPublicationsForAnalytics.forEach(pub => {
      if (pub.year && typeof pub.citationCount === 'number') {
        data[pub.year.toString()] = (data[pub.year.toString()] || 0) + pub.citationCount;
      }
    });
    return Object.entries(data).sort(([yearA], [yearB]) => parseInt(yearA) - parseInt(yearB));
  }, [filteredPublicationsForAnalytics]);

  useEffect(() => {
    if (chartInstancesRef.current.pubs) chartInstancesRef.current.pubs.destroy();
    if (chartInstancesRef.current.citations) chartInstancesRef.current.citations.destroy();
    chartInstancesRef.current = {}; 

    const commonChartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
            x: { 
                grid: { color: 'rgba(255, 255, 255, 0.1)' },
                ticks: { color: '#cbd5e1' } 
            },
            y: { 
                beginAtZero: true, 
                grid: { color: 'rgba(255, 255, 255, 0.1)' },
                ticks: { color: '#cbd5e1', stepSize: 1 } 
            }
        },
        plugins: {
            legend: { display: false },
            title: { 
                display: true, 
                font: { size: 16 },
                color: '#e2e8f0' 
            },
            tooltip: {
                backgroundColor: 'rgba(30, 41, 59, 0.9)', 
                titleColor: '#f1f5f9', 
                bodyColor: '#cbd5e1', 
                borderColor: '#64748b', 
                borderWidth: 1,
            }
        }
    };

    if (publicationsChartRef.current && publicationsByYear.length > 0) {
      const chartConfig: ChartConfiguration = {
        type: 'bar',
        data: {
          labels: publicationsByYear.map(([year]) => year),
          datasets: [{
            label: 'Publications',
            data: publicationsByYear.map(([, count]) => count),
            backgroundColor: 'rgba(56, 189, 248, 0.6)', 
            borderColor: 'rgb(14, 165, 233)', 
            borderWidth: 1,
            borderRadius: 4,
            hoverBackgroundColor: 'rgba(14, 165, 233, 0.8)',
          }]
        },
        options: {
            ...commonChartOptions,
            plugins: {
                ...commonChartOptions.plugins,
                title: { 
                    ...commonChartOptions.plugins?.title, 
                    text: `Publications Over Time ${selectedAnalyticsTag ? `(Tag: ${selectedAnalyticsTag})` : ''}` 
                }
            }
        }
      };
      chartInstancesRef.current.pubs = new Chart(publicationsChartRef.current as ChartItem, chartConfig);
    }

    if (citationsByYearChartRef.current && citationsByPubYear.length > 0) {
      const chartConfig: ChartConfiguration = {
        type: 'bar',
        data: {
          labels: citationsByPubYear.map(([year]) => year),
          datasets: [{
            label: 'Total Citations',
            data: citationsByPubYear.map(([, count]) => count),
            backgroundColor: 'rgba(34, 197, 94, 0.6)', 
            borderColor: 'rgb(22, 163, 74)', 
            borderWidth: 1,
            borderRadius: 4,
            hoverBackgroundColor: 'rgba(22, 163, 74, 0.8)',
          }]
        },
        options: {
            ...commonChartOptions,
            plugins: {
                ...commonChartOptions.plugins,
                title: { 
                    ...commonChartOptions.plugins?.title, 
                    text: `Citations by Publication Year ${selectedAnalyticsTag ? `(Tag: ${selectedAnalyticsTag})` : ''}`
                }
            }
        }
      };
      chartInstancesRef.current.citations = new Chart(citationsByYearChartRef.current as ChartItem, chartConfig);
    }

    return () => {
      if (chartInstancesRef.current.pubs) chartInstancesRef.current.pubs.destroy();
      if (chartInstancesRef.current.citations) chartInstancesRef.current.citations.destroy();
    };
  }, [publicationsByYear, citationsByPubYear, selectedAnalyticsTag]); 

  return (
    <div className="space-y-10">
      <h2 className="text-3xl font-bold text-sky-400 border-b-2 border-slate-700 pb-3 mb-6">
        Summary & Analytics {selectedAnalyticsTag ? <span className="text-2xl text-gray-400">(Filtered by Tag: {selectedAnalyticsTag})</span> : ''}
      </h2>

      <div className="mb-8">
          <label htmlFor="tag-filter-analytics" className="block text-sm font-medium text-gray-300 mb-1">
              Filter Statistics & Charts by Tag:
          </label>
          <select
              id="tag-filter-analytics"
              value={selectedAnalyticsTag || ''}
              onChange={(e) => setSelectedAnalyticsTag(e.target.value || null)}
              className="w-full md:w-2/3 lg:w-1/2 xl:w-1/3 bg-slate-700 border border-slate-600 text-gray-200 rounded-md shadow-sm py-2.5 px-3 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 sm:text-sm"
              aria-label="Filter analytics by tag"
          >
              <option value="">All Tags</option>
              {allUniqueTags.map(tag => (
                  <option key={tag} value={tag}>{tag}</option>
              ))}
          </select>
      </div>

      <section aria-labelledby="summary-stats-heading">
        <h3 id="summary-stats-heading" className="text-2xl font-semibold text-gray-100 mb-6">Key Statistics {selectedAnalyticsTag ? `for '${selectedAnalyticsTag}'` : ''}</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6"> {/* Adjusted xl:grid-cols from 4 to 3 */}
          <StatCard title="Total Publications" value={stats.totalPubs} icon={<BookOpenIcon />} description={selectedAnalyticsTag ? `with tag '${selectedAnalyticsTag}'` : 'All recorded'} />
          <StatCard title="Total Presentations" value={stats.totalPres} icon={<SpeakerWaveIcon className="w-8 h-8" />} description="Not filtered by tag"/>
          <StatCard title="Total Citations" value={stats.totalCitations} icon={<StarIcon className="text-yellow-400" />} description={selectedAnalyticsTag ? `for tag '${selectedAnalyticsTag}'` : '(From publications with data)'}/>
          <StatCard title="Avg. Citations/Pub" value={stats.avgCitations} description={selectedAnalyticsTag ? `for tag '${selectedAnalyticsTag}'` : '(For pubs with data)'} />
          <StatCard title="Unique Authors" value={stats.uniqueAuthorsCount} icon={<UsersIcon />} description={selectedAnalyticsTag ? `on '${selectedAnalyticsTag}' pubs` : '(From all publications)'} />
          <StatCard 
            title="Most Cited Publication" 
            value={stats.mostCitedPub ? `${stats.mostCitedPub.citationCount} citations` : 'N/A'} 
            description={stats.mostCitedPub ? `"${stripHtmlTags(stats.mostCitedPub.title)}"` : (selectedAnalyticsTag ? `for tag '${selectedAnalyticsTag}'` : undefined)} 
          />
          <StatCard title="Top Tags" value={stats.topTags} icon={<TagIconSolid />} description={selectedAnalyticsTag ? `within '${selectedAnalyticsTag}' pubs` : '(By frequency, all pubs)'} />
        </div>
         {selectedAnalyticsTag && filteredPublicationsForAnalytics.length === 0 && (
            <p className="mt-6 text-center text-gray-400 italic">
                No publications found with the tag "{selectedAnalyticsTag}" to display statistics.
            </p>
        )}
      </section>

      <section aria-labelledby="charts-heading">
        <h3 id="charts-heading" className="text-2xl font-semibold text-gray-100 mb-6 mt-12">Visualizations {selectedAnalyticsTag ? `for Tag: '${selectedAnalyticsTag}'` : ''}</h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-slate-800 p-4 rounded-xl shadow-lg">
            <div className="chart-container h-80 md:h-96">
              {publicationsByYear.length > 0 ? (
                <canvas ref={publicationsChartRef} aria-label={`Bar chart showing publications over time ${selectedAnalyticsTag ? `for tag ${selectedAnalyticsTag}` : ''}`}></canvas>
              ) : (
                <p className="text-gray-400 text-center pt-20">No publication data available for chart {selectedAnalyticsTag ? `with tag '${selectedAnalyticsTag}'` : ''}.</p>
              )}
            </div>
          </div>
          <div className="bg-slate-800 p-4 rounded-xl shadow-lg">
            <div className="chart-container h-80 md:h-96">
              {citationsByPubYear.length > 0 ? (
                <canvas ref={citationsByYearChartRef} aria-label={`Bar chart showing citations by publication year ${selectedAnalyticsTag ? `for tag ${selectedAnalyticsTag}` : ''}`}></canvas>
              ) : (
                <p className="text-gray-400 text-center pt-20">No citation data available for chart {selectedAnalyticsTag ? `with tag '${selectedAnalyticsTag}'` : ''}.</p>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AnalyticsView;
