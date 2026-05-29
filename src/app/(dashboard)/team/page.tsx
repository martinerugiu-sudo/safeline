import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users } from "lucide-react";
import { InviteForm } from "./invite-form";

const ROLE_LABELS: Record<string, string> = { owner: "Propriétaire", admin: "Admin", member: "Membre" };
const ROLE_VARIANTS: Record<string, any> = { owner: "default", admin: "secondary", member: "muted" };

export default async function TeamPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: profile } = await supabase.from("profiles").select("current_organization_id").eq("user_id", user!.id).single();

  if (!profile?.current_organization_id) {
    return (
      <div className="p-6 max-w-2xl">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Équipe</h1>
        <Card>
          <CardContent className="flex flex-col items-center py-12 text-center">
            <Users className="h-12 w-12 text-gray-300 mb-4" />
            <h3 className="font-semibold text-gray-700 mb-2">Créez votre organisation</h3>
            <p className="text-gray-500 text-sm mb-4">Le plan Équipe vous permet d'inviter jusqu'à 5 cordistes.</p>
            <a href="/settings" className="text-blue-600 hover:underline text-sm">Mettre à niveau vers le plan Équipe →</a>
          </CardContent>
        </Card>
      </div>
    );
  }

  const [{ data: org }, { data: members }] = await Promise.all([
    supabase.from("organizations").select("*").eq("id", profile.current_organization_id).single(),
    supabase.from("organization_members").select("*, profiles(full_name)").eq("organization_id", profile.current_organization_id),
  ]);

  const isAdmin = members?.some((m: any) => m.user_id === user!.id && ["owner", "admin"].includes(m.role));

  return (
    <div className="p-6 max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Équipe</h1>
        <p className="text-gray-500 text-sm">{org?.name}</p>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base flex items-center gap-2"><Users className="h-4 w-4" />Membres ({members?.length ?? 0}/5)</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {(members ?? []).map((m: any) => (
            <div key={m.id} className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
              <div>
                <p className="text-sm font-medium">{m.profiles?.full_name || m.invited_email || "—"}</p>
                {m.invited_email && !m.user_id && <p className="text-xs text-orange-500">Invitation en attente</p>}
              </div>
              <Badge variant={ROLE_VARIANTS[m.role]}>{ROLE_LABELS[m.role]}</Badge>
            </div>
          ))}
        </CardContent>
      </Card>

      {isAdmin && (members?.length ?? 0) < 5 && (
        <InviteForm organizationId={profile.current_organization_id} />
      )}
    </div>
  );
}
