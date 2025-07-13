import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { PropertyCheckItemCard } from "./PropertyCheckItemCard";
import { CheckCircle, FileText } from "lucide-react";

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
}

export const SummarySection = ({ 
  items, 
  onToggle, 
  onNotesChange, 
  onPhotosUpdate,
  generalNotes,
  onGeneralNotesChange
}: SummarySectionProps) => {
  return (
    <div className="space-y-4">
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