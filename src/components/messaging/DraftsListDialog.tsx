import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Clock, Trash2 } from 'lucide-react';
import { useInboxConversations } from '@/hooks/queries/useInbox';
import { format } from 'date-fns';

interface DraftsListDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDraftSelect: (conversationId: string) => void;
}

export const DraftsListDialog: React.FC<DraftsListDialogProps> = ({
  open,
  onOpenChange,
  onDraftSelect
}) => {
  const { data: drafts = [] } = useInboxConversations({ filter: 'drafts', searchQuery: '' });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Drafts ({drafts.length})</DialogTitle>
        </DialogHeader>
        <div className="flex-1 overflow-y-auto">
          {drafts.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
                <Clock className="h-8 w-8" />
              </div>
              <p>No drafts saved</p>
            </div>
          ) : (
            <div className="space-y-2">
              {drafts.map((draft) => (
                <button
                  key={draft.id}
                  className="w-full text-left p-4 rounded-lg border border-border hover:bg-accent transition-colors"
                  onClick={() => {
                    onDraftSelect(draft.id);
                    onOpenChange(false);
                  }}
                >
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-medium truncate">{draft.title || 'No subject'}</h3>
                    <Badge variant="secondary" className="text-xs">Draft</Badge>
                  </div>
                  {draft.last_message && (
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                      {draft.last_message.content}
                    </p>
                  )}
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {format(new Date(draft.updated_at), 'PPp')}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6"
                      onClick={(e) => {
                        e.stopPropagation();
                        // TODO: Delete draft
                      }}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
