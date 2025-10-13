import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Trash2, AlertTriangle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { useQueryClient } from '@tanstack/react-query';

interface DeleteForEveryoneProps {
  messageId: string;
  conversationId: string;
  canDelete: boolean;
}

export const DeleteForEveryone = ({ messageId, conversationId, canDelete }: DeleteForEveryoneProps) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const queryClient = useQueryClient();

  const handleDeleteForEveryone = async () => {
    setIsDeleting(true);
    try {
      // Soft delete: mark message as deleted for everyone
      const { error } = await supabase
        .from('messages')
        .update({ 
          deleted_at: new Date().toISOString(),
          content: '[Message deleted]'
        })
        .eq('id', messageId);

      if (error) throw error;

      // Invalidate queries to refresh UI
      queryClient.invalidateQueries({ queryKey: ['inbox-messages', conversationId] });
      queryClient.invalidateQueries({ queryKey: ['inbox-conversations'] });

      toast({
        title: "Message deleted",
        description: "This message has been deleted for everyone"
      });
    } catch (error) {
      console.error('Delete error:', error);
      toast({
        title: "Delete failed",
        description: "Failed to delete message",
        variant: "destructive"
      });
    } finally {
      setIsDeleting(false);
    }
  };

  if (!canDelete) return null;

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive">
          <Trash2 className="h-4 w-4 mr-2" />
          Delete for Everyone
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            Delete Message for Everyone?
          </AlertDialogTitle>
          <AlertDialogDescription>
            This will remove the message for all participants in this conversation. 
            This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDeleteForEveryone}
            disabled={isDeleting}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isDeleting ? 'Deleting...' : 'Delete for Everyone'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
