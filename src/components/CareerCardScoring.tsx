import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Loader2, Award, TrendingUp, TrendingDown } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { CareerCardData } from "./CareerCardBuilder";

interface ScoringResult {
  overallScore: number;
  categoryScores: {
    technicalSkills: { score: number; feedback: string };
    experience: { score: number; feedback: string };
    culturalFit: { score: number; feedback: string };
    projectAlignment: { score: number; feedback: string };
  };
  strengths: string[];
  improvements: string[];
  overallFeedback: string;
}

interface CareerCardScoringProps {
  cardData: CareerCardData;
}

export const CareerCardScoring = ({ cardData }: CareerCardScoringProps) => {
  const [companyDescription, setCompanyDescription] = useState("");
  const [roleDescription, setRoleDescription] = useState("");
  const [isScoring, setIsScoring] = useState(false);
  const [scoringResult, setScoringResult] = useState<ScoringResult | null>(null);
  const { toast } = useToast();

  const handleScore = async () => {
    if (!companyDescription.trim() || !roleDescription.trim()) {
      toast({
        title: "Missing Information",
        description: "Please provide both company and role descriptions",
        variant: "destructive",
      });
      return;
    }

    setIsScoring(true);
    setScoringResult(null);

    try {
      const { data, error } = await supabase.functions.invoke("score-career-card", {
        body: {
          careerCardData: cardData,
          companyDescription,
          roleDescription,
        },
      });

      if (error) throw error;

      setScoringResult(data);
      toast({
        title: "Scoring Complete",
        description: "Your career card has been analyzed",
      });
    } catch (error) {
      console.error("Error scoring career card:", error);
      toast({
        title: "Scoring Failed",
        description: error instanceof Error ? error.message : "Failed to score career card",
        variant: "destructive",
      });
    } finally {
      setIsScoring(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const getScoreBadge = (score: number) => {
    if (score >= 80) return "Excellent";
    if (score >= 60) return "Good";
    if (score >= 40) return "Fair";
    return "Needs Improvement";
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5" />
            Score Your Career Card
          </CardTitle>
          <CardDescription>
            Get AI-powered feedback on how well your career card aligns with a specific role and company
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="company">Company Description</Label>
            <Textarea
              id="company"
              placeholder="Describe the company, its culture, values, and what it does..."
              value={companyDescription}
              onChange={(e) => setCompanyDescription(e.target.value)}
              rows={4}
              className="resize-none"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="role">Role Description</Label>
            <Textarea
              id="role"
              placeholder="Paste the full job description including requirements, responsibilities, and qualifications..."
              value={roleDescription}
              onChange={(e) => setRoleDescription(e.target.value)}
              rows={6}
              className="resize-none"
            />
          </div>

          <Button
            onClick={handleScore}
            disabled={isScoring || !companyDescription.trim() || !roleDescription.trim()}
            className="w-full"
          >
            {isScoring ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Analyzing...
              </>
            ) : (
              "Score My Career Card"
            )}
          </Button>
        </CardContent>
      </Card>

      {scoringResult && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Scoring Results</CardTitle>
              <div className="text-right">
                <div className={`text-4xl font-bold ${getScoreColor(scoringResult.overallScore)}`}>
                  {scoringResult.overallScore}%
                </div>
                <Badge variant="secondary">{getScoreBadge(scoringResult.overallScore)}</Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Category Breakdown</h3>
              
              {Object.entries(scoringResult.categoryScores).map(([category, data]) => (
                <div key={category} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="capitalize">
                      {category.replace(/([A-Z])/g, ' $1').trim()}
                    </Label>
                    <span className={`font-semibold ${getScoreColor(data.score)}`}>
                      {data.score}%
                    </span>
                  </div>
                  <Progress value={data.score} className="h-2" />
                  <p className="text-sm text-muted-foreground">{data.feedback}</p>
                </div>
              ))}
            </div>

            <div className="space-y-3">
              <h3 className="font-semibold text-lg flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-green-600" />
                Key Strengths
              </h3>
              <ul className="space-y-2">
                {scoringResult.strengths.map((strength, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="text-green-600 mt-1">✓</span>
                    <span className="text-sm">{strength}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="space-y-3">
              <h3 className="font-semibold text-lg flex items-center gap-2">
                <TrendingDown className="h-5 w-5 text-orange-600" />
                Areas for Improvement
              </h3>
              <ul className="space-y-2">
                {scoringResult.improvements.map((improvement, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="text-orange-600 mt-1">→</span>
                    <span className="text-sm">{improvement}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="space-y-2 pt-4 border-t">
              <h3 className="font-semibold text-lg">Overall Feedback</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {scoringResult.overallFeedback}
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
