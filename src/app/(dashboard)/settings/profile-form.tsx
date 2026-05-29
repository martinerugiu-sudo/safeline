"use client";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { toast } from "@/lib/use-toast";
import { Toaster } from "@/components/ui/toaster";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

export function ProfileForm({ profile, email }: { profile: any; email: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    full_name: profile?.full_name ?? "",
    phone: profile?.phone ?? "",
  });

  function update(field: string) {
    return (e: React.ChangeEvent<HTMLInputElement>) => setForm((f) => ({ ...f, [field]: e.target.value }));
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    const { error } = await supabase.from("profiles").update({ full_name: form.full_name, phone: form.phone || null, updated_at: new Date().toISOString() }).eq("user_id", user!.id);
    if (error) {
      toast({ title: "Erreur", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Profil mis à jour" });
      router.refresh();
    }
    setLoading(false);
  }

  return (
    <>
      <Toaster />
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Profil</CardTitle>
          <CardDescription>Vos informations personnelles</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSave} className="space-y-4">
            <div className="space-y-1">
              <Label>Nom complet</Label>
              <Input value={form.full_name} onChange={update("full_name")} placeholder="Jean Dupont" />
            </div>
            <div className="space-y-1">
              <Label>Téléphone</Label>
              <Input value={form.phone} onChange={update("phone")} placeholder="06 12 34 56 78" type="tel" />
            </div>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              Enregistrer
            </Button>
          </form>
        </CardContent>
      </Card>
    </>
  );
}
