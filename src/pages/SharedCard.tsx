import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { CareerCardPreview } from "@/components/CareerCardPreview";
import { CareerCardData } from "@/components/CareerCardBuilder";
import { Loader2 } from "lucide-react";

const SharedCard = () => {
  const { id } = useParams<{ id: string }>();
  const [cardData, setCardData] = useState<CareerCardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCard = async () => {
      if (!id) {
        setError("No card ID provided");
        setLoading(false);
        return;
      }

      try {
        const { data, error: fetchError } = await supabase
          .from("career_cards")
          .select("card_data")
          .eq("id", id)
          .single();

        if (fetchError) throw fetchError;

        if (data && data.card_data) {
          setCardData(data.card_data as unknown as CareerCardData);
        } else {
          setError("Card not found");
        }
      } catch (err) {
        console.error("Error fetching card:", err);
        setError("Failed to load career card");
      } finally {
        setLoading(false);
      }
    };

    fetchCard();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[hsl(var(--editor-bg))] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading career card...</p>
        </div>
      </div>
    );
  }

  if (error || !cardData) {
    return (
      <div className="min-h-screen bg-[hsl(var(--editor-bg))] flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl text-destructive mb-2">⚠️ {error || "Card not found"}</p>
          <p className="text-muted-foreground">This career card may have been removed or the link is invalid.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[hsl(var(--editor-bg))] py-8">
      <div className="container mx-auto px-4">
        <CareerCardPreview data={cardData} />
      </div>
    </div>
  );
};

export default SharedCard;
