import { useState } from "react";
import { FileText, Loader2, Sparkles, Copy, Download, CheckCircle, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface InspectionSummaryGeneratorProps {
  sessionId: string;
  propertyAddress: string;
  checkType: string;
  photos: Array<{ url: string; caption?: string }>;
  checklistData: Record<string, any>;
  generalNotes?: string;
  weather?: string;
  overallCondition?: string;
  existingSummary?: string;
  onSummaryGenerated?: (summary: string) => void;
}

const FUNCTION_URL = "https://nhjsxtwuweegqcexakoz.supabase.co/functions/v1/generate-inspection-summary";

export function InspectionSummaryGenerator({
  sessionId,
  propertyAddress,
  checkType,
  photos,
  checklistData,
  generalNotes,
  weather,
  overallCondition,
  existingSummary,
  onSummaryGenerated,
}: InspectionSummaryGeneratorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [summary, setSummary] = useState(existingSummary || "");
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const generateSummary = async () => {
    setIsGenerating(true);

    try {
      const response = await fetch(FUNCTION_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5oanN4dHd1d2VlZ3FjZXhha296Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIwOTUwMjUsImV4cCI6MjA2NzY3MTAyNX0.GJ46q5JwybtA3HdYu9BWrobTTi62fevlz_LQ7NG4amk`,
        },
        body: JSON.stringify({
          sessionId,
          propertyAddress,
          checkType,
          photos,
          checklistData,
          generalNotes,
          weather,
          overallCondition,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to generate summary");
      }

      const data = await response.json();
      setSummary(data.summary);
      onSummaryGenerated?.(data.summary);

      toast({
        title: "Report Generated",
        description: `Analyzed ${data.photosAnalyzed} photos and created professional summary.`,
      });
    } catch (error) {
      console.error("Summary generation error:", error);
      toast({
        title: "Generation Failed",
        description: error instanceof Error ? error.message : "Failed to generate summary",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(summary);
    setCopied(true);
    toast({ title: "Copied to clipboard" });
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadReport = () => {
    const blob = new Blob([summary], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `inspection-report-${propertyAddress.replace(/[^a-z0-9]/gi, "-")}-${new Date().toISOString().split("T")[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast({ title: "Report downloaded" });
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          className="gap-2 bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20 hover:border-primary/40"
        >
          <Sparkles className="h-4 w-4 text-primary" />
          AI Inspection Report
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            AI Inspection Summary
          </DialogTitle>
          <DialogDescription>
            Generate a professional inspection report using AI vision analysis
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Property Info */}
          <div className="p-4 bg-muted/50 rounded-lg space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Property</span>
              <span className="text-sm text-muted-foreground">{propertyAddress}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Check Type</span>
              <Badge variant="outline">{checkType}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Photos to Analyze</span>
              <Badge variant={photos.length > 0 ? "default" : "secondary"}>
                {Math.min(photos.length, 5)} of {photos.length}
              </Badge>
            </div>
            {weather && (
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Weather</span>
                <span className="text-sm text-muted-foreground">{weather}</span>
              </div>
            )}
          </div>

          {/* Photo Preview */}
          {photos.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-medium">Photos for Analysis</p>
              <div className="flex gap-2 overflow-x-auto pb-2">
                {photos.slice(0, 5).map((photo, index) => (
                  <div key={index} className="relative flex-shrink-0">
                    <img
                      src={photo.url}
                      alt={photo.caption || `Photo ${index + 1}`}
                      className="h-20 w-20 object-cover rounded-lg border"
                    />
                    {index < 5 && (
                      <div className="absolute -top-1 -right-1 h-5 w-5 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-medium">
                        {index + 1}
                      </div>
                    )}
                  </div>
                ))}
                {photos.length > 5 && (
                  <div className="h-20 w-20 flex-shrink-0 rounded-lg border border-dashed flex items-center justify-center text-sm text-muted-foreground">
                    +{photos.length - 5} more
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Warning if no photos */}
          {photos.length === 0 && (
            <div className="flex items-center gap-2 p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg">
              <AlertTriangle className="h-4 w-4 text-amber-500" />
              <p className="text-sm text-amber-700 dark:text-amber-400">
                No photos available. The AI summary will be based on checklist data and notes only.
              </p>
            </div>
          )}

          {/* Generate Button */}
          {!summary && (
            <Button
              onClick={generateSummary}
              disabled={isGenerating}
              className="w-full gap-2"
              size="lg"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Analyzing Photos & Generating Report...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  Generate AI Report
                </>
              )}
            </Button>
          )}

          {/* Summary Display */}
          {summary && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm font-medium text-green-600 dark:text-green-400">
                    Report Generated
                  </span>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={copyToClipboard}>
                    {copied ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                  <Button variant="outline" size="sm" onClick={downloadReport}>
                    <Download className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={generateSummary}
                    disabled={isGenerating}
                  >
                    {isGenerating ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      "Regenerate"
                    )}
                  </Button>
                </div>
              </div>

              <ScrollArea className="h-[400px] rounded-lg border bg-background p-4">
                <div className="prose prose-sm dark:prose-invert max-w-none">
                  <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed">
                    {summary}
                  </pre>
                </div>
              </ScrollArea>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
