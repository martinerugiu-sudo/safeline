"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/lib/use-toast";
import { Toaster } from "@/components/ui/toaster";
import { Loader2 } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      toast({ title: "Erreur de connexion", description: error.message, variant: "destructive" });
      setLoading(false);
      return;
    }
    router.push("/dashboard");
    router.refresh();
  }

  return (
    <>
      <Toaster />
      <h1 className="text-2xl font-bold text-gray-900 mb-1">Connexion</h1>
      <p className="text-gray-500 text-sm mb-6">Accédez à votre espace SafeLine</p>
      <form onSubmit={handleLogin} className="space-y-4">
        <div className="space-y-1">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="vous@exemple.fr" required autoComplete="email" />
        </div>
        <div className="space-y-1">
          <Label htmlFor="password">Mot de passe</Label>
          <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required autoComplete="current-password" />
        </div>
        <Button type="submit" className="w-full" disabled={loading}>
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          Se connecter
        </Button>
      </form>
      <p className="text-center text-sm text-gray-500 mt-6">
        Pas encore de compte ?{" "}
        <Link href="/register" className="text-blue-600 hover:underline font-medium">Créer un compte</Link>
      </p>
    </>
  );
}
