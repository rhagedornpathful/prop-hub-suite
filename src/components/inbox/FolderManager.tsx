import React, { useState } from 'react';
import { 
  Folder,
  FolderPlus,
  Edit3,
  Trash2,
  MoreHorizontal,
  Check,
  X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';

interface CustomFolder {
  id: string;
  name: string;
  color: string;
  count: number;
  parentId?: string;
}

interface FolderManagerProps {
  collapsed: boolean;
  selectedFolder: string | null;
  onFolderSelect: (folderId: string) => void;
}

export const FolderManager: React.FC<FolderManagerProps> = ({
  collapsed,
  selectedFolder,
  onFolderSelect,
}) => {
  const { toast } = useToast();
  const [folders, setFolders] = useState<CustomFolder[]>([]);
  
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingFolder, setEditingFolder] = useState<string | null>(null);
  const [newFolderName, setNewFolderName] = useState('');
  const [folderColors] = useState([
    'text-red-600',
    'text-blue-600', 
    'text-green-600',
    'text-purple-600',
    'text-yellow-600',
    'text-indigo-600',
    'text-pink-600',
    'text-orange-600'
  ]);
  const [selectedColor, setSelectedColor] = useState('text-blue-600');

  const handleCreateFolder = () => {
    if (!newFolderName.trim()) return;

    const newFolder: CustomFolder = {
      id: `folder-${Date.now()}`,
      name: newFolderName.trim(),
      color: selectedColor,
      count: 0,
    };

    setFolders(prev => [...prev, newFolder]);
    setNewFolderName('');
    setShowCreateDialog(false);
    
    toast({
      title: 'Folder Created',
      description: `"${newFolder.name}" folder has been created successfully.`,
    });
  };

  const handleDeleteFolder = (folderId: string) => {
    const folder = folders.find(f => f.id === folderId);
    setFolders(prev => prev.filter(f => f.id !== folderId));
    
    toast({
      title: 'Folder Deleted',
      description: `"${folder?.name}" folder has been deleted.`,
    });
  };

  const handleRenameFolder = (folderId: string, newName: string) => {
    if (!newName.trim()) return;
    
    setFolders(prev => prev.map(f => 
      f.id === folderId ? { ...f, name: newName.trim() } : f
    ));
    setEditingFolder(null);
  };

  const FolderItem = ({ folder }: { folder: CustomFolder }) => {
    const isSelected = selectedFolder === folder.id;
    const isEditing = editingFolder === folder.id;
    
    return (
      <div className={`group flex items-center justify-between rounded-md hover:bg-muted/50 transition-colors ${
        isSelected ? 'bg-primary/10 text-primary' : ''
      }`}>
        <Button
          variant="ghost"
          size="sm"
          className={`flex-1 justify-start h-8 ${collapsed ? 'px-2' : 'px-3'} ${
            isSelected ? 'bg-primary/10 text-primary' : ''
          }`}
          onClick={() => onFolderSelect(folder.id)}
        >
          <Folder className={`h-4 w-4 ${folder.color} ${collapsed ? '' : 'mr-3'}`} />
          {!collapsed && (
            <>
              {isEditing ? (
                <Input
                  defaultValue={folder.name}
                  className="h-6 text-sm"
                  autoFocus
                  onBlur={(e) => handleRenameFolder(folder.id, e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleRenameFolder(folder.id, e.currentTarget.value);
                    } else if (e.key === 'Escape') {
                      setEditingFolder(null);
                    }
                  }}
                  onClick={(e) => e.stopPropagation()}
                />
              ) : (
                <>
                  <span className="flex-1 text-left truncate text-xs">{folder.name}</span>
                  {folder.count > 0 && (
                    <Badge variant="secondary" className="ml-2 h-4 text-xs">
                      {folder.count}
                    </Badge>
                  )}
                </>
              )}
            </>
          )}
        </Button>

        {!collapsed && !isEditing && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={(e) => e.stopPropagation()}
              >
                <MoreHorizontal className="h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuItem onClick={() => setEditingFolder(folder.id)}>
                <Edit3 className="h-3 w-3 mr-2" />
                Rename
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => handleDeleteFolder(folder.id)}
                className="text-destructive"
              >
                <Trash2 className="h-3 w-3 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-1">
      {/* Header */}
      {!collapsed && (
        <div className="flex items-center justify-between px-2 py-1">
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            Custom Folders
          </span>
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0"
            onClick={() => setShowCreateDialog(true)}
          >
            <FolderPlus className="h-3 w-3" />
          </Button>
        </div>
      )}

      {/* Folder List */}
      <div className="space-y-0.5">
        {folders.map(folder => (
          <FolderItem key={folder.id} folder={folder} />
        ))}
      </div>

      {collapsed && (
        <Button
          variant="ghost"
          size="sm"
          className="w-full h-8 px-2"
          onClick={() => setShowCreateDialog(true)}
        >
          <FolderPlus className="h-4 w-4" />
        </Button>
      )}

      {/* Create Folder Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Folder</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Folder Name</label>
              <Input
                placeholder="Enter folder name..."
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                className="mt-1"
              />
            </div>
            
            <div>
              <label className="text-sm font-medium">Color</label>
              <div className="flex gap-2 mt-2">
                {folderColors.map(color => (
                  <button
                    key={color}
                    className={`w-6 h-6 rounded-full border-2 transition-all ${
                      selectedColor === color ? 'border-foreground scale-110' : 'border-muted'
                    }`}
                    style={{ backgroundColor: `hsl(var(--${color.split('-')[1]}-${color.split('-')[2]}))` }}
                    onClick={() => setSelectedColor(color)}
                  >
                    {selectedColor === color && (
                      <Check className="h-3 w-3 text-white mx-auto" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateFolder} disabled={!newFolderName.trim()}>
              Create Folder
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};