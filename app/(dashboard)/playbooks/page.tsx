"use client";

import {
  Archive,
  BarChart2,
  BookOpen,
  Edit2,
  ExternalLink,
  Plus,
  RotateCcw,
  TrendingUp,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Line, LineChart, ResponsiveContainer, Tooltip } from "recharts";
import { toast } from "sonner";
import {
  createPlaybookAction,
  getPlaybooksAction,
  updatePlaybookAction,
} from "@/app/actions/playbooks";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import type { Playbook } from "@/lib/data";

const COLOR_OPTIONS = [
  "#6366f1", // indigo
  "#10b981", // emerald
  "#3b82f6", // blue
  "#f59e0b", // amber
  "#ef4444", // red
  "#8b5cf6", // violet
];

// ─── Sparkline ────────────────────────────────────────────────────────────────

function Sparkline({ data, color }: { data: number[]; color: string }) {
  const isPositive = data.length > 0 ? data[data.length - 1] >= 0 : true;
  const lineColor = isPositive ? color : "#ef5350";

  const formattedData = useMemo(() => {
    return data.map((v, i) => ({ t: i, v }));
  }, [data]);

  return (
    <ResponsiveContainer width="100%" height={44}>
      <LineChart
        data={formattedData}
        margin={{ top: 2, right: 2, bottom: 2, left: 2 }}
      >
        <Line
          type="monotone"
          dataKey="v"
          stroke={lineColor}
          strokeWidth={2}
          dot={false}
          isAnimationActive={false}
        />
        <Tooltip
          formatter={(v) => [`$${Number(v).toLocaleString()}`, "P&L"]}
          contentStyle={{
            fontSize: 10,
            borderRadius: 6,
            padding: "2px 8px",
            border: "1px solid #e0e7ff",
          }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

// ─── Playbook Card ────────────────────────────────────────────────────────────

function PlaybookCard({
  pb,
  onEdit,
  onToggleArchive,
}: {
  pb: Playbook;
  onEdit: (pb: Playbook) => void;
  onToggleArchive: (id: number) => void;
}) {
  const isActive = pb.active;

  return (
    <div
      className="tz-card overflow-hidden cursor-pointer hover:shadow-md transition-all bg-[var(--tz-bg-card)] flex flex-col justify-between"
      style={{ borderLeft: `4px solid ${pb.color}` }}
    >
      {/* Header */}
      <div className="px-5 pt-5 pb-3">
        <div className="flex items-start justify-between mb-1">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-gray-950">{pb.name}</h3>
            <span
              className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
              style={
                isActive
                  ? { background: "#d6f0ea", color: "#1a7a5e" }
                  : { background: "#f3f4f6", color: "#6b7280" }
              }
            >
              {isActive ? "Active" : "Archived"}
            </span>
          </div>
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
            style={{ background: `${pb.color}18` }}
          >
            <BookOpen size={13} style={{ color: pb.color }} />
          </div>
        </div>
        <p className="text-xs text-[var(--tz-text-muted)] leading-relaxed line-clamp-2 h-8">
          {pb.description}
        </p>
      </div>

      {/* Sparkline */}
      <div
        className="px-3"
        style={{
          borderTop: "1px solid #f0f4f8",
          borderBottom: "1px solid #f0f4f8",
        }}
      >
        <Sparkline data={pb.equity} color={pb.color} />
      </div>

      {/* Stats */}
      <div className="px-5 py-3 grid grid-cols-4 gap-2 bg-[#fafbfc]">
        {[
          {
            label: "Win Rate",
            value: `${pb.winRate}%`,
            positive: pb.winRate >= 60,
          },
          {
            label: "Total P&L",
            value:
              pb.totalPnl >= 0
                ? `+$${pb.totalPnl.toLocaleString()}`
                : `-$${Math.abs(pb.totalPnl).toLocaleString()}`,
            positive: pb.totalPnl >= 0,
          },
          { label: "Trades", value: String(pb.trades), positive: null },
          {
            label: "Avg R:R",
            value: `${pb.avgRR.toFixed(1)}R`,
            positive: pb.avgRR >= 1.5,
          },
        ].map((s) => (
          <div key={s.label} className="flex flex-col">
            <span className="text-[10px] font-bold text-[var(--tz-text-muted)] uppercase tracking-wide">
              {s.label}
            </span>
            <span
              className="text-xs font-black mt-0.5"
              style={{
                color:
                  s.positive === null
                    ? "#374151"
                    : s.positive
                      ? "#1a8a72"
                      : "#c0392b",
              }}
            >
              {s.value}
            </span>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between px-5 py-3 border-t border-slate-50">
        <div className="flex gap-3">
          <button
            onClick={() => onEdit(pb)}
            className="flex items-center gap-1.5 text-xs font-semibold text-[var(--tz-text-muted)] hover:text-indigo-600 transition-colors cursor-pointer"
          >
            <Edit2 size={12} />
            Edit
          </button>
          <button
            onClick={() => onToggleArchive(pb.id)}
            className="flex items-center gap-1.5 text-xs font-semibold text-[var(--tz-text-muted)] hover:text-[var(--tz-text-secondary)] transition-colors cursor-pointer"
          >
            {isActive ? (
              <>
                <Archive size={12} /> Archive
              </>
            ) : (
              <>
                <RotateCcw size={12} /> Restore
              </>
            )}
          </button>
        </div>
        <button
          onClick={() => {
            toast.info(`Filtering trades list by Playbook: ${pb.name}`);
          }}
          className="flex items-center gap-1.5 text-xs font-bold transition-colors hover:opacity-80 cursor-pointer"
          style={{ color: pb.color }}
        >
          View Trades
          <ExternalLink size={12} />
        </button>
      </div>
    </div>
  );
}

// ─── Create Playbook Modal ────────────────────────────────────────────────────

interface CreatePlaybookModalProps {
  open: boolean;
  onClose: () => void;
  playbookToEdit: Playbook | null;
  onSave: (pb: Partial<Playbook>) => void;
}

function CreatePlaybookModal({
  open,
  onClose,
  playbookToEdit,
  onSave,
}: CreatePlaybookModalProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [color, setColor] = useState(COLOR_OPTIONS[0]);

  useEffect(() => {
    if (playbookToEdit) {
      setName(playbookToEdit.name);
      setDescription(playbookToEdit.description);
      setColor(playbookToEdit.color);
    } else {
      setName("");
      setDescription("");
      setColor(COLOR_OPTIONS[0]);
    }
  }, [playbookToEdit]);

  function handleSave() {
    onSave({
      name,
      description,
      color,
    });
    onClose();
    setName("");
    setDescription("");
    setColor(COLOR_OPTIONS[0]);
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-xl p-0 gap-0 overflow-hidden bg-[var(--tz-bg-card)]">
        {/* Modal Header */}
        <DialogHeader className="px-6 py-4 border-b border-[var(--tz-border-subtle)] shrink-0">
          <div className="flex items-center gap-2">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
              style={{ background: `${color}20` }}
            >
              <BookOpen size={15} style={{ color }} />
            </div>
            <DialogTitle className="text-sm font-bold text-[var(--tz-text-primary)]">
              {playbookToEdit ? "Edit Playbook" : "Create New Playbook"}
            </DialogTitle>
          </div>
        </DialogHeader>

        {/* Body */}
        <div className="px-6 py-5 flex flex-col gap-4 max-h-[60vh] overflow-y-auto shrink-0">
          {/* Name */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-[var(--tz-text-secondary)]">
              Playbook Name *
            </label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Breakout, VWAP Rejection…"
              className="h-9 px-3 rounded-lg text-xs border border-[var(--tz-border)] bg-[var(--tz-bg-card)] focus:outline-none focus:ring-2 focus:ring-indigo-300 placeholder:text-gray-300 font-medium text-[var(--tz-text-primary)]"
            />
          </div>

          {/* Description */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-[var(--tz-text-secondary)]">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Briefly describe this strategy…"
              rows={3}
              className="px-3 py-2 rounded-lg text-xs border border-[var(--tz-border)] bg-[var(--tz-bg-card)] focus:outline-none focus:ring-2 focus:ring-indigo-300 placeholder:text-gray-300 resize-none font-medium text-[var(--tz-text-primary)]"
            />
          </div>

          {/* Color */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-[var(--tz-text-secondary)]">
              Card Color
            </label>
            <div className="flex items-center gap-2">
              {COLOR_OPTIONS.map((c) => (
                <button
                  key={c}
                  onClick={() => setColor(c)}
                  className="w-7 h-7 rounded-full transition-all hover:scale-110 cursor-pointer"
                  style={{
                    background: c,
                    outline: color === c ? `3px solid ${c}` : "none",
                    outlineOffset: "2px",
                  }}
                />
              ))}
              <span className="text-[10px] text-[var(--tz-text-muted)] ml-1 font-mono">
                Selected: {color}
              </span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <DialogFooter className="px-6 py-4 border-t border-[var(--tz-border-subtle)] bg-[var(--tz-hover-bg)]/50 flex flex-row items-center justify-end gap-2 shrink-0">
          <button
            onClick={onClose}
            className="px-4 h-8 rounded-lg text-xs font-medium border border-[var(--tz-border)] bg-[var(--tz-bg-card)] text-[var(--tz-text-secondary)] hover:bg-[var(--tz-hover-bg)] transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!name.trim()}
            className="px-5 h-8 rounded-lg text-xs font-semibold text-white hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            style={{
              background: "linear-gradient(135deg, #6366f1 0%, #818cf8 100%)",
            }}
          >
            {playbookToEdit ? "Save Changes" : "Create Playbook"}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function PlaybooksPage() {
  const [playbooks, setPlaybooks] = useState<Playbook[]>([]);
  const [activeTab, setActiveTab] = useState<"All" | "Active" | "Archived">(
    "All",
  );
  const [showCreate, setShowCreate] = useState(false);
  const [playbookToEdit, setPlaybookToEdit] = useState<Playbook | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Sync state across navigations
  useEffect(() => {
    getPlaybooksAction().then((data) => {
      setPlaybooks(data as any);
      setIsLoading(false);
    });
  }, []);

  const handleCreateOrEditPlaybook = async (
    playbookData: Partial<Playbook>,
  ) => {
    try {
      if (playbookToEdit) {
        // Edit mode
        const updatedResponse = await updatePlaybookAction(
          String(playbookToEdit.id),
          {
            name: playbookData.name,
            description: playbookData.description,
            color: playbookData.color,
          },
        );

        setPlaybooks((prev) =>
          prev.map((p) => {
            if (p.id === playbookToEdit.id) {
              return { ...p, ...updatedResponse };
            }
            return p;
          }),
        );

        toast.success(`Playbook "${playbookData.name}" updated successfully!`);
      } else {
        // Create mode
        const newPlaybook = await createPlaybookAction({
          name: playbookData.name || "Strategy",
          description: playbookData.description || "",
          color: playbookData.color || COLOR_OPTIONS[0],
        });

        setPlaybooks((prev) => [newPlaybook as any, ...prev]);
        toast.success(`Playbook "${playbookData.name}" created successfully!`);
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to save playbook");
    } finally {
      setPlaybookToEdit(null);
    }
  };

  const handleToggleArchive = async (id: number) => {
    try {
      const pb = playbooks.find((p) => p.id === id);
      if (!pb) return;
      const nextActive = !pb.active;

      await updatePlaybookAction(String(id), { active: nextActive });

      setPlaybooks((prev) =>
        prev.map((p) => {
          if (p.id === id) {
            return { ...p, active: nextActive };
          }
          return p;
        }),
      );

      if (nextActive) {
        toast.success(`Playbook "${pb.name}" restored to active!`);
      } else {
        toast.info(`Playbook "${pb.name}" archived successfully.`);
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to archive playbook");
    }
  };

  const handleEditClick = (pb: Playbook) => {
    setPlaybookToEdit(pb);
    setShowCreate(true);
  };

  const filtered = useMemo(() => {
    if (activeTab === "All") return playbooks;
    if (activeTab === "Active") return playbooks.filter((p) => p.active);
    return playbooks.filter((p) => !p.active);
  }, [playbooks, activeTab]);

  const stats = useMemo(() => {
    const activePbs = playbooks.filter((p) => p.active);

    // Find best performing playbook
    const best =
      playbooks.length > 0
        ? playbooks.reduce((prev, curr) =>
            curr.totalPnl > prev.totalPnl ? curr : prev,
          )
        : { name: "None", totalPnl: 0 };

    // Find most used playbook
    const most =
      playbooks.length > 0
        ? playbooks.reduce((prev, curr) =>
            curr.trades > prev.trades ? curr : prev,
          )
        : { name: "None", trades: 0 };

    const avgWin =
      playbooks.length > 0
        ? playbooks.reduce((sum, p) => sum + p.winRate, 0) / playbooks.length
        : 0;

    return [
      {
        label: "Total Playbooks",
        value: String(playbooks.length),
        sub: `${activePbs.length} active`,
        icon: <BookOpen size={16} />,
        color: "#6366f1",
      },
      {
        label: "Best Performing",
        value: best.name,
        sub: `+$${best.totalPnl.toLocaleString()} total P&L`,
        icon: <TrendingUp size={16} />,
        color: "#1a8a72",
      },
      {
        label: "Most Used",
        value: most.name,
        sub: `${most.trades} trades recorded`,
        icon: <BarChart2 size={16} />,
        color: "#3b82f6",
      },
      {
        label: "Avg Win Rate",
        value: `${avgWin.toFixed(1)}%`,
        sub: "Across all playbooks",
        icon: <TrendingUp size={16} />,
        color: avgWin >= 60 ? "#1a8a72" : "#f59e0b",
      },
    ];
  }, [playbooks]);

  const tabs: Array<"All" | "Active" | "Archived"> = [
    "All",
    "Active",
    "Archived",
  ];

  if (isLoading) {
    return (
      <div className="tz-page animate-pulse space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-10 w-48 rounded-xl" />
          <Skeleton className="h-9 w-32 rounded-lg" />
        </div>
        <div className="grid grid-cols-4 gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-xl" />
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-64 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="tz-page">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-[var(--tz-text-primary)]">Playbooks</h1>
          <p className="text-sm text-[var(--tz-text-muted)] mt-0.5">
            Define and track your trading strategies
          </p>
        </div>
        <button
          onClick={() => {
            setPlaybookToEdit(null);
            setShowCreate(true);
          }}
          className="flex items-center gap-2 px-4 h-9 rounded-lg text-xs font-semibold text-white hover:opacity-90 transition-all cursor-pointer shadow-sm"
          style={{
            background: "linear-gradient(135deg, #6366f1 0%, #818cf8 100%)",
          }}
        >
          <Plus size={14} />
          New Playbook
        </button>
      </div>

      {/* Stats Strip */}
      <div className="grid grid-cols-4 gap-3">
        {stats.map((s) => (
          <div
            key={s.label}
            className="tz-card p-4 flex items-start gap-3 bg-[var(--tz-bg-card)]"
          >
            <div
              className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
              style={{ background: `${s.color}18`, color: s.color }}
            >
              {s.icon}
            </div>
            <div className="min-w-0">
              <p className="text-xs text-[var(--tz-text-muted)] font-medium">{s.label}</p>
              <p className="text-sm font-bold text-[var(--tz-text-primary)] leading-tight mt-0.5 truncate">
                {s.value}
              </p>
              <p className="text-[10px] text-[var(--tz-text-muted)] mt-0.5 font-medium">
                {s.sub}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-0 border-b border-slate-200">
        {tabs.map((tab) => {
          const count =
            tab === "All"
              ? playbooks.length
              : tab === "Active"
                ? playbooks.filter((p) => p.active).length
                : playbooks.filter((p) => !p.active).length;
          const isActive = activeTab === tab;
          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className="flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold transition-all cursor-pointer"
              style={{
                borderBottom: isActive
                  ? "2px solid #6366f1"
                  : "2px solid transparent",
                color: isActive ? "#4f46e5" : "#6b7280",
                marginBottom: "-1px",
              }}
            >
              {tab}
              <span
                className="text-[10px] font-bold px-1.5 py-0.5 rounded-full"
                style={{
                  background: isActive ? "#e0e7ff" : "#f3f4f6",
                  color: isActive ? "#4f46e5" : "#9ca3af",
                }}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Playbook Grid */}
      {filtered.length === 0 ? (
        <div className="tz-card flex flex-col items-center justify-center py-16 gap-3 bg-[var(--tz-bg-card)]">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-gray-100">
            <Archive size={22} className="text-[var(--tz-text-muted)]" />
          </div>
          <p className="text-sm font-semibold text-[var(--tz-text-muted)]">
            No {activeTab.toLowerCase()} playbooks
          </p>
          <p className="text-xs text-[var(--tz-text-muted)]">
            {activeTab === "Archived"
              ? "Archived playbooks will appear here."
              : "Create your first playbook to get started."}
          </p>
          {activeTab !== "Archived" && (
            <button
              onClick={() => {
                setPlaybookToEdit(null);
                setShowCreate(true);
              }}
              className="mt-1 flex items-center gap-1.5 px-4 h-8 rounded-lg text-xs font-semibold text-white cursor-pointer"
              style={{
                background: "linear-gradient(135deg, #6366f1 0%, #818cf8 100%)",
              }}
            >
              <Plus size={13} /> New Playbook
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((pb) => (
            <PlaybookCard
              key={pb.id}
              pb={pb}
              onEdit={handleEditClick}
              onToggleArchive={handleToggleArchive}
            />
          ))}
        </div>
      )}

      {/* Create / Edit Playbook Modal */}
      <CreatePlaybookModal
        open={showCreate}
        playbookToEdit={playbookToEdit}
        onClose={() => {
          setShowCreate(false);
          setPlaybookToEdit(null);
        }}
        onSave={handleCreateOrEditPlaybook}
      />
    </div>
  );
}
