import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Workflow, Plus, Trash2 } from "lucide-react";
import { CareerCardData } from "../CareerCardBuilder";

interface StylesOfWorkSectionProps {
  data: CareerCardData["stylesOfWork"];
  onChange: (stylesOfWork: CareerCardData["stylesOfWork"]) => void;
}

export const StylesOfWorkSection = ({ data, onChange }: StylesOfWorkSectionProps) => {
  const addStyle = () => {
    onChange([
      ...data,
      {
        id: Math.random().toString(36).substr(2, 9),
        style: "",
        description: "",
      },
    ]);
  };

  const removeStyle = (id: string) => {
    onChange(data.filter((style) => style.id !== id));
  };

  const updateStyle = (id: string, field: string, value: string) => {
    onChange(
      data.map((style) => (style.id === id ? { ...style, [field]: value } : style))
    );
  };

  return (
    <Card className="p-6 shadow-[var(--shadow-card)]">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
            <Workflow className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-bold">Styles of Work</h2>
            <p className="text-sm text-muted-foreground">Your work methodologies</p>
          </div>
        </div>
        <Button onClick={addStyle} size="sm" className="gap-2">
          <Plus className="h-4 w-4" />
          Add
        </Button>
      </div>

      <div className="space-y-4">
        {data.map((style) => (
          <div key={style.id} className="p-4 border rounded-lg space-y-4 relative">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => removeStyle(style.id)}
              className="absolute top-2 right-2"
            >
              <Trash2 className="h-4 w-4" />
            </Button>

            <div className="space-y-2">
              <Label>Work Style</Label>
              <Input
                placeholder="Agile Development"
                value={style.style}
                onChange={(e) => updateStyle(style.id, "style", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                placeholder="Describe your approach to this work style..."
                value={style.description}
                onChange={(e) => updateStyle(style.id, "description", e.target.value)}
                rows={3}
              />
            </div>
          </div>
        ))}

        {data.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            No work styles added yet. Click "Add" to get started.
          </div>
        )}
      </div>
    </Card>
  );
};
