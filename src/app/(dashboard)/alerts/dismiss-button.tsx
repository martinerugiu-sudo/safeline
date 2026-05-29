"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { BellOff, Loader2 } from "lucide-react";

export function DismissButton({ alertId }: { alertId: string }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function dismiss() {
    setLoading(true);
    const supabase = createClient();
    await supabase.from("alerts").update({ dismissed_at: new Date().toISOString() }).eq("id", alertId);
    router.refresh();
    setLoading(false);
  }

  return (
    <Button variant="ghost" size="icon" onClick={dismiss} disabled={loading} title="Ignorer">
      {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <BellOff className="h-3.5 w-3.5 text-gray-400" />}
    </Button>
  );
}
