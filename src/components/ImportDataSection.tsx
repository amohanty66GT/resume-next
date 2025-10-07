import { useState, useEffect, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, Loader2, X } from "lucide-react";
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
  const [pdfDocument, setPdfDocument] = useState<pdfjsLib.PDFDocumentProxy | null>(null);
  const canvasContainerRef = useRef<HTMLDivElement>(null);

  // Set up PDF.js worker
  pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;

  // Render PDF pages when dialog opens
  useEffect(() => {
    if (!showResumeDialog || !pdfDocument || !canvasContainerRef.current) {
      console.log('PDF render check:', { showResumeDialog, hasPdfDocument: !!pdfDocument, hasContainer: !!canvasContainerRef.current });
      return;
    }

    const renderPages = async () => {
      const container = canvasContainerRef.current;
      if (!container) {
        console.log('No container found');
        return;
      }

      try {
        console.log('Starting PDF render, pages:', pdfDocument.numPages);
        
        // Clear previous canvases
        container.innerHTML = '';

        for (let pageNum = 1; pageNum <= pdfDocument.numPages; pageNum++) {
          console.log('Rendering page', pageNum);
          const page = await pdfDocument.getPage(pageNum);
          const viewport = page.getViewport({ scale: 1.5 });

          const canvas = document.createElement('canvas');
          const context = canvas.getContext('2d');
          if (!context) {
            console.log('Failed to get canvas context for page', pageNum);
            continue;
          }

          canvas.height = viewport.height;
          canvas.width = viewport.width;
          canvas.className = 'mb-4 border border-border rounded shadow-sm';

          container.appendChild(canvas);
          console.log('Canvas appended for page', pageNum);

          await page.render({
            canvasContext: context,
            viewport: viewport,
          } as any).promise;
          
          console.log('Page', pageNum, 'rendered successfully');
        }
        
        console.log('All pages rendered');
      } catch (error) {
        console.error('Error rendering PDF pages:', error);
        toast.error('Failed to render PDF preview');
      }
    };

    renderPages();
  }, [showResumeDialog, pdfDocument]);

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
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        setPdfDocument(pdf);
        setShowResumeDialog(true);
        toast.success("Resume loaded! You can now view and reference it while filling the form.");
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
        <DialogContent className="max-w-4xl max-h-[85vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>Your Resume Preview</DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-auto bg-muted/30 p-4 rounded-lg">
            <div ref={canvasContainerRef} className="flex flex-col items-center">
              {/* PDF pages will be rendered here */}
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            Reference your resume above while filling out the form fields below.
          </p>
        </DialogContent>
      </Dialog>
    </>
  );
};
