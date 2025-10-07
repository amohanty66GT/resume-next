import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Code2, Plus, Trash2 } from "lucide-react";
import { CareerCardData } from "../CareerCardBuilder";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface CodeShowcaseSectionProps {
  data: CareerCardData["codeShowcase"];
  onChange: (codeShowcase: CareerCardData["codeShowcase"]) => void;
}

export const CodeShowcaseSection = ({ data, onChange }: CodeShowcaseSectionProps) => {
  const addCodeSnippet = () => {
    onChange([
      ...data,
      {
        id: Math.random().toString(36).substr(2, 9),
        fileName: "",
        language: "javascript",
        code: "",
        caption: "",
        repo: "",
        url: "",
      },
    ]);
  };

  const removeCodeSnippet = (id: string) => {
    onChange(data.filter((snippet) => snippet.id !== id));
  };

  const updateCodeSnippet = (id: string, field: string, value: string) => {
    onChange(
      data.map((snippet) => (snippet.id === id ? { ...snippet, [field]: value } : snippet))
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
            <h2 className="text-xl font-bold">Code Showcase</h2>
            <p className="text-sm text-muted-foreground">Share your best technical work</p>
          </div>
        </div>
        <Button onClick={addCodeSnippet} size="sm" className="gap-2">
          <Plus className="h-4 w-4" />
          Add
        </Button>
      </div>

      <div className="space-y-4">
        {data.map((snippet) => (
          <div key={snippet.id} className="p-4 border rounded-lg space-y-4 relative">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => removeCodeSnippet(snippet.id)}
              className="absolute top-2 right-2"
            >
              <Trash2 className="h-4 w-4" />
            </Button>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>File Name</Label>
                <Input
                  placeholder="example.js"
                  value={snippet.fileName}
                  onChange={(e) => updateCodeSnippet(snippet.id, "fileName", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>Language</Label>
                <Select
                  value={snippet.language}
                  onValueChange={(value) => updateCodeSnippet(snippet.id, "language", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select language" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="javascript">JavaScript</SelectItem>
                    <SelectItem value="typescript">TypeScript</SelectItem>
                    <SelectItem value="python">Python</SelectItem>
                    <SelectItem value="java">Java</SelectItem>
                    <SelectItem value="cpp">C++</SelectItem>
                    <SelectItem value="go">Go</SelectItem>
                    <SelectItem value="rust">Rust</SelectItem>
                    <SelectItem value="ruby">Ruby</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Repository (Optional)</Label>
                <Input
                  placeholder="my-awesome-project"
                  value={snippet.repo || ""}
                  onChange={(e) => updateCodeSnippet(snippet.id, "repo", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>URL (Optional)</Label>
                <Input
                  type="url"
                  placeholder="https://github.com/..."
                  value={snippet.url || ""}
                  onChange={(e) => updateCodeSnippet(snippet.id, "url", e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Caption</Label>
              <Textarea
                placeholder="Describe the code technically (e.g., 'Recursive algorithm for binary tree traversal with O(n) complexity')"
                value={snippet.caption || ""}
                onChange={(e) => updateCodeSnippet(snippet.id, "caption", e.target.value)}
                className="min-h-[60px]"
              />
            </div>

            <div className="space-y-2">
              <Label>Code Snippet</Label>
              <Textarea
                placeholder="// Your code here..."
                value={snippet.code}
                onChange={(e) => updateCodeSnippet(snippet.id, "code", e.target.value)}
                className="min-h-[200px] font-mono text-sm"
              />
            </div>
          </div>
        ))}

        {data.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            No code snippets added yet. Click "Add" or import from your portfolio.
          </div>
        )}
      </div>
    </Card>
  );
};
