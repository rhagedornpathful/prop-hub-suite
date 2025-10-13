import { useState } from "react";
import { ScanText, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Textarea } from "@/components/ui/textarea";
import Tesseract from "tesseract.js";

interface OCRExtractorProps {
  documentUrl: string;
  documentName: string;
  onTextExtracted: (text: string) => void;
}

export function OCRExtractor({
  documentUrl,
  documentName,
  onTextExtracted,
}: OCRExtractorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractedText, setExtractedText] = useState("");
  const [progress, setProgress] = useState(0);
  const { toast } = useToast();

  const handleExtract = async () => {
    setIsExtracting(true);
    setExtractedText("");
    setProgress(0);

    try {
      const { data: { text } } = await Tesseract.recognize(
        documentUrl,
        'eng',
        {
          logger: (m) => {
            if (m.status === 'recognizing text') {
              setProgress(Math.round(m.progress * 100));
            }
          }
        }
      );

      setExtractedText(text);
      onTextExtracted(text);
      
      toast({
        title: "Success",
        description: "Text extracted successfully from image",
      });
    } catch (error) {
      console.error("OCR error:", error);
      toast({
        title: "Error",
        description: "Failed to extract text from document",
        variant: "destructive",
      });
    } finally {
      setIsExtracting(false);
      setProgress(0);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <ScanText className="w-4 h-4 mr-2" />
          Extract Text (OCR)
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>OCR Text Extraction - {documentName}</DialogTitle>
          <DialogDescription>
            Extract text from images and scanned documents using OCR
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {!extractedText && (
            <Button
              onClick={handleExtract}
              disabled={isExtracting}
              className="w-full"
            >
              {isExtracting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Extracting... {progress}%
                </>
              ) : (
                <>
                  <ScanText className="w-4 h-4 mr-2" />
                  Start OCR Extraction
                </>
              )}
            </Button>
          )}

          {isExtracting && (
            <div className="space-y-2">
              <div className="w-full bg-muted rounded-full h-2">
                <div
                  className="bg-primary h-2 rounded-full transition-all"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="text-sm text-center text-muted-foreground">
                Processing... {progress}%
              </p>
            </div>
          )}

          {extractedText && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Extracted Text:</label>
              <Textarea
                value={extractedText}
                readOnly
                className="min-h-[300px] font-mono text-sm"
              />
              <p className="text-xs text-muted-foreground">
                {extractedText.length} characters extracted
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
