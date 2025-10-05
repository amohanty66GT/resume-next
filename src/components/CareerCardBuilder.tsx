import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Download, Eye, Edit3 } from "lucide-react";
import { ProfileSection } from "./sections/ProfileSection";
import { ExperienceSection } from "./sections/ExperienceSection";
import { ProjectsSection } from "./sections/ProjectsSection";
import { CertificationsSection } from "./sections/CertificationsSection";
import { StylesOfWorkSection } from "./sections/StylesOfWorkSection";
import { FrameworksSection } from "./sections/FrameworksSection";
import { PastimesSection } from "./sections/PastimesSection";
import { CareerCardPreview } from "./CareerCardPreview";
import { toast } from "sonner";

export interface CareerCardData {
  profile: {
    name: string;
    title: string;
    location: string;
    imageUrl: string;
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
  }>;
  certifications: Array<{
    id: string;
    name: string;
    issuer: string;
    date: string;
  }>;
  stylesOfWork: Array<{
    id: string;
    style: string;
    description: string;
  }>;
  frameworks: Array<{
    id: string;
    name: string;
    proficiency: string;
  }>;
  pastimes: Array<{
    id: string;
    activity: string;
    description: string;
  }>;
}

const CareerCardBuilder = () => {
  const [showPreview, setShowPreview] = useState(false);
  const [cardData, setCardData] = useState<CareerCardData>({
    profile: {
      name: "",
      title: "",
      location: "",
      imageUrl: "",
    },
    experience: [],
    projects: [],
    certifications: [],
    stylesOfWork: [],
    frameworks: [],
    pastimes: [],
  });

  const handleExport = () => {
    toast.success("Career card exported successfully!");
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

  const updateCertifications = (certifications: CareerCardData["certifications"]) => {
    setCardData({ ...cardData, certifications });
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
            <Button onClick={handleExport} className="gap-2">
              <Download className="h-4 w-4" />
              Export Card
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        {showPreview ? (
          <CareerCardPreview data={cardData} />
        ) : (
          <div className="max-w-4xl mx-auto space-y-6">
            <ProfileSection data={cardData.profile} onChange={updateProfile} />
            <ExperienceSection data={cardData.experience} onChange={updateExperience} />
            <ProjectsSection data={cardData.projects} onChange={updateProjects} />
            <CertificationsSection data={cardData.certifications} onChange={updateCertifications} />
            <StylesOfWorkSection data={cardData.stylesOfWork} onChange={updateStylesOfWork} />
            <FrameworksSection data={cardData.frameworks} onChange={updateFrameworks} />
            <PastimesSection data={cardData.pastimes} onChange={updatePastimes} />
          </div>
        )}
      </div>
    </div>
  );
};

export default CareerCardBuilder;
