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
      "bg-rose-500/15 text-rose-400 border-rose-500/30 shadow-[0_0_12px_rgba(244,63,94,0.15)]",
    NEW: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
    CHANGED: "bg-sky-500/15 text-sky-400 border-sky-500/30",
    DEPRECATED: "bg-amber-500/15 text-amber-400 border-amber-500/30",
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
    GET: "text-sky-400 bg-sky-500/10 border-sky-500/20",
    POST: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
    PUT: "text-indigo-400 bg-indigo-500/10 border-indigo-500/20",
    PATCH: "text-amber-400 bg-amber-500/10 border-amber-500/20",
    DELETE: "text-rose-400 bg-rose-500/10 border-rose-500/20",
  };

  return (
    <span className="inline-flex items-center gap-1.5 font-mono text-xs">
      {method && (
        <span
          className={cn(
            "rounded border px-1.5 py-0.5 text-[10px] font-bold",
            methodColors[method] || "text-zinc-300 bg-zinc-800 border-zinc-700"
          )}
        >
          {method}
        </span>
      )}
      <code className="rounded bg-zinc-900/90 border border-zinc-800 px-2 py-0.5 text-zinc-200">
        {routePath}
      </code>
    </span>
  );
}
