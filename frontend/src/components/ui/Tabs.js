"use client";

import { useRef } from "react";
import { cn } from "@/lib/cn";

export const tabId = (group, value) => `${group}-tab-${value}`;
export const panelId = (group, value) => `${group}-panel-${value}`;

/** Accessible tab list. Render the matching content with <TabPanel>. */
export default function Tabs({ id, label, tabs, value, onChange, className }) {
  const refs = useRef({});

  const handleKeyDown = (event) => {
    const index = tabs.findIndex((tab) => tab.value === value);
    const moves = { ArrowRight: index + 1, ArrowLeft: index - 1, Home: 0, End: tabs.length - 1 };
    if (!(event.key in moves)) return;

    event.preventDefault();
    const next = tabs[(moves[event.key] + tabs.length) % tabs.length];
    onChange(next.value);
    refs.current[next.value]?.focus();
  };

  return (
    <div
      role="tablist"
      aria-label={label}
      onKeyDown={handleKeyDown}
      className={cn("inline-flex max-w-full rounded-xl bg-subtle p-1", className)}
    >
      {tabs.map((tab) => {
        const selected = tab.value === value;
        return (
          <button
            key={tab.value}
            ref={(node) => {
              refs.current[tab.value] = node;
            }}
            type="button"
            role="tab"
            id={tabId(id, tab.value)}
            aria-selected={selected}
            aria-controls={panelId(id, tab.value)}
            tabIndex={selected ? 0 : -1}
            onClick={() => onChange(tab.value)}
            className={cn(
              "min-h-10 flex-1 whitespace-nowrap rounded-lg px-4 text-sm font-medium transition-colors",
              selected ? "bg-surface text-ink shadow-card" : "text-ink-muted hover:text-ink"
            )}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}

export function TabPanel({ group, value, className, children }) {
  return (
    <div
      role="tabpanel"
      id={panelId(group, value)}
      aria-labelledby={tabId(group, value)}
      className={className}
    >
      {children}
    </div>
  );
}
