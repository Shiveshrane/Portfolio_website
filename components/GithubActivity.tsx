import React, { useEffect, useMemo, useRef, useState } from 'react';
import { GITHUB_CONFIG } from '../config';

interface ContributionDay {
  date: string;
  count: number;
  level: number;
}

interface Profile {
  public_repos: number;
  followers: number;
}

const LEVEL_CLASS = ['bg-line', 'bg-accent/25', 'bg-accent/45', 'bg-accent/70', 'bg-accent'];

const GithubActivity: React.FC = () => {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [days, setDays] = useState<ContributionDay[]>([]);
  const [total, setTotal] = useState<number | null>(null);
  const [recentRepos, setRecentRepos] = useState<string[]>([]);
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const scrollRef = useRef<HTMLDivElement>(null);
  const user = GITHUB_CONFIG.USERNAME;

  useEffect(() => {
    const headers: HeadersInit = GITHUB_CONFIG.TOKEN ? { Authorization: `token ${GITHUB_CONFIG.TOKEN}` } : {};

    const loadProfile = fetch(`https://api.github.com/users/${user}`, { headers })
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => d && setProfile({ public_repos: d.public_repos, followers: d.followers }))
      .catch(() => {});

    const loadEvents = fetch(`https://api.github.com/users/${user}/events?per_page=30`, { headers })
      .then((r) => (r.ok ? r.json() : []))
      .then((events: any[]) => {
        const repos = events
          .filter((e) => e.type === 'PushEvent')
          .map((e) => e.repo.name.split('/')[1] || e.repo.name);
        setRecentRepos(Array.from(new Set<string>(repos)).slice(0, 3));
      })
      .catch(() => {});

    const loadContributions = fetch(`https://github-contributions-api.jogruber.de/v4/${user}?y=last`)
      .then((r) => {
        if (!r.ok) throw new Error(String(r.status));
        return r.json();
      })
      .then((d: { total: Record<string, number>; contributions: ContributionDay[] }) => {
        setDays(d.contributions);
        setTotal(d.total.lastYear ?? Object.values(d.total).reduce((a, b) => a + b, 0));
        setStatus('ready');
      })
      .catch(() => setStatus('error'));

    Promise.all([loadProfile, loadEvents, loadContributions]);
  }, [user]);

  const weeks = useMemo(() => {
    if (!days.length) return [];
    const pad = new Date(days[0].date).getUTCDay(); // 0 = Sunday
    const all: (ContributionDay | null)[] = [...Array(pad).fill(null), ...days];
    const out: (ContributionDay | null)[][] = [];
    for (let i = 0; i < all.length; i += 7) out.push(all.slice(i, i + 7));
    return out;
  }, [days]);

  // On narrow screens, start scrolled to the most recent weeks.
  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollLeft = scrollRef.current.scrollWidth;
  }, [weeks]);

  return (
    <div>
      <div className="flex flex-wrap gap-x-8 gap-y-2 mb-6 font-mono text-xs text-faint">
        <span>
          <span className="text-ink tabular-nums">{total ?? '—'}</span> contributions · last 12 months
        </span>
        <span>
          <span className="text-ink tabular-nums">{profile?.public_repos ?? '—'}</span> public repos
        </span>
        <span>
          <span className="text-ink tabular-nums">{profile?.followers ?? '—'}</span> followers
        </span>
      </div>

      <div ref={scrollRef} className="overflow-x-auto scrollbar-hide">
        {status === 'loading' && (
          <div className="h-[115px] flex items-center font-mono text-xs text-faint">loading activity…</div>
        )}
        {status === 'error' && (
          <div className="h-[115px] flex items-center font-mono text-xs text-faint">
            Couldn’t load contribution data right now.
          </div>
        )}
        {status === 'ready' && (
          <div className="flex gap-[3px] w-max" role="img" aria-label={`${total} GitHub contributions in the last year`}>
            {weeks.map((week, wi) => (
              <div key={wi} className="flex flex-col gap-[3px]">
                {week.map((day, di) =>
                  day ? (
                    <div
                      key={day.date}
                      className={`size-[13px] md:size-[15px] rounded-[2px] ${LEVEL_CLASS[day.level] ?? LEVEL_CLASS[0]}`}
                      title={`${day.count} contribution${day.count === 1 ? '' : 's'} on ${day.date}`}
                    />
                  ) : (
                    <div key={`pad-${di}`} className="size-[13px] md:size-[15px]" />
                  )
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="mt-5 flex flex-wrap items-center justify-between gap-4 font-mono text-[11px] text-faint">
        <div className="flex flex-wrap items-center gap-2">
          {recentRepos.length > 0 && (
            <>
              <span>recent pushes</span>
              {recentRepos.map((repo) => (
                <a
                  key={repo}
                  href={`https://github.com/${user}/${repo}`}
                  target="_blank"
                  rel="noreferrer"
                  className="px-1.5 py-0.5 rounded border border-line text-muted hover:text-accent hover:border-accent/40 transition-colors"
                >
                  {repo}
                </a>
              ))}
            </>
          )}
        </div>
        <div className="flex items-center gap-1.5">
          <span>less</span>
          {LEVEL_CLASS.map((c) => (
            <span key={c} className={`size-[10px] rounded-[2px] ${c}`} />
          ))}
          <span>more</span>
        </div>
      </div>
    </div>
  );
};

export default GithubActivity;
