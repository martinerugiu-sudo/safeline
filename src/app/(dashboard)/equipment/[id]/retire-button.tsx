"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { toast } from "@/lib/use-toast";
import { XCircle, Loader2 } from "lucide-react";

export function RetireButton({ equipmentId }: { equipmentId: string }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleRetire() {
    if (!confirm("Mettre cet équipement hors service ? Cette action signifie qu'il ne sera plus utilisé (ex: après une chute).")) return;
    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.from("equipment").update({ status: "retired", updated_at: new Date().toISOString() }).eq("id", equipmentId);
    if (error) {
      toast({ title: "Erreur", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Équipement retiré du service" });
      router.refresh();
    }
    setLoading(false);
  }

  return (
    <Button variant="destructive" onClick={handleRetire} disabled={loading}>
      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <XCircle className="h-4 w-4" />}
      Mettre hors service
    </Button>
  );
}
