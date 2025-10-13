import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useEditMessage } from '@/hooks/queries/useInbox';
import { toast } from '@/hooks/use-toast';

interface MessageEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  messageId: string;
  conversationId: string;
  currentContent: string;
}

export const MessageEditDialog: React.FC<MessageEditDialogProps> = ({
  open,
  onOpenChange,
  messageId,
  conversationId,
  currentContent
}) => {
  const [content, setContent] = useState(currentContent);
  const editMessage = useEditMessage();

  const handleSave = async () => {
    if (!content.trim() || content === currentContent) {
      toast({ title: 'No changes made', variant: 'default' });
      return;
    }

    try {
      await editMessage.mutateAsync({ messageId, conversationId, newContent: content });
      toast({ title: 'Message updated' });
      onOpenChange(false);
    } catch (error) {
      console.error('Failed to edit message:', error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Edit Message</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="min-h-32"
            placeholder="Edit your message..."
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={editMessage.isPending}>
            {editMessage.isPending ? 'Saving...' : 'Save Changes'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
