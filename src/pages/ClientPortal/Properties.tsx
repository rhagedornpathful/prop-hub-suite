import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  ArrowLeft,
  MapPin,
  Calendar,
  FileText,
  Settings,
  Home,
  Droplets,
  Zap,
  Shield,
  Thermometer,
  Phone,
  Mail,
  Clock,
  CheckCircle,
  AlertCircle
} from "lucide-react";

const ClientProperties = () => {
  const navigate = useNavigate();
  const [selectedProperty, setSelectedProperty] = useState<number | null>(null);

  const [properties] = useState([
    {
      id: 1,
      address: "456 Oak Street",
      fullAddress: "456 Oak Street, Riverside, CA 92501",
      status: "Active",
      service: "Weekly",
      lastCheck: "2024-01-08",
      nextCheck: "2024-01-15",
      recentIssues: 0,
      propertyManager: "Mike Rodriguez",
      managerPhone: "(555) 234-5678",
      managerEmail: "mike@latitudepremier.com",
      checklistItems: [
        "Exterior inspection",
        "Interior systems",
        "Security check",
        "Utilities monitoring"
      ],
      emergencyContact: "Emergency Hotline: (555) 911-HELP",
      notes: "Pool maintenance on Wednesdays. Sprinkler system runs Tuesday/Friday mornings."
    },
    {
      id: 2,
      address: "123 Pine Avenue",
      fullAddress: "123 Pine Avenue, Riverside, CA 92502",
      status: "Active",
      service: "Bi-weekly",
      lastCheck: "2024-01-07",
      nextCheck: "2024-01-21",
      recentIssues: 1,
      propertyManager: "Sarah Chen",
      managerPhone: "(555) 345-6789",
      managerEmail: "sarah@latitudepremier.com",
      checklistItems: [
        "Exterior inspection",
        "Interior systems",
        "Security check",
        "Utilities monitoring"
      ],
      emergencyContact: "Emergency Hotline: (555) 911-HELP",
      notes: "Garden maintenance included. Key is in lockbox (code: 2024)."
    }
  ]);

  const [recentChecks] = useState([
    {
      id: 1,
      propertyId: 1,
      date: "2024-01-08",
      specialist: "Mike Rodriguez",
      status: "Completed",
      summary: "All systems normal. No issues found.",
      photos: 12,
      issues: 0
    },
    {
      id: 2,
      propertyId: 2,
      date: "2024-01-07",
      specialist: "Sarah Chen",
      status: "Completed",
      summary: "Minor sprinkler adjustment needed.",
      photos: 8,
      issues: 1
    },
    {
      id: 3,
      propertyId: 1,
      date: "2024-01-01",
      specialist: "Mike Rodriguez",
      status: "Completed",
      summary: "Holiday check completed successfully.",
      photos: 10,
      issues: 0
    }
  ]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Active": return "bg-success text-success-foreground";
      case "Issue": return "bg-warning text-warning-foreground";
      default: return "bg-muted text-muted-foreground";
    }
  };

  const selectedPropertyData = selectedProperty ? properties.find(p => p.id === selectedProperty) : null;
  const propertyChecks = selectedProperty ? recentChecks.filter(c => c.propertyId === selectedProperty) : [];

  return (
    <div className="min-h-screen bg-gradient-subtle">
      {/* Header */}
      <header className="bg-card border-b border-border p-4 shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(`${window.location.pathname.includes('/demo') ? '/demo' : ''}/client-portal`)}
              className="p-2"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-xl font-bold text-foreground">My Properties</h1>
              <p className="text-sm text-muted-foreground">Manage your property portfolio</p>
            </div>
          </div>
          <Link to={`${window.location.pathname.includes('/demo') ? '/demo' : ''}/client-portal/requests`}>
            <Button className="bg-gradient-primary hover:bg-primary-dark">
              <Settings className="h-4 w-4 mr-2" />
              Request Service
            </Button>
          </Link>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Properties List */}
          <div className="lg:col-span-1">
            <Card className="shadow-md border-0">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Home className="h-5 w-5" />
                  Properties ({properties.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {properties.map((property) => (
                  <div
                    key={property.id}
                    className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                      selectedProperty === property.id
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50"
                    }`}
                    onClick={() => setSelectedProperty(property.id)}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium text-foreground">{property.address}</span>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {property.service} Service
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <Badge className={getStatusColor(property.status)}>
                          {property.status}
                        </Badge>
                        {property.recentIssues > 0 && (
                          <Badge variant="destructive" className="text-xs">
                            {property.recentIssues} Issue{property.recentIssues > 1 ? 's' : ''}
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>Last: {property.lastCheck}</span>
                      <span>Next: {property.nextCheck}</span>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Property Details */}
          <div className="lg:col-span-2">
            {selectedPropertyData ? (
              <Tabs defaultValue="overview" className="space-y-6">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="checks">Recent Checks</TabsTrigger>
                  <TabsTrigger value="settings">Settings</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-6">
                  {/* Property Info */}
                  <Card className="shadow-md border-0">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Home className="h-5 w-5" />
                        Property Information
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">Address</label>
                          <p className="text-foreground">{selectedPropertyData.fullAddress}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">Service Level</label>
                          <p className="text-foreground">{selectedPropertyData.service} Visits</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">Status</label>
                          <Badge className={getStatusColor(selectedPropertyData.status)}>
                            {selectedPropertyData.status}
                          </Badge>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">Next Check</label>
                          <p className="text-foreground flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            {selectedPropertyData.nextCheck}
                          </p>
                        </div>
                      </div>
                      
                      {selectedPropertyData.notes && (
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">Special Instructions</label>
                          <p className="text-foreground mt-1 p-3 bg-muted rounded-lg">
                            {selectedPropertyData.notes}
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Property Manager */}
                  <Card className="shadow-md border-0">
                    <CardHeader>
                      <CardTitle>Property Manager</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gradient-primary rounded-full flex items-center justify-center">
                          <span className="text-white font-semibold">
                            {selectedPropertyData.propertyManager.split(' ').map(n => n[0]).join('')}
                          </span>
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-foreground">{selectedPropertyData.propertyManager}</h3>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                            <div className="flex items-center gap-1">
                              <Phone className="h-3 w-3" />
                              {selectedPropertyData.managerPhone}
                            </div>
                            <div className="flex items-center gap-1">
                              <Mail className="h-3 w-3" />
                              {selectedPropertyData.managerEmail}
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Link to={`${window.location.pathname.includes('/demo') ? '/demo' : ''}/client-portal/messages`}>
                            <Button size="sm" variant="outline">
                              <Mail className="h-4 w-4 mr-2" />
                              Message
                            </Button>
                          </Link>
                          <Button size="sm" variant="outline">
                            <Phone className="h-4 w-4 mr-2" />
                            Call
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Service Checklist */}
                  <Card className="shadow-md border-0">
                    <CardHeader>
                      <CardTitle>Service Checklist</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 gap-4">
                        {selectedPropertyData.checklistItems.map((item, index) => (
                          <div key={index} className="flex items-center gap-3 p-3 border border-border rounded-lg">
                            <CheckCircle className="h-5 w-5 text-success" />
                            <span className="text-foreground">{item}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="checks" className="space-y-6">
                  <Card className="shadow-md border-0">
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        <span className="flex items-center gap-2">
                          <FileText className="h-5 w-5" />
                          Recent Checks
                        </span>
                        <Link to="/client-portal/reports">
                          <Button size="sm" variant="outline">
                            View All Reports
                          </Button>
                        </Link>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {propertyChecks.map((check) => (
                        <div key={check.id} className="p-4 border border-border rounded-lg">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4 text-muted-foreground" />
                              <span className="font-medium text-foreground">{check.date}</span>
                              <Badge className="bg-success text-success-foreground">
                                {check.status}
                              </Badge>
                            </div>
                            <div className="text-sm text-muted-foreground">
                              by {check.specialist}
                            </div>
                          </div>
                          <p className="text-foreground mb-3">{check.summary}</p>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <FileText className="h-3 w-3" />
                                {check.photos} photos
                              </span>
                              <span className="flex items-center gap-1">
                                {check.issues > 0 ? (
                                  <AlertCircle className="h-3 w-3 text-warning" />
                                ) : (
                                  <CheckCircle className="h-3 w-3 text-success" />
                                )}
                                {check.issues} issues
                              </span>
                            </div>
                            <Link to={`/client-portal/reports/${check.id}`}>
                              <Button size="sm" variant="outline">
                                View Report
                              </Button>
                            </Link>
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="settings" className="space-y-6">
                  <Card className="shadow-md border-0">
                    <CardHeader>
                      <CardTitle>Property Settings</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div>
                        <h3 className="font-medium text-foreground mb-3">Service Schedule</h3>
                        <div className="p-4 border border-border rounded-lg">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium text-foreground">Current: {selectedPropertyData.service}</p>
                              <p className="text-sm text-muted-foreground">Next visit: {selectedPropertyData.nextCheck}</p>
                            </div>
                            <Button variant="outline" size="sm">
                              Modify Schedule
                            </Button>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h3 className="font-medium text-foreground mb-3">Emergency Contact</h3>
                        <div className="p-4 border border-border rounded-lg">
                          <p className="font-medium text-foreground">{selectedPropertyData.emergencyContact}</p>
                        </div>
                      </div>

                      <div>
                        <h3 className="font-medium text-foreground mb-3">Notifications</h3>
                        <div className="space-y-3">
                          <div className="flex items-center justify-between p-3 border border-border rounded-lg">
                            <div>
                              <p className="font-medium text-foreground">Check Completion Alerts</p>
                              <p className="text-sm text-muted-foreground">Get notified when checks are completed</p>
                            </div>
                            <Badge className="bg-success text-success-foreground">Enabled</Badge>
                          </div>
                          <div className="flex items-center justify-between p-3 border border-border rounded-lg">
                            <div>
                              <p className="font-medium text-foreground">Issue Alerts</p>
                              <p className="text-sm text-muted-foreground">Immediate notifications for issues</p>
                            </div>
                            <Badge className="bg-success text-success-foreground">Enabled</Badge>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            ) : (
              <Card className="shadow-md border-0">
                <CardContent className="p-12 text-center">
                  <Home className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-semibold text-foreground mb-2">Select a Property</h3>
                  <p className="text-muted-foreground">
                    Choose a property from the list to view details, recent checks, and settings.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default ClientProperties;