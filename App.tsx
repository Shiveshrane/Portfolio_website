import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowDown, ArrowUpRight, Github, Linkedin, Mail } from 'lucide-react';
import papers, { author as arxivAuthor } from 'virtual:arxiv-papers';
import AttentionMap from './components/AttentionMap';
import CommandPalette, { Command, OPEN_PALETTE_EVENT, SHORTCUT_LABEL } from './components/CommandPalette';
import TokenizedName from './components/TokenizedName';
import GithubActivity from './components/GithubActivity';
import Papers from './components/Papers';
import SectionHeader from './components/SectionHeader';
import TextReveal from './components/TextReveal';
import { GITHUB_CONFIG } from './config';
import { BIO, EDUCATION, EXPERIENCE, PROJECTS, SKILLS, SOCIALS } from './constants';

const NAV = [
  { id: 'research', label: 'research' },
  { id: 'experience', label: 'experience' },
  { id: 'projects', label: 'projects' },
  { id: 'stack', label: 'stack', desktopOnly: true },
  { id: 'activity', label: 'activity', desktopOnly: true },
  { id: 'contact', label: 'contact' },
];

const STACK = [
  { key: 'domains', items: SKILLS.filter((s) => s.category === 'Core') },
  { key: 'languages', items: SKILLS.filter((s) => s.category === 'Languages') },
  { key: 'frameworks', items: SKILLS.filter((s) => s.category === 'Frameworks') },
];

const arxivSearchUrl = `https://arxiv.org/search/?searchtype=author&query=${encodeURIComponent(arxivAuthor)}`;

const SocialIcon: React.FC<{ icon: string; size?: number }> = ({ icon, size = 16 }) =>
  icon === 'github' ? <Github size={size} /> : icon === 'linkedin' ? <Linkedin size={size} /> : <Mail size={size} />;

const externalProps = (url: string) => (url.startsWith('mailto:') ? {} : { target: '_blank', rel: 'noreferrer' });

/** Two-column row used by experience and education: mono date on the left, content on the right. */
const Row: React.FC<{ aside: React.ReactNode; children: React.ReactNode }> = ({ aside, children }) => (
  <article className="grid md:grid-cols-[140px_1fr] lg:grid-cols-[200px_1fr] xl:grid-cols-[240px_1fr] gap-x-10 xl:gap-x-16 gap-y-2 py-8 border-t border-line first:border-t-0 first:pt-0">
    <div className="font-mono text-xs text-muted">{aside}</div>
    <div className="min-w-0">{children}</div>
  </article>
);

/** Writes the pointer position into --mx/--my on the element, for CSS spotlight effects. */
const trackPointer = (e: React.PointerEvent<HTMLElement>) => {
  const r = e.currentTarget.getBoundingClientRect();
  e.currentTarget.style.setProperty('--mx', `${e.clientX - r.left}px`);
  e.currentTarget.style.setProperty('--my', `${e.clientY - r.top}px`);
};

// Scroll progress rendered as a training run: loss decays (with a little noise) as you read.
const lossAt = (p: number) => 2.31 * Math.exp(-3.6 * p) + 0.071 + 0.035 * Math.sin(p * 71) * (1 - p);

// Deferred so it runs after the command palette has closed and released the scroll lock.
const scrollToId = (id: string) =>
  setTimeout(() => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' }), 30);

const App: React.FC = () => {
  const [scrolled, setScrolled] = useState(false);
  const [progress, setProgress] = useState(0);
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const heroRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const onScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      setScrolled(window.scrollY > 8);
      setProgress(max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, []);

  // Highlight the nav link for the section currently in the middle of the viewport.
  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && setActiveSection(e.target.id)),
      { rootMargin: '-45% 0px -50% 0px' }
    );
    NAV.forEach((n) => {
      const el = document.getElementById(n.id);
      if (el) io.observe(el);
    });
    const top = new IntersectionObserver(([e]) => e.isIntersecting && setActiveSection(null), {
      rootMargin: '-45% 0px -50% 0px',
    });
    if (heroRef.current) top.observe(heroRef.current);
    return () => {
      io.disconnect();
      top.disconnect();
    };
  }, []);

  const commands = useMemo<Command[]>(
    () => [
      ...NAV.map((n, i) => ({
        id: `go-${n.id}`,
        group: 'Navigate',
        label: n.label[0].toUpperCase() + n.label.slice(1),
        hint: String(i + 1).padStart(2, '0'),
        run: () => {
          scrollToId(n.id);
        },
      })),
      ...papers.map((p) => ({
        id: `paper-${p.id}`,
        group: 'Papers',
        label: p.title,
        hint: p.id,
        run: () => void window.open(p.absUrl, '_blank', 'noopener'),
      })),
      ...PROJECTS.map((p, i) => ({
        id: `project-${i}`,
        group: 'Projects',
        label: p.title,
        hint: p.type.toLowerCase(),
        run: () => void window.open(p.link, '_blank', 'noopener'),
      })),
      {
        id: 'copy-email',
        group: 'Contact',
        label: 'Copy email address',
        hint: BIO.email,
        run: () => {
          navigator.clipboard?.writeText(BIO.email).catch(() => {});
          return 'email copied ✓';
        },
      },
      ...SOCIALS.map((s) => ({
        id: `social-${s.icon}`,
        group: 'Contact',
        label: s.icon === 'mail' ? 'Write an email' : `Open ${s.platform}`,
        run: () => (s.url.startsWith('mailto:') ? void (window.location.href = s.url) : void window.open(s.url, '_blank', 'noopener')),
      })),
      {
        id: 'arxiv',
        group: 'Contact',
        label: 'Open arXiv listing',
        run: () => void window.open(arxivSearchUrl, '_blank', 'noopener'),
      },
    ],
    []
  );

  const epoch = activeSection ? NAV.findIndex((n) => n.id === activeSection) + 1 : 0;

  return (
    <div className="min-h-screen">
      <CommandPalette commands={commands} />

      {/* Nav */}
      <nav
        className={`fixed inset-x-0 top-0 z-50 transition-colors duration-300 ${
          scrolled ? 'bg-bg/80 backdrop-blur-md border-b border-line' : 'border-b border-transparent'
        }`}
      >
        <div className="mx-auto w-full max-w-[100rem] px-5 sm:px-8 lg:px-12 xl:px-16 h-14 flex items-center justify-between gap-4">
          <div className="flex items-center gap-5 min-w-0">
            <a href="#top" className="font-mono text-sm text-ink hover:text-accent transition-colors whitespace-nowrap">
              <span className="text-accent">~/</span>
              <span className="hidden sm:inline">{BIO.name.toLowerCase().replace(/\s+/g, '-')}</span>
            </a>
            <span
              className={`hidden lg:inline font-mono text-[11px] text-faint tabular-nums whitespace-nowrap transition-opacity duration-300 ${
                scrolled ? 'opacity-100' : 'opacity-0'
              }`}
              aria-hidden="true"
            >
              epoch {String(epoch).padStart(2, '0')}/{String(NAV.length).padStart(2, '0')} · loss{' '}
              <span className="text-accent">{lossAt(progress).toFixed(3)}</span>
            </span>
          </div>
          <div className="flex items-center gap-4 sm:gap-6">
            <ul className="flex items-center gap-4 sm:gap-6 font-mono text-xs text-faint">
              {NAV.map((n) => (
                <li key={n.id} className={n.desktopOnly ? 'hidden md:block' : undefined}>
                  <a
                    href={`#${n.id}`}
                    aria-current={activeSection === n.id ? 'true' : undefined}
                    className={`relative transition-colors hover:text-ink ${activeSection === n.id ? 'text-ink' : ''}`}
                  >
                    {n.label}
                    <span
                      className={`absolute -bottom-[20px] left-0 right-0 h-px bg-accent transition-opacity ${
                        activeSection === n.id ? 'opacity-100' : 'opacity-0'
                      }`}
                    />
                  </a>
                </li>
              ))}
            </ul>
            <button
              type="button"
              onClick={() => window.dispatchEvent(new Event(OPEN_PALETTE_EVENT))}
              className="hidden md:inline-flex items-center gap-1 rounded border border-line px-1.5 py-0.5 font-mono text-[10px] text-faint hover:text-ink hover:border-faint/60 transition-colors"
              aria-label="Open command palette"
            >
              {SHORTCUT_LABEL}
            </button>
          </div>
        </div>
        {/* Training progress */}
        <div className="absolute inset-x-0 bottom-[-1px] h-px">
          <div className="h-full bg-accent/70 origin-left" style={{ transform: `scaleX(${progress})` }} />
        </div>
      </nav>

      <main id="top" className="mx-auto w-full max-w-[100rem] px-5 sm:px-8 lg:px-12 xl:px-16">
        {/* Hero */}
        <header
          ref={heroRef}
          onPointerMove={trackPointer}
          onPointerLeave={(e) => e.currentTarget.style.setProperty('--mx', '-999px')}
          className="relative isolate flex flex-col justify-center pt-28 pb-20 lg:min-h-[100svh] lg:pt-24 lg:pb-16"
        >
          <div className="absolute inset-0 -z-10 plot-grid" aria-hidden="true" />
          <div className="absolute inset-0 -z-10 plot-grid-hot" aria-hidden="true" />

          <div className="grid lg:grid-cols-12 gap-14 lg:gap-10 xl:gap-16 items-center">
            <div className="lg:col-span-7">
              <TextReveal>
                <div className="inline-flex items-center gap-2 font-mono text-xs text-muted">
                  <span className="relative flex size-2">
                    <span className="absolute inline-flex h-full w-full rounded-full bg-accent opacity-60 animate-ping" />
                    <span className="relative inline-flex size-2 rounded-full bg-accent" />
                  </span>
                  open to research collaborations
                </div>
              </TextReveal>

              <TextReveal delay={80}>
                <div className="mt-6">
                  <TokenizedName
                    name={BIO.name}
                    className="text-5xl sm:text-6xl md:text-7xl xl:text-8xl font-semibold tracking-[-0.045em] leading-[1.05] text-ink"
                  />
                </div>
              </TextReveal>

              <TextReveal delay={160}>
                <p className="mt-4 text-lg md:text-xl xl:text-2xl text-muted">{BIO.role}</p>
                <p className="mt-6 max-w-xl xl:max-w-2xl text-base xl:text-lg leading-relaxed text-muted">{BIO.summary}</p>
              </TextReveal>

              <TextReveal delay={240}>
                <dl className="mt-10 grid grid-cols-[88px_1fr] gap-y-2 font-mono text-xs">
                  <dt className="text-faint">focus</dt>
                  <dd className="text-ink">{BIO.focus.join(' · ')}</dd>
                  <dt className="text-faint">based</dt>
                  <dd className="text-ink">{BIO.location}</dd>
                  <dt className="text-faint">papers</dt>
                  <dd className="text-ink">
                    {papers.length} on arXiv
                    {papers[0] && <span className="text-faint"> · latest {papers[0].id}</span>}
                  </dd>
                </dl>
              </TextReveal>

              <TextReveal delay={320}>
                <div className="mt-10 flex flex-wrap items-center gap-3">
                  <a
                    href="#research"
                    className="inline-flex items-center gap-2 rounded-md bg-ink px-4 py-2 text-sm font-medium text-bg hover:bg-accent transition-colors"
                  >
                    Read the papers <ArrowDown size={14} />
                  </a>
                  {SOCIALS.map((s) => (
                    <a
                      key={s.platform}
                      href={s.url}
                      {...externalProps(s.url)}
                      aria-label={s.platform}
                      title={s.platform === 'Email' ? BIO.email : s.platform}
                      className="inline-flex size-9 items-center justify-center rounded-md border border-line text-muted hover:text-ink hover:border-faint transition-colors"
                    >
                      <SocialIcon icon={s.icon} />
                    </a>
                  ))}
                </div>
              </TextReveal>
            </div>

            <TextReveal delay={200} className="lg:col-span-5 lg:pl-8 xl:pl-12 lg:border-l lg:border-line">
              <AttentionMap />
            </TextReveal>
          </div>
        </header>

        {/* Research */}
        <section id="research" className="py-16 md:py-20">
          <TextReveal>
            <SectionHeader
              index="01"
              title="Research"
              meta={
                <a href={arxivSearchUrl} target="_blank" rel="noreferrer" className="hover:text-ink transition-colors">
                  arXiv ↗
                </a>
              }
            />
          </TextReveal>
          <TextReveal delay={80}>
            <Papers />
          </TextReveal>
        </section>

        {/* Experience & education */}
        <section id="experience" className="py-16 md:py-20">
          <TextReveal>
            <SectionHeader index="02" title="Experience" />
          </TextReveal>
          <TextReveal delay={80}>
            {EXPERIENCE.map((exp) => (
              <Row key={exp.role + exp.company} aside={exp.duration}>
                <h3 className="text-lg font-medium text-ink">
                  {exp.role} <span className="font-normal text-muted">· {exp.company}</span>
                </h3>
                <ul className="mt-3 space-y-2 text-sm leading-relaxed text-muted">
                  {exp.description.map((d) => (
                    <li key={d} className="flex gap-3">
                      <span className="font-mono text-faint">–</span>
                      <span>{d}</span>
                    </li>
                  ))}
                </ul>
                {exp.tech && <p className="mt-4 font-mono text-[11px] text-faint">{exp.tech.join(' · ')}</p>}
              </Row>
            ))}
          </TextReveal>

          <TextReveal>
            <h3 className="mt-16 mb-8 font-mono text-[11px] uppercase tracking-[0.2em] text-faint">Education</h3>
            {EDUCATION.map((edu) => (
              <Row key={edu.company} aside={edu.duration}>
                <h4 className="text-base font-medium text-ink">{edu.company}</h4>
                <p className="mt-1 text-sm text-muted">{edu.role}</p>
                <p className="mt-3 font-mono text-[11px] text-faint">{edu.description.join(' · ')}</p>
              </Row>
            ))}
          </TextReveal>
        </section>

        {/* Projects */}
        <section id="projects" className="py-16 md:py-20">
          <TextReveal>
            <SectionHeader index="03" title="Projects" />
          </TextReveal>
          <div className="grid gap-4 lg:gap-6 md:grid-cols-3">
            {PROJECTS.map((p, idx) => (
              <TextReveal key={p.title} delay={idx * 80} className="h-full">
                <a
                  href={p.link}
                  target="_blank"
                  rel="noreferrer"
                  onPointerMove={trackPointer}
                  className="glow-card group flex h-full flex-col rounded-lg border border-line bg-surface/40 p-6 hover:border-accent/40 hover:bg-surface transition-colors"
                >
                  <div className="flex items-center justify-between font-mono text-[11px] uppercase tracking-wider text-faint">
                    <span>{p.type}</span>
                    <ArrowUpRight
                      size={14}
                      className="group-hover:text-accent group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition-all"
                    />
                  </div>
                  <h3 className="mt-8 text-base font-medium text-ink group-hover:text-accent transition-colors">
                    {p.title}
                  </h3>
                  <p className="mt-2 flex-1 text-sm leading-relaxed text-muted">{p.description}</p>
                  <p className="mt-6 font-mono text-[11px] leading-relaxed text-faint">{p.tech.join(' · ')}</p>
                </a>
              </TextReveal>
            ))}
          </div>
        </section>

        {/* Stack */}
        <section id="stack" className="py-16 md:py-20">
          <TextReveal>
            <SectionHeader index="04" title="Stack" />
          </TextReveal>
          <TextReveal delay={80}>
            <div className="rounded-lg border border-line bg-surface/50 font-mono">
              <div className="flex items-center justify-between border-b border-line px-4 py-2.5 text-[11px] text-faint">
                <span>config/stack.yaml</span>
                <span>{SKILLS.length} entries</span>
              </div>
              <dl className="space-y-4 p-4 sm:p-6 text-[13px]">
                {STACK.map((g) => (
                  <div key={g.key} className="grid sm:grid-cols-[120px_1fr] gap-x-4 gap-y-1">
                    <dt className="text-accent">{g.key}:</dt>
                    <dd className="leading-7 text-ink">
                      <span className="text-faint">[</span>
                      {g.items.map((s, i) => (
                        <React.Fragment key={s.name}>
                          <span className="hover:text-accent transition-colors">{s.name}</span>
                          {i < g.items.length - 1 && <span className="text-faint">, </span>}
                        </React.Fragment>
                      ))}
                      <span className="text-faint">]</span>
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
          </TextReveal>
        </section>

        {/* Activity */}
        <section id="activity" className="py-16 md:py-20">
          <TextReveal>
            <SectionHeader
              index="05"
              title="Activity"
              meta={
                <a
                  href={`https://github.com/${GITHUB_CONFIG.USERNAME}`}
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-ink transition-colors"
                >
                  github ↗
                </a>
              }
            />
          </TextReveal>
          <TextReveal delay={80}>
            <GithubActivity />
          </TextReveal>
        </section>

        {/* Contact */}
        <section id="contact" className="py-24 md:py-32 border-t border-line">
          <TextReveal className="grid gap-10 lg:grid-cols-12 lg:items-end">
            <div className="lg:col-span-7">
            <p className="font-mono text-xs text-accent">06</p>
            <h2 className="mt-4 max-w-3xl text-3xl md:text-5xl xl:text-6xl font-semibold tracking-[-0.03em] leading-tight text-ink text-balance">
              Working on language models? Let’s talk.
            </h2>
            </div>
            <div className="lg:col-span-5 lg:justify-self-end lg:text-right">
            <a
              href={`mailto:${BIO.email}`}
              className="inline-flex items-center gap-2 text-lg xl:text-xl text-muted hover:text-accent underline decoration-line underline-offset-8 transition-colors break-all"
            >
              {BIO.email}
            </a>
            <div className="mt-8 flex flex-wrap gap-6 lg:justify-end font-mono text-xs text-faint">
              {SOCIALS.filter((s) => s.icon !== 'mail').map((s) => (
                <a key={s.platform} href={s.url} {...externalProps(s.url)} className="inline-flex items-center gap-2 hover:text-ink transition-colors">
                  <SocialIcon icon={s.icon} size={14} />
                  {s.platform}
                </a>
              ))}
              <a href={arxivSearchUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 hover:text-ink transition-colors">
                <span className="text-[13px] leading-none">χ</span>
                arXiv
              </a>
            </div>
            </div>
          </TextReveal>
        </section>
      </main>

      <footer className="border-t border-line">
        <div className="mx-auto w-full max-w-[100rem] px-5 sm:px-8 lg:px-12 xl:px-16 py-8 flex flex-col sm:flex-row justify-between gap-2 font-mono text-[11px] text-faint">
          <span>
            © {new Date().getFullYear()} {BIO.name}
          </span>
          <span>
            <span className="hidden md:inline">
              press <kbd className="text-muted">{SHORTCUT_LABEL}</kbd> to navigate ·{' '}
            </span>
            papers synced from arXiv at build time
          </span>
        </div>
      </footer>
    </div>
  );
};

export default App;
