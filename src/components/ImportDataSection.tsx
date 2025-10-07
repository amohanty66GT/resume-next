import { useState, useEffect, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, Loader2, X, Link as LinkIcon } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";
import * as pdfjsLib from 'pdfjs-dist';
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

interface ImportDataSectionProps {
  onDataImported: (data: any) => void;
}

export const ImportDataSection = ({ onDataImported }: ImportDataSectionProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [showResumeDialog, setShowResumeDialog] = useState(false);
  const [pdfDocument, setPdfDocument] = useState<pdfjsLib.PDFDocumentProxy | null>(null);
  const [extractedText, setExtractedText] = useState<string>("");
  const [portfolioUrl, setPortfolioUrl] = useState("");
  const canvasContainerRef = useRef<HTMLDivElement>(null);

  // URL validation schema
  const urlSchema = z.string().url({ message: "Please enter a valid URL" });

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

  const extractTextFromPDF = async (pdf: pdfjsLib.PDFDocumentProxy): Promise<string> => {
    let fullText = "";
    
    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const textContent = await page.getTextContent();
      const pageText = textContent.items
        .map((item: any) => item.str)
        .join(" ");
      fullText += pageText + "\n\n";
    }
    
    return fullText;
  };

  const handleCopyToExperience = async () => {
    if (!extractedText) {
      toast.error("No text extracted from resume");
      return;
    }

    try {
      setIsLoading(true);
      toast.loading("Parsing your experience...");

      // Import supabase client
      const { supabase } = await import("@/integrations/supabase/client");

      const { data, error } = await supabase.functions.invoke('parse-resume-experience', {
        body: { resumeText: extractedText }
      });

      if (error) {
        console.error('Error parsing resume:', error);
        throw error;
      }

      console.log('Parsed data:', data);

      const experiences = data?.experiences || [];

      if (experiences.length === 0) {
        toast.error("No experience entries found in resume");
        return;
      }

      // Send the structured experience data to the parent component
      onDataImported({
        experience: experiences
      });

      toast.success(`Added ${experiences.length} experience ${experiences.length === 1 ? 'entry' : 'entries'} to your card`);
      setShowResumeDialog(false);
    } catch (error: any) {
      console.error('Error processing resume:', error);
      toast.error(error.message || "Failed to parse resume");
    } finally {
      setIsLoading(false);
    }
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
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        setPdfDocument(pdf);
        
        // Extract text from PDF
        const text = await extractTextFromPDF(pdf);
        setExtractedText(text);
        
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

  const handlePortfolioSubmit = () => {
    const trimmedUrl = portfolioUrl.trim();
    
    if (!trimmedUrl) {
      toast.error("Please enter a portfolio URL");
      return;
    }

    // Validate URL
    const validation = urlSchema.safeParse(trimmedUrl);
    if (!validation.success) {
      toast.error("Please enter a valid URL (e.g., https://github.com/username)");
      return;
    }

    // Send the portfolio URL to the parent component
    onDataImported({
      profile: {
        portfolioUrl: trimmedUrl
      }
    });

    toast.success("Portfolio URL added to your profile!");
    setPortfolioUrl("");
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

          <div className="space-y-4 pt-4 border-t">
            <div className="space-y-2">
              <Label htmlFor="portfolio-url" className="flex items-center gap-2">
                <LinkIcon className="h-4 w-4" />
                Portfolio URL
              </Label>
              <p className="text-xs text-muted-foreground">
                Add your GitHub, UI/UX portfolio, marketing portfolio, or any public portfolio link
              </p>
              <div className="flex gap-2">
                <Input
                  id="portfolio-url"
                  type="url"
                  placeholder="https://github.com/username or https://yourportfolio.com"
                  value={portfolioUrl}
                  onChange={(e) => setPortfolioUrl(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handlePortfolioSubmit();
                    }
                  }}
                  className="flex-1"
                />
                <Button 
                  onClick={handlePortfolioSubmit}
                  disabled={!portfolioUrl.trim()}
                  size="sm"
                >
                  Add
                </Button>
              </div>
            </div>
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
            <DialogDescription>
              View your resume and copy text to the Experience section
            </DialogDescription>
          </DialogHeader>
          <div className="flex-1 overflow-auto bg-muted/30 p-4 rounded-lg min-h-[400px]">
            <div ref={canvasContainerRef} className="flex flex-col items-center w-full">
              {/* PDF pages will be rendered here */}
            </div>
          </div>
          <div className="flex items-center justify-between pt-4 border-t">
            <p className="text-xs text-muted-foreground">
              AI will extract and parse your experience entries automatically
            </p>
            <Button onClick={handleCopyToExperience} variant="default" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Parsing...
                </>
              ) : (
                "Parse Experience"
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
