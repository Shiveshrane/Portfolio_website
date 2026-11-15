import React from 'react';

interface SectionHeaderProps {
  index: string;
  title: string;
  meta?: React.ReactNode;
}

const SectionHeader: React.FC<SectionHeaderProps> = ({ index, title, meta }) => (
  <div className="flex items-center gap-4 mb-10">
    <span className="font-mono text-xs text-accent tabular-nums">{index}</span>
    <h2 className="font-mono text-xs uppercase tracking-[0.2em] text-ink">{title}</h2>
    <span className="flex-1 h-px bg-line" aria-hidden="true" />
    {meta && <span className="font-mono text-xs text-faint">{meta}</span>}
  </div>
);

export default SectionHeader;
