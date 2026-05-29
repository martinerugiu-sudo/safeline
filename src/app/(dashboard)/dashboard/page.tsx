import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Package, AlertTriangle, CheckCircle2, XCircle, Plus, ArrowRight } from "lucide-react";
import Link from "next/link";
import { formatDate } from "@/lib/utils";
import type { Equipment, EquipmentType, Alert } from "@/types/database";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const [{ data: equipment }, { data: alerts }, { data: profile }] = await Promise.all([
    supabase.from("equipment").select("*, equipment_types(*)").eq("user_id", user!.id).order("created_at", { ascending: false }),
    supabase.from("alerts").select("*, equipment(brand, model, equipment_types(name))").eq("user_id", user!.id).is("dismissed_at", null).order("due_date", { ascending: true }).limit(5),
    supabase.from("profiles").select("full_name, subscription_tier, current_organization_id").eq("user_id", user!.id).single(),
  ]);

  const eq = (equipment ?? []) as (Equipment & { equipment_types: EquipmentType })[];
  const statusCounts = { ok: 0, inspect_soon: 0, to_replace: 0, retired: 0 };
  eq.forEach((e) => { statusCounts[e.status as keyof typeof statusCounts]++; });

  const urgentEquipment = eq.filter((e) => e.status === "to_replace" || e.status === "inspect_soon").slice(0, 4);

  const firstName = (profile?.full_name || "").split(" ")[0] || "Cordiste";

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Bonjour, {firstName}</h1>
          <p className="text-gray-500 text-sm mt-1">Voici l'état de vos équipements</p>
        </div>
        <Link href="/equipment/new">
          <Button><Plus className="h-4 w-4" />Ajouter un EPI</Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Package} label="Total EPI" value={eq.length} color="blue" />
        <StatCard icon={CheckCircle2} label="En règle" value={statusCounts.ok} color="green" />
        <StatCard icon={AlertTriangle} label="À traiter" value={statusCounts.inspect_soon + statusCounts.to_replace} color="orange" />
        <StatCard icon={XCircle} label="Hors service" value={statusCounts.retired} color="gray" />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Équipements urgents */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-base">Équipements à traiter</CardTitle>
            <Link href="/equipment" className="text-sm text-blue-600 hover:underline flex items-center gap-1">
              Voir tout <ArrowRight className="h-3 w-3" />
            </Link>
          </CardHeader>
          <CardContent className="space-y-3">
            {urgentEquipment.length === 0 ? (
              <p className="text-sm text-gray-500 py-4 text-center">Tous vos équipements sont en règle</p>
            ) : (
              urgentEquipment.map((e) => (
                <Link key={e.id} href={`/equipment/${e.id}`} className="flex items-center justify-between p-3 rounded-lg border hover:bg-gray-50 transition-colors">
                  <div>
                    <p className="font-medium text-sm">{e.brand} {e.model}</p>
                    <p className="text-xs text-gray-500">{e.equipment_types?.name}</p>
                  </div>
                  <StatusBadge status={e.status} />
                </Link>
              ))
            )}
          </CardContent>
        </Card>

        {/* Alertes récentes */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-base">Alertes actives</CardTitle>
            <Link href="/alerts" className="text-sm text-blue-600 hover:underline flex items-center gap-1">
              Voir tout <ArrowRight className="h-3 w-3" />
            </Link>
          </CardHeader>
          <CardContent className="space-y-3">
            {(alerts ?? []).length === 0 ? (
              <p className="text-sm text-gray-500 py-4 text-center">Aucune alerte active</p>
            ) : (
              (alerts as any[]).map((alert) => (
                <div key={alert.id} className="flex items-center justify-between p-3 rounded-lg bg-orange-50 border border-orange-100">
                  <div>
                    <p className="font-medium text-sm text-orange-900">{alert.equipment?.brand} {alert.equipment?.model}</p>
                    <p className="text-xs text-orange-700">{alert.equipment?.equipment_types?.name}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-medium text-orange-800">Échéance</p>
                    <p className="text-xs text-orange-700">{formatDate(alert.due_date)}</p>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, color }: { icon: any; label: string; value: number; color: string }) {
  const colors: Record<string, string> = {
    blue: "bg-blue-50 text-blue-600",
    green: "bg-green-50 text-green-600",
    orange: "bg-orange-50 text-orange-600",
    gray: "bg-gray-100 text-gray-500",
  };
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${colors[color]}`}><Icon className="h-5 w-5" /></div>
          <div>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
            <p className="text-xs text-gray-500">{label}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; variant: any }> = {
    ok: { label: "OK", variant: "success" },
    inspect_soon: { label: "À inspecter", variant: "warning" },
    to_replace: { label: "À remplacer", variant: "danger" },
    retired: { label: "Hors service", variant: "muted" },
  };
  const s = map[status] ?? { label: status, variant: "outline" };
  return <Badge variant={s.variant}>{s.label}</Badge>;
}
