import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import * as pdfjsLib from 'pdfjs-dist';
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url';

interface ImportDataSectionProps {
  onDataImported: (data: any) => void;
}

export const ImportDataSection = ({ onDataImported }: ImportDataSectionProps) => {
  const [isLoading, setIsLoading] = useState(false);

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
    toast.loading("Parsing your resume...");

    try {
      let extractedText = '';

      if (file.type === 'application/pdf') {
        extractedText = await extractTextFromPDF(file);
        console.log('Extracted text length:', extractedText.length);
      } else {
        toast.error("Only PDF files are supported");
        setIsLoading(false);
        return;
      }

      const { data, error } = await supabase.functions.invoke("parse-resume", {
        body: { 
          resumeText: extractedText
        },
      });

      if (error) throw error;

      if (data) {
        onDataImported(data);
        toast.success("Resume parsed successfully!");
      }
    } catch (error: any) {
      console.error("Error parsing resume:", error);
      toast.error(error.message || "Failed to parse resume. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="p-6 shadow-[var(--shadow-card)] border-2 border-dashed border-primary/20">
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-bold mb-2">Quick Import</h2>
          <p className="text-sm text-muted-foreground">
            Upload your resume PDF to auto-fill your experience section
          </p>
        </div>

        <div className="space-y-4">
          {/* Resume Upload */}
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
              Extracting experience from resume...
            </div>
          )}
        </div>

        <p className="text-xs text-muted-foreground">
          <strong>Tip:</strong> For best results, use a well-formatted resume with clear section headers.
        </p>
      </div>
    </Card>
  );
};
