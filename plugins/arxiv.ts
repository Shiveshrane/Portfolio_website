import fs from 'fs';
import path from 'path';
import type { Plugin } from 'vite';

/**
 * Build-time arXiv sync.
 *
 * arXiv's API does not send CORS headers, so the browser cannot query it
 * directly. Instead this plugin queries arXiv when Vite starts (dev) or builds,
 * and exposes the result as the virtual module `virtual:arxiv-papers`.
 *
 * Every successful fetch is written to `data/arxiv-papers.json`. If arXiv is
 * unreachable, that snapshot is used, so builds never fail because of arXiv.
 */

export interface ArxivPaper {
  id: string;            // e.g. "2611.07610"
  version: string;       // e.g. "v1"
  title: string;
  summary: string;
  authors: string[];
  published: string;     // ISO date
  updated: string;       // ISO date
  primaryCategory: string;
  categories: string[];
  absUrl: string;
  pdfUrl: string;
}

interface Options {
  /** Exact author name to search for, e.g. "Jane Doe". */
  author: string;
  /** Optional explicit arXiv ids. When set, these are fetched instead of the author search. */
  ids?: string[];
  /** Where the last successful result is cached. */
  snapshotPath: string;
  maxResults?: number;
}

const VIRTUAL_ID = 'virtual:arxiv-papers';
const RESOLVED_ID = '\0' + VIRTUAL_ID;

const decode = (s: string) =>
  s
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)))
    .replace(/&amp;/g, '&');

const clean = (s: string) => decode(s).replace(/\s+/g, ' ').trim();

const tag = (xml: string, name: string) => {
  const m = xml.match(new RegExp(`<${name}[^>]*>([\\s\\S]*?)</${name}>`));
  return m ? clean(m[1]) : '';
};

export function parseArxivFeed(xml: string): ArxivPaper[] {
  const entries = xml.split('<entry>').slice(1).map((e) => e.split('</entry>')[0]);

  return entries
    .map((entry) => {
      const rawId = tag(entry, 'id'); // http://arxiv.org/abs/2611.07610v1
      const idMatch = rawId.match(/abs\/(.+?)(v\d+)?$/);
      const id = idMatch ? idMatch[1] : rawId;
      const version = idMatch?.[2] ?? '';

      const authors = [...entry.matchAll(/<author>\s*<name>([\s\S]*?)<\/name>/g)].map((m) => clean(m[1]));
      const categories = [...entry.matchAll(/<category[^>]*term="([^"]+)"/g)].map((m) => m[1]);
      const primary = entry.match(/<arxiv:primary_category[^>]*term="([^"]+)"/)?.[1] ?? categories[0] ?? '';

      return {
        id,
        version,
        title: tag(entry, 'title'),
        summary: tag(entry, 'summary'),
        authors,
        published: tag(entry, 'published'),
        updated: tag(entry, 'updated'),
        primaryCategory: primary,
        categories: [primary, ...categories.filter((c) => c !== primary)],
        absUrl: `https://arxiv.org/abs/${id}`,
        pdfUrl: `https://arxiv.org/pdf/${id}`,
      } satisfies ArxivPaper;
    })
    .filter((p) => p.title)
    .sort((a, b) => b.published.localeCompare(a.published));
}

async function fetchPapers({ author, ids, maxResults = 50 }: Options): Promise<ArxivPaper[]> {
  const params = new URLSearchParams({ max_results: String(maxResults) });
  if (ids && ids.length) params.set('id_list', ids.join(','));
  else params.set('search_query', `au:"${author}"`);

  const res = await fetch(`https://export.arxiv.org/api/query?${params}`, {
    signal: AbortSignal.timeout(10_000),
  });
  if (!res.ok) throw new Error(`arXiv responded ${res.status}`);

  const papers = parseArxivFeed(await res.text());
  // Author search is by exact name; keep only entries where the name really appears.
  if (!ids?.length) {
    const needle = author.toLowerCase();
    return papers.filter((p) => p.authors.some((a) => a.toLowerCase() === needle));
  }
  return papers;
}

function readSnapshot(file: string): ArxivPaper[] {
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch {
    return [];
  }
}

export default function arxivPapers(options: Options): Plugin {
  let cache: Promise<ArxivPaper[]> | null = null;

  const load = async () => {
    try {
      const papers = await fetchPapers(options);
      const next = JSON.stringify(papers, null, 2) + '\n';
      const prev = fs.existsSync(options.snapshotPath) ? fs.readFileSync(options.snapshotPath, 'utf8') : '';
      if (next !== prev) {
        fs.mkdirSync(path.dirname(options.snapshotPath), { recursive: true });
        fs.writeFileSync(options.snapshotPath, next);
      }
      console.log(`[arxiv] synced ${papers.length} paper(s) for "${options.author}"`);
      return papers;
    } catch (err) {
      const fallback = readSnapshot(options.snapshotPath);
      console.warn(`[arxiv] fetch failed (${(err as Error).message}); using snapshot with ${fallback.length} paper(s)`);
      return fallback;
    }
  };

  return {
    name: 'arxiv-papers',
    resolveId(id) {
      if (id === VIRTUAL_ID) return RESOLVED_ID;
    },
    async load(id) {
      if (id !== RESOLVED_ID) return;
      cache ??= load();
      return [
        `export const author = ${JSON.stringify(options.author)};`,
        `export default ${JSON.stringify(await cache)};`,
      ].join('\n');
    },
  };
}
