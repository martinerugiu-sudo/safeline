"use client";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/lib/use-toast";
import { Toaster } from "@/components/ui/toaster";
import { Loader2, UserPlus } from "lucide-react";
import { useRouter } from "next/navigation";

export function InviteForm({ organizationId }: { organizationId: string }) {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const router = useRouter();

  async function handleInvite(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const supabase = createClient();
    const token = crypto.randomUUID();
    const { error } = await supabase.from("organization_members").insert({
      organization_id: organizationId,
      invited_email: email,
      invite_token: token,
      role: "member",
    });
    if (error) {
      toast({ title: "Erreur", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Invitation envoyée", description: `Un email a été envoyé à ${email}` });
      setEmail("");
      router.refresh();
    }
    setLoading(false);
  }

  return (
    <>
      <Toaster />
      <Card>
        <CardHeader><CardTitle className="text-base flex items-center gap-2"><UserPlus className="h-4 w-4" />Inviter un membre</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={handleInvite} className="flex gap-3">
            <div className="flex-1 space-y-1">
              <Label>Email du cordiste</Label>
              <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="collegue@exemple.fr" required />
            </div>
            <div className="flex items-end">
              <Button type="submit" disabled={loading}>
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserPlus className="h-4 w-4" />}
                Inviter
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </>
  );
}
