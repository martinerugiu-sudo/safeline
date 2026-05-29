import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, FileText, ExternalLink } from "lucide-react";
import { formatDate, formatCurrency } from "@/lib/utils";
import type { Invoice } from "@/types/database";

export default async function InvoicesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data } = await supabase
    .from("invoices")
    .select("*, equipment(brand, model)")
    .eq("user_id", user!.id)
    .order("created_at", { ascending: false });

  const items = (data ?? []) as (Invoice & { equipment?: { brand: string; model: string } | null })[];
  const total = items.reduce((sum, i) => sum + (i.amount ?? 0), 0);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Factures</h1>
          <p className="text-gray-500 text-sm">{items.length} facture{items.length !== 1 ? "s" : ""} · Total : {formatCurrency(total)}</p>
        </div>
        <Link href="/invoices/new"><Button><Plus className="h-4 w-4" />Ajouter</Button></Link>
      </div>

      {items.length === 0 ? (
        <Card><CardContent className="flex flex-col items-center py-16 text-center">
          <FileText className="h-12 w-12 text-gray-300 mb-4" />
          <h3 className="font-semibold text-gray-700 mb-2">Aucune facture</h3>
          <p className="text-gray-500 text-sm mb-4">Archivez vos justificatifs d'achat d'EPI.</p>
          <Link href="/invoices/new"><Button>Ajouter une facture</Button></Link>
        </CardContent></Card>
      ) : (
        <div className="space-y-2">
          {items.map((inv) => (
            <Card key={inv.id} className="hover:shadow-sm transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <FileText className="h-8 w-8 text-blue-500 bg-blue-50 p-1.5 rounded-lg flex-shrink-0" />
                    <div>
                      <p className="font-medium text-sm">{inv.filename}</p>
                      {inv.equipment && <p className="text-xs text-gray-500">{inv.equipment.brand} {inv.equipment.model}</p>}
                      {inv.supplier && <p className="text-xs text-gray-400">{inv.supplier}</p>}
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      {inv.amount && <p className="font-semibold text-sm">{formatCurrency(inv.amount)}</p>}
                      <p className="text-xs text-gray-400">{formatDate(inv.invoice_date)}</p>
                    </div>
                    <a href={inv.file_url} target="_blank" rel="noopener noreferrer">
                      <Button variant="outline" size="sm"><ExternalLink className="h-3.5 w-3.5" /></Button>
                    </a>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
