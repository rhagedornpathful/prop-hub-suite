import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Wrench, AlertTriangle, CheckCircle2, Clock, Search, Plus, Filter } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

interface MaintenanceRequest {
  id: string;
  title: string;
  description?: string;
  priority: string;
  status: string;
  property_id: string;
  created_at: string;
  due_date?: string;
  properties: {
    address: string;
    city: string;
    state: string;
  };
}

const PropertyManagerMobileMaintenance = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');

  // Fetch assigned properties
  const { data: assignedProperties = [] } = useQuery({
    queryKey: ['pm-assigned-properties'],
    queryFn: async () => {
      const { data } = await supabase
        .from('property_manager_assignments')
        .select('property_id')
        .eq('manager_user_id', (await supabase.auth.getUser()).data.user?.id);

      return data?.map(p => p.property_id) || [];
    }
  });

  // Fetch maintenance requests
  const { data: maintenanceRequests = [] } = useQuery({
    queryKey: ['pm-maintenance-requests'],
    queryFn: async (): Promise<MaintenanceRequest[]> => {
      if (assignedProperties.length === 0) return [];

      const { data } = await supabase
        .from('maintenance_requests')
        .select(`
          id,
          title,
          description,
          priority,
          status,
          property_id,
          created_at,
          due_date,
          properties (
            address,
            city,
            state
          )
        `)
        .in('property_id', assignedProperties)
        .order('created_at', { ascending: false });

      return data || [];
    },
    enabled: assignedProperties.length > 0
  });

  // Update maintenance status
  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase
        .from('maintenance_requests')
        .update({ 
          status,
          ...(status === 'completed' && { completed_at: new Date().toISOString() })
        })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pm-maintenance-requests'] });
      toast({
        title: "Status Updated",
        description: "Maintenance request status has been updated.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update status",
        variant: "destructive",
      });
    }
  });

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-destructive text-destructive-foreground';
      case 'high': return 'bg-warning text-warning-foreground';
      case 'medium': return 'bg-primary text-primary-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-success text-success-foreground';
      case 'in-progress': return 'bg-warning text-warning-foreground';
      case 'scheduled': return 'bg-primary text-primary-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const filteredRequests = maintenanceRequests.filter(request => {
    const matchesSearch = request.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         request.properties.address.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || request.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || request.priority === priorityFilter;
    
    return matchesSearch && matchesStatus && matchesPriority;
  });

  const urgentRequests = filteredRequests.filter(req => req.priority === 'urgent');
  const inProgressRequests = filteredRequests.filter(req => req.status === 'in-progress');
  const pendingRequests = filteredRequests.filter(req => req.status === 'pending');

  return (
    <div className="min-h-screen bg-background p-4 space-y-6 pb-24">
      {/* Header */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-foreground">Maintenance</h1>
          <Button size="sm" onClick={() => navigate('/property-manager/maintenance/new')}>
            <Plus className="h-4 w-4 mr-1" />
            New
          </Button>
        </div>
        
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search maintenance requests..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Filters */}
        <div className="grid grid-cols-2 gap-3">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="in-progress">In Progress</SelectItem>
              <SelectItem value="scheduled">Scheduled</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={priorityFilter} onValueChange={setPriorityFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Priority</SelectItem>
              <SelectItem value="urgent">Urgent</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="low">Low</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-3">
        <Card className="text-center">
          <CardContent className="p-3">
            <div className="text-xl font-bold text-destructive">{urgentRequests.length}</div>
            <div className="text-xs text-muted-foreground">Urgent</div>
          </CardContent>
        </Card>
        <Card className="text-center">
          <CardContent className="p-3">
            <div className="text-xl font-bold text-warning">{inProgressRequests.length}</div>
            <div className="text-xs text-muted-foreground">In Progress</div>
          </CardContent>
        </Card>
        <Card className="text-center">
          <CardContent className="p-3">
            <div className="text-xl font-bold text-primary">{pendingRequests.length}</div>
            <div className="text-xs text-muted-foreground">Pending</div>
          </CardContent>
        </Card>
      </div>

      {/* Urgent Requests */}
      {urgentRequests.length > 0 && (
        <Card className="border-destructive">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg text-destructive">
              <AlertTriangle className="h-5 w-5" />
              Urgent Requests
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {urgentRequests.map((request) => (
              <MaintenanceRequestCard 
                key={request.id} 
                request={request} 
                onStatusUpdate={updateStatusMutation.mutate}
                onClick={() => navigate(`/property-manager/maintenance/${request.id}`)}
              />
            ))}
          </CardContent>
        </Card>
      )}

      {/* All Requests */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Wrench className="h-5 w-5" />
            All Requests ({filteredRequests.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {filteredRequests.length === 0 ? (
            <div className="text-center py-6 text-muted-foreground">
              <CheckCircle2 className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>No maintenance requests found</p>
            </div>
          ) : (
            filteredRequests.map((request) => (
              <MaintenanceRequestCard 
                key={request.id} 
                request={request} 
                onStatusUpdate={updateStatusMutation.mutate}
                onClick={() => navigate(`/property-manager/maintenance/${request.id}`)}
              />
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
};

// Separate component for maintenance request card
const MaintenanceRequestCard = ({ 
  request, 
  onStatusUpdate, 
  onClick 
}: { 
  request: MaintenanceRequest; 
  onStatusUpdate: (params: { id: string; status: string }) => void;
  onClick: () => void;
}) => {
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-destructive text-destructive-foreground';
      case 'high': return 'bg-warning text-warning-foreground';
      case 'medium': return 'bg-primary text-primary-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-success text-success-foreground';
      case 'in-progress': return 'bg-warning text-warning-foreground';
      case 'scheduled': return 'bg-primary text-primary-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <div className="border rounded-lg p-3 space-y-3">
      <div className="cursor-pointer" onClick={onClick}>
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1">
            <div className="font-medium text-sm">{request.title}</div>
            <div className="text-xs text-muted-foreground">
              {request.properties.address}
            </div>
          </div>
          <div className="flex gap-2">
            <Badge className={`text-xs ${getPriorityColor(request.priority)}`}>
              {request.priority}
            </Badge>
            <Badge className={`text-xs ${getStatusColor(request.status)}`}>
              {request.status.replace('-', ' ')}
            </Badge>
          </div>
        </div>
        
        {request.description && (
          <div className="text-xs text-muted-foreground bg-muted p-2 rounded mb-2">
            {request.description.substring(0, 100)}...
          </div>
        )}
        
        <div className="text-xs text-muted-foreground">
          Created {format(new Date(request.created_at), 'MMM dd, yyyy')}
          {request.due_date && (
            <span className="ml-2">
              Due {format(new Date(request.due_date), 'MMM dd, yyyy')}
            </span>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      {request.status !== 'completed' && (
        <div className="flex gap-2 pt-2 border-t">
          {request.status === 'pending' && (
            <Button 
              size="sm" 
              variant="outline"
              onClick={(e) => {
                e.stopPropagation();
                onStatusUpdate({ id: request.id, status: 'in-progress' });
              }}
            >
              Start Work
            </Button>
          )}
          {request.status === 'in-progress' && (
            <Button 
              size="sm" 
              variant="default"
              onClick={(e) => {
                e.stopPropagation();
                onStatusUpdate({ id: request.id, status: 'completed' });
              }}
            >
              Mark Complete
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

export default PropertyManagerMobileMaintenance;