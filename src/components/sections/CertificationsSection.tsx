import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Award, Plus, Trash2 } from "lucide-react";
import { CareerCardData } from "../CareerCardBuilder";

interface CertificationsSectionProps {
  data: CareerCardData["certifications"];
  onChange: (certifications: CareerCardData["certifications"]) => void;
}

export const CertificationsSection = ({ data, onChange }: CertificationsSectionProps) => {
  const addCertification = () => {
    onChange([
      ...data,
      {
        id: Math.random().toString(36).substr(2, 9),
        name: "",
        issuer: "",
        date: "",
        url: "",
      },
    ]);
  };

  const removeCertification = (id: string) => {
    onChange(data.filter((cert) => cert.id !== id));
  };

  const updateCertification = (id: string, field: string, value: string) => {
    onChange(
      data.map((cert) => (cert.id === id ? { ...cert, [field]: value } : cert))
    );
  };

  return (
    <Card className="p-6 shadow-[var(--shadow-card)]">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
            <Award className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-bold">Certifications</h2>
            <p className="text-sm text-muted-foreground">Your credentials</p>
          </div>
        </div>
        <Button onClick={addCertification} size="sm" className="gap-2">
          <Plus className="h-4 w-4" />
          Add
        </Button>
      </div>

      <div className="space-y-4">
        {data.map((cert) => (
          <div key={cert.id} className="p-4 border rounded-lg space-y-4 relative">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => removeCertification(cert.id)}
              className="absolute top-2 right-2"
            >
              <Trash2 className="h-4 w-4" />
            </Button>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Certification Name</Label>
                <Input
                  placeholder="AWS Certified Solutions Architect"
                  value={cert.name}
                  onChange={(e) => updateCertification(cert.id, "name", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>Issuer</Label>
                <Input
                  placeholder="Amazon Web Services"
                  value={cert.issuer}
                  onChange={(e) => updateCertification(cert.id, "issuer", e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Date Obtained</Label>
                <Input
                  placeholder="January 2024"
                  value={cert.date}
                  onChange={(e) => updateCertification(cert.id, "date", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>Credential URL (Optional)</Label>
                <Input
                  type="url"
                  placeholder="https://credential-url.com"
                  value={cert.url || ""}
                  onChange={(e) => updateCertification(cert.id, "url", e.target.value)}
                />
              </div>
            </div>
          </div>
        ))}

        {data.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            No certifications added yet. Click "Add" to get started.
          </div>
        )}
      </div>
    </Card>
  );
};
