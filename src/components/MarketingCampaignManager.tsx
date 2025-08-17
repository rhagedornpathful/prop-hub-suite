import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { TrendingUp, DollarSign, Eye, Users, Target, Plus, Calendar, Share2 } from 'lucide-react';
import { format } from 'date-fns';

import { useMarketingCampaigns } from '@/hooks/queries/useMarketingCampaigns';

// Mock data for marketing campaigns as fallback
const mockCampaigns = [
  {
    id: '1',
    name: 'Downtown Luxury Apartments - Summer Campaign',
    description: 'Targeted campaign for downtown luxury units',
    campaign_type: 'paid_ads',
    budget: 2500,
    start_date: '2024-01-15',
    end_date: '2024-02-15',
    status: 'active',
    platforms: ['facebook', 'google', 'zillow'],
    metrics: {
      impressions: 45000,
      clicks: 1200,
      leads: 35,
      cost_per_lead: 71.43
    },
    property_id: 'prop-1'
  },
  {
    id: '2',
    name: 'Family Homes Spring Promotion',
    description: 'Email campaign for family-friendly properties',
    campaign_type: 'email',
    budget: 500,
    start_date: '2024-01-10',
    end_date: '2024-01-31',
    status: 'completed',
    platforms: ['email'],
    metrics: {
      impressions: 5000,
      clicks: 250,
      leads: 12,
      cost_per_lead: 41.67
    },
    property_id: 'prop-2'
  }
];

const getStatusColor = (status: string) => {
  const colors = {
    draft: 'bg-gray-500/10 text-gray-600',
    active: 'bg-green-500/10 text-green-600',
    paused: 'bg-yellow-500/10 text-yellow-600',
    completed: 'bg-blue-500/10 text-blue-600',
    cancelled: 'bg-red-500/10 text-red-600',
  };
  return colors[status as keyof typeof colors] || colors.draft;
};

const getCampaignTypeIcon = (type: string) => {
  switch (type) {
    case 'email':
      return '📧';
    case 'social_media':
      return '📱';
    case 'paid_ads':
      return '💰';
    case 'print':
      return '📰';
    case 'direct_mail':
      return '📬';
    case 'event':
      return '🎉';
    default:
      return '📊';
  }
};

export const MarketingCampaignManager = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');

  // Use real campaigns from database hook - fallback to mock data if hook fails
  const { data: realCampaigns, isLoading: campaignsLoading } = useMarketingCampaigns();
  const campaigns = realCampaigns && realCampaigns.length > 0 ? realCampaigns : mockCampaigns;
  const isLoading = campaignsLoading;

  const filteredCampaigns = campaigns?.filter(campaign => {
    const matchesSearch = 
      campaign.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      campaign.description?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || campaign.status === statusFilter;
    const matchesType = typeFilter === 'all' || campaign.campaign_type === typeFilter;
    
    return matchesSearch && matchesStatus && matchesType;
  });

  const stats = {
    total: campaigns?.length || 0,
    active: campaigns?.filter(c => c.status === 'active').length || 0,
    totalBudget: campaigns?.reduce((sum, c) => sum + (c.budget || 0), 0) || 0,
    totalLeads: campaigns?.reduce((sum, c) => {
      const metrics = c.metrics;
      if (typeof metrics === 'object' && metrics && 'leads' in metrics) {
        return sum + ((metrics as any).leads || 0);
      }
      return sum;
    }, 0) || 0,
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="pb-2">
                <div className="h-4 bg-muted rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-muted rounded w-1/3"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Campaigns</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Campaigns</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.active}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Budget</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.totalBudget.toLocaleString()}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Leads</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalLeads}</div>
          </CardContent>
        </Card>
      </div>

      {/* Header with Actions */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <CardTitle>Marketing Campaigns</CardTitle>
              <CardDescription>Create and manage marketing campaigns for your properties</CardDescription>
            </div>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Campaign
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col lg:flex-row gap-4">
            <Input
              placeholder="Search campaigns..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1"
            />
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full lg:w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="paused">Paused</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-full lg:w-[180px]">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="email">Email</SelectItem>
                <SelectItem value="social_media">Social Media</SelectItem>
                <SelectItem value="paid_ads">Paid Ads</SelectItem>
                <SelectItem value="print">Print</SelectItem>
                <SelectItem value="direct_mail">Direct Mail</SelectItem>
                <SelectItem value="event">Event</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Campaigns List */}
      <div className="grid gap-6">
        {filteredCampaigns?.map((campaign) => (
          <Card key={campaign.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{getCampaignTypeIcon(campaign.campaign_type)}</span>
                    <div>
                      <h3 className="font-semibold text-lg">{campaign.name}</h3>
                      <p className="text-sm text-muted-foreground">{campaign.description}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Badge className={getStatusColor(campaign.status)}>
                      {campaign.status}
                    </Badge>
                    <Badge variant="outline" className="capitalize">
                      {campaign.campaign_type.replace('_', ' ')}
                    </Badge>
                  </div>
                </div>
                
                {/* Campaign Timeline */}
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    <span>
                      {format(new Date(campaign.start_date), 'MMM dd')} - {format(new Date(campaign.end_date), 'MMM dd, yyyy')}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-1">
                    <DollarSign className="h-3 w-3" />
                    <span>Budget: ${campaign.budget?.toLocaleString()}</span>
                  </div>
                  
                  {campaign.platforms && (
                    <div className="flex items-center gap-1">
                      <Share2 className="h-3 w-3" />
                      <span>{campaign.platforms.join(', ')}</span>
                    </div>
                  )}
                </div>
                
                {/* Campaign Progress */}
                {campaign.start_date && campaign.end_date && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Campaign Progress</span>
                      <span>
                        {Math.round(((new Date().getTime() - new Date(campaign.start_date).getTime()) / 
                        (new Date(campaign.end_date).getTime() - new Date(campaign.start_date).getTime())) * 100)}%
                      </span>
                    </div>
                    <Progress 
                      value={Math.min(100, Math.max(0, ((new Date().getTime() - new Date(campaign.start_date).getTime()) / 
                      (new Date(campaign.end_date).getTime() - new Date(campaign.start_date).getTime())) * 100))}
                      className="h-2"
                    />
                  </div>
                )}
                
                {/* Campaign Metrics */}
                {campaign.metrics && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-muted/50 rounded-lg">
                    <div className="text-center">
                      <div className="text-lg font-semibold">
                        {typeof campaign.metrics === 'object' && campaign.metrics && 'impressions' in campaign.metrics 
                          ? (campaign.metrics as any).impressions?.toLocaleString() || '0'
                          : '0'
                        }
                      </div>
                      <div className="text-xs text-muted-foreground flex items-center justify-center gap-1">
                        <Eye className="h-3 w-3" />
                        Impressions
                      </div>
                    </div>
                    
                    <div className="text-center">
                      <div className="text-lg font-semibold">
                        {typeof campaign.metrics === 'object' && campaign.metrics && 'clicks' in campaign.metrics 
                          ? (campaign.metrics as any).clicks?.toLocaleString() || '0'
                          : '0'
                        }
                      </div>
                      <div className="text-xs text-muted-foreground">Clicks</div>
                    </div>
                    
                    <div className="text-center">
                      <div className="text-lg font-semibold">
                        {typeof campaign.metrics === 'object' && campaign.metrics && 'leads' in campaign.metrics 
                          ? (campaign.metrics as any).leads || '0'
                          : '0'
                        }
                      </div>
                      <div className="text-xs text-muted-foreground flex items-center justify-center gap-1">
                        <Users className="h-3 w-3" />
                        Leads
                      </div>
                    </div>
                    
                    <div className="text-center">
                      <div className="text-lg font-semibold">
                        ${typeof campaign.metrics === 'object' && campaign.metrics && 'cost_per_lead' in campaign.metrics 
                          ? (campaign.metrics as any).cost_per_lead?.toFixed(2) || '0.00'
                          : '0.00'
                        }
                      </div>
                      <div className="text-xs text-muted-foreground">Cost/Lead</div>
                    </div>
                  </div>
                )}
                
                {/* Actions */}
                <div className="flex flex-wrap gap-2 pt-2">
                  <Button size="sm">
                    View Analytics
                  </Button>
                  <Button variant="outline" size="sm">
                    Edit Campaign
                  </Button>
                  {campaign.status === 'active' && (
                    <Button variant="outline" size="sm" className="text-yellow-600 hover:text-yellow-700">
                      Pause
                    </Button>
                  )}
                  {campaign.status === 'paused' && (
                    <Button variant="outline" size="sm" className="text-green-600 hover:text-green-700">
                      Resume
                    </Button>
                  )}
                  <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                    Stop Campaign
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredCampaigns?.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <Target className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium">No campaigns found</h3>
            <p className="text-muted-foreground">
              {searchTerm || statusFilter !== 'all' || typeFilter !== 'all'
                ? 'Try adjusting your filters'
                : 'Create your first marketing campaign to start promoting your properties'}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};