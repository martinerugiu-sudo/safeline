import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ProfileForm } from "./profile-form";
import { SubscriptionCard } from "./subscription-card";

export default async function SettingsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: profile } = await supabase.from("profiles").select("*").eq("user_id", user!.id).single();
  const { data: org } = profile?.current_organization_id
    ? await supabase.from("organizations").select("*").eq("id", profile.current_organization_id).single()
    : { data: null };

  return (
    <div className="p-6 max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Paramètres</h1>
        <p className="text-gray-500 text-sm">Gérez votre profil et votre abonnement</p>
      </div>

      <ProfileForm profile={profile} email={user!.email ?? ""} />

      <SubscriptionCard organization={org} />

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Compte</CardTitle>
          <CardDescription>Informations de connexion</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Email</span>
            <span className="text-sm font-medium">{user!.email}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Membre depuis</span>
            <span className="text-sm font-medium">{new Intl.DateTimeFormat("fr-FR").format(new Date(user!.created_at))}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
