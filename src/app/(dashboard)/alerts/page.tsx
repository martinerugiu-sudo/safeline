import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Bell, BellOff } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { DismissButton } from "./dismiss-button";

export default async function AlertsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const [{ data: active }, { data: dismissed }] = await Promise.all([
    supabase.from("alerts").select("*, equipment(id, brand, model, equipment_types(name))").eq("user_id", user!.id).is("dismissed_at", null).order("due_date"),
    supabase.from("alerts").select("*, equipment(id, brand, model, equipment_types(name))").eq("user_id", user!.id).not("dismissed_at", "is", null).order("dismissed_at", { ascending: false }).limit(10),
  ]);

  const activeAlerts = (active ?? []) as any[];
  const dismissedAlerts = (dismissed ?? []) as any[];

  const ALERT_TYPE_LABELS: Record<string, string> = {
    expiration: "Expiration EPI",
    inspection: "Inspection due",
    training: "Formation à renouveler",
  };

  function urgencyVariant(dueDate: string): any {
    const days = Math.ceil((new Date(dueDate).getTime() - Date.now()) / 86400000);
    if (days < 0) return "danger";
    if (days < 7) return "danger";
    if (days < 30) return "warning";
    return "secondary";
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Alertes</h1>
        <p className="text-gray-500 text-sm">{activeAlerts.length} alerte{activeAlerts.length !== 1 ? "s" : ""} active{activeAlerts.length !== 1 ? "s" : ""}</p>
      </div>

      {activeAlerts.length === 0 ? (
        <Card><CardContent className="flex flex-col items-center py-16 text-center">
          <Bell className="h-12 w-12 text-green-300 mb-4" />
          <h3 className="font-semibold text-gray-700 mb-2">Aucune alerte active</h3>
          <p className="text-gray-500 text-sm">Tous vos équipements sont en règle.</p>
        </CardContent></Card>
      ) : (
        <div className="space-y-2">
          {activeAlerts.map((alert) => {
            const days = Math.ceil((new Date(alert.due_date).getTime() - Date.now()) / 86400000);
            return (
              <Card key={alert.id} className="border-l-4 border-l-orange-400">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <Link href={`/equipment/${alert.equipment?.id}`} className="font-semibold text-sm hover:text-blue-600">
                        {alert.equipment?.brand} {alert.equipment?.model}
                      </Link>
                      <p className="text-xs text-gray-500">{alert.equipment?.equipment_types?.name}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{ALERT_TYPE_LABELS[alert.alert_type]}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <Badge variant={urgencyVariant(alert.due_date)}>{formatDate(alert.due_date)}</Badge>
                        <p className="text-xs text-gray-500 mt-1">
                          {days < 0 ? `Dépassé de ${Math.abs(days)}j` : days === 0 ? "Aujourd'hui" : `dans ${days}j`}
                        </p>
                      </div>
                      <DismissButton alertId={alert.id} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {dismissedAlerts.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-3 flex items-center gap-2"><BellOff className="h-4 w-4" />Alertes ignorées récemment</h2>
          <div className="space-y-1">
            {dismissedAlerts.map((alert) => (
              <div key={alert.id} className="flex items-center justify-between p-3 rounded-lg bg-gray-50 opacity-60">
                <p className="text-sm">{alert.equipment?.brand} {alert.equipment?.model}</p>
                <p className="text-xs text-gray-400">{formatDate(alert.due_date)}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
