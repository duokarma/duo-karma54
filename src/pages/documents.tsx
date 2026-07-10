import { useMemo, useState, useRef } from "react";
import { motion } from "framer-motion";
import { Plus, Search, FileText, Sheet, Image, File, FolderOpen, MoreVertical, Users } from "lucide-react";
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
import { cn } from "@/lib/utils";
import type { Document } from "@/types";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/components/ui/toast";

const typeIcon: Record<string, typeof FileText> = {
  pdf: FileText,
  doc: FileText,
  xls: Sheet,
  image: Image,
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

      const newDoc = {
        id: crypto.randomUUID(),
        name: file.name,
        type,
        size: sizeStr,
        modifiedDate: new Date().toISOString(),
        folder: "Uploads",
        sharedWith: 0,
      };

      const { error } = await supabase.from("documents").insert(newDoc);
      if (error) throw error;
      return newDoc;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["documents"] });
      toast({ title: "File uploaded successfully" });
    },
    onError: (error) => {
      toast({ title: "Error uploading file", description: error.message, variant: "destructive" });
    }
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      uploadMutation.mutate(file);
    }
    if (e.target) e.target.value = "";
  };

  const [query, setQuery] = useState("");
  const [folderFilter, setFolderFilter] = useState("all");

  const folders = useMemo(() => Array.from(new Set(documents.map((d) => d.folder))), [documents]);

  const filtered = useMemo(() => {
    return documents.filter((d) => {
      const matchesQuery = d.name.toLowerCase().includes(query.toLowerCase());
      const matchesFolder = folderFilter === "all" || d.folder === folderFilter;
      return matchesQuery && matchesFolder;
    });
  }, [documents, query, folderFilter]);

  if (isLoading) {
    return <div className="p-8 text-center text-ink-dim">Loading...</div>;
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
              <Plus className="h-4 w-4" /> {uploadMutation.isPending ? "Uploading..." : "Upload File"}
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
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((doc, i) => {
            const Icon = typeIcon[doc.type];
            return (
              <motion.div key={doc.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
                <Card className="p-4 transition-transform hover:-translate-y-0.5">
                  <div className="flex items-start justify-between">
                    <div className={cn("flex h-10 w-10 items-center justify-center rounded-xl", typeColor[doc.type])}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <Button variant="ghost" size="icon-sm">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </div>
                  <p className="mt-3 truncate text-sm font-medium text-ink">{doc.name}</p>
                  <p className="mt-0.5 text-xs text-ink-faint">{doc.folder}</p>
                  <div className="mt-3 flex items-center justify-between text-xs text-ink-faint">
                    <span>{doc.size}</span>
                    <span>{new Date(doc.modifiedDate).toLocaleDateString()}</span>
                  </div>
                  <div className="mt-2 flex items-center gap-1 text-xs text-ink-faint">
                    <Users className="h-3 w-3" /> Shared with {doc.sharedWith}
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
