import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  MapPin, 
  Phone, 
  Mail, 
  Calendar, 
  Star, 
  TrendingUp,
  CheckCircle,
  Clock,
  Home,
  DollarSign
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useProfile } from '@/hooks/queries/useProfiles';
import { usePropertyManagers } from '@/hooks/queries/usePropertyManagers';
import { format } from 'date-fns';

interface PropertyManagerProfileSummaryProps {
  showActions?: boolean;
  compact?: boolean;
}

export const PropertyManagerProfileSummary = ({ 
  showActions = true, 
  compact = false 
}: PropertyManagerProfileSummaryProps) => {
  const { user } = useAuth();
  const { data: profile } = useProfile();
  const { data: propertyManagers } = usePropertyManagers();

  const currentManager = propertyManagers?.find(pm => pm.user_id === user?.id);
  
  if (!currentManager || !profile) {
    return null;
  }

  const getInitials = () => {
    const firstName = profile.first_name || '';
    const lastName = profile.last_name || '';
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase() || 'PM';
  };

  const getPerformanceLevel = (completionRate: number) => {
    if (completionRate >= 95) return { level: 'Excellent', color: 'bg-green-500', stars: 5 };
    if (completionRate >= 85) return { level: 'Very Good', color: 'bg-blue-500', stars: 4 };
    if (completionRate >= 75) return { level: 'Good', color: 'bg-yellow-500', stars: 3 };
    if (completionRate >= 65) return { level: 'Fair', color: 'bg-orange-500', stars: 2 };
    return { level: 'Needs Improvement', color: 'bg-red-500', stars: 1 };
  };

  // Mock performance data (would come from actual analytics)
  const performanceData = {
    completionRate: 94,
    propertiesManaged: currentManager.assigned_properties || 0,
    totalChecks: 234,
    onTimeRate: 96,
    clientRating: 4.9,
    monthlyRevenue: 15650
  };

  const performance = getPerformanceLevel(performanceData.completionRate);

  if (compact) {
    return (
      <Card className="w-full">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <Avatar className="h-12 w-12">
              <AvatarImage src="" />
              <AvatarFallback className="bg-primary text-primary-foreground">
                {getInitials()}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold truncate">
                {profile.first_name} {profile.last_name}
              </h3>
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="text-xs">Property Manager</Badge>
                <Badge variant="outline" className="text-xs">
                  {performanceData.propertiesManaged} Properties
                </Badge>
              </div>
            </div>

            <div className="text-right">
              <div className="flex items-center gap-1 text-yellow-500">
                {[...Array(performance.stars)].map((_, i) => (
                  <Star key={i} className="h-3 w-3 fill-current" />
                ))}
              </div>
              <div className="text-xs text-muted-foreground">
                {performanceData.completionRate}% completion
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src="" />
              <AvatarFallback className="bg-primary text-primary-foreground text-lg">
                {getInitials()}
              </AvatarFallback>
            </Avatar>
            
            <div>
              <CardTitle className="text-xl">
                {profile.first_name} {profile.last_name}
              </CardTitle>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="secondary">Property Manager</Badge>
                <Badge variant="outline">
                  Since {format(new Date(currentManager.created_at), 'MMM yyyy')}
                </Badge>
              </div>
            </div>
          </div>

          <div className="text-right">
            <div className="flex items-center gap-1 text-yellow-500 justify-end">
              {[...Array(performance.stars)].map((_, i) => (
                <Star key={i} className="h-4 w-4 fill-current" />
              ))}
            </div>
            <div className="text-sm text-muted-foreground mt-1">
              {performance.level}
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Contact Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
              Contact Information
            </h4>
            
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span>{user?.email}</span>
              </div>
              
              {profile.phone && (
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span>{profile.phone}</span>
                </div>
              )}
              
              {(profile.address || profile.city) && (
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span>
                    {[profile.address, profile.city, profile.state]
                      .filter(Boolean)
                      .join(', ')}
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
              Management Portfolio
            </h4>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Properties Managed:</span>
                <Badge variant="outline">{performanceData.propertiesManaged}</Badge>
              </div>
              
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Total Checks:</span>
                <span className="font-medium">{performanceData.totalChecks}</span>
              </div>
              
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Monthly Revenue:</span>
                <span className="font-medium text-green-600">${performanceData.monthlyRevenue.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Performance Metrics */}
        <div className="space-y-3">
          <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
            Performance Overview
          </h4>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-3 border rounded-lg">
              <div className="flex items-center justify-center mb-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
              </div>
              <div className="text-lg font-bold">{performanceData.completionRate}%</div>
              <div className="text-xs text-muted-foreground">Completion Rate</div>
            </div>
            
            <div className="text-center p-3 border rounded-lg">
              <div className="flex items-center justify-center mb-2">
                <Clock className="h-5 w-5 text-blue-500" />
              </div>
              <div className="text-lg font-bold">{performanceData.onTimeRate}%</div>
              <div className="text-xs text-muted-foreground">On-Time</div>
            </div>
            
            <div className="text-center p-3 border rounded-lg">
              <div className="flex items-center justify-center mb-2">
                <Star className="h-5 w-5 text-yellow-500" />
              </div>
              <div className="text-lg font-bold">{performanceData.clientRating}</div>
              <div className="text-xs text-muted-foreground">Client Rating</div>
            </div>
            
            <div className="text-center p-3 border rounded-lg">
              <div className="flex items-center justify-center mb-2">
                <DollarSign className="h-5 w-5 text-green-500" />
              </div>
              <div className="text-lg font-bold">${performanceData.monthlyRevenue.toLocaleString()}</div>
              <div className="text-xs text-muted-foreground">Monthly Revenue</div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        {showActions && (
          <div className="flex gap-3 pt-4 border-t">
            <Button variant="outline" size="sm" className="flex-1">
              <Calendar className="h-4 w-4 mr-2" />
              View Schedule
            </Button>
            <Button variant="outline" size="sm" className="flex-1">
              <TrendingUp className="h-4 w-4 mr-2" />
              Performance Report
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};