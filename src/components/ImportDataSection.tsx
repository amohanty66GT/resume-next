import { useState, useEffect, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, Loader2, X, Link as LinkIcon, FileCode } from "lucide-react";
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
import { Checkbox } from "@/components/ui/checkbox";

interface ImportDataSectionProps {
  onDataImported: (data: any) => void;
}

export const ImportDataSection = ({ onDataImported }: ImportDataSectionProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [showResumeDialog, setShowResumeDialog] = useState(false);
  const [pdfDocument, setPdfDocument] = useState<pdfjsLib.PDFDocumentProxy | null>(null);
  const [extractedText, setExtractedText] = useState<string>("");
  const [portfolioUrl, setPortfolioUrl] = useState("");
  const [portfolioData, setPortfolioData] = useState<any>(null);
  const [codeFiles, setCodeFiles] = useState<any[]>([]);
  const [selectedCodeFiles, setSelectedCodeFiles] = useState<Set<string>>(new Set());
  const [showPortfolioPreview, setShowPortfolioPreview] = useState(false);
  const [isParsingPortfolio, setIsParsingPortfolio] = useState(false);
  const canvasContainerRef = useRef<HTMLDivElement>(null);

  // URL validation schema
  const urlSchema = z.string().url({ message: "Please enter a valid URL" });

  // Set up PDF.js worker
  pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;

  // Render PDF pages when dialog opens
  useEffect(() => {
    if (!showResumeDialog || !pdfDocument) {
      return;
    }

    // Use setTimeout to ensure DOM is ready
    const renderTimer = setTimeout(() => {
      const renderPages = async () => {
        const container = canvasContainerRef.current;
        if (!container) {
          console.error('Container not found');
          return;
        }

        try {
          // Clear previous canvases
          container.innerHTML = '';

          for (let pageNum = 1; pageNum <= pdfDocument.numPages; pageNum++) {
            const page = await pdfDocument.getPage(pageNum);
            const viewport = page.getViewport({ scale: 1.5 });

            const canvas = document.createElement('canvas');
            const context = canvas.getContext('2d');
            if (!context) continue;

            canvas.height = viewport.height;
            canvas.width = viewport.width;
            canvas.className = 'mb-4 border border-border rounded shadow-sm w-full';

            container.appendChild(canvas);

            await page.render({
              canvasContext: context,
              viewport: viewport,
            } as any).promise;
          }
        } catch (error) {
          console.error('Error rendering PDF pages:', error);
          toast.error('Failed to render PDF preview');
        }
      };

      renderPages();
    }, 100);

    return () => clearTimeout(renderTimer);
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
      const projects = data?.projects || [];

      if (experiences.length === 0 && projects.length === 0) {
        toast.error("No experience or project entries found in resume");
        return;
      }

      // Send the structured data to the parent component
      const importData: any = {};
      if (experiences.length > 0) {
        importData.experience = experiences;
      }
      if (projects.length > 0) {
        importData.projects = projects;
      }

      onDataImported(importData);

      const parts = [];
      if (experiences.length > 0) {
        parts.push(`${experiences.length} experience ${experiences.length === 1 ? 'entry' : 'entries'}`);
      }
      if (projects.length > 0) {
        parts.push(`${projects.length} project${projects.length === 1 ? '' : 's'}`);
      }
      toast.success(`Added ${parts.join(' and ')} to your card`);
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

  const handlePortfolioSubmit = async () => {
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

    try {
      setIsParsingPortfolio(true);
      toast.loading("Fetching portfolio content...");

      const { supabase } = await import("@/integrations/supabase/client");

      const { data, error } = await supabase.functions.invoke('parse-portfolio', {
        body: { portfolioUrl: trimmedUrl }
      });

      if (error) {
        console.error('Error parsing portfolio:', error);
        throw error;
      }

      console.log('Portfolio data:', data);

      if (data?.success && data?.data) {
        setPortfolioData(data.data);
        setCodeFiles(data.codeFiles || []);
        setSelectedCodeFiles(new Set());
        setShowPortfolioPreview(true);
        
        // Also save the URL to profile
        onDataImported({
          profile: {
            portfolioUrl: trimmedUrl
          }
        });

        toast.success("Portfolio content loaded! Review and select code to showcase.");
      } else {
        throw new Error(data?.error || 'Failed to parse portfolio');
      }
    } catch (error: any) {
      console.error('Error processing portfolio:', error);
      toast.error(error.message || "Failed to parse portfolio URL");
    } finally {
      setIsParsingPortfolio(false);
    }
  };

  const toggleCodeFileSelection = (filePath: string) => {
    setSelectedCodeFiles(prev => {
      const newSet = new Set(prev);
      if (newSet.has(filePath)) {
        newSet.delete(filePath);
      } else {
        newSet.add(filePath);
      }
      return newSet;
    });
  };

  const handleImportPortfolioData = (dataType: string) => {
    if (!portfolioData && dataType !== 'code') return;

    const importData: any = {};

    if (dataType === 'projects' && portfolioData.projects) {
      importData.projects = portfolioData.projects.map((project: any) => ({
        id: Math.random().toString(36).substr(2, 9),
        name: project.name || '',
        description: project.description || '',
        technologies: project.technologies || '',
      }));
      toast.success(`Imported ${importData.projects.length} projects`);
    }

    if (dataType === 'frameworks' && portfolioData.frameworks) {
      importData.frameworks = portfolioData.frameworks.map((fw: any) => ({
        id: Math.random().toString(36).substr(2, 9),
        name: fw.name || '',
        proficiency: fw.proficiency || 'Intermediate',
      }));
      toast.success(`Imported ${importData.frameworks.length} frameworks`);
    }

    if (dataType === 'code') {
      // Import only selected code files
      if (selectedCodeFiles.size > 0) {
        importData.codeShowcase = Array.from(selectedCodeFiles).map(filePath => {
          const file = codeFiles.find(f => f.path === filePath);
          return {
            id: Math.random().toString(36).substr(2, 9),
            fileName: file.name,
            language: file.language,
            code: file.content,
            repo: file.repo,
            url: file.url,
          };
        });
        toast.success(`Imported ${importData.codeShowcase.length} code snippet(s)`);
      } else {
        toast.error("Please select at least one code file");
        return;
      }
    }

    if (dataType === 'all') {
      if (portfolioData.projects) {
        importData.projects = portfolioData.projects.map((project: any) => ({
          id: Math.random().toString(36).substr(2, 9),
          name: project.name || '',
          description: project.description || '',
          technologies: project.technologies || '',
        }));
      }
      if (portfolioData.frameworks) {
        importData.frameworks = portfolioData.frameworks.map((fw: any) => ({
          id: Math.random().toString(36).substr(2, 9),
          name: fw.name || '',
          proficiency: fw.proficiency || 'Intermediate',
        }));
      }
      
      // Import selected code files
      if (selectedCodeFiles.size > 0) {
        importData.codeShowcase = Array.from(selectedCodeFiles).map(filePath => {
          const file = codeFiles.find(f => f.path === filePath);
          return {
            id: Math.random().toString(36).substr(2, 9),
            fileName: file.name,
            language: file.language,
            code: file.content,
            repo: file.repo,
            url: file.url,
          };
        });
      }
      
      toast.success("Imported all selected data from portfolio");
    }

    onDataImported(importData);
    if (dataType !== 'code') {
      setShowPortfolioPreview(false);
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

      <Dialog open={showPortfolioPreview} onOpenChange={setShowPortfolioPreview}>
        <DialogContent className="max-w-3xl max-h-[85vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>Portfolio Preview</DialogTitle>
            <DialogDescription>
              Review the extracted data and import what you need
            </DialogDescription>
          </DialogHeader>
          <div className="flex-1 overflow-auto space-y-6 p-4">
            {portfolioData?.profile && (
              <div className="space-y-2">
                <h3 className="font-semibold text-lg">Profile Information</h3>
                <div className="bg-muted/30 p-4 rounded-lg space-y-2">
                  {portfolioData.profile.name && (
                    <p><span className="font-medium">Name:</span> {portfolioData.profile.name}</p>
                  )}
                  {portfolioData.profile.title && (
                    <p><span className="font-medium">Title:</span> {portfolioData.profile.title}</p>
                  )}
                  {portfolioData.profile.bio && (
                    <p><span className="font-medium">Bio:</span> {portfolioData.profile.bio}</p>
                  )}
                </div>
              </div>
            )}

            {portfolioData?.projects && portfolioData.projects.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-lg">Projects ({portfolioData.projects.length})</h3>
                  <Button 
                    onClick={() => handleImportPortfolioData('projects')} 
                    size="sm"
                    variant="outline"
                  >
                    Import Projects
                  </Button>
                </div>
                <div className="space-y-3">
                  {portfolioData.projects.map((project: any, idx: number) => (
                    <div key={idx} className="bg-muted/30 p-4 rounded-lg space-y-1">
                      <h4 className="font-semibold">{project.name}</h4>
                      <p className="text-sm text-muted-foreground">{project.description}</p>
                      {project.technologies && (
                        <p className="text-xs text-primary">{project.technologies}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {portfolioData?.frameworks && portfolioData.frameworks.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-lg">Frameworks & Technologies ({portfolioData.frameworks.length})</h3>
                  <Button 
                    onClick={() => handleImportPortfolioData('frameworks')} 
                    size="sm"
                    variant="outline"
                  >
                    Import Frameworks
                  </Button>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {portfolioData.frameworks.map((fw: any, idx: number) => (
                    <div key={idx} className="bg-muted/30 p-3 rounded-lg flex justify-between items-center">
                      <span className="font-medium">{fw.name}</span>
                      {fw.proficiency && (
                        <span className="text-xs text-muted-foreground">{fw.proficiency}</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          <div className="flex items-center justify-end gap-2 pt-4 border-t">
            <Button onClick={() => setShowPortfolioPreview(false)} variant="outline">
              Close
            </Button>
            <Button onClick={() => handleImportPortfolioData('all')}>
              Import All
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
