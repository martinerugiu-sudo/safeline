"use client";
import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
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
import type { EquipmentType } from "@/types/database";

export default function EditEquipmentPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [types, setTypes] = useState<EquipmentType[]>([]);
  const [form, setForm] = useState({
    equipment_type_id: "", brand: "", model: "", serial_number: "",
    manufacture_date: "", purchase_date: "", first_use_date: "",
    purchase_price: "", notes: "", status: "ok",
  });

  useEffect(() => {
    const supabase = createClient();
    setLoading(true);
    Promise.all([
      supabase.from("equipment_types").select("*").order("category"),
      supabase.from("equipment").select("*").eq("id", id).single(),
    ]).then(([{ data: t }, { data: eq }]) => {
      if (t) setTypes(t);
      if (eq) setForm({
        equipment_type_id: eq.equipment_type_id,
        brand: eq.brand,
        model: eq.model,
        serial_number: eq.serial_number ?? "",
        manufacture_date: eq.manufacture_date ?? "",
        purchase_date: eq.purchase_date ?? "",
        first_use_date: eq.first_use_date ?? "",
        purchase_price: eq.purchase_price?.toString() ?? "",
        notes: eq.notes ?? "",
        status: eq.status,
      });
      setLoading(false);
    });
  }, [id]);

  function update(field: string) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm((f) => ({ ...f, [field]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const supabase = createClient();
    const { error } = await supabase.from("equipment").update({
      equipment_type_id: form.equipment_type_id,
      brand: form.brand, model: form.model,
      serial_number: form.serial_number || null,
      manufacture_date: form.manufacture_date || null,
      purchase_date: form.purchase_date || null,
      first_use_date: form.first_use_date || null,
      purchase_price: form.purchase_price ? parseFloat(form.purchase_price) : null,
      notes: form.notes || null,
      status: form.status,
      updated_at: new Date().toISOString(),
    }).eq("id", id);
    if (error) {
      toast({ title: "Erreur", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Équipement mis à jour" });
      router.push(`/equipment/${id}`);
      router.refresh();
    }
    setSaving(false);
  }

  if (loading) return <div className="p-6 text-gray-500">Chargement…</div>;

  const categories = [...new Set(types.map((t) => t.category))];

  return (
    <div className="p-6 max-w-2xl">
      <Toaster />
      <div className="flex items-center gap-3 mb-6">
        <Link href={`/equipment/${id}`}><Button variant="ghost" size="icon"><ArrowLeft className="h-4 w-4" /></Button></Link>
        <h1 className="text-2xl font-bold text-gray-900">Modifier l'équipement</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader><CardTitle className="text-base">Identification</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1">
              <Label>Type d'équipement *</Label>
              <Select value={form.equipment_type_id} onValueChange={(v) => setForm((f) => ({ ...f, equipment_type_id: v }))}>
                <SelectTrigger><SelectValue placeholder="Sélectionner le type…" /></SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <div key={cat}>
                      <div className="px-2 py-1.5 text-xs font-semibold text-gray-400 uppercase">{cat}</div>
                      {types.filter((t) => t.category === cat).map((t) => (
                        <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                      ))}
                    </div>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1"><Label>Marque *</Label><Input value={form.brand} onChange={update("brand")} required /></div>
              <div className="space-y-1"><Label>Modèle *</Label><Input value={form.model} onChange={update("model")} required /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1"><Label>N° série</Label><Input value={form.serial_number} onChange={update("serial_number")} /></div>
              <div className="space-y-1">
                <Label>Statut</Label>
                <Select value={form.status} onValueChange={(v) => setForm((f) => ({ ...f, status: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ok">OK</SelectItem>
                    <SelectItem value="inspect_soon">À inspecter</SelectItem>
                    <SelectItem value="to_replace">À remplacer</SelectItem>
                    <SelectItem value="retired">Hors service</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Dates</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-1"><Label>Fabrication</Label><Input type="date" value={form.manufacture_date} onChange={update("manufacture_date")} /></div>
              <div className="space-y-1"><Label>Achat</Label><Input type="date" value={form.purchase_date} onChange={update("purchase_date")} /></div>
              <div className="space-y-1"><Label>Mise en service</Label><Input type="date" value={form.first_use_date} onChange={update("first_use_date")} /></div>
            </div>
            <div className="space-y-1"><Label>Prix d'achat (€)</Label><Input type="number" step="0.01" value={form.purchase_price} onChange={update("purchase_price")} /></div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Notes</CardTitle></CardHeader>
          <CardContent><Textarea value={form.notes} onChange={update("notes")} rows={3} /></CardContent>
        </Card>

        <div className="flex gap-3">
          <Link href={`/equipment/${id}`} className="flex-1"><Button variant="outline" className="w-full" type="button">Annuler</Button></Link>
          <Button type="submit" className="flex-1" disabled={saving}>
            {saving && <Loader2 className="h-4 w-4 animate-spin" />}
            Enregistrer
          </Button>
        </div>
      </form>
    </div>
  );
}
