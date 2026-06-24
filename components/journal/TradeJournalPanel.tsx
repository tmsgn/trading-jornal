"use client";

import React, { useEffect, useState, useCallback } from "react";
import {
  ArrowDown,
  ArrowUp,
  Clock,
  Save,
  Tag,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { RichTextEditor } from "./RichTextEditor";
import type { Trade } from "@/lib/data";
import { getPlaybooksAction } from "@/app/actions/playbooks";

interface TradeJournalPanelProps {
  trade: Trade;
  onSave: (updatedTrade: Trade) => Promise<void>;
  onClose: () => void;
}

export function TradeJournalPanel({
  trade,
  onSave,
  onClose,
}: TradeJournalPanelProps) {
  const [notes, setNotes] = useState(trade.notes || "");
  const [playbook, setPlaybook] = useState(trade.playbook || "");
  const [isSaving, setIsSaving] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [playbooks, setPlaybooks] = useState<{ id: string; name: string }[]>(
    [],
  );

  // Fetch playbooks
  useEffect(() => {
    getPlaybooksAction()
      .then((pbs) => setPlaybooks(pbs as { id: string; name: string }[]))
      .catch(() => {});
  }, []);

  // Reset when trade changes
  useEffect(() => {
    setNotes(trade.notes || "");
    setPlaybook(trade.playbook || "");
    setIsDirty(false);
  }, [trade.id, trade.notes, trade.playbook]);

  const handleNotesChange = useCallback(
    (html: string) => {
      setNotes(html);
      setIsDirty(true);
    },
    [],
  );

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSave({
        ...trade,
        notes,
        playbook,
        playbookId: playbooks.find((p) => p.name === playbook)?.id || trade.playbookId,
        hasNote: !!notes && notes !== "<p></p>",
      });
      setIsDirty(false);
      toast.success("Trade journal saved");
    } catch {
      toast.error("Failed to save");
    } finally {
      setIsSaving(false);
    }
  };

  const isLong = trade.side === "Long";
  const isProfit = trade.netPnl >= 0;

  return (
    <div className="flex flex-col h-full">
      {/* ── Header ──────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-[var(--tz-border-subtle)]">
        <div className="flex items-center gap-3">
          <div
            className={`w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold ${
              isLong ? "bg-emerald-500" : "bg-red-500"
            }`}
          >
            {isLong ? <ArrowUp size={14} /> : <ArrowDown size={14} />}
          </div>
          <div>
            <h3 className="text-sm font-bold text-[var(--tz-text-primary)]">
              {trade.symbol}{" "}
              <span className={isLong ? "text-emerald-500" : "text-red-500"}>
                {trade.side}
              </span>
            </h3>
            <p className="text-[11px] text-[var(--tz-text-muted)]">
              {trade.date} at {trade.time}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {isDirty && (
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-[var(--tz-accent)] hover:opacity-90 transition-all disabled:opacity-50"
            >
              <Save size={12} />
              {isSaving ? "Saving..." : "Save"}
            </button>
          )}
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[var(--tz-text-muted)] hover:bg-[var(--tz-hover-bg)] hover:text-[var(--tz-text-primary)] transition-colors"
          >
            <X size={14} />
          </button>
        </div>
      </div>

      {/* ── Trade Metrics Strip ──────────────────────────────────────────── */}
      <div className="grid grid-cols-4 gap-3 px-5 py-3 border-b border-[var(--tz-border-subtle)]">
        {[
          {
            label: "Entry",
            value: `$${trade.entry.toFixed(2)}`,
          },
          {
            label: "Exit",
            value: trade.exit ? `$${trade.exit.toFixed(2)}` : "Open",
          },
          {
            label: "Net P&L",
            value: `${isProfit ? "+" : ""}$${trade.netPnl.toFixed(2)}`,
            color: isProfit ? "text-emerald-500" : "text-red-500",
          },
          {
            label: "R:R",
            value: `${trade.rr.toFixed(1)}R`,
          },
        ].map((metric) => (
          <div key={metric.label}>
            <p className="text-[10px] font-medium text-[var(--tz-text-muted)] uppercase tracking-wider">
              {metric.label}
            </p>
            <p
              className={`text-sm font-bold ${metric.color || "text-[var(--tz-text-primary)]"}`}
            >
              {metric.value}
            </p>
          </div>
        ))}
      </div>

      {/* ── Playbook Selector ────────────────────────────────────────────── */}
      <div className="px-5 py-3 border-b border-[var(--tz-border-subtle)]">
        <div className="flex items-center gap-2">
          <Tag size={13} className="text-[var(--tz-text-muted)]" />
          <label className="text-[10px] font-bold text-[var(--tz-text-muted)] uppercase tracking-wider">
            Playbook
          </label>
        </div>
        <select
          value={playbook}
          onChange={(e) => {
            setPlaybook(e.target.value);
            setIsDirty(true);
          }}
          className="mt-1.5 w-full h-8 px-2 rounded-lg border border-[var(--tz-border)] bg-[var(--tz-bg-card)] text-xs font-semibold text-[var(--tz-text-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--tz-accent)]"
        >
          <option value="">No playbook</option>
          {playbooks.map((pb) => (
            <option key={pb.id} value={pb.name}>
              {pb.name}
            </option>
          ))}
        </select>
      </div>

      {/* ── Rich Text Editor ─────────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto px-5 py-3">
        <div className="flex items-center gap-2 mb-2">
          <Clock size={13} className="text-[var(--tz-text-muted)]" />
          <span className="text-[10px] font-bold text-[var(--tz-text-muted)] uppercase tracking-wider">
            Trade Journal
          </span>
        </div>
        <RichTextEditor
          content={notes}
          onChange={handleNotesChange}
          placeholder="Write about this trade... Add chart screenshots, entry/exit rationale, lessons learned..."
          minHeight="250px"
        />
      </div>
    </div>
  );
}
