export const dynamic = "force-dynamic";

import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, ChevronRight, AlertTriangle } from "lucide-react";
import { formatDate, getDaysUntilExpiration } from "@/lib/utils";
import type { Equipment, EquipmentType } from "@/types/database";
import { addYears, isBefore } from "date-fns";

function computeExpiry(e: Equipment & { equipment_types: EquipmentType }): string | null {
  const t = e.equipment_types;
  const candidates: Date[] = [];
  if (t.max_lifetime_years && e.manufacture_date)
    candidates.push(addYears(new Date(e.manufacture_date), t.max_lifetime_years));
  if (t.max_use_lifetime_years && e.first_use_date)
    candidates.push(addYears(new Date(e.first_use_date), t.max_use_lifetime_years));
  if (candidates.length === 0) return null;
  const earliest = candidates.reduce((a, b) => isBefore(a, b) ? a : b);
  return earliest.toISOString().split("T")[0];
}

const STATUS_LABELS: Record<string, string> = {
  ok: "OK", inspect_soon: "À inspecter", to_replace: "À remplacer", retired: "Hors service",
};
const STATUS_VARIANTS: Record<string, any> = {
  ok: "success", inspect_soon: "warning", to_replace: "danger", retired: "muted",
};

export default async function EquipmentPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data } = await supabase
    .from("equipment")
    .select("*, equipment_types(*)")
    .eq("user_id", user!.id)
    .order("status", { ascending: false });

  const items = (data ?? []) as (Equipment & { equipment_types: EquipmentType })[];

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Équipements</h1>
          <p className="text-gray-500 text-sm">{items.length} EPI enregistré{items.length !== 1 ? "s" : ""}</p>
        </div>
        <Link href="/equipment/new"><Button><Plus className="h-4 w-4" />Ajouter</Button></Link>
      </div>

      {items.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <AlertTriangle className="h-12 w-12 text-gray-300 mb-4" />
            <h3 className="font-semibold text-gray-700 mb-2">Aucun équipement enregistré</h3>
            <p className="text-gray-500 text-sm mb-4">Commencez par ajouter vos EPI pour suivre leurs dates d'expiration.</p>
            <Link href="/equipment/new"><Button>Ajouter mon premier EPI</Button></Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {items.map((item) => {
            const expiry = computeExpiry(item);
            const daysLeft = expiry ? getDaysUntilExpiration(new Date(expiry)) : null;
            return (
              <Link key={item.id} href={`/equipment/${item.id}`}>
                <Card className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-semibold text-gray-900 truncate">{item.brand} {item.model}</p>
                          <Badge variant={STATUS_VARIANTS[item.status]}>{STATUS_LABELS[item.status]}</Badge>
                        </div>
                        <p className="text-sm text-gray-500">{item.equipment_types?.name} · {item.equipment_types?.norm_reference}</p>
                        {item.serial_number && <p className="text-xs text-gray-400 mt-0.5">N° série : {item.serial_number}</p>}
                      </div>
                      <div className="text-right flex-shrink-0">
                        {expiry ? (
                          <>
                            <p className="text-xs text-gray-400">Expiration</p>
                            <p className={`text-sm font-medium ${daysLeft !== null && daysLeft < 0 ? "text-red-600" : daysLeft !== null && daysLeft < 90 ? "text-orange-600" : "text-gray-700"}`}>
                              {formatDate(expiry)}
                            </p>
                            {daysLeft !== null && daysLeft < 90 && daysLeft >= 0 && (
                              <p className="text-xs text-orange-500">dans {daysLeft}j</p>
                            )}
                            {daysLeft !== null && daysLeft < 0 && (
                              <p className="text-xs text-red-500">Expiré</p>
                            )}
                          </>
                        ) : (
                          <p className="text-xs text-gray-400">Inspection annuelle</p>
                        )}
                      </div>
                      <ChevronRight className="h-4 w-4 text-gray-400 flex-shrink-0" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
