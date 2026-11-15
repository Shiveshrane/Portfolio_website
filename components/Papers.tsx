import React from 'react';
import { ArrowUpRight } from 'lucide-react';
import papers, { author } from 'virtual:arxiv-papers';
import PaperFingerprint from './PaperFingerprint';

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString('en-US', { year: 'numeric', month: 'short', timeZone: 'UTC' });

const Authors: React.FC<{ names: string[] }> = ({ names }) => (
  <p className="text-sm text-muted">
    {names.map((name, i) => (
      <React.Fragment key={name + i}>
        {i > 0 && ', '}
        <span className={name.toLowerCase() === author.toLowerCase() ? 'text-ink' : undefined}>{name}</span>
      </React.Fragment>
    ))}
  </p>
);

const Papers: React.FC = () => {
  if (!papers.length) {
    return (
      <p className="font-mono text-sm text-faint">
        No preprints yet. Papers posted to arXiv under “{author}” appear here automatically.
      </p>
    );
  }

  return (
    <div>
      {papers.map((p) => (
        <article
          key={p.id}
          className="grid md:grid-cols-[140px_1fr] gap-x-10 gap-y-3 py-8 border-t border-line first:border-t-0 first:pt-0"
        >
          <div className="font-mono text-xs text-faint flex md:block items-start justify-between gap-4">
            <div className="space-y-1">
              <div className="text-muted">{formatDate(p.published)}</div>
              <div>arXiv:{p.id}</div>
            </div>
            <div className="md:pt-4">
              <PaperFingerprint text={p.title + ' ' + p.summary} />
            </div>
          </div>

          <div className="min-w-0">
            <a
              href={p.absUrl}
              target="_blank"
              rel="noreferrer"
              className="group inline text-lg md:text-xl font-medium leading-snug text-ink hover:text-accent transition-colors text-balance"
            >
              {p.title}
              <ArrowUpRight
                size={16}
                className="inline-block ml-1 -mt-1 text-faint group-hover:text-accent group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition-all"
              />
            </a>

            <div className="mt-2">
              <Authors names={p.authors} />
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 font-mono text-[11px]">
              <div className="flex flex-wrap gap-1.5">
                {p.categories.map((c, i) => (
                  <span
                    key={c}
                    className={`px-1.5 py-0.5 rounded border ${
                      i === 0 ? 'border-accent/40 text-accent' : 'border-line text-faint'
                    }`}
                  >
                    {c}
                  </span>
                ))}
              </div>
              <span className="text-line" aria-hidden="true">/</span>
              <a href={p.absUrl} target="_blank" rel="noreferrer" className="text-muted hover:text-ink transition-colors">
                abs
              </a>
              <a href={p.pdfUrl} target="_blank" rel="noreferrer" className="text-muted hover:text-ink transition-colors">
                pdf
              </a>
            </div>

            <details className="group/abs mt-5">
              <summary className="inline-flex items-center gap-2 cursor-pointer font-mono text-xs text-faint hover:text-ink transition-colors">
                <span className="w-3 text-center group-open/abs:hidden">+</span>
                <span className="w-3 text-center hidden group-open/abs:inline">−</span>
                abstract
              </summary>
              <p className="mt-3 max-w-prose text-sm leading-relaxed text-muted">{p.summary}</p>
            </details>
          </div>
        </article>
      ))}
    </div>
  );
};

export default Papers;
