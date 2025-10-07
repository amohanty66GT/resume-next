import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Heart, Plus, Trash2 } from "lucide-react";
import { CareerCardData } from "../CareerCardBuilder";

interface PastimesSectionProps {
  data: CareerCardData["pastimes"];
  onChange: (pastimes: CareerCardData["pastimes"]) => void;
}

export const PastimesSection = ({ data, onChange }: PastimesSectionProps) => {
  const addPastime = () => {
    onChange([
      ...data,
      {
        id: Math.random().toString(36).substr(2, 9),
        activity: "",
        description: "",
      },
    ]);
  };

  const removePastime = (id: string) => {
    onChange(data.filter((pastime) => pastime.id !== id));
  };

  const updatePastime = (id: string, field: string, value: string) => {
    onChange(
      data.map((pastime) => (pastime.id === id ? { ...pastime, [field]: value } : pastime))
    );
  };

  return (
    <Card className="p-6 shadow-[var(--shadow-card)]">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
            <Heart className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-bold">Pastime Interests</h2>
            <p className="text-sm text-muted-foreground">Outside learning resources & interests beyond professional experiences</p>
          </div>
        </div>
        <Button onClick={addPastime} size="sm" className="gap-2">
          <Plus className="h-4 w-4" />
          Add
        </Button>
      </div>

      <div className="space-y-4">
        {data.map((pastime) => (
          <div key={pastime.id} className="p-4 border rounded-lg space-y-4 relative">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => removePastime(pastime.id)}
              className="absolute top-2 right-2"
            >
              <Trash2 className="h-4 w-4" />
            </Button>

            <div className="space-y-2">
              <Label>Activity</Label>
              <Input
                placeholder="Photography"
                value={pastime.activity}
                onChange={(e) => updatePastime(pastime.id, "activity", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                placeholder="Describe your interest and involvement..."
                value={pastime.description}
                onChange={(e) => updatePastime(pastime.id, "description", e.target.value)}
                rows={3}
              />
            </div>
          </div>
        ))}

        {data.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            No pastimes added yet. Click "Add" to get started.
          </div>
        )}
      </div>
    </Card>
  );
};
