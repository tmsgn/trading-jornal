"use client";

import {
  Bell,
  CheckCircle,
  ChevronRight,
  Code2,
  Copy,
  CreditCard,
  Download,
  Eye,
  EyeOff,
  Laptop,
  Palette,
  Plus,
  RefreshCw,
  Shield,
  Smartphone,
  Upload,
  User,
} from "lucide-react";
import type React from "react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { updatePasswordAction } from "@/app/actions/security";
import {
  getPreferencesAction,
  updatePreferencesAction,
} from "@/app/actions/settings";
import { getProfileAction, updateProfileAction } from "@/app/actions/trade";
import { useTrades } from "@/components/providers/TradeProvider";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import type { Profile } from "@/lib/data";

// ─── Types ────────────────────────────────────────────────────────────────────

type Section =
  | "Profile"
  | "Trading Accounts"
  | "Notifications"
  | "Appearance"
  | "Security"
  | "Billing & Plans"
  | "API Access";

const NAV_ITEMS: { label: Section; icon: React.ElementType }[] = [
  { label: "Profile", icon: User },
  { label: "Trading Accounts", icon: CreditCard },
  { label: "Notifications", icon: Bell },
  { label: "Appearance", icon: Palette },
  { label: "Security", icon: Shield },
  { label: "Billing & Plans", icon: CreditCard },
  { label: "API Access", icon: Code2 },
];

// ─── Profile Section ──────────────────────────────────────────────────────────

function ProfileSection() {
  const { profile, setProfile } = useTrades();
  const [form, setForm] = useState<Profile>({
    firstName: profile?.firstName || "",
    lastName: profile?.lastName || "",
    email: profile?.email || "",
    username: profile?.username || "",
    timezone: profile?.timezone || "America/New_York",
    experience: profile?.experience || "Intermediate",
  });

  useEffect(() => {
    if (profile) {
      setForm({
        firstName: profile.firstName || "",
        lastName: profile.lastName || "",
        email: profile.email || "",
        username: profile.username || "",
        timezone: profile.timezone || "America/New_York",
        experience: profile.experience || "Intermediate",
      });
    }
  }, [profile]);

  const handleSave = async () => {
    try {
      await updateProfileAction({
        firstName: form.firstName,
        lastName: form.lastName,
        username: form.username,
        timezone: form.timezone,
        experience: form.experience,
      });
      if (setProfile && profile) {
        setProfile({ ...profile, ...form });
      }
      toast.success("Profile updated successfully!");
    } catch (e: any) {
      toast.error(e.message || "Failed to update profile");
    }
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
            {(form.firstName?.[0] || form.email?.[0] || "U").toUpperCase()}
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
          <p className="text-sm font-semibold text-[var(--tz-text-primary)] dark:text-gray-100">
            {form.firstName} {form.lastName}
          </p>
          <p className="text-xs text-[var(--tz-text-muted)] dark:text-[var(--tz-text-muted)] mt-0.5">@{form.username}</p>
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
            className="text-xs text-[var(--tz-text-muted)] dark:text-[var(--tz-text-muted)] font-bold uppercase tracking-wider"
          >
            First Name
          </Label>
          <Input
            id="firstName"
            value={form.firstName}
            onChange={(e) => setForm({ ...form, firstName: e.target.value })}
            className="text-xs font-semibold text-[var(--tz-text-primary)] dark:text-gray-100"
          />
        </div>
        <div className="space-y-1.5">
          <Label
            htmlFor="lastName"
            className="text-xs text-[var(--tz-text-muted)] dark:text-[var(--tz-text-muted)] font-bold uppercase tracking-wider"
          >
            Last Name
          </Label>
          <Input
            id="lastName"
            value={form.lastName}
            onChange={(e) => setForm({ ...form, lastName: e.target.value })}
            className="text-xs font-semibold text-[var(--tz-text-primary)] dark:text-gray-100"
          />
        </div>
        <div className="space-y-1.5">
          <Label
            htmlFor="email"
            className="text-xs text-[var(--tz-text-muted)] dark:text-[var(--tz-text-muted)] font-bold uppercase tracking-wider"
          >
            Email Address
          </Label>
          <Input
            id="email"
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="text-xs font-semibold text-[var(--tz-text-primary)] dark:text-gray-100"
          />
        </div>
        <div className="space-y-1.5">
          <Label
            htmlFor="username"
            className="text-xs text-[var(--tz-text-muted)] dark:text-[var(--tz-text-muted)] font-bold uppercase tracking-wider"
          >
            Username
          </Label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--tz-text-muted)] dark:text-[var(--tz-text-muted)] text-xs font-bold">
              @
            </span>
            <Input
              id="username"
              value={form.username}
              onChange={(e) => setForm({ ...form, username: e.target.value })}
              className="pl-7 text-xs font-semibold text-[var(--tz-text-primary)] dark:text-gray-100"
            />
          </div>
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs text-[var(--tz-text-muted)] dark:text-[var(--tz-text-muted)] font-bold uppercase tracking-wider">
            Timezone
          </Label>
          <Select
            value={form.timezone}
            onValueChange={(v) => setForm({ ...form, timezone: v })}
          >
            <SelectTrigger className="w-full text-xs font-semibold text-[var(--tz-text-primary)] dark:text-gray-100 h-9">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="America/New_York">
                Eastern Time (ET)
              </SelectItem>
              <SelectItem value="America/Chicago">Central Time (CT)</SelectItem>
              <SelectItem value="America/Denver">Mountain Time (MT)</SelectItem>
              <SelectItem value="America/Los_Angeles">
                Pacific Time (PT)
              </SelectItem>
              <SelectItem value="Europe/London">London (GMT)</SelectItem>
              <SelectItem value="Europe/Berlin">
                Central Europe (CET)
              </SelectItem>
              <SelectItem value="Asia/Tokyo">Tokyo (JST)</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs text-[var(--tz-text-muted)] dark:text-[var(--tz-text-muted)] font-bold uppercase tracking-wider">
            Trading Experience
          </Label>
          <Select
            value={form.experience}
            onValueChange={(v) => setForm({ ...form, experience: v })}
          >
            <SelectTrigger className="w-full text-xs font-semibold text-[var(--tz-text-primary)] dark:text-gray-100 h-9">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Beginner">Beginner (&lt;1 year)</SelectItem>
              <SelectItem value="Intermediate">
                Intermediate (1–3 years)
              </SelectItem>
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
          onClick={() => {
            getProfileAction().then((data) => {
              if (data) {
                setForm((prev) => ({
                  ...prev,
                  firstName: data.firstName || "",
                  lastName: data.lastName || "",
                  email: data.email || "",
                  username: data.username || "",
                  timezone: data.timezone || "America/New_York",
                  experience: data.experience || "Intermediate",
                }));
              }
            });
          }}
          className="px-5 py-2 rounded-lg text-xs font-bold text-[var(--tz-text-secondary)] dark:text-gray-300 border border-[var(--tz-border)] dark:border-[#2a2b35] hover:bg-[var(--tz-hover-bg)] dark:hover:bg-[#1f2029] transition-colors cursor-pointer"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

// ─── Trading Accounts ───────────────────────────────────────────────────────

function TradingAccountsSection() {
  const { accounts, addAccount, deleteAccount } = useTrades();
  const [newAccountName, setNewAccountName] = useState("");
  const [newAccountBalance, setNewAccountBalance] = useState("10000");
  const [isAdding, setIsAdding] = useState(false);

  const handleAdd = async () => {
    if (!newAccountName.trim() || !newAccountBalance) {
      toast.error("Please fill in both fields.");
      return;
    }
    setIsAdding(true);
    try {
      await addAccount(newAccountName, Number(newAccountBalance));
      toast.success("Trading account created!");
      setNewAccountName("");
      setNewAccountBalance("10000");
    } catch (e: any) {
      toast.error(e.message || "Failed to create account");
    } finally {
      setIsAdding(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (
      confirm(
        `Are you sure you want to delete the account "${name}"? This will delete all trades associated with it!`,
      )
    ) {
      try {
        await deleteAccount(id);
        toast.success(`Account "${name}" deleted.`);
      } catch (e: any) {
        toast.error(e.message || "Failed to delete account");
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        {accounts.map((account) => (
          <div
            key={account.id}
            className="flex items-center justify-between px-4 py-3.5 rounded-xl border border-[var(--tz-border-subtle)] dark:border-[#2a2b35] bg-[var(--tz-bg-card)] dark:bg-[#1a1b23] shadow-sm"
          >
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center text-white text-xs font-bold"
                style={{
                  background:
                    "linear-gradient(135deg, #10b981 0%, #34d399 100%)",
                }}
              >
                {account.name.substring(0, 2).toUpperCase()}
              </div>
              <div>
                <p className="text-sm font-bold text-[var(--tz-text-primary)] dark:text-gray-100">
                  {account.name}
                </p>
                <p className="text-xs font-semibold text-[var(--tz-text-muted)] dark:text-[var(--tz-text-muted)] mt-0.5">
                  Starting Balance: ${account.startingBalance.toLocaleString()}
                </p>
              </div>
            </div>
            <button
              onClick={() => handleDelete(account.id, account.name)}
              className="text-xs font-bold text-red-500 hover:text-red-600 px-3 py-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors cursor-pointer"
            >
              Delete Account
            </button>
          </div>
        ))}
      </div>

      {/* Add New Account Form */}
      <div className="border-t border-[var(--tz-border-subtle)] dark:border-[#2a2b35] pt-5">
        <h3 className="text-sm font-semibold text-[var(--tz-text-primary)] dark:text-gray-100 mb-3">
          Create New Trading Account
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label className="text-xs text-[var(--tz-text-muted)] dark:text-[var(--tz-text-muted)] font-bold uppercase tracking-wider">
              Account Name
            </Label>
            <Input
              value={newAccountName}
              onChange={(e) => setNewAccountName(e.target.value)}
              placeholder="e.g. Apex 50k Challenge"
              className="text-xs font-semibold text-[var(--tz-text-primary)] dark:text-gray-100"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs text-[var(--tz-text-muted)] dark:text-[var(--tz-text-muted)] font-bold uppercase tracking-wider">
              Starting Balance ($)
            </Label>
            <Input
              type="number"
              value={newAccountBalance}
              onChange={(e) => setNewAccountBalance(e.target.value)}
              placeholder="10000"
              className="text-xs font-semibold text-[var(--tz-text-primary)] dark:text-gray-100"
            />
          </div>
        </div>
        <button
          onClick={handleAdd}
          disabled={isAdding}
          className="mt-4 px-5 py-2 rounded-lg text-xs font-bold text-white transition-all hover:opacity-90 cursor-pointer shadow-sm disabled:opacity-70 flex items-center gap-1.5"
          style={{
            background: "linear-gradient(135deg, #10b981 0%, #34d399 100%)",
          }}
        >
          <Plus size={14} />
          {isAdding ? "Creating..." : "Create Account"}
        </button>
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
          className="flex items-center justify-between px-4 py-4 rounded-xl hover:bg-[var(--tz-hover-bg)] transition-colors"
        >
          <div className="flex-1 pr-6">
            <p className="text-sm font-semibold text-[var(--tz-text-primary)]">{key}</p>
            <p className="text-xs text-[var(--tz-text-muted)] mt-0.5">{descriptions[key]}</p>
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
    "Comfortable",
  );
  const [defaultPage, setDefaultPage] = useState("dashboard");

  useEffect(() => {
    async function loadPreferences() {
      try {
        const prefs = await getPreferencesAction();
        if (prefs.tz_theme) setTheme(prefs.tz_theme);
        if (prefs.tz_accent) setAccent(prefs.tz_accent);
        if (prefs.tz_layout) setLayout(prefs.tz_layout);
        if (prefs.tz_default_page) setDefaultPage(prefs.tz_default_page);
      } catch (e) {
        console.error("Failed to load appearance preferences", e);
      }
    }
    loadPreferences();
  }, []);

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
        <h3 className="text-sm font-semibold text-[var(--tz-text-primary)] mb-3">Theme</h3>
        <div className="flex gap-3">
          {(["Light", "Dark", "System"] as const).map((t) => (
            <button
              key={t}
              onClick={() => {
                setTheme(t);
                localStorage.setItem("tz_theme", t);
                updatePreferencesAction({ tz_theme: t });
                window.dispatchEvent(new Event("tz_appearance_change"));
                toast.success(`Theme switched to ${t}`);
              }}
              className={`flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all w-28 cursor-pointer ${
                theme === t
                  ? "border-[var(--tz-accent)] bg-[var(--tz-accent-muted)]"
                  : "border-[var(--tz-border)] bg-[var(--tz-bg-card)]"
              }`}
            >
              <div
                className="w-14 h-10 rounded-lg border border-[var(--tz-border)]"
                style={{
                  background:
                    t === "Light"
                      ? "#ffffff"
                      : t === "Dark"
                        ? "#1a1b23"
                        : "linear-gradient(135deg, #ffffff 50%, #1a1b23 50%)",
                }}
              />
              <span
                className={`text-xs font-semibold ${
                  theme === t ? "text-[var(--tz-accent)]" : "text-[var(--tz-text-muted)]"
                }`}
              >
                {t}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Accent Colors */}
      <div>
        <h3 className="text-sm font-semibold text-[var(--tz-text-primary)] mb-3">
          Accent Color
        </h3>
        <div className="flex gap-3">
          {accents.map((color) => (
            <button
              key={color}
              onClick={() => {
                setAccent(color);
                localStorage.setItem("tz_accent", color);
                updatePreferencesAction({ tz_accent: color });
                window.dispatchEvent(new Event("tz_appearance_change"));
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
        <h3 className="text-sm font-semibold text-[var(--tz-text-primary)] mb-3">
          Dashboard Layout
        </h3>
        <div className="space-y-2">
          {(["Compact", "Comfortable", "Spacious"] as const).map((l) => (
            <label
              key={l}
              onClick={() => {
                setLayout(l);
                localStorage.setItem("tz_layout", l);
                updatePreferencesAction({ tz_layout: l });
                window.dispatchEvent(new Event("tz_appearance_change"));
                toast.success(`Layout changed to ${l}`);
              }}
              className="flex items-center gap-3 cursor-pointer p-3 rounded-lg hover:bg-[var(--tz-hover-bg)] transition-colors"
            >
              <div
                className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${
                  layout === l ? "border-[var(--tz-accent)]" : "border-[var(--tz-border)]"
                }`}
              >
                {layout === l && (
                  <div className="w-2 h-2 rounded-full bg-[var(--tz-accent)]" />
                )}
              </div>
              <div>
                <p className="text-sm font-semibold text-[var(--tz-text-secondary)]">
                  {l}
                </p>
                <p className="text-xs text-[var(--tz-text-muted)]">
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
        <h3 className="text-sm font-semibold text-[var(--tz-text-primary)] mb-2">
          Default Page
        </h3>
        <Select
          value={defaultPage}
          onValueChange={(v) => {
            setDefaultPage(v);
            updatePreferencesAction({ tz_default_page: v });
            toast.success(`Default page set to: ${v}`);
          }}
        >
          <SelectTrigger className="w-56 text-xs font-semibold text-[var(--tz-text-primary)] h-9">
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
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    async function loadSecurityPrefs() {
      try {
        const prefs = await getPreferencesAction();
        if (prefs.tz_2fa === true || String(prefs.tz_2fa) === "true")
          setTwoFA(true);
      } catch (e) {
        console.error("Failed to load security preferences", e);
      }
    }
    loadSecurityPrefs();
  }, []);

  const handleUpdatePassword = async () => {
    if (!passwords.current || !passwords.new || !passwords.confirm) {
      toast.error("Please fill in all password fields.");
      return;
    }
    if (passwords.new !== passwords.confirm) {
      toast.error("New passwords do not match.");
      return;
    }

    setIsUpdating(true);
    try {
      await updatePasswordAction(passwords.new);
      toast.success("Password updated successfully!");
      setPasswords({ current: "", new: "", confirm: "" });
    } catch (error: any) {
      toast.error(error.message || "Failed to update password");
    } finally {
      setIsUpdating(false);
    }
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
        <h3 className="text-sm font-semibold text-[var(--tz-text-primary)] mb-4">
          Change Password
        </h3>
        <div className="space-y-3 max-w-sm">
          <div className="space-y-1.5">
            <Label className="text-xs text-[var(--tz-text-muted)] font-bold uppercase tracking-wider">
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
                className="pr-10 text-xs font-semibold text-[var(--tz-text-primary)]"
              />
              <button
                onClick={() => setShowCurrent(!showCurrent)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--tz-text-muted)] hover:text-[var(--tz-text-secondary)] cursor-pointer"
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
            <Label className="text-xs text-[var(--tz-text-muted)] font-bold uppercase tracking-wider">
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
                className="pr-10 text-xs font-semibold text-[var(--tz-text-primary)]"
              />
              <button
                onClick={() => setShowNew(!showNew)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--tz-text-muted)] hover:text-[var(--tz-text-secondary)] cursor-pointer"
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
            <Label className="text-xs text-[var(--tz-text-muted)] font-bold uppercase tracking-wider">
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
                className="pr-10 text-xs font-semibold text-[var(--tz-text-primary)]"
              />
              <button
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--tz-text-muted)] hover:text-[var(--tz-text-secondary)] cursor-pointer"
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
            disabled={isUpdating}
            className="px-5 py-2 rounded-lg text-xs font-bold text-white transition-opacity hover:opacity-90 cursor-pointer shadow-sm disabled:opacity-50"
            style={{
              background: "linear-gradient(135deg, #6366f1 0%, #818cf8 100%)",
            }}
          >
            {isUpdating ? "Updating..." : "Update Password"}
          </button>
        </div>
      </div>

      {/* 2FA */}
      <div className="border-t border-[var(--tz-border-subtle)] pt-5">
        <div className="flex items-center justify-between max-w-sm">
          <div>
            <h3 className="text-sm font-semibold text-[var(--tz-text-primary)]">
              Two-Factor Authentication
            </h3>
            <p className="text-xs text-[var(--tz-text-muted)] mt-0.5">
              Add an extra layer of security to your account
            </p>
          </div>
          <div className="flex items-center gap-3">
            {twoFA && (
              <button
                onClick={() =>
                  toast.success("Configuring Authenticator App keys")
                }
                className="text-xs font-bold text-indigo-600 hover:text-indigo-700 font-medium cursor-pointer"
              >
                Setup
              </button>
            )}
            <Switch
              checked={twoFA}
              onCheckedChange={(v) => {
                setTwoFA(v);
                updatePreferencesAction({ tz_2fa: v });
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
            ✓ 2FA is active. Your account is protected with an authenticator
            app.
          </div>
        )}
      </div>

      {/* Active Sessions */}
      <div className="border-t border-[var(--tz-border-subtle)] pt-5">
        <h3 className="text-sm font-semibold text-[var(--tz-text-primary)] mb-3">
          Active Sessions
        </h3>
        <div className="space-y-2 max-w-md">
          {sessions.map((session) => (
            <div
              key={session.device}
              className="flex items-center justify-between p-4 rounded-xl border bg-[var(--tz-bg-card)]"
              style={{ borderColor: "#e8ecf4" }}
            >
              <div className="flex items-center gap-3">
                <session.icon className="w-5 h-5 text-[var(--tz-text-muted)] shrink-0" />
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-[var(--tz-text-primary)]">
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
                  <p className="text-xs text-[var(--tz-text-muted)] mt-0.5">
                    {session.location} · {session.lastActive}
                  </p>
                </div>
              </div>
              {!session.current && (
                <button
                  onClick={() =>
                    toast.success(`Revoked session: ${session.device}`)
                  }
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
        <div className="absolute -right-8 -top-8 w-36 h-36 rounded-full opacity-10 bg-[var(--tz-bg-card)]" />
        <div className="relative flex items-start justify-between">
          <div>
            <div className="text-xs font-bold px-2.5 py-1 rounded-full mb-3 inline-block bg-white/20 text-white">
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
                  <span className="text-xs text-indigo-100 font-semibold">
                    {f}
                  </span>
                </div>
              ))}
            </div>
          </div>
          <button
            onClick={() =>
              toast.warning("Subscription cancel workflow is disabled")
            }
            className="text-xs font-bold text-indigo-200 hover:text-white transition-colors cursor-pointer"
          >
            Cancel Plan
          </button>
        </div>
      </div>

      {/* Usage */}
      <div className="tz-card px-5 py-4 bg-[var(--tz-bg-card)]">
        <h3 className="text-sm font-semibold text-[var(--tz-text-primary)] mb-3">
          Usage This Month
        </h3>
        <div className="space-y-3">
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-[var(--tz-text-muted)] font-medium">Trades logged</span>
              <span className="font-semibold text-[var(--tz-text-secondary)]">
                83 / Unlimited
              </span>
            </div>
            <div className="h-1.5 rounded-full bg-[var(--tz-hover-bg)] overflow-hidden">
              <div
                className="h-full rounded-full"
                style={{ width: "28%", background: "#6366f1" }}
              />
            </div>
          </div>
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-[var(--tz-text-muted)] font-medium">
                AI Insights used
              </span>
              <span className="font-semibold text-[var(--tz-text-secondary)]">
                14 / Unlimited
              </span>
            </div>
            <div className="h-1.5 rounded-full bg-[var(--tz-hover-bg)] overflow-hidden">
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
        <h3 className="text-sm font-semibold text-[var(--tz-text-primary)] mb-3">
          Invoice History
        </h3>
        <div className="tz-card overflow-hidden bg-[var(--tz-bg-card)]">
          <table className="w-full text-xs">
            <thead>
              <tr style={{ background: "var(--tz-hover-bg)" }}>
                <th className="text-left px-4 py-3 text-[var(--tz-text-muted)] font-semibold">
                  Invoice ID
                </th>
                <th className="text-left px-4 py-3 text-[var(--tz-text-muted)] font-semibold">
                  Date
                </th>
                <th className="text-left px-4 py-3 text-[var(--tz-text-muted)] font-semibold">
                  Amount
                </th>
                <th className="text-left px-4 py-3 text-[var(--tz-text-muted)] font-semibold">
                  Status
                </th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {invoices.map((inv) => (
                <tr
                  key={inv.id}
                  className="border-t border-[var(--tz-border-subtle)] hover:bg-[var(--tz-hover-bg)] transition-colors"
                >
                  <td className="px-4 py-3 font-mono text-[var(--tz-text-secondary)] font-semibold">
                    {inv.id}
                  </td>
                  <td className="px-4 py-3 text-[var(--tz-text-secondary)] font-medium">
                    {inv.date}
                  </td>
                  <td className="px-4 py-3 font-black text-[var(--tz-text-primary)]">
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
                      onClick={() =>
                        toast.success(`Downloaded Invoice: ${inv.id}`)
                      }
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
  const [apiKey, setApiKey] = useState(
    "tz_live_4Xa8bK2mN9pQrL7vWj3hUeYcD5fGsRtZ",
  );
  const maskedKey = `tz_live_${"•".repeat(32)}`;

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
    const chars =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
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
        <h3 className="text-sm font-semibold text-[var(--tz-text-primary)] mb-3">
          Your API Key
        </h3>
        <div
          className="flex items-center gap-3 px-4 py-3 rounded-xl border font-mono text-sm"
          style={{ border: "1px solid #e8ecf4", background: "#f9fafb" }}
        >
          <span className="flex-1 text-[var(--tz-text-secondary)] text-xs overflow-hidden font-mono select-all">
            {revealed ? apiKey : maskedKey}
          </span>
          <button
            onClick={() => setRevealed(!revealed)}
            className="text-[var(--tz-text-muted)] hover:text-[var(--tz-text-secondary)] transition-colors shrink-0 cursor-pointer"
          >
            {revealed ? (
              <EyeOff className="w-4 h-4" />
            ) : (
              <Eye className="w-4 h-4" />
            )}
          </button>
          <button
            onClick={handleCopy}
            className="text-[var(--tz-text-muted)] hover:text-indigo-600 transition-colors shrink-0 cursor-pointer"
          >
            <Copy className="w-4 h-4" />
          </button>
        </div>
        <p className="text-xs text-[var(--tz-text-muted)] mt-2">
          Keep your API key secret. Do not share it in public repositories or
          client-side code.
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
      <div className="border-t border-[var(--tz-border-subtle)] pt-5">
        <h3 className="text-sm font-semibold text-[var(--tz-text-primary)] mb-3">
          Available Endpoints
        </h3>
        <div className="tz-card overflow-hidden bg-[var(--tz-bg-card)]">
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
              <span className="text-xs text-[var(--tz-text-muted)] font-medium flex-1">
                {ep.desc}
              </span>
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
    "Trading Accounts": <TradingAccountsSection />,
    Notifications: <NotificationsSection />,
    Appearance: <AppearanceSection />,
    Security: <SecuritySection />,
    "Billing & Plans": <BillingSection />,
    "API Access": <APIAccessSection />,
  };

  return (
    <div className="tz-page">
      {/* Page Header */}
      <div className="mb-5">
        <h1 className="text-xl font-bold text-[var(--tz-text-primary)]">Settings</h1>
        <p className="text-sm text-[var(--tz-text-muted)] mt-0.5">
          Manage your account preferences and integrations
        </p>
      </div>

      <div className="flex gap-5 items-start">
        {/* Left Sidebar Nav */}
        <div className="w-48 shrink-0">
          <div className="tz-card overflow-hidden">
            {NAV_ITEMS.map(({ label, icon: Icon }) => (
              <button
                key={label}
                onClick={() => setActiveSection(label)}
                className={`w-full flex items-center gap-3 px-4 py-3 text-sm transition-all text-left border-b border-[var(--tz-border-subtle)] last:border-0 cursor-pointer relative ${
                  activeSection === label
                    ? "bg-[var(--tz-accent-muted)] text-[var(--tz-accent)] font-bold"
                    : "text-[var(--tz-text-muted)] hover:bg-[var(--tz-hover-bg)] hover:text-[var(--tz-text-secondary)]"
                }`}
              >
                <Icon
                  className={`w-4 h-4 shrink-0 ${
                    activeSection === label ? "text-[var(--tz-accent)]" : "text-[var(--tz-text-muted)]"
                  }`}
                />
                <span>{label}</span>
                {activeSection === label && (
                  <div
                    className="absolute left-0 top-0 bottom-0 w-0.5 rounded-r-full bg-[var(--tz-accent)]"
                  />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Right Content Area */}
        <div className="flex-1 min-w-0">
          <div className="tz-card px-6 py-5">
            <div className="flex items-center gap-2 mb-5 pb-4 border-b border-[var(--tz-border-subtle)]">
              {(() => {
                const navItem = NAV_ITEMS.find(
                  (n) => n.label === activeSection,
                );
                if (!navItem) return null;
                const Icon = navItem.icon;
                return (
                  <>
                    <Icon className="w-5 h-5 text-[var(--tz-accent)]" />
                    <h2 className="text-base font-bold text-[var(--tz-text-primary)]">
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
