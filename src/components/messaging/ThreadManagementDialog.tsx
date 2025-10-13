import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Split, Merge, Tags } from 'lucide-react';
import { InboxConversation } from '@/hooks/queries/useInbox';

interface ThreadManagementDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  conversations: InboxConversation[];
  selectedConversations: string[];
  onSplit: (conversationId: string, messageIds: string[]) => void;
  onMerge: (conversationIds: string[], targetId: string) => void;
  onAutoCategorize: (conversationId: string) => void;
}

export const ThreadManagementDialog = ({
  open,
  onOpenChange,
  conversations,
  selectedConversations,
  onSplit,
  onMerge,
  onAutoCategorize
}: ThreadManagementDialogProps) => {
  const [action, setAction] = useState<'split' | 'merge' | 'categorize'>('merge');
  const [targetConversation, setTargetConversation] = useState<string>('');

  const handleAction = () => {
    if (action === 'merge' && selectedConversations.length >= 2 && targetConversation) {
      onMerge(selectedConversations, targetConversation);
    } else if (action === 'categorize') {
      selectedConversations.forEach(id => onAutoCategorize(id));
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Thread Management</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label>Action</Label>
            <Select value={action} onValueChange={(value: any) => setAction(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="split">
                  <div className="flex items-center">
                    <Split className="h-4 w-4 mr-2" />
                    Split Thread
                  </div>
                </SelectItem>
                <SelectItem value="merge">
                  <div className="flex items-center">
                    <Merge className="h-4 w-4 mr-2" />
                    Merge Threads
                  </div>
                </SelectItem>
                <SelectItem value="categorize">
                  <div className="flex items-center">
                    <Tags className="h-4 w-4 mr-2" />
                    Auto-Categorize
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {action === 'merge' && (
            <div>
              <Label>Merge into Conversation</Label>
              <Select value={targetConversation} onValueChange={setTargetConversation}>
                <SelectTrigger>
                  <SelectValue placeholder="Select target conversation" />
                </SelectTrigger>
                <SelectContent>
                  {selectedConversations.map(id => {
                    const conv = conversations.find(c => c.id === id);
                    return (
                      <SelectItem key={id} value={id}>
                        {conv?.title || 'Untitled'}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
              <p className="text-sm text-muted-foreground mt-2">
                {selectedConversations.length} conversations selected
              </p>
            </div>
          )}

          {action === 'categorize' && (
            <div className="text-sm text-muted-foreground">
              AI will automatically categorize {selectedConversations.length} conversation(s) based on content and assign appropriate labels.
            </div>
          )}

          {action === 'split' && (
            <div className="text-sm text-muted-foreground">
              Select messages within a conversation to split into a new thread. This feature requires viewing a single conversation.
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleAction} disabled={action === 'merge' && !targetConversation}>
            Apply
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
