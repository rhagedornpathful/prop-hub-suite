import { useState } from "react";
import {
  Sparkles,
  Loader2,
  AlertTriangle,
  Clock,
  DollarSign,
  Wrench,
  Shield,
  User,
  Star,
  CheckCircle2,
  XCircle,
  ChevronDown,
  ChevronUp,
  Zap,
  Phone,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface TriageResult {
  category: string;
  subcategory: string;
  priority: "emergency" | "urgent" | "normal" | "low";
  priorityReason: string;
  estimatedCostRange: { min: number; max: number };
  troubleshootingSteps: string[];
  safetyWarnings: string[];
  dispatchRecommendation: "immediate" | "schedule" | "troubleshoot_first" | "monitor";
  suggestedVendors: Array<{
    id: string;
    name: string;
    specialty: string;
    rating: number;
    matchScore: number;
    reason: string;
  }>;
  aiNotes: string;
  photoAnalysis?: string;
  estimatedResolutionTime: string;
  ownerApprovalRequired: boolean;
  ownerApprovalReason?: string;
}

interface MaintenanceTriageProps {
  requestId?: string;
  title: string;
  description: string;
  photos?: Array<{ url: string }>;
  propertyId?: string;
  propertyType?: string;
  tenantReported?: boolean;
  onTriageComplete?: (result: TriageResult) => void;
  onVendorSelect?: (vendorId: string, vendorName: string) => void;
}

const FUNCTION_URL = "https://nhjsxtwuweegqcexakoz.supabase.co/functions/v1/maintenance-triage";

const priorityConfig = {
  emergency: {
    color: "bg-red-500",
    textColor: "text-red-700 dark:text-red-400",
    bgColor: "bg-red-500/10",
    borderColor: "border-red-500/30",
    icon: AlertTriangle,
    label: "Emergency",
  },
  urgent: {
    color: "bg-orange-500",
    textColor: "text-orange-700 dark:text-orange-400",
    bgColor: "bg-orange-500/10",
    borderColor: "border-orange-500/30",
    icon: Clock,
    label: "Urgent",
  },
  normal: {
    color: "bg-blue-500",
    textColor: "text-blue-700 dark:text-blue-400",
    bgColor: "bg-blue-500/10",
    borderColor: "border-blue-500/30",
    icon: Wrench,
    label: "Normal",
  },
  low: {
    color: "bg-green-500",
    textColor: "text-green-700 dark:text-green-400",
    bgColor: "bg-green-500/10",
    borderColor: "border-green-500/30",
    icon: CheckCircle2,
    label: "Low",
  },
};

const dispatchConfig = {
  immediate: { label: "Dispatch Immediately", color: "text-red-600", icon: Zap },
  schedule: { label: "Schedule Appointment", color: "text-blue-600", icon: Clock },
  troubleshoot_first: { label: "Try Troubleshooting First", color: "text-amber-600", icon: Wrench },
  monitor: { label: "Monitor Situation", color: "text-green-600", icon: Shield },
};

export function MaintenanceTriage({
  requestId,
  title,
  description,
  photos,
  propertyId,
  propertyType,
  tenantReported = true,
  onTriageComplete,
  onVendorSelect,
}: MaintenanceTriageProps) {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<TriageResult | null>(null);
  const [troubleshootingOpen, setTroubleshootingOpen] = useState(false);
  const [vendorsOpen, setVendorsOpen] = useState(true);
  const { toast } = useToast();

  const runTriage = async () => {
    setIsAnalyzing(true);
    setResult(null);

    try {
      const response = await fetch(FUNCTION_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5oanN4dHd1d2VlZ3FjZXhha296Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIwOTUwMjUsImV4cCI6MjA2NzY3MTAyNX0.GJ46q5JwybtA3HdYu9BWrobTTi62fevlz_LQ7NG4amk`,
        },
        body: JSON.stringify({
          requestId,
          title,
          description,
          photos,
          propertyId,
          propertyType,
          tenantReported,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Triage failed");
      }

      const data = await response.json();
      setResult(data.triage);
      onTriageComplete?.(data.triage);

      toast({
        title: "AI Triage Complete",
        description: `Categorized as ${data.triage.category} - ${data.triage.priority} priority`,
      });
    } catch (error) {
      console.error("Triage error:", error);
      toast({
        title: "Triage Failed",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  if (!result) {
    return (
      <Card className="border-primary/20">
        <CardContent className="pt-6">
          <div className="text-center space-y-4">
            <div className="h-16 w-16 mx-auto rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
              <Sparkles className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-lg">AI Maintenance Triage</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Automatically categorize, prioritize, and get vendor recommendations
              </p>
            </div>
            <Button
              onClick={runTriage}
              disabled={isAnalyzing}
              className="gap-2"
              size="lg"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Analyzing Request...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  Run AI Triage
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const priorityStyle = priorityConfig[result.priority];
  const PriorityIcon = priorityStyle.icon;
  const dispatchStyle = dispatchConfig[result.dispatchRecommendation];
  const DispatchIcon = dispatchStyle.icon;

  return (
    <div className="space-y-4">
      {/* Priority & Category Header */}
      <Card className={cn("border-2", priorityStyle.borderColor, priorityStyle.bgColor)}>
        <CardContent className="pt-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={cn("h-12 w-12 rounded-full flex items-center justify-center", priorityStyle.color)}>
                <PriorityIcon className="h-6 w-6 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <Badge className={priorityStyle.color}>{priorityStyle.label}</Badge>
                  <Badge variant="outline">{result.category}</Badge>
                  <Badge variant="secondary">{result.subcategory}</Badge>
                </div>
                <p className={cn("text-sm mt-1", priorityStyle.textColor)}>
                  {result.priorityReason}
                </p>
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={runTriage} disabled={isAnalyzing}>
              {isAnalyzing ? <Loader2 className="h-4 w-4 animate-spin" /> : "Re-analyze"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Safety Warnings */}
      {result.safetyWarnings.length > 0 && (
        <Card className="border-red-500/30 bg-red-500/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2 text-red-600">
              <Shield className="h-4 w-4" />
              Safety Warnings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-1">
              {result.safetyWarnings.map((warning, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-red-700 dark:text-red-400">
                  <XCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  {warning}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-3">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <DollarSign className="h-4 w-4" />
              <span className="text-xs">Est. Cost</span>
            </div>
            <p className="font-semibold">
              ${result.estimatedCostRange.min} - ${result.estimatedCostRange.max}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <Clock className="h-4 w-4" />
              <span className="text-xs">Est. Time</span>
            </div>
            <p className="font-semibold">{result.estimatedResolutionTime}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <DispatchIcon className="h-4 w-4" />
              <span className="text-xs">Action</span>
            </div>
            <p className={cn("font-semibold text-sm", dispatchStyle.color)}>
              {dispatchStyle.label}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Owner Approval Notice */}
      {result.ownerApprovalRequired && (
        <Card className="border-amber-500/30 bg-amber-500/5">
          <CardContent className="pt-4 flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-amber-500 flex-shrink-0" />
            <div>
              <p className="font-medium text-amber-700 dark:text-amber-400">Owner Approval Required</p>
              <p className="text-sm text-muted-foreground">{result.ownerApprovalReason}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Troubleshooting Steps */}
      {result.troubleshootingSteps.length > 0 && (
        <Collapsible open={troubleshootingOpen} onOpenChange={setTroubleshootingOpen}>
          <Card>
            <CollapsibleTrigger asChild>
              <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
                <CardTitle className="text-sm flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Wrench className="h-4 w-4" />
                    Troubleshooting Steps ({result.troubleshootingSteps.length})
                  </span>
                  {troubleshootingOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </CardTitle>
              </CardHeader>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <CardContent className="pt-0">
                <ol className="space-y-2">
                  {result.troubleshootingSteps.map((step, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm">
                      <span className="h-6 w-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-medium flex-shrink-0">
                        {i + 1}
                      </span>
                      {step}
                    </li>
                  ))}
                </ol>
              </CardContent>
            </CollapsibleContent>
          </Card>
        </Collapsible>
      )}

      {/* Suggested Vendors */}
      <Collapsible open={vendorsOpen} onOpenChange={setVendorsOpen}>
        <Card>
          <CollapsibleTrigger asChild>
            <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
              <CardTitle className="text-sm flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Recommended Vendors ({result.suggestedVendors.length})
                </span>
                {vendorsOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </CardTitle>
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent className="pt-0 space-y-3">
              {result.suggestedVendors.map((vendor, i) => (
                <div
                  key={i}
                  className="p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{vendor.name}</span>
                        <Badge variant="outline" className="text-xs">
                          {vendor.specialty}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                          {vendor.rating || "N/A"}
                        </span>
                        <span>Match: {vendor.matchScore}%</span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">{vendor.reason}</p>
                    </div>
                    <div className="flex flex-col gap-1">
                      <Progress value={vendor.matchScore} className="w-16 h-2" />
                      <Button
                        size="sm"
                        variant="outline"
                        className="gap-1"
                        onClick={() => onVendorSelect?.(vendor.id, vendor.name)}
                      >
                        <Phone className="h-3 w-3" />
                        Assign
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>

      {/* Photo Analysis */}
      {result.photoAnalysis && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Photo Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">{result.photoAnalysis}</p>
          </CardContent>
        </Card>
      )}

      {/* AI Notes */}
      {result.aiNotes && (
        <Card className="bg-muted/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              AI Insights
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm">{result.aiNotes}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
