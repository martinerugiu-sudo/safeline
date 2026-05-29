"use client";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, CreditCard, Zap } from "lucide-react";

const PLAN_LABELS: Record<string, string> = { free: "Gratuit", pro: "Pro", team: "Équipe" };
const PLAN_VARIANTS: Record<string, any> = { free: "muted", pro: "default", team: "success" };

const PLANS = [
  { id: "pro", name: "Pro", price: "9,99€/mois", features: ["Équipements illimités", "Alertes email automatiques", "Export PDF", "Stockage factures illimité"] },
  { id: "team", name: "Équipe", price: "19,99€/mois", features: ["Tout le plan Pro", "Jusqu'à 5 membres", "Tableau de bord partagé", "Gestion des rôles"] },
];

export function SubscriptionCard({ organization }: { organization: any }) {
  const [loading, setLoading] = useState(false);
  const tier = organization?.subscription_tier ?? "free";

  async function handleUpgrade(planId: string) {
    setLoading(true);
    const res = await fetch("/api/stripe/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ planId }),
    });
    const { url } = await res.json();
    if (url) window.location.href = url;
    setLoading(false);
  }

  async function handleManage() {
    setLoading(true);
    const res = await fetch("/api/stripe/portal", { method: "POST" });
    const { url } = await res.json();
    if (url) window.location.href = url;
    setLoading(false);
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base">Abonnement</CardTitle>
            <CardDescription>Votre plan actuel</CardDescription>
          </div>
          <Badge variant={PLAN_VARIANTS[tier]}>{PLAN_LABELS[tier]}</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {tier === "free" && (
          <p className="text-sm text-gray-600 bg-orange-50 border border-orange-100 rounded-lg p-3">
            Plan gratuit : limité à 5 équipements. Passez Pro pour un accès illimité.
          </p>
        )}

        {tier !== "free" && (
          <Button variant="outline" onClick={handleManage} disabled={loading}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <CreditCard className="h-4 w-4" />}
            Gérer mon abonnement
          </Button>
        )}

        {tier === "free" && (
          <div className="grid sm:grid-cols-2 gap-4">
            {PLANS.map((plan) => (
              <div key={plan.id} className="border rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">{plan.name}</h3>
                  <span className="text-sm font-bold text-blue-600">{plan.price}</span>
                </div>
                <ul className="space-y-1">
                  {plan.features.map((f) => <li key={f} className="text-xs text-gray-600 flex items-center gap-1"><Zap className="h-3 w-3 text-blue-400" />{f}</li>)}
                </ul>
                <Button className="w-full" size="sm" onClick={() => handleUpgrade(plan.id)} disabled={loading}>
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                  Passer à {plan.name}
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
