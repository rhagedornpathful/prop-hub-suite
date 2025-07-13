import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Play, 
  Pause, 
  Settings, 
  Plus, 
  Trash2,
  Clock,
  Zap,
  AlertTriangle,
  CheckCircle,
  Mail,
  MessageSquare,
  Calendar,
  User,
  Building,
  Wrench
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface WorkflowRule {
  id: string;
  name: string;
  description: string;
  trigger: {
    type: 'status_change' | 'time_based' | 'priority' | 'cost_threshold' | 'tenant_request';
    conditions: Record<string, any>;
  };
  actions: Array<{
    type: 'notify' | 'assign' | 'schedule' | 'escalate' | 'update_status';
    config: Record<string, any>;
  }>;
  isActive: boolean;
  lastTriggered?: string;
  triggerCount: number;
}

const AutomationWorkflows = () => {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedWorkflow, setSelectedWorkflow] = useState<WorkflowRule | null>(null);
  const { toast } = useToast();

  const workflows: WorkflowRule[] = [
    {
      id: '1',
      name: 'High Priority Auto-Assignment',
      description: 'Automatically assign high priority requests to senior technicians',
      trigger: {
        type: 'priority',
        conditions: { priority: 'high', property_type: 'any' }
      },
      actions: [
        {
          type: 'assign',
          config: { assignee: 'senior_tech_pool', notification: true }
        },
        {
          type: 'notify',
          config: { recipients: ['property_manager'], method: 'email_sms' }
        }
      ],
      isActive: true,
      lastTriggered: '2024-01-15T09:30:00Z',
      triggerCount: 23
    },
    {
      id: '2',
      name: 'Emergency Escalation',
      description: 'Escalate emergency requests if not acknowledged within 15 minutes',
      trigger: {
        type: 'time_based',
        conditions: { priority: 'emergency', delay_minutes: 15, status: 'pending' }
      },
      actions: [
        {
          type: 'escalate',
          config: { escalate_to: 'emergency_contact', method: 'phone_call' }
        },
        {
          type: 'notify',
          config: { recipients: ['admin', 'property_owner'], method: 'urgent_alert' }
        }
      ],
      isActive: true,
      lastTriggered: '2024-01-14T14:22:00Z',
      triggerCount: 3
    },
    {
      id: '3',
      name: 'Cost Approval Workflow',
      description: 'Require owner approval for maintenance costs over $500',
      trigger: {
        type: 'cost_threshold',
        conditions: { estimated_cost: 500, currency: 'USD' }
      },
      actions: [
        {
          type: 'notify',
          config: { recipients: ['property_owner'], method: 'email', require_approval: true }
        },
        {
          type: 'update_status',
          config: { status: 'pending_owner_approval' }
        }
      ],
      isActive: true,
      lastTriggered: '2024-01-13T11:45:00Z',
      triggerCount: 8
    },
    {
      id: '4',
      name: 'Preventive Maintenance Scheduling',
      description: 'Automatically schedule recurring maintenance tasks',
      trigger: {
        type: 'time_based',
        conditions: { schedule: 'monthly', property_type: 'all', maintenance_type: 'preventive' }
      },
      actions: [
        {
          type: 'schedule',
          config: { task_type: 'hvac_inspection', advance_days: 7 }
        },
        {
          type: 'assign',
          config: { assignee: 'maintenance_team', auto_assign: true }
        }
      ],
      isActive: false,
      triggerCount: 0
    },
    {
      id: '5',
      name: 'Tenant Satisfaction Follow-up',
      description: 'Send satisfaction survey after work completion',
      trigger: {
        type: 'status_change',
        conditions: { from_status: 'in_progress', to_status: 'completed' }
      },
      actions: [
        {
          type: 'notify',
          config: { recipients: ['tenant'], method: 'email', template: 'satisfaction_survey', delay_hours: 24 }
        }
      ],
      isActive: true,
      lastTriggered: '2024-01-15T16:20:00Z',
      triggerCount: 15
    }
  ];

  const triggerTypes = [
    { value: 'status_change', label: 'Status Change', icon: <Wrench className="h-4 w-4" /> },
    { value: 'time_based', label: 'Time Based', icon: <Clock className="h-4 w-4" /> },
    { value: 'priority', label: 'Priority Level', icon: <AlertTriangle className="h-4 w-4" /> },
    { value: 'cost_threshold', label: 'Cost Threshold', icon: <Building className="h-4 w-4" /> },
    { value: 'tenant_request', label: 'Tenant Request', icon: <User className="h-4 w-4" /> }
  ];

  const actionTypes = [
    { value: 'notify', label: 'Send Notification', icon: <Mail className="h-4 w-4" /> },
    { value: 'assign', label: 'Auto Assign', icon: <User className="h-4 w-4" /> },
    { value: 'schedule', label: 'Schedule Task', icon: <Calendar className="h-4 w-4" /> },
    { value: 'escalate', label: 'Escalate', icon: <AlertTriangle className="h-4 w-4" /> },
    { value: 'update_status', label: 'Update Status', icon: <CheckCircle className="h-4 w-4" /> }
  ];

  const toggleWorkflow = (workflowId: string) => {
    const workflow = workflows.find(w => w.id === workflowId);
    if (workflow) {
      toast({
        title: workflow.isActive ? "Workflow Paused" : "Workflow Activated",
        description: `${workflow.name} has been ${workflow.isActive ? 'paused' : 'activated'}`,
      });
    }
  };

  const deleteWorkflow = (workflowId: string) => {
    const workflow = workflows.find(w => w.id === workflowId);
    if (workflow) {
      toast({
        title: "Workflow Deleted",
        description: `${workflow.name} has been deleted`,
        variant: "destructive"
      });
    }
  };

  const WorkflowCard = ({ workflow }: { workflow: WorkflowRule }) => (
    <Card className="relative">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <CardTitle className="text-base">{workflow.name}</CardTitle>
              <Badge variant={workflow.isActive ? "default" : "secondary"}>
                {workflow.isActive ? "Active" : "Inactive"}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">{workflow.description}</p>
          </div>
          <Switch
            checked={workflow.isActive}
            onCheckedChange={() => toggleWorkflow(workflow.id)}
          />
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div>
            <h4 className="text-sm font-medium mb-2">Trigger</h4>
            <Badge variant="outline" className="mb-2">
              {triggerTypes.find(t => t.value === workflow.trigger.type)?.label}
            </Badge>
            <div className="text-xs text-muted-foreground">
              {JSON.stringify(workflow.trigger.conditions, null, 0).replace(/[{}]/g, '').replace(/"/g, '')}
            </div>
          </div>

          <div>
            <h4 className="text-sm font-medium mb-2">Actions</h4>
            <div className="space-y-1">
              {workflow.actions.map((action, index) => (
                <Badge key={index} variant="outline" className="mr-1 mb-1">
                  {actionTypes.find(a => a.value === action.type)?.label}
                </Badge>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Triggered {workflow.triggerCount} times</span>
            {workflow.lastTriggered && (
              <span>Last: {new Date(workflow.lastTriggered).toLocaleDateString()}</span>
            )}
          </div>

          <div className="flex gap-2">
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="flex-1">
                  <Settings className="h-4 w-4 mr-2" />
                  Edit
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Edit Workflow: {workflow.name}</DialogTitle>
                </DialogHeader>
                <WorkflowEditor workflow={workflow} />
              </DialogContent>
            </Dialog>
            
            <Button 
              variant="destructive" 
              size="sm"
              onClick={() => deleteWorkflow(workflow.id)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const WorkflowEditor = ({ workflow }: { workflow?: WorkflowRule }) => (
    <div className="space-y-6">
      <div className="space-y-4">
        <div>
          <Label htmlFor="workflow-name">Workflow Name</Label>
          <Input
            id="workflow-name"
            placeholder="Enter workflow name"
            defaultValue={workflow?.name}
          />
        </div>
        
        <div>
          <Label htmlFor="workflow-desc">Description</Label>
          <Input
            id="workflow-desc"
            placeholder="Describe what this workflow does"
            defaultValue={workflow?.description}
          />
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-medium">Trigger Conditions</h3>
        
        <div>
          <Label htmlFor="trigger-type">Trigger Type</Label>
          <Select defaultValue={workflow?.trigger.type}>
            <SelectTrigger>
              <SelectValue placeholder="Select trigger type" />
            </SelectTrigger>
            <SelectContent>
              {triggerTypes.map((trigger) => (
                <SelectItem key={trigger.value} value={trigger.value}>
                  <div className="flex items-center gap-2">
                    {trigger.icon}
                    {trigger.label}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="priority-level">Priority Level</Label>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Any priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="any">Any Priority</SelectItem>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="emergency">Emergency</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label htmlFor="property-type">Property Type</Label>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Any property" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="any">Any Property</SelectItem>
                <SelectItem value="residential">Residential</SelectItem>
                <SelectItem value="commercial">Commercial</SelectItem>
                <SelectItem value="mixed">Mixed Use</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-medium">Actions</h3>
        
        <div className="space-y-3">
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  <span className="font-medium">Send Notification</span>
                </div>
                <Switch defaultChecked />
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="notify-recipients">Recipients</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select recipients" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="tenant">Tenant</SelectItem>
                      <SelectItem value="property_owner">Property Owner</SelectItem>
                      <SelectItem value="property_manager">Property Manager</SelectItem>
                      <SelectItem value="assigned_tech">Assigned Technician</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="notify-method">Method</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select method" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="email">Email</SelectItem>
                      <SelectItem value="sms">SMS</SelectItem>
                      <SelectItem value="email_sms">Email + SMS</SelectItem>
                      <SelectItem value="app_notification">App Notification</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  <span className="font-medium">Auto Assignment</span>
                </div>
                <Switch />
              </div>
              
              <div>
                <Label htmlFor="assign-to">Assign To</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select assignee" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="next_available">Next Available Tech</SelectItem>
                    <SelectItem value="senior_tech">Senior Technician</SelectItem>
                    <SelectItem value="specialist">Specialist Team</SelectItem>
                    <SelectItem value="property_manager">Property Manager</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="flex justify-end gap-2">
        <Button variant="outline">Cancel</Button>
        <Button>Save Workflow</Button>
      </div>
    </div>
  );

  const WorkflowTemplates = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Popular Templates</h3>
      
      <div className="grid gap-4">
        {[
          {
            name: 'Emergency Response',
            description: 'Immediate escalation for emergency maintenance requests',
            triggers: ['Emergency Priority', 'After Hours'],
            actions: ['Phone Alert', 'SMS Blast', 'Email Escalation']
          },
          {
            name: 'Preventive Maintenance',
            description: 'Scheduled recurring maintenance tasks',
            triggers: ['Monthly Schedule', 'Seasonal'],
            actions: ['Auto Schedule', 'Assign Team', 'Notify Tenant']
          },
          {
            name: 'Cost Control',
            description: 'Approval workflow for high-cost repairs',
            triggers: ['Cost > $500', 'Major Repairs'],
            actions: ['Owner Approval', 'Estimate Required', 'Hold Work']
          }
        ].map((template, index) => (
          <Card key={index} className="cursor-pointer hover:bg-muted/50">
            <CardContent className="pt-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h4 className="font-medium mb-1">{template.name}</h4>
                  <p className="text-sm text-muted-foreground mb-3">{template.description}</p>
                  
                  <div className="space-y-2">
                    <div>
                      <span className="text-xs font-medium text-muted-foreground">Triggers:</span>
                      <div className="flex gap-1 mt-1">
                        {template.triggers.map((trigger, i) => (
                          <Badge key={i} variant="outline" className="text-xs">
                            {trigger}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <span className="text-xs font-medium text-muted-foreground">Actions:</span>
                      <div className="flex gap-1 mt-1">
                        {template.actions.map((action, i) => (
                          <Badge key={i} variant="outline" className="text-xs">
                            {action}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
                
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Use Template
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Automation Workflows</h2>
          <p className="text-muted-foreground">
            Automate maintenance processes with intelligent rules and triggers
          </p>
        </div>
        
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Workflow
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Workflow</DialogTitle>
            </DialogHeader>
            <WorkflowEditor />
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="active" className="w-full">
        <TabsList>
          <TabsTrigger value="active">Active Workflows</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {workflows.map((workflow) => (
              <WorkflowCard key={workflow.id} workflow={workflow} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="templates" className="space-y-4">
          <WorkflowTemplates />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AutomationWorkflows;