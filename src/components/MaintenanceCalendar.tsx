import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { format, isSameDay, parseISO } from "date-fns";
import { Clock, MapPin, User, AlertTriangle, CheckCircle, Wrench } from "lucide-react";
import { useMaintenanceCalendarEvents } from "@/hooks/queries/useMaintenanceRequests";

const MaintenanceCalendar = () => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const { data: calendarEvents = [], isLoading } = useMaintenanceCalendarEvents();

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

  const getEventsForDate = (date: Date) => {
    return calendarEvents.filter(event => {
      if (event.scheduled_date) {
        return isSameDay(parseISO(event.scheduled_date), date);
      }
      if (event.due_date) {
        return isSameDay(parseISO(event.due_date), date);
      }
      return false;
    });
  };

  const selectedDateEvents = selectedDate ? getEventsForDate(selectedDate) : [];

  const modifiersClassnames = {
    hasEvents: "bg-primary/20 text-primary font-semibold"
  };

  const modifiers = {
    hasEvents: (date: Date) => getEventsForDate(date).length > 0
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
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Calendar */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Maintenance Schedule
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
          <div className="mt-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-primary/20 rounded"></div>
              <span>Days with scheduled maintenance</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Selected Date Events */}
      <Card>
        <CardHeader>
          <CardTitle>
            {selectedDate 
              ? `Scheduled for ${format(selectedDate, "MMMM d, yyyy")}`
              : "Select a date to view events"
            }
          </CardTitle>
        </CardHeader>
        <CardContent>
          {selectedDateEvents.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Clock className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No maintenance scheduled for this date</p>
            </div>
          ) : (
            <div className="space-y-4">
              {selectedDateEvents.map((event) => (
                <div key={event.id} className="border border-border rounded-lg p-4 hover:bg-accent/50 transition-colors">
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <h4 className="font-semibold text-foreground">{event.title}</h4>
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
                      <p className="text-sm text-muted-foreground">{event.description}</p>
                    )}
                    
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="w-4 h-4 text-muted-foreground" />
                      <span className="text-muted-foreground">{event.property_address}</span>
                    </div>

                    {event.assigned_to_name && (
                      <div className="flex items-center gap-2 text-sm">
                        <User className="w-4 h-4 text-muted-foreground" />
                        <span className="text-muted-foreground">Assigned to:</span>
                        <span className="font-medium">{event.assigned_to_name}</span>
                      </div>
                    )}

                    <div className="flex gap-2 pt-2">
                      <Button size="sm" variant="outline">
                        View Details
                      </Button>
                      {event.status === 'scheduled' && (
                        <Button size="sm" variant="default">
                          Start Work
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default MaintenanceCalendar;