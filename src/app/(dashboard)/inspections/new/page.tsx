"use client";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/lib/use-toast";
import { Toaster } from "@/components/ui/toaster";
import { ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import { addMonths, format } from "date-fns";
import type { Equipment, EquipmentType } from "@/types/database";

export default function NewInspectionPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedEquipment = searchParams.get("equipment_id");
  const [loading, setLoading] = useState(false);
  const [equipment, setEquipment] = useState<(Equipment & { equipment_types: EquipmentType })[]>([]);
  const [intervalMonths, setIntervalMonths] = useState(12);
  const [form, setForm] = useState({
    equipment_id: preselectedEquipment ?? "",
    inspection_date: format(new Date(), "yyyy-MM-dd"),
    result: "passed",
    inspector_name: "",
    next_inspection_date: format(addMonths(new Date(), 12), "yyyy-MM-dd"),
    notes: "",
  });

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return;
      supabase.from("equipment").select("id, brand, model, equipment_types(inspection_interval_months)").eq("user_id", user.id).order("brand").then(({ data }) => {
        if (data) setEquipment(data as any);
      });
    });
  }, []);

  useEffect(() => {
    const eq = equipment.find((e) => e.id === form.equipment_id);
    if (eq?.equipment_types) {
      const months = eq.equipment_types.inspection_interval_months;
      setIntervalMonths(months);
      setForm((f) => ({
        ...f,
        next_inspection_date: format(addMonths(new Date(f.inspection_date), months), "yyyy-MM-dd"),
      }));
    }
  }, [form.equipment_id, equipment]);

  function update(field: string) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setForm((f) => {
        const updated = { ...f, [field]: e.target.value };
        if (field === "inspection_date") {
          updated.next_inspection_date = format(addMonths(new Date(e.target.value), intervalMonths), "yyyy-MM-dd");
        }
        return updated;
      });
    };
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.equipment_id) {
      toast({ title: "EPI requis", description: "Sélectionnez l'équipement inspecté.", variant: "destructive" });
      return;
    }
    setLoading(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    const { error } = await supabase.from("inspections").insert({
      equipment_id: form.equipment_id,
      user_id: user!.id,
      inspection_date: form.inspection_date,
      result: form.result,
      inspector_name: form.inspector_name || null,
      next_inspection_date: form.next_inspection_date || null,
      notes: form.notes || null,
    });

    if (!error && form.result === "passed") {
      const nextStatus = "ok";
      await supabase.from("equipment").update({ status: nextStatus, updated_at: new Date().toISOString() }).eq("id", form.equipment_id);
    }
    if (!error && form.result === "failed") {
      await supabase.from("equipment").update({ status: "to_replace", updated_at: new Date().toISOString() }).eq("id", form.equipment_id);
    }

    if (error) {
      toast({ title: "Erreur", description: error.message, variant: "destructive" });
      setLoading(false);
      return;
    }
    toast({ title: "Inspection enregistrée" });
    router.push("/inspections");
    router.refresh();
  }

  return (
    <div className="p-6 max-w-xl">
      <Toaster />
      <div className="flex items-center gap-3 mb-6">
        <Link href="/inspections"><Button variant="ghost" size="icon"><ArrowLeft className="h-4 w-4" /></Button></Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Nouvelle inspection</h1>
          <p className="text-gray-500 text-sm">Enregistrer une vérification périodique</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <Card>
          <CardHeader><CardTitle className="text-base">Équipement & résultat</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1">
              <Label>Équipement *</Label>
              <Select value={form.equipment_id} onValueChange={(v) => setForm((f) => ({ ...f, equipment_id: v }))}>
                <SelectTrigger><SelectValue placeholder="Sélectionner un EPI…" /></SelectTrigger>
                <SelectContent>
                  {equipment.map((e) => <SelectItem key={e.id} value={e.id}>{e.brand} {e.model}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label>Résultat *</Label>
              <Select value={form.result} onValueChange={(v) => setForm((f) => ({ ...f, result: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="passed">Conforme</SelectItem>
                  <SelectItem value="conditional">Conditionnel (utilisation sous réserve)</SelectItem>
                  <SelectItem value="failed">Non conforme — À retirer du service</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Dates & vérificateur</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label>Date d'inspection *</Label>
                <Input type="date" value={form.inspection_date} onChange={update("inspection_date")} required />
              </div>
              <div className="space-y-1">
                <Label>Prochaine inspection</Label>
                <Input type="date" value={form.next_inspection_date} onChange={update("next_inspection_date")} />
              </div>
            </div>
            <div className="space-y-1">
              <Label>Nom du vérificateur</Label>
              <Input value={form.inspector_name} onChange={update("inspector_name")} placeholder="Prénom Nom" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Observations</CardTitle></CardHeader>
          <CardContent>
            <Textarea value={form.notes} onChange={update("notes")} placeholder="Usure, remplacement de pièce, restriction d'usage…" rows={3} />
          </CardContent>
        </Card>

        <div className="flex gap-3">
          <Link href="/inspections" className="flex-1"><Button variant="outline" className="w-full" type="button">Annuler</Button></Link>
          <Button type="submit" className="flex-1" disabled={loading}>
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            Enregistrer
          </Button>
        </div>
      </form>
    </div>
  );
}
