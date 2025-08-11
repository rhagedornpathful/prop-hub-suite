import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Home, 
  Users, 
  Calendar, 
  DollarSign, 
  TrendingUp, 
  Star,
  Phone,
  Mail,
  MapPin,
  Eye,
  UserPlus,
  FileText
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { usePropertyListings } from '@/hooks/queries/usePropertyListings';
import { useLeads } from '@/hooks/queries/useLeads';
import { usePropertyTours } from '@/hooks/queries/usePropertyTours';

export const LeasingAgentPortal = () => {
  const { user } = useAuth();
  const { data: listings = [] } = usePropertyListings();
  const { data: leads = [] } = useLeads();
  const { data: tours = [] } = usePropertyTours();

  const activeListings = listings.filter(l => l.is_active);
  const newLeads = leads.filter(l => l.status === 'new');
  const scheduledTours = tours.filter(t => t.status === 'scheduled');
  const thisMonthLeases = leads.filter(l => 
    l.status === 'converted' && 
    new Date(l.updated_at).getMonth() === new Date().getMonth()
  );

  const stats = [
    {
      title: "Active Listings",
      value: activeListings.length,
      icon: Home,
      color: "text-blue-600",
      bgColor: "bg-blue-100"
    },
    {
      title: "New Leads",
      value: newLeads.length,
      icon: UserPlus,
      color: "text-green-600",
      bgColor: "bg-green-100"
    },
    {
      title: "Scheduled Tours",
      value: scheduledTours.length,
      icon: Calendar,
      color: "text-purple-600",
      bgColor: "bg-purple-100"
    },
    {
      title: "Leases This Month",
      value: thisMonthLeases.length,
      icon: FileText,
      color: "text-emerald-600",
      bgColor: "bg-emerald-100"
    }
  ];

  const conversionRate = leads.length > 0 ? 
    ((leads.filter(l => l.status === 'converted').length / leads.length) * 100).toFixed(1) : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Leasing Agent Portal</h1>
          <p className="text-muted-foreground">Manage listings, leads, and property tours</p>
        </div>
        
        <Badge variant="default">Leasing Agent</Badge>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      {stat.title}
                    </p>
                    <p className="text-2xl font-bold">{stat.value}</p>
                  </div>
                  <div className={`p-3 rounded-full ${stat.bgColor}`}>
                    <Icon className={`h-6 w-6 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Performance Metrics */}
      <div className="grid md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Conversion Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">
              {conversionRate}%
            </div>
            <p className="text-sm text-muted-foreground">
              Leads converted to leases
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Average Tour Rating</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-yellow-600">
              4.8
            </div>
            <p className="text-sm text-muted-foreground">
              Based on tour feedback
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Response Time</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">
              12m
            </div>
            <p className="text-sm text-muted-foreground">
              Average lead response time
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="leads" className="space-y-4">
        <TabsList>
          <TabsTrigger value="leads">Leads</TabsTrigger>
          <TabsTrigger value="tours">Tours</TabsTrigger>
          <TabsTrigger value="listings">Listings</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
        </TabsList>

        <TabsContent value="leads" className="space-y-4">
          <div className="grid gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UserPlus className="h-5 w-5 text-green-600" />
                  New Leads ({newLeads.length})
                </CardTitle>
                <CardDescription>Recent inquiries that need follow-up</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {newLeads.slice(0, 5).map((lead) => (
                    <div key={lead.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h4 className="font-medium">{lead.first_name} {lead.last_name}</h4>
                        <p className="text-sm text-muted-foreground flex items-center gap-1">
                          <Mail className="h-3 w-3" />
                          {lead.email}
                        </p>
                        {lead.phone && (
                          <p className="text-sm text-muted-foreground flex items-center gap-1">
                            <Phone className="h-3 w-3" />
                            {lead.phone}
                          </p>
                        )}
                        <p className="text-sm text-muted-foreground">
                          Budget: ${lead.budget_min?.toLocaleString()} - ${lead.budget_max?.toLocaleString()}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Move-in: {lead.move_in_date ? new Date(lead.move_in_date).toLocaleDateString() : 'Flexible'}
                        </p>
                      </div>
                      <div className="text-right space-y-2">
                        <Badge variant={
                          lead.priority === 'high' ? 'destructive' :
                          lead.priority === 'medium' ? 'default' : 'secondary'
                        }>
                          {lead.priority} priority
                        </Badge>
                        <div className="space-x-2">
                          <Button size="sm" variant="outline">
                            <Phone className="h-3 w-3 mr-1" />
                            Call
                          </Button>
                          <Button size="sm">
                            <Calendar className="h-3 w-3 mr-1" />
                            Schedule Tour
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                  {newLeads.length === 0 && (
                    <p className="text-center text-muted-foreground py-8">No new leads at this time</p>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Lead Pipeline</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-4 gap-4">
                  {['new', 'contacted', 'toured', 'converted'].map((status) => {
                    const statusLeads = leads.filter(l => l.status === status);
                    return (
                      <Card key={status}>
                        <CardContent className="p-4 text-center">
                          <div className="text-2xl font-bold">{statusLeads.length}</div>
                          <div className="text-sm text-muted-foreground capitalize">{status}</div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="tours" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-purple-600" />
                Scheduled Tours ({scheduledTours.length})
              </CardTitle>
              <CardDescription>Upcoming property tours</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {scheduledTours.map((tour) => (
                  <div key={tour.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h4 className="font-medium">{tour.visitor_name}</h4>
                      <p className="text-sm text-muted-foreground flex items-center gap-1">
                        <Mail className="h-3 w-3" />
                        {tour.visitor_email}
                      </p>
                      {tour.visitor_phone && (
                        <p className="text-sm text-muted-foreground flex items-center gap-1">
                          <Phone className="h-3 w-3" />
                          {tour.visitor_phone}
                        </p>
                      )}
                      <p className="text-sm text-muted-foreground">
                        Date: {new Date(tour.scheduled_date).toLocaleDateString()}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Time: {tour.scheduled_time}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Visitors: {tour.visitor_count}
                      </p>
                    </div>
                    <div className="text-right space-y-2">
                      <Badge variant="default">{tour.tour_type}</Badge>
                      <div className="space-x-2">
                        <Button size="sm" variant="outline">Reschedule</Button>
                        <Button size="sm">Start Tour</Button>
                      </div>
                    </div>
                  </div>
                ))}
                {scheduledTours.length === 0 && (
                  <p className="text-center text-muted-foreground py-8">No scheduled tours</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="listings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Home className="h-5 w-5 text-blue-600" />
                Active Listings ({activeListings.length})
              </CardTitle>
              <CardDescription>Properties currently available for lease</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {activeListings.map((listing) => (
                  <div key={listing.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h4 className="font-medium">{listing.title}</h4>
                      <p className="text-sm text-muted-foreground">{listing.description}</p>
                      <p className="text-sm text-muted-foreground">
                        Available: {new Date(listing.available_date).toLocaleDateString()}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Views: {listing.view_count} | Leads: {listing.lead_count} | Applications: {listing.application_count}
                      </p>
                    </div>
                    <div className="text-right space-y-2">
                      <p className="text-lg font-semibold">${listing.rent_amount.toLocaleString()}/month</p>
                      <Badge variant={listing.is_featured ? "default" : "secondary"}>
                        {listing.is_featured ? "Featured" : "Standard"}
                      </Badge>
                      <div className="space-x-2">
                        <Button size="sm" variant="outline">
                          <Eye className="h-3 w-3 mr-1" />
                          View
                        </Button>
                        <Button size="sm">Edit</Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Monthly Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Leads Generated</span>
                    <span className="text-sm">{leads.filter(l => new Date(l.created_at).getMonth() === new Date().getMonth()).length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Tours Conducted</span>
                    <span className="text-sm">{tours.filter(t => t.status === 'completed' && new Date(t.scheduled_date).getMonth() === new Date().getMonth()).length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Leases Signed</span>
                    <span className="text-sm">{thisMonthLeases.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Conversion Rate</span>
                    <span className="text-sm">{conversionRate}%</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Goals & Targets</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium">Monthly Leases</span>
                      <span className="text-sm">{thisMonthLeases.length}/8</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-green-600 h-2 rounded-full" 
                        style={{ width: `${Math.min((thisMonthLeases.length / 8) * 100, 100)}%` }}
                      ></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium">Lead Response Time</span>
                      <span className="text-sm">12m/15m</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-blue-600 h-2 rounded-full" style={{ width: "80%" }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium">Tour Conversion</span>
                      <span className="text-sm">65%/70%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-purple-600 h-2 rounded-full" style={{ width: "93%" }}></div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};