"use client";
import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/lib/use-toast";
import { Toaster } from "@/components/ui/toaster";
import { Loader2, Mail, CheckCircle } from "lucide-react";

export default function RegisterPage() {
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState("");
  const [form, setForm] = useState({ fullName: "", email: "", password: "", company: "" });

  function update(field: string) {
    return (e: React.ChangeEvent<HTMLInputElement>) => setForm((f) => ({ ...f, [field]: e.target.value }));
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    if (form.password.length < 8) {
      toast({ title: "Mot de passe trop court", description: "Minimum 8 caractères.", variant: "destructive" });
      return;
    }
    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: { data: { full_name: form.fullName, company: form.company } },
    });
    if (error) {
      toast({ title: "Erreur d'inscription", description: error.message, variant: "destructive" });
      setLoading(false);
      return;
    }
    setRegisteredEmail(form.email);
    setEmailSent(true);
    setLoading(false);
  }

  async function handleResend() {
    setResending(true);
    const supabase = createClient();
    const { error } = await supabase.auth.resend({ type: "signup", email: registeredEmail });
    if (error) {
      toast({ title: "Erreur", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Email renvoyé !", description: "Vérifiez votre boîte mail." });
    }
    setResending(false);
  }

  if (emailSent) {
    return (
      <>
        <Toaster />
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <div className="bg-green-100 rounded-full p-4">
              <CheckCircle className="h-10 w-10 text-green-500" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Compte créé !</h1>
          <p className="text-gray-600 mb-2">Un email de confirmation a été envoyé à :</p>
          <p className="font-semibold text-blue-600 mb-6">{registeredEmail}</p>

          <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 text-left mb-6 space-y-2">
            <div className="flex items-start gap-2">
              <Mail className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium text-gray-800">Étape suivante</p>
                <p className="text-sm text-gray-600">Ouvrez votre boîte mail et cliquez sur le lien de confirmation pour activer votre compte.</p>
              </div>
            </div>
          </div>

          <p className="text-sm text-gray-500 mb-3">Vous n'avez pas reçu l'email ?</p>
          <Button variant="outline" onClick={handleResend} disabled={resending} className="w-full">
            {resending && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
            Renvoyer l'email de confirmation
          </Button>

          <p className="text-center text-sm text-gray-500 mt-4">
            <Link href="/login" className="text-blue-600 hover:underline font-medium">Se connecter</Link>
          </p>
        </div>
      </>
    );
  }

  return (
    <>
      <Toaster />
      <h1 className="text-2xl font-bold text-gray-900 mb-1">Créer un compte</h1>
      <p className="text-gray-500 text-sm mb-6">Gratuit — 5 équipements inclus</p>
      <form onSubmit={handleRegister} className="space-y-4">
        <div className="space-y-1">
          <Label htmlFor="fullName">Nom complet</Label>
          <Input id="fullName" value={form.fullName} onChange={update("fullName")} placeholder="Jean Dupont" required />
        </div>
        <div className="space-y-1">
          <Label htmlFor="company">Entreprise / Auto-entrepreneur <span className="text-gray-400">(optionnel)</span></Label>
          <Input id="company" value={form.company} onChange={update("company")} placeholder="Cordiste PACA" />
        </div>
        <div className="space-y-1">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" value={form.email} onChange={update("email")} placeholder="vous@exemple.fr" required autoComplete="email" />
        </div>
        <div className="space-y-1">
          <Label htmlFor="password">Mot de passe</Label>
          <Input id="password" type="password" value={form.password} onChange={update("password")} placeholder="Min. 8 caractères" required minLength={8} autoComplete="new-password" />
        </div>
        <Button type="submit" className="w-full" disabled={loading}>
          {loading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
          Créer mon compte gratuitement
        </Button>
      </form>
      <p className="text-center text-xs text-gray-400 mt-4">
        En créant un compte, vous acceptez nos{" "}
        <Link href="/terms" className="underline">conditions d'utilisation</Link>.
      </p>
      <p className="text-center text-sm text-gray-500 mt-4">
        Déjà un compte ?{" "}
        <Link href="/login" className="text-blue-600 hover:underline font-medium">Se connecter</Link>
      </p>
    </>
  );
}
