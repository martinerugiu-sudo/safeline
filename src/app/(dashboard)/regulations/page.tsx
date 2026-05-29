import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookOpen, ExternalLink, RefreshCw } from "lucide-react";
import { formatDate } from "@/lib/utils";
import type { Regulation, EquipmentType } from "@/types/database";

export default async function RegulationsPage() {
  const supabase = await createClient();

  const [{ data: regulations }, { data: types }] = await Promise.all([
    supabase.from("regulations").select("*").order("title"),
    supabase.from("equipment_types").select("*").order("category"),
  ]);

  const regs = (regulations ?? []) as Regulation[];
  const epiTypes = (types ?? []) as EquipmentType[];
  const categories = [...new Set(epiTypes.map((t) => t.category))];

  return (
    <div className="p-6 space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Réglementation</h1>
        <p className="text-gray-500 text-sm">Obligations légales EPI et travaux en hauteur — France / UE</p>
      </div>

      {/* Obligations légales */}
      <section>
        <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-blue-600" />
          Obligations légales
        </h2>
        <div className="space-y-3">
          {regs.map((reg) => (
            <Card key={reg.id}>
              <CardContent className="p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 mb-1">{reg.title}</h3>
                    <p className="text-sm text-gray-600 leading-relaxed">{reg.description}</p>
                    {reg.applicable_norm && (
                      <p className="text-xs text-blue-700 bg-blue-50 inline-block px-2 py-0.5 rounded mt-2 font-medium">
                        {reg.applicable_norm}
                      </p>
                    )}
                  </div>
                  <div className="flex flex-col items-end gap-2 flex-shrink-0">
                    <div className="flex items-center gap-1 text-xs text-gray-400">
                      <RefreshCw className="h-3 w-3" />
                      Mis à jour : {formatDate(reg.last_updated)}
                    </div>
                    {reg.source_url && (
                      <a href={reg.source_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-xs text-blue-600 hover:underline">
                        Source officielle <ExternalLink className="h-3 w-3" />
                      </a>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Tableau durées de vie par EPI */}
      <section>
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Durées de vie légales par équipement</h2>
        <div className="space-y-4">
          {categories.map((cat) => (
            <Card key={cat}>
              <CardHeader className="pb-2"><CardTitle className="text-sm text-gray-500 uppercase tracking-wide">{cat}</CardTitle></CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2 font-medium text-gray-600">Équipement</th>
                        <th className="text-center py-2 font-medium text-gray-600">Norme</th>
                        <th className="text-center py-2 font-medium text-gray-600">Durée max (fab.)</th>
                        <th className="text-center py-2 font-medium text-gray-600">Durée max (usage)</th>
                        <th className="text-center py-2 font-medium text-gray-600">Inspection</th>
                        <th className="text-center py-2 font-medium text-gray-600">Retrait après chute</th>
                      </tr>
                    </thead>
                    <tbody>
                      {epiTypes.filter((t) => t.category === cat).map((t) => (
                        <tr key={t.id} className="border-b last:border-0 hover:bg-gray-50">
                          <td className="py-2 font-medium">{t.name}</td>
                          <td className="py-2 text-center"><Badge variant="outline">{t.norm_reference}</Badge></td>
                          <td className="py-2 text-center">{t.max_lifetime_years ? `${t.max_lifetime_years} ans` : "—"}</td>
                          <td className="py-2 text-center">{t.max_use_lifetime_years ? `${t.max_use_lifetime_years} ans` : "—"}</td>
                          <td className="py-2 text-center">{t.inspection_interval_months} mois</td>
                          <td className="py-2 text-center">
                            {t.retire_after_fall ? (
                              <Badge variant="danger">Obligatoire</Badge>
                            ) : (
                              <span className="text-gray-400">—</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <p className="text-xs text-gray-400 text-center pb-4">
        Informations à titre indicatif. Consultez un expert en prévention pour toute décision opérationnelle. Sources : INRS, Légifrance, OPPBTP.
      </p>
    </div>
  );
}
