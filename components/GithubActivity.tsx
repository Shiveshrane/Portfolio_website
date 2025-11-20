
import React, { useMemo, useEffect, useState, useRef } from 'react';
import { BIO } from '../constants';
import { GITHUB_CONFIG } from '../config';
import { GitCommit, Star, GitBranch, Eye, Zap } from 'lucide-react';

// ...existing code...
interface GithubData {
  public_repos: number;
  followers: number;
  following: number;
}

interface ContributionDay {
  date: string;
  count: number;
  level: number;
}

interface ContributionResponse {
  total: Record<string, number>;
  contributions: ContributionDay[];
}

const GithubActivity: React.FC = () => {
  const [profileData, setProfileData] = useState<GithubData | null>(null);
  const [contributionData, setContributionData] = useState<ContributionDay[]>([]);
  const [recentRepos, setRecentRepos] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalContributions, setTotalContributions] = useState(0);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const headers: HeadersInit = {};
        if (GITHUB_CONFIG.TOKEN) {
          headers['Authorization'] = `token ${GITHUB_CONFIG.TOKEN}`;
        }

        // 1. Fetch User Profile
        const profileRes = await fetch(`https://api.github.com/users/${GITHUB_CONFIG.USERNAME}`, { headers });
        if (profileRes.ok) {
          const data = await profileRes.json();
          setProfileData({
            public_repos: data.public_repos,
            followers: data.followers,
            following: data.following
          });
        }

        // 2. Fetch Contributions (Full History)
        const initialRes = await fetch(`https://github-contributions-api.jogruber.de/v4/${GITHUB_CONFIG.USERNAME}`);
        if (initialRes.ok) {
          const initialData: ContributionResponse = await initialRes.json();
          const years = Object.keys(initialData.total);
          
          if (years.length > 0) {
             // Fetch all years in parallel
             const yearPromises = years.map(year => 
                fetch(`https://github-contributions-api.jogruber.de/v4/${GITHUB_CONFIG.USERNAME}?y=${year}`)
                  .then(res => res.json())
             );
             
             const yearData = await Promise.all(yearPromises);
             const allContributions = yearData
                .flatMap((d: any) => d.contributions)
                .sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime());

             setContributionData(allContributions);
             
             // Calculate total contributions
             const total = Object.values(initialData.total).reduce((a, b) => a + b, 0);
             setTotalContributions(total);
          } else {
             setContributionData(initialData.contributions);
          }
        }

        // 3. Fetch Recent Activity for "Currently Working On"
        const eventsRes = await fetch(`https://api.github.com/users/${GITHUB_CONFIG.USERNAME}/events?per_page=20`, { headers });
        if (eventsRes.ok) {
            const events = await eventsRes.json();
            const pushEvents = events.filter((e: any) => e.type === 'PushEvent');
            const repos = pushEvents.map((e: any) => e.repo.name.split('/')[1] || e.repo.name);
            const uniqueRepos = Array.from(new Set(repos)).slice(0, 2);
            setRecentRepos(uniqueRepos as string[]);
        }
      } catch (error) {
        console.error("GitHub Fetch Error", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const calendarGrid = useMemo(() => {
    if (!contributionData.length) return [];

    const weeks: (ContributionDay | null)[][] = [];
    
    // Find start day of week of the first date
    // Use UTC to avoid timezone shifts
    const firstDate = new Date(contributionData[0].date);
    const startDay = firstDate.getUTCDay(); // 0 = Sunday
    
    // Create padding for the first week
    const padding = Array(startDay).fill(null);
    const allDays = [...padding, ...contributionData];

    // Chunk into weeks
    for (let i = 0; i < allDays.length; i += 7) {
      weeks.push(allDays.slice(i, i + 7));
    }

    return weeks;
  }, [contributionData]);

  // Scroll to end when data loads
  useEffect(() => {
    if (scrollContainerRef.current && calendarGrid.length > 0) {
      scrollContainerRef.current.scrollLeft = scrollContainerRef.current.scrollWidth;
    }
  }, [calendarGrid]);

  const getLevelColor = (level: number) => {
    switch (level) {
      case 0: return 'bg-[#161b22]';
      case 1: return 'bg-[#0e4429]';
      case 2: return 'bg-[#006d32]';
      case 3: return 'bg-[#26a641]';
      case 4: return 'bg-[#39d353]';
      default: return 'bg-[#161b22]';
    }
  };

  return (
    <div className="w-full border border-neutral-800 bg-[#0d1117] p-6 relative group overflow-hidden">
       {/* Industrial Decor */}
       <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-emerald-500"></div>
       <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-emerald-500"></div>
       <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-emerald-500"></div>
       <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-emerald-500"></div>

       {/* Header Stats */}
       <div className="flex flex-col gap-4 mb-6">
         <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="flex items-center gap-2">
               <GitCommit className="text-emerald-500" size={20} />
               <h3 className="text-lg font-bold text-neutral-200 font-mono">
                 GITHUB_CONTRIBUTIONS
               </h3>
            </div>
            
            <div className="flex items-center gap-4 text-xs font-mono text-neutral-400">
               <div className="flex items-center gap-1 bg-neutral-900 px-2 py-1 border border-neutral-800">
                 <GitBranch size={12} className="text-emerald-500"/>
                 <span className="text-neutral-300">{profileData ? profileData.public_repos : '--'}</span> Repos
               </div>
               <div className="flex items-center gap-1 bg-neutral-900 px-2 py-1 border border-neutral-800">
                 <Eye size={12} className="text-emerald-500"/>
                 <span className="text-neutral-300">{profileData ? profileData.followers : '--'}</span> Followers
               </div>
            </div>
         </div>

         {/* Currently Working On */}
         {recentRepos.length > 0 && (
            <div className="flex items-center gap-2 text-xs font-mono text-neutral-400 bg-neutral-900/30 p-2 border border-neutral-800/50 rounded">
                <Zap size={14} className="text-yellow-500" />
                <span className="text-neutral-500">Currently working on:</span>
                <div className="flex gap-2 flex-wrap">
                    {recentRepos.map(repo => (
                        <a 
                          key={repo}
                          href={`https://github.com/${GITHUB_CONFIG.USERNAME}/${repo}`}
                          target="_blank"
                          rel="noreferrer"
                          className="text-emerald-400 bg-emerald-900/10 px-2 py-0.5 rounded border border-emerald-900/30 hover:bg-emerald-900/30 transition-colors"
                        >
                            {repo}
                        </a>
                    ))}
                </div>
            </div>
         )}
       </div>

      {/* The Graph */}
      <div className="relative">
        <div className="absolute top-0 right-0 -mt-6 text-[10px] text-neutral-500 font-mono flex items-center gap-1">
            <span>Recent</span>
            <span className="text-emerald-500">↓</span>
        </div>
        <div 
          ref={scrollContainerRef}
          className="w-full overflow-x-auto scrollbar-hide pb-2"
        >
          <div className="flex gap-[3px] min-w-max">
            {loading ? (
               <div className="text-neutral-500 text-sm font-mono p-4">Loading contribution data...</div>
            ) : (
              calendarGrid.map((week, weekIndex) => (
                <div key={weekIndex} className="flex flex-col gap-[3px]">
                  {week.map((day, dayIndex) => {
                    if (!day) {
                      return <div key={`empty-${weekIndex}-${dayIndex}`} className="w-[10px] h-[10px]" />;
                    }
                    return (
                      <div
                        key={day.date}
                        className={`w-[10px] h-[10px] rounded-[2px] ${getLevelColor(day.level)} transition-colors duration-500`}
                        title={`${day.date}: ${day.count} contributions`}
                      />
                    );
                  })}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
      
      <div className="mt-4 flex justify-between items-center text-xs text-neutral-500 font-mono border-t border-neutral-800 pt-3">
// ...existing code...
         <a 
            href={`https://github.com/${GITHUB_CONFIG.USERNAME}`} 
            target="_blank" 
            rel="noreferrer"
            className="hover:text-white transition-colors flex items-center gap-1 group-hover:translate-x-1 transition-transform duration-300"
         >
           View Full Profile <span className="text-emerald-500">→</span>
         </a>
         <div className="flex items-center gap-1">
            <span>Less</span>
            <div className="w-[10px] h-[10px] rounded-[2px] bg-[#161b22]"></div>
            <div className="w-[10px] h-[10px] rounded-[2px] bg-[#0e4429]"></div>
            <div className="w-[10px] h-[10px] rounded-[2px] bg-[#006d32]"></div>
            <div className="w-[10px] h-[10px] rounded-[2px] bg-[#26a641]"></div>
            <div className="w-[10px] h-[10px] rounded-[2px] bg-[#39d353]"></div>
            <span>More</span>
         </div>
      </div>
    </div>
  );
};

export default GithubActivity;
