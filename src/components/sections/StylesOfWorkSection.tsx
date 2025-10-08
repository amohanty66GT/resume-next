import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Workflow } from "lucide-react";
import { CareerCardData } from "../CareerCardBuilder";

interface StylesOfWorkSectionProps {
  data: CareerCardData["stylesOfWork"];
  onChange: (stylesOfWork: CareerCardData["stylesOfWork"]) => void;
}

const SURVEY_QUESTIONS = [
  {
    id: "1",
    question: "Problem-Solving Approach",
    prompt: "When facing a new, undefined problem, my first instinct is to…",
    options: [
      { value: "A", label: "Start experimenting immediately and learn by doing" },
      { value: "B", label: "Research similar examples before acting" },
      { value: "C", label: "Ask teammates for input before deciding" },
      { value: "D", label: "Wait for clear direction before proceeding" },
    ],
  },
  {
    id: "2",
    question: "Decision-Making Speed",
    prompt: "I'm most comfortable making decisions when…",
    options: [
      { value: "A", label: "I have 70% of the data — the rest I'll infer" },
      { value: "B", label: "I have complete clarity and verified data" },
      { value: "C", label: "I can validate assumptions with others first" },
      { value: "D", label: "The decision is reversible if wrong" },
    ],
  },
  {
    id: "3",
    question: "Initiative & Independence",
    prompt: "When I'm assigned a task I don't know how to do, I…",
    options: [
      { value: "A", label: "Teach myself quickly through research" },
      { value: "B", label: "Ask for training or mentorship" },
      { value: "C", label: "Attempt it, then ask for feedback" },
      { value: "D", label: "Wait until someone explains it" },
    ],
  },
  {
    id: "4",
    question: "Comfort with Ambiguity",
    prompt: "In ambiguous or fast-changing startup environments, I feel…",
    options: [
      { value: "A", label: "Energized — I thrive on uncertainty" },
      { value: "B", label: "Neutral — I can adapt as needed" },
      { value: "C", label: "Stressed — I prefer defined structure" },
    ],
  },
  {
    id: "5",
    question: "Trade-Off Handling",
    prompt: "When faced with two equally valid solutions, I usually…",
    options: [
      { value: "A", label: "Pick quickly and iterate later" },
      { value: "B", label: "Analyze deeply before committing" },
      { value: "C", label: "Ask for a second opinion" },
      { value: "D", label: "Combine both options experimentally" },
    ],
  },
  {
    id: "6",
    question: "Communication Style",
    prompt: "Preferred way to communicate progress in a team:",
    options: [
      { value: "A", label: "Short, async updates (Slack/Notion)" },
      { value: "B", label: "Real-time discussions (calls/standups)" },
      { value: "C", label: "Written documentation and reasoning" },
      { value: "D", label: "Hybrid — async first, sync when blocked" },
    ],
  },
  {
    id: "7",
    question: "Ownership Mentality",
    prompt: "When a project I'm leading goes off track, I…",
    options: [
      { value: "A", label: "Take full responsibility and fix it fast" },
      { value: "B", label: "Share the issue with the team to brainstorm" },
      { value: "C", label: "Wait for a manager or founder to step in" },
    ],
  },
  {
    id: "8",
    question: "Learning Mindset",
    prompt: "How do you typically approach learning new tools or frameworks?",
    options: [
      { value: "A", label: "Dive in and learn by experimenting" },
      { value: "B", label: "Study documentation before using" },
      { value: "C", label: "Wait until needed for a project" },
    ],
  },
  {
    id: "9",
    question: "Adaptability to Change",
    prompt: "If priorities shift mid-project, I…",
    options: [
      { value: "A", label: "Re-scope fast and pivot" },
      { value: "B", label: "Reconfirm goals before continuing" },
      { value: "C", label: "Stick to the original plan to avoid confusion" },
    ],
  },
  {
    id: "10",
    question: "Motivation Driver",
    prompt: "I'm most motivated when…",
    options: [
      { value: "A", label: "Solving challenging problems" },
      { value: "B", label: "Seeing real-world impact" },
      { value: "C", label: "Learning and growing fast" },
      { value: "D", label: "Receiving recognition or rewards" },
    ],
  },
];

export const StylesOfWorkSection = ({ data, onChange }: StylesOfWorkSectionProps) => {
  const handleAnswerChange = (questionId: string, answer: string, questionText: string) => {
    const existingIndex = data.findIndex((item) => item.id === questionId);
    
    if (existingIndex >= 0) {
      const updated = [...data];
      updated[existingIndex] = {
        id: questionId,
        question: questionText,
        selectedAnswer: answer,
      };
      onChange(updated);
    } else {
      onChange([
        ...data,
        {
          id: questionId,
          question: questionText,
          selectedAnswer: answer,
        },
      ]);
    }
  };

  const getSelectedAnswer = (questionId: string) => {
    return data.find((item) => item.id === questionId)?.selectedAnswer || "";
  };

  return (
    <Card className="p-6 shadow-[var(--shadow-card)]">
      <div className="flex items-center gap-3 mb-6">
        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
          <Workflow className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h2 className="text-xl font-bold">Styles of Work</h2>
          <p className="text-sm text-muted-foreground">Answer these questions about your work style</p>
        </div>
      </div>

      <div className="space-y-6">
        {SURVEY_QUESTIONS.map((question, index) => (
          <div key={question.id} className="p-4 border rounded-lg space-y-3">
            <div className="space-y-1">
              <h3 className="font-semibold text-foreground">
                {index + 1}. {question.question}
              </h3>
              <p className="text-sm text-muted-foreground">{question.prompt}</p>
            </div>

            <RadioGroup
              value={getSelectedAnswer(question.id)}
              onValueChange={(value) => handleAnswerChange(question.id, value, question.question)}
            >
              <div className="space-y-2">
                {question.options.map((option) => (
                  <div key={option.value} className="flex items-start space-x-2">
                    <RadioGroupItem value={option.value} id={`${question.id}-${option.value}`} />
                    <Label
                      htmlFor={`${question.id}-${option.value}`}
                      className="font-normal cursor-pointer leading-relaxed"
                    >
                      ({option.value}) {option.label}
                    </Label>
                  </div>
                ))}
              </div>
            </RadioGroup>
          </div>
        ))}
      </div>
    </Card>
  );
};
