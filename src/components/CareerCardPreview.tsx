import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MapPin, Briefcase, FolderGit2, Sparkles, Workflow, Code2, Heart, ExternalLink, FileCode } from "lucide-react";
import { CareerCardData } from "./CareerCardBuilder";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { SURVEY_QUESTIONS } from "./sections/StylesOfWorkSection";

interface CareerCardPreviewProps {
  data: CareerCardData;
}

const themeColors = {
  blue: { primary: 'hsl(221 83% 53%)', gradient: 'from-blue-500/10 to-blue-600/5', ring: 'ring-blue-500/10', icon: 'text-blue-600' },
  purple: { primary: 'hsl(271 91% 65%)', gradient: 'from-purple-500/10 to-purple-600/5', ring: 'ring-purple-500/10', icon: 'text-purple-600' },
  green: { primary: 'hsl(142 76% 36%)', gradient: 'from-green-500/10 to-green-600/5', ring: 'ring-green-500/10', icon: 'text-green-600' },
  orange: { primary: 'hsl(24 95% 53%)', gradient: 'from-orange-500/10 to-orange-600/5', ring: 'ring-orange-500/10', icon: 'text-orange-600' },
  pink: { primary: 'hsl(330 81% 60%)', gradient: 'from-pink-500/10 to-pink-600/5', ring: 'ring-pink-500/10', icon: 'text-pink-600' },
  slate: { primary: 'hsl(215 16% 47%)', gradient: 'from-slate-500/10 to-slate-600/5', ring: 'ring-slate-500/10', icon: 'text-slate-600' },
};

export const CareerCardPreview = ({ data }: CareerCardPreviewProps) => {
  const [openSections, setOpenSections] = useState<string[]>(["experience"]);
  const selectedTheme = themeColors[data.theme || 'blue'];

  const toggleSection = (section: string) => {
    setOpenSections((prev) =>
      prev.includes(section) ? prev.filter((s) => s !== section) : [...prev, section]
    );
  };

  return (
    <div className="max-w-md mx-auto">
      <Card className="overflow-hidden shadow-[var(--shadow-elevated)]">
        {/* Profile Section */}
        <div className={`bg-gradient-to-b ${selectedTheme.gradient} p-8 text-center border-b`}>
          <Avatar className={`h-24 w-24 mx-auto mb-4 ring-4 ${selectedTheme.ring}`}>
            <AvatarImage src={data.profile.imageUrl} alt={data.profile.name} />
            <AvatarFallback className="text-2xl" style={{ backgroundColor: selectedTheme.primary + '20', color: selectedTheme.primary }}>
              {data.profile.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
            </AvatarFallback>
          </Avatar>
          <h2 className="text-2xl font-bold text-foreground mb-1">{data.profile.name || "Your Name"}</h2>
          <p className="text-muted-foreground mb-2">{data.profile.title || "Your Title"}</p>
          {data.profile.location && (
            <div className="flex items-center justify-center gap-1 text-sm mb-2" style={{ color: selectedTheme.primary }}>
              <MapPin className="h-4 w-4" />
              {data.profile.location}
            </div>
          )}
          {data.profile.portfolioUrl && (
            <a 
              href={data.profile.portfolioUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-sm hover:underline"
              style={{ color: selectedTheme.primary }}
            >
              <ExternalLink className="h-3 w-3" />
              View Portfolio
            </a>
          )}
        </div>

        {/* Experience Section */}
        {data.experience.length > 0 && (
          <Collapsible open={openSections.includes("experience")} onOpenChange={() => toggleSection("experience")}>
            <CollapsibleTrigger className="w-full px-6 py-4 flex items-center justify-between hover:bg-muted/50 transition-colors border-b">
              <div className="flex items-center gap-3">
                <Briefcase className={`h-5 w-5 ${selectedTheme.icon}`} />
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
                <FolderGit2 className={`h-5 w-5 ${selectedTheme.icon}`} />
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

        {/* Greatest Impacts Section */}
        {data.greatestImpacts.length > 0 && (
          <Collapsible open={openSections.includes("impacts")} onOpenChange={() => toggleSection("impacts")}>
            <CollapsibleTrigger className="w-full px-6 py-4 flex items-center justify-between hover:bg-muted/50 transition-colors border-b">
              <div className="flex items-center gap-3">
                <Sparkles className={`h-5 w-5 ${selectedTheme.icon}`} />
                <span className="font-semibold">Greatest Impacts</span>
              </div>
              <ChevronDown className={`h-5 w-5 transition-transform ${openSections.includes("impacts") ? "rotate-180" : ""}`} />
            </CollapsibleTrigger>
            <CollapsibleContent className="px-6 py-4 space-y-4 border-b">
              {data.greatestImpacts.map((impact) => (
                <div key={impact.id} className="space-y-1">
                  <h4 className="font-semibold text-foreground">{impact.title}</h4>
                  <p className="text-sm text-muted-foreground">{impact.context}</p>
                  {impact.outcome && <p className="text-sm text-foreground/80">{impact.outcome}</p>}
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
                <Workflow className={`h-5 w-5 ${selectedTheme.icon}`} />
                <span className="font-semibold">Styles of Work</span>
              </div>
              <ChevronDown className={`h-5 w-5 transition-transform ${openSections.includes("styles") ? "rotate-180" : ""}`} />
            </CollapsibleTrigger>
            <CollapsibleContent className="px-6 py-4 space-y-4 border-b">
              {data.stylesOfWork.map((style) => {
                const question = SURVEY_QUESTIONS.find(q => q.id === style.id);
                const selectedOption = question?.options.find(opt => opt.value === style.selectedAnswer);
                
                return (
                  <div key={style.id} className="space-y-1">
                    <h4 className="font-semibold text-foreground">{style.question}</h4>
                    <p className="text-sm text-foreground/80">{selectedOption?.label || style.selectedAnswer}</p>
                  </div>
                );
              })}
            </CollapsibleContent>
          </Collapsible>
        )}

        {/* Frameworks Section */}
        {data.frameworks.length > 0 && (
          <Collapsible open={openSections.includes("frameworks")} onOpenChange={() => toggleSection("frameworks")}>
            <CollapsibleTrigger className="w-full px-6 py-4 flex items-center justify-between hover:bg-muted/50 transition-colors border-b">
              <div className="flex items-center gap-3">
                <Code2 className={`h-5 w-5 ${selectedTheme.icon}`} />
                <span className="font-semibold">Frameworks</span>
              </div>
              <ChevronDown className={`h-5 w-5 transition-transform ${openSections.includes("frameworks") ? "rotate-180" : ""}`} />
            </CollapsibleTrigger>
            <CollapsibleContent className="px-6 py-4 space-y-4 border-b">
              {data.frameworks.map((framework) => (
                <div key={framework.id} className="space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-foreground">{framework.name}</span>
                    <span className="text-sm text-muted-foreground">{framework.proficiency}</span>
                  </div>
                  {framework.projectsBuilt && (
                    <p className="text-xs text-muted-foreground">Built: {framework.projectsBuilt}</p>
                  )}
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
                <Heart className={`h-5 w-5 ${selectedTheme.icon}`} />
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

        {/* Code Showcase Section */}
        {data.codeShowcase.length > 0 && (
          <Collapsible open={openSections.includes("code")} onOpenChange={() => toggleSection("code")}>
            <CollapsibleTrigger className="w-full px-6 py-4 flex items-center justify-between hover:bg-muted/50 transition-colors">
              <div className="flex items-center gap-3">
                <FileCode className={`h-5 w-5 ${selectedTheme.icon}`} />
                <span className="font-semibold">Code Showcase</span>
              </div>
              <ChevronDown className={`h-5 w-5 transition-transform ${openSections.includes("code") ? "rotate-180" : ""}`} />
            </CollapsibleTrigger>
            <CollapsibleContent className="px-6 py-4 space-y-4">
              {data.codeShowcase.map((snippet) => (
                <div key={snippet.id} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold text-foreground">{snippet.fileName}</h4>
                    <span className="text-xs text-muted-foreground">{snippet.language}</span>
                  </div>
                  {snippet.repo && <p className="text-xs text-muted-foreground">from {snippet.repo}</p>}
                  {snippet.caption && (
                    <p className="text-sm text-foreground/80 italic">{snippet.caption}</p>
                  )}
                  <pre className="bg-muted p-3 rounded text-xs overflow-x-auto">
                    <code>{snippet.code}</code>
                  </pre>
                  {snippet.url && (
                    <a 
                      href={snippet.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-xs text-primary hover:underline flex items-center gap-1"
                    >
                      <ExternalLink className="h-3 w-3" />
                      View on GitHub
                    </a>
                  )}
                </div>
              ))}
            </CollapsibleContent>
          </Collapsible>
        )}
      </Card>
    </div>
  );
};
