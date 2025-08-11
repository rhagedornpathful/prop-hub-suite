import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { 
  Users, 
  Star, 
  Phone, 
  Mail, 
  MapPin, 
  Calendar, 
  DollarSign,
  Clock,
  CheckCircle,
  AlertTriangle,
  TrendingUp,
  Award,
  FileText,
  Building,
  Wrench,
  BarChart3,
  Eye
} from "lucide-react";
import { useVendors, useVendorWorkOrders, useVendorReviews } from "@/hooks/queries/useVendors";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import AddVendorDialog from "@/components/AddVendorDialog";

const VendorPortal = () => {
  const [addVendorOpen, setAddVendorOpen] = useState(false);
  const { data: vendors, isLoading: vendorsLoading } = useVendors();
  const { data: workOrders, isLoading: workOrdersLoading } = useVendorWorkOrders();
  const { data: reviews, isLoading: reviewsLoading } = useVendorReviews();

  if (vendorsLoading) {
    return <LoadingSpinner />;
  }

  const vendorStats = {
    totalVendors: vendors?.length || 0,
    averageRating: vendors?.reduce((acc, v) => acc + v.rating, 0) / (vendors?.length || 1) || 0,
    availableVendors: vendors?.filter(v => v.availability_status === 'available').length || 0,
    completionRate: vendors?.reduce((acc, v) => acc + (v.completed_jobs / v.total_jobs), 0) / (vendors?.length || 1) || 0,
  };

  const categories = Array.from(new Set(vendors?.map(v => v.category) || []));

  const getRatingStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${
          i < Math.floor(rating) ? "text-yellow-400 fill-yellow-400" : "text-gray-300"
        }`}
      />
    ));
  };

  const getAvailabilityColor = (status: string) => {
    switch (status) {
      case "available":
        return "bg-green-100 text-green-800 border-green-200";
      case "busy":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "unavailable":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Vendor Portal</h1>
          <p className="text-muted-foreground">
            Manage contractors, track performance, and coordinate services
          </p>
        </div>
        <Button onClick={() => setAddVendorOpen(true)}>
          <Users className="w-4 h-4 mr-2" />
          Add Vendor
        </Button>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Vendors</p>
                <p className="text-2xl font-bold">{vendorStats.totalVendors}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Star className="w-6 h-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Average Rating</p>
                <p className="text-2xl font-bold">{vendorStats.averageRating.toFixed(1)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Available</p>
                <p className="text-2xl font-bold">{vendorStats.availableVendors}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <TrendingUp className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Completion Rate</p>
                <p className="text-2xl font-bold">{Math.round(vendorStats.completionRate * 100)}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="directory" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="directory">Vendor Directory</TabsTrigger>
          <TabsTrigger value="workorders">Work Orders</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        {/* Vendor Directory */}
        <TabsContent value="directory" className="space-y-6">
          {/* Category Overview */}
          <Card>
            <CardHeader>
              <CardTitle>Vendor Categories</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {categories.map(category => {
                  const categoryVendors = vendors?.filter(v => v.category === category) || [];
                  const avgRating = categoryVendors.reduce((acc, v) => acc + v.rating, 0) / categoryVendors.length;
                  
                  return (
                    <div key={category} className="p-4 border rounded-lg text-center">
                      <div className="mb-2">
                        <Wrench className="w-8 h-8 mx-auto text-blue-600" />
                      </div>
                      <h3 className="font-semibold text-sm">{category}</h3>
                      <p className="text-xs text-muted-foreground">{categoryVendors.length} vendors</p>
                      <div className="flex items-center justify-center mt-1">
                        <Star className="w-3 h-3 text-yellow-400 fill-yellow-400 mr-1" />
                        <span className="text-xs">{avgRating.toFixed(1)}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Vendor Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {vendors?.map((vendor) => (
              <Card key={vendor.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="space-y-4">
                    {/* Header */}
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <Avatar>
                          <AvatarFallback>
                            {vendor.business_name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h3 className="font-semibold">{vendor.business_name}</h3>
                          <p className="text-sm text-muted-foreground">{vendor.contact_name}</p>
                          <Badge variant="secondary" className="text-xs mt-1">
                            {vendor.category}
                          </Badge>
                        </div>
                      </div>
                      <Badge className={`${getAvailabilityColor(vendor.availability_status)} text-xs border`}>
                        {vendor.availability_status}
                      </Badge>
                    </div>

                    {/* Rating and Stats */}
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <div className="flex items-center">
                          {getRatingStars(vendor.rating)}
                        </div>
                        <span className="text-sm font-medium">{vendor.rating.toFixed(1)}</span>
                        <span className="text-xs text-muted-foreground">
                          ({vendor.total_jobs} jobs)
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="flex items-center gap-1">
                          <CheckCircle className="w-3 h-3 text-green-600" />
                          <span>{Math.round((vendor.completed_jobs / vendor.total_jobs) * 100)}% completed</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-blue-600" />
                          <span>{vendor.average_response_time_hours}h response</span>
                        </div>
                      </div>
                    </div>

                    {/* Contact Info */}
                    <div className="space-y-1 text-xs text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <Phone className="w-3 h-3" />
                        <span>{vendor.phone}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Mail className="w-3 h-3" />
                        <span>{vendor.email}</span>
                      </div>
                      {vendor.hourly_rate && (
                        <div className="flex items-center gap-2">
                          <DollarSign className="w-3 h-3" />
                          <span>${vendor.hourly_rate}/hour</span>
                        </div>
                      )}
                    </div>

                    {/* Specialties */}
                    <div className="flex flex-wrap gap-1">
                      {vendor.specialties.slice(0, 2).map((specialty) => (
                        <Badge key={specialty} variant="outline" className="text-xs">
                          {specialty}
                        </Badge>
                      ))}
                      {vendor.specialties.length > 2 && (
                        <Badge variant="outline" className="text-xs">
                          +{vendor.specialties.length - 2}
                        </Badge>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      <Button size="sm" className="flex-1">
                        <Calendar className="w-3 h-3 mr-1" />
                        Schedule
                      </Button>
                      <Button size="sm" variant="outline">
                        <Eye className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Work Orders */}
        <TabsContent value="workorders" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Vendor Work Orders
              </CardTitle>
            </CardHeader>
            <CardContent>
              {workOrdersLoading ? (
                <div className="flex justify-center py-8">
                  <LoadingSpinner />
                </div>
              ) : (
                <div className="text-center py-8">
                  <Building className="w-16 h-16 mx-auto mb-4 text-muted-foreground/50" />
                  <h3 className="text-lg font-semibold mb-2">Work Order Management</h3>
                  <p className="text-muted-foreground mb-4">
                    Track and manage work orders assigned to vendors
                  </p>
                  <Button>
                    <FileText className="w-4 h-4 mr-2" />
                    Create Work Order
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Performance */}
        <TabsContent value="performance" className="space-y-6">
          {/* Top Performers */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="w-5 h-5" />
                Top Performing Vendors
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {vendors
                  ?.sort((a, b) => b.rating - a.rating)
                  .slice(0, 5)
                  .map((vendor, index) => (
                    <div key={vendor.id} className="flex items-center gap-4 p-3 border rounded-lg">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground text-sm font-bold">
                        {index + 1}
                      </div>
                      <Avatar>
                        <AvatarFallback>
                          {vendor.business_name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <h4 className="font-semibold">{vendor.business_name}</h4>
                        <p className="text-sm text-muted-foreground">{vendor.category}</p>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center">
                          {getRatingStars(vendor.rating)}
                        </div>
                        <p className="text-xs text-muted-foreground">{vendor.total_jobs} jobs</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">{vendor.rating.toFixed(1)}</p>
                        <p className="text-xs text-muted-foreground">
                          {Math.round((vendor.completed_jobs / vendor.total_jobs) * 100)}% completion
                        </p>
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics */}
        <TabsContent value="analytics" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Vendor Analytics Dashboard
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <BarChart3 className="w-16 h-16 mx-auto mb-4 text-muted-foreground/50" />
                <h3 className="text-lg font-semibold mb-2">Advanced Analytics</h3>
                <p className="text-muted-foreground mb-4">
                  Comprehensive vendor performance analytics and insights
                </p>
                <Button>
                  <TrendingUp className="w-4 h-4 mr-2" />
                  View Analytics
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Add Vendor Dialog */}
      <AddVendorDialog 
        open={addVendorOpen} 
        onOpenChange={setAddVendorOpen} 
      />
    </div>
  );
};

export default VendorPortal;