import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useEmailNotifications } from '@/hooks/useEmailNotifications';
import { Mail, Send, Users, Clock, AlertCircle, CheckCircle } from 'lucide-react';

const EmailNotificationCenter = () => {
  const { sendEmail } = useEmailNotifications();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    template: '',
    recipients: '',
    tenant_name: '',
    property_address: '',
    maintenance_description: '',
    amount: '',
    due_date: '',
    status: '',
    priority: 'medium',
  });

  const emailTemplates = [
    {
      value: 'maintenance_request',
      label: 'Maintenance Request',
      description: 'Notify property managers of new maintenance requests',
      icon: <AlertCircle className="h-4 w-4" />,
      color: 'bg-orange-500',
    },
    {
      value: 'welcome_tenant',
      label: 'Welcome Tenant',
      description: 'Welcome new tenants to their property',
      icon: <Users className="h-4 w-4" />,
      color: 'bg-green-500',
    },
    {
      value: 'payment_reminder',
      label: 'Payment Reminder',
      description: 'Remind tenants of upcoming rent payments',
      icon: <Clock className="h-4 w-4" />,
      color: 'bg-red-500',
    },
    {
      value: 'maintenance_update',
      label: 'Maintenance Update',
      description: 'Update tenants on maintenance request status',
      icon: <CheckCircle className="h-4 w-4" />,
      color: 'bg-blue-500',
    },
    {
      value: 'lease_reminder',
      label: 'Lease Reminder',
      description: 'Notify tenants about lease expiration',
      icon: <Clock className="h-4 w-4" />,
      color: 'bg-yellow-500',
    },
    {
      value: 'property_inspection',
      label: 'Property Inspection',
      description: 'Schedule property inspection notifications',
      icon: <AlertCircle className="h-4 w-4" />,
      color: 'bg-purple-500',
    },
  ];

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSendEmail = async () => {
    if (!formData.template || !formData.recipients) {
      return;
    }

    setIsLoading(true);
    try {
      const recipients = formData.recipients.split(',').map(email => email.trim());
      const emailData = {
        tenant_name: formData.tenant_name,
        property_address: formData.property_address,
        maintenance_description: formData.maintenance_description,
        amount: formData.amount ? parseFloat(formData.amount) : undefined,
        due_date: formData.due_date,
        status: formData.status,
        priority: formData.priority,
      };

      await sendEmail(formData.template as any, recipients, emailData);
      
      // Reset form
      setFormData({
        template: '',
        recipients: '',
        tenant_name: '',
        property_address: '',
        maintenance_description: '',
        amount: '',
        due_date: '',
        status: '',
        priority: 'medium',
      });
    } catch (error) {
      console.error('Failed to send email:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const selectedTemplate = emailTemplates.find(t => t.value === formData.template);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Mail className="h-5 w-5 text-primary" />
            <CardTitle>Email Notification Center</CardTitle>
          </div>
          <CardDescription>
            Send automated emails for property management workflows
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Template Selection */}
          <div className="space-y-4">
            <Label>Select Email Template</Label>
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
              {emailTemplates.map((template) => (
                <Card
                  key={template.value}
                  className={`cursor-pointer transition-colors ${
                    formData.template === template.value
                      ? 'ring-2 ring-primary bg-primary/5'
                      : 'hover:bg-muted/50'
                  }`}
                  onClick={() => handleInputChange('template', template.value)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-md text-white ${template.color}`}>
                        {template.icon}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium">{template.label}</h4>
                        <p className="text-sm text-muted-foreground mt-1">
                          {template.description}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            {selectedTemplate && (
              <Badge variant="secondary" className="mt-2">
                Selected: {selectedTemplate.label}
              </Badge>
            )}
          </div>

          {/* Recipients */}
          <div className="space-y-2">
            <Label htmlFor="recipients">Recipients *</Label>
            <Input
              id="recipients"
              placeholder="Enter email addresses separated by commas"
              value={formData.recipients}
              onChange={(e) => handleInputChange('recipients', e.target.value)}
            />
            <p className="text-sm text-muted-foreground">
              Separate multiple email addresses with commas
            </p>
          </div>

          {/* Dynamic Fields Based on Template */}
          {formData.template && (
            <div className="space-y-4">
              <h4 className="font-medium">Email Content</h4>
              
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="tenant_name">Tenant Name</Label>
                  <Input
                    id="tenant_name"
                    placeholder="John Doe"
                    value={formData.tenant_name}
                    onChange={(e) => handleInputChange('tenant_name', e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="property_address">Property Address</Label>
                  <Input
                    id="property_address"
                    placeholder="123 Main St, City, State"
                    value={formData.property_address}
                    onChange={(e) => handleInputChange('property_address', e.target.value)}
                  />
                </div>
              </div>

              {/* Template-specific fields */}
              {(formData.template === 'maintenance_request' || formData.template === 'maintenance_update') && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="maintenance_description">Maintenance Description</Label>
                    <Textarea
                      id="maintenance_description"
                      placeholder="Describe the maintenance issue..."
                      value={formData.maintenance_description}
                      onChange={(e) => handleInputChange('maintenance_description', e.target.value)}
                    />
                  </div>
                  
                  {formData.template === 'maintenance_request' && (
                    <div className="space-y-2">
                      <Label htmlFor="priority">Priority</Label>
                      <Select value={formData.priority} onValueChange={(value) => handleInputChange('priority', value)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">Low</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                          <SelectItem value="urgent">Urgent</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                  
                  {formData.template === 'maintenance_update' && (
                    <div className="space-y-2">
                      <Label htmlFor="status">Status</Label>
                      <Select value={formData.status} onValueChange={(value) => handleInputChange('status', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="scheduled">Scheduled</SelectItem>
                          <SelectItem value="in-progress">In Progress</SelectItem>
                          <SelectItem value="completed">Completed</SelectItem>
                          <SelectItem value="cancelled">Cancelled</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </div>
              )}

              {formData.template === 'payment_reminder' && (
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="amount">Amount</Label>
                    <Input
                      id="amount"
                      type="number"
                      placeholder="1500.00"
                      value={formData.amount}
                      onChange={(e) => handleInputChange('amount', e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="due_date">Due Date</Label>
                    <Input
                      id="due_date"
                      type="date"
                      value={formData.due_date}
                      onChange={(e) => handleInputChange('due_date', e.target.value)}
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Send Button */}
          <Button
            onClick={handleSendEmail}
            disabled={!formData.template || !formData.recipients || isLoading}
            className="w-full"
          >
            <Send className="h-4 w-4 mr-2" />
            {isLoading ? 'Sending...' : 'Send Email'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default EmailNotificationCenter;