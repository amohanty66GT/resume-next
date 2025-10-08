import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Download, Eye, Edit3 } from "lucide-react";
import { ProfileSection } from "./sections/ProfileSection";
import { ExperienceSection } from "./sections/ExperienceSection";
import { ProjectsSection } from "./sections/ProjectsSection";
import { GreatestImpactsSection } from "./sections/GreatestImpactsSection";
import { StylesOfWorkSection } from "./sections/StylesOfWorkSection";
import { FrameworksSection } from "./sections/FrameworksSection";
import { PastimesSection } from "./sections/PastimesSection";
import { CodeShowcaseSection } from "./sections/CodeShowcaseSection";
import { CareerCardPreview } from "./CareerCardPreview";
import { ImportDataSection } from "./ImportDataSection";
import { toast } from "sonner";
import html2canvas from "html2canvas";

export interface CareerCardData {
  profile: {
    name: string;
    title: string;
    location: string;
    imageUrl: string;
    portfolioUrl?: string;
  };
  experience: Array<{
    id: string;
    title: string;
    company: string;
    period: string;
    description: string;
  }>;
  projects: Array<{
    id: string;
    name: string;
    description: string;
    technologies: string;
    projectUrl?: string;
  }>;
  greatestImpacts: Array<{
    id: string;
    title: string;
    context: string;
    outcome?: string;
  }>;
  stylesOfWork: Array<{
    id: string;
    question: string;
    selectedAnswer: string;
  }>;
  frameworks: Array<{
    id: string;
    name: string;
    proficiency: string;
    projectsBuilt?: string;
  }>;
  pastimes: Array<{
    id: string;
    activity: string;
    description: string;
  }>;
  codeShowcase: Array<{
    id: string;
    fileName: string;
    language: string;
    code: string;
    caption?: string;
    repo?: string;
    url?: string;
  }>;
}

const CareerCardBuilder = () => {
  const [showPreview, setShowPreview] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const previewRef = useRef<HTMLDivElement>(null);
  const [cardData, setCardData] = useState<CareerCardData>({
    profile: {
      name: "",
      title: "",
      location: "",
      imageUrl: "",
      portfolioUrl: "",
    },
    experience: [],
    projects: [],
    greatestImpacts: [],
    stylesOfWork: [],
    frameworks: [],
    pastimes: [],
    codeShowcase: [],
  });

  const handleExport = async () => {
    if (!previewRef.current) {
      // If not in preview mode, switch to it first
      setShowPreview(true);
      toast.info("Switching to preview mode...");
      // Wait for the preview to render, then try again
      setTimeout(() => handleExport(), 500);
      return;
    }

    try {
      setIsExporting(true);
      toast.loading("Generating your career card image...");

      // Capture the preview card as canvas
      const canvas = await html2canvas(previewRef.current, {
        backgroundColor: "#ffffff",
        scale: 2, // Higher quality
        logging: false,
        useCORS: true,
      });

      // Convert to blob and download
      canvas.toBlob((blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob);
          const link = document.createElement("a");
          link.download = `${cardData.profile.name || "career-card"}_${new Date().getTime()}.png`;
          link.href = url;
          link.click();
          URL.revokeObjectURL(url);
          
          toast.success("Career card downloaded successfully!");
        }
      }, "image/png");
    } catch (error) {
      console.error("Export error:", error);
      toast.error("Failed to export career card. Please try again.");
    } finally {
      setIsExporting(false);
    }
  };

  const updateProfile = (profile: CareerCardData["profile"]) => {
    setCardData({ ...cardData, profile });
  };

  const updateExperience = (experience: CareerCardData["experience"]) => {
    setCardData({ ...cardData, experience });
  };

  const updateProjects = (projects: CareerCardData["projects"]) => {
    setCardData({ ...cardData, projects });
  };

  const updateGreatestImpacts = (greatestImpacts: CareerCardData["greatestImpacts"]) => {
    setCardData({ ...cardData, greatestImpacts });
  };

  const updateStylesOfWork = (stylesOfWork: CareerCardData["stylesOfWork"]) => {
    setCardData({ ...cardData, stylesOfWork });
  };

  const updateFrameworks = (frameworks: CareerCardData["frameworks"]) => {
    setCardData({ ...cardData, frameworks });
  };

  const updatePastimes = (pastimes: CareerCardData["pastimes"]) => {
    setCardData({ ...cardData, pastimes });
  };

  const updateCodeShowcase = (codeShowcase: CareerCardData["codeShowcase"]) => {
    setCardData({ ...cardData, codeShowcase });
  };

  const handleImportedData = (importedData: any) => {
    const newCardData = { ...cardData };

    // Update profile if available
    if (importedData.profile) {
      newCardData.profile = {
        ...newCardData.profile,
        ...importedData.profile,
      };
    }

    // Update experience if available
    if (importedData.experience && Array.isArray(importedData.experience)) {
      newCardData.experience = [...newCardData.experience, ...importedData.experience];
    }

    // Update projects if available
    if (importedData.projects && Array.isArray(importedData.projects)) {
      newCardData.projects = [...newCardData.projects, ...importedData.projects];
    }

    // Update greatestImpacts if available
    if (importedData.greatestImpacts && Array.isArray(importedData.greatestImpacts)) {
      newCardData.greatestImpacts = [...newCardData.greatestImpacts, ...importedData.greatestImpacts];
    }

    // Update codeShowcase if available
    if (importedData.codeShowcase && Array.isArray(importedData.codeShowcase)) {
      newCardData.codeShowcase = [...newCardData.codeShowcase, ...importedData.codeShowcase];
    }

    setCardData(newCardData);
    toast.success("Data imported successfully!");
  };

  return (
    <div className="min-h-screen bg-[hsl(var(--editor-bg))]">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Career Card Builder
            </h1>
            <p className="text-sm text-muted-foreground">Create your comprehensive career profile</p>
          </div>
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => setShowPreview(!showPreview)}
              className="gap-2"
            >
              {showPreview ? <Edit3 className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              {showPreview ? "Edit" : "Preview"}
            </Button>
            <Button onClick={handleExport} className="gap-2" disabled={isExporting}>
              <Download className="h-4 w-4" />
              {isExporting ? "Exporting..." : "Export Card"}
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        {showPreview ? (
          <div ref={previewRef}>
            <CareerCardPreview data={cardData} />
          </div>
        ) : (
          <div className="max-w-4xl mx-auto space-y-6">
            <ImportDataSection onDataImported={handleImportedData} />
            <ProfileSection data={cardData.profile} onChange={updateProfile} />
            <ExperienceSection data={cardData.experience} onChange={updateExperience} />
            <ProjectsSection data={cardData.projects} onChange={updateProjects} />
            <GreatestImpactsSection data={cardData.greatestImpacts} onChange={updateGreatestImpacts} />
            <StylesOfWorkSection data={cardData.stylesOfWork} onChange={updateStylesOfWork} />
            <FrameworksSection data={cardData.frameworks} onChange={updateFrameworks} />
            <PastimesSection data={cardData.pastimes} onChange={updatePastimes} />
            <CodeShowcaseSection data={cardData.codeShowcase} onChange={updateCodeShowcase} />
          </div>
        )}
      </div>
    </div>
  );
};

export default CareerCardBuilder;
