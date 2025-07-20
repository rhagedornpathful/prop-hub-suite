import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  CheckCircle, 
  Timer, 
  Calendar as CalendarIcon,
  Square,
  Clock,
  AlertTriangle,
  Camera,
  CloudSun,
  CloudRain,
  Sun,
  CloudSnow
} from "lucide-react";
import { HomeCheckItemCard } from "./HomeCheckItemCard";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface HomeCheckItem {
  id: number;
  item: string;
  completed: boolean;
  photos: string[];
  notes: string;
  required: boolean;
  issuesFound?: boolean;
}

interface HomeCheckSummaryProps {
  items: HomeCheckItem[];
  onToggle: (itemId: number) => void;
  onNotesChange: (itemId: number, notes: string) => void;
  onPhotosUpdate: (itemId: number, photos: string[]) => void;
  generalNotes: string;
  onGeneralNotesChange: (notes: string) => void;
  elapsedTime: number;
  formatElapsedTime: (seconds: number) => string;
  startTime: Date | null;
  onSubmit: () => void;
  canSubmit: boolean;
  isSubmitting: boolean;
  weather: string;
  setWeather: (weather: string) => void;
  overallCondition: string;
  setOverallCondition: (condition: string) => void;
  weatherImpact: string;
  setWeatherImpact: (impact: string) => void;
  nextVisitDate: Date | null;
  setNextVisitDate: (date: Date | null) => void;
  totalIssuesFound: number;
  totalPhotos: number;
}

const weatherOptions = [
  { value: 'sunny', label: 'Sunny', icon: Sun },
  { value: 'cloudy', label: 'Cloudy', icon: CloudSun },
  { value: 'rainy', label: 'Rainy', icon: CloudRain },
  { value: 'stormy', label: 'Stormy', icon: CloudSnow }
];

const conditionOptions = [
  { value: 'excellent', label: 'Excellent' },
  { value: 'good', label: 'Good' },
  { value: 'fair', label: 'Fair' },
  { value: 'needs_attention', label: 'Needs Attention' }
];

export const HomeCheckSummarySection = ({
  items,
  onToggle,
  onNotesChange,
  onPhotosUpdate,
  generalNotes,
  onGeneralNotesChange,
  elapsedTime,
  formatElapsedTime,
  startTime,
  onSubmit,
  canSubmit,
  isSubmitting,
  weather,
  setWeather,
  overallCondition,
  setOverallCondition,
  weatherImpact,
  setWeatherImpact,
  nextVisitDate,
  setNextVisitDate,
  totalIssuesFound,
  totalPhotos
}: HomeCheckSummaryProps) => {
  const [isNextVisitOpen, setIsNextVisitOpen] = useState(false);

  return (
    <div className="space-y-6">
      {/* Summary Statistics */}
      <Card className="border-primary/20 bg-gradient-primary/5">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-primary" />
            Home Check Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div className="space-y-1">
              <div className="text-2xl font-bold text-destructive">{totalIssuesFound}</div>
              <div className="text-xs text-muted-foreground">Issues Found</div>
            </div>
            <div className="space-y-1">
              <div className="text-2xl font-bold text-primary">{totalPhotos}</div>
              <div className="text-xs text-muted-foreground">Photos Taken</div>
            </div>
            <div className="space-y-1">
              <div className="text-2xl font-bold text-success">
                {formatElapsedTime(elapsedTime)}
              </div>
              <div className="text-xs text-muted-foreground">Time Spent</div>
            </div>
            <div className="space-y-1">
              <div className="text-2xl font-bold text-purple-600">
                {startTime ? format(startTime, 'HH:mm') : '--:--'}
              </div>
              <div className="text-xs text-muted-foreground">Start Time</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Weather Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Weather Conditions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium">Current Weather</label>
            <Select value={weather} onValueChange={setWeather}>
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Select weather" />
              </SelectTrigger>
              <SelectContent>
                {weatherOptions.map((option) => {
                  const Icon = option.icon;
                  return (
                    <SelectItem key={option.value} value={option.value}>
                      <div className="flex items-center gap-2">
                        <Icon className="h-4 w-4" />
                        {option.label}
                      </div>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium">Weather Impact</label>
            <Textarea
              placeholder="Any weather-related observations (optional)..."
              value={weatherImpact}
              onChange={(e) => setWeatherImpact(e.target.value)}
              className="mt-1 min-h-[60px]"
            />
          </div>
        </CardContent>
      </Card>

      {/* Overall Condition */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Property Condition</CardTitle>
        </CardHeader>
        <CardContent>
          <div>
            <label className="text-sm font-medium">Overall Property Condition</label>
            <Select value={overallCondition} onValueChange={setOverallCondition}>
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Select condition" />
              </SelectTrigger>
              <SelectContent>
                {conditionOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Next Visit Date */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Schedule Next Visit</CardTitle>
        </CardHeader>
        <CardContent>
          <div>
            <label className="text-sm font-medium">Next Visit Date</label>
            <Popover open={isNextVisitOpen} onOpenChange={setIsNextVisitOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal mt-1",
                    !nextVisitDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {nextVisitDate ? format(nextVisitDate, "PPP") : "Pick a date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={nextVisitDate || undefined}
                  onSelect={(date) => {
                    setNextVisitDate(date || null);
                    setIsNextVisitOpen(false);
                  }}
                  disabled={(date) => date < new Date()}
                  initialFocus
                  className="p-3 pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
          </div>
        </CardContent>
      </Card>

      {/* Summary Items */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Final Summary Items</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {items.map((item) => (
            <HomeCheckItemCard
              key={item.id}
              item={item}
              onToggle={onToggle}
              onNotesChange={onNotesChange}
              onPhotosUpdate={onPhotosUpdate}
            />
          ))}
        </CardContent>
      </Card>

      {/* General Notes */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Final Notes</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            placeholder="Add any final observations or notes about the home check..."
            value={generalNotes}
            onChange={(e) => onGeneralNotesChange(e.target.value)}
            className="min-h-[100px]"
          />
        </CardContent>
      </Card>

      {/* Submit Section */}
      <Card className={`border-2 ${canSubmit ? 'border-success bg-success/5' : 'border-warning bg-warning/5'}`}>
        <CardContent className="pt-6">
          <div className="flex flex-col items-center text-center space-y-4">
            <div className="flex items-center gap-2">
              {canSubmit ? (
                <CheckCircle className="h-6 w-6 text-success" />
              ) : (
                <AlertTriangle className="h-6 w-6 text-warning" />
              )}
              <h3 className="text-lg font-semibold">
                {canSubmit ? 'Ready to Complete Home Check' : 'Required Items Incomplete'}
              </h3>
            </div>
            
            <p className="text-sm text-muted-foreground max-w-md">
              {canSubmit 
                ? 'All required items have been completed. You can now submit your home check.'
                : 'Please complete all required items before submitting the home check.'
              }
            </p>

            <Button
              onClick={onSubmit}
              disabled={!canSubmit || isSubmitting}
              className={`${
                canSubmit 
                  ? 'bg-gradient-success hover:bg-success-dark' 
                  : 'opacity-50'
              } min-w-[200px]`}
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin h-4 w-4 mr-2 border-2 border-white border-t-transparent rounded-full" />
                  Submitting...
                </>
              ) : (
                <>
                  <Square className="h-4 w-4 mr-2" />
                  Complete Home Check
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};