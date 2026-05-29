"use client";
import { useEffect, useState, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/lib/use-toast";
import { Toaster } from "@/components/ui/toaster";
import { ArrowLeft, Loader2, Upload } from "lucide-react";
import Link from "next/link";
import type { Equipment } from "@/types/database";

export default function NewInvoicePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedEquipment = searchParams.get("equipment_id");
  const fileRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [file, setFile] = useState<File | null>(null);
  const [form, setForm] = useState({
    equipment_id: preselectedEquipment ?? "",
    amount: "",
    invoice_date: "",
    supplier: "",
  });

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return;
      supabase.from("equipment").select("id, brand, model").eq("user_id", user.id).order("brand").then(({ data }) => {
        if (data) setEquipment(data as Equipment[]);
      });
    });
  }, []);

  function update(field: string) {
    return (e: React.ChangeEvent<HTMLInputElement>) => setForm((f) => ({ ...f, [field]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!file) {
      toast({ title: "Fichier requis", description: "Sélectionnez le fichier de la facture.", variant: "destructive" });
      return;
    }
    setLoading(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    const ext = file.name.split(".").pop();
    const path = `${user!.id}/${Date.now()}.${ext}`;
    const { error: uploadError, data: uploadData } = await supabase.storage.from("invoices").upload(path, file);
    if (uploadError) {
      toast({ title: "Erreur upload", description: uploadError.message, variant: "destructive" });
      setLoading(false);
      return;
    }

    const { data: urlData } = supabase.storage.from("invoices").getPublicUrl(path);
    const { error } = await supabase.from("invoices").insert({
      user_id: user!.id,
      equipment_id: form.equipment_id || null,
      file_url: urlData.publicUrl,
      filename: file.name,
      amount: form.amount ? parseFloat(form.amount) : null,
      invoice_date: form.invoice_date || null,
      supplier: form.supplier || null,
    });

    if (error) {
      toast({ title: "Erreur", description: error.message, variant: "destructive" });
      setLoading(false);
      return;
    }
    toast({ title: "Facture enregistrée" });
    router.push("/invoices");
    router.refresh();
  }

  return (
    <div className="p-6 max-w-xl">
      <Toaster />
      <div className="flex items-center gap-3 mb-6">
        <Link href="/invoices"><Button variant="ghost" size="icon"><ArrowLeft className="h-4 w-4" /></Button></Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Ajouter une facture</h1>
          <p className="text-gray-500 text-sm">PDF ou image (JPG, PNG)</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <Card>
          <CardHeader><CardTitle className="text-base">Fichier</CardTitle></CardHeader>
          <CardContent>
            <div
              className="border-2 border-dashed border-gray-200 rounded-lg p-8 text-center cursor-pointer hover:border-blue-400 transition-colors"
              onClick={() => fileRef.current?.click()}
            >
              {file ? (
                <p className="text-sm font-medium text-blue-700">{file.name}</p>
              ) : (
                <>
                  <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-500">Cliquer ou déposer un fichier</p>
                  <p className="text-xs text-gray-400 mt-1">PDF, JPG, PNG — max 10 Mo</p>
                </>
              )}
            </div>
            <input ref={fileRef} type="file" accept=".pdf,.jpg,.jpeg,.png" className="hidden" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Informations</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1">
              <Label>Équipement associé</Label>
              <Select value={form.equipment_id} onValueChange={(v) => setForm((f) => ({ ...f, equipment_id: v }))}>
                <SelectTrigger><SelectValue placeholder="Sélectionner un EPI…" /></SelectTrigger>
                <SelectContent>
                  {equipment.map((e) => <SelectItem key={e.id} value={e.id}>{e.brand} {e.model}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label>Montant (€)</Label>
                <Input type="number" step="0.01" min="0" value={form.amount} onChange={update("amount")} placeholder="0.00" />
              </div>
              <div className="space-y-1">
                <Label>Date de facture</Label>
                <Input type="date" value={form.invoice_date} onChange={update("invoice_date")} />
              </div>
            </div>
            <div className="space-y-1">
              <Label>Fournisseur</Label>
              <Input value={form.supplier} onChange={update("supplier")} placeholder="Petzl, Aventure Verticale…" />
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-3">
          <Link href="/invoices" className="flex-1"><Button variant="outline" className="w-full" type="button">Annuler</Button></Link>
          <Button type="submit" className="flex-1" disabled={loading}>
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            Enregistrer
          </Button>
        </div>
      </form>
    </div>
  );
}
