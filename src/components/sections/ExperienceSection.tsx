import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Briefcase, Plus, Trash2 } from "lucide-react";
import { CareerCardData } from "../CareerCardBuilder";

interface ExperienceSectionProps {
  data: CareerCardData["experience"];
  onChange: (experience: CareerCardData["experience"]) => void;
}

export const ExperienceSection = ({ data, onChange }: ExperienceSectionProps) => {
  const addExperience = () => {
    onChange([
      ...data,
      {
        id: Math.random().toString(36).substr(2, 9),
        title: "",
        company: "",
        period: "",
        description: "",
      },
    ]);
  };

  const removeExperience = (id: string) => {
    onChange(data.filter((exp) => exp.id !== id));
  };

  const updateExperience = (id: string, field: string, value: string) => {
    onChange(
      data.map((exp) => (exp.id === id ? { ...exp, [field]: value } : exp))
    );
  };

  return (
    <Card className="p-6 shadow-[var(--shadow-card)]">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
            <Briefcase className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-bold">Experience</h2>
            <p className="text-sm text-muted-foreground">Your work history</p>
          </div>
        </div>
        <Button onClick={addExperience} size="sm" className="gap-2">
          <Plus className="h-4 w-4" />
          Add
        </Button>
      </div>

      <div className="space-y-6">
        {data.map((exp) => (
          <div key={exp.id} className="p-4 border rounded-lg space-y-4 relative">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => removeExperience(exp.id)}
              className="absolute top-2 right-2"
            >
              <Trash2 className="h-4 w-4" />
            </Button>

            <div className="space-y-2">
              <Label>Job Title</Label>
              <Input
                placeholder="Senior Software Engineer"
                value={exp.title}
                onChange={(e) => updateExperience(exp.id, "title", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Company</Label>
              <Input
                placeholder="Tech Corp"
                value={exp.company}
                onChange={(e) => updateExperience(exp.id, "company", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Period</Label>
              <Input
                placeholder="2020 - Present"
                value={exp.period}
                onChange={(e) => updateExperience(exp.id, "period", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                placeholder="Describe your role and achievements..."
                value={exp.description}
                onChange={(e) => updateExperience(exp.id, "description", e.target.value)}
                rows={4}
              />
            </div>
          </div>
        ))}

        {data.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            No experience added yet. Click "Add" to get started.
          </div>
        )}
      </div>
    </Card>
  );
};
