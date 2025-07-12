import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AnimatedList, AnimatedListItem } from "@/components/AnimatedList";
import { 
  MapPin, 
  CheckCircle, 
  Calendar,
  AlertTriangle,
  FileText,
  Clock,
  Shield,
  Eye,
  Camera,
  Plus
} from "lucide-react";
import { useNavigate } from "react-router-dom";

export function HouseWatcherDashboard() {
  const navigate = useNavigate();
  
  // Mock data - replace with actual queries based on current user
  const metrics = {
    assignedProperties: 8,
    todaysTasks: 3,
    completedThisWeek: 12,
    overdueChecks: 1
  };

  const assignedProperties = [
    { 
      id: 1, 
      address: "123 Maple Drive", 
      owner: "John Smith",
      lastCheck: "2024-07-03",
      nextCheck: "2024-07-10",
      status: "upcoming",
      frequency: "weekly"
    },
    { 
      id: 2, 
      address: "456 Oak Street", 
      owner: "Sarah Johnson",
      lastCheck: "2024-07-05",
      nextCheck: "2024-07-12",
      status: "upcoming",
      frequency: "weekly"
    },
    { 
      id: 3, 
      address: "789 Pine Avenue", 
      owner: "Mike Wilson",
      lastCheck: "2024-06-28",
      nextCheck: "2024-07-05",
      status: "overdue",
      frequency: "weekly"
    }
  ];

  const todaysTasks = [
    { 
      id: 1, 
      property: "123 Maple Drive", 
      type: "routine_check", 
      time: "10:00 AM",
      notes: "Check exterior, collect mail, water plants"
    },
    { 
      id: 2, 
      property: "456 Oak Street", 
      type: "security_check", 
      time: "2:00 PM",
      notes: "Security check after owner's vacation"
    },
    { 
      id: 3, 
      property: "321 Cedar Lane", 
      type: "maintenance_check", 
      time: "4:00 PM",
      notes: "Check recent plumbing repair"
    }
  ];

  const recentReports = [
    { 
      id: 1, 
      property: "789 Pine Avenue", 
      date: "2024-07-03",
      type: "routine",
      status: "submitted",
      issues: 0
    },
    { 
      id: 2, 
      property: "123 Maple Drive", 
      date: "2024-07-02",
      type: "security",
      status: "submitted", 
      issues: 1
    },
    { 
      id: 3, 
      property: "456 Oak Street", 
      date: "2024-07-01",
      type: "routine",
      status: "submitted",
      issues: 0
    }
  ];

  const issuesReported = [
    {
      id: 1,
      property: "123 Maple Drive",
      issue: "Front porch light not working",
      priority: "medium",
      status: "reported",
      date: "2024-07-02"
    },
    {
      id: 2,
      property: "654 Birch Road",
      issue: "Suspicious activity noticed",
      priority: "high", 
      status: "resolved",
      date: "2024-06-28"
    }
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">House Watcher Dashboard</h1>
          <p className="text-muted-foreground">Your property monitoring assignments</p>
        </div>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Submit Report
        </Button>
      </div>

      {/* Key Metrics */}
      <AnimatedList className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6" staggerDelay={0.05}>
        <AnimatedListItem>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Assigned Properties</CardTitle>
              <MapPin className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.assignedProperties}</div>
              <p className="text-xs text-muted-foreground">Under your watch</p>
            </CardContent>
          </Card>
        </AnimatedListItem>

        <AnimatedListItem>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Today's Tasks</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.todaysTasks}</div>
              <p className="text-xs text-muted-foreground">Scheduled checks</p>
            </CardContent>
          </Card>
        </AnimatedListItem>

        <AnimatedListItem>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">This Week</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.completedThisWeek}</div>
              <p className="text-xs text-muted-foreground">Checks completed</p>
            </CardContent>
          </Card>
        </AnimatedListItem>

        <AnimatedListItem>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Overdue</CardTitle>
              <AlertTriangle className="h-4 w-4 text-destructive" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-destructive">{metrics.overdueChecks}</div>
              <p className="text-xs text-muted-foreground">Needs attention</p>
            </CardContent>
          </Card>
        </AnimatedListItem>
      </AnimatedList>

      {/* Today's Schedule */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Today's Check-in Schedule
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {todaysTasks.map((task) => (
              <div key={task.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="h-3 w-3 bg-primary rounded-full"></div>
                  <div>
                    <p className="text-sm font-medium">{task.property}</p>
                    <p className="text-xs text-muted-foreground">{task.notes}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium">{task.time}</p>
                  <Badge variant="outline">{task.type.replace('_', ' ')}</Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Assigned Properties */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Assigned Properties
            </CardTitle>
            <Button variant="outline" size="sm">
              View All
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {assignedProperties.map((property) => (
                <div key={property.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="text-sm font-medium">{property.address}</p>
                    <p className="text-xs text-muted-foreground">Owner: {property.owner}</p>
                    <p className="text-xs text-muted-foreground">Last check: {property.lastCheck}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">Next: {property.nextCheck}</p>
                    <Badge 
                      variant={property.status === 'overdue' ? 'destructive' : 'outline'}
                      className={property.status === 'overdue' ? '' : 'border-primary text-primary'}
                    >
                      {property.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Reports */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Recent Reports
            </CardTitle>
            <Button variant="outline" size="sm">
              View All
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentReports.map((report) => (
                <div key={report.id} className="flex items-center justify-between p-3 bg-success/10 rounded-lg">
                  <div>
                    <p className="text-sm font-medium">{report.property}</p>
                    <p className="text-xs text-muted-foreground">{report.type} check - {report.date}</p>
                  </div>
                  <div className="text-right">
                    <Badge variant="default" className="bg-success text-success-foreground">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      {report.status}
                    </Badge>
                    {report.issues > 0 && (
                      <p className="text-xs text-warning mt-1">{report.issues} issue(s)</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Issues Reported */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Issues Reported
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {issuesReported.map((issue) => (
              <div key={issue.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <p className="text-sm font-medium">{issue.issue}</p>
                  <p className="text-xs text-muted-foreground">{issue.property} - {issue.date}</p>
                </div>
                <div className="text-right">
                  <Badge 
                    variant={issue.priority === 'high' ? 'destructive' : 'outline'}
                    className={issue.priority === 'medium' ? 'border-warning text-warning' : ''}
                  >
                    {issue.priority}
                  </Badge>
                  <p className="text-xs text-muted-foreground mt-1">{issue.status}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}