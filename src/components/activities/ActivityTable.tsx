import { memo } from "react";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { MapPin, User2, Activity as ActivityIcon } from "lucide-react";
import { format, isToday, isYesterday, differenceInDays } from "date-fns";
import { cn } from "@/lib/utils";
import { activityTypeColors, activityTypeIcons, statusColors, getActivityIcon } from "@/utils/activityHelpers";
import type { PropertyActivity } from "@/hooks/usePropertyActivity";

interface ActivityTableProps {
  activities: PropertyActivity[];
  onActivityClick: (activity: PropertyActivity) => void;
}

const getRelativeDate = (date: string) => {
  const activityDate = new Date(date);
  const now = new Date();
  
  if (isToday(activityDate)) {
    return `Today, ${format(activityDate, 'h:mm a')}`;
  } else if (isYesterday(activityDate)) {
    return `Yesterday, ${format(activityDate, 'h:mm a')}`;
  } else {
    const daysDiff = differenceInDays(now, activityDate);
    if (daysDiff <= 7) {
      return `${daysDiff} days ago`;
    } else {
      return format(activityDate, 'MMM d, yyyy');
    }
  }
};

const getPriorityBadge = (priority: string | undefined) => {
  if (!priority) return null;
  return (
    <Badge variant="outline" className={cn(
      "text-xs",
      priority === 'high' ? 'border-red-200 text-red-800' :
      priority === 'medium' ? 'border-yellow-200 text-yellow-800' :
      'border-green-200 text-green-800'
    )}>
      {priority}
    </Badge>
  );
};

const getStatusBadge = (status: string) => {
  if (!status) return null;
  return (
    <Badge variant="outline" className={cn("text-xs", statusColors[status as keyof typeof statusColors])}>
      {status.replace('_', ' ')}
    </Badge>
  );
};

const getActivityTypeBadge = (type: string) => {
  const IconComponent = getActivityIcon(type);
  return (
    <Badge variant="outline" className={cn("text-xs flex items-center gap-1", activityTypeColors[type as keyof typeof activityTypeColors])}>
      <IconComponent className="w-3 h-3" />
      <span>{type.replace('_', ' ')}</span>
    </Badge>
  );
};

export const ActivityTable = memo(({ activities, onActivityClick }: ActivityTableProps) => {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Activity</TableHead>
          <TableHead>Property</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Priority</TableHead>
          <TableHead>Assigned To</TableHead>
          <TableHead>Last Updated</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {activities.map((activity) => (
          <TableRow 
            key={activity.id}
            className="cursor-pointer hover:bg-muted/50"
            onClick={() => onActivityClick(activity)}
          >
            <TableCell>
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 mt-1">
                  {(() => {
                    const Icon = getActivityIcon(activity.type);
                    return <Icon className="w-4 h-4" />;
                  })()}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    {getActivityTypeBadge(activity.type)}
                  </div>
                  <div className="font-medium text-sm">{activity.title}</div>
                  {activity.description && (
                    <div className="text-xs text-muted-foreground line-clamp-1 mt-1">
                      {activity.description}
                    </div>
                  )}
                </div>
              </div>
            </TableCell>
            <TableCell>
              <div className="flex items-center gap-1 text-sm">
                <MapPin className="w-3 h-3 text-muted-foreground flex-shrink-0" />
                <span className="truncate">{activity.metadata?.property_address || 'N/A'}</span>
              </div>
            </TableCell>
            <TableCell>
              {getStatusBadge(activity.status)}
            </TableCell>
            <TableCell>
              {getPriorityBadge(activity.metadata?.priority)}
            </TableCell>
            <TableCell>
              {activity.metadata?.assigned_to_name ? (
                <div className="flex items-center gap-1 text-sm">
                  <User2 className="w-3 h-3 text-muted-foreground" />
                  <span>{activity.metadata.assigned_to_name}</span>
                </div>
              ) : (
                <span className="text-muted-foreground text-sm">Unassigned</span>
              )}
            </TableCell>
            <TableCell>
              <div className="text-sm">
                {getRelativeDate(activity.date)}
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
});

ActivityTable.displayName = "ActivityTable";

export const EmptyActivityState = () => (
  <div className="text-center py-8 text-muted-foreground">
    <ActivityIcon className="w-12 h-12 mx-auto mb-4 opacity-50" />
    <p>No activities found matching your filters</p>
  </div>
);
