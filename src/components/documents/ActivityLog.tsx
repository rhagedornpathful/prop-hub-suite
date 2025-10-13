import { useState, useEffect } from "react";
import { Activity, FileText, Download, Upload, Trash2, Edit, Eye } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { ScrollArea } from "@/components/ui/scroll-area";

interface ActivityRecord {
  id: string;
  activity_type: string;
  details: any;
  created_at: string;
  user_id: string;
  ip_address: unknown;
  user_agent: string;
}

interface ActivityLogProps {
  documentId: string;
  documentName: string;
}

const activityIcons = {
  created: FileText,
  viewed: Eye,
  downloaded: Download,
  updated: Edit,
  deleted: Trash2,
  version_uploaded: Upload,
  version_downloaded: Download,
  shared: Upload,
  signature_requested: FileText,
  signed: FileText,
};

const activityLabels = {
  created: "Document created",
  viewed: "Document viewed",
  downloaded: "Document downloaded",
  updated: "Document updated",
  deleted: "Document deleted",
  version_uploaded: "New version uploaded",
  version_downloaded: "Version downloaded",
  shared: "Document shared",
  signature_requested: "Signature requested",
  signed: "Document signed",
};

export function ActivityLog({ documentId, documentName }: ActivityLogProps) {
  const [activities, setActivities] = useState<ActivityRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchActivities();
  }, [documentId]);

  const fetchActivities = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from("document_activities")
        .select("*")
        .eq("document_id", documentId)
        .order("created_at", { ascending: false })
        .limit(100);

      if (error) throw error;
      setActivities(data || []);
    } catch (error) {
      console.error("Failed to fetch activities:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getActivityIcon = (type: string) => {
    const Icon = activityIcons[type as keyof typeof activityIcons] || Activity;
    return <Icon className="w-4 h-4" />;
  };

  const getActivityLabel = (type: string) => {
    return activityLabels[type as keyof typeof activityLabels] || type;
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Activity className="w-4 h-4 mr-2" />
          Activity Log
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Activity Log - {documentName}</DialogTitle>
          <DialogDescription>
            Complete audit trail of document activities
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="h-[500px] pr-4">
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : activities.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              No activity recorded yet
            </p>
          ) : (
            <div className="space-y-4">
              {activities.map((activity, index) => (
                <div
                  key={activity.id}
                  className="flex gap-4 pb-4 border-b last:border-b-0"
                >
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    {getActivityIcon(activity.activity_type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-medium">
                          {getActivityLabel(activity.activity_type)}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {format(new Date(activity.created_at), "PPp")}
                        </p>
                        {activity.details && Object.keys(activity.details).length > 0 && (
                          <div className="mt-2 text-sm">
                            {activity.details.version_number && (
                              <span className="text-muted-foreground">
                                Version {activity.details.version_number}
                              </span>
                            )}
                            {activity.details.notes && (
                              <p className="mt-1 p-2 bg-muted rounded text-xs">
                                {activity.details.notes}
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                      {activity.ip_address && (
                        <span className="text-xs text-muted-foreground">
                          {String(activity.ip_address)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
