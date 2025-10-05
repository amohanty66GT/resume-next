import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, Link2, Github, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface ImportDataSectionProps {
  onDataImported: (data: any) => void;
}

export const ImportDataSection = ({ onDataImported }: ImportDataSectionProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [linkedinUrl, setLinkedinUrl] = useState("");
  const [githubUrl, setGithubUrl] = useState("");

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
      const reader = new FileReader();
      reader.onload = async (e) => {
        const base64Data = e.target?.result as string;
        
        const { data, error } = await supabase.functions.invoke("parse-resume", {
          body: { 
            fileData: base64Data,
            fileName: file.name,
            linkedinUrl,
            githubUrl
          },
        });

        if (error) throw error;

        if (data) {
          onDataImported(data);
          toast.success("Resume parsed successfully!");
        }
      };
      reader.readAsDataURL(file);
    } catch (error: any) {
      console.error("Error parsing resume:", error);
      toast.error(error.message || "Failed to parse resume. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleImportFromUrls = async () => {
    if (!linkedinUrl && !githubUrl) {
      toast.error("Please provide at least a LinkedIn or GitHub URL");
      return;
    }

    setIsLoading(true);
    toast.loading("Importing data from profiles...");

    try {
      const { data, error } = await supabase.functions.invoke("parse-resume", {
        body: { 
          linkedinUrl,
          githubUrl
        },
      });

      if (error) throw error;

      if (data) {
        onDataImported(data);
        toast.success("Profile data imported successfully!");
      }
    } catch (error: any) {
      console.error("Error importing profiles:", error);
      toast.error(error.message || "Failed to import profiles. Please try again.");
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
            Upload your resume or import from LinkedIn/GitHub to auto-fill your career card
          </p>
        </div>

        <div className="space-y-4">
          {/* Resume Upload */}
          <div className="space-y-2">
            <Label htmlFor="resume-upload" className="flex items-center gap-2">
              <Upload className="h-4 w-4" />
              Resume (PDF, DOCX)
            </Label>
            <Input
              id="resume-upload"
              type="file"
              accept=".pdf,.doc,.docx"
              onChange={handleFileUpload}
              disabled={isLoading}
              className="cursor-pointer"
            />
          </div>

          {/* LinkedIn URL */}
          <div className="space-y-2">
            <Label htmlFor="linkedin-url" className="flex items-center gap-2">
              <Link2 className="h-4 w-4" />
              LinkedIn Profile URL (Optional)
            </Label>
            <Input
              id="linkedin-url"
              type="url"
              placeholder="https://www.linkedin.com/in/yourprofile"
              value={linkedinUrl}
              onChange={(e) => setLinkedinUrl(e.target.value)}
              disabled={isLoading}
            />
          </div>

          {/* GitHub URL */}
          <div className="space-y-2">
            <Label htmlFor="github-url" className="flex items-center gap-2">
              <Github className="h-4 w-4" />
              GitHub Profile URL (Optional)
            </Label>
            <Input
              id="github-url"
              type="url"
              placeholder="https://github.com/yourusername"
              value={githubUrl}
              onChange={(e) => setGithubUrl(e.target.value)}
              disabled={isLoading}
            />
          </div>

          {/* Import Button for URLs */}
          {(linkedinUrl || githubUrl) && (
            <Button 
              onClick={handleImportFromUrls} 
              disabled={isLoading}
              className="w-full gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Importing...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4" />
                  Import from URLs
                </>
              )}
            </Button>
          )}
        </div>

        <p className="text-xs text-muted-foreground">
          <strong>Tip:</strong> For best results, provide your resume and LinkedIn profile together.
        </p>
      </div>
    </Card>
  );
};