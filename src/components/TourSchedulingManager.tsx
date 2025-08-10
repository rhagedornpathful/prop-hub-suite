import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { usePropertyTours, useUpcomingTours } from '@/hooks/queries/usePropertyTours';
import { Calendar, Clock, MapPin, User, Users, Video, Home, Eye, Plus } from 'lucide-react';
import { format } from 'date-fns';

const getStatusColor = (status: string) => {
  const colors = {
    scheduled: 'bg-blue-500/10 text-blue-600',
    confirmed: 'bg-green-500/10 text-green-600',
    completed: 'bg-gray-500/10 text-gray-600',
    cancelled: 'bg-red-500/10 text-red-600',
    no_show: 'bg-orange-500/10 text-orange-600',
  };
  return colors[status as keyof typeof colors] || colors.scheduled;
};

const getTourTypeIcon = (type: string) => {
  switch (type) {
    case 'virtual':
      return <Video className="h-3 w-3" />;
    case 'self_guided':
      return <Eye className="h-3 w-3" />;
    default:
      return <Home className="h-3 w-3" />;
  }
};

export const TourSchedulingManager = () => {
  const { data: allTours, isLoading: allLoading } = usePropertyTours();
  const { data: upcomingTours, isLoading: upcomingLoading } = useUpcomingTours();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');

  const filteredTours = allTours?.filter(tour => {
    const matchesSearch = 
      tour.visitor_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tour.visitor_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tour.properties?.street_address?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || tour.status === statusFilter;
    const matchesType = typeFilter === 'all' || tour.tour_type === typeFilter;
    
    return matchesSearch && matchesStatus && matchesType;
  });

  const stats = {
    total: allTours?.length || 0,
    upcoming: upcomingTours?.length || 0,
    completed: allTours?.filter(t => t.status === 'completed').length || 0,
    cancelled: allTours?.filter(t => t.status === 'cancelled').length || 0,
  };

  if (allLoading || upcomingLoading) {
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
            <CardTitle className="text-sm font-medium">Total Tours</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Upcoming</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.upcoming}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <Home className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.completed}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cancelled</CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.cancelled}</div>
          </CardContent>
        </Card>
      </div>

      {/* Upcoming Tours Section */}
      {upcomingTours && upcomingTours.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Upcoming Tours</CardTitle>
            <CardDescription>Tours scheduled for the next few days</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {upcomingTours.slice(0, 3).map((tour) => (
                <div key={tour.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      {getTourTypeIcon(tour.tour_type)}
                      <div>
                        <div className="font-medium">{tour.visitor_name}</div>
                        <div className="text-sm text-muted-foreground">{tour.visitor_email}</div>
                      </div>
                    </div>
                    
                    <div className="text-sm">
                      <div className="font-medium">
                        {format(new Date(tour.scheduled_date), 'MMM dd')} at {tour.scheduled_time}
                      </div>
                      <div className="text-muted-foreground">
                        {tour.properties?.street_address}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Badge className={getStatusColor(tour.status)}>
                      {tour.status}
                    </Badge>
                    <Button size="sm" variant="outline">
                      View Details
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Tours Management */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <CardTitle>Property Tours</CardTitle>
              <CardDescription>Manage property tours and viewings</CardDescription>
            </div>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Schedule Tour
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col lg:flex-row gap-4">
            <Input
              placeholder="Search tours..."
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
                <SelectItem value="scheduled">Scheduled</SelectItem>
                <SelectItem value="confirmed">Confirmed</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
                <SelectItem value="no_show">No Show</SelectItem>
              </SelectContent>
            </Select>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-full lg:w-[180px]">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="in_person">In Person</SelectItem>
                <SelectItem value="virtual">Virtual</SelectItem>
                <SelectItem value="self_guided">Self Guided</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Tours List */}
      <div className="grid gap-4">
        {filteredTours?.map((tour) => (
          <Card key={tour.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="flex-1 space-y-3">
                  <div className="flex items-center gap-3">
                    {getTourTypeIcon(tour.tour_type)}
                    <h3 className="font-semibold text-lg">{tour.visitor_name}</h3>
                    <Badge className={getStatusColor(tour.status)}>
                      {tour.status.replace('_', ' ')}
                    </Badge>
                    <Badge variant="outline" className="capitalize">
                      {tour.tour_type.replace('_', ' ')}
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <User className="h-3 w-3" />
                      <span>{tour.visitor_email}</span>
                    </div>
                    
                    {tour.visitor_phone && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <span>{tour.visitor_phone}</span>
                      </div>
                    )}
                    
                    {tour.properties && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <MapPin className="h-3 w-3" />
                        <span>{tour.properties.street_address}, {tour.properties.city}</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-3 w-3 text-muted-foreground" />
                      <span>{format(new Date(tour.scheduled_date), 'MMM dd, yyyy')}</span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Clock className="h-3 w-3 text-muted-foreground" />
                      <span>{tour.scheduled_time}</span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Users className="h-3 w-3 text-muted-foreground" />
                      <span>{tour.visitor_count} visitor{tour.visitor_count !== 1 ? 's' : ''}</span>
                    </div>
                    
                    <div className="text-muted-foreground">
                      Duration: {tour.duration_minutes} min
                    </div>
                  </div>
                  
                  {tour.special_requests && (
                    <div className="text-sm">
                      <span className="text-muted-foreground">Special Requests:</span> {tour.special_requests}
                    </div>
                  )}
                  
                  {tour.rating && (
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-muted-foreground">Rating:</span>
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <span key={i} className={i < tour.rating! ? 'text-yellow-400' : 'text-gray-300'}>
                            ★
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="flex flex-col sm:flex-row lg:flex-col gap-2 lg:w-32">
                  <Button size="sm">
                    Edit
                  </Button>
                  {tour.status === 'scheduled' && (
                    <Button variant="outline" size="sm" className="text-green-600 hover:text-green-700">
                      Confirm
                    </Button>
                  )}
                  {tour.status === 'confirmed' && (
                    <Button variant="outline" size="sm" className="text-blue-600 hover:text-blue-700">
                      Complete
                    </Button>
                  )}
                  <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                    Cancel
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredTours?.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium">No tours found</h3>
            <p className="text-muted-foreground">
              {searchTerm || statusFilter !== 'all' || typeFilter !== 'all'
                ? 'Try adjusting your filters'
                : 'Scheduled tours will appear here'}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};