import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  Edit,
  Trash2
} from "lucide-react";
import { useState } from "react";

interface Vendor {
  id: string;
  name: string;
  category: string;
  rating: number;
  totalJobs: number;
  completedJobs: number;
  averageResponseTime: number;
  phone: string;
  email: string;
  address: string;
  specialties: string[];
  hourlyRate: number;
  availability: "available" | "busy" | "unavailable";
  lastActive: string;
  joinedDate: string;
  notes: string;
}

const VendorManagementSystem = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [availabilityFilter, setAvailabilityFilter] = useState("all");
  const [selectedTab, setSelectedTab] = useState("directory");
  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null);

  // Mock vendor data
  const vendors: Vendor[] = [
    {
      id: "1",
      name: "Mike's Plumbing",
      category: "Plumbing",
      rating: 4.8,
      totalJobs: 127,
      completedJobs: 124,
      averageResponseTime: 2.5,
      phone: "(555) 123-4567",
      email: "mike@mikesplumbing.com",
      address: "123 Main St, City, State 12345",
      specialties: ["Emergency Repairs", "Pipe Installation", "Drain Cleaning"],
      hourlyRate: 75,
      availability: "available",
      lastActive: "2024-01-13T10:30:00Z",
      joinedDate: "2023-06-15",
      notes: "Reliable and fast response. Excellent for emergency calls."
    },
    {
      id: "2",
      name: "Cool Air HVAC",
      category: "HVAC",
      rating: 4.6,
      totalJobs: 89,
      completedJobs: 85,
      averageResponseTime: 4.2,
      phone: "(555) 234-5678",
      email: "service@coolair.com",
      address: "456 Oak Ave, City, State 12345",
      specialties: ["AC Repair", "Heating Systems", "Duct Cleaning"],
      hourlyRate: 85,
      availability: "busy",
      lastActive: "2024-01-12T15:45:00Z",
      joinedDate: "2023-03-10",
      notes: "Great for complex HVAC systems. Requires advance booking."
    },
    {
      id: "3",
      name: "Bright Electric",
      category: "Electrical",
      rating: 4.9,
      totalJobs: 156,
      completedJobs: 154,
      averageResponseTime: 1.8,
      phone: "(555) 345-6789",
      email: "info@brightelectric.com",
      address: "789 Pine St, City, State 12345",
      specialties: ["Wiring", "Panel Upgrades", "Smart Home Installation"],
      hourlyRate: 95,
      availability: "available",
      lastActive: "2024-01-13T09:15:00Z",
      joinedDate: "2022-11-20",
      notes: "Top-rated electrician. Excellent work quality and punctuality."
    },
    {
      id: "4",
      name: "Fix-It Pro",
      category: "General",
      rating: 4.7,
      totalJobs: 203,
      completedJobs: 198,
      averageResponseTime: 3.1,
      phone: "(555) 456-7890",
      email: "contact@fixitpro.com",
      address: "321 Elm St, City, State 12345",
      specialties: ["Carpentry", "Drywall", "General Repairs"],
      hourlyRate: 65,
      availability: "available",
      lastActive: "2024-01-13T14:20:00Z",
      joinedDate: "2023-01-05",
      notes: "Versatile handyman. Good for multiple small repairs."
    }
  ];

  const categories = ["all", "Plumbing", "HVAC", "Electrical", "General", "Roofing", "Landscaping"];

  const filteredVendors = vendors.filter(vendor => {
    const matchesSearch = vendor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         vendor.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === "all" || vendor.category === categoryFilter;
    const matchesAvailability = availabilityFilter === "all" || vendor.availability === availabilityFilter;
    
    return matchesSearch && matchesCategory && matchesAvailability;
  });

  const getAvailabilityColor = (availability: string) => {
    switch (availability) {
      case "available":
        return "text-green-600 bg-green-50 border-green-200";
      case "busy":
        return "text-yellow-600 bg-yellow-50 border-yellow-200";
      case "unavailable":
        return "text-red-600 bg-red-50 border-red-200";
      default:
        return "text-gray-600 bg-gray-50 border-gray-200";
    }
  };

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

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Vendor Management System
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={selectedTab} onValueChange={setSelectedTab}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="directory">Directory</TabsTrigger>
              <TabsTrigger value="performance">Performance</TabsTrigger>
              <TabsTrigger value="scheduling">Scheduling</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
            </TabsList>

            {/* Vendor Directory */}
            <TabsContent value="directory" className="space-y-6">
              {/* Search and Filters */}
              <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search vendors..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger className="w-40">
                    <Filter className="w-4 h-4 mr-2" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(category => (
                      <SelectItem key={category} value={category}>
                        {category === "all" ? "All Categories" : category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={availabilityFilter} onValueChange={setAvailabilityFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="available">Available</SelectItem>
                    <SelectItem value="busy">Busy</SelectItem>
                    <SelectItem value="unavailable">Unavailable</SelectItem>
                  </SelectContent>
                </Select>
                <Button className="flex items-center gap-2">
                  <Plus className="w-4 h-4" />
                  Add Vendor
                </Button>
              </div>

              {/* Vendor Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredVendors.map((vendor) => (
                  <Card key={vendor.id} className="hover:shadow-lg transition-shadow">
                    <CardContent className="p-6">
                      <div className="space-y-4">
                        {/* Header */}
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-3">
                            <Avatar>
                              <AvatarImage src={`/api/placeholder/40/40`} />
                              <AvatarFallback>{vendor.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                            </Avatar>
                            <div>
                              <h3 className="font-semibold">{vendor.name}</h3>
                              <Badge variant="secondary" className="text-xs mt-1">
                                {vendor.category}
                              </Badge>
                            </div>
                          </div>
                          <Badge className={`${getAvailabilityColor(vendor.availability)} text-xs border`}>
                            {vendor.availability}
                          </Badge>
                        </div>

                        {/* Rating and Stats */}
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <div className="flex items-center">
                              {getRatingStars(vendor.rating)}
                            </div>
                            <span className="text-sm font-medium">{vendor.rating}</span>
                            <span className="text-xs text-muted-foreground">
                              ({vendor.totalJobs} jobs)
                            </span>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-2 text-xs">
                            <div className="flex items-center gap-1">
                              <CheckCircle className="w-3 h-3 text-green-600" />
                              <span>{Math.round((vendor.completedJobs / vendor.totalJobs) * 100)}% completed</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="w-3 h-3 text-blue-600" />
                              <span>{vendor.averageResponseTime}h response</span>
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
                          <div className="flex items-center gap-2">
                            <DollarSign className="w-3 h-3" />
                            <span>${vendor.hourlyRate}/hour</span>
                          </div>
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
                            <Edit className="w-3 h-3" />
                          </Button>
                          <Button size="sm" variant="outline">
                            <MoreHorizontal className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* Performance Analytics */}
            <TabsContent value="performance" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2">
                      <Award className="w-5 h-5 text-gold" />
                      <div>
                        <p className="text-2xl font-bold">4.7</p>
                        <p className="text-xs text-muted-foreground">Avg Rating</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2">
                      <Clock className="w-5 h-5 text-blue-600" />
                      <div>
                        <p className="text-2xl font-bold">2.9h</p>
                        <p className="text-xs text-muted-foreground">Avg Response</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <div>
                        <p className="text-2xl font-bold">96%</p>
                        <p className="text-xs text-muted-foreground">Completion Rate</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2">
                      <Users className="w-5 h-5 text-purple-600" />
                      <div>
                        <p className="text-2xl font-bold">{vendors.length}</p>
                        <p className="text-xs text-muted-foreground">Active Vendors</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Top Performers */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5" />
                    Top Performers
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {vendors
                      .sort((a, b) => b.rating - a.rating)
                      .slice(0, 3)
                      .map((vendor, index) => (
                        <div key={vendor.id} className="flex items-center gap-4 p-3 border rounded-lg">
                          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground text-sm font-bold">
                            {index + 1}
                          </div>
                          <Avatar>
                            <AvatarFallback>{vendor.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <h4 className="font-semibold">{vendor.name}</h4>
                            <p className="text-sm text-muted-foreground">{vendor.category}</p>
                          </div>
                          <div className="text-right">
                            <div className="flex items-center">
                              {getRatingStars(vendor.rating)}
                            </div>
                            <p className="text-xs text-muted-foreground">{vendor.totalJobs} jobs</p>
                          </div>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Scheduling */}
            <TabsContent value="scheduling" className="space-y-6">
              <div className="text-center py-8">
                <Calendar className="w-16 h-16 mx-auto mb-4 text-muted-foreground/50" />
                <h3 className="text-lg font-semibold mb-2">Vendor Scheduling Dashboard</h3>
                <p className="text-muted-foreground mb-4">
                  Advanced scheduling features for vendor coordination
                </p>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Schedule New Appointment
                </Button>
              </div>
            </TabsContent>

            {/* Analytics */}
            <TabsContent value="analytics" className="space-y-6">
              <div className="text-center py-8">
                <FileText className="w-16 h-16 mx-auto mb-4 text-muted-foreground/50" />
                <h3 className="text-lg font-semibold mb-2">Vendor Analytics</h3>
                <p className="text-muted-foreground mb-4">
                  Comprehensive performance analytics and reporting
                </p>
                <Button>
                  View Detailed Reports
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default VendorManagementSystem;