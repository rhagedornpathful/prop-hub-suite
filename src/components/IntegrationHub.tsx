import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  Zap, 
  Globe, 
  Smartphone, 
  Mail, 
  MessageSquare, 
  Calendar,
  DollarSign,
  Key,
  Settings,
  Plus,
  ExternalLink,
  CheckCircle,
  AlertTriangle,
  RefreshCw
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Integration {
  id: string;
  name: string;
  description: string;
  category: 'communication' | 'accounting' | 'scheduling' | 'payment' | 'automation';
  status: 'connected' | 'disconnected' | 'error';
  icon: React.ReactNode;
  features: string[];
  webhookUrl?: string;
  apiKey?: string;
  lastSync?: string;
}

const IntegrationHub = () => {
  const [selectedIntegration, setSelectedIntegration] = useState<Integration | null>(null);
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const { toast } = useToast();

  const integrations: Integration[] = [
    {
      id: 'zapier',
      name: 'Zapier',
      description: 'Automate workflows with 5000+ apps',
      category: 'automation',
      status: 'connected',
      icon: <Zap className="h-6 w-6" />,
      features: ['Workflow Automation', 'Data Sync', 'Custom Triggers'],
      webhookUrl: 'https://hooks.zapier.com/hooks/catch/...',
      lastSync: '2024-01-15 10:30:00'
    },
    {
      id: 'quickbooks',
      name: 'QuickBooks Online',
      description: 'Sync maintenance costs and invoices',
      category: 'accounting',
      status: 'disconnected',
      icon: <DollarSign className="h-6 w-6" />,
      features: ['Expense Tracking', 'Invoice Generation', 'Financial Reports']
    },
    {
      id: 'gmail',
      name: 'Gmail',
      description: 'Send maintenance notifications via email',
      category: 'communication',
      status: 'connected',
      icon: <Mail className="h-6 w-6" />,
      features: ['Email Notifications', 'Automated Updates', 'Status Reports'],
      lastSync: '2024-01-15 11:45:00'
    },
    {
      id: 'twilio',
      name: 'Twilio SMS',
      description: 'Send SMS notifications to tenants and vendors',
      category: 'communication',
      status: 'error',
      icon: <MessageSquare className="h-6 w-6" />,
      features: ['SMS Alerts', 'Two-way Messaging', 'Emergency Notifications']
    },
    {
      id: 'calendly',
      name: 'Calendly',
      description: 'Schedule maintenance appointments',
      category: 'scheduling',
      status: 'disconnected',
      icon: <Calendar className="h-6 w-6" />,
      features: ['Appointment Scheduling', 'Calendar Sync', 'Availability Management']
    },
    {
      id: 'stripe',
      name: 'Stripe',
      description: 'Process maintenance-related payments',
      category: 'payment',
      status: 'connected',
      icon: <DollarSign className="h-6 w-6" />,
      features: ['Payment Processing', 'Recurring Billing', 'Financial Tracking'],
      lastSync: '2024-01-15 09:15:00'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected': return 'bg-green-100 text-green-800';
      case 'disconnected': return 'bg-gray-100 text-gray-800';
      case 'error': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'communication': return <MessageSquare className="h-4 w-4" />;
      case 'accounting': return <DollarSign className="h-4 w-4" />;
      case 'scheduling': return <Calendar className="h-4 w-4" />;
      case 'payment': return <DollarSign className="h-4 w-4" />;
      case 'automation': return <Zap className="h-4 w-4" />;
      default: return <Settings className="h-4 w-4" />;
    }
  };

  const handleConnect = (integrationId: string) => {
    toast({
      title: "Integration Connected",
      description: `Successfully connected to ${integrations.find(i => i.id === integrationId)?.name}`,
    });
  };

  const handleDisconnect = (integrationId: string) => {
    toast({
      title: "Integration Disconnected",
      description: `Disconnected from ${integrations.find(i => i.id === integrationId)?.name}`,
      variant: "destructive"
    });
  };

  const handleTestConnection = (integrationId: string) => {
    toast({
      title: "Testing Connection",
      description: "Connection test initiated...",
    });
  };

  const IntegrationCard = ({ integration }: { integration: Integration }) => (
    <Card className="relative">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-muted rounded-lg">
              {integration.icon}
            </div>
            <div>
              <CardTitle className="text-base">{integration.name}</CardTitle>
              <p className="text-sm text-muted-foreground">{integration.description}</p>
            </div>
          </div>
          <Badge className={getStatusColor(integration.status)}>
            {integration.status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div>
            <div className="flex items-center gap-2 mb-2">
              {getCategoryIcon(integration.category)}
              <span className="text-sm font-medium capitalize">{integration.category}</span>
            </div>
            <div className="flex flex-wrap gap-1">
              {integration.features.map((feature, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {feature}
                </Badge>
              ))}
            </div>
          </div>

          {integration.lastSync && (
            <p className="text-xs text-muted-foreground">
              Last sync: {integration.lastSync}
            </p>
          )}

          <div className="flex gap-2">
            {integration.status === 'connected' ? (
              <>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => handleTestConnection(integration.id)}
                  className="flex-1"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Test
                </Button>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm" className="flex-1">
                      <Settings className="h-4 w-4 mr-2" />
                      Configure
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Configure {integration.name}</DialogTitle>
                    </DialogHeader>
                    <ConfigurationForm integration={integration} />
                  </DialogContent>
                </Dialog>
                <Button 
                  variant="destructive" 
                  size="sm"
                  onClick={() => handleDisconnect(integration.id)}
                >
                  Disconnect
                </Button>
              </>
            ) : (
              <Button 
                onClick={() => handleConnect(integration.id)} 
                className="flex-1"
                disabled={integration.status === 'error'}
              >
                <Plus className="h-4 w-4 mr-2" />
                Connect
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const ConfigurationForm = ({ integration }: { integration: Integration }) => (
    <div className="space-y-4">
      {integration.id === 'zapier' && (
        <>
          <div>
            <Label htmlFor="webhook-url">Webhook URL</Label>
            <Input
              id="webhook-url"
              placeholder="https://hooks.zapier.com/hooks/catch/..."
              defaultValue={integration.webhookUrl}
            />
          </div>
          <div>
            <Label htmlFor="trigger-events">Trigger Events</Label>
            <div className="space-y-2 mt-2">
              <div className="flex items-center space-x-2">
                <Switch id="new-requests" defaultChecked />
                <Label htmlFor="new-requests">New maintenance requests</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch id="status-updates" defaultChecked />
                <Label htmlFor="status-updates">Status updates</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch id="completion" />
                <Label htmlFor="completion">Work completion</Label>
              </div>
            </div>
          </div>
        </>
      )}

      {integration.id === 'twilio' && (
        <>
          <div>
            <Label htmlFor="account-sid">Account SID</Label>
            <Input id="account-sid" placeholder="ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxx" />
          </div>
          <div>
            <Label htmlFor="auth-token">Auth Token</Label>
            <Input id="auth-token" type="password" placeholder="Your Twilio Auth Token" />
          </div>
          <div>
            <Label htmlFor="from-number">From Phone Number</Label>
            <Input id="from-number" placeholder="+1234567890" />
          </div>
        </>
      )}

      {integration.id === 'quickbooks' && (
        <>
          <div>
            <Label htmlFor="company-id">Company ID</Label>
            <Input id="company-id" placeholder="QuickBooks Company ID" />
          </div>
          <div>
            <Label htmlFor="sync-frequency">Sync Frequency</Label>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Select frequency" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="real-time">Real-time</SelectItem>
                <SelectItem value="hourly">Hourly</SelectItem>
                <SelectItem value="daily">Daily</SelectItem>
                <SelectItem value="weekly">Weekly</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </>
      )}

      <div className="flex justify-end gap-2">
        <Button variant="outline">Cancel</Button>
        <Button>Save Configuration</Button>
      </div>
    </div>
  );

  const WebhookTester = () => (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Webhook Tester</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="webhook-url-test">Webhook URL</Label>
          <Input
            id="webhook-url-test"
            placeholder="https://your-webhook-url.com/endpoint"
          />
        </div>
        
        <div>
          <Label htmlFor="payload">Test Payload</Label>
          <Textarea
            id="payload"
            rows={6}
            placeholder={JSON.stringify({
              event: "maintenance_request_created",
              data: {
                id: "req_123",
                title: "Test Request",
                priority: "medium",
                property: "123 Test St"
              }
            }, null, 2)}
          />
        </div>

        <Button className="w-full">
          <Zap className="h-4 w-4 mr-2" />
          Send Test Webhook
        </Button>
      </CardContent>
    </Card>
  );

  const APIDocumentation = () => (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">API Documentation</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <h4 className="font-medium mb-2">Available Endpoints</h4>
          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between p-2 bg-muted rounded">
              <span><code className="text-green-600">GET</code> /api/maintenance/requests</span>
              <Button variant="ghost" size="sm">
                <ExternalLink className="h-3 w-3" />
              </Button>
            </div>
            <div className="flex items-center justify-between p-2 bg-muted rounded">
              <span><code className="text-blue-600">POST</code> /api/maintenance/requests</span>
              <Button variant="ghost" size="sm">
                <ExternalLink className="h-3 w-3" />
              </Button>
            </div>
            <div className="flex items-center justify-between p-2 bg-muted rounded">
              <span><code className="text-orange-600">PUT</code> /api/maintenance/requests/:id</span>
              <Button variant="ghost" size="sm">
                <ExternalLink className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </div>

        <div>
          <Label htmlFor="api-key">API Key</Label>
          <div className="flex gap-2">
            <Input
              id="api-key"
              type="password"
              value="pm_sk_live_..."
              readOnly
            />
            <Button variant="outline" size="sm">
              <Key className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Keep your API key secure and never share it publicly
          </p>
        </div>

        <Button variant="outline" className="w-full">
          <Globe className="h-4 w-4 mr-2" />
          View Full Documentation
        </Button>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Integration Hub</h2>
          <p className="text-muted-foreground">
            Connect your maintenance system with external tools and services
          </p>
        </div>
      </div>

      <Tabs defaultValue="integrations" className="w-full">
        <TabsList>
          <TabsTrigger value="integrations">Integrations</TabsTrigger>
          <TabsTrigger value="webhooks">Webhooks</TabsTrigger>
          <TabsTrigger value="api">API</TabsTrigger>
        </TabsList>

        <TabsContent value="integrations" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {integrations.map((integration) => (
              <IntegrationCard key={integration.id} integration={integration} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="webhooks" className="space-y-4">
          <WebhookTester />
        </TabsContent>

        <TabsContent value="api" className="space-y-4">
          <APIDocumentation />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default IntegrationHub;