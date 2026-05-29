import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, ClipboardCheck } from "lucide-react";
import { formatDate } from "@/lib/utils";
import type { Inspection } from "@/types/database";

const RESULT_LABELS: Record<string, string> = { passed: "Conforme", failed: "Non conforme", conditional: "Conditionnel" };
const RESULT_VARIANTS: Record<string, any> = { passed: "success", failed: "danger", conditional: "warning" };

export default async function InspectionsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data } = await supabase
    .from("inspections")
    .select("*, equipment(brand, model, equipment_types(name))")
    .eq("user_id", user!.id)
    .order("inspection_date", { ascending: false });

  const items = (data ?? []) as any[];

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Inspections</h1>
          <p className="text-gray-500 text-sm">{items.length} vérification{items.length !== 1 ? "s" : ""} enregistrée{items.length !== 1 ? "s" : ""}</p>
        </div>
        <Link href="/inspections/new"><Button><Plus className="h-4 w-4" />Nouvelle inspection</Button></Link>
      </div>

      {items.length === 0 ? (
        <Card><CardContent className="flex flex-col items-center py-16 text-center">
          <ClipboardCheck className="h-12 w-12 text-gray-300 mb-4" />
          <h3 className="font-semibold text-gray-700 mb-2">Aucune inspection</h3>
          <p className="text-gray-500 text-sm mb-4">Enregistrez les vérifications périodiques de vos EPI.</p>
          <Link href="/inspections/new"><Button>Enregistrer une inspection</Button></Link>
        </CardContent></Card>
      ) : (
        <div className="space-y-2">
          {items.map((ins) => (
            <Card key={ins.id}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="font-semibold text-sm">{ins.equipment?.brand} {ins.equipment?.model}</p>
                    <p className="text-xs text-gray-500">{ins.equipment?.equipment_types?.name}</p>
                    {ins.inspector_name && <p className="text-xs text-gray-400 mt-0.5">Vérificateur : {ins.inspector_name}</p>}
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">{formatDate(ins.inspection_date)}</p>
                    {ins.next_inspection_date && (
                      <p className="text-xs text-gray-500">Prochaine : {formatDate(ins.next_inspection_date)}</p>
                    )}
                  </div>
                  <Badge variant={RESULT_VARIANTS[ins.result]}>{RESULT_LABELS[ins.result]}</Badge>
                  {ins.certificate_url && (
                    <a href={ins.certificate_url} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:underline">Certificat</a>
                  )}
                </div>
                {ins.notes && <p className="text-xs text-gray-500 mt-2 pt-2 border-t">{ins.notes}</p>}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
