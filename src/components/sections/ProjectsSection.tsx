import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { FolderGit2, Plus, Trash2, Upload, Link as LinkIcon } from "lucide-react";
import { CareerCardData } from "../CareerCardBuilder";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useState } from "react";

interface ProjectsSectionProps {
  data: CareerCardData["projects"];
  onChange: (projects: CareerCardData["projects"]) => void;
}

export const ProjectsSection = ({ data, onChange }: ProjectsSectionProps) => {
  const [uploadingFile, setUploadingFile] = useState<string | null>(null);

  const addProject = () => {
    onChange([
      ...data,
      {
        id: Math.random().toString(36).substr(2, 9),
        name: "",
        description: "",
        technologies: "",
        projectUrl: "",
      },
    ]);
  };

  const removeProject = (id: string) => {
    onChange(data.filter((project) => project.id !== id));
  };

  const updateProject = (id: string, field: string, value: string) => {
    onChange(
      data.map((project) => (project.id === id ? { ...project, [field]: value } : project))
    );
  };

  const handleFileUpload = async (id: string, file: File) => {
    try {
      setUploadingFile(id);
      const fileExt = file.name.split(".").pop();
      const fileName = `${id}_${Date.now()}.${fileExt}`;
      const filePath = `project-files/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("profile-images")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from("profile-images")
        .getPublicUrl(filePath);

      updateProject(id, "projectUrl", urlData.publicUrl);
      toast.success("File uploaded successfully!");
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Failed to upload file");
    } finally {
      setUploadingFile(null);
    }
  };

  return (
    <Card className="p-6 shadow-[var(--shadow-card)]">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
            <FolderGit2 className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-bold">Projects</h2>
            <p className="text-sm text-muted-foreground">Your notable work</p>
          </div>
        </div>
        <Button onClick={addProject} size="sm" className="gap-2">
          <Plus className="h-4 w-4" />
          Add
        </Button>
      </div>

      <div className="space-y-6">
        {data.map((project) => (
          <div key={project.id} className="p-4 border rounded-lg space-y-4 relative">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => removeProject(project.id)}
              className="absolute top-2 right-2"
            >
              <Trash2 className="h-4 w-4" />
            </Button>

            <div className="space-y-2">
              <Label>Project Name</Label>
              <Input
                placeholder="E-commerce Platform"
                value={project.name}
                onChange={(e) => updateProject(project.id, "name", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                placeholder="Built a scalable e-commerce platform..."
                value={project.description}
                onChange={(e) => updateProject(project.id, "description", e.target.value)}
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label>Technologies</Label>
              <Input
                placeholder="React, Node.js, MongoDB"
                value={project.technologies}
                onChange={(e) => updateProject(project.id, "technologies", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Project File or Link</Label>
              <div className="flex gap-2">
                <div className="flex-1">
                  <Input
                    placeholder="https://github.com/username/project or paste link"
                    value={project.projectUrl || ""}
                    onChange={(e) => updateProject(project.id, "projectUrl", e.target.value)}
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => {
                      const input = document.createElement("input");
                      input.type = "file";
                      input.accept = ".pdf,.doc,.docx,.zip,.png,.jpg,.jpeg";
                      input.onchange = (e) => {
                        const file = (e.target as HTMLInputElement).files?.[0];
                        if (file) handleFileUpload(project.id, file);
                      };
                      input.click();
                    }}
                    disabled={uploadingFile === project.id}
                  >
                    <Upload className="h-4 w-4" />
                  </Button>
                  {project.projectUrl && (
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => window.open(project.projectUrl, "_blank")}
                    >
                      <LinkIcon className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}

        {data.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            No projects added yet. Click "Add" to get started.
          </div>
        )}
      </div>
    </Card>
  );
};
