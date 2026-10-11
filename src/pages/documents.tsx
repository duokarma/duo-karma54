import { useMemo, useState, useRef } from "react";
import { m as motion, AnimatePresence } from "framer-motion";
import { Plus, Search, FileText, Sheet, Image as ImageIcon, File, FolderOpen, MoreVertical, Pencil, Trash2, Link as LinkIcon, Eye, Download } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/shared/empty-state";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import type { Document } from "@/types";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/components/ui/toast";
import { uploadToStorage, deleteFromStorage } from "@/lib/storage";
import { logActivity } from "@/lib/activity-logger";
import { useAuth } from "@/hooks/use-auth";
import { useEffect } from "react";

const typeIcon: Record<string, typeof FileText> = {
  pdf: FileText,
  doc: FileText,
  xls: Sheet,
  image: ImageIcon,
  other: File,
};

const typeColor: Record<string, string> = {
  pdf: "text-rose bg-rose/12",
  doc: "text-electric bg-electric/12",
  xls: "text-emerald bg-emerald/12",
  image: "text-violet bg-violet/12",
  other: "text-ink-dim bg-white/10",
};

export function DocumentsPage() {
  const queryClient = useQueryClient();
  const { displayName } = useAuth();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [query, setQuery] = useState("");
  const [folderFilter, setFolderFilter] = useState("all");
  const [renameDialogOpen, setRenameDialogOpen] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState<Document | null>(null);
  const [newName, setNewName] = useState("");
  
  // Delete Confirmation state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [docToDelete, setDocToDelete] = useState<Document | null>(null);

  // Image Viewer state
  const [viewerDoc, setViewerDoc] = useState<Document | null>(null);

  // Real-time synchronization for documents table across devices
  useEffect(() => {
    const channelId = `docs_realtime_${Math.random().toString(36).substring(2, 9)}`;
    const channel = supabase
      .channel(channelId)
      .on("postgres_changes", { event: "*", schema: "public", table: "documents" }, () => {
        queryClient.invalidateQueries({ queryKey: ["documents"] });
        queryClient.invalidateQueries({ queryKey: ["activities"] });
        queryClient.invalidateQueries({ queryKey: ["latest_activity"] });
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  const { data: documents = [], isLoading } = useQuery({
    queryKey: ["documents"],
    queryFn: async () => {
      const { data, error } = await supabase.from("documents").select("*");
      if (error) throw error;
      return data as Document[];
    },
  });

function getDocUrl(doc: Document): string {
  if (doc.url && doc.url.startsWith("http")) return doc.url;
  return supabase.storage.from("duokarma-files").getPublicUrl(doc.id).data?.publicUrl || "";
}

  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      let type = "other";
      if (file.type.includes("pdf")) type = "pdf";
      else if (file.type.includes("image")) type = "image";
      else if (file.name.endsWith(".doc") || file.name.endsWith(".docx") || file.type.includes("word")) type = "doc";
      else if (file.name.endsWith(".xls") || file.name.endsWith(".xlsx") || file.type.includes("excel")) type = "xls";

      // 1. Upload directly to Supabase Storage
      const uploaded = await uploadToStorage(file, { folder: "documents" });

      // 2. Save document record to Supabase database with clean DATE format and key as ID
      const cleanDate = new Date().toISOString().split("T")[0];
      const docPayload: any = {
        id: uploaded.key,
        name: uploaded.fileName,
        type,
        size: uploaded.fileSize,
        modifiedDate: cleanDate,
        folder: "Uploads",
        sharedWith: 0,
      };

      // Try inserting with url if supported by schema, otherwise fallback to base schema
      let { error: dbError } = await supabase.from("documents").insert({
        ...docPayload,
        url: uploaded.publicUrl,
      });

      if (dbError && (dbError.message?.includes("url") || dbError.code === "PGRST204" || dbError.code === "42703")) {
        const fallback = await supabase.from("documents").insert(docPayload);
        dbError = fallback.error;
      }

      if (dbError) throw dbError;
      return { ...docPayload, url: uploaded.publicUrl };
    },
    onSuccess: (newDoc) => {
      logActivity({
        type: "document",
        message: `New document "${newDoc.name}" (${newDoc.size}) uploaded`,
        actor: displayName || "Partner",
      });
      queryClient.invalidateQueries({ queryKey: ["documents"] });
      queryClient.invalidateQueries({ queryKey: ["activities"] });
      queryClient.invalidateQueries({ queryKey: ["latest_activity"] });
      toast({ title: "File uploaded successfully", variant: "success" });
    },
    onError: (error: Error) => {
      toast({ title: "Upload Failed", description: error.message, variant: "error" });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await deleteFromStorage(id).catch(() => {});
      const { error } = await supabase.from("documents").delete().eq("id", id);
      if (error) throw error;
      return id;
    },
    onSuccess: (deletedId) => {
      const docName = docToDelete?.name || "Document";
      logActivity({
        type: "document",
        message: `Document "${docName}" removed from workspace`,
        actor: displayName || "Partner",
      });
      queryClient.invalidateQueries({ queryKey: ["documents"] });
      queryClient.invalidateQueries({ queryKey: ["activities"] });
      queryClient.invalidateQueries({ queryKey: ["latest_activity"] });
      setDeleteDialogOpen(false);
      setDocToDelete(null);
      if (viewerDoc?.id === deletedId) {
        setViewerDoc(null);
      }
      toast({ title: "File deleted successfully", description: `"${docName}" was removed from the workspace.`, variant: "success" });
    },
    onError: (error: Error) => {
      toast({ title: "Delete Failed", description: error.message || "Failed to delete file", variant: "error" });
    }
  });

  const renameMutation = useMutation({
    mutationFn: async ({ id, name }: { id: string; name: string }) => {
      const { error } = await supabase.from("documents").update({ name }).eq("id", id);
      if (error) throw error;
      return { id, name };
    },
    onSuccess: (data) => {
      logActivity({
        type: "document",
        message: `Document renamed to "${data.name}"`,
        actor: displayName || "Partner",
      });
      queryClient.invalidateQueries({ queryKey: ["documents"] });
      queryClient.invalidateQueries({ queryKey: ["activities"] });
      queryClient.invalidateQueries({ queryKey: ["latest_activity"] });
      setRenameDialogOpen(false);
      setSelectedDoc(null);
      setNewName("");
      toast({ title: "File renamed successfully", variant: "success" });
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      uploadMutation.mutate(file);
    }
    if (e.target) e.target.value = "";
  };

  const copyLink = (url: string) => {
    navigator.clipboard.writeText(url);
    toast({ title: "Link copied to clipboard", description: "You can now paste and share this link.", variant: "success" });
  };

  const folders = useMemo(() => Array.from(new Set(documents.map((d) => d.folder))), [documents]);

  const filtered = useMemo(() => {
    return documents.filter((d) => {
      const matchesQuery = d.name.toLowerCase().includes(query.toLowerCase());
      const matchesFolder = folderFilter === "all" || d.folder === folderFilter;
      return matchesQuery && matchesFolder;
    });
  }, [documents, query, folderFilter]);

  if (isLoading) {
    return <div className="p-8 text-center text-ink-dim">Loading documents...</div>;
  }

  return (
    <div>
      <PageHeader
        title="Documents"
        description={`${documents.length} files across ${folders.length} folders`}
        actions={
          <>
            <input type="file" className="hidden" ref={fileInputRef} onChange={handleFileChange} />
            <Button onClick={() => fileInputRef.current?.click()} disabled={uploadMutation.isPending}>
              <Plus className="h-4 w-4 mr-2" /> {uploadMutation.isPending ? "Uploading..." : "Upload File"}
            </Button>
          </>
        }
      />

      <div className="mb-5 flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[220px] max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-faint" />
          <Input placeholder="Search documents..." className="pl-10" value={query} onChange={(e) => setQuery(e.target.value)} />
        </div>
        <Select value={folderFilter} onValueChange={setFolderFilter}>
          <SelectTrigger className="w-52">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All folders</SelectItem>
            {folders.map((f) => (
              <SelectItem key={f} value={f}>
                {f}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {filtered.length === 0 ? (
        <Card>
          <EmptyState
            icon={FolderOpen}
            title="No documents found"
            description="Try adjusting your search or folder filter."
            actionLabel="Clear filters"
            onAction={() => {
              setQuery("");
              setFolderFilter("all");
            }}
          />
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((doc, i) => {
            const Icon = typeIcon[doc.type] || File;
            const fileUrl = getDocUrl(doc);
            const hasUrl = !!fileUrl;
            return (
              <motion.div key={doc.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
                <Card className="group relative flex flex-col p-4 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 hover:border-electric/30 h-full">
                  <div className="flex items-start justify-between relative z-10">
                    <div 
                      className={cn(
                        "flex h-12 w-12 items-center justify-center rounded-xl overflow-hidden", 
                        typeColor[doc.type],
                        hasUrl && doc.type === "image" && "cursor-pointer hover:ring-2 hover:ring-electric/50 transition-all"
                      )}
                      onClick={() => {
                        if (hasUrl && doc.type === "image") {
                          setViewerDoc(doc);
                        }
                      }}
                      title={hasUrl && doc.type === "image" ? "Click to view full image" : undefined}
                    >
                      {doc.type === "image" && hasUrl ? (
                        <img src={fileUrl} alt={doc.name} className="h-full w-full rounded-xl object-cover" />
                      ) : (
                        <Icon className="h-6 w-6" />
                      )}
                    </div>

                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        className="text-ink-faint hover:text-rose hover:bg-rose/10 opacity-75 sm:opacity-0 sm:group-hover:opacity-100 transition-all cursor-pointer"
                        title="Delete document"
                        onClick={(e) => {
                          e.stopPropagation();
                          setDocToDelete(doc);
                          setDeleteDialogOpen(true);
                        }}
                      >
                        <Trash2 className="h-4 w-4 text-rose/80 hover:text-rose" />
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon-sm" className="opacity-90 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity cursor-pointer">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48 z-[150]">
                          {hasUrl && doc.type === "image" && (
                            <DropdownMenuItem onClick={() => setViewerDoc(doc)}>
                              <Eye className="mr-2 h-4 w-4" /> View Image
                            </DropdownMenuItem>
                          )}
                          {hasUrl && (
                            <DropdownMenuItem onClick={() => window.open(fileUrl, "_blank")}>
                              <Download className="mr-2 h-4 w-4" /> Download
                            </DropdownMenuItem>
                          )}
                          {hasUrl && (
                            <DropdownMenuItem onClick={() => copyLink(fileUrl)}>
                              <LinkIcon className="mr-2 h-4 w-4" /> Copy Share Link
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem onClick={() => {
                            setSelectedDoc(doc);
                            setNewName(doc.name);
                            setRenameDialogOpen(true);
                          }}>
                            <Pencil className="mr-2 h-4 w-4" /> Rename
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => {
                              setDocToDelete(doc);
                              setDeleteDialogOpen(true);
                            }} 
                            className="text-rose focus:text-rose focus:bg-rose/10 cursor-pointer font-medium"
                          >
                            <Trash2 className="mr-2 h-4 w-4" /> Delete Document
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                  
                  <div className="mt-4 flex-1">
                    <p 
                      className={cn(
                        "truncate font-semibold text-ink leading-tight",
                        hasUrl && doc.type === "image" ? "cursor-pointer hover:text-electric transition-colors" : "cursor-default"
                      )} 
                      title={doc.name}
                      onClick={() => {
                        if (hasUrl && doc.type === "image") {
                          setViewerDoc(doc);
                        }
                      }}
                    >
                      {doc.name}
                    </p>
                    <p className="mt-1 text-xs text-ink-faint">{doc.folder}</p>
                  </div>
                  
                  <div className="mt-4 pt-3 border-t border-edge/40 flex items-center justify-between text-[11px] font-medium text-ink-dim relative z-10">
                    <span>{doc.size}</span>
                    <div className="flex items-center gap-1.5">
                      <span>{new Date(doc.modifiedDate).toLocaleDateString()}</span>
                      {hasUrl && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            copyLink(fileUrl);
                          }}
                          title="Copy Link"
                          className="p-1 text-ink-faint hover:text-ink transition-colors rounded hover:bg-white/5 cursor-pointer"
                        >
                          <LinkIcon className="h-3 w-3" />
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setDocToDelete(doc);
                          setDeleteDialogOpen(true);
                        }}
                        title="Delete Document"
                        className="p-1 text-ink-faint hover:text-rose transition-colors rounded hover:bg-rose/10 cursor-pointer"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Rename Dialog */}
      <Dialog open={renameDialogOpen} onOpenChange={(open) => {
        setRenameDialogOpen(open);
        if (!open) {
          setSelectedDoc(null);
          setNewName("");
        }
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rename Document</DialogTitle>
            <DialogDescription>Enter a new name for this file.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>File Name</Label>
              <Input 
                value={newName} 
                onChange={(e) => setNewName(e.target.value)} 
                placeholder="Document name" 
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="secondary" onClick={() => setRenameDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={() => {
                if (selectedDoc && newName) {
                  renameMutation.mutate({ id: selectedDoc.id, name: newName });
                }
              }} 
              disabled={!newName || renameMutation.isPending}
              className="h-10 sm:h-9 text-sm font-semibold touch-manipulation cursor-pointer relative z-10 shadow-md"
            >
              {renameMutation.isPending ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onOpenChange={(open) => {
          if (!deleteMutation.isPending) {
            setDeleteDialogOpen(open);
            if (!open) setDocToDelete(null);
          }
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-rose/12 text-rose border border-rose/20">
                <Trash2 className="h-5 w-5" />
              </div>
              <div>
                <DialogTitle className="text-lg">Delete Document</DialogTitle>
                <DialogDescription className="mt-1">
                  Are you sure you want to permanently delete this document?
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          {docToDelete && (
            <div className="rounded-xl border border-edge/60 bg-white/[0.02] p-3 text-xs text-ink-dim space-y-1.5 my-2">
              <div className="flex items-center justify-between">
                <span className="text-ink-faint">Name:</span>
                <span className="font-semibold text-ink truncate max-w-[220px]" title={docToDelete.name}>
                  {docToDelete.name}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-ink-faint">Folder:</span>
                <span className="font-medium text-ink">{docToDelete.folder || "Uploads"}</span>
              </div>
              {docToDelete.size && (
                <div className="flex items-center justify-between">
                  <span className="text-ink-faint">Size:</span>
                  <span className="font-medium text-ink">{docToDelete.size}</span>
                </div>
              )}
              <div className="pt-1.5 border-t border-edge/40">
                <p className="text-rose text-[11px] font-medium leading-relaxed">
                  ⚠️ This file will be permanently removed from cloud storage and the workspace for both partners.
                </p>
              </div>
            </div>
          )}

          <DialogFooter className="gap-2 sm:gap-0 mt-2">
            <Button
              variant="secondary"
              onClick={() => {
                setDeleteDialogOpen(false);
                setDocToDelete(null);
              }}
              disabled={deleteMutation.isPending}
              className="h-10 sm:h-9"
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                if (docToDelete) {
                  deleteMutation.mutate(docToDelete.id);
                }
              }}
              disabled={deleteMutation.isPending}
              className="h-10 sm:h-9 bg-rose text-white hover:bg-rose/90 font-semibold shadow-md border border-rose/30"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              {deleteMutation.isPending ? "Deleting..." : "Delete Permanently"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Image Viewer Dialog (Lightbox) */}
      <AnimatePresence>
        {viewerDoc && (
          <Dialog open={!!viewerDoc} onOpenChange={(open) => { if (!open) setViewerDoc(null); }}>
            <DialogContent className="max-w-[95vw] sm:max-w-[90vw] max-h-[92vh] sm:max-h-[90vh] p-2 sm:p-4 bg-black/95 border border-white/10 shadow-2xl [&>button]:text-white">
              <DialogTitle className="sr-only">Image Viewer - {viewerDoc.name}</DialogTitle>
              <div className="flex items-center justify-between pb-2 px-1 text-white border-b border-white/10 mb-2">
                <div className="flex items-center gap-2 max-w-[50%] sm:max-w-[65%] truncate">
                  <span className="text-xs sm:text-sm font-semibold truncate text-white/90">{viewerDoc.name}</span>
                  <span className="text-[10px] text-white/50 hidden sm:inline">({viewerDoc.size})</span>
                </div>
                <div className="flex items-center gap-1.5 sm:gap-2 mr-6 sm:mr-8">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="h-8 px-2.5 text-xs bg-white/10 text-white border-white/20 hover:bg-white/20 cursor-pointer" 
                    onClick={() => {
                      const url = getDocUrl(viewerDoc);
                      if (url) window.open(url, "_blank");
                    }}
                  >
                    <Download className="h-3.5 w-3.5 sm:mr-1.5" />
                    <span className="hidden sm:inline">Download</span>
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="h-8 px-2.5 text-xs bg-white/10 text-white border-white/20 hover:bg-white/20 cursor-pointer" 
                    onClick={() => {
                      const url = getDocUrl(viewerDoc);
                      if (url) copyLink(url);
                    }}
                  >
                    <LinkIcon className="h-3.5 w-3.5 sm:mr-1.5" />
                    <span className="hidden sm:inline">Copy Link</span>
                  </Button>
                  <Button 
                    variant="destructive" 
                    size="sm" 
                    className="h-8 px-2.5 text-xs bg-rose text-white hover:bg-rose/90 border border-rose/30 shadow-sm cursor-pointer" 
                    onClick={() => {
                      setDocToDelete(viewerDoc);
                      setDeleteDialogOpen(true);
                    }}
                  >
                    <Trash2 className="h-3.5 w-3.5 sm:mr-1.5" />
                    <span>Delete</span>
                  </Button>
                </div>
              </div>
              <motion.div 
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.96 }}
                className="relative flex items-center justify-center w-full h-[70vh] sm:h-[80vh] overflow-hidden"
              >
                <img 
                  src={getDocUrl(viewerDoc)} 
                  alt={viewerDoc.name} 
                  className="max-w-full max-h-full object-contain rounded-md"
                />
              </motion.div>
            </DialogContent>
          </Dialog>
        )}
      </AnimatePresence>
    </div>
  );
}
