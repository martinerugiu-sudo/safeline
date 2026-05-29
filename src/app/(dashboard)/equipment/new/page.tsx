"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
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

export default function NewEquipmentPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [types, setTypes] = useState<EquipmentType[]>([]);
  const [form, setForm] = useState({
    equipment_type_id: "",
    brand: "",
    model: "",
    serial_number: "",
    manufacture_date: "",
    purchase_date: "",
    first_use_date: "",
    purchase_price: "",
    notes: "",
  });

  useEffect(() => {
    const supabase = createClient();
    supabase.from("equipment_types").select("*").order("category").then(({ data }) => {
      if (data) setTypes(data);
    });
  }, []);

  function update(field: string) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm((f) => ({ ...f, [field]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.equipment_type_id) {
      toast({ title: "Type requis", description: "Sélectionnez le type d'équipement.", variant: "destructive" });
      return;
    }
    setLoading(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    const { error } = await supabase.from("equipment").insert({
      user_id: user!.id,
      equipment_type_id: form.equipment_type_id,
      brand: form.brand,
      model: form.model,
      serial_number: form.serial_number || null,
      manufacture_date: form.manufacture_date || null,
      purchase_date: form.purchase_date || null,
      first_use_date: form.first_use_date || null,
      purchase_price: form.purchase_price ? parseFloat(form.purchase_price) : null,
      notes: form.notes || null,
      status: "ok",
    });
    if (error) {
      toast({ title: "Erreur", description: error.message, variant: "destructive" });
      setLoading(false);
      return;
    }
    toast({ title: "Équipement ajouté !", description: `${form.brand} ${form.model} a bien été enregistré dans votre inventaire.` });
    router.push("/equipment");
    router.refresh();
  }

  const categories = [...new Set(types.map((t) => t.category))];

  return (
    <div className="p-6 max-w-2xl">
      <Toaster />
      <div className="flex items-center gap-3 mb-6">
        <Link href="/equipment"><Button variant="ghost" size="icon"><ArrowLeft className="h-4 w-4" /></Button></Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Nouvel équipement</h1>
          <p className="text-gray-500 text-sm">Enregistrez un EPI dans votre inventaire</p>
        </div>
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
                      <div className="px-2 py-1.5 text-xs font-semibold text-gray-400 uppercase tracking-wide">{cat}</div>
                      {types.filter((t) => t.category === cat).map((t) => (
                        <SelectItem key={t.id} value={t.id}>
                          {t.name} <span className="text-gray-400 ml-1">({t.norm_reference})</span>
                        </SelectItem>
                      ))}
                    </div>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label>Marque *</Label>
                <Input value={form.brand} onChange={update("brand")} placeholder="Petzl, Beal, CAMP…" required />
              </div>
              <div className="space-y-1">
                <Label>Modèle *</Label>
                <Input value={form.model} onChange={update("model")} placeholder="Avao Bod Croll…" required />
              </div>
            </div>
            <div className="space-y-1">
              <Label>Numéro de série</Label>
              <Input value={form.serial_number} onChange={update("serial_number")} placeholder="SN-XXXX-XXXX" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Dates clés</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-1">
                <Label>Date fabrication</Label>
                <Input type="date" value={form.manufacture_date} onChange={update("manufacture_date")} />
              </div>
              <div className="space-y-1">
                <Label>Date d'achat</Label>
                <Input type="date" value={form.purchase_date} onChange={update("purchase_date")} />
              </div>
              <div className="space-y-1">
                <Label>Mise en service</Label>
                <Input type="date" value={form.first_use_date} onChange={update("first_use_date")} />
              </div>
            </div>
            <div className="space-y-1">
              <Label>Prix d'achat (€)</Label>
              <Input type="number" step="0.01" min="0" value={form.purchase_price} onChange={update("purchase_price")} placeholder="0.00" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Notes</CardTitle></CardHeader>
          <CardContent>
            <Textarea value={form.notes} onChange={update("notes")} placeholder="Observations, conditions d'utilisation particulières…" rows={3} />
          </CardContent>
        </Card>

        <div className="flex gap-3">
          <Link href="/equipment" className="flex-1"><Button variant="outline" className="w-full" type="button">Annuler</Button></Link>
          <Button type="submit" className="flex-1" disabled={loading}>
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            Enregistrer l'EPI
          </Button>
        </div>
      </form>
    </div>
  );
}
