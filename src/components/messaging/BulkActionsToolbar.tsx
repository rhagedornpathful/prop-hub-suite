import React from 'react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Archive, Star, Trash2, Tag, CheckSquare, X } from 'lucide-react';
import { useArchiveConversation, useToggleStarConversation } from '@/hooks/queries/useInbox';
import { toast } from '@/hooks/use-toast';

interface BulkActionsToolbarProps {
  selectedIds: string[];
  onClearSelection: () => void;
  onComplete?: () => void;
}

export const BulkActionsToolbar: React.FC<BulkActionsToolbarProps> = ({
  selectedIds,
  onClearSelection,
  onComplete
}) => {
  const archiveConv = useArchiveConversation();
  const starConv = useToggleStarConversation();

  const handleBulkArchive = async () => {
    try {
      await Promise.all(selectedIds.map(id => archiveConv.mutateAsync({ conversationId: id, isArchived: true })));
      toast({ title: `Archived ${selectedIds.length} conversation(s)` });
      onComplete?.();
      onClearSelection();
    } catch (error) {
      console.error('Bulk archive failed:', error);
    }
  };

  const handleBulkStar = async () => {
    try {
      await Promise.all(selectedIds.map(id => starConv.mutateAsync({ conversationId: id, isStarred: true })));
      toast({ title: `Starred ${selectedIds.length} conversation(s)` });
      onComplete?.();
      onClearSelection();
    } catch (error) {
      console.error('Bulk star failed:', error);
    }
  };

  if (selectedIds.length === 0) return null;

  return (
    <div className="bg-primary/10 border-b border-border px-4 py-2 flex items-center gap-2">
      <div className="flex items-center gap-2 text-sm font-medium">
        <CheckSquare className="h-4 w-4" />
        {selectedIds.length} selected
      </div>

      <Separator orientation="vertical" className="h-6" />

      <Button variant="ghost" size="sm" onClick={handleBulkArchive}>
        <Archive className="h-4 w-4 mr-2" />
        Archive
      </Button>

      <Button variant="ghost" size="sm" onClick={handleBulkStar}>
        <Star className="h-4 w-4 mr-2" />
        Star
      </Button>

      <Button variant="ghost" size="sm">
        <Tag className="h-4 w-4 mr-2" />
        Label
      </Button>

      <Button variant="ghost" size="sm">
        <Trash2 className="h-4 w-4 mr-2" />
        Delete
      </Button>

      <div className="ml-auto">
        <Button variant="ghost" size="sm" onClick={onClearSelection}>
          <X className="h-4 w-4 mr-2" />
          Clear
        </Button>
      </div>
    </div>
  );
};
