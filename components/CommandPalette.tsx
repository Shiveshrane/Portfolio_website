import React, { useEffect, useMemo, useRef, useState } from 'react';
import { CornerDownLeft, Search } from 'lucide-react';

export interface Command {
  id: string;
  group: string;
  label: string;
  hint?: string;
  /** Return a short message to flash before closing (e.g. "copied"). */
  run: () => void | string;
}

export const OPEN_PALETTE_EVENT = 'open-command-palette';

export const SHORTCUT_LABEL =
  typeof navigator !== 'undefined' && /Mac|iPhone|iPad/.test(navigator.platform) ? '⌘K' : 'Ctrl K';

const matches = (cmd: Command, q: string) => {
  const hay = `${cmd.group} ${cmd.label} ${cmd.hint ?? ''}`.toLowerCase();
  return q
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean)
    .every((term) => hay.includes(term));
};

const CommandPalette: React.FC<{ commands: Command[] }> = ({ commands }) => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [active, setActive] = useState(0);
  const [flash, setFlash] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const restoreFocus = useRef<HTMLElement | null>(null);

  const results = useMemo(() => commands.filter((c) => matches(c, query)), [commands, query]);

  // Global shortcuts: ⌘K / Ctrl+K toggles, "/" opens, Esc closes.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const typing = e.target instanceof HTMLElement && /^(INPUT|TEXTAREA|SELECT)$/.test(e.target.tagName);
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setOpen((o) => !o);
      } else if (e.key === '/' && !typing && !open) {
        e.preventDefault();
        setOpen(true);
      }
    };
    const onOpen = () => setOpen(true);
    window.addEventListener('keydown', onKey);
    window.addEventListener(OPEN_PALETTE_EVENT, onOpen);
    return () => {
      window.removeEventListener('keydown', onKey);
      window.removeEventListener(OPEN_PALETTE_EVENT, onOpen);
    };
  }, [open]);

  useEffect(() => {
    if (open) {
      restoreFocus.current = document.activeElement as HTMLElement | null;
      setQuery('');
      setActive(0);
      setFlash(null);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
      restoreFocus.current?.focus?.();
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  useEffect(() => setActive(0), [query]);

  useEffect(() => {
    listRef.current?.querySelector(`[data-index="${active}"]`)?.scrollIntoView({ block: 'nearest' });
  }, [active]);

  const execute = (cmd: Command | undefined) => {
    if (!cmd) return;
    const msg = cmd.run();
    if (typeof msg === 'string') {
      setFlash(msg);
      setTimeout(() => setOpen(false), 700);
    } else {
      setOpen(false);
    }
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      setOpen(false);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActive((a) => Math.min(a + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActive((a) => Math.max(a - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      execute(results[active]);
    }
  };

  if (!open) return null;

  let lastGroup = '';

  return (
    <div
      className="fixed inset-0 z-[60] flex items-start justify-center bg-black/60 backdrop-blur-sm px-4 pt-[12vh]"
      onMouseDown={(e) => e.target === e.currentTarget && setOpen(false)}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Command palette"
        className="w-full max-w-lg overflow-hidden rounded-xl border border-line bg-surface shadow-2xl shadow-black/60"
        onKeyDown={onKeyDown}
      >
        <div className="flex items-center gap-3 border-b border-line px-4">
          <Search size={15} className="text-faint shrink-0" />
          <input
            ref={inputRef}
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Jump to a section, open a paper, copy email…"
            className="h-12 w-full bg-transparent text-sm text-ink placeholder:text-faint outline-none"
            role="combobox"
            aria-expanded="true"
            aria-controls="palette-list"
            aria-activedescendant={results[active] ? `cmd-${results[active].id}` : undefined}
          />
          <kbd className="font-mono text-[10px] text-faint border border-line rounded px-1.5 py-0.5">esc</kbd>
        </div>

        <ul ref={listRef} id="palette-list" role="listbox" className="max-h-[50vh] overflow-y-auto p-2">
          {results.length === 0 && <li className="px-3 py-6 text-center font-mono text-xs text-faint">no matches</li>}
          {results.map((cmd, i) => {
            const header = cmd.group !== lastGroup ? cmd.group : null;
            lastGroup = cmd.group;
            return (
              <React.Fragment key={cmd.id}>
                {header && (
                  <li role="presentation" className="px-3 pt-3 pb-1 font-mono text-[10px] uppercase tracking-[0.16em] text-faint">
                    {header}
                  </li>
                )}
                <li
                  id={`cmd-${cmd.id}`}
                  role="option"
                  aria-selected={i === active}
                  data-index={i}
                  onMouseMove={() => setActive(i)}
                  onClick={() => execute(cmd)}
                  className={`flex cursor-pointer items-center justify-between gap-4 rounded-md px-3 py-2 text-sm ${
                    i === active ? 'bg-line text-ink' : 'text-muted'
                  }`}
                >
                  <span className="truncate">{cmd.label}</span>
                  <span className="flex shrink-0 items-center gap-2 font-mono text-[11px] text-faint">
                    {cmd.hint}
                    {i === active && <CornerDownLeft size={12} className="text-accent" />}
                  </span>
                </li>
              </React.Fragment>
            );
          })}
        </ul>

        <div className="flex items-center justify-between border-t border-line px-4 py-2 font-mono text-[10px] text-faint">
          <span>{flash ? <span className="text-accent">{flash}</span> : '↑↓ navigate · ↵ select'}</span>
          <span>{SHORTCUT_LABEL}</span>
        </div>
      </div>
    </div>
  );
};

export default CommandPalette;
