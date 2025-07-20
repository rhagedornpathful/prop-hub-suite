import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { 
  Mail, 
  MessageSquare, 
  Phone, 
  Calendar,
  User,
  Building,
  Wrench,
  DollarSign,
  AlertTriangle,
  Settings,
  Send,
  Edit,
  Copy,
  Trash2
} from 'lucide-react';

interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  content: string;
  category: 'maintenance' | 'payment' | 'lease' | 'general' | 'marketing';
  variables: string[];
  is_active: boolean;
  created_at: string;
  usage_count: number;
}

interface AutomationRule {
  id: string;
  name: string;
  trigger: string;
  template_id: string;
  conditions: any;
  is_active: boolean;
  recipients: string[];
}

export const EnhancedEmailTemplates: React.FC = () => {
  const [templates, setTemplates] = useState<EmailTemplate[]>([
    {
      id: '1',
      name: 'Maintenance Request Confirmation',
      subject: 'Maintenance Request #{request_id} - Received',
      content: `Dear {tenant_name},

We have received your maintenance request for {property_address}.

Request Details:
- Request ID: #{request_id}
- Type: {request_type}
- Priority: {priority}
- Description: {description}

Our team will review your request and contact you within 24 hours to schedule the necessary work.

If this is an emergency, please call our emergency hotline at {emergency_phone}.

Best regards,
{property_manager_name}
{company_name}`,
      category: 'maintenance',
      variables: ['tenant_name', 'property_address', 'request_id', 'request_type', 'priority', 'description', 'emergency_phone', 'property_manager_name', 'company_name'],
      is_active: true,
      created_at: '2024-01-15',
      usage_count: 45
    },
    {
      id: '2',
      name: 'Rent Payment Reminder',
      subject: 'Rent Payment Reminder - Due {due_date}',
      content: `Dear {tenant_name},

This is a friendly reminder that your rent payment of {amount} for {property_address} is due on {due_date}.

Payment Details:
- Amount: {amount}
- Due Date: {due_date}
- Late Fee: {late_fee} (applied after {grace_period} days)

Payment Methods:
- Online Portal: {payment_portal_url}
- Bank Transfer: {bank_details}
- Check: Payable to {company_name}

If you have already made this payment, please disregard this notice.

Thank you,
{property_manager_name}`,
      category: 'payment',
      variables: ['tenant_name', 'property_address', 'amount', 'due_date', 'late_fee', 'grace_period', 'payment_portal_url', 'bank_details', 'company_name', 'property_manager_name'],
      is_active: true,
      created_at: '2024-01-10',
      usage_count: 78
    },
    {
      id: '3',
      name: 'Property Tour Invitation',
      subject: 'Schedule Your Property Tour - {property_address}',
      content: `Hello {prospect_name},

Thank you for your interest in {property_address}! We would love to show you this amazing property.

Property Highlights:
- {bedrooms} bedrooms, {bathrooms} bathrooms
- {square_feet} sq ft
- Monthly Rent: {monthly_rent}
- Available: {available_date}

Schedule Options:
- Virtual Tour: {virtual_tour_link}
- In-Person Tour: Call {contact_phone} or reply to this email

Property Features:
{property_features}

We look forward to hearing from you!

Best regards,
{agent_name}
{company_name}`,
      category: 'marketing',
      variables: ['prospect_name', 'property_address', 'bedrooms', 'bathrooms', 'square_feet', 'monthly_rent', 'available_date', 'virtual_tour_link', 'contact_phone', 'property_features', 'agent_name', 'company_name'],
      is_active: true,
      created_at: '2024-01-05',
      usage_count: 32
    }
  ]);

  const [automationRules, setAutomationRules] = useState<AutomationRule[]>([
    {
      id: '1',
      name: 'Maintenance Request Auto-Confirmation',
      trigger: 'maintenance_request_created',
      template_id: '1',
      conditions: { priority: ['high', 'medium', 'low'] },
      is_active: true,
      recipients: ['tenant', 'property_manager']
    },
    {
      id: '2',
      name: 'Rent Payment Reminder (3 days before)',
      trigger: 'payment_due_soon',
      template_id: '2',
      conditions: { days_before: 3 },
      is_active: true,
      recipients: ['tenant']
    }
  ]);

  const [showTemplateDialog, setShowTemplateDialog] = useState(false);
  const [showAutomationDialog, setShowAutomationDialog] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<EmailTemplate | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Template form state
  const [templateName, setTemplateName] = useState('');
  const [templateSubject, setTemplateSubject] = useState('');
  const [templateContent, setTemplateContent] = useState('');
  const [templateCategory, setTemplateCategory] = useState<'maintenance' | 'payment' | 'lease' | 'general' | 'marketing'>('general');

  const { toast } = useToast();

  const filteredTemplates = templates.filter(template => 
    selectedCategory === 'all' || template.category === selectedCategory
  );

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'maintenance': return <Wrench className="h-4 w-4" />;
      case 'payment': return <DollarSign className="h-4 w-4" />;
      case 'lease': return <Building className="h-4 w-4" />;
      case 'marketing': return <User className="h-4 w-4" />;
      default: return <Mail className="h-4 w-4" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'maintenance': return 'bg-orange-100 text-orange-800';
      case 'payment': return 'bg-green-100 text-green-800';
      case 'lease': return 'bg-blue-100 text-blue-800';
      case 'marketing': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const saveTemplate = () => {
    if (!templateName.trim() || !templateSubject.trim() || !templateContent.trim()) {
      toast({
        title: 'Error',
        description: 'Please fill in all required fields',
        variant: 'destructive'
      });
      return;
    }

    const newTemplate: EmailTemplate = {
      id: Date.now().toString(),
      name: templateName,
      subject: templateSubject,
      content: templateContent,
      category: templateCategory,
      variables: extractVariables(templateContent + ' ' + templateSubject),
      is_active: true,
      created_at: new Date().toISOString().split('T')[0],
      usage_count: 0
    };

    if (editingTemplate) {
      setTemplates(templates.map(t => t.id === editingTemplate.id ? { ...newTemplate, id: editingTemplate.id, usage_count: editingTemplate.usage_count } : t));
      toast({
        title: 'Template Updated',
        description: 'Email template has been updated successfully'
      });
    } else {
      setTemplates([...templates, newTemplate]);
      toast({
        title: 'Template Created',
        description: 'New email template has been created successfully'
      });
    }

    resetForm();
    setShowTemplateDialog(false);
  };

  const extractVariables = (text: string): string[] => {
    const matches = text.match(/\{([^}]+)\}/g);
    return matches ? [...new Set(matches.map(match => match.slice(1, -1)))] : [];
  };

  const resetForm = () => {
    setTemplateName('');
    setTemplateSubject('');
    setTemplateContent('');
    setTemplateCategory('general');
    setEditingTemplate(null);
  };

  const editTemplate = (template: EmailTemplate) => {
    setEditingTemplate(template);
    setTemplateName(template.name);
    setTemplateSubject(template.subject);
    setTemplateContent(template.content);
    setTemplateCategory(template.category);
    setShowTemplateDialog(true);
  };

  const duplicateTemplate = (template: EmailTemplate) => {
    const duplicated: EmailTemplate = {
      ...template,
      id: Date.now().toString(),
      name: `${template.name} (Copy)`,
      usage_count: 0,
      created_at: new Date().toISOString().split('T')[0]
    };
    setTemplates([...templates, duplicated]);
    toast({
      title: 'Template Duplicated',
      description: 'Template has been duplicated successfully'
    });
  };

  const deleteTemplate = (templateId: string) => {
    setTemplates(templates.filter(t => t.id !== templateId));
    toast({
      title: 'Template Deleted',
      description: 'Template has been deleted successfully'
    });
  };

  const toggleTemplateStatus = (templateId: string) => {
    setTemplates(templates.map(t => 
      t.id === templateId ? { ...t, is_active: !t.is_active } : t
    ));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Email Templates</h2>
          <p className="text-muted-foreground">Manage automated email templates and rules</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={() => setShowAutomationDialog(true)}>
            <Settings className="h-4 w-4 mr-2" />
            Automation Rules
          </Button>
          <Button onClick={() => setShowTemplateDialog(true)}>
            <Mail className="h-4 w-4 mr-2" />
            New Template
          </Button>
        </div>
      </div>

      {/* Category Filter */}
      <div className="flex space-x-2">
        <Button
          variant={selectedCategory === 'all' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setSelectedCategory('all')}
        >
          All Templates
        </Button>
        {['maintenance', 'payment', 'lease', 'marketing', 'general'].map((category) => (
          <Button
            key={category}
            variant={selectedCategory === category ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedCategory(category)}
            className="capitalize"
          >
            {getCategoryIcon(category)}
            <span className="ml-1">{category}</span>
          </Button>
        ))}
      </div>

      {/* Templates Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredTemplates.map((template) => (
          <Card key={template.id} className="group hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <CardTitle className="text-base">{template.name}</CardTitle>
                    <Switch
                      checked={template.is_active}
                      onCheckedChange={() => toggleTemplateStatus(template.id)}
                    />
                  </div>
                  <Badge variant="secondary" className={getCategoryColor(template.category)}>
                    {getCategoryIcon(template.category)}
                    <span className="ml-1 capitalize">{template.category}</span>
                  </Badge>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-3">
              <div>
                <p className="text-xs text-muted-foreground">Subject</p>
                <p className="text-sm font-medium line-clamp-1">{template.subject}</p>
              </div>
              
              <div>
                <p className="text-xs text-muted-foreground">Content Preview</p>
                <p className="text-sm text-muted-foreground line-clamp-3">{template.content}</p>
              </div>
              
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Used {template.usage_count} times</span>
                <span>{template.created_at}</span>
              </div>
              
              <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button size="sm" variant="outline" onClick={() => editTemplate(template)}>
                  <Edit className="h-3 w-3" />
                </Button>
                <Button size="sm" variant="outline" onClick={() => duplicateTemplate(template)}>
                  <Copy className="h-3 w-3" />
                </Button>
                <Button size="sm" variant="outline" onClick={() => deleteTemplate(template.id)}>
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Template Dialog */}
      <Dialog open={showTemplateDialog} onOpenChange={setShowTemplateDialog}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingTemplate ? 'Edit Template' : 'Create New Template'}</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="template-name">Template Name</Label>
                <Input
                  id="template-name"
                  placeholder="e.g., Maintenance Request Confirmation"
                  value={templateName}
                  onChange={(e) => setTemplateName(e.target.value)}
                />
              </div>
              
              <div>
                <Label htmlFor="template-category">Category</Label>
                <Select value={templateCategory} onValueChange={(value: any) => setTemplateCategory(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="maintenance">Maintenance</SelectItem>
                    <SelectItem value="payment">Payment</SelectItem>
                    <SelectItem value="lease">Lease</SelectItem>
                    <SelectItem value="marketing">Marketing</SelectItem>
                    <SelectItem value="general">General</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="template-subject">Email Subject</Label>
              <Input
                id="template-subject"
                placeholder="e.g., Maintenance Request #{request_id} - Received"
                value={templateSubject}
                onChange={(e) => setTemplateSubject(e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="template-content">Email Content</Label>
              <Textarea
                id="template-content"
                placeholder="Enter your email template content. Use {variable_name} for dynamic content."
                value={templateContent}
                onChange={(e) => setTemplateContent(e.target.value)}
                rows={12}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Use curly braces for variables: {'{tenant_name}, {property_address}, {request_id}'}
              </p>
            </div>

            <div className="flex space-x-2">
              <Button onClick={() => setShowTemplateDialog(false)} variant="outline" className="flex-1">
                Cancel
              </Button>
              <Button onClick={saveTemplate} className="flex-1">
                {editingTemplate ? 'Update Template' : 'Create Template'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Automation Rules Dialog */}
      <Dialog open={showAutomationDialog} onOpenChange={setShowAutomationDialog}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Email Automation Rules</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            {automationRules.map((rule) => (
              <Card key={rule.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">{rule.name}</h4>
                      <p className="text-sm text-muted-foreground">
                        Trigger: {rule.trigger} → Template: {templates.find(t => t.id === rule.template_id)?.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Recipients: {rule.recipients.join(', ')}
                      </p>
                    </div>
                    <Switch
                      checked={rule.is_active}
                      onCheckedChange={() => {
                        setAutomationRules(automationRules.map(r => 
                          r.id === rule.id ? { ...r, is_active: !r.is_active } : r
                        ));
                      }}
                    />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EnhancedEmailTemplates;