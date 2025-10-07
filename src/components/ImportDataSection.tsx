import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, Loader2, Copy, X } from "lucide-react";
import { toast } from "sonner";
import * as pdfjsLib from 'pdfjs-dist';
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface ImportDataSectionProps {
  onDataImported: (data: any) => void;
}

export const ImportDataSection = ({ onDataImported }: ImportDataSectionProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [showResumeDialog, setShowResumeDialog] = useState(false);
  const [resumeText, setResumeText] = useState("");

  // Set up PDF.js worker
  pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;

  const extractTextFromPDF = async (file: File): Promise<string> => {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    let fullText = '';

    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items.map((item: any) => item.str).join(' ');
      fullText += pageText + '\n';
    }

    return fullText;
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const fileSize = file.size / 1024 / 1024; // Convert to MB
    if (fileSize > 20) {
      toast.error("File size must be less than 20MB");
      return;
    }

    setIsLoading(true);
    toast.loading("Loading your resume...");

    try {
      if (file.type === 'application/pdf') {
        const extractedText = await extractTextFromPDF(file);
        setResumeText(extractedText);
        setShowResumeDialog(true);
        toast.success("Resume loaded! Select and copy text to fill the form.");
      } else {
        toast.error("Only PDF files are supported");
      }
    } catch (error: any) {
      console.error("Error loading resume:", error);
      toast.error(error.message || "Failed to load resume. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyAll = () => {
    navigator.clipboard.writeText(resumeText);
    toast.success("Resume text copied to clipboard!");
  };

  return (
    <>
      <Card className="p-6 shadow-[var(--shadow-card)] border-2 border-dashed border-primary/20">
        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-bold mb-2">Quick Import</h2>
            <p className="text-sm text-muted-foreground">
              Upload your resume PDF to view and copy text for manual entry
            </p>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="resume-upload" className="flex items-center gap-2">
                <Upload className="h-4 w-4" />
                Resume (PDF only)
              </Label>
              <Input
                id="resume-upload"
                type="file"
                accept=".pdf"
                onChange={handleFileUpload}
                disabled={isLoading}
                className="cursor-pointer"
              />
            </div>

            {isLoading && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                Loading resume...
              </div>
            )}
          </div>

          <p className="text-xs text-muted-foreground">
            <strong>Tip:</strong> Upload your resume to view it, then select and copy text to fill in the form fields below.
          </p>
        </div>
      </Card>

      <Dialog open={showResumeDialog} onOpenChange={setShowResumeDialog}>
        <DialogContent className="max-w-4xl max-h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>Your Resume</span>
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopyAll}
                className="gap-2"
              >
                <Copy className="h-4 w-4" />
                Copy All
              </Button>
            </DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-auto">
            <div className="p-4 bg-muted rounded-lg">
              <pre className="whitespace-pre-wrap text-sm font-mono select-text">
                {resumeText}
              </pre>
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            Select and copy any text from above to paste into your form fields.
          </p>
        </DialogContent>
      </Dialog>
    </>
  );
};
