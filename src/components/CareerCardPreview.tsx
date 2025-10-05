import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MapPin, Briefcase, FolderGit2, Award, Workflow, Code2, Heart } from "lucide-react";
import { CareerCardData } from "./CareerCardBuilder";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useState } from "react";
import { ChevronDown } from "lucide-react";

interface CareerCardPreviewProps {
  data: CareerCardData;
}

export const CareerCardPreview = ({ data }: CareerCardPreviewProps) => {
  const [openSections, setOpenSections] = useState<string[]>(["experience"]);

  const toggleSection = (section: string) => {
    setOpenSections((prev) =>
      prev.includes(section) ? prev.filter((s) => s !== section) : [...prev, section]
    );
  };

  return (
    <div className="max-w-md mx-auto">
      <Card className="overflow-hidden shadow-[var(--shadow-elevated)]">
        {/* Profile Section */}
        <div className="bg-gradient-to-b from-card to-[hsl(var(--preview-bg))] p-8 text-center border-b">
          <Avatar className="h-24 w-24 mx-auto mb-4 ring-4 ring-primary/10">
            <AvatarImage src={data.profile.imageUrl} alt={data.profile.name} />
            <AvatarFallback className="text-2xl bg-primary/10 text-primary">
              {data.profile.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
            </AvatarFallback>
          </Avatar>
          <h2 className="text-2xl font-bold text-foreground mb-1">{data.profile.name || "Your Name"}</h2>
          <p className="text-muted-foreground mb-2">{data.profile.title || "Your Title"}</p>
          {data.profile.location && (
            <div className="flex items-center justify-center gap-1 text-sm text-primary">
              <MapPin className="h-4 w-4" />
              {data.profile.location}
            </div>
          )}
        </div>

        {/* Experience Section */}
        {data.experience.length > 0 && (
          <Collapsible open={openSections.includes("experience")} onOpenChange={() => toggleSection("experience")}>
            <CollapsibleTrigger className="w-full px-6 py-4 flex items-center justify-between hover:bg-muted/50 transition-colors border-b">
              <div className="flex items-center gap-3">
                <Briefcase className="h-5 w-5 text-[hsl(var(--section-icon))]" />
                <span className="font-semibold">Experience</span>
              </div>
              <ChevronDown className={`h-5 w-5 transition-transform ${openSections.includes("experience") ? "rotate-180" : ""}`} />
            </CollapsibleTrigger>
            <CollapsibleContent className="px-6 py-4 space-y-4 border-b">
              {data.experience.map((exp) => (
                <div key={exp.id} className="space-y-1">
                  <h4 className="font-semibold text-foreground">{exp.title}</h4>
                  <p className="text-sm text-muted-foreground">{exp.company} • {exp.period}</p>
                  <p className="text-sm text-foreground/80">{exp.description}</p>
                </div>
              ))}
            </CollapsibleContent>
          </Collapsible>
        )}

        {/* Projects Section */}
        {data.projects.length > 0 && (
          <Collapsible open={openSections.includes("projects")} onOpenChange={() => toggleSection("projects")}>
            <CollapsibleTrigger className="w-full px-6 py-4 flex items-center justify-between hover:bg-muted/50 transition-colors border-b">
              <div className="flex items-center gap-3">
                <FolderGit2 className="h-5 w-5 text-[hsl(var(--section-icon))]" />
                <span className="font-semibold">Projects</span>
              </div>
              <ChevronDown className={`h-5 w-5 transition-transform ${openSections.includes("projects") ? "rotate-180" : ""}`} />
            </CollapsibleTrigger>
            <CollapsibleContent className="px-6 py-4 space-y-4 border-b">
              {data.projects.map((project) => (
                <div key={project.id} className="space-y-1">
                  <h4 className="font-semibold text-foreground">{project.name}</h4>
                  <p className="text-sm text-foreground/80">{project.description}</p>
                  <p className="text-xs text-muted-foreground">{project.technologies}</p>
                </div>
              ))}
            </CollapsibleContent>
          </Collapsible>
        )}

        {/* Certifications Section */}
        {data.certifications.length > 0 && (
          <Collapsible open={openSections.includes("certifications")} onOpenChange={() => toggleSection("certifications")}>
            <CollapsibleTrigger className="w-full px-6 py-4 flex items-center justify-between hover:bg-muted/50 transition-colors border-b">
              <div className="flex items-center gap-3">
                <Award className="h-5 w-5 text-[hsl(var(--section-icon))]" />
                <span className="font-semibold">Certifications</span>
              </div>
              <ChevronDown className={`h-5 w-5 transition-transform ${openSections.includes("certifications") ? "rotate-180" : ""}`} />
            </CollapsibleTrigger>
            <CollapsibleContent className="px-6 py-4 space-y-4 border-b">
              {data.certifications.map((cert) => (
                <div key={cert.id} className="space-y-1">
                  <h4 className="font-semibold text-foreground">{cert.name}</h4>
                  <p className="text-sm text-muted-foreground">{cert.issuer} • {cert.date}</p>
                </div>
              ))}
            </CollapsibleContent>
          </Collapsible>
        )}

        {/* Styles of Work Section */}
        {data.stylesOfWork.length > 0 && (
          <Collapsible open={openSections.includes("styles")} onOpenChange={() => toggleSection("styles")}>
            <CollapsibleTrigger className="w-full px-6 py-4 flex items-center justify-between hover:bg-muted/50 transition-colors border-b">
              <div className="flex items-center gap-3">
                <Workflow className="h-5 w-5 text-[hsl(var(--section-icon))]" />
                <span className="font-semibold">Styles of Work</span>
              </div>
              <ChevronDown className={`h-5 w-5 transition-transform ${openSections.includes("styles") ? "rotate-180" : ""}`} />
            </CollapsibleTrigger>
            <CollapsibleContent className="px-6 py-4 space-y-4 border-b">
              {data.stylesOfWork.map((style) => (
                <div key={style.id} className="space-y-1">
                  <h4 className="font-semibold text-foreground">{style.style}</h4>
                  <p className="text-sm text-foreground/80">{style.description}</p>
                </div>
              ))}
            </CollapsibleContent>
          </Collapsible>
        )}

        {/* Frameworks Section */}
        {data.frameworks.length > 0 && (
          <Collapsible open={openSections.includes("frameworks")} onOpenChange={() => toggleSection("frameworks")}>
            <CollapsibleTrigger className="w-full px-6 py-4 flex items-center justify-between hover:bg-muted/50 transition-colors border-b">
              <div className="flex items-center gap-3">
                <Code2 className="h-5 w-5 text-[hsl(var(--section-icon))]" />
                <span className="font-semibold">Frameworks</span>
              </div>
              <ChevronDown className={`h-5 w-5 transition-transform ${openSections.includes("frameworks") ? "rotate-180" : ""}`} />
            </CollapsibleTrigger>
            <CollapsibleContent className="px-6 py-4 space-y-4 border-b">
              {data.frameworks.map((framework) => (
                <div key={framework.id} className="flex justify-between items-center">
                  <span className="font-medium text-foreground">{framework.name}</span>
                  <span className="text-sm text-muted-foreground">{framework.proficiency}</span>
                </div>
              ))}
            </CollapsibleContent>
          </Collapsible>
        )}

        {/* Pastimes Section */}
        {data.pastimes.length > 0 && (
          <Collapsible open={openSections.includes("pastimes")} onOpenChange={() => toggleSection("pastimes")}>
            <CollapsibleTrigger className="w-full px-6 py-4 flex items-center justify-between hover:bg-muted/50 transition-colors">
              <div className="flex items-center gap-3">
                <Heart className="h-5 w-5 text-[hsl(var(--section-icon))]" />
                <span className="font-semibold">Pastime Interests</span>
              </div>
              <ChevronDown className={`h-5 w-5 transition-transform ${openSections.includes("pastimes") ? "rotate-180" : ""}`} />
            </CollapsibleTrigger>
            <CollapsibleContent className="px-6 py-4 space-y-4">
              {data.pastimes.map((pastime) => (
                <div key={pastime.id} className="space-y-1">
                  <h4 className="font-semibold text-foreground">{pastime.activity}</h4>
                  <p className="text-sm text-foreground/80">{pastime.description}</p>
                </div>
              ))}
            </CollapsibleContent>
          </Collapsible>
        )}
      </Card>
    </div>
  );
};
