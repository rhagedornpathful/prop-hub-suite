import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Search, Users, Home, Calendar, TrendingUp, Eye, Edit, Mail, Phone } from "lucide-react";
import { useLeads } from "@/hooks/queries/useLeads";
import { usePropertyListings } from "@/hooks/queries/usePropertyListings";
import { useMarketingCampaigns } from "@/hooks/queries/useMarketingCampaigns";

const MarketingLeasing = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const { data: leads = [] } = useLeads();
  const { data: listings = [] } = usePropertyListings();
  const { data: campaigns = [] } = useMarketingCampaigns();

  const getStatusColor = (status: string) => {
    const colors = {
      new: "bg-blue-100 text-blue-800",
      contacted: "bg-yellow-100 text-yellow-800",
      qualified: "bg-green-100 text-green-800",
      converted: "bg-purple-100 text-purple-800",
      lost: "bg-red-100 text-red-800",
      active: "bg-green-100 text-green-800",
      inactive: "bg-gray-100 text-gray-800",
      featured: "bg-blue-100 text-blue-800",
      draft: "bg-gray-100 text-gray-800",
      running: "bg-green-100 text-green-800",
      completed: "bg-blue-100 text-blue-800",
      paused: "bg-yellow-100 text-yellow-800",
    };
    return colors[status as keyof typeof colors] || "bg-gray-100 text-gray-800";
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Marketing & Leasing</h1>
          <p className="text-muted-foreground mt-2">
            Manage leads, property listings, tours, and marketing campaigns
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-64"
            />
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Leads</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{leads.length}</div>
            <p className="text-xs text-muted-foreground">
              {leads.filter(lead => lead.status === 'new').length} new this month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Listings</CardTitle>
            <Home className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {listings.filter(listing => listing.is_active).length}
            </div>
            <p className="text-xs text-muted-foreground">
              {listings.filter(listing => listing.is_featured).length} featured
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tours Scheduled</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8</div>
            <p className="text-xs text-muted-foreground">3 this week</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Campaigns</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {campaigns.filter(campaign => campaign.status === 'running').length}
            </div>
            <p className="text-xs text-muted-foreground">
              ${campaigns.reduce((sum, c) => sum + (Number(c.budget) || 0), 0).toLocaleString()} total budget
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="leads" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="leads">Leads</TabsTrigger>
          <TabsTrigger value="listings">Property Listings</TabsTrigger>
          <TabsTrigger value="tours">Tours</TabsTrigger>
          <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
        </TabsList>

        {/* Leads Tab */}
        <TabsContent value="leads" className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Leads</h2>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Lead
            </Button>
          </div>

          <div className="grid gap-4">
            {leads.slice(0, 10).map((lead) => (
              <Card key={lead.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div>
                        <h3 className="font-medium">
                          {lead.first_name} {lead.last_name}
                        </h3>
                        <div className="flex items-center space-x-2 mt-1">
                          <Mail className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">{lead.email}</span>
                          {lead.phone && (
                            <>
                              <Phone className="h-4 w-4 text-muted-foreground ml-4" />
                              <span className="text-sm text-muted-foreground">{lead.phone}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge className={getStatusColor(lead.status)}>
                        {lead.status}
                      </Badge>
                      <Badge variant="outline">
                        {lead.source}
                      </Badge>
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  {lead.notes && (
                    <p className="text-sm text-muted-foreground mt-2">{lead.notes}</p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Property Listings Tab */}
        <TabsContent value="listings" className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Property Listings</h2>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Listing
            </Button>
          </div>

          <div className="grid gap-4">
            {listings.slice(0, 10).map((listing) => (
              <Card key={listing.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium">{listing.title}</h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          {listing.description || 'Property listing'}
                        </p>
                        <p className="text-lg font-semibold text-primary mt-2">
                          ${Number(listing.rent_amount).toLocaleString()}/month
                        </p>
                      </div>
                    <div className="flex items-center space-x-2">
                      {listing.is_featured && (
                        <Badge className={getStatusColor('featured')}>
                          Featured
                        </Badge>
                      )}
                      <Badge className={getStatusColor(listing.is_active ? 'active' : 'inactive')}>
                        {listing.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Tours Tab */}
        <TabsContent value="tours" className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Property Tours</h2>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Schedule Tour
            </Button>
          </div>

          <Card>
            <CardContent className="p-4">
              <p className="text-muted-foreground text-center py-8">
                No tours scheduled yet. Property tours will appear here once scheduled.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Campaigns Tab */}
        <TabsContent value="campaigns" className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Marketing Campaigns</h2>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Campaign
            </Button>
          </div>

          <div className="grid gap-4">
            {campaigns.slice(0, 10).map((campaign) => (
              <Card key={campaign.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">{campaign.name}</h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        {campaign.campaign_type} • {campaign.target_audience}
                      </p>
                      {campaign.budget && (
                        <p className="text-sm font-medium mt-2">
                          Budget: ${Number(campaign.budget).toLocaleString()}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge className={getStatusColor(campaign.status)}>
                        {campaign.status}
                      </Badge>
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MarketingLeasing;