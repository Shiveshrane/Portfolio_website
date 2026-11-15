import React, { useEffect, useMemo, useState } from 'react';

/**
 * The hero name, "generated" one token at a time like an LM decoding step,
 * with a live top-3 readout. After decoding, hovering reveals token
 * boundaries and ids, tokenizer-playground style.
 * Tokenization, ids and probabilities are illustrative and deterministic.
 */

const hash = (s: string) => {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619);
  return h >>> 0;
};
const rand = (seed: string) => (hash(seed) % 10000) / 10000;

// Cheap BPE look-alike: split words into 2-3 char pieces, never leaving a single char behind;
// words after the first carry their leading space, as in GPT-style vocabularies.
const tokenize = (text: string) => {
  const sizes = [2, 3, 3, 2];
  const out: string[] = [];
  text
    .trim()
    .split(/\s+/)
    .forEach((word, wi) => {
      let rest = word;
      let k = 0;
      while (rest) {
        let n = rest.length <= 3 ? rest.length : sizes[(k + wi) % sizes.length];
        if (rest.length - n === 1) n = rest.length;
        out.push((k === 0 && wi > 0 ? ' ' : '') + rest.slice(0, n));
        rest = rest.slice(n);
        k++;
      }
    });
  return out;
};

const DISTRACTORS = ['an', 'er', 'ia', 'os', 'ell', 'ul', 'ar', 'ith', 'on', 'ra', 'ev', 'is', ' M', ' K', 'ash'];

const candidatesFor = (token: string, step: number) => {
  const p = 0.58 + 0.38 * rand(token + step);
  const d1 = DISTRACTORS[hash(token + 'a' + step) % DISTRACTORS.length];
  let d2 = DISTRACTORS[hash(token + 'b' + step) % DISTRACTORS.length];
  if (d2 === d1) d2 = DISTRACTORS[(hash(token + 'b' + step) + 1) % DISTRACTORS.length];
  const r = 1 - p;
  return [
    { t: token, p },
    { t: d1, p: r * 0.68 },
    { t: d2, p: r * 0.32 },
  ];
};

const show = (t: string) => JSON.stringify(t);

const TokenizedName: React.FC<{ name: string; className?: string }> = ({ name, className = '' }) => {
  const tokens = useMemo(() => tokenize(name), [name]);
  const ids = useMemo(() => tokens.map((t) => 1000 + (hash(t) % 98000)), [tokens]);
  const n = tokens.length;
  const [step, setStep] = useState(0);
  const [hovered, setHovered] = useState(false);
  const [pinned, setPinned] = useState(false);
  const hover = hovered || pinned;
  const decoding = step < n;
  const canHover = useMemo(() => window.matchMedia('(hover: hover)').matches, []);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setStep(n);
      return;
    }
    setStep(0);
    let i = 0;
    let timer: ReturnType<typeof setTimeout>;
    const tick = () => {
      i++;
      setStep(i);
      if (i < n) timer = setTimeout(tick, 320);
    };
    timer = setTimeout(tick, 650);
    return () => clearTimeout(timer);
  }, [n]);

  return (
    <div
      onPointerEnter={(e) => e.pointerType === 'mouse' && setHovered(true)}
      onPointerLeave={(e) => e.pointerType === 'mouse' && setHovered(false)}
      onClick={() => !canHover && setPinned((p) => !p)}
    >
      <h1 aria-label={name} className={className}>
        {tokens.map((t, i) => (
          <span
            key={i}
            aria-hidden="true"
            className={`relative whitespace-pre rounded-[0.06em] transition-[opacity,filter,background-color] duration-300 ${
              i < step ? 'opacity-100 blur-0' : 'opacity-0 blur-sm'
            } ${hover && !decoding ? (i % 2 ? 'bg-accent/[0.16]' : 'bg-accent/[0.08]') : ''}`}
          >
            {t}
            {decoding && i === step - 1 && (
              <span className="absolute -right-[0.1em] top-[0.14em] h-[0.74em] w-[0.06em] bg-accent animate-pulse" />
            )}
          </span>
        ))}
      </h1>

      <div className="mt-4 h-4 font-mono text-[11px] text-faint whitespace-nowrap overflow-hidden text-ellipsis" aria-hidden="true">
        {decoding ? (
          <>
            <span className="text-muted">t={step}</span>
            {candidatesFor(tokens[step], step).map((c, i) => (
              <span key={i}>
                {'  '}
                <span className={i === 0 ? 'text-accent' : undefined}>{show(c.t)}</span> {c.p.toFixed(2)}
              </span>
            ))}
          </>
        ) : hover ? (
          tokens.map((t, i) => (
            <span key={i}>
              {i > 0 && <span className="text-line"> · </span>}
              {show(t)}
              <span className="text-accent"> {ids[i]}</span>
            </span>
          ))
        ) : (
          <>
            {n} tokens · <span className="text-muted">{canHover ? 'hover' : 'tap'} to inspect</span>
          </>
        )}
      </div>
    </div>
  );
};

export default TokenizedName;
