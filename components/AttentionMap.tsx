import React, { useEffect, useMemo, useRef, useState } from 'react';

/**
 * A small, interactive causal self-attention heatmap.
 * The weights are illustrative (hand-shaped logits + seeded noise, then a real
 * causal softmax), and each head mimics a pattern seen in trained transformers.
 */

const TOKENS = ['<s>', 'teach', 'machines', 'to', 'read', 'between', 'the', 'lines'];

type Head = { id: string; label: string; logit: (i: number, j: number) => number };

// Deterministic pseudo-random noise in [0, 1)
const noise = (i: number, j: number, h: number) => {
  const x = Math.sin(i * 12.9898 + j * 78.233 + h * 37.719) * 43758.5453;
  return x - Math.floor(x);
};

// Content affinities for the "semantic" head: [query, key, strength]
const AFFINITY: [number, number, number][] = [
  [2, 1, 2.6], // machines -> teach
  [3, 1, 1.6], // to -> teach
  [4, 2, 2.4], // read -> machines
  [5, 4, 2.2], // between -> read
  [6, 5, 2.0], // the -> between
  [7, 4, 2.8], // lines -> read
  [7, 5, 1.8], // lines -> between
];

const HEADS: Head[] = [
  {
    id: 'L2.H4',
    label: 'prev-token',
    logit: (i, j) => (j === i - 1 ? 3.2 : j === i ? 1.2 : 0) + noise(i, j, 1) * 0.6,
  },
  {
    id: 'L5.H1',
    label: 'sink',
    logit: (i, j) => (j === 0 ? 2.6 : j === i ? 0.9 : 0) + noise(i, j, 2) * 0.7,
  },
  {
    id: 'L9.H7',
    label: 'content',
    logit: (i, j) =>
      (AFFINITY.find(([q, k]) => q === i && k === j)?.[2] ?? 0) + (j === i ? 0.6 : 0) + noise(i, j, 3) * 0.8,
  },
];

const causalSoftmax = (head: Head) =>
  TOKENS.map((_, i) => {
    const logits = TOKENS.map((__, j) => (j <= i ? head.logit(i, j) : -Infinity));
    const max = Math.max(...logits.filter(Number.isFinite));
    const exps = logits.map((l) => (Number.isFinite(l) ? Math.exp(l - max) : 0));
    const sum = exps.reduce((a, b) => a + b, 0);
    return exps.map((e) => e / sum);
  });

const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const AttentionMap: React.FC = () => {
  const [headIdx, setHeadIdx] = useState(0);
  const [hover, setHover] = useState<{ i: number; j: number | null } | null>(null);
  const [revealed, setRevealed] = useState(0);
  const [userTookOver, setUserTookOver] = useState(false);
  const ref = useRef<HTMLElement>(null);

  const weights = useMemo(() => HEADS.map(causalSoftmax), []);
  const w = weights[headIdx];
  const n = TOKENS.length;

  // Reveal rows one at a time, like autoregressive decoding, once in view.
  useEffect(() => {
    if (prefersReducedMotion()) {
      setRevealed(n);
      return;
    }
    let timer: ReturnType<typeof setInterval> | undefined;
    const io = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      io.disconnect();
      timer = setInterval(() => {
        setRevealed((r) => {
          if (r >= n) {
            clearInterval(timer);
            return r;
          }
          return r + 1;
        });
      }, 130);
    });
    if (ref.current) io.observe(ref.current);
    return () => {
      io.disconnect();
      if (timer) clearInterval(timer);
    };
  }, [n]);

  // Gently cycle heads until the visitor interacts.
  useEffect(() => {
    if (userTookOver || revealed < n || prefersReducedMotion()) return;
    const t = setInterval(() => setHeadIdx((h) => (h + 1) % HEADS.length), 4200);
    return () => clearInterval(t);
  }, [userTookOver, revealed, n]);

  const takeOver = () => setUserTookOver(true);

  // Hovering a query label selects that row's argmax key.
  const activeCol = hover ? (hover.j ?? w[hover.i].indexOf(Math.max(...w[hover.i]))) : null;
  const readout =
    hover && activeCol !== null
      ? { q: TOKENS[hover.i], k: TOKENS[activeCol], v: w[hover.i][activeCol], argmax: hover.j === null }
      : null;

  return (
    <figure
      ref={ref}
      className="select-none"
      onPointerEnter={takeOver}
      onFocus={takeOver}
      aria-label={`Illustrative causal self-attention heatmap over the sentence "${TOKENS.slice(1).join(' ')}", head ${HEADS[headIdx].label}`}
    >
      {/* Head selector */}
      <div className="flex flex-wrap gap-1 mb-5 font-mono text-[11px]" role="group" aria-label="Attention head">
        {HEADS.map((h, idx) => (
          <button
            key={h.id}
            type="button"
            aria-pressed={idx === headIdx}
            onClick={() => {
              takeOver();
              setHeadIdx(idx);
            }}
            className={`px-2 py-1 rounded border transition-colors ${
              idx === headIdx
                ? 'border-accent/50 text-accent bg-accent/[0.07]'
                : 'border-line text-faint hover:text-muted hover:border-faint/50'
            }`}
          >
            {h.label}
          </button>
        ))}
      </div>

      <div className="inline-grid gap-[3px]" style={{ gridTemplateColumns: `auto repeat(${n}, minmax(0, 1fr))` }}>
        {/* Column (key) labels */}
        <div />
        {TOKENS.map((t, j) => (
          <div
            key={`k-${j}`}
            className={`h-16 flex items-end justify-center pb-1 font-mono text-[10px] transition-colors ${
              activeCol === j ? 'text-accent' : 'text-faint'
            }`}
          >
            <span style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}>{t}</span>
          </div>
        ))}

        {/* Rows */}
        {TOKENS.map((qt, i) => (
          <React.Fragment key={`r-${i}`}>
            <div
              className={`pr-2 flex items-center justify-end font-mono text-[10px] transition-colors cursor-default ${
                hover?.i === i ? 'text-accent' : 'text-faint'
              }`}
              onPointerEnter={() => setHover({ i, j: null })}
              onPointerLeave={() => setHover(null)}
            >
              {qt}
            </div>
            {TOKENS.map((_, j) => {
              const masked = j > i;
              const visible = i < revealed;
              const v = w[i][j];
              const isHover = hover?.i === i && hover?.j === j;
              return (
                <div
                  key={`c-${i}-${j}`}
                  onPointerEnter={() => !masked && setHover({ i, j })}
                  onPointerLeave={() => setHover(null)}
                  className={`size-6 sm:size-7 rounded-[3px] flex items-center justify-center transition-[background-color,box-shadow] duration-500 ${
                    masked ? '' : 'cursor-crosshair'
                  } ${isHover ? 'ring-1 ring-ink/70' : ''} ${hover && hover.i !== i && !masked ? 'opacity-60' : ''}`}
                  style={{
                    backgroundColor: masked
                      ? 'transparent'
                      : `rgb(var(--accent-rgb) / ${visible ? 0.05 + 0.95 * Math.pow(v, 0.8) : 0.03})`,
                  }}
                >
                  {masked && <span className="w-[3px] h-[3px] rounded-full bg-line" />}
                </div>
              );
            })}
          </React.Fragment>
        ))}
      </div>

      <figcaption className="mt-5 font-mono text-[11px] leading-relaxed text-faint min-h-[2.5rem]">
        {readout ? (
          <span className="text-muted">
            attn(<span className="text-ink">"{readout.q}"</span> → <span className="text-ink">"{readout.k}"</span>) ={' '}
            <span className="text-accent">{readout.v.toFixed(3)}</span>
            {readout.argmax && <span className="text-faint"> · argmax</span>}
          </span>
        ) : (
          <>
            fig. 1 — causal self-attention, {HEADS[headIdx].id} ({HEADS[headIdx].label}).
            <br />
            Illustrative weights · hover a cell.
          </>
        )}
      </figcaption>
    </figure>
  );
};

export default AttentionMap;
