import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { 
  Activity, 
  AlertTriangle, 
  CheckCircle2, 
  Info,
  TrendingUp
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { PropertyHealthMetrics } from "@/utils/propertyHealth";
import { cn } from "@/lib/utils";

interface PropertyHealthScoreProps {
  metrics: PropertyHealthMetrics;
  showDetails?: boolean;
  compact?: boolean;
}

export function PropertyHealthScore({ 
  metrics, 
  showDetails = false,
  compact = false 
}: PropertyHealthScoreProps) {
  const getRatingIcon = () => {
    switch (metrics.rating) {
      case 'excellent':
        return <CheckCircle2 className="h-4 w-4 text-success" />;
      case 'good':
        return <TrendingUp className="h-4 w-4 text-primary" />;
      case 'fair':
        return <Info className="h-4 w-4 text-warning" />;
      case 'poor':
        return <AlertTriangle className="h-4 w-4 text-destructive" />;
    }
  };

  const getRatingColor = () => {
    switch (metrics.rating) {
      case 'excellent':
        return 'bg-success/10 text-success border-success/20';
      case 'good':
        return 'bg-primary/10 text-primary border-primary/20';
      case 'fair':
        return 'bg-warning/10 text-warning border-warning/20';
      case 'poor':
        return 'bg-destructive/10 text-destructive border-destructive/20';
    }
  };

  const getProgressColor = () => {
    if (metrics.score >= 85) return 'bg-success';
    if (metrics.score >= 70) return 'bg-primary';
    if (metrics.score >= 50) return 'bg-warning';
    return 'bg-destructive';
  };

  if (compact) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-muted-foreground" />
              <div className="flex items-center gap-1.5">
                <span className={cn("font-semibold text-sm", metrics.color)}>
                  {metrics.score}
                </span>
                <Badge variant="outline" className={cn("text-xs", getRatingColor())}>
                  {metrics.rating.charAt(0).toUpperCase() + metrics.rating.slice(1)}
                </Badge>
              </div>
            </div>
          </TooltipTrigger>
          <TooltipContent side="bottom" className="max-w-xs">
            <div className="space-y-2">
              <p className="font-medium">Property Health: {metrics.score}/100</p>
              {metrics.issues.length > 0 && (
                <div className="text-xs space-y-1">
                  <p className="font-medium">Issues:</p>
                  <ul className="list-disc list-inside">
                    {metrics.issues.slice(0, 3).map((issue, i) => (
                      <li key={i}>{issue}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return (
    <Card>
      <CardContent className="p-4 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {getRatingIcon()}
            <h3 className="font-semibold">Property Health</h3>
          </div>
          <div className="flex items-center gap-2">
            <span className={cn("text-2xl font-bold", metrics.color)}>
              {metrics.score}
            </span>
            <span className="text-sm text-muted-foreground">/100</span>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Overall Rating</span>
            <Badge variant="outline" className={getRatingColor()}>
              {metrics.rating.charAt(0).toUpperCase() + metrics.rating.slice(1)}
            </Badge>
          </div>
          <Progress 
            value={metrics.score} 
            className="h-2"
            indicatorClassName={getProgressColor()}
          />
        </div>

        {showDetails && (
          <>
            {metrics.issues.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium flex items-center gap-2">
                  <AlertTriangle className="h-3.5 w-3.5 text-warning" />
                  Issues Found
                </h4>
                <ul className="space-y-1">
                  {metrics.issues.map((issue, i) => (
                    <li key={i} className="text-xs text-muted-foreground flex items-start gap-2">
                      <span className="text-warning mt-0.5">•</span>
                      <span>{issue}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {metrics.recommendations.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium flex items-center gap-2">
                  <Info className="h-3.5 w-3.5 text-primary" />
                  Recommendations
                </h4>
                <ul className="space-y-1">
                  {metrics.recommendations.map((rec, i) => (
                    <li key={i} className="text-xs text-muted-foreground flex items-start gap-2">
                      <span className="text-primary mt-0.5">•</span>
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
