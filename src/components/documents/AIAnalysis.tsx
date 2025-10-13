import { useState } from "react";
import { Sparkles, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";

interface AIAnalysisProps {
  documentId: string;
  fileName: string;
  description?: string;
  onAnalysisComplete: () => void;
}

interface AnalysisResult {
  category: string;
  tags: string[];
  summary: string;
  confidence: number;
}

export function AIAnalysis({
  documentId,
  fileName,
  description,
  onAnalysisComplete,
}: AIAnalysisProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const { toast } = useToast();

  const handleAnalyze = async () => {
    setIsAnalyzing(true);
    setResult(null);

    try {
      const { data, error } = await supabase.functions.invoke("analyze-document", {
        body: {
          documentId,
          fileName,
          description,
        },
      });

      if (error) {
        if (error.message?.includes("429")) {
          toast({
            title: "Rate Limit",
            description: "Too many requests. Please try again later.",
            variant: "destructive",
          });
          return;
        }
        if (error.message?.includes("402")) {
          toast({
            title: "Credits Required",
            description: "Please add credits to your workspace to use AI features.",
            variant: "destructive",
          });
          return;
        }
        throw error;
      }

      setResult(data);
      toast({
        title: "Analysis Complete",
        description: "Document has been analyzed and updated with AI suggestions.",
      });
      
      onAnalysisComplete();
    } catch (error) {
      console.error("Analysis error:", error);
      toast({
        title: "Error",
        description: "Failed to analyze document",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Sparkles className="w-4 h-4 mr-2" />
          AI Analysis
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>AI Document Analysis</DialogTitle>
          <DialogDescription>
            Use AI to automatically categorize and tag your document
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="p-4 bg-muted rounded-lg">
            <p className="text-sm font-medium mb-2">Document:</p>
            <p className="text-sm text-muted-foreground">{fileName}</p>
            {description && (
              <>
                <p className="text-sm font-medium mt-3 mb-2">Description:</p>
                <p className="text-sm text-muted-foreground">{description}</p>
              </>
            )}
          </div>

          {!result && (
            <Button
              onClick={handleAnalyze}
              disabled={isAnalyzing}
              className="w-full"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Analyze with AI
                </>
              )}
            </Button>
          )}

          {result && (
            <div className="space-y-4 p-4 border rounded-lg">
              <div>
                <p className="text-sm font-medium mb-2">Suggested Category:</p>
                <Badge>{result.category}</Badge>
              </div>

              <div>
                <p className="text-sm font-medium mb-2">Suggested Tags:</p>
                <div className="flex flex-wrap gap-2">
                  {result.tags.map((tag, index) => (
                    <Badge key={index} variant="outline">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-sm font-medium mb-2">AI Summary:</p>
                <p className="text-sm text-muted-foreground">{result.summary}</p>
              </div>

              <div>
                <p className="text-sm font-medium mb-2">Confidence:</p>
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary transition-all"
                      style={{ width: `${result.confidence * 100}%` }}
                    />
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {Math.round(result.confidence * 100)}%
                  </span>
                </div>
              </div>

              <p className="text-xs text-muted-foreground">
                The document has been automatically updated with these suggestions.
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
