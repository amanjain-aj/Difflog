import * as React from "react";
import { cn } from "@/lib/utils";
import { ChangeTag } from "@/lib/db/types";

export function SemanticTagBadge({
  tag,
  className,
}: {
  tag: ChangeTag;
  className?: string;
}) {
  const styles: Record<ChangeTag, string> = {
    BREAKING:
      "bg-rose-500/15 text-rose-700 border-rose-500/35 dark:text-rose-400 dark:border-rose-500/30 shadow-[0_0_12px_rgba(244,63,94,0.12)]",
    NEW: "bg-emerald-500/15 text-emerald-700 border-emerald-500/35 dark:text-emerald-400 dark:border-emerald-500/30",
    CHANGED:
      "bg-sky-500/15 text-sky-700 border-sky-500/35 dark:text-sky-400 dark:border-sky-500/30",
    DEPRECATED:
      "bg-amber-500/15 text-amber-800 border-amber-500/35 dark:text-amber-400 dark:border-amber-500/30",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md border px-2 py-0.5 text-[11px] font-mono font-semibold tracking-wider uppercase",
        styles[tag] || styles.CHANGED,
        className
      )}
    >
      [{tag}]
    </span>
  );
}

export function EndpointPill({ endpoint }: { endpoint: string }) {
  const parts = endpoint.trim().split(/\s+/);
  const hasMethod =
    parts.length >= 2 &&
    ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS", "HEAD"].includes(
      parts[0].toUpperCase()
    );
  const method = hasMethod ? parts[0].toUpperCase() : null;
  const routePath = hasMethod ? parts.slice(1).join(" ") : endpoint;

  const methodColors: Record<string, string> = {
    GET: "text-sky-700 bg-sky-500/10 border-sky-500/30 dark:text-sky-400 dark:border-sky-500/20",
    POST: "text-emerald-700 bg-emerald-500/10 border-emerald-500/30 dark:text-emerald-400 dark:border-emerald-500/20",
    PUT: "text-indigo-700 bg-indigo-500/10 border-indigo-500/30 dark:text-indigo-400 dark:border-indigo-500/20",
    PATCH:
      "text-amber-700 bg-amber-500/10 border-amber-500/30 dark:text-amber-400 dark:border-amber-500/20",
    DELETE:
      "text-rose-700 bg-rose-500/10 border-rose-500/30 dark:text-rose-400 dark:border-rose-500/20",
  };

  return (
    <span className="inline-flex items-center gap-1.5 font-mono text-xs">
      {method && (
        <span
          className={cn(
            "rounded border px-1.5 py-0.5 text-[10px] font-bold",
            methodColors[method] ||
              "text-zinc-700 bg-zinc-200 border-zinc-300 dark:text-zinc-300 dark:bg-zinc-800 dark:border-zinc-700"
          )}
        >
          {method}
        </span>
      )}
      <code className="rounded bg-zinc-100 border border-zinc-200 px-2 py-0.5 text-zinc-800 dark:bg-zinc-900/90 dark:border-zinc-800 dark:text-zinc-200">
        {routePath}
      </code>
    </span>
  );
}
