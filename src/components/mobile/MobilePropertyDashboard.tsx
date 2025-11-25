import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Building,
  TrendingUp,
  DollarSign,
  AlertTriangle,
  MapPin,
  BarChart3,
  Activity,
  Plus,
  ChevronRight
} from 'lucide-react';
import { useProperties } from '@/hooks/queries/useProperties';
import { cn } from '@/lib/utils';

interface MobilePropertyDashboardProps {
  onPropertyClick?: (property: any) => void;
  onAddProperty?: () => void;
}

export const MobilePropertyDashboard: React.FC<MobilePropertyDashboardProps> = ({
  onPropertyClick,
  onAddProperty
}) => {
  const { data: propertyData, isLoading } = useProperties(1, 50);
  const properties = propertyData?.properties || [];
  
  // Calculate quick stats
  const activeProperties = properties.filter(p => p.status === 'active' || !p.status).length;
  const totalValue = properties.reduce((sum, p) => sum + (p.estimated_value || 0), 0);
  const totalRent = properties.reduce((sum, p) => sum + (p.monthly_rent || 0), 0);
  const maintenanceRequests = properties.filter(p => p.status === 'maintenance').length;
  
  const recentProperties = properties
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 10);

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'active': return 'bg-success/15 text-success border-success/30';
      case 'inactive': return 'bg-destructive/15 text-destructive border-destructive/30';
      case 'maintenance': return 'bg-warning/15 text-warning border-warning/30';
      default: return 'bg-success/15 text-success border-success/30';
    }
  };

  const getServiceTypeLabel = (type?: string) => {
    if (type === 'house_watching') return 'House Watch';
    if (type === 'property_management') return 'Property Mgmt';
    return 'Property Mgmt';
  };

  return (
    <div className="space-y-5 pb-20">
      {/* Stats Grid - 2x2 with better visual design */}
      <div className="grid grid-cols-2 gap-3">
        <StatCard 
          icon={Building}
          value={activeProperties}
          label="Active"
          colorClass="text-success bg-success/10"
        />
        <StatCard 
          icon={DollarSign}
          value={`$${totalRent.toLocaleString()}`}
          label="Monthly Rent"
          colorClass="text-primary bg-primary/10"
        />
        <StatCard 
          icon={TrendingUp}
          value={`$${Math.round(totalValue / 1000)}K`}
          label="Portfolio Value"
          colorClass="text-secondary bg-secondary/10"
        />
        <StatCard 
          icon={AlertTriangle}
          value={maintenanceRequests}
          label="Maintenance"
          colorClass="text-warning bg-warning/10"
        />
      </div>

      {/* Tabs with better styling */}
      <Tabs defaultValue="properties" className="w-full">
        <TabsList className="grid w-full grid-cols-3 h-12 p-1 bg-muted/50">
          <TabsTrigger 
            value="properties" 
            className="text-sm font-medium data-[state=active]:bg-background data-[state=active]:shadow-sm"
          >
            <Building className="h-4 w-4 mr-1.5" />
            Properties
          </TabsTrigger>
          <TabsTrigger 
            value="analytics" 
            className="text-sm font-medium data-[state=active]:bg-background data-[state=active]:shadow-sm"
          >
            <BarChart3 className="h-4 w-4 mr-1.5" />
            Analytics
          </TabsTrigger>
          <TabsTrigger 
            value="activity" 
            className="text-sm font-medium data-[state=active]:bg-background data-[state=active]:shadow-sm"
          >
            <Activity className="h-4 w-4 mr-1.5" />
            Activity
          </TabsTrigger>
        </TabsList>

        <TabsContent value="properties" className="mt-4 space-y-4">
          {/* Header with Add Button */}
          <div className="flex items-center justify-between">
            <h3 className="text-base font-semibold text-foreground">Recent Properties</h3>
            <Button 
              size="sm" 
              onClick={onAddProperty}
              className="h-9 px-4 font-medium"
            >
              <Plus className="h-4 w-4 mr-1.5" />
              Add Property
            </Button>
          </div>
          
          {/* Property List */}
          <div className="space-y-3">
            {isLoading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <PropertyCardSkeleton key={i} />
              ))
            ) : recentProperties.length === 0 ? (
              <EmptyState onAddProperty={onAddProperty} />
            ) : (
              recentProperties.map((property) => (
                <PropertyCard
                  key={property.id}
                  property={property}
                  onClick={() => onPropertyClick?.(property)}
                  getStatusColor={getStatusColor}
                  getServiceTypeLabel={getServiceTypeLabel}
                />
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="mt-4">
          <div className="text-center py-12 px-4">
            <div className="w-16 h-16 rounded-2xl bg-muted/50 flex items-center justify-center mx-auto mb-4">
              <BarChart3 className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Analytics Dashboard</h3>
            <p className="text-muted-foreground text-sm">Property analytics will be available soon.</p>
          </div>
        </TabsContent>

        <TabsContent value="activity" className="mt-4">
          <div className="space-y-4">
            <h3 className="text-base font-semibold text-foreground">Recent Activity</h3>
            <div className="space-y-3">
              <ActivityItem 
                icon={Building}
                iconBg="bg-success/10"
                iconColor="text-success"
                title="Property added: 123 Main St"
                time="2 hours ago"
              />
              <ActivityItem 
                icon={DollarSign}
                iconBg="bg-primary/10"
                iconColor="text-primary"
                title="Rent updated: 456 Oak Ave"
                time="1 day ago"
              />
              <ActivityItem 
                icon={AlertTriangle}
                iconBg="bg-warning/10"
                iconColor="text-warning"
                title="Maintenance scheduled: 789 Pine St"
                time="3 days ago"
              />
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

// Stat Card Component
const StatCard = ({ 
  icon: Icon, 
  value, 
  label, 
  colorClass 
}: { 
  icon: any; 
  value: string | number; 
  label: string; 
  colorClass: string;
}) => (
  <Card className="border-border/50 shadow-sm">
    <CardContent className="p-4">
      <div className="flex items-center gap-3">
        <div className={cn("p-2.5 rounded-xl", colorClass)}>
          <Icon className="h-5 w-5" />
        </div>
        <div className="min-w-0">
          <p className={cn("text-lg font-bold", colorClass.split(' ')[0])}>{value}</p>
          <p className="text-xs text-muted-foreground font-medium">{label}</p>
        </div>
      </div>
    </CardContent>
  </Card>
);

// Property Card Component
const PropertyCard = ({ 
  property, 
  onClick, 
  getStatusColor,
  getServiceTypeLabel
}: { 
  property: any; 
  onClick: () => void; 
  getStatusColor: (status?: string) => string;
  getServiceTypeLabel: (type?: string) => string;
}) => (
  <Card 
    className="cursor-pointer border-border/50 shadow-sm active:scale-[0.98] transition-transform"
    onClick={onClick}
  >
    <CardContent className="p-4">
      <div className="flex items-start gap-3">
        {/* Icon */}
        <div className="p-2.5 rounded-xl bg-muted/50 flex-shrink-0">
          <Building className="h-5 w-5 text-muted-foreground" />
        </div>
        
        {/* Content */}
        <div className="flex-1 min-w-0 space-y-2">
          {/* Address */}
          <p className="text-sm font-semibold text-foreground leading-tight">
            {property.address}
          </p>
          
          {/* Location */}
          <div className="flex items-center gap-1.5">
            <MapPin className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
            <p className="text-sm text-muted-foreground">
              {[property.city, property.state].filter(Boolean).join(', ') || 'No location'}
            </p>
          </div>
          
          {/* Badges Row */}
          <div className="flex items-center gap-2 flex-wrap">
            <Badge 
              variant="outline" 
              className={cn("text-xs font-medium px-2 py-0.5", getStatusColor(property.status))}
            >
              {(property.status || 'active').toUpperCase()}
            </Badge>
            <Badge 
              variant="outline" 
              className="text-xs font-medium px-2 py-0.5 bg-muted/50 text-muted-foreground border-border"
            >
              {getServiceTypeLabel(property.service_type)}
            </Badge>
          </div>
        </div>
        
        {/* Chevron */}
        <ChevronRight className="h-5 w-5 text-muted-foreground/50 flex-shrink-0 mt-1" />
      </div>
    </CardContent>
  </Card>
);

// Skeleton Loading
const PropertyCardSkeleton = () => (
  <Card className="border-border/50">
    <CardContent className="p-4">
      <div className="flex items-start gap-3">
        <div className="w-11 h-11 rounded-xl bg-muted animate-pulse" />
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-muted rounded animate-pulse w-3/4" />
          <div className="h-3.5 bg-muted rounded animate-pulse w-1/2" />
          <div className="flex gap-2">
            <div className="h-5 bg-muted rounded animate-pulse w-16" />
            <div className="h-5 bg-muted rounded animate-pulse w-20" />
          </div>
        </div>
      </div>
    </CardContent>
  </Card>
);

// Empty State
const EmptyState = ({ onAddProperty }: { onAddProperty?: () => void }) => (
  <Card className="border-dashed border-2 border-border/50">
    <CardContent className="p-8 text-center">
      <div className="w-14 h-14 rounded-2xl bg-muted/50 flex items-center justify-center mx-auto mb-4">
        <Building className="h-7 w-7 text-muted-foreground" />
      </div>
      <h4 className="text-base font-semibold mb-1">No properties yet</h4>
      <p className="text-sm text-muted-foreground mb-4">Add your first property to get started</p>
      <Button onClick={onAddProperty} className="h-10 px-5">
        <Plus className="h-4 w-4 mr-2" />
        Add Your First Property
      </Button>
    </CardContent>
  </Card>
);

// Activity Item
const ActivityItem = ({ 
  icon: Icon, 
  iconBg, 
  iconColor, 
  title, 
  time 
}: { 
  icon: any; 
  iconBg: string; 
  iconColor: string; 
  title: string; 
  time: string;
}) => (
  <Card className="border-border/50 shadow-sm">
    <CardContent className="p-4">
      <div className="flex items-center gap-3">
        <div className={cn("p-2 rounded-lg", iconBg)}>
          <Icon className={cn("h-4 w-4", iconColor)} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-foreground">{title}</p>
          <p className="text-xs text-muted-foreground">{time}</p>
        </div>
      </div>
    </CardContent>
  </Card>
);
