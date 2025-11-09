import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Download, Eye, Edit3, Link, Check, Award } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
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
import { CareerCardScoring } from "./CareerCardScoring";
import { toast } from "sonner";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { careerCardDataSchema, logger } from "@/lib/validation";

export interface CareerCardData {
  profile: {
    name: string;
    title: string;
    location: string;
    imageUrl: string;
    portfolioUrl?: string;
  };
  theme?: 'blue' | 'purple' | 'green' | 'orange' | 'pink' | 'slate';
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

interface CareerCardBuilderProps {
  userId: string;
}

const CareerCardBuilder = ({ userId }: CareerCardBuilderProps) => {
  const [showPreview, setShowPreview] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);
  const [sharedCardId, setSharedCardId] = useState<string | null>(null);
  const previewRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const [cardData, setCardData] = useState<CareerCardData>({
    profile: {
      name: "",
      title: "",
      location: "",
      imageUrl: "",
      portfolioUrl: "",
    },
    theme: 'blue',
    experience: [],
    projects: [],
    greatestImpacts: [],
    stylesOfWork: [],
    frameworks: [],
    pastimes: [],
    codeShowcase: [],
  });

  const handleShareCard = async () => {
    try {
      setIsSharing(true);
      toast.loading("Generating shareable link...");

      // Validate card data before saving
      const validationResult = careerCardDataSchema.safeParse(cardData);
      
      if (!validationResult.success) {
        const firstError = validationResult.error.errors[0];
        toast.error(`Validation failed: ${firstError.message} at ${firstError.path.join('.')}`);
        logger.error('Validation errors:', validationResult.error.errors);
        setIsSharing(false);
        return;
      }

      // Save or update the card data
      let cardId = sharedCardId;
      
      if (cardId) {
        // Update existing card
        const { error } = await supabase
          .from("career_cards")
          .update({ card_data: validationResult.data as any })
          .eq("id", cardId)
          .eq("user_id", userId);

        if (error) throw error;
      } else {
        // Create new card
        const { data, error } = await supabase
          .from("career_cards")
          .insert({ card_data: validationResult.data as any, user_id: userId })
          .select("id")
          .single();

        if (error) throw error;
        if (data) {
          cardId = data.id;
          setSharedCardId(data.id);
        }
      }

      // Copy link to clipboard
      const shareUrl = `${window.location.origin}/card/${cardId}`;
      await navigator.clipboard.writeText(shareUrl);
      
      setLinkCopied(true);
      toast.success("Link copied to clipboard!");
      
      setTimeout(() => setLinkCopied(false), 3000);
    } catch (error) {
      logger.error("Share error:", error);
      toast.error("Failed to generate shareable link. Please try again.");
    } finally {
      setIsSharing(false);
    }
  };

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
      toast.loading("Generating your career card PDF...");

      // Capture the preview card as canvas
      const canvas = await html2canvas(previewRef.current, {
        backgroundColor: "#ffffff",
        scale: 1.2, // Balanced quality and file size
        logging: false,
        useCORS: true,
      });

      // A4 dimensions
      const pdfWidth = 210; // A4 width in mm
      const pdfHeight = 297; // A4 height in mm
      const imgWidth = pdfWidth;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      // Create PDF
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });
      
      const imgData = canvas.toDataURL('image/jpeg', 0.85); // JPEG with 85% quality for smaller file size
      
      // If content fits on one page, add it directly
      if (imgHeight <= pdfHeight) {
        pdf.addImage(imgData, 'JPEG', 0, 0, imgWidth, imgHeight);
      } else {
        // Split content across multiple pages
        let heightLeft = imgHeight;
        let position = 0;
        
        // Add first page
        pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
        heightLeft -= pdfHeight;
        
        // Add remaining pages
        while (heightLeft > 0) {
          position = heightLeft - imgHeight;
          pdf.addPage();
          pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
          heightLeft -= pdfHeight;
        }
      }
      
      // Download PDF
      pdf.save(`${cardData.profile.name || "career-card"}_${new Date().getTime()}.pdf`);
      
      toast.success("Career card PDF downloaded successfully!");
    } catch (error) {
      logger.error("Export error:", error);
      toast.error("Failed to export career card. Please try again.");
    } finally {
      setIsExporting(false);
    }
  };

  const handleScoreCard = () => {
    navigate("/score");
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
            <Button onClick={handleScoreCard} variant="outline" className="gap-2">
              <Award className="h-4 w-4" />
              Score Card
            </Button>
            <Button onClick={handleShareCard} className="gap-2" disabled={isSharing}>
              {linkCopied ? <Check className="h-4 w-4" /> : <Link className="h-4 w-4" />}
              {isSharing ? "Generating..." : linkCopied ? "Link Copied!" : "Share Card"}
            </Button>
            <Button onClick={handleExport} variant="outline" className="gap-2" disabled={isExporting}>
              <Download className="h-4 w-4" />
              {isExporting ? "Exporting..." : "Export PDF"}
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
            {/* Directions Section */}
            <Card className="p-6 bg-gradient-to-br from-primary/5 to-accent/5 border-primary/20">
              <h2 className="text-xl font-semibold mb-3">
                How to Build Your Career Card
              </h2>
              <div className="space-y-2 text-muted-foreground">
                <p className="flex items-start gap-2">
                  <span className="text-primary font-semibold mt-0.5">•</span>
                  <span><strong>Fill what showcases you best</strong> - You don't need to complete every section. Focus on the areas that highlight your unique strengths and experiences.</span>
                </p>
                <p className="flex items-start gap-2">
                  <span className="text-primary font-semibold mt-0.5">•</span>
                  <span><strong>No word limits</strong> - Write as much or as little as you need. This is your story to tell.</span>
                </p>
                <p className="flex items-start gap-2">
                  <span className="text-primary font-semibold mt-0.5">•</span>
                  <span><strong>Import your resume</strong> - Use the Import section below to auto-populate from your existing resume or portfolio.</span>
                </p>
                <p className="flex items-start gap-2">
                  <span className="text-primary font-semibold mt-0.5">•</span>
                  <span><strong>Preview & Export</strong> - Click Preview to see your card, then Export to download it as an image.</span>
                </p>
              </div>
            </Card>
            
            <ImportDataSection onDataImported={handleImportedData} />
            
            <ProfileSection
              data={cardData.profile} 
              onChange={updateProfile}
              theme={cardData.theme}
              onThemeChange={(theme) => setCardData({ ...cardData, theme })}
            />
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
