import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { 
  Clock, 
  CheckCircle, 
  AlertTriangle, 
  Wrench, 
  User, 
  Calendar,
  MessageSquare,
  FileText,
  ArrowRight
} from "lucide-react";
import { useState } from "react";
import { useMaintenanceStatusHistory } from "@/hooks/queries/useMaintenanceRequests";
import { format } from "date-fns";

interface MaintenanceTimelineProps {
  requestId: string;
  currentStatus: string;
  onStatusChange: (newStatus: string, notes?: string) => void;
}

const MaintenanceTimeline = ({ requestId, currentStatus, onStatusChange }: MaintenanceTimelineProps) => {
  const [isUpdating, setIsUpdating] = useState(false);
  const [statusNotes, setStatusNotes] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  
  const { data: statusHistory = [], isLoading } = useMaintenanceStatusHistory(requestId);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <AlertTriangle className="w-4 h-4 text-yellow-600" />;
      case "scheduled":
        return <Calendar className="w-4 h-4 text-blue-600" />;
      case "in-progress":
        return <Wrench className="w-4 h-4 text-orange-600" />;
      case "completed":
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case "cancelled":
        return <AlertTriangle className="w-4 h-4 text-red-600" />;
      default:
        return <Clock className="w-4 h-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "border-yellow-200 bg-yellow-50";
      case "scheduled":
        return "border-blue-200 bg-blue-50";
      case "in-progress":
        return "border-orange-200 bg-orange-50";
      case "completed":
        return "border-green-200 bg-green-50";
      case "cancelled":
        return "border-red-200 bg-red-50";
      default:
        return "border-gray-200 bg-gray-50";
    }
  };

  const statusOptions = [
    { value: "pending", label: "Pending", description: "Awaiting assignment" },
    { value: "scheduled", label: "Scheduled", description: "Date/time assigned" },
    { value: "in-progress", label: "In Progress", description: "Work has started" },
    { value: "completed", label: "Completed", description: "Work finished" },
    { value: "cancelled", label: "Cancelled", description: "Request cancelled" },
  ];

  const handleStatusUpdate = async () => {
    if (!selectedStatus) return;
    
    setIsUpdating(true);
    try {
      await onStatusChange(selectedStatus, statusNotes);
      setSelectedStatus("");
      setStatusNotes("");
    } finally {
      setIsUpdating(false);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Status Timeline
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex gap-4">
                <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="w-5 h-5" />
          Status Timeline
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Current Status */}
        <div className={`p-4 rounded-lg border-2 ${getStatusColor(currentStatus)}`}>
          <div className="flex items-center gap-3">
            {getStatusIcon(currentStatus)}
            <div>
              <h3 className="font-semibold capitalize">{currentStatus}</h3>
              <p className="text-sm text-muted-foreground">Current Status</p>
            </div>
          </div>
        </div>

        {/* Status History Timeline */}
        <div className="space-y-4">
          <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
            History
          </h4>
          
          {statusHistory.length === 0 ? (
            <div className="text-center py-6 text-muted-foreground">
              <FileText className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p>No status changes recorded yet</p>
            </div>
          ) : (
            <div className="relative">
              {/* Timeline line */}
              <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-border"></div>
              
              {statusHistory.map((history, index) => (
                <div key={history.id} className="relative flex gap-4 pb-6">
                  {/* Timeline dot */}
                  <div className="relative z-10 flex items-center justify-center w-8 h-8 bg-background border-2 border-primary rounded-full">
                    {getStatusIcon(history.new_status)}
                  </div>
                  
                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="outline" className="text-xs">
                        {history.old_status || "initial"} → {history.new_status}
                      </Badge>
                      <ArrowRight className="w-3 h-3 text-muted-foreground" />
                    </div>
                    
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                      <User className="w-3 h-3" />
                      <span>Changed by system</span>
                      <span>•</span>
                      <span>{format(new Date(history.changed_at), "MMM dd, yyyy 'at' h:mm a")}</span>
                    </div>
                    
                    {history.notes && (
                      <div className="flex items-start gap-2 mt-2 p-2 bg-muted/50 rounded text-sm">
                        <MessageSquare className="w-3 h-3 mt-0.5 text-muted-foreground" />
                        <span>{history.notes}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Status Update Section */}
        <div className="border-t pt-6 space-y-4">
          <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
            Update Status
          </h4>
          
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {statusOptions
              .filter(option => option.value !== currentStatus)
              .map((option) => (
                <Button
                  key={option.value}
                  variant={selectedStatus === option.value ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedStatus(option.value)}
                  className="justify-start h-auto p-3"
                >
                  <div className="text-left">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(option.value)}
                      <span className="font-medium">{option.label}</span>
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {option.description}
                    </div>
                  </div>
                </Button>
              ))}
          </div>
          
          {selectedStatus && (
            <div className="space-y-3">
              <Textarea
                placeholder="Add notes about this status change (optional)..."
                value={statusNotes}
                onChange={(e) => setStatusNotes(e.target.value)}
                className="min-h-[80px]"
              />
              
              <div className="flex gap-2">
                <Button
                  onClick={handleStatusUpdate}
                  disabled={isUpdating}
                  className="flex-1"
                >
                  {isUpdating ? "Updating..." : `Update to ${selectedStatus}`}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setSelectedStatus("");
                    setStatusNotes("");
                  }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default MaintenanceTimeline;