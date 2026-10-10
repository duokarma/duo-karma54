import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/components/ui/toast";
import { supabase } from "@/lib/supabase";
import { checkStorageStatus, uploadToStorage, type StorageStatus } from "@/lib/storage";
import {
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Shield,
  Smartphone,
  RefreshCw,
  UserCheck,
  Cloud,
  Camera,
  Link2,
  Trash2,
} from "lucide-react";

interface PartnerSettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const PARTNER_META: Record<string, { color: string; tagline: string; initial: string }> = {
  Hatim: {
    color: "#6366F1",
    tagline: "Co-Founder · Tech & Product",
    initial: "H",
  },
  Moiz: {
    color: "#10B981",
    tagline: "Co-Founder · Growth & Operations",
    initial: "M",
  },
};

const STORAGE_KEY = "dk_last_partner";

export function PartnerSettingsDialog({
  open,
  onOpenChange,
}: PartnerSettingsDialogProps) {
  const { user, displayName, avatarUrl, updateAvatarUrl } = useAuth();
  const { toast } = useToast();

  const [activeTab, setActiveTab] = useState("account");

  // Avatar state
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [avatarInputUrl, setAvatarInputUrl] = useState("");
  const [showUrlInput, setShowUrlInput] = useState(false);

  // Password state
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Device preference state
  const [savedDevicePartner, setSavedDevicePartner] = useState<string | null>(null);

  // Storage status state
  const [storageStatus, setStorageStatus] = useState<StorageStatus | null>(null);
  const [checkingStorage, setCheckingStorage] = useState(false);

  useEffect(() => {
    if (open) {
      setNewPassword("");
      setConfirmPassword("");
      setErrorMessage(null);
      setSuccessMessage(null);
      setSavedDevicePartner(localStorage.getItem(STORAGE_KEY));
      loadStorageStatus();
    }
  }, [open]);

  const loadStorageStatus = async () => {
    setCheckingStorage(true);
    try {
      const status = await checkStorageStatus();
      setStorageStatus(status);
    } catch {
      // Ignored
    } finally {
      setCheckingStorage(false);
    }
  };

  const partnerInfo = PARTNER_META[displayName] || {
    color: "#8B5CF6",
    tagline: "Partner & Administrator",
    initial: displayName ? displayName[0].toUpperCase() : "P",
  };

  const handleAvatarFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast({
        title: "Invalid file type",
        description: "Please select a JPG, PNG, or WebP image.",
        variant: "destructive",
      });
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Avatar image must be under 5MB.",
        variant: "destructive",
      });
      return;
    }

    setUploadingAvatar(true);
    try {
      const res = await uploadToStorage(file, { folder: "general" });
      if (!res.publicUrl) {
        throw new Error("Failed to get public URL");
      }

      await updateAvatarUrl(res.publicUrl);
      toast({
        title: "Avatar updated",
        description: "Your new profile photo has been saved to Supabase storage.",
      });
    } catch (err: any) {
      toast({
        title: "Upload failed",
        description: err.message || "Could not upload image to Supabase storage.",
        variant: "destructive",
      });
    } finally {
      setUploadingAvatar(false);
      if (e.target) e.target.value = "";
    }
  };

  const handleSaveUrlAvatar = async () => {
    if (!avatarInputUrl.trim()) return;
    setUploadingAvatar(true);
    try {
      await updateAvatarUrl(avatarInputUrl.trim());
      setAvatarInputUrl("");
      setShowUrlInput(false);
      toast({
        title: "Avatar updated",
        description: "Your profile picture has been updated from the provided image link.",
      });
    } catch (err: any) {
      toast({
        title: "Save failed",
        description: err.message || "Could not update avatar URL.",
        variant: "destructive",
      });
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleRemoveAvatar = async () => {
    setUploadingAvatar(true);
    try {
      await updateAvatarUrl("");
      toast({
        title: "Avatar removed",
        description: "Reverted to default partner initial emblem.",
      });
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (newPassword.length < 8) {
      setErrorMessage("Password must be at least 8 characters long.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMessage("New passwords do not match.");
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) throw error;

      setSuccessMessage("Password updated successfully! Next time you log in, use your new password.");
      setNewPassword("");
      setConfirmPassword("");
      toast({
        title: "Password Changed",
        description: "Your account password has been securely updated.",
      });
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to update password. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSetDevicePartner = (partner: "hatim" | "moiz") => {
    localStorage.setItem(STORAGE_KEY, partner);
    setSavedDevicePartner(partner);
    toast({
      title: "Device Preference Saved",
      description: `This device will automatically open with ${partner === "hatim" ? "Hatim" : "Moiz"}'s workspace.`,
    });
  };

  const handleClearDevicePreference = () => {
    localStorage.removeItem(STORAGE_KEY);
    setSavedDevicePartner(null);
    toast({
      title: "Preference Cleared",
      description: "Login page will show partner selection on subsequent visits.",
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl border border-white/10 bg-[#121215]/95 backdrop-blur-2xl p-6 shadow-2xl text-white">
        <DialogHeader className="space-y-1">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/5 border border-white/10">
                <Shield className="h-4 w-4 text-white" />
              </div>
              <div>
                <DialogTitle className="text-lg font-semibold text-white">
                  Partner & System Settings
                </DialogTitle>
                <DialogDescription className="text-xs text-white/50">
                  Manage partner credentials and Supabase storage.
                </DialogDescription>
              </div>
            </div>
          </div>
        </DialogHeader>

        {/* ── Tabs Navigation ── */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-3">
          <TabsList className="grid w-full grid-cols-2 bg-white/5 border border-white/10 p-1">
            <TabsTrigger value="account" className="text-xs">
              Account & Password
            </TabsTrigger>
            <TabsTrigger value="storage" className="text-xs flex items-center gap-1.5">
              <Cloud className="h-3.5 w-3.5" />
              Supabase Storage
            </TabsTrigger>
          </TabsList>

          {/* ══════════════ TAB 1: ACCOUNT & PASSWORD ══════════════ */}
          <TabsContent value="account" className="mt-4 space-y-4">
            {/* Partner Profile Card with Avatar Option */}
            <div className="rounded-xl border border-white/10 bg-white/4 p-4 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="relative group shrink-0">
                    {avatarUrl ? (
                      <img
                        src={avatarUrl}
                        alt={displayName}
                        className="h-14 w-14 rounded-full object-cover shadow-lg"
                        style={{ border: `2px solid ${partnerInfo.color}` }}
                      />
                    ) : (
                      <div
                        className="flex h-14 w-14 items-center justify-center rounded-full text-xl font-bold shadow-md ring-2 ring-white/10"
                        style={{
                          backgroundColor: `${partnerInfo.color}25`,
                          color: partnerInfo.color,
                          border: `1.5px solid ${partnerInfo.color}60`,
                        }}
                      >
                        {partnerInfo.initial}
                      </div>
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-white">{displayName}</p>
                      <span
                        className="rounded-full px-2 py-0.5 text-[10px] font-medium"
                        style={{
                          backgroundColor: `${partnerInfo.color}20`,
                          color: partnerInfo.color,
                          border: `1px solid ${partnerInfo.color}40`,
                        }}
                      >
                        Partner
                      </span>
                    </div>
                    <p className="text-[11px] text-white/40">{user?.email ?? ""}</p>
                    <p className="text-[10px] text-white/50 mt-0.5">{partnerInfo.tagline}</p>
                  </div>
                </div>

                {/* Avatar Action Controls */}
                <div className="flex flex-wrap items-center gap-2">
                  <label className="cursor-pointer inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 px-3 py-1.5 text-xs text-white transition-colors">
                    <Camera className="h-3.5 w-3.5 text-white/70" />
                    <span>Upload Photo</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarFileUpload}
                      className="hidden"
                      disabled={uploadingAvatar}
                    />
                  </label>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowUrlInput(!showUrlInput)}
                    className="text-xs h-8 text-white/70 hover:text-white"
                  >
                    <Link2 className="mr-1.5 h-3.5 w-3.5" />
                    {showUrlInput ? "Hide Link" : "Image Link"}
                  </Button>
                  {avatarUrl && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={handleRemoveAvatar}
                      className="text-xs h-8 text-rose-400 hover:text-rose-300 hover:bg-rose-500/10"
                    >
                      <Trash2 className="h-3.5 w-3.5 mr-1" />
                      Remove
                    </Button>
                  )}
                </div>
              </div>

              {/* URL paste input if toggled */}
              {showUrlInput && (
                <div className="pt-2 border-t border-white/5 flex gap-2">
                  <Input
                    placeholder="https://example.com/my-profile.jpg"
                    value={avatarInputUrl}
                    onChange={(e) => setAvatarInputUrl(e.target.value)}
                    className="h-8 text-xs border-white/10 bg-white/5 text-white placeholder:text-white/30"
                  />
                  <Button
                    size="sm"
                    onClick={handleSaveUrlAvatar}
                    disabled={!avatarInputUrl.trim() || uploadingAvatar}
                    className="h-8 text-xs bg-indigo-600 hover:bg-indigo-500 text-white shrink-0"
                  >
                    {uploadingAvatar ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Save Link"}
                  </Button>
                </div>
              )}
            </div>

            {/* Change Password Card */}
            <div className="rounded-xl border border-white/10 bg-white/4 p-4 space-y-3">
              <div>
                <p className="text-xs font-semibold text-white">Update Password</p>
                <p className="text-[11px] text-white/50">
                  Set a new personal login password for {displayName}'s account.
                </p>
              </div>

              {errorMessage && (
                <div className="flex items-center gap-2 rounded-lg bg-rose-500/10 border border-rose-500/20 p-2.5 text-xs text-rose-400">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {successMessage && (
                <div className="flex items-center gap-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 p-2.5 text-xs text-emerald-400">
                  <CheckCircle2 className="h-4 w-4 shrink-0" />
                  <span>{successMessage}</span>
                </div>
              )}

              <form onSubmit={handlePasswordSubmit} className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div className="relative">
                    <Input
                      type={showNewPassword ? "text" : "password"}
                      placeholder="New password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="border-white/10 bg-white/5 pr-9 text-xs text-white placeholder:text-white/30 focus-visible:ring-1 focus-visible:ring-indigo-500"
                      disabled={isLoading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 z-20 flex h-6 w-6 items-center justify-center rounded text-white/40 hover:text-white transition-colors cursor-pointer"
                      tabIndex={-1}
                      aria-label={showNewPassword ? "Hide password" : "Show password"}
                    >
                      {showNewPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                    </button>
                  </div>

                  <div className="relative">
                    <Input
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Confirm password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="border-white/10 bg-white/5 pr-9 text-xs text-white placeholder:text-white/30 focus-visible:ring-1 focus-visible:ring-indigo-500"
                      disabled={isLoading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 z-20 flex h-6 w-6 items-center justify-center rounded text-white/40 hover:text-white transition-colors cursor-pointer"
                      tabIndex={-1}
                      aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                    >
                      {showConfirmPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                    </button>
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={isLoading || !newPassword || !confirmPassword}
                  className="w-full text-xs h-8 bg-indigo-600 hover:bg-indigo-500 text-white font-medium"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
                      Updating Password...
                    </>
                  ) : (
                    "Save New Password"
                  )}
                </Button>
              </form>
            </div>

            {/* Remember Device Preference */}
            <div className="rounded-xl border border-white/10 bg-white/2 p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1.5">
                  <Smartphone className="h-3.5 w-3.5 text-white/40" />
                  <p className="text-xs font-medium text-white/80">Remember This Device</p>
                </div>
                {savedDevicePartner && (
                  <span className="text-[10px] text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded px-1.5 py-0.5">
                    Active: {savedDevicePartner === "hatim" ? "Hatim" : "Moiz"}
                  </span>
                )}
              </div>
              <p className="text-[11px] text-white/40 mb-3">
                Auto-select partner identity on this device to streamline login without prompting.
              </p>
              <div className="flex gap-2">
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => handleSetDevicePartner("hatim")}
                  className={`flex-1 text-xs h-8 ${savedDevicePartner === "hatim" ? "border-indigo-500 text-indigo-400 bg-indigo-500/10" : "border-white/10 text-white/70"}`}
                >
                  <UserCheck className="mr-1.5 h-3.5 w-3.5 text-indigo-400" />
                  Set Hatim as Default
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => handleSetDevicePartner("moiz")}
                  className={`flex-1 text-xs h-8 ${savedDevicePartner === "moiz" ? "border-emerald-500 text-emerald-400 bg-emerald-500/10" : "border-white/10 text-white/70"}`}
                >
                  <UserCheck className="mr-1.5 h-3.5 w-3.5 text-emerald-400" />
                  Set Moiz as Default
                </Button>
                {savedDevicePartner && (
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={handleClearDevicePreference}
                    className="text-xs h-8 text-white/40 hover:text-white"
                  >
                    Clear
                  </Button>
                )}
              </div>
            </div>
          </TabsContent>

          {/* ══════════════ TAB 2: SUPABASE STORAGE ══════════════ */}
          <TabsContent value="storage" className="mt-4 space-y-3.5">
            {/* Status card */}
            <div className="rounded-xl border border-white/10 bg-white/4 p-3.5 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <Cloud className="h-4 w-4 text-emerald-400" />
                  <p className="text-xs font-semibold text-white">Supabase Object Storage</p>
                </div>
                <p className="text-[11px] text-white/40 mt-0.5">
                  Bucket: <code className="text-emerald-300 bg-white/10 px-1 py-0.5 rounded font-mono">duokarma-files</code> &bull; Unified with Database & Auth
                </p>
              </div>
              <div className="flex items-center gap-2">
                {checkingStorage ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin text-white/40" />
                ) : storageStatus?.configured ? (
                  <span className="rounded-full bg-emerald-500/20 border border-emerald-500/30 px-2.5 py-1 text-[11px] font-medium text-emerald-400 flex items-center gap-1.5">
                    <CheckCircle2 className="h-3 w-3" />
                    Ready & Active
                  </span>
                ) : (
                  <span className="rounded-full bg-amber-500/20 border border-amber-500/30 px-2.5 py-1 text-[11px] font-medium text-amber-400 flex items-center gap-1.5">
                    <AlertCircle className="h-3 w-3" />
                    Run Migration Script
                  </span>
                )}
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={loadStorageStatus}
                  className="h-7 w-7 p-0 text-white/40 hover:text-white"
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>

            {/* Storage Highlights */}
            <div className="rounded-xl border border-white/10 bg-white/2 p-3.5 space-y-2.5 text-xs text-white/70">
              <p className="font-medium text-white text-[11px] uppercase tracking-wider">
                Configuration Highlights:
              </p>
              <ul className="space-y-2 text-[11px] text-white/60">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong>Zero Extra Setup:</strong> Uses your existing Supabase project. No external card or Cloudflare tokens needed.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong>Public CDN URLs:</strong> Lead attachments and client files generate instant public links accessible for invoice and proposal sharing.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong>Automatic Partitioning:</strong> Uploads are systematically partitioned into <code className="text-white/80 bg-white/10 px-1 rounded">leads/&#123;id&#125;/</code>, <code className="text-white/80 bg-white/10 px-1 rounded">clients/&#123;id&#125;/</code>, and <code className="text-white/80 bg-white/10 px-1 rounded">documents/</code>.</span>
                </li>
              </ul>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
