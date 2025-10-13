import { useState, useEffect } from "react";
import { History, Download, Upload, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { DragDropZone } from "./DragDropZone";

interface Version {
  id: string;
  version_number: number;
  file_path: string;
  file_size: number;
  change_notes: string | null;
  created_at: string;
  uploaded_by: string;
}

interface VersionHistoryProps {
  documentId: string;
  documentName: string;
  currentFilePath: string;
  onVersionRestored: () => void;
}

export function VersionHistory({
  documentId,
  documentName,
  currentFilePath,
  onVersionRestored,
}: VersionHistoryProps) {
  const [versions, setVersions] = useState<Version[]>([]);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [changeNotes, setChangeNotes] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchVersions();
  }, [documentId]);

  const fetchVersions = async () => {
    try {
      const { data, error } = await supabase
        .from("document_versions")
        .select("*")
        .eq("document_id", documentId)
        .order("version_number", { ascending: false });

      if (error) throw error;
      setVersions(data || []);
    } catch (error) {
      console.error("Failed to fetch versions:", error);
    }
  };

  const handleUploadNewVersion = async () => {
    if (!uploadFile) return;

    setIsUploading(true);
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error("Not authenticated");

      // Get the next version number
      const nextVersion = versions.length > 0 ? versions[0].version_number + 1 : 1;

      // Upload new version file
      const fileName = `${Date.now()}-v${nextVersion}-${uploadFile.name}`;
      const filePath = `${userData.user.id}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("documents")
        .upload(filePath, uploadFile);

      if (uploadError) throw uploadError;

      // Save version metadata
      const { error: versionError } = await supabase
        .from("document_versions")
        .insert({
          document_id: documentId,
          version_number: nextVersion,
          file_path: filePath,
          file_size: uploadFile.size,
          uploaded_by: userData.user.id,
          change_notes: changeNotes || null,
        });

      if (versionError) throw versionError;

      // Log activity
      await supabase.from("document_activities").insert({
        document_id: documentId,
        user_id: userData.user.id,
        activity_type: "version_uploaded",
        details: { version_number: nextVersion, notes: changeNotes },
      });

      toast({
        title: "Success",
        description: `Version ${nextVersion} uploaded successfully`,
      });

      setUploadFile(null);
      setChangeNotes("");
      setIsUploadOpen(false);
      fetchVersions();
      onVersionRestored();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to upload new version",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleDownloadVersion = async (version: Version) => {
    try {
      const { data, error } = await supabase.storage
        .from("documents")
        .download(version.file_path);

      if (error) throw error;

      const url = URL.createObjectURL(data);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${documentName}-v${version.version_number}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      // Log activity
      const { data: userData } = await supabase.auth.getUser();
      if (userData.user) {
        await supabase.from("document_activities").insert({
          document_id: documentId,
          user_id: userData.user.id,
          activity_type: "version_downloaded",
          details: { version_number: version.version_number },
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to download version",
        variant: "destructive",
      });
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <History className="w-4 h-4 mr-2" />
          Version History ({versions.length})
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Version History - {documentName}</DialogTitle>
          <DialogDescription>
            View and manage document versions
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <Dialog open={isUploadOpen} onOpenChange={setIsUploadOpen}>
            <DialogTrigger asChild>
              <Button className="w-full">
                <Upload className="w-4 h-4 mr-2" />
                Upload New Version
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Upload New Version</DialogTitle>
                <DialogDescription>
                  Upload a new version of this document
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>File</Label>
                  {!uploadFile ? (
                    <DragDropZone
                      onFilesSelected={(files) => setUploadFile(files[0])}
                      maxSize={50}
                    />
                  ) : (
                    <div className="flex items-center gap-2 p-4 border rounded-lg">
                      <FileText className="w-5 h-5" />
                      <span className="flex-1 truncate">{uploadFile.name}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setUploadFile(null)}
                      >
                        Remove
                      </Button>
                    </div>
                  )}
                </div>
                <div>
                  <Label>Change Notes</Label>
                  <Textarea
                    value={changeNotes}
                    onChange={(e) => setChangeNotes(e.target.value)}
                    placeholder="Describe what changed in this version..."
                    className="mt-1"
                  />
                </div>
                <Button
                  onClick={handleUploadNewVersion}
                  disabled={!uploadFile || isUploading}
                  className="w-full"
                >
                  {isUploading ? "Uploading..." : "Upload Version"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          <div className="space-y-3">
            {versions.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                No version history available
              </p>
            ) : (
              versions.map((version) => (
                <div
                  key={version.id}
                  className="border rounded-lg p-4 hover:bg-accent transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">
                          Version {version.version_number}
                        </span>
                        {version.version_number === 1 && (
                          <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                            Original
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {format(new Date(version.created_at), "PPp")} •{" "}
                        {formatFileSize(version.file_size)}
                      </p>
                      {version.change_notes && (
                        <p className="text-sm mt-2 p-2 bg-muted rounded">
                          {version.change_notes}
                        </p>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDownloadVersion(version)}
                    >
                      <Download className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
