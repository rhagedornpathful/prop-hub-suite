import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Edit, Trash2, FileText } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

interface MessageTemplate {
  id: string;
  name: string;
  subject: string;
  content: string;
  variables: string[];
}

interface MessageTemplatesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onInsertTemplate: (template: MessageTemplate, variables: Record<string, string>) => void;
}

export const MessageTemplatesDialog = ({ open, onOpenChange, onInsertTemplate }: MessageTemplatesDialogProps) => {
  const [templates, setTemplates] = useState<MessageTemplate[]>([
    {
      id: '1',
      name: 'Maintenance Follow-up',
      subject: 'Re: Maintenance Request #{{request_id}}',
      content: 'Hi {{tenant_name}},\n\nThank you for reporting the issue. Our maintenance team will visit on {{date}} at {{time}}.\n\nBest regards,\n{{sender_name}}',
      variables: ['request_id', 'tenant_name', 'date', 'time', 'sender_name']
    },
    {
      id: '2',
      name: 'Rent Reminder',
      subject: 'Rent Due - {{property_address}}',
      content: 'Dear {{tenant_name}},\n\nThis is a friendly reminder that rent of ${{amount}} is due on {{due_date}}.\n\nThank you,\n{{sender_name}}',
      variables: ['tenant_name', 'property_address', 'amount', 'due_date', 'sender_name']
    }
  ]);
  const [selectedTemplate, setSelectedTemplate] = useState<MessageTemplate | null>(null);
  const [variableValues, setVariableValues] = useState<Record<string, string>>({});
  const [isCreating, setIsCreating] = useState(false);
  const [newTemplate, setNewTemplate] = useState({ name: '', subject: '', content: '' });

  const extractVariables = (text: string): string[] => {
    const regex = /\{\{(\w+)\}\}/g;
    const matches = text.matchAll(regex);
    return Array.from(new Set(Array.from(matches, m => m[1])));
  };

  const handleCreateTemplate = () => {
    const variables = [
      ...extractVariables(newTemplate.subject),
      ...extractVariables(newTemplate.content)
    ];
    const template: MessageTemplate = {
      id: Date.now().toString(),
      ...newTemplate,
      variables: Array.from(new Set(variables))
    };
    setTemplates([...templates, template]);
    setNewTemplate({ name: '', subject: '', content: '' });
    setIsCreating(false);
  };

  const handleSelectTemplate = (template: MessageTemplate) => {
    setSelectedTemplate(template);
    const initialValues: Record<string, string> = {};
    template.variables.forEach(v => {
      initialValues[v] = '';
    });
    setVariableValues(initialValues);
  };

  const handleInsert = () => {
    if (selectedTemplate) {
      onInsertTemplate(selectedTemplate, variableValues);
      onOpenChange(false);
    }
  };

  const handleDeleteTemplate = (id: string) => {
    setTemplates(templates.filter(t => t.id !== id));
    if (selectedTemplate?.id === id) {
      setSelectedTemplate(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Message Templates</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-4 h-[500px]">
          <div className="border-r pr-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">Templates</h3>
              <Button size="sm" onClick={() => setIsCreating(true)}>
                <Plus className="h-4 w-4 mr-1" />
                New
              </Button>
            </div>
            <ScrollArea className="h-[450px]">
              <div className="space-y-2">
                {templates.map(template => (
                  <div
                    key={template.id}
                    className={`p-3 border rounded cursor-pointer hover:bg-accent ${selectedTemplate?.id === template.id ? 'bg-accent' : ''}`}
                    onClick={() => handleSelectTemplate(template)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="font-medium text-sm">{template.name}</div>
                        <div className="text-xs text-muted-foreground truncate">{template.subject}</div>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteTemplate(template.id);
                        }}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>

          <div className="pl-4">
            {isCreating ? (
              <div className="space-y-4">
                <h3 className="font-semibold">Create Template</h3>
                <div>
                  <Label>Name</Label>
                  <Input
                    value={newTemplate.name}
                    onChange={(e) => setNewTemplate({ ...newTemplate, name: e.target.value })}
                    placeholder="Template name"
                  />
                </div>
                <div>
                  <Label>Subject</Label>
                  <Input
                    value={newTemplate.subject}
                    onChange={(e) => setNewTemplate({ ...newTemplate, subject: e.target.value })}
                    placeholder="Use {{variable}} for dynamic content"
                  />
                </div>
                <div>
                  <Label>Content</Label>
                  <Textarea
                    value={newTemplate.content}
                    onChange={(e) => setNewTemplate({ ...newTemplate, content: e.target.value })}
                    placeholder="Template content with {{variables}}"
                    rows={8}
                  />
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleCreateTemplate}>Save Template</Button>
                  <Button variant="outline" onClick={() => setIsCreating(false)}>Cancel</Button>
                </div>
              </div>
            ) : selectedTemplate ? (
              <div className="space-y-4">
                <h3 className="font-semibold">{selectedTemplate.name}</h3>
                <div>
                  <Label>Subject</Label>
                  <div className="text-sm p-2 bg-muted rounded">{selectedTemplate.subject}</div>
                </div>
                <div>
                  <Label>Content Preview</Label>
                  <div className="text-sm p-2 bg-muted rounded whitespace-pre-wrap">{selectedTemplate.content}</div>
                </div>
                {selectedTemplate.variables.length > 0 && (
                  <div>
                    <Label>Variables</Label>
                    <div className="space-y-2 mt-2">
                      {selectedTemplate.variables.map(variable => (
                        <div key={variable}>
                          <Label className="text-xs">{variable}</Label>
                          <Input
                            value={variableValues[variable] || ''}
                            onChange={(e) => setVariableValues({ ...variableValues, [variable]: e.target.value })}
                            placeholder={`Enter ${variable}`}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                <Button onClick={handleInsert} className="w-full">
                  <FileText className="h-4 w-4 mr-2" />
                  Insert Template
                </Button>
              </div>
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                Select a template or create a new one
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
