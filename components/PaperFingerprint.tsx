import React, { useMemo } from 'react';

/**
 * A 48-d feature-hashed bag-of-words "embedding" of a paper's abstract
 * (the hashing trick: hash(word) picks a dimension and a sign). Each paper
 * gets a distinct, deterministic fingerprint.
 */

const DIMS = 48;
const STOP = new Set([
  'this', 'that', 'with', 'from', 'than', 'then', 'they', 'were', 'when', 'which', 'while', 'into', 'only',
  'have', 'been', 'does', 'more', 'also', 'each', 'over', 'under', 'given', 'used', 'whether', 'about',
]);

const fnv1a = (s: string) => {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619);
  return h >>> 0;
};

const embed =(text: string) => {
  const v = new Array(DIMS).fill(0);
  for (const w of text.toLowerCase().match(/[a-z][a-z0-9-]{3,}/g) ?? []) {
    if (STOP.has(w)) continue;
    const h = fnv1a(w);
    v[h % DIMS] += (h >>> 16) & 1 ? 1 : -1;
  }
  const norm = Math.hypot(...v) || 1;
  return v.map((x) => x / norm);
};

const PaperFingerprint: React.FC<{ text: string }> = ({ text }) => {
  const v = useMemo(() => embed(text), [text]);
  const max = Math.max(...v.map(Math.abs)) || 1;

  return (
    <div className="w-fit" title="Feature-hashed bag-of-words embedding of the abstract (48 dims). Orange = positive, grey = negative.">
      <div className="grid grid-cols-12 gap-[2px]" aria-hidden="true">
        {v.map((x, i) => {
          const a = 0.08 + 0.92 * (Math.abs(x) / max);
          return (
            <span
              key={i}
              className="size-2 rounded-[1px]"
              style={{ backgroundColor: x >= 0 ? `rgb(var(--accent-rgb) / ${a})` : `rgb(154 154 163 / ${a * 0.7})` }}
            />
          );
        })}
      </div>
      <div className="mt-1.5 text-[10px] text-faint">h(abstract) ∈ ℝ⁴⁸</div>
    </div>
  );
};

export default PaperFingerprint;
