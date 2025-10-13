import { Download, Trash2, FolderInput, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { useState } from "react";
import { Label } from "@/components/ui/label";

interface BulkOperationsProps {
  selectedCount: number;
  onBulkDownload: () => void;
  onBulkDelete: () => void;
  onBulkMoveToFolder: (folderId: string) => void;
  onBulkCategorize: (category: string) => void;
  folders: Array<{ id: string; name: string }>;
  categories: Array<{ value: string; label: string }>;
}

export function BulkOperations({
  selectedCount,
  onBulkDownload,
  onBulkDelete,
  onBulkMoveToFolder,
  onBulkCategorize,
  folders,
  categories,
}: BulkOperationsProps) {
  const [isMoveDialogOpen, setIsMoveDialogOpen] = useState(false);
  const [isCategorizeDialogOpen, setIsCategorizeDialogOpen] = useState(false);
  const [selectedFolder, setSelectedFolder] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");

  const handleMoveToFolder = () => {
    if (selectedFolder) {
      onBulkMoveToFolder(selectedFolder);
      setIsMoveDialogOpen(false);
      setSelectedFolder("");
    }
  };

  const handleCategorize = () => {
    if (selectedCategory) {
      onBulkCategorize(selectedCategory);
      setIsCategorizeDialogOpen(false);
      setSelectedCategory("");
    }
  };

  if (selectedCount === 0) return null;

  return (
    <div className="flex items-center gap-2 p-3 bg-accent rounded-lg border">
      <span className="text-sm font-medium mr-2">
        {selectedCount} selected
      </span>

      <Button variant="outline" size="sm" onClick={onBulkDownload}>
        <Download className="w-4 h-4 mr-2" />
        Download
      </Button>

      <Dialog open={isMoveDialogOpen} onOpenChange={setIsMoveDialogOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm">
            <FolderInput className="w-4 h-4 mr-2" />
            Move to Folder
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Move to Folder</DialogTitle>
            <DialogDescription>
              Select a folder to move {selectedCount} document{selectedCount !== 1 ? 's' : ''}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Select Folder</Label>
              <Select value={selectedFolder} onValueChange={setSelectedFolder}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Choose a folder..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None (Root)</SelectItem>
                  {folders.map((folder) => (
                    <SelectItem key={folder.id} value={folder.id}>
                      {folder.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button onClick={handleMoveToFolder} className="w-full">
              Move Documents
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isCategorizeDialogOpen} onOpenChange={setIsCategorizeDialogOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm">
            <Tag className="w-4 h-4 mr-2" />
            Categorize
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Categorize Documents</DialogTitle>
            <DialogDescription>
              Set category for {selectedCount} document{selectedCount !== 1 ? 's' : ''}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Select Category</Label>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Choose a category..." />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.value} value={category.value}>
                      {category.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button onClick={handleCategorize} className="w-full">
              Categorize Documents
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button variant="outline" size="sm">
            <Trash2 className="w-4 h-4 mr-2" />
            Delete
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete documents?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete {selectedCount} document{selectedCount !== 1 ? 's' : ''}. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={onBulkDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
