import { createClient } from "@/lib/supabase/server";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Calendar, Tag, FileText, ClipboardCheck, Edit } from "lucide-react";
import { formatDate, formatCurrency, getDaysUntilExpiration } from "@/lib/utils";
import { addYears, isBefore } from "date-fns";
import type { Equipment, EquipmentType, Inspection, Invoice } from "@/types/database";
import { RetireButton } from "./retire-button";

const STATUS_LABELS: Record<string, string> = {
  ok: "OK", inspect_soon: "À inspecter", to_replace: "À remplacer", retired: "Hors service",
};
const STATUS_VARIANTS: Record<string, any> = {
  ok: "success", inspect_soon: "warning", to_replace: "danger", retired: "muted",
};

export default async function EquipmentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const [{ data: item }, { data: inspections }, { data: invoices }] = await Promise.all([
    supabase.from("equipment").select("*, equipment_types(*)").eq("id", id).eq("user_id", user!.id).single(),
    supabase.from("inspections").select("*").eq("equipment_id", id).order("inspection_date", { ascending: false }),
    supabase.from("invoices").select("*").eq("equipment_id", id),
  ]);

  if (!item) notFound();

  const eq = item as Equipment & { equipment_types: EquipmentType };
  const type = eq.equipment_types;

  const expiryDates: Date[] = [];
  if (type.max_lifetime_years && eq.manufacture_date) expiryDates.push(addYears(new Date(eq.manufacture_date), type.max_lifetime_years));
  if (type.max_use_lifetime_years && eq.first_use_date) expiryDates.push(addYears(new Date(eq.first_use_date), type.max_use_lifetime_years));
  const expiryDate = expiryDates.length ? expiryDates.reduce((a, b) => isBefore(a, b) ? a : b) : null;
  const daysLeft = expiryDate ? getDaysUntilExpiration(expiryDate) : null;

  return (
    <div className="p-6 max-w-3xl space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/equipment"><Button variant="ghost" size="icon"><ArrowLeft className="h-4 w-4" /></Button></Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{eq.brand} {eq.model}</h1>
            <p className="text-gray-500 text-sm">{type.name} · {type.norm_reference}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={STATUS_VARIANTS[eq.status]}>{STATUS_LABELS[eq.status]}</Badge>
          <Link href={`/equipment/${id}/edit`}><Button variant="outline" size="sm"><Edit className="h-4 w-4" />Modifier</Button></Link>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {/* Informations */}
        <Card>
          <CardHeader className="pb-3"><CardTitle className="text-base flex items-center gap-2"><Tag className="h-4 w-4" />Identification</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <Row label="Marque" value={eq.brand} />
            <Row label="Modèle" value={eq.model} />
            <Row label="N° série" value={eq.serial_number} />
            <Row label="Prix d'achat" value={eq.purchase_price ? formatCurrency(eq.purchase_price) : null} />
          </CardContent>
        </Card>

        {/* Dates */}
        <Card>
          <CardHeader className="pb-3"><CardTitle className="text-base flex items-center gap-2"><Calendar className="h-4 w-4" />Dates</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <Row label="Fabrication" value={formatDate(eq.manufacture_date)} />
            <Row label="Achat" value={formatDate(eq.purchase_date)} />
            <Row label="Mise en service" value={formatDate(eq.first_use_date)} />
            <Row
              label="Expiration"
              value={expiryDate ? (
                <span className={daysLeft !== null && daysLeft < 0 ? "text-red-600 font-semibold" : daysLeft !== null && daysLeft < 90 ? "text-orange-600 font-semibold" : ""}>
                  {formatDate(expiryDate.toISOString())}
                  {daysLeft !== null && daysLeft >= 0 && daysLeft < 90 && ` (dans ${daysLeft}j)`}
                  {daysLeft !== null && daysLeft < 0 && " — EXPIRÉ"}
                </span>
              ) : "—"}
            />
          </CardContent>
        </Card>
      </div>

      {/* Normes applicables */}
      <Card>
        <CardHeader className="pb-3"><CardTitle className="text-base">Règles légales applicables</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          <p className="text-sm"><span className="font-medium">Norme :</span> {type.norm_reference}</p>
          {type.max_lifetime_years && <p className="text-sm text-gray-600">Durée de vie max depuis fabrication : <strong>{type.max_lifetime_years} ans</strong></p>}
          {type.max_use_lifetime_years && <p className="text-sm text-gray-600">Durée de vie max depuis mise en service : <strong>{type.max_use_lifetime_years} ans</strong></p>}
          <p className="text-sm text-gray-600">Fréquence de vérification : <strong>tous les {type.inspection_interval_months} mois</strong></p>
          {type.retire_after_fall && <p className="text-sm font-medium text-red-700 bg-red-50 px-3 py-2 rounded-lg">Retirer du service immédiatement après une chute</p>}
          {type.description && <p className="text-sm text-gray-500 mt-2">{type.description}</p>}
        </CardContent>
      </Card>

      {/* Inspections */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <CardTitle className="text-base flex items-center gap-2"><ClipboardCheck className="h-4 w-4" />Historique inspections</CardTitle>
          <Link href={`/inspections/new?equipment_id=${id}`}><Button size="sm" variant="outline">+ Inspection</Button></Link>
        </CardHeader>
        <CardContent>
          {(inspections ?? []).length === 0 ? (
            <p className="text-sm text-gray-400 py-2">Aucune inspection enregistrée</p>
          ) : (
            <div className="space-y-2">
              {(inspections as Inspection[]).map((ins) => (
                <div key={ins.id} className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                  <div>
                    <p className="text-sm font-medium">{formatDate(ins.inspection_date)}</p>
                    {ins.inspector_name && <p className="text-xs text-gray-500">par {ins.inspector_name}</p>}
                  </div>
                  <div className="flex items-center gap-2">
                    {ins.next_inspection_date && <p className="text-xs text-gray-500">Prochaine : {formatDate(ins.next_inspection_date)}</p>}
                    <Badge variant={ins.result === "passed" ? "success" : ins.result === "failed" ? "danger" : "warning"}>
                      {ins.result === "passed" ? "Conforme" : ins.result === "failed" ? "Non conforme" : "Conditionnel"}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Factures */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <CardTitle className="text-base flex items-center gap-2"><FileText className="h-4 w-4" />Factures associées</CardTitle>
          <Link href={`/invoices/new?equipment_id=${id}`}><Button size="sm" variant="outline">+ Facture</Button></Link>
        </CardHeader>
        <CardContent>
          {(invoices ?? []).length === 0 ? (
            <p className="text-sm text-gray-400 py-2">Aucune facture associée</p>
          ) : (
            <div className="space-y-2">
              {(invoices as Invoice[]).map((inv) => (
                <div key={inv.id} className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                  <p className="text-sm font-medium">{inv.filename}</p>
                  <div className="flex items-center gap-3">
                    {inv.amount && <p className="text-sm font-medium">{formatCurrency(inv.amount)}</p>}
                    <a href={inv.file_url} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:underline">Voir</a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {eq.status !== "retired" && (
        <div className="flex justify-end">
          <RetireButton equipmentId={id} />
        </div>
      )}
    </div>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between py-1 border-b border-gray-50 last:border-0">
      <span className="text-sm text-gray-500">{label}</span>
      <span className="text-sm font-medium text-gray-900">{value ?? "—"}</span>
    </div>
  );
}
