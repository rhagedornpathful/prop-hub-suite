import React from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { useFocusManagement } from '@/hooks/useFocusManagement';

interface MobileComposeDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSend: (data: { to: string; subject: string; message: string }) => void;
}

export const MobileComposeDialog: React.FC<MobileComposeDialogProps> = ({
  isOpen,
  onClose,
  onSend,
}) => {
  const { dialogRef } = useFocusManagement(isOpen);
  const [to, setTo] = React.useState('');
  const [subject, setSubject] = React.useState('');
  const [message, setMessage] = React.useState('');

  const handleSend = () => {
    onSend({ to, subject, message });
    setTo('');
    setSubject('');
    setMessage('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      className={cn(
        "fixed inset-0 z-50 bg-background md:hidden",
        "flex flex-col"
      )}
      ref={dialogRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby="mobile-compose-title"
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <h2 id="mobile-compose-title" className="text-lg font-semibold">
          New Message
        </h2>
        <Button
          variant="ghost"
          size="sm"
          onClick={onClose}
          aria-label="Close compose dialog"
        >
          <X className="h-5 w-5" />
        </Button>
      </div>

      {/* Form */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <div>
          <label htmlFor="compose-to" className="text-sm font-medium mb-1 block">
            To
          </label>
          <Input
            id="compose-to"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            placeholder="Recipient"
            className="w-full"
            aria-required="true"
          />
        </div>

        <div>
          <label htmlFor="compose-subject" className="text-sm font-medium mb-1 block">
            Subject
          </label>
          <Input
            id="compose-subject"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="Subject"
            className="w-full"
          />
        </div>

        <div>
          <label htmlFor="compose-message" className="text-sm font-medium mb-1 block">
            Message
          </label>
          <Textarea
            id="compose-message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type your message..."
            className="w-full min-h-[300px] resize-none"
            aria-required="true"
          />
        </div>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-border flex gap-2">
        <Button
          variant="outline"
          onClick={onClose}
          className="flex-1"
        >
          Cancel
        </Button>
        <Button
          onClick={handleSend}
          disabled={!to || !message}
          className="flex-1"
        >
          Send
        </Button>
      </div>
    </div>
  );
};
