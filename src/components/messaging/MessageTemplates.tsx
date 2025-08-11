import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { 
  Popover, 
  PopoverContent, 
  PopoverTrigger 
} from '@/components/ui/popover';
import { 
  FileText, 
  Plus, 
  Search, 
  Star,
  Copy,
  Edit,
  Trash,
  Bookmark
} from 'lucide-react';
import { useMessageTemplates, useCreateMessageTemplate } from '@/hooks/queries/useEnterpriseMessaging';
import { useToast } from '@/hooks/use-toast';

interface MessageTemplatesProps {
  onTemplateSelect: (content: string) => void;
  className?: string;
}

const TEMPLATE_CATEGORIES = [
  'General',
  'Maintenance',
  'Property Management',
  'Leasing',
  'Customer Service',
  'Emergency',
  'Follow-up'
];

const DEFAULT_TEMPLATES = [
  {
    name: 'Maintenance Request Follow-up',
    content: 'Hi! I wanted to follow up on your maintenance request. Is everything working properly now? Please let me know if you need any additional assistance.',
    category: 'Maintenance'
  },
  {
    name: 'Property Inspection Reminder',
    content: 'This is a friendly reminder that we have a property inspection scheduled for [DATE] at [TIME]. Please ensure access to all areas. Contact me if you need to reschedule.',
    category: 'Property Management'
  },
  {
    name: 'Rent Payment Reminder',
    content: 'Hi [TENANT_NAME], this is a friendly reminder that rent payment for [MONTH] is due on [DATE]. Please submit your payment by the due date to avoid late fees.',
    category: 'Property Management'
  },
  {
    name: 'Welcome New Tenant',
    content: 'Welcome to your new home! We\'re excited to have you as a tenant. Please don\'t hesitate to reach out if you have any questions or need assistance settling in.',
    category: 'Leasing'
  }
];

export const MessageTemplates: React.FC<MessageTemplatesProps> = ({
  onTemplateSelect,
  className = ''
}) => {
  const { data: templates = [], isLoading } = useMessageTemplates();
  const createTemplate = useCreateMessageTemplate();
  const { toast } = useToast();
  
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [newTemplate, setNewTemplate] = useState({
    name: '',
    content: '',
    category: 'General',
    isShared: false
  });

  // Combine user templates with default templates
  const allTemplates = [
    ...templates,
    ...DEFAULT_TEMPLATES.map(template => ({
      ...template,
      id: `default-${template.name.toLowerCase().replace(/\s+/g, '-')}`,
      user_id: 'system',
      is_shared: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }))
  ];

  const filteredTemplates = allTemplates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         template.content.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || template.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleCreateTemplate = async () => {
    if (!newTemplate.name.trim() || !newTemplate.content.trim()) {
      toast({
        title: "Validation Error",
        description: "Please provide both a name and content for the template",
        variant: "destructive"
      });
      return;
    }

    try {
      await createTemplate.mutateAsync({
        name: newTemplate.name,
        content: newTemplate.content,
        category: newTemplate.category,
        isShared: newTemplate.isShared
      });
      
      setNewTemplate({
        name: '',
        content: '',
        category: 'General',
        isShared: false
      });
      setIsCreateDialogOpen(false);
    } catch (error) {
      console.error('Failed to create template:', error);
    }
  };

  const copyToClipboard = async (content: string) => {
    await navigator.clipboard.writeText(content);
    toast({
      title: "Copied",
      description: "Template content copied to clipboard"
    });
  };

  return (
    <div className={className}>
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm" className="gap-2">
            <FileText className="h-4 w-4" />
            Templates
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-96 p-0" align="start">
          <Card className="border-0 shadow-lg">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Message Templates</CardTitle>
                <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                  <DialogTrigger asChild>
                    <Button size="sm" className="gap-1">
                      <Plus className="h-3 w-3" />
                      New
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-md">
                    <DialogHeader>
                      <DialogTitle>Create Message Template</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="template-name">Template Name</Label>
                        <Input
                          id="template-name"
                          value={newTemplate.name}
                          onChange={(e) => setNewTemplate(prev => ({ 
                            ...prev, 
                            name: e.target.value 
                          }))}
                          placeholder="Enter template name"
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="template-category">Category</Label>
                        <Select
                          value={newTemplate.category}
                          onValueChange={(value) => setNewTemplate(prev => ({ 
                            ...prev, 
                            category: value 
                          }))}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {TEMPLATE_CATEGORIES.map(category => (
                              <SelectItem key={category} value={category}>
                                {category}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div>
                        <Label htmlFor="template-content">Content</Label>
                        <Textarea
                          id="template-content"
                          value={newTemplate.content}
                          onChange={(e) => setNewTemplate(prev => ({ 
                            ...prev, 
                            content: e.target.value 
                          }))}
                          placeholder="Enter template content..."
                          className="min-h-24"
                        />
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Switch
                          id="template-shared"
                          checked={newTemplate.isShared}
                          onCheckedChange={(checked) => setNewTemplate(prev => ({ 
                            ...prev, 
                            isShared: checked 
                          }))}
                        />
                        <Label htmlFor="template-shared">Share with team</Label>
                      </div>
                      
                      <div className="flex justify-end gap-2">
                        <Button 
                          variant="outline" 
                          onClick={() => setIsCreateDialogOpen(false)}
                        >
                          Cancel
                        </Button>
                        <Button 
                          onClick={handleCreateTemplate}
                          disabled={createTemplate.isPending}
                        >
                          {createTemplate.isPending ? 'Creating...' : 'Create Template'}
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
              
              {/* Search and Filter */}
              <div className="space-y-2">
                <div className="relative">
                  <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-muted-foreground h-3 w-3" />
                  <Input
                    placeholder="Search templates..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-8 h-8"
                  />
                </div>
                
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="h-8">
                    <SelectValue placeholder="All categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All categories</SelectItem>
                    {TEMPLATE_CATEGORIES.map(category => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            
            <CardContent className="p-0">
              <div className="max-h-80 overflow-y-auto">
                {isLoading ? (
                  <div className="p-4 text-center text-muted-foreground">
                    Loading templates...
                  </div>
                ) : filteredTemplates.length > 0 ? (
                  <div className="divide-y divide-border">
                    {filteredTemplates.map((template) => (
                      <div
                        key={template.id}
                        className="p-3 hover:bg-accent/50 transition-colors"
                      >
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-sm truncate">
                              {template.name}
                            </h4>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant="secondary" className="text-xs">
                                {template.category}
                              </Badge>
                              {template.is_shared && (
                                <Badge variant="outline" className="text-xs">
                                  <Star className="h-2 w-2 mr-1" />
                                  Shared
                                </Badge>
                              )}
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 p-0"
                              onClick={() => copyToClipboard(template.content)}
                            >
                              <Copy className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 p-0"
                              onClick={() => onTemplateSelect(template.content)}
                            >
                              <Bookmark className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                        
                        <p className="text-xs text-muted-foreground line-clamp-2">
                          {template.content}
                        </p>
                        
                        <Button
                          variant="ghost"
                          size="sm"
                          className="w-full mt-2 text-xs h-7"
                          onClick={() => onTemplateSelect(template.content)}
                        >
                          Use Template
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 text-center text-muted-foreground text-sm">
                    {searchQuery || selectedCategory !== 'all' 
                      ? 'No templates match your search'
                      : 'No templates available'
                    }
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </PopoverContent>
      </Popover>
    </div>
  );
};