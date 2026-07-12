import { useMemo, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Search, FileText, Sheet, Image as ImageIcon, File, FolderOpen, MoreVertical, Users, Pencil, Trash2, Link as LinkIcon, Eye, Download, X } from "lucide-react";
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
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [query, setQuery] = useState("");
  const [folderFilter, setFolderFilter] = useState("all");
  const [renameDialogOpen, setRenameDialogOpen] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState<Document | null>(null);
  const [newName, setNewName] = useState("");
  
  // Image Viewer state
  const [viewerUrl, setViewerUrl] = useState<string | null>(null);

  const { data: documents = [], isLoading } = useQuery({
    queryKey: ["documents"],
    queryFn: async () => {
      const { data, error } = await supabase.from("documents").select("*");
      if (error) throw error;
      return data as Document[];
    },
  });

  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      let type = "other";
      if (file.type.includes("pdf")) type = "pdf";
      else if (file.type.includes("image")) type = "image";
      else if (file.name.endsWith(".doc") || file.name.endsWith(".docx") || file.type.includes("word")) type = "doc";
      else if (file.name.endsWith(".xls") || file.name.endsWith(".xlsx") || file.type.includes("excel")) type = "xls";

      let sizeStr = "";
      if (file.size < 1024 * 1024) {
        sizeStr = (file.size / 1024).toFixed(0) + " KB";
      } else {
        sizeStr = (file.size / 1024 / 1024).toFixed(1) + " MB";
      }
      
      const fileExt = file.name.split('.').pop();
      const uniqueFileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

      // 1. Upload to Supabase Storage bucket 'DUO-KARMA files'
      const { error: storageError } = await supabase.storage
        .from("DUO-KARMA files")
        .upload(uniqueFileName, file, { cacheControl: '3600', upsert: false });

      if (storageError) {
        console.error("Storage upload error:", storageError);
        throw new Error(storageError.message || "Failed to upload file to storage.");
      }

      // 2. Get Public URL
      const { data: { publicUrl } } = supabase.storage
        .from("DUO-KARMA files")
        .getPublicUrl(uniqueFileName);

      // 3. Save to database
      const newDoc = {
        id: crypto.randomUUID(),
        name: file.name,
        type,
        size: sizeStr,
        modifiedDate: new Date().toISOString(),
        folder: "Uploads",
        sharedWith: 0,
        url: publicUrl, // Store the public URL
      };

      const { error: dbError } = await supabase.from("documents").insert(newDoc);
      if (dbError) throw dbError;
      return newDoc;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["documents"] });
      toast({ title: "File uploaded successfully", variant: "success" });
    },
    onError: (error: Error) => {
      toast({ title: "Upload Failed", description: error.message, variant: "error" });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("documents").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["documents"] });
      toast({ title: "File deleted successfully", variant: "success" });
    },
  });

  const renameMutation = useMutation({
    mutationFn: async ({ id, name }: { id: string; name: string }) => {
      const { error } = await supabase.from("documents").update({ name }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["documents"] });
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
            const hasUrl = !!doc.url;
            return (
              <motion.div key={doc.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
                <Card className="group flex flex-col p-4 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 hover:border-electric/30 h-full">
                  <div className="flex items-start justify-between">
                    <div className={cn("flex h-12 w-12 items-center justify-center rounded-xl", typeColor[doc.type])}>
                      {doc.type === "image" && hasUrl ? (
                        <img src={doc.url} alt={doc.name} className="h-full w-full rounded-xl object-cover" />
                      ) : (
                        <Icon className="h-6 w-6" />
                      )}
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon-sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48">
                        {hasUrl && doc.type === "image" && (
                          <DropdownMenuItem onClick={() => setViewerUrl(doc.url!)}>
                            <Eye className="mr-2 h-4 w-4" /> View Image
                          </DropdownMenuItem>
                        )}
                        {hasUrl && (
                          <DropdownMenuItem onClick={() => window.open(doc.url, "_blank")}>
                            <Download className="mr-2 h-4 w-4" /> Download
                          </DropdownMenuItem>
                        )}
                        {hasUrl && (
                          <DropdownMenuItem onClick={() => copyLink(doc.url!)}>
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
                        <DropdownMenuItem onClick={() => deleteMutation.mutate(doc.id)} className="text-rose focus:text-rose focus:bg-rose/10">
                          <Trash2 className="mr-2 h-4 w-4" /> Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  
                  <div className="mt-4 flex-1">
                    <p className="truncate font-semibold text-ink leading-tight cursor-default" title={doc.name}>{doc.name}</p>
                    <p className="mt-1 text-xs text-ink-faint">{doc.folder}</p>
                  </div>
                  
                  <div className="mt-4 pt-3 border-t border-edge/40 flex items-center justify-between text-[11px] font-medium text-ink-dim">
                    <span>{doc.size}</span>
                    <span>{new Date(doc.modifiedDate).toLocaleDateString()}</span>
                  </div>
                  
                  {/* Action overlay for images */}
                  {hasUrl && doc.type === "image" && (
                    <div 
                      className="absolute inset-0 cursor-pointer z-0 opacity-0" 
                      onClick={() => setViewerUrl(doc.url!)}
                    />
                  )}
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}

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
            >
              {renameMutation.isPending ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Image Viewer Dialog (Lightbox) */}
      <AnimatePresence>
        {viewerUrl && (
          <Dialog open={!!viewerUrl} onOpenChange={() => setViewerUrl(null)}>
            <DialogContent className="max-w-[90vw] max-h-[90vh] p-1 bg-black/95 border-none shadow-2xl [&>button]:text-white">
              <DialogTitle className="sr-only">Image Viewer</DialogTitle>
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="relative flex items-center justify-center w-full h-[85vh] overflow-hidden"
              >
                <img 
                  src={viewerUrl} 
                  alt="Full view" 
                  className="max-w-full max-h-full object-contain rounded-md"
                />
              </motion.div>
              <div className="absolute top-4 right-12 flex gap-2">
                <Button variant="outline" size="sm" className="bg-black/50 text-white border-white/20 hover:bg-black/80" onClick={() => window.open(viewerUrl, "_blank")}>
                  <Download className="h-4 w-4 mr-2" /> Download
                </Button>
                <Button variant="outline" size="sm" className="bg-black/50 text-white border-white/20 hover:bg-black/80" onClick={() => copyLink(viewerUrl)}>
                  <LinkIcon className="h-4 w-4 mr-2" /> Copy Link
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </AnimatePresence>
    </div>
  );
}
