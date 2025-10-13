import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tag, X, Plus } from 'lucide-react';
import { useConversationLabels } from '@/hooks/queries/useInbox';
import { toast } from '@/hooks/use-toast';

interface LabelsManagerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  conversationId: string;
}

export const LabelsManager: React.FC<LabelsManagerProps> = ({
  open,
  onOpenChange,
  conversationId
}) => {
  const [labels, setLabels] = useState<string[]>([]);
  const [newLabel, setNewLabel] = useState('');
  const labelsHook = useConversationLabels(conversationId);

  useEffect(() => {
    if (open) {
      loadLabels();
    }
  }, [open]);

  const loadLabels = async () => {
    const fetchedLabels = await labelsHook.fetch();
    setLabels(fetchedLabels);
  };

  const handleAddLabel = async () => {
    if (!newLabel.trim()) return;

    try {
      await labelsHook.add(newLabel.trim());
      setLabels([...labels, newLabel.trim()]);
      setNewLabel('');
      toast({ title: 'Label added' });
    } catch (error) {
      console.error('Failed to add label:', error);
    }
  };

  const handleRemoveLabel = async (label: string) => {
    try {
      await labelsHook.remove(label);
      setLabels(labels.filter(l => l !== label));
      toast({ title: 'Label removed' });
    } catch (error) {
      console.error('Failed to remove label:', error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Manage Labels</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="flex gap-2">
            <Input
              placeholder="Add a label..."
              value={newLabel}
              onChange={(e) => setNewLabel(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddLabel()}
            />
            <Button onClick={handleAddLabel} size="sm">
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex flex-wrap gap-2">
            {labels.length === 0 ? (
              <div className="text-sm text-muted-foreground text-center w-full py-4">
                No labels yet. Add one above!
              </div>
            ) : (
              labels.map((label) => (
                <Badge key={label} variant="secondary" className="flex items-center gap-1">
                  <Tag className="h-3 w-3" />
                  {label}
                  <button onClick={() => handleRemoveLabel(label)} className="ml-1 hover:text-destructive">
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
