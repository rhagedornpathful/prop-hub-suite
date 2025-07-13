import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { format, isSameDay, parseISO } from "date-fns";
import { 
  Clock, 
  MapPin, 
  User, 
  AlertTriangle, 
  CheckCircle, 
  Wrench, 
  CalendarPlus,
  CalendarClock,
  CalendarX2,
  Filter
} from "lucide-react";
import { useMaintenanceRequests } from "@/hooks/queries/useMaintenanceRequests";

interface ActivityEvent {
  id: string;
  title: string;
  description?: string;
  status: string;
  priority: string;
  date: string;
  type: 'created' | 'scheduled' | 'due' | 'completed';
  property_address: string;
  assigned_to_name?: string;
}

const MaintenanceCalendar = () => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [activityFilter, setActivityFilter] = useState<string>("all");
  const { data: maintenanceRequests = [], isLoading } = useMaintenanceRequests();

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent":
        return "bg-red-100 text-red-800 border-red-200";
      case "high":
        return "bg-orange-100 text-orange-800 border-orange-200";
      case "medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "low":
        return "bg-green-100 text-green-800 border-green-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800 border-green-200";
      case "in-progress":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "scheduled":
        return "bg-purple-100 text-purple-800 border-purple-200";
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="w-4 h-4" />;
      case "in-progress":
        return <Wrench className="w-4 h-4" />;
      case "scheduled":
        return <Clock className="w-4 h-4" />;
      case "pending":
        return <AlertTriangle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const getActivityTypeColor = (type: string) => {
    switch (type) {
      case "created":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "scheduled":
        return "bg-purple-100 text-purple-800 border-purple-200";
      case "due":
        return "bg-orange-100 text-orange-800 border-orange-200";
      case "completed":
        return "bg-green-100 text-green-800 border-green-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getActivityTypeIcon = (type: string) => {
    switch (type) {
      case "created":
        return <CalendarPlus className="w-4 h-4" />;
      case "scheduled":
        return <CalendarClock className="w-4 h-4" />;
      case "due":
        return <CalendarX2 className="w-4 h-4" />;
      case "completed":
        return <CheckCircle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  // Transform maintenance requests into activity events
  const getAllActivityEvents = (): ActivityEvent[] => {
    const events: ActivityEvent[] = [];
    
    maintenanceRequests.forEach(request => {
      const formatAddress = (props: any) => {
        if (!props) return "Unknown Property";
        const { address, city, state, zip_code } = props;
        let formatted = address;
        if (city) formatted += `, ${city}`;
        if (state) formatted += `, ${state}`;
        if (zip_code) formatted += ` ${zip_code}`;
        return formatted;
      };

      const assignedName = request.assigned_user 
        ? `${request.assigned_user.first_name} ${request.assigned_user.last_name}`
        : undefined;

      // Created event
      events.push({
        id: `${request.id}-created`,
        title: request.title,
        description: request.description,
        status: request.status,
        priority: request.priority,
        date: request.created_at,
        type: 'created',
        property_address: formatAddress(request.properties),
        assigned_to_name: assignedName
      });

      // Scheduled event
      if (request.scheduled_date) {
        events.push({
          id: `${request.id}-scheduled`,
          title: request.title,
          description: request.description,
          status: request.status,
          priority: request.priority,
          date: request.scheduled_date,
          type: 'scheduled',
          property_address: formatAddress(request.properties),
          assigned_to_name: assignedName
        });
      }

      // Due date event
      if (request.due_date) {
        events.push({
          id: `${request.id}-due`,
          title: request.title,
          description: request.description,
          status: request.status,
          priority: request.priority,
          date: request.due_date,
          type: 'due',
          property_address: formatAddress(request.properties),
          assigned_to_name: assignedName
        });
      }

      // Completed event
      if (request.completed_at) {
        events.push({
          id: `${request.id}-completed`,
          title: request.title,
          description: request.description,
          status: request.status,
          priority: request.priority,
          date: request.completed_at,
          type: 'completed',
          property_address: formatAddress(request.properties),
          assigned_to_name: assignedName
        });
      }
    });

    return events;
  };

  const allActivityEvents = getAllActivityEvents();

  const getEventsForDate = (date: Date) => {
    const events = allActivityEvents.filter(event => 
      isSameDay(parseISO(event.date), date)
    );
    
    // Filter by activity type if not "all"
    if (activityFilter !== "all") {
      return events.filter(event => event.type === activityFilter);
    }
    
    return events;
  };

  const selectedDateEvents = selectedDate ? getEventsForDate(selectedDate) : [];

  // Group events by type for better visualization
  const groupedEvents = selectedDateEvents.reduce((acc, event) => {
    if (!acc[event.type]) acc[event.type] = [];
    acc[event.type].push(event);
    return acc;
  }, {} as Record<string, ActivityEvent[]>);

  const modifiersClassnames = {
    hasEvents: "bg-primary/20 text-primary font-semibold hover:bg-primary/30",
    hasHighPriority: "bg-red-100 text-red-800 font-bold",
    hasScheduled: "bg-purple-100 text-purple-800"
  };

  const modifiers = {
    hasEvents: (date: Date) => getEventsForDate(date).length > 0,
    hasHighPriority: (date: Date) => getEventsForDate(date).some(e => e.priority === 'urgent' || e.priority === 'high'),
    hasScheduled: (date: Date) => getEventsForDate(date).some(e => e.type === 'scheduled')
  };

  if (isLoading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
        <p className="text-muted-foreground mt-2">Loading calendar...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Activity Filter */}
      <Card className="bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-2">Activity Calendar</h3>
              <p className="text-sm text-muted-foreground">Track all maintenance activities by day</p>
            </div>
            <Tabs value={activityFilter} onValueChange={setActivityFilter} className="w-full sm:w-auto">
              <TabsList className="grid w-full grid-cols-5 bg-white/50">
                <TabsTrigger value="all" className="text-xs">All</TabsTrigger>
                <TabsTrigger value="created" className="text-xs">Created</TabsTrigger>
                <TabsTrigger value="scheduled" className="text-xs">Scheduled</TabsTrigger>
                <TabsTrigger value="due" className="text-xs">Due</TabsTrigger>
                <TabsTrigger value="completed" className="text-xs">Completed</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Calendar */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-primary" />
              Maintenance Activity Calendar
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              modifiers={modifiers}
              modifiersClassNames={modifiersClassnames}
              className={cn("w-full pointer-events-auto")}
            />
            <div className="mt-4 space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-primary/20 rounded"></div>
                <span className="text-muted-foreground">Days with activity</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-red-100 border border-red-200 rounded"></div>
                <span className="text-muted-foreground">High priority items</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-purple-100 border border-purple-200 rounded"></div>
                <span className="text-muted-foreground">Scheduled work</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Daily Activity Details */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {selectedDate 
                ? `Activity for ${format(selectedDate, "MMMM d, yyyy")}`
                : "Select a date to view activity"
              }
              {selectedDateEvents.length > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {selectedDateEvents.length} {selectedDateEvents.length === 1 ? 'event' : 'events'}
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="max-h-[600px] overflow-y-auto">
            {selectedDateEvents.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Clock className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No maintenance activity for this date</p>
                <p className="text-sm mt-2">Select a highlighted date to see activity</p>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Group events by type */}
                {Object.entries(groupedEvents).map(([type, events]) => (
                  <div key={type} className="space-y-3">
                    <div className="flex items-center gap-2 pb-2 border-b border-border">
                      <Badge className={`${getActivityTypeColor(type)} border text-sm px-3 py-1`}>
                        {getActivityTypeIcon(type)}
                        <span className="ml-2 capitalize">{type} ({events.length})</span>
                      </Badge>
                    </div>
                    
                    <div className="space-y-3 pl-4">
                      {events.map((event) => (
                        <div key={event.id} className="border border-border rounded-lg p-4 hover:bg-accent/30 transition-colors bg-white/50">
                          <div className="space-y-3">
                            <div className="flex items-start justify-between">
                              <div className="space-y-1">
                                <h4 className="font-semibold text-foreground">{event.title}</h4>
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                  <Clock className="w-4 h-4" />
                                  <span>{format(parseISO(event.date), "h:mm a")}</span>
                                </div>
                              </div>
                              <div className="flex gap-2">
                                <Badge className={`${getPriorityColor(event.priority)} border text-xs`}>
                                  {event.priority}
                                </Badge>
                                <Badge className={`${getStatusColor(event.status)} border text-xs`}>
                                  {getStatusIcon(event.status)}
                                  <span className="ml-1">{event.status}</span>
                                </Badge>
                              </div>
                            </div>
                            
                            {event.description && (
                              <p className="text-sm text-muted-foreground bg-accent/20 p-2 rounded">
                                {event.description}
                              </p>
                            )}
                            
                            <div className="grid grid-cols-1 gap-2">
                              <div className="flex items-center gap-2 text-sm">
                                <MapPin className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                                <span className="text-muted-foreground">{event.property_address}</span>
                              </div>

                              {event.assigned_to_name && (
                                <div className="flex items-center gap-2 text-sm">
                                  <User className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                                  <span className="text-muted-foreground">Assigned to:</span>
                                  <span className="font-medium">{event.assigned_to_name}</span>
                                </div>
                              )}
                            </div>

                            <div className="flex gap-2 pt-2">
                              <Button size="sm" variant="outline" className="text-xs">
                                View Details
                              </Button>
                              {event.status === 'scheduled' && event.type === 'scheduled' && (
                                <Button size="sm" variant="default" className="text-xs">
                                  Start Work
                                </Button>
                              )}
                              {event.type === 'due' && event.status !== 'completed' && (
                                <Button size="sm" variant="destructive" className="text-xs">
                                  Mark Complete
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default MaintenanceCalendar;