import { useMemo, useState } from "react";
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
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

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
  const { data: documents = [], isLoading } = useQuery({
    queryKey: ["documents"],
    queryFn: async () => {
      const { data, error } = await supabase.from("documents").select("*");
      if (error) throw error;
      return data as Document[];
    },
  });

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
          <Button>
            <Plus className="h-4 w-4" /> Upload File
          </Button>
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
