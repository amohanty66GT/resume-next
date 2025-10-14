import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { User, Upload, Loader2 } from "lucide-react";
import { CareerCardData } from "../CareerCardBuilder";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useState, useRef } from "react";

interface ProfileSectionProps {
  data: CareerCardData["profile"];
  onChange: (profile: CareerCardData["profile"]) => void;
  theme?: 'blue' | 'purple' | 'green' | 'orange' | 'pink' | 'slate';
  onThemeChange: (theme: 'blue' | 'purple' | 'green' | 'orange' | 'pink' | 'slate') => void;
}

export const ProfileSection = ({ data, onChange, theme = 'blue', onThemeChange }: ProfileSectionProps) => {
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size must be less than 5MB");
      return;
    }

    try {
      setIsUploading(true);
      
      // Create a unique file name
      const fileExt = file.name.split(".").pop();
      const fileName = `${Math.random().toString(36).substring(2)}_${Date.now()}.${fileExt}`;
      const filePath = fileName;

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from("profile-images")
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: false,
        });

      if (uploadError) {
        throw uploadError;
      }

      // Get the public URL
      const { data: { publicUrl } } = supabase.storage
        .from("profile-images")
        .getPublicUrl(filePath);

      // Update the profile data with the new image URL
      onChange({ ...data, imageUrl: publicUrl });
      toast.success("Profile image uploaded successfully!");
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Failed to upload image. Please try again.");
    } finally {
      setIsUploading(false);
      // Reset the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

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
          <Label htmlFor="profileImage">Profile Image</Label>
          <div className="flex gap-2">
            <input
              ref={fileInputRef}
              type="file"
              id="profileImage"
              accept="image/*"
              onChange={handleFileUpload}
              className="hidden"
            />
            <Button
              type="button"
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="w-full"
            >
              {isUploading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Photo
                </>
              )}
            </Button>
          </div>
          {data.imageUrl && (
            <div className="mt-2">
              <img
                src={data.imageUrl}
                alt="Profile preview"
                className="w-20 h-20 rounded-full object-cover border-2 border-border"
              />
            </div>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="portfolioUrl">Portfolio URL (Optional)</Label>
          <Input
            id="portfolioUrl"
            type="url"
            placeholder="https://yourwebsite.com"
            value={data.portfolioUrl || ""}
            onChange={(e) => onChange({ ...data, portfolioUrl: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <Label>Card Theme</Label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { name: 'blue', color: 'hsl(221 83% 53%)' },
              { name: 'purple', color: 'hsl(271 91% 65%)' },
              { name: 'green', color: 'hsl(142 76% 36%)' },
              { name: 'orange', color: 'hsl(24 95% 53%)' },
              { name: 'pink', color: 'hsl(330 81% 60%)' },
              { name: 'slate', color: 'hsl(215 16% 47%)' },
            ].map((themeOption) => (
              <button
                key={themeOption.name}
                type="button"
                onClick={() => onThemeChange(themeOption.name as any)}
                className={`p-3 rounded-lg border-2 transition-all ${
                  theme === themeOption.name
                    ? 'border-primary ring-2 ring-primary/20'
                    : 'border-border hover:border-primary/50'
                }`}
              >
                <div 
                  className="w-full h-8 rounded"
                  style={{ backgroundColor: themeOption.color }}
                />
                <p className="text-xs mt-2 capitalize text-center">{themeOption.name}</p>
              </button>
            ))}
          </div>
        </div>
      </div>
    </Card>
  );
};
