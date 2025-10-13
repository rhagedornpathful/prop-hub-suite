import { useState } from "react";
import { Folder, Plus, Edit, Trash2, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface FolderData {
  id: string;
  name: string;
  color: string;
  icon: string;
  parent_folder_id: string | null;
  created_at: string;
}

interface FolderManagementProps {
  folders: FolderData[];
  currentFolderId: string | null;
  onFolderChange: (folderId: string | null) => void;
  onRefresh: () => void;
}

export function FolderManagement({
  folders,
  currentFolderId,
  onFolderChange,
  onRefresh,
}: FolderManagementProps) {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [newFolderColor, setNewFolderColor] = useState("#3b82f6");
  const { toast } = useToast();

  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) return;

    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error("Not authenticated");

      const { error } = await supabase.from("document_folders").insert({
        user_id: userData.user.id,
        name: newFolderName.trim(),
        color: newFolderColor,
        parent_folder_id: currentFolderId,
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Folder created successfully",
      });

      setNewFolderName("");
      setNewFolderColor("#3b82f6");
      setIsCreateDialogOpen(false);
      onRefresh();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create folder",
        variant: "destructive",
      });
    }
  };

  const handleDeleteFolder = async (folderId: string) => {
    try {
      const { error } = await supabase
        .from("document_folders")
        .delete()
        .eq("id", folderId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Folder deleted successfully",
      });

      if (currentFolderId === folderId) {
        onFolderChange(null);
      }
      onRefresh();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete folder",
        variant: "destructive",
      });
    }
  };

  const currentFolder = folders.find((f) => f.id === currentFolderId);
  const subfolders = folders.filter((f) => f.parent_folder_id === currentFolderId);
  const rootFolders = folders.filter((f) => !f.parent_folder_id);

  return (
    <div className="space-y-4">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onFolderChange(null)}
          className={!currentFolderId ? "bg-accent" : ""}
        >
          <Folder className="w-4 h-4 mr-2" />
          All Documents
        </Button>
        {currentFolder && (
          <>
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
            <div
              className="flex items-center gap-2 px-3 py-1 rounded-md bg-accent"
            >
              <Folder className="w-4 h-4" style={{ color: currentFolder.color }} />
              <span className="font-medium">{currentFolder.name}</span>
            </div>
          </>
        )}
      </div>

      {/* Folder List */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
        {(currentFolderId ? subfolders : rootFolders).map((folder) => (
          <div
            key={folder.id}
            className="group relative p-4 border rounded-lg hover:bg-accent transition-colors cursor-pointer"
            onClick={() => onFolderChange(folder.id)}
          >
            <div className="flex flex-col items-center gap-2">
              <Folder className="w-8 h-8" style={{ color: folder.color }} />
              <span className="text-sm font-medium text-center truncate w-full">
                {folder.name}
              </span>
            </div>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity h-7 w-7"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Trash2 className="w-3 h-3" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete folder?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will permanently delete the folder "{folder.name}" and all its contents.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={() => handleDeleteFolder(folder.id)}>
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        ))}

        {/* Create Folder Button */}
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <div className="p-4 border-2 border-dashed rounded-lg hover:bg-accent transition-colors cursor-pointer flex flex-col items-center justify-center gap-2">
              <Plus className="w-8 h-8 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">New Folder</span>
            </div>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Folder</DialogTitle>
              <DialogDescription>
                Create a new folder to organize your documents
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="folder-name">Folder Name</Label>
                <Input
                  id="folder-name"
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                  placeholder="Enter folder name..."
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="folder-color">Folder Color</Label>
                <div className="flex gap-2 mt-1">
                  <input
                    type="color"
                    id="folder-color"
                    value={newFolderColor}
                    onChange={(e) => setNewFolderColor(e.target.value)}
                    className="h-10 w-20 rounded border cursor-pointer"
                  />
                  <Input
                    value={newFolderColor}
                    onChange={(e) => setNewFolderColor(e.target.value)}
                    placeholder="#3b82f6"
                  />
                </div>
              </div>
              <Button onClick={handleCreateFolder} className="w-full">
                Create Folder
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
