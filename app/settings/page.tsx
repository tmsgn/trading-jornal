"use client";

import React, { useState, useEffect } from "react";
import {
  User,
  Link2,
  Bell,
  Palette,
  Shield,
  CreditCard,
  Code2,
  CheckCircle,
  XCircle,
  Upload,
  RefreshCw,
  Eye,
  EyeOff,
  Download,
  ChevronRight,
  Laptop,
  Smartphone,
  Plus,
  Copy,
} from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  getSavedProfile,
  saveProfile,
  getSavedTrades,
  saveTrades,
  Profile,
} from "@/lib/data";
import { toast } from "sonner";

// ─── Types ────────────────────────────────────────────────────────────────────

type Section =
  | "Profile"
  | "Broker Connections"
  | "Notifications"
  | "Appearance"
  | "Security"
  | "Billing & Plans"
  | "API Access";

const NAV_ITEMS: { label: Section; icon: React.ElementType }[] = [
  { label: "Profile", icon: User },
  { label: "Broker Connections", icon: Link2 },
  { label: "Notifications", icon: Bell },
  { label: "Appearance", icon: Palette },
  { label: "Security", icon: Shield },
  { label: "Billing & Plans", icon: CreditCard },
  { label: "API Access", icon: Code2 },
];

// ─── Profile Section ──────────────────────────────────────────────────────────

function ProfileSection() {
  const [form, setForm] = useState<Profile>(() => getSavedProfile());

  const handleSave = () => {
    saveProfile(form);
    toast.success("Profile updated successfully!");
  };

  return (
    <div className="space-y-6">
      {/* Avatar */}
      <div className="flex items-center gap-5">
        <div className="relative">
          <div
            className="w-20 h-20 rounded-full flex items-center justify-center text-white text-2xl font-bold"
            style={{
              background: "linear-gradient(135deg, #6366f1 0%, #818cf8 100%)",
            }}
          >
            {(form.firstName[0] || "H").toUpperCase()}
          </div>
          <button
            onClick={() => toast.info("Avatar image upload is a demo feature")}
            className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full flex items-center justify-center text-white shadow-md hover:opacity-90 transition-opacity cursor-pointer"
            style={{ background: "#6366f1" }}
          >
            <Upload className="w-3.5 h-3.5" />
          </button>
        </div>
        <div>
          <p className="text-sm font-semibold text-gray-800">
            {form.firstName} {form.lastName}
          </p>
          <p className="text-xs text-gray-400 mt-0.5">@{form.username}</p>
          <button
            onClick={() => toast.info("Avatar image upload is a demo feature")}
            className="text-xs text-indigo-600 hover:text-indigo-700 mt-1 transition-colors cursor-pointer font-bold"
          >
            Change avatar
          </button>
        </div>
      </div>

      {/* Form */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label
            htmlFor="firstName"
            className="text-xs text-gray-500 font-bold uppercase tracking-wider"
          >
            First Name
          </Label>
          <Input
            id="firstName"
            value={form.firstName}
            onChange={(e) => setForm({ ...form, firstName: e.target.value })}
            className="text-xs font-semibold text-gray-800"
          />
        </div>
        <div className="space-y-1.5">
          <Label
            htmlFor="lastName"
            className="text-xs text-gray-500 font-bold uppercase tracking-wider"
          >
            Last Name
          </Label>
          <Input
            id="lastName"
            value={form.lastName}
            onChange={(e) => setForm({ ...form, lastName: e.target.value })}
            className="text-xs font-semibold text-gray-800"
          />
        </div>
        <div className="space-y-1.5">
          <Label
            htmlFor="email"
            className="text-xs text-gray-500 font-bold uppercase tracking-wider"
          >
            Email Address
          </Label>
          <Input
            id="email"
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="text-xs font-semibold text-gray-800"
          />
        </div>
        <div className="space-y-1.5">
          <Label
            htmlFor="username"
            className="text-xs text-gray-500 font-bold uppercase tracking-wider"
          >
            Username
          </Label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs font-bold">
              @
            </span>
            <Input
              id="username"
              value={form.username}
              onChange={(e) => setForm({ ...form, username: e.target.value })}
              className="pl-7 text-xs font-semibold text-gray-800"
            />
          </div>
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs text-gray-500 font-bold uppercase tracking-wider">
            Timezone
          </Label>
          <Select
            value={form.timezone}
            onValueChange={(v) => setForm({ ...form, timezone: v })}
          >
            <SelectTrigger className="w-full text-xs font-semibold text-gray-800 h-9">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="America/New_York">Eastern Time (ET)</SelectItem>
              <SelectItem value="America/Chicago">Central Time (CT)</SelectItem>
              <SelectItem value="America/Denver">Mountain Time (MT)</SelectItem>
              <SelectItem value="America/Los_Angeles">Pacific Time (PT)</SelectItem>
              <SelectItem value="Europe/London">London (GMT)</SelectItem>
              <SelectItem value="Europe/Berlin">Central Europe (CET)</SelectItem>
              <SelectItem value="Asia/Tokyo">Tokyo (JST)</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs text-gray-500 font-bold uppercase tracking-wider">
            Trading Experience
          </Label>
          <Select
            value={form.experience}
            onValueChange={(v) => setForm({ ...form, experience: v })}
          >
            <SelectTrigger className="w-full text-xs font-semibold text-gray-800 h-9">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Beginner">Beginner (&lt;1 year)</SelectItem>
              <SelectItem value="Intermediate">Intermediate (1–3 years)</SelectItem>
              <SelectItem value="Advanced">Advanced (3–7 years)</SelectItem>
              <SelectItem value="Expert">Expert (7+ years)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex items-center gap-3 pt-2">
        <button
          onClick={handleSave}
          className="px-5 py-2 rounded-lg text-xs font-bold text-white transition-all hover:opacity-90 cursor-pointer shadow-sm"
          style={{
            background: "linear-gradient(135deg, #6366f1 0%, #818cf8 100%)",
          }}
        >
          Save Changes
        </button>
        <button
          onClick={() => setForm(getSavedProfile())}
          className="px-5 py-2 rounded-lg text-xs font-bold text-gray-600 border border-gray-200 hover:bg-gray-50 transition-colors cursor-pointer"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

// ─── Broker Connections ───────────────────────────────────────────────────────

function BrokerConnectionsSection() {
  const [dragOver, setDragOver] = useState(false);
  const [importing, setImporting] = useState(false);
  const [connections, setConnections] = useState<Record<string, boolean>>({
    Tradovate: true,
    "Interactive Brokers": false,
    "TD Ameritrade": false,
    TradeStation: false,
  });

  const handleToggleConnect = (broker: string) => {
    const nextVal = !connections[broker];
    setConnections((prev) => ({ ...prev, [broker]: nextVal }));
    if (nextVal) {
      toast.success(`Successfully connected to ${broker}!`);
    } else {
      toast.info(`Disconnected from ${broker}.`);
    }
  };

  const handleManualImport = () => {
    setImporting(true);
    toast.info("Parsing CSV files...");

    setTimeout(() => {
      const mockImported = [
        {
          id: Date.now(),
          date: "2023-12-22",
          time: "09:41",
          symbol: "NVDA",
          side: "Long" as const,
          qty: 50,
          entry: 488.5,
          exit: 495.2,
          grossPnl: 335.0,
          commissions: 1.5,
          netPnl: 333.5,
          rr: 2.2,
          duration: 35,
          playbook: "Breakout",
          tags: ["imported", "csv"],
          hasNote: true,
          status: "Closed" as const,
          psychology: {
            fomo: 1,
            discipline: 5,
            patience: 4,
            focus: 5,
            emotions: ["Calm", "Focused"],
            notes: "Imported via CSV file. Clean breakout play.",
          },
          rulesChecklist: {
            planFollowed: true,
            riskManaged: true,
            entryConfirmed: true,
            stopLossSet: true,
          },
        },
        {
          id: Date.now() + 1,
          date: "2023-12-22",
          time: "10:15",
          symbol: "TSLA",
          side: "Short" as const,
          qty: 100,
          entry: 253.2,
          exit: 255.8,
          grossPnl: -260.0,
          commissions: 2.5,
          netPnl: -262.5,
          rr: -1.0,
          duration: 18,
          playbook: "Reversal",
          tags: ["imported", "csv"],
          hasNote: false,
          status: "Closed" as const,
        },
      ];

      const currentTrades = getSavedTrades();
      saveTrades([...currentTrades, ...mockImported]);
      setImporting(false);
      toast.success("CSV import complete! Added 2 trades to your journal.");
    }, 1200);
  };

  const brokers = [
    { name: "Tradovate", logo: "TRD" },
    { name: "Interactive Brokers", logo: "IB" },
    { name: "TD Ameritrade", logo: "TDA" },
    { name: "TradeStation", logo: "TS" },
  ];

  return (
    <div className="space-y-5">
      <div className="space-y-3">
        {brokers.map((broker) => {
          const isConnected = connections[broker.name];
          return (
            <div
              key={broker.name}
              className="flex items-center justify-between px-4 py-3.5 rounded-xl border transition-all hover:shadow-sm"
              style={{
                borderColor: isConnected ? "#d6f0ea" : "#e8ecf4",
                background: isConnected ? "#f0fdf4" : "#fff",
              }}
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center text-white text-xs font-bold"
                  style={{
                    background: isConnected ? "#1a8a72" : "#6366f1",
                  }}
                >
                  {broker.logo}
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-800">
                    {broker.name}
                  </p>
                  {isConnected ? (
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <CheckCircle
                        className="w-3.5 h-3.5 text-[#1a8a72]"
                      />
                      <span className="text-xs font-semibold text-[#1a8a72]">
                        Connected
                      </span>
                      <span className="text-xs text-gray-400">
                        · Auto Sync Active
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <XCircle className="w-3.5 h-3.5 text-gray-400" />
                      <span className="text-xs text-gray-400 font-medium">Not connected</span>
                    </div>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                {isConnected ? (
                  <>
                    <button
                      onClick={() => toast.success(`${broker.name} logs synchronized!`)}
                      className="flex items-center gap-1.5 text-xs font-bold text-gray-500 hover:text-gray-700 px-3 py-1.5 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      Sync
                    </button>
                    <button
                      onClick={() => handleToggleConnect(broker.name)}
                      className="text-xs font-bold text-red-500 hover:text-red-600 px-3 py-1.5 rounded-lg hover:bg-red-50 transition-colors cursor-pointer"
                    >
                      Disconnect
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => handleToggleConnect(broker.name)}
                    className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-bold text-white transition-opacity hover:opacity-90 cursor-pointer"
                    style={{
                      background:
                        "linear-gradient(135deg, #6366f1 0%, #818cf8 100%)",
                    }}
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Connect
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Manual Import */}
      <div className="border-t border-gray-100 pt-5">
        <h3 className="text-sm font-semibold text-gray-800 mb-3">
          Import Trades Manually
        </h3>
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragOver(false);
            handleManualImport();
          }}
          onClick={handleManualImport}
          className="rounded-xl border-2 border-dashed px-6 py-8 text-center transition-all cursor-pointer hover:border-indigo-400"
          style={{
            borderColor: dragOver ? "#6366f1" : "#d1d5db",
            background: dragOver ? "#f0f0ff" : "#f9fafb",
            opacity: importing ? 0.6 : 1,
            pointerEvents: importing ? "none" : "auto",
          }}
        >
          {importing ? (
            <RefreshCw className="w-8 h-8 mx-auto text-indigo-500 mb-2 animate-spin" />
          ) : (
            <Upload className="w-8 h-8 mx-auto text-gray-400 mb-2" />
          )}
          <p className="text-sm font-bold text-gray-700 mb-0.5">
            {importing
              ? "Parsing trade files..."
              : dragOver
                ? "Drop your file here"
                : "Drag & drop your trade file here"}
          </p>
          <p className="text-xs text-gray-400 mb-3">or click to browse files</p>
          <div className="flex items-center justify-center gap-2 flex-wrap">
            {["CSV", "XLSX", "XLS"].map((fmt) => (
              <span
                key={fmt}
                className="text-xs font-bold px-2.5 py-1 rounded-full"
                style={{ background: "#e8ecf4", color: "#6366f1" }}
              >
                .{fmt}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Notifications ────────────────────────────────────────────────────────────

function NotificationsSection() {
  const [toggles, setToggles] = useState<Record<string, boolean>>({
    "Daily P&L Summary email": true,
    "Trade alerts": true,
    "Community mentions": false,
    "Weekly performance report": true,
    "Achievement unlocked": true,
    "Streak reminders": false,
  });

  const descriptions: Record<string, string> = {
    "Daily P&L Summary email":
      "Receive a daily summary of your trading performance at 6 PM ET",
    "Trade alerts":
      "Get notified when your trades hit take profit or stop loss targets",
    "Community mentions":
      "Alerts when other traders mention or reply to your posts",
    "Weekly performance report":
      "Detailed weekly analytics sent every Monday morning",
    "Achievement unlocked":
      "Celebrate milestones like win streaks and P&L targets",
    "Streak reminders":
      "Remind you to log trades to keep your journaling streak alive",
  };

  return (
    <div className="space-y-1">
      {Object.entries(toggles).map(([key, val]) => (
        <div
          key={key}
          className="flex items-center justify-between px-4 py-4 rounded-xl hover:bg-gray-50/50 transition-colors"
        >
          <div className="flex-1 pr-6">
            <p className="text-sm font-semibold text-gray-800">{key}</p>
            <p className="text-xs text-gray-400 mt-0.5">{descriptions[key]}</p>
          </div>
          <Switch
            checked={val}
            onCheckedChange={(v) => {
              setToggles((prev) => ({ ...prev, [key]: v }));
              toast.success("Notification settings updated");
            }}
          />
        </div>
      ))}
    </div>
  );
}

// ─── Appearance ───────────────────────────────────────────────────────────────

function AppearanceSection() {
  const [theme, setTheme] = useState<"Light" | "Dark" | "System">("Light");
  const [accent, setAccent] = useState("#6366f1");
  const [layout, setLayout] = useState<"Compact" | "Comfortable" | "Spacious">(
    "Comfortable"
  );
  const [defaultPage, setDefaultPage] = useState("dashboard");

  const accents = [
    "#6366f1",
    "#10b981",
    "#3b82f6",
    "#f59e0b",
    "#ef4444",
    "#8b5cf6",
  ];

  return (
    <div className="space-y-6">
      {/* Theme */}
      <div>
        <h3 className="text-sm font-semibold text-gray-800 mb-3">Theme</h3>
        <div className="flex gap-3">
          {(["Light", "Dark", "System"] as const).map((t) => (
            <button
              key={t}
              onClick={() => {
                setTheme(t);
                toast.success(`Theme switched to ${t}`);
              }}
              className="flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all w-28 cursor-pointer"
              style={{
                borderColor: theme === t ? "#6366f1" : "#e8ecf4",
                background: theme === t ? "#f0f0ff" : "#fff",
              }}
            >
              <div
                className="w-14 h-10 rounded-lg border"
                style={{
                  background:
                    t === "Light"
                      ? "#fff"
                      : t === "Dark"
                        ? "#1e2030"
                        : "linear-gradient(135deg, #fff 50%, #1e2030 50%)",
                  borderColor: "#e8ecf4",
                }}
              />
              <span
                className="text-xs font-semibold"
                style={{ color: theme === t ? "#6366f1" : "#6b7280" }}
              >
                {t}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Accent Colors */}
      <div>
        <h3 className="text-sm font-semibold text-gray-800 mb-3">
          Accent Color
        </h3>
        <div className="flex gap-3">
          {accents.map((color) => (
            <button
              key={color}
              onClick={() => {
                setAccent(color);
                toast.success("Accent color updated");
              }}
              className="w-8 h-8 rounded-full transition-transform hover:scale-110 cursor-pointer shadow-sm"
              style={{
                background: color,
                outline: accent === color ? `3px solid ${color}` : "none",
                outlineOffset: "2px",
              }}
            />
          ))}
        </div>
      </div>

      {/* Layout Density */}
      <div>
        <h3 className="text-sm font-semibold text-gray-800 mb-3">
          Dashboard Layout
        </h3>
        <div className="space-y-2">
          {(["Compact", "Comfortable", "Spacious"] as const).map((l) => (
            <label
              key={l}
              className="flex items-center gap-3 cursor-pointer p-3 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div
                className="w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0"
                style={{ borderColor: layout === l ? "#6366f1" : "#d1d5db" }}
              >
                {layout === l && (
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{ background: "#6366f1" }}
                  />
                )}
              </div>
              <div>
                <p
                  className="text-sm font-semibold text-gray-700"
                  onClick={() => {
                    setLayout(l);
                    toast.success(`Layout changed to ${l}`);
                  }}
                >
                  {l}
                </p>
                <p className="text-xs text-gray-400">
                  {l === "Compact"
                    ? "Dense UI, more data visible"
                    : l === "Comfortable"
                      ? "Balanced spacing (default)"
                      : "Spacious layout with generous padding"}
                </p>
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* Default Page */}
      <div>
        <h3 className="text-sm font-semibold text-gray-800 mb-2">
          Default Page
        </h3>
        <Select
          value={defaultPage}
          onValueChange={(v) => {
            setDefaultPage(v);
            toast.success(`Default page set to: ${v}`);
          }}
        >
          <SelectTrigger className="w-56 text-xs font-semibold text-gray-800 h-9">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="dashboard">Dashboard</SelectItem>
            <SelectItem value="journal">Journal</SelectItem>
            <SelectItem value="analytics">Analytics</SelectItem>
            <SelectItem value="community">Community</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}

// ─── Security ─────────────────────────────────────────────────────────────────

function SecuritySection() {
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [twoFA, setTwoFA] = useState(false);
  const [passwords, setPasswords] = useState({
    current: "",
    new: "",
    confirm: "",
  });

  const handleUpdatePassword = () => {
    if (!passwords.current || !passwords.new || !passwords.confirm) {
      toast.error("Please fill in all password fields.");
      return;
    }
    if (passwords.new !== passwords.confirm) {
      toast.error("New passwords do not match.");
      return;
    }
    toast.success("Password updated successfully!");
    setPasswords({ current: "", new: "", confirm: "" });
  };

  const sessions = [
    {
      device: "MacBook Pro 14",
      location: "New York, US",
      lastActive: "Now",
      icon: Laptop,
      current: true,
    },
    {
      device: "iPhone 15 Pro",
      location: "New York, US",
      lastActive: "3h ago",
      icon: Smartphone,
      current: false,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Change Password */}
      <div>
        <h3 className="text-sm font-semibold text-gray-800 mb-4">
          Change Password
        </h3>
        <div className="space-y-3 max-w-sm">
          <div className="space-y-1.5">
            <Label className="text-xs text-gray-500 font-bold uppercase tracking-wider">
              Current Password
            </Label>
            <div className="relative">
              <Input
                type={showCurrent ? "text" : "password"}
                value={passwords.current}
                onChange={(e) =>
                  setPasswords({ ...passwords, current: e.target.value })
                }
                placeholder="••••••••"
                className="pr-10 text-xs font-semibold text-gray-800"
              />
              <button
                onClick={() => setShowCurrent(!showCurrent)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
              >
                {showCurrent ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs text-gray-500 font-bold uppercase tracking-wider">
              New Password
            </Label>
            <div className="relative">
              <Input
                type={showNew ? "text" : "password"}
                value={passwords.new}
                onChange={(e) =>
                  setPasswords({ ...passwords, new: e.target.value })
                }
                placeholder="Min. 8 characters"
                className="pr-10 text-xs font-semibold text-gray-800"
              />
              <button
                onClick={() => setShowNew(!showNew)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
              >
                {showNew ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs text-gray-500 font-bold uppercase tracking-wider">
              Confirm New Password
            </Label>
            <div className="relative">
              <Input
                type={showConfirm ? "text" : "password"}
                value={passwords.confirm}
                onChange={(e) =>
                  setPasswords({ ...passwords, confirm: e.target.value })
                }
                placeholder="Re-enter password"
                className="pr-10 text-xs font-semibold text-gray-800"
              />
              <button
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
              >
                {showConfirm ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>
          <button
            onClick={handleUpdatePassword}
            className="px-5 py-2 rounded-lg text-xs font-bold text-white transition-opacity hover:opacity-90 cursor-pointer shadow-sm"
            style={{
              background: "linear-gradient(135deg, #6366f1 0%, #818cf8 100%)",
            }}
          >
            Update Password
          </button>
        </div>
      </div>

      {/* 2FA */}
      <div className="border-t border-gray-100 pt-5">
        <div className="flex items-center justify-between max-w-sm">
          <div>
            <h3 className="text-sm font-semibold text-gray-800">
              Two-Factor Authentication
            </h3>
            <p className="text-xs text-gray-400 mt-0.5">
              Add an extra layer of security to your account
            </p>
          </div>
          <div className="flex items-center gap-3">
            {twoFA && (
              <button
                onClick={() => toast.success("Configuring Authenticator App keys")}
                className="text-xs font-bold text-indigo-600 hover:text-indigo-700 font-medium cursor-pointer"
              >
                Setup
              </button>
            )}
            <Switch
              checked={twoFA}
              onCheckedChange={(v) => {
                setTwoFA(v);
                if (v) {
                  toast.success("Two-Factor Authentication Enabled");
                } else {
                  toast.info("Two-Factor Authentication Disabled");
                }
              }}
            />
          </div>
        </div>
        {twoFA && (
          <div
            className="mt-3 px-4 py-3 rounded-lg text-xs max-w-sm font-medium"
            style={{ background: "#d6f0ea", color: "#1a8a72" }}
          >
            ✓ 2FA is active. Your account is protected with an authenticator app.
          </div>
        )}
      </div>

      {/* Active Sessions */}
      <div className="border-t border-gray-100 pt-5">
        <h3 className="text-sm font-semibold text-gray-800 mb-3">
          Active Sessions
        </h3>
        <div className="space-y-2 max-w-md">
          {sessions.map((session) => (
            <div
              key={session.device}
              className="flex items-center justify-between p-4 rounded-xl border bg-white"
              style={{ borderColor: "#e8ecf4" }}
            >
              <div className="flex items-center gap-3">
                <session.icon className="w-5 h-5 text-gray-400 shrink-0" />
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-gray-800">
                      {session.device}
                    </p>
                    {session.current && (
                      <span
                        className="text-xs font-semibold px-2 py-0.5 rounded-full"
                        style={{ background: "#d6f0ea", color: "#1a7a5e" }}
                      >
                        Current
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {session.location} · {session.lastActive}
                  </p>
                </div>
              </div>
              {!session.current && (
                <button
                  onClick={() => toast.success(`Revoked session: ${session.device}`)}
                  className="text-xs font-semibold text-red-500 hover:text-red-600 transition-colors cursor-pointer"
                >
                  Revoke
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Billing ──────────────────────────────────────────────────────────────────

function BillingSection() {
  const features = [
    "Unlimited trade logs",
    "Advanced analytics & reports",
    "AI trade insights",
    "Community access",
    "Priority support",
    "Academy course discounts",
  ];

  const invoices = [
    { date: "Jun 1, 2025", amount: 29, status: "Paid", id: "INV-2025-006" },
    { date: "May 1, 2025", amount: 29, status: "Paid", id: "INV-2025-005" },
    { date: "Apr 1, 2025", amount: 29, status: "Paid", id: "INV-2025-004" },
  ];

  return (
    <div className="space-y-6">
      {/* Current Plan */}
      <div
        className="rounded-xl p-5 relative overflow-hidden"
        style={{
          background: "linear-gradient(135deg, #6366f1 0%, #818cf8 100%)",
        }}
      >
        <div className="absolute -right-8 -top-8 w-36 h-36 rounded-full opacity-10 bg-white" />
        <div className="relative flex items-start justify-between">
          <div>
            <div
              className="text-xs font-bold px-2.5 py-1 rounded-full mb-3 inline-block bg-white/20 text-white"
            >
              Current Plan
            </div>
            <h3 className="text-xl font-bold text-white mb-1">Pro Plan</h3>
            <p className="text-indigo-200 text-sm mb-4">
              $29/month · Renews Jun 1, 2026
            </p>
            <div className="grid grid-cols-2 gap-x-6 gap-y-1.5">
              {features.map((f) => (
                <div key={f} className="flex items-center gap-1.5">
                  <CheckCircle className="w-3.5 h-3.5 text-indigo-300 shrink-0" />
                  <span className="text-xs text-indigo-100 font-semibold">{f}</span>
                </div>
              ))}
            </div>
          </div>
          <button
            onClick={() => toast.warning("Subscription cancel workflow is disabled")}
            className="text-xs font-bold text-indigo-200 hover:text-white transition-colors cursor-pointer"
          >
            Cancel Plan
          </button>
        </div>
      </div>

      {/* Usage */}
      <div className="tz-card px-5 py-4 bg-white">
        <h3 className="text-sm font-semibold text-gray-800 mb-3">
          Usage This Month
        </h3>
        <div className="space-y-3">
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-gray-500 font-medium">Trades logged</span>
              <span className="font-semibold text-gray-700">83 / Unlimited</span>
            </div>
            <div className="h-1.5 rounded-full bg-gray-100 overflow-hidden">
              <div
                className="h-full rounded-full"
                style={{ width: "28%", background: "#6366f1" }}
              />
            </div>
          </div>
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-gray-500 font-medium">AI Insights used</span>
              <span className="font-semibold text-gray-700">14 / Unlimited</span>
            </div>
            <div className="h-1.5 rounded-full bg-gray-100 overflow-hidden">
              <div
                className="h-full rounded-full"
                style={{ width: "14%", background: "#10b981" }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Invoice History */}
      <div>
        <h3 className="text-sm font-semibold text-gray-800 mb-3">
          Invoice History
        </h3>
        <div className="tz-card overflow-hidden bg-white">
          <table className="w-full text-xs">
            <thead>
              <tr style={{ background: "#f8fafc" }}>
                <th className="text-left px-4 py-3 text-gray-500 font-semibold">
                  Invoice ID
                </th>
                <th className="text-left px-4 py-3 text-gray-500 font-semibold">
                  Date
                </th>
                <th className="text-left px-4 py-3 text-gray-500 font-semibold">
                  Amount
                </th>
                <th className="text-left px-4 py-3 text-gray-500 font-semibold">
                  Status
                </th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {invoices.map((inv) => (
                <tr
                  key={inv.id}
                  className="border-t border-gray-100 hover:bg-gray-50/50 transition-colors"
                >
                  <td className="px-4 py-3 font-mono text-gray-600 font-semibold">
                    {inv.id}
                  </td>
                  <td className="px-4 py-3 text-gray-600 font-medium">{inv.date}</td>
                  <td className="px-4 py-3 font-black text-gray-800">
                    ${inv.amount}.00
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className="font-bold px-2 py-0.5 rounded-full"
                      style={{ background: "#d6f0ea", color: "#1a8a72" }}
                    >
                      {inv.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => toast.success(`Downloaded Invoice: ${inv.id}`)}
                      className="flex items-center gap-1 text-indigo-600 hover:text-indigo-700 ml-auto transition-colors font-bold cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" />
                      PDF
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ─── API Access ───────────────────────────────────────────────────────────────

function APIAccessSection() {
  const [revealed, setRevealed] = useState(false);
  const [apiKey, setApiKey] = useState("tz_live_4Xa8bK2mN9pQrL7vWj3hUeYcD5fGsRtZ");
  const maskedKey = "tz_live_" + "•".repeat(32);

  const endpoints = [
    { method: "GET", path: "/api/v1/trades", desc: "List all trades" },
    { method: "POST", path: "/api/v1/trades", desc: "Create a trade entry" },
    {
      method: "GET",
      path: "/api/v1/analytics",
      desc: "Fetch performance analytics",
    },
    { method: "GET", path: "/api/v1/journal", desc: "Access journal entries" },
  ];

  const methodColors: Record<
    string,
    { backgroundColor: string; color: string }
  > = {
    GET: { backgroundColor: "#d6f0ea", color: "#1a8a72" },
    POST: { backgroundColor: "#eef0ff", color: "#6366f1" },
    DELETE: { backgroundColor: "#fde8e8", color: "#c0392b" },
  };

  const handleRegenerate = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let randomKey = "tz_live_";
    for (let i = 0; i < 32; i++) {
      randomKey += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setApiKey(randomKey);
    toast.success("API key regenerated successfully!");
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(apiKey);
    toast.success("API key copied to clipboard!");
  };

  return (
    <div className="space-y-6">
      {/* API Key */}
      <div>
        <h3 className="text-sm font-semibold text-gray-800 mb-3">
          Your API Key
        </h3>
        <div
          className="flex items-center gap-3 px-4 py-3 rounded-xl border font-mono text-sm"
          style={{ border: "1px solid #e8ecf4", background: "#f9fafb" }}
        >
          <span className="flex-1 text-gray-700 text-xs overflow-hidden font-mono select-all">
            {revealed ? apiKey : maskedKey}
          </span>
          <button
            onClick={() => setRevealed(!revealed)}
            className="text-gray-400 hover:text-gray-600 transition-colors shrink-0 cursor-pointer"
          >
            {revealed ? (
              <EyeOff className="w-4 h-4" />
            ) : (
              <Eye className="w-4 h-4" />
            )}
          </button>
          <button
            onClick={handleCopy}
            className="text-gray-400 hover:text-indigo-600 transition-colors shrink-0 cursor-pointer"
          >
            <Copy className="w-4 h-4" />
          </button>
        </div>
        <p className="text-xs text-gray-400 mt-2">
          Keep your API key secret. Do not share it in public repositories or client-side code.
        </p>
        <button
          onClick={handleRegenerate}
          className="mt-3 flex items-center gap-2 text-xs font-bold text-red-500 hover:text-red-650 transition-colors cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Regenerate Key
        </button>
      </div>

      {/* Available Endpoints */}
      <div className="border-t border-gray-100 pt-5">
        <h3 className="text-sm font-semibold text-gray-800 mb-3">
          Available Endpoints
        </h3>
        <div className="tz-card overflow-hidden bg-white">
          {endpoints.map((ep, i) => (
            <div
              key={i}
              className="flex items-center gap-4 px-4 py-3 border-b border-slate-100 last:border-0"
            >
              <span
                className="text-[10px] font-bold px-2 py-0.5 rounded font-mono"
                style={
                  methodColors[ep.method] ?? {
                    backgroundColor: "#f4f6fb",
                    color: "#6b7280",
                  }
                }
              >
                {ep.method}
              </span>
              <code className="text-xs font-mono text-indigo-600">
                {ep.path}
              </code>
              <span className="text-xs text-gray-400 font-medium flex-1">{ep.desc}</span>
              <ChevronRight className="w-4 h-4 text-gray-300" />
            </div>
          ))}
        </div>
      </div>

      {/* Rate limits */}
      <div
        className="rounded-xl px-4 py-3 text-xs"
        style={{ background: "#eef0ff", border: "1px solid #e0e7ff" }}
      >
        <span className="font-bold text-indigo-700">
          Pro Plan rate limits:{" "}
        </span>
        <span className="text-indigo-600 font-semibold">
          1,000 requests/hour · 10,000 requests/day
        </span>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function SettingsPage() {
  const [activeSection, setActiveSection] = useState<Section>("Profile");

  const sectionContent: Record<Section, React.ReactNode> = {
    Profile: <ProfileSection />,
    "Broker Connections": <BrokerConnectionsSection />,
    Notifications: <NotificationsSection />,
    Appearance: <AppearanceSection />,
    Security: <SecuritySection />,
    "Billing & Plans": <BillingSection />,
    "API Access": <APIAccessSection />,
  };

  return (
    <div className="px-5 py-4 min-h-full" style={{ background: "#f4f6fb" }}>
      {/* Page Header */}
      <div className="mb-5">
        <h1 className="text-xl font-bold text-gray-900">Settings</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          Manage your account preferences and integrations
        </p>
      </div>

      <div className="flex gap-5 items-start">
        {/* Left Sidebar Nav */}
        <div className="w-48 shrink-0">
          <div className="tz-card overflow-hidden bg-white">
            {NAV_ITEMS.map(({ label, icon: Icon }) => (
              <button
                key={label}
                onClick={() => setActiveSection(label)}
                className="w-full flex items-center gap-3 px-4 py-3 text-sm transition-all text-left border-b border-slate-50 last:border-0 cursor-pointer relative"
                style={
                  activeSection === label
                    ? {
                        background: "#eef0ff",
                        color: "#6366f1",
                        fontWeight: 700,
                      }
                    : { color: "#6b7280" }
                }
              >
                <Icon
                  className="w-4 h-4 shrink-0"
                  style={{
                    color: activeSection === label ? "#6366f1" : "#9ca3af",
                  }}
                />
                <span>{label}</span>
                {activeSection === label && (
                  <div
                    className="absolute left-0 top-0 bottom-0 w-0.5 rounded-r-full"
                    style={{ background: "#6366f1" }}
                  />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Right Content Area */}
        <div className="flex-1 min-w-0">
          <div className="tz-card px-6 py-5 bg-white">
            <div className="flex items-center gap-2 mb-5 pb-4 border-b border-gray-100">
              {(() => {
                const navItem = NAV_ITEMS.find(
                  (n) => n.label === activeSection
                );
                if (!navItem) return null;
                const Icon = navItem.icon;
                return (
                  <>
                    <Icon className="w-5 h-5 text-indigo-500" />
                    <h2 className="text-base font-bold text-gray-900">
                      {activeSection}
                    </h2>
                  </>
                );
              })()}
            </div>
            {sectionContent[activeSection]}
          </div>
        </div>
      </div>
    </div>
  );
}
