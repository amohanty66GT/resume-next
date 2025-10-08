import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Code2, Plus, Trash2, Link as LinkIcon, Loader2 } from "lucide-react";
import { CareerCardData } from "../CareerCardBuilder";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { z } from "zod";

interface CodeShowcaseSectionProps {
  data: CareerCardData["codeShowcase"];
  onChange: (codeShowcase: CareerCardData["codeShowcase"]) => void;
}

export const CodeShowcaseSection = ({ data, onChange }: CodeShowcaseSectionProps) => {
  const [portfolioUrl, setPortfolioUrl] = useState("");
  const [isParsingPortfolio, setIsParsingPortfolio] = useState(false);
  const [codeFiles, setCodeFiles] = useState<any[]>([]);
  const [selectedCodeFiles, setSelectedCodeFiles] = useState<Set<string>>(new Set());

  const urlSchema = z.string().url({ message: "Please enter a valid URL" });

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

  const handlePortfolioSubmit = async () => {
    const trimmedUrl = portfolioUrl.trim();
    
    if (!trimmedUrl) {
      toast.error("Please enter a portfolio URL");
      return;
    }

    const validation = urlSchema.safeParse(trimmedUrl);
    if (!validation.success) {
      toast.error("Please enter a valid URL (e.g., https://github.com/username)");
      return;
    }

    try {
      setIsParsingPortfolio(true);
      toast.loading("Fetching code from portfolio...");

      const { supabase } = await import("@/integrations/supabase/client");

      const { data: responseData, error } = await supabase.functions.invoke('parse-portfolio', {
        body: { portfolioUrl: trimmedUrl }
      });

      if (error) {
        console.error('Error parsing portfolio:', error);
        throw error;
      }

      if (responseData?.success && responseData?.codeFiles) {
        setCodeFiles(responseData.codeFiles || []);
        setSelectedCodeFiles(new Set());
        toast.success(`Found ${responseData.codeFiles.length} code files! Select which ones to import.`);
      } else {
        throw new Error(responseData?.error || 'Failed to parse portfolio');
      }
    } catch (error: any) {
      console.error('Error processing portfolio:', error);
      toast.error(error.message || "Failed to parse portfolio URL");
    } finally {
      setIsParsingPortfolio(false);
    }
  };

  const toggleCodeFileSelection = (filePath: string) => {
    setSelectedCodeFiles(prev => {
      const newSet = new Set(prev);
      if (newSet.has(filePath)) {
        newSet.delete(filePath);
      } else {
        newSet.add(filePath);
      }
      return newSet;
    });
  };

  const handleImportSelectedCode = () => {
    if (selectedCodeFiles.size === 0) {
      toast.error("Please select at least one code file");
      return;
    }

    const newCodeSnippets = Array.from(selectedCodeFiles).map(filePath => {
      const file = codeFiles.find(f => f.path === filePath);
      return {
        id: Math.random().toString(36).substr(2, 9),
        fileName: file.name,
        language: file.language,
        code: file.content,
        caption: "",
        repo: file.repo,
        url: file.url,
      };
    });

    onChange([...data, ...newCodeSnippets]);
    toast.success(`Imported ${newCodeSnippets.length} code snippet(s)`);
    setCodeFiles([]);
    setSelectedCodeFiles(new Set());
    setPortfolioUrl("");
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
          Add Manually
        </Button>
      </div>

      {/* GitHub Portfolio Import */}
      <div className="mb-6 p-4 border rounded-lg bg-muted/30">
        <div className="space-y-4">
          <div>
            <Label htmlFor="portfolio-url" className="flex items-center gap-2">
              <LinkIcon className="h-4 w-4" />
              Import from GitHub Portfolio
            </Label>
            <p className="text-xs text-muted-foreground mt-1">
              Paste your GitHub URL to automatically import code snippets from your repositories
            </p>
          </div>
          <div className="flex gap-2">
            <Input
              id="portfolio-url"
              type="url"
              placeholder="https://github.com/username"
              value={portfolioUrl}
              onChange={(e) => setPortfolioUrl(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handlePortfolioSubmit();
                }
              }}
              className="flex-1"
            />
            <Button 
              onClick={handlePortfolioSubmit}
              disabled={!portfolioUrl.trim() || isParsingPortfolio}
              size="sm"
            >
              {isParsingPortfolio ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Fetching...
                </>
              ) : (
                "Fetch Code"
              )}
            </Button>
          </div>

          {codeFiles.length > 0 && (
            <div className="space-y-3 pt-4 border-t">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-sm">
                  Found {codeFiles.length} code file(s)
                </h3>
                <Button 
                  onClick={handleImportSelectedCode}
                  size="sm"
                  variant="outline"
                  disabled={selectedCodeFiles.size === 0}
                >
                  Import Selected ({selectedCodeFiles.size})
                </Button>
              </div>
              <div className="space-y-2 max-h-[300px] overflow-auto">
                {codeFiles.map((file: any, idx: number) => (
                  <div 
                    key={idx} 
                    className="flex items-start gap-3 p-3 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                    onClick={() => toggleCodeFileSelection(file.path)}
                  >
                    <Checkbox 
                      checked={selectedCodeFiles.has(file.path)}
                      onCheckedChange={() => toggleCodeFileSelection(file.path)}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-sm">{file.name}</p>
                        <span className="text-xs text-muted-foreground">({file.language})</span>
                      </div>
                      <p className="text-xs text-muted-foreground">{file.repo}</p>
                      <pre className="mt-2 text-xs bg-background p-2 rounded overflow-x-auto">
                        <code>{file.content.slice(0, 200)}...</code>
                      </pre>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
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
