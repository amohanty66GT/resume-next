import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Sparkles, Plus, Trash2 } from "lucide-react";
import { CareerCardData } from "../CareerCardBuilder";

interface GreatestImpactsSectionProps {
  data: CareerCardData["greatestImpacts"];
  onChange: (greatestImpacts: CareerCardData["greatestImpacts"]) => void;
}

export const GreatestImpactsSection = ({ data, onChange }: GreatestImpactsSectionProps) => {
  const addImpact = () => {
    onChange([
      ...data,
      {
        id: Math.random().toString(36).substr(2, 9),
        title: "",
        context: "",
        outcome: "",
      },
    ]);
  };

  const removeImpact = (id: string) => {
    onChange(data.filter((impact) => impact.id !== id));
  };

  const updateImpact = (id: string, field: string, value: string) => {
    onChange(
      data.map((impact) => (impact.id === id ? { ...impact, [field]: value } : impact))
    );
  };

  return (
    <Card className="p-6 shadow-[var(--shadow-card)]">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
            <Sparkles className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-bold">Greatest Impacts</h2>
            <p className="text-sm text-muted-foreground">Your most significant contributions</p>
          </div>
        </div>
        <Button onClick={addImpact} size="sm" className="gap-2">
          <Plus className="h-4 w-4" />
          Add
        </Button>
      </div>

      <div className="space-y-4">
        {data.map((impact) => (
          <div key={impact.id} className="p-4 border rounded-lg space-y-4 relative">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => removeImpact(impact.id)}
              className="absolute top-2 right-2"
            >
              <Trash2 className="h-4 w-4" />
            </Button>

            <div className="space-y-2">
              <Label>Impact Title</Label>
              <Input
                placeholder="Led migration that improved system performance by 60%"
                value={impact.title}
                onChange={(e) => updateImpact(impact.id, "title", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Context</Label>
              <Input
                placeholder="E-commerce platform redesign at Company X"
                value={impact.context}
                onChange={(e) => updateImpact(impact.id, "context", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Outcome (Optional)</Label>
              <Textarea
                placeholder="Reduced load times from 5s to 2s, increased conversion rate by 15%"
                value={impact.outcome || ""}
                onChange={(e) => updateImpact(impact.id, "outcome", e.target.value)}
                className="min-h-[80px]"
              />
            </div>
          </div>
        ))}

        {data.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            No impacts added yet. Click "Add" to get started.
          </div>
        )}
      </div>
    </Card>
  );
};
