import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  ArrowLeft,
  Calendar,
  Camera,
  Download,
  Search,
  MapPin,
  Clock,
  CheckCircle,
  AlertCircle,
  Home,
  Eye,
  Filter,
  FileText,
  Share
} from "lucide-react";

const ClientReports = () => {
  const navigate = useNavigate();
  const { reportId } = useParams();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterProperty, setFilterProperty] = useState("all");
  const [selectedReport, setSelectedReport] = useState<number | null>(
    reportId ? parseInt(reportId) : null
  );

  const [reports] = useState([
    {
      id: 1,
      propertyId: 1,
      property: "456 Oak Street",
      date: "2024-01-08",
      time: "10:30 AM",
      specialist: "Mike Rodriguez",
      status: "Completed",
      summary: "Comprehensive weekly check completed successfully. All systems functioning normally.",
      photos: [
        { id: 1, category: "Exterior", filename: "front_entrance.jpg", description: "Front entrance and walkway" },
        { id: 2, category: "Exterior", filename: "roof_condition.jpg", description: "Roof condition check" },
        { id: 3, category: "Interior", filename: "hvac_system.jpg", description: "HVAC system inspection" },
        { id: 4, category: "Interior", filename: "kitchen_appliances.jpg", description: "Kitchen appliances check" },
        { id: 5, category: "Security", filename: "door_locks.jpg", description: "Door lock verification" },
        { id: 6, category: "Utilities", filename: "water_meter.jpg", description: "Water meter reading" }
      ],
      checklist: [
        { category: "Exterior", item: "Roof condition", status: "Good", notes: "No visible damage" },
        { category: "Exterior", item: "Gutters and downspouts", status: "Good", notes: "Clear and functional" },
        { category: "Interior", item: "HVAC system check", status: "Good", notes: "Running efficiently" },
        { category: "Interior", item: "Plumbing inspection", status: "Good", notes: "No leaks detected" },
        { category: "Security", item: "Door locks", status: "Good", notes: "All locks secure" },
        { category: "Utilities", item: "Water meter reading", status: "Good", notes: "145,678 gallons" }
      ],
      issues: [],
      recommendations: [
        "Consider pool maintenance this week",
        "Garden sprinklers scheduled for Tuesday"
      ]
    },
    {
      id: 2,
      propertyId: 2,
      property: "123 Pine Avenue",
      date: "2024-01-07",
      time: "2:15 PM",
      specialist: "Sarah Chen",
      status: "Completed",
      summary: "Bi-weekly property inspection completed. Minor sprinkler system adjustment needed.",
      photos: [
        { id: 7, category: "Exterior", filename: "sprinkler_system.jpg", description: "Sprinkler system issue" },
        { id: 8, category: "Exterior", filename: "front_yard.jpg", description: "Front yard condition" },
        { id: 9, category: "Interior", filename: "electrical_panel.jpg", description: "Electrical panel check" },
        { id: 10, category: "Security", filename: "alarm_system.jpg", description: "Alarm system test" }
      ],
      checklist: [
        { category: "Exterior", item: "Landscaping", status: "Good", notes: "Well maintained" },
        { category: "Exterior", item: "Sprinkler system", status: "Attention", notes: "Needs minor adjustment" },
        { category: "Interior", item: "Electrical systems", status: "Good", notes: "All systems normal" },
        { category: "Security", item: "Alarm system", status: "Good", notes: "Test successful" }
      ],
      issues: [
        { severity: "Minor", description: "Sprinkler head #4 needs adjustment", location: "Front yard" }
      ],
      recommendations: [
        "Schedule sprinkler adjustment within 7 days",
        "Monitor for proper watering coverage"
      ]
    },
    {
      id: 3,
      propertyId: 1,
      property: "456 Oak Street",
      date: "2024-01-01",
      time: "11:00 AM",
      specialist: "Mike Rodriguez",
      status: "Completed",
      summary: "Holiday property check completed. All secure for extended absence.",
      photos: [
        { id: 11, category: "Exterior", filename: "holiday_exterior.jpg", description: "Property exterior during holiday" },
        { id: 12, category: "Interior", filename: "holiday_interior.jpg", description: "Interior security check" }
      ],
      checklist: [
        { category: "Security", item: "All entry points", status: "Good", notes: "Secure and locked" },
        { category: "Utilities", item: "System checks", status: "Good", notes: "All operational" }
      ],
      issues: [],
      recommendations: [
        "Property secure for extended absence",
        "Next check scheduled as planned"
      ]
    }
  ]);

  const properties = [
    { id: 1, address: "456 Oak Street" },
    { id: 2, address: "123 Pine Avenue" }
  ];

  const filteredReports = reports.filter(report => {
    const matchesSearch = report.property.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         report.specialist.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesProperty = filterProperty === "all" || report.propertyId.toString() === filterProperty;
    return matchesSearch && matchesProperty;
  });

  const selectedReportData = selectedReport ? reports.find(r => r.id === selectedReport) : null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Good": return "bg-success text-success-foreground";
      case "Attention": return "bg-warning text-warning-foreground";
      case "Issue": return "bg-destructive text-destructive-foreground";
      default: return "bg-muted text-muted-foreground";
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "Minor": return "bg-yellow-100 text-yellow-800";
      case "Moderate": return "bg-orange-100 text-orange-800";
      case "Urgent": return "bg-red-100 text-red-800";
      default: return "bg-muted text-muted-foreground";
    }
  };

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
              <h1 className="text-xl font-bold text-foreground">
                {selectedReportData ? `Report Details` : "Check Reports"}
              </h1>
              <p className="text-sm text-muted-foreground">
                {selectedReportData 
                  ? `${selectedReportData.property} - ${selectedReportData.date}`
                  : "View property inspection reports and photos"
                }
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {selectedReportData && (
              <>
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Download PDF
                </Button>
                <Button variant="outline" size="sm">
                  <Share className="h-4 w-4 mr-2" />
                  Share
                </Button>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-6">
        {selectedReportData ? (
          /* Detailed Report View */
          <div className="space-y-6">
            <div className="flex items-center gap-4 mb-6">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedReport(null)}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Reports
              </Button>
            </div>

            {/* Report Header */}
            <Card className="shadow-md border-0">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-2xl font-bold text-foreground">{selectedReportData.property}</h2>
                    <div className="flex items-center gap-4 text-muted-foreground mt-1">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {selectedReportData.date}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {selectedReportData.time}
                      </span>
                      <span>by {selectedReportData.specialist}</span>
                    </div>
                  </div>
                  <Badge className="bg-success text-success-foreground text-lg px-4 py-2">
                    {selectedReportData.status}
                  </Badge>
                </div>
                <p className="text-foreground">{selectedReportData.summary}</p>
              </CardContent>
            </Card>

            <Tabs defaultValue="overview" className="space-y-6">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="photos">Photos ({selectedReportData.photos.length})</TabsTrigger>
                <TabsTrigger value="checklist">Checklist</TabsTrigger>
                <TabsTrigger value="issues">Issues ({selectedReportData.issues.length})</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Summary Stats */}
                  <Card className="shadow-md border-0">
                    <CardHeader>
                      <CardTitle>Inspection Summary</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="text-center p-4 bg-muted rounded-lg">
                          <div className="text-2xl font-bold text-foreground">{selectedReportData.photos.length}</div>
                          <div className="text-sm text-muted-foreground">Photos Taken</div>
                        </div>
                        <div className="text-center p-4 bg-muted rounded-lg">
                          <div className="text-2xl font-bold text-foreground">{selectedReportData.checklist.length}</div>
                          <div className="text-sm text-muted-foreground">Items Checked</div>
                        </div>
                        <div className="text-center p-4 bg-muted rounded-lg">
                          <div className="text-2xl font-bold text-foreground">{selectedReportData.issues.length}</div>
                          <div className="text-sm text-muted-foreground">Issues Found</div>
                        </div>
                        <div className="text-center p-4 bg-muted rounded-lg">
                          <div className="text-2xl font-bold text-success">100%</div>
                          <div className="text-sm text-muted-foreground">Completion</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Recommendations */}
                  <Card className="shadow-md border-0">
                    <CardHeader>
                      <CardTitle>Recommendations</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {selectedReportData.recommendations.map((recommendation, index) => (
                          <div key={index} className="flex items-start gap-3 p-3 bg-muted rounded-lg">
                            <CheckCircle className="h-5 w-5 text-success mt-0.5" />
                            <span className="text-foreground">{recommendation}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="photos" className="space-y-6">
                <Card className="shadow-md border-0">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Camera className="h-5 w-5" />
                      Property Photos
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {selectedReportData.photos.map((photo) => (
                        <div key={photo.id} className="border border-border rounded-lg overflow-hidden">
                          <div className="aspect-video bg-muted flex items-center justify-center">
                            <Camera className="h-12 w-12 text-muted-foreground" />
                          </div>
                          <div className="p-3">
                            <div className="flex items-center justify-between mb-1">
                              <Badge variant="secondary" className="text-xs">
                                {photo.category}
                              </Badge>
                              <Button size="sm" variant="ghost">
                                <Eye className="h-3 w-3" />
                              </Button>
                            </div>
                            <p className="text-sm font-medium text-foreground">{photo.filename}</p>
                            <p className="text-xs text-muted-foreground">{photo.description}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="checklist" className="space-y-6">
                <Card className="shadow-md border-0">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="h-5 w-5" />
                      Inspection Checklist
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {selectedReportData.checklist.map((item, index) => (
                        <div key={index} className="flex items-center justify-between p-4 border border-border rounded-lg">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-1">
                              <Badge variant="outline" className="text-xs">
                                {item.category}
                              </Badge>
                              <span className="font-medium text-foreground">{item.item}</span>
                            </div>
                            <p className="text-sm text-muted-foreground">{item.notes}</p>
                          </div>
                          <Badge className={getStatusColor(item.status)}>
                            {item.status}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="issues" className="space-y-6">
                <Card className="shadow-md border-0">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <AlertCircle className="h-5 w-5" />
                      Issues & Concerns
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {selectedReportData.issues.length > 0 ? (
                      <div className="space-y-4">
                        {selectedReportData.issues.map((issue, index) => (
                          <div key={index} className="p-4 border border-border rounded-lg">
                            <div className="flex items-start gap-3">
                              <AlertCircle className="h-5 w-5 text-warning mt-0.5" />
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  <Badge className={getSeverityColor(issue.severity)}>
                                    {issue.severity}
                                  </Badge>
                                  <span className="text-sm text-muted-foreground">{issue.location}</span>
                                </div>
                                <p className="text-foreground">{issue.description}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <CheckCircle className="h-16 w-16 mx-auto mb-4 text-success" />
                        <h3 className="text-lg font-semibold text-foreground mb-2">No Issues Found</h3>
                        <p className="text-muted-foreground">
                          This property inspection completed without any issues or concerns.
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        ) : (
          /* Reports List View */
          <div className="space-y-6">
            {/* Search and Filters */}
            <Card className="shadow-md border-0">
              <CardContent className="p-4">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search reports..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Select value={filterProperty} onValueChange={setFilterProperty}>
                    <SelectTrigger className="w-full md:w-48">
                      <SelectValue placeholder="Filter by property" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Properties</SelectItem>
                      {properties.map(property => (
                        <SelectItem key={property.id} value={property.id.toString()}>
                          {property.address}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Reports Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {filteredReports.map((report) => (
                <Card key={report.id} className="shadow-md border-0 hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          <MapPin className="h-4 w-4" />
                          {report.property}
                        </CardTitle>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {report.date}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {report.time}
                          </span>
                        </div>
                      </div>
                      <Badge className="bg-success text-success-foreground">
                        {report.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-foreground mb-4">{report.summary}</p>
                    
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Camera className="h-3 w-3" />
                          {report.photos.length} photos
                        </span>
                        <span className="flex items-center gap-1">
                          {report.issues.length > 0 ? (
                            <AlertCircle className="h-3 w-3 text-warning" />
                          ) : (
                            <CheckCircle className="h-3 w-3 text-success" />
                          )}
                          {report.issues.length} issues
                        </span>
                        <span>by {report.specialist}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex gap-2">
                        {report.issues.length > 0 && (
                          <Badge variant="destructive" className="text-xs">
                            {report.issues.length} Issue{report.issues.length > 1 ? 's' : ''}
                          </Badge>
                        )}
                      </div>
                      <Button
                        size="sm"
                        onClick={() => setSelectedReport(report.id)}
                        className="bg-gradient-primary hover:bg-primary-dark"
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        View Report
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {filteredReports.length === 0 && (
              <Card className="shadow-md border-0">
                <CardContent className="p-12 text-center">
                  <FileText className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-semibold text-foreground mb-2">No Reports Found</h3>
                  <p className="text-muted-foreground">
                    No reports match your current search criteria.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default ClientReports;