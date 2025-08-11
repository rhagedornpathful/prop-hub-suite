import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Wrench, 
  Calendar, 
  DollarSign, 
  Star, 
  Clock, 
  FileText, 
  Users, 
  TrendingUp,
  CheckCircle,
  AlertCircle,
  MapPin
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export const ContractorPortal = () => {
  const { user } = useAuth();

  // Mock data for contractor dashboard
  const contractorData = {
    name: "ABC Plumbing Services",
    specialties: ["Plumbing", "HVAC", "Emergency Repairs"],
    serviceAreas: ["Downtown", "Midtown", "Suburbs"],
    rating: 4.8,
    totalJobs: 156,
    activeJobs: 3,
    pendingJobs: 5,
    monthlyRevenue: 8450,
    certifications: ["Licensed Plumber", "HVAC Certified", "Insured"]
  };

  const activeJobs = [
    {
      id: 1,
      title: "Leaky Faucet Repair",
      property: "123 Main St, Apt 4B",
      priority: "medium",
      scheduledDate: "2024-08-12",
      estimatedDuration: "2 hours",
      payment: 150
    },
    {
      id: 2,
      title: "Water Heater Installation",
      property: "456 Oak Ave",
      priority: "high",
      scheduledDate: "2024-08-13",
      estimatedDuration: "4 hours",
      payment: 800
    },
    {
      id: 3,
      title: "Drain Cleaning",
      property: "789 Pine St",
      priority: "low",
      scheduledDate: "2024-08-14",
      estimatedDuration: "1 hour",
      payment: 100
    }
  ];

  const pendingJobs = [
    {
      id: 4,
      title: "Bathroom Renovation",
      property: "321 Elm St",
      priority: "medium",
      estimatedDuration: "8 hours",
      payment: 2000
    },
    {
      id: 5,
      title: "Pipe Repair",
      property: "654 Birch Rd",
      priority: "high",
      estimatedDuration: "3 hours",
      payment: 300
    }
  ];

  const stats = [
    {
      title: "Active Jobs",
      value: contractorData.activeJobs,
      icon: Wrench,
      color: "text-blue-600",
      bgColor: "bg-blue-100"
    },
    {
      title: "Pending Jobs",
      value: contractorData.pendingJobs,
      icon: Clock,
      color: "text-orange-600",
      bgColor: "bg-orange-100"
    },
    {
      title: "Monthly Revenue",
      value: `$${contractorData.monthlyRevenue.toLocaleString()}`,
      icon: DollarSign,
      color: "text-green-600",
      bgColor: "bg-green-100"
    },
    {
      title: "Rating",
      value: `${contractorData.rating}/5`,
      icon: Star,
      color: "text-yellow-600",
      bgColor: "bg-yellow-100"
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Contractor Portal</h1>
          <p className="text-muted-foreground">Welcome back, {contractorData.name}</p>
        </div>
        
        <Badge variant="default">Contractor</Badge>
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

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button variant="outline" className="h-20 flex flex-col gap-2">
              <Calendar className="h-5 w-5" />
              <span className="text-sm">View Schedule</span>
            </Button>
            <Button variant="outline" className="h-20 flex flex-col gap-2">
              <FileText className="h-5 w-5" />
              <span className="text-sm">Submit Invoice</span>
            </Button>
            <Button variant="outline" className="h-20 flex flex-col gap-2">
              <CheckCircle className="h-5 w-5" />
              <span className="text-sm">Complete Job</span>
            </Button>
            <Button variant="outline" className="h-20 flex flex-col gap-2">
              <AlertCircle className="h-5 w-5" />
              <span className="text-sm">Report Issue</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Main Content Tabs */}
      <Tabs defaultValue="jobs" className="space-y-4">
        <TabsList>
          <TabsTrigger value="jobs">Active Jobs</TabsTrigger>
          <TabsTrigger value="pending">Pending Jobs</TabsTrigger>
          <TabsTrigger value="schedule">Schedule</TabsTrigger>
          <TabsTrigger value="profile">Profile</TabsTrigger>
        </TabsList>

        <TabsContent value="jobs" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wrench className="h-5 w-5" />
                Active Jobs ({activeJobs.length})
              </CardTitle>
              <CardDescription>Jobs currently in progress or scheduled</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {activeJobs.map((job) => (
                  <div key={job.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="space-y-1">
                      <h4 className="font-medium">{job.title}</h4>
                      <p className="text-sm text-muted-foreground flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {job.property}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Scheduled: {new Date(job.scheduledDate).toLocaleDateString()}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Duration: {job.estimatedDuration}
                      </p>
                    </div>
                    <div className="text-right space-y-2">
                      <Badge variant={
                        job.priority === 'high' ? 'destructive' :
                        job.priority === 'medium' ? 'default' : 'secondary'
                      }>
                        {job.priority} priority
                      </Badge>
                      <p className="text-lg font-semibold">${job.payment}</p>
                      <Button size="sm">View Details</Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pending" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Pending Job Requests ({pendingJobs.length})
              </CardTitle>
              <CardDescription>New job requests awaiting your response</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {pendingJobs.map((job) => (
                  <div key={job.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="space-y-1">
                      <h4 className="font-medium">{job.title}</h4>
                      <p className="text-sm text-muted-foreground flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {job.property}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Est. Duration: {job.estimatedDuration}
                      </p>
                    </div>
                    <div className="text-right space-y-2">
                      <Badge variant={
                        job.priority === 'high' ? 'destructive' :
                        job.priority === 'medium' ? 'default' : 'secondary'
                      }>
                        {job.priority} priority
                      </Badge>
                      <p className="text-lg font-semibold">${job.payment}</p>
                      <div className="space-x-2">
                        <Button size="sm" variant="outline">Decline</Button>
                        <Button size="sm">Accept</Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="schedule" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Weekly Schedule</CardTitle>
              <CardDescription>Your upcoming appointments and availability</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {activeJobs
                  .sort((a, b) => new Date(a.scheduledDate).getTime() - new Date(b.scheduledDate).getTime())
                  .map((job) => (
                    <div key={job.id} className="flex items-center justify-between p-3 border-l-4 border-l-blue-500 bg-muted/50">
                      <div>
                        <h4 className="font-medium">{job.title}</h4>
                        <p className="text-sm text-muted-foreground">{job.property}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{new Date(job.scheduledDate).toLocaleDateString()}</p>
                        <p className="text-sm text-muted-foreground">{job.estimatedDuration}</p>
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="profile" className="space-y-4">
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Business Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Company Name</label>
                  <p className="text-sm text-muted-foreground">{contractorData.name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Rating</label>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">{contractorData.rating}/5</span>
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <Star 
                          key={i} 
                          className={`h-4 w-4 ${i < Math.floor(contractorData.rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
                        />
                      ))}
                    </div>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium">Total Jobs Completed</label>
                  <p className="text-sm text-muted-foreground">{contractorData.totalJobs}</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Specialties & Service Areas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Specialties</label>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {contractorData.specialties.map((specialty, index) => (
                      <Badge key={index} variant="secondary">{specialty}</Badge>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium">Service Areas</label>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {contractorData.serviceAreas.map((area, index) => (
                      <Badge key={index} variant="outline">{area}</Badge>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium">Certifications</label>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {contractorData.certifications.map((cert, index) => (
                      <Badge key={index} variant="default">{cert}</Badge>
                    ))}
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