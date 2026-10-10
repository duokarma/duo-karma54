import { useState, useEffect, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { useEcosystemApps, type EcosystemApp } from "@/hooks/use-ecosystem-apps";
import { uploadToStorage } from "@/lib/storage";
import {
  Plus,
  Pencil,
  Trash2,
  ExternalLink,
  Upload,
  Globe,
  RotateCcw,
  Sparkles,
  Check,
  Loader2,
  Layers,
  ArrowLeft,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ManageAppsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialEditAppId?: string | null;
}

const SUGGESTED_CATEGORIES = [
  "Client Admin",
  "Live Website",
  "Admin Portal",
  "Official Hub",
  "E-Commerce",
  "Internal Tool",
];

export function ManageAppsDialog({
  open,
  onOpenChange,
  initialEditAppId,
}: ManageAppsDialogProps) {
  const { apps, addApp, updateApp, deleteApp, resetToDefaults } = useEcosystemApps();
  const { toast } = useToast();

  const [view, setView] = useState<"list" | "form">("list");
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form fields
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [category, setCategory] = useState("Client Admin");

  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle open state & initial editing
  useEffect(() => {
    if (open) {
      if (initialEditAppId) {
        const appToEdit = apps.find((a) => a.id === initialEditAppId);
        if (appToEdit) {
          startEdit(appToEdit);
          return;
        }
      }
      setView("list");
    } else {
      resetForm();
    }
  }, [open, initialEditAppId]);

  const resetForm = () => {
    setEditingId(null);
    setTitle("");
    setUrl("");
    setImageUrl("");
    setCategory("Client Admin");
    setView("list");
  };

  const startEdit = (app: EcosystemApp) => {
    setEditingId(app.id);
    setTitle(app.title);
    setUrl(app.url);
    setImageUrl(app.imageUrl);
    setCategory(app.category || "App");
    setView("form");
  };

  const startCreate = () => {
    resetForm();
    setView("form");
  };

  // Image file handler with Supabase Storage upload + fallback to Base64 data URL
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      // 1. Try Supabase Storage upload
      try {
        const res = await uploadToStorage(file, { folder: "general" });
        if (res?.publicUrl) {
          setImageUrl(res.publicUrl);
          toast({
            title: "Logo Uploaded",
            description: "App logo uploaded successfully to cloud storage.",
          });
          setIsUploading(false);
          return;
        }
      } catch (uploadErr) {
        console.warn("Storage upload fallback to base64:", uploadErr);
      }

      // 2. Fallback: Base64 Data URL (always works offline & instant)
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64 = event.target?.result as string;
        if (base64) {
          setImageUrl(base64);
          toast({
            title: "Logo Ready",
            description: "Image loaded and cached locally.",
          });
        }
        setIsUploading(false);
      };
      reader.onerror = () => {
        toast({
          title: "Image Error",
          description: "Could not read image file. Please try another.",
          variant: "destructive",
        });
        setIsUploading(false);
      };
      reader.readAsDataURL(file);
    } catch {
      setIsUploading(false);
      toast({
        title: "Upload Failed",
        description: "Failed to upload image. Please try pasting a direct image URL.",
        variant: "destructive",
      });
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    const cleanTitle = title.trim();
    let cleanUrl = url.trim();

    if (!cleanTitle) {
      toast({
        title: "Title Required",
        description: "Please enter an app name or title.",
        variant: "destructive",
      });
      return;
    }

    if (!cleanUrl) {
      toast({
        title: "URL Required",
        description: "Please enter a valid website or web app URL.",
        variant: "destructive",
      });
      return;
    }

    // Auto prepend https:// if missing
    if (!cleanUrl.startsWith("http://") && !cleanUrl.startsWith("https://")) {
      cleanUrl = `https://${cleanUrl}`;
    }

    const finalImage = imageUrl.trim() || "/logo.jpeg";

    setIsSaving(true);
    try {
      if (editingId) {
        await updateApp(editingId, {
          title: cleanTitle,
          url: cleanUrl,
          imageUrl: finalImage,
          category: category.trim() || "App",
        });
        toast({
          title: "App Updated",
          description: `"${cleanTitle}" updated in real-time.`,
        });
      } else {
        await addApp({
          title: cleanTitle,
          url: cleanUrl,
          imageUrl: finalImage,
          category: category.trim() || "App",
        });
        toast({
          title: "App Added",
          description: `"${cleanTitle}" added to your sidebar in real-time.`,
        });
      }

      resetForm();
    } catch (err) {
      console.error("Save error:", err);
      toast({
        title: "Save Failed",
        description: "Could not save the app. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to remove "${name}" from the sidebar?`)) {
      await deleteApp(id);
      toast({
        title: "App Removed",
        description: `"${name}" was removed from the sidebar.`,
      });
    }
  };

  const handleResetDefaults = async () => {
    if (
      window.confirm(
        "Reset all apps to original DuoKarma defaults (Ten11, WOW Salon, WOW Salon Admin, DuoKarma Main)?"
      )
    ) {
      await resetToDefaults();
      toast({
        title: "Defaults Restored",
        description: "Ecosystem apps reset to original configuration.",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[540px] max-h-[88vh] overflow-y-auto p-5 sm:p-6 bg-[#0E131F]/95 backdrop-blur-2xl border border-white/10 shadow-2xl">
        <DialogHeader className="pb-3 border-b border-white/[0.08]">
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-lg font-semibold text-white flex items-center gap-2">
                <Layers className="h-5 w-5 text-[var(--color-accent)]" />
                {view === "list" ? "Ecosystem Apps & Quick Links" : editingId ? "Edit App" : "Add New App"}
              </DialogTitle>
              <DialogDescription className="text-xs text-ink-faint mt-0.5">
                {view === "list"
                  ? "Launch and manage custom app links with live logos in your sidebar."
                  : "Changes update in real-time across your workspace."}
              </DialogDescription>
            </div>
            {view === "form" && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => resetForm()}
                className="h-8 text-xs text-ink-faint hover:text-white"
              >
                <ArrowLeft className="h-3.5 w-3.5 mr-1" /> Back
              </Button>
            )}
          </div>
        </DialogHeader>

        {view === "list" ? (
          /* ──────── LIST VIEW ──────── */
          <div className="space-y-4 pt-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-ink-dim uppercase tracking-wider">
                Current Apps ({apps.length})
              </span>
              <Button
                size="sm"
                onClick={startCreate}
                className="h-8 gap-1.5 text-xs bg-[var(--color-accent)] hover:bg-[var(--color-accent)]/90 text-white shadow-sm"
              >
                <Plus className="h-3.5 w-3.5" />
                Add New App
              </Button>
            </div>

            {apps.length === 0 ? (
              <div className="rounded-xl border border-dashed border-white/15 p-8 text-center bg-white/[0.02]">
                <Globe className="h-8 w-8 text-ink-faint mx-auto mb-2 opacity-50" />
                <p className="text-sm font-medium text-ink">No apps added yet</p>
                <p className="text-xs text-ink-faint mt-1">
                  Add custom links and logos to build your team's quick access ecosystem.
                </p>
                <Button size="sm" onClick={startCreate} className="mt-4 gap-1.5 text-xs">
                  <Plus className="h-3.5 w-3.5" /> Add First App
                </Button>
              </div>
            ) : (
              <div className="space-y-2 max-h-[360px] overflow-y-auto pr-1 custom-scrollbar">
                {apps.map((app) => (
                  <div
                    key={app.id}
                    className="group flex items-center justify-between p-2.5 rounded-xl border border-white/[0.08] bg-white/[0.02] hover:bg-white/[0.05] hover:border-white/20 transition-all duration-200"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="h-10 w-10 shrink-0 rounded-lg overflow-hidden border border-white/10 bg-black/40 flex items-center justify-center shadow-inner">
                        {app.imageUrl ? (
                          <img
                            src={app.imageUrl}
                            alt={app.title}
                            className="h-full w-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = "/logo.jpeg";
                            }}
                          />
                        ) : (
                          <span className="text-sm font-bold text-ink-dim">
                            {app.title[0]?.toUpperCase() || "A"}
                          </span>
                        )}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-semibold text-white truncate">{app.title}</p>
                          {app.category && (
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-white/10 text-ink-dim shrink-0">
                              {app.category}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-ink-faint truncate font-mono mt-0.5">
                          {app.url}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0 ml-2">
                      <a
                        href={app.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 rounded-lg text-ink-faint hover:text-white hover:bg-white/10 transition-colors"
                        title="Open in new tab"
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                      </a>
                      <button
                        onClick={() => startEdit(app)}
                        className="p-1.5 rounded-lg text-ink-faint hover:text-[var(--color-accent)] hover:bg-white/10 transition-colors"
                        title="Edit app"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(app.id, app.title)}
                        className="p-1.5 rounded-lg text-ink-faint hover:text-red-400 hover:bg-red-500/10 transition-colors"
                        title="Remove app"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="pt-2 border-t border-white/[0.08] flex items-center justify-between text-xs text-ink-faint">
              <span>All changes sync immediately to sidebar</span>
              <button
                onClick={handleResetDefaults}
                className="flex items-center gap-1 hover:text-ink transition-colors text-[11px]"
              >
                <RotateCcw className="h-3 w-3" />
                Reset Defaults
              </button>
            </div>
          </div>
        ) : (
          /* ──────── FORM VIEW (ADD / EDIT) ──────── */
          <form onSubmit={handleSave} className="space-y-4 pt-3">
            {/* App Title */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-ink-dim">
                App Name / Title <span className="text-red-400">*</span>
              </label>
              <Input
                placeholder="e.g. Ten11 Salon Admin, WOW Salon Website"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                autoFocus
                required
              />
            </div>

            {/* App URL */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-ink-dim">
                App Link / URL <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <Globe className="absolute left-3 top-2.5 h-4 w-4 text-ink-faint pointer-events-none" />
                <Input
                  className="pl-9 font-mono text-xs"
                  placeholder="https://tens-11.vercel.app/ or wowsalon.in"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Logo Image Selection & Real-Time Preview */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-ink-dim flex items-center justify-between">
                <span>App Logo / Image</span>
                <span className="text-[10px] text-ink-faint">PNG, JPG, WEBP, or SVG</span>
              </label>

              {/* Logo Preview Row */}
              <div className="flex items-center gap-3 p-3 rounded-xl border border-white/[0.08] bg-white/[0.02]">
                <div className="h-12 w-12 shrink-0 rounded-xl overflow-hidden border border-white/15 bg-black/60 shadow-md flex items-center justify-center relative">
                  {imageUrl ? (
                    <img
                      src={imageUrl}
                      alt="Logo preview"
                      className="h-full w-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "/logo.jpeg";
                      }}
                    />
                  ) : (
                    <Sparkles className="h-5 w-5 text-ink-faint opacity-60" />
                  )}
                  {isUploading && (
                    <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
                      <Loader2 className="h-5 w-5 animate-spin text-white" />
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0 space-y-1.5">
                  <div className="flex items-center gap-2">
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileUpload}
                      accept="image/*"
                      className="hidden"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isUploading}
                      className="h-7 text-xs gap-1.5 border-white/15 bg-white/5 hover:bg-white/10"
                    >
                      <Upload className="h-3 w-3" />
                      {isUploading ? "Uploading..." : "Upload from Device"}
                    </Button>

                    {imageUrl && (
                      <button
                        type="button"
                        onClick={() => setImageUrl("")}
                        className="text-[11px] text-red-400 hover:underline"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                  <Input
                    type="text"
                    placeholder="Or enter direct image URL / path (e.g. /apps/ten11-logo.jpg)"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    className="h-7 text-xs font-mono"
                  />
                </div>
              </div>
            </div>

            {/* Category / Badge */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-ink-dim">
                Category / Badge
              </label>
              <Input
                placeholder="e.g. Client Admin, Live Website"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              />
              <div className="flex flex-wrap gap-1.5 pt-1">
                {SUGGESTED_CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setCategory(cat)}
                    className={cn(
                      "px-2 py-0.5 rounded-full text-[10px] font-medium transition-colors border",
                      category === cat
                        ? "bg-[var(--color-accent)]/20 border-[var(--color-accent)] text-white"
                        : "bg-white/5 border-white/10 text-ink-faint hover:text-ink hover:bg-white/10"
                    )}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="flex items-center justify-end gap-2 pt-3 border-t border-white/[0.08]">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={resetForm}
                disabled={isSaving}
                className="text-xs"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={isSaving || isUploading}
                className="h-8 gap-1.5 text-xs bg-[var(--color-accent)] hover:bg-[var(--color-accent)]/90 text-white min-w-[100px]"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" /> Saving...
                  </>
                ) : (
                  <>
                    <Check className="h-3.5 w-3.5" />
                    {editingId ? "Update App" : "Add to Sidebar"}
                  </>
                )}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
