import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Code2, Plus, Trash2 } from "lucide-react";
import { CareerCardData } from "../CareerCardBuilder";

interface FrameworksSectionProps {
  data: CareerCardData["frameworks"];
  onChange: (frameworks: CareerCardData["frameworks"]) => void;
}

export const FrameworksSection = ({ data, onChange }: FrameworksSectionProps) => {
  const addFramework = () => {
    onChange([
      ...data,
      {
        id: Math.random().toString(36).substr(2, 9),
        name: "",
        proficiency: "",
        projectsBuilt: "",
      },
    ]);
  };

  const removeFramework = (id: string) => {
    onChange(data.filter((framework) => framework.id !== id));
  };

  const updateFramework = (id: string, field: string, value: string) => {
    onChange(
      data.map((framework) => (framework.id === id ? { ...framework, [field]: value } : framework))
    );
  };

  return (
    <Card className="p-6 shadow-[var(--shadow-card)]">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
            <Code2 className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-bold">Frameworks</h2>
            <p className="text-sm text-muted-foreground">Technologies you master</p>
          </div>
        </div>
        <Button onClick={addFramework} size="sm" className="gap-2">
          <Plus className="h-4 w-4" />
          Add
        </Button>
      </div>

      <div className="space-y-4">
        {data.map((framework) => (
          <div key={framework.id} className="p-4 border rounded-lg space-y-4 relative">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => removeFramework(framework.id)}
              className="absolute top-2 right-2"
            >
              <Trash2 className="h-4 w-4" />
            </Button>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Framework/Technology</Label>
                <Input
                  placeholder="React"
                  value={framework.name}
                  onChange={(e) => updateFramework(framework.id, "name", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>Proficiency Level</Label>
                <Input
                  placeholder="Expert"
                  value={framework.proficiency}
                  onChange={(e) => updateFramework(framework.id, "proficiency", e.target.value)}
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label>Number of Projects Built</Label>
                <Input
                  placeholder="e.g., 10+ projects"
                  value={framework.projectsBuilt || ""}
                  onChange={(e) => updateFramework(framework.id, "projectsBuilt", e.target.value)}
                />
              </div>
            </div>
          </div>
        ))}

        {data.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            No frameworks added yet. Click "Add" to get started.
          </div>
        )}
      </div>
    </Card>
  );
};
