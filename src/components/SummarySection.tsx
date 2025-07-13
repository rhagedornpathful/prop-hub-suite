import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { PropertyCheckItemCard } from "./PropertyCheckItemCard";
import { CheckCircle, FileText, Timer, Clock } from "lucide-react";

interface PropertyCheckItem {
  id: number;
  item: string;
  completed: boolean;
  photos: string[];
  notes: string;
  required: boolean;
}

interface SummarySectionProps {
  items: PropertyCheckItem[];
  onToggle: (itemId: number) => void;
  onNotesChange: (itemId: number, notes: string) => void;
  onPhotosUpdate: (itemId: number, photos: string[]) => void;
  generalNotes: string;
  onGeneralNotesChange: (notes: string) => void;
  elapsedTime: number;
  formatElapsedTime: (seconds: number) => string;
  startTime: Date | null;
}

export const SummarySection = ({ 
  items, 
  onToggle, 
  onNotesChange, 
  onPhotosUpdate,
  generalNotes,
  onGeneralNotesChange,
  elapsedTime,
  formatElapsedTime,
  startTime
}: SummarySectionProps) => {
  return (
    <div className="space-y-4">
      {/* Session Timing Info */}
      <Card className="shadow-md border-0 bg-gradient-subtle">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2">
            <Timer className="h-5 w-5" />
            Session Timing
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-3 bg-card rounded-lg">
              <div className="flex items-center justify-center gap-2 mb-1">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Started</span>
              </div>
              <p className="text-lg font-bold">
                {startTime ? startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--'}
              </p>
            </div>
            <div className="text-center p-3 bg-card rounded-lg">
              <div className="flex items-center justify-center gap-2 mb-1">
                <Timer className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Duration</span>
              </div>
              <p className="text-lg font-bold text-primary">
                {formatElapsedTime(elapsedTime)}
              </p>
            </div>
          </div>
          <div className="text-center">
            <Badge variant="secondary" className="px-3 py-1">
              Session in progress
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Summary Items */}
      <Card className="shadow-md border-0">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5" />
            Visit Summary
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {items.map((item) => (
            <PropertyCheckItemCard
              key={item.id}
              item={item}
              onToggle={onToggle}
              onNotesChange={onNotesChange}
              onPhotosUpdate={onPhotosUpdate}
            />
          ))}
        </CardContent>
      </Card>

      {/* General Visit Notes */}
      <Card className="shadow-md border-0">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            General Visit Notes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            placeholder="Add general comments about your visit, overall observations, or any additional notes that don't fit in the specific categories above..."
            value={generalNotes}
            onChange={(e) => onGeneralNotesChange(e.target.value)}
            className="min-h-[120px] text-sm"
          />
          <p className="text-xs text-muted-foreground mt-2">
            This section is for overall observations, recommendations, or any other important notes about the property visit.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};