import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Download, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { format } from 'date-fns';

interface ExportConversationProps {
  conversationId: string;
  conversationTitle: string;
}

export const ExportConversation = ({ conversationId, conversationTitle }: ExportConversationProps) => {
  const [exportFormat, setExportFormat] = useState<'json' | 'txt' | 'pdf'>('json');
  const [isExporting, setIsExporting] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      // Fetch all messages in conversation
      const { data: messages, error } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      // Fetch sender profiles
      const senderIds = [...new Set(messages?.map(m => m.sender_id))];
      const { data: profiles } = await supabase
        .from('profiles')
        .select('user_id, first_name, last_name')
        .in('user_id', senderIds);

      const profileMap = profiles?.reduce((acc, p) => {
        acc[p.user_id] = `${p.first_name} ${p.last_name}`;
        return acc;
      }, {} as Record<string, string>) || {};

      let content: string;
      let mimeType: string;
      let filename: string;

      if (exportFormat === 'json') {
        content = JSON.stringify(messages, null, 2);
        mimeType = 'application/json';
        filename = `conversation-${conversationTitle.replace(/\s+/g, '-')}-${format(new Date(), 'yyyy-MM-dd')}.json`;
      } else if (exportFormat === 'txt') {
        content = messages?.map(msg => {
          const senderName = profileMap[msg.sender_id] || 'Unknown';
          const timestamp = format(new Date(msg.created_at), 'PPpp');
          return `[${timestamp}] ${senderName}: ${msg.content}`;
        }).join('\n\n') || '';
        mimeType = 'text/plain';
        filename = `conversation-${conversationTitle.replace(/\s+/g, '-')}-${format(new Date(), 'yyyy-MM-dd')}.txt`;
      } else {
        // PDF would require a library like jsPDF, for now use formatted text
        content = `Conversation Export: ${conversationTitle}\nExported: ${format(new Date(), 'PPpp')}\n\n${
          messages?.map(msg => {
            const senderName = profileMap[msg.sender_id] || 'Unknown';
            const timestamp = format(new Date(msg.created_at), 'PPpp');
            return `${timestamp}\n${senderName}\n${msg.content}\n${'='.repeat(80)}`;
          }).join('\n\n')
        }`;
        mimeType = 'text/plain';
        filename = `conversation-${conversationTitle.replace(/\s+/g, '-')}-${format(new Date(), 'yyyy-MM-dd')}.pdf.txt`;
      }

      // Create and download file
      const blob = new Blob([content], { type: mimeType });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: "Export successful",
        description: `Conversation exported as ${exportFormat.toUpperCase()}`
      });

      setIsOpen(false);
    } catch (error) {
      console.error('Export error:', error);
      toast({
        title: "Export failed",
        description: "Failed to export conversation",
        variant: "destructive"
      });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Download className="h-4 w-4 mr-2" />
          Export
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Export Conversation</DialogTitle>
          <DialogDescription>
            Download this conversation in your preferred format
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="format">Export Format</Label>
            <Select value={exportFormat} onValueChange={(v) => setExportFormat(v as any)}>
              <SelectTrigger id="format">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="json">JSON (Complete data)</SelectItem>
                <SelectItem value="txt">Text (Human readable)</SelectItem>
                <SelectItem value="pdf">PDF-ready Text</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button 
            onClick={handleExport} 
            disabled={isExporting}
            className="w-full"
          >
            {isExporting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Exporting...
              </>
            ) : (
              <>
                <Download className="h-4 w-4 mr-2" />
                Export Conversation
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
