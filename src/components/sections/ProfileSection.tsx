import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User } from "lucide-react";
import { CareerCardData } from "../CareerCardBuilder";

interface ProfileSectionProps {
  data: CareerCardData["profile"];
  onChange: (profile: CareerCardData["profile"]) => void;
}

export const ProfileSection = ({ data, onChange }: ProfileSectionProps) => {
  return (
    <Card className="p-6 shadow-[var(--shadow-card)]">
      <div className="flex items-center gap-3 mb-6">
        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
          <User className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h2 className="text-xl font-bold">Profile</h2>
          <p className="text-sm text-muted-foreground">Your basic information</p>
        </div>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Full Name</Label>
          <Input
            id="name"
            placeholder="John Doe"
            value={data.name}
            onChange={(e) => onChange({ ...data, name: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="title">Professional Title</Label>
          <Input
            id="title"
            placeholder="Software Engineer"
            value={data.title}
            onChange={(e) => onChange({ ...data, title: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="location">Location</Label>
          <Input
            id="location"
            placeholder="San Francisco, CA"
            value={data.location}
            onChange={(e) => onChange({ ...data, location: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="imageUrl">Profile Image URL</Label>
          <Input
            id="imageUrl"
            placeholder="https://example.com/photo.jpg"
            value={data.imageUrl}
            onChange={(e) => onChange({ ...data, imageUrl: e.target.value })}
          />
        </div>
      </div>
    </Card>
  );
};
