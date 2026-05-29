import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ShieldCheck, Bell, FileText, ClipboardCheck, BookOpen, Users, Check, ArrowRight } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 text-white">
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-4 max-w-6xl mx-auto">
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-7 w-7 text-blue-400" />
          <span className="text-xl font-bold">SafeLine</span>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/login"><Button variant="ghost" className="text-white hover:text-white hover:bg-white/10">Connexion</Button></Link>
          <Link href="/register"><Button className="bg-blue-500 hover:bg-blue-400">Créer un compte</Button></Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="text-center py-24 px-6 max-w-4xl mx-auto">
        <div className="inline-flex items-center gap-2 bg-blue-500/20 border border-blue-400/30 rounded-full px-4 py-1.5 text-sm text-blue-200 mb-6">
          <ShieldCheck className="h-4 w-4" />
          Pour tous les utilisateurs d'EPI — pros et sportifs
        </div>
        <h1 className="text-5xl font-bold mb-6 leading-tight">
          Ne laissez plus un EPI<br />
          <span className="text-blue-400">expirer sans le savoir</span>
        </h1>
        <p className="text-xl text-blue-100/80 mb-10 max-w-2xl mx-auto">
          SafeLine centralise vos équipements, calcule automatiquement les dates d'expiration légales, et vous alerte avant les échéances critiques.
        </p>
        <div className="flex items-center justify-center gap-4">
          <Link href="/register">
            <Button size="lg" className="bg-blue-500 hover:bg-blue-400 text-white px-8">
              Créer un compte <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
          <Link href="/login">
            <Button size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10 px-8">
              Se connecter
            </Button>
          </Link>
        </div>
        <p className="text-sm text-blue-200/60 mt-4">Gratuit jusqu'à 5 équipements · Aucune carte requise</p>
      </section>

      {/* Features */}
      <section className="py-16 px-6 max-w-6xl mx-auto">
        <h2 className="text-3xl font-bold text-center mb-4">Tout ce dont vous avez besoin</h2>
        <p className="text-center text-blue-200/70 mb-12">Cordistes, alpinistes, grimpeurs, clubs sportifs — SafeLine s'adapte à tous les utilisateurs d'EPI.</p>
        <div className="grid md:grid-cols-3 gap-6">
          {[
            { icon: ShieldCheck, title: "Suivi EPI complet", desc: "Harnais, cordes, mousquetons, casques… Chaque équipement avec sa date d'expiration calculée selon les normes EN." },
            { icon: Bell, title: "Alertes automatiques", desc: "Notifications 30 jours et 7 jours avant l'expiration ou la prochaine inspection. Ne ratez plus aucune échéance." },
            { icon: FileText, title: "Factures archivées", desc: "Téléchargez et liez vos factures d'achat à chaque EPI. Justificatifs disponibles en cas de contrôle." },
            { icon: ClipboardCheck, title: "Historique inspections", desc: "Enregistrez chaque vérification périodique avec le nom du vérificateur et le résultat. Traçabilité complète." },
            { icon: BookOpen, title: "Réglementation à jour", desc: "Base de données des obligations légales françaises et normes EN. Référence rapide sur le terrain." },
            { icon: Users, title: "Gestion d'équipe", desc: "Gérez plusieurs membres depuis un seul compte. Idéal pour les entreprises, clubs et associations." },
          ].map((f) => (
            <div key={f.title} className="bg-white/5 border border-white/10 rounded-xl p-6">
              <f.icon className="h-8 w-8 text-blue-400 mb-4" />
              <h3 className="font-semibold text-lg mb-2">{f.title}</h3>
              <p className="text-blue-100/70 text-sm">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section className="py-16 px-6 max-w-6xl mx-auto">
        <h2 className="text-3xl font-bold text-center mb-4">Tarifs simples</h2>
        <p className="text-center text-blue-200/70 mb-12">Sans engagement · Résiliable à tout moment</p>
        {/* Plans individuels */}
        <p className="text-blue-200/60 text-sm uppercase tracking-widest text-center mb-4">Particuliers & professionnels</p>
        <div className="grid md:grid-cols-3 gap-5 mb-10">
          {[
            {
              name: "Gratuit",
              price: "0€",
              period: "",
              badge: "Découverte",
              features: ["5 équipements", "Alertes tableau de bord", "1 utilisateur"],
              cta: "Créer un compte",
              href: "/register",
              highlight: false,
            },
            {
              name: "Sportif",
              price: "4,99€",
              period: "/mois",
              badge: "Alpinisme · Escalade · Spéléo",
              features: ["20 équipements", "Alertes email automatiques", "Upload factures", "1 utilisateur"],
              cta: "Créer un compte",
              href: "/register?plan=sportif",
              highlight: false,
            },
            {
              name: "Pro",
              price: "5,99€",
              period: "/mois",
              badge: "Cordiste · Professionnel",
              features: ["Équipements illimités", "Alertes email automatiques", "Upload factures illimité", "Export données", "1 utilisateur"],
              cta: "Créer un compte",
              href: "/register?plan=pro",
              highlight: true,
            },
          ].map((plan) => (
            <div key={plan.name} className={`rounded-2xl p-7 flex flex-col ${plan.highlight ? "bg-blue-500 border-2 border-blue-400 scale-105" : "bg-white/5 border border-white/10"}`}>
              <h3 className="text-xl font-bold mb-1">{plan.name}</h3>
              {plan.badge && <p className="text-xs text-blue-200/70 mb-3">{plan.badge}</p>}
              <div className="flex items-end gap-1 mb-6">
                <span className="text-4xl font-bold">{plan.price}</span>
                <span className="text-sm text-blue-200 mb-1">{plan.period}</span>
              </div>
              <ul className="space-y-2 mb-8 flex-1">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm">
                    <Check className="h-4 w-4 text-green-400 flex-shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <Link href={plan.href}>
                <Button className={`w-full ${plan.highlight ? "bg-white text-blue-700 hover:bg-blue-50" : "bg-blue-500 hover:bg-blue-400"}`}>
                  {plan.cta}
                </Button>
              </Link>
            </div>
          ))}
        </div>

        {/* Plans clubs */}
        <p className="text-blue-200/60 text-sm uppercase tracking-widest text-center mb-4">Équipes · Clubs · Associations</p>
        <div className="grid md:grid-cols-3 gap-5">
          {[
            {
              name: "Équipe",
              price: "14,99€",
              period: "/mois",
              badge: "TPE · Petits clubs",
              features: ["Jusqu'à 10 membres", "Équipements illimités", "Tableau de bord partagé", "Gestion des rôles", "Alertes email"],
              cta: "Créer un compte",
              href: "/register?plan=team",
              highlight: false,
            },
            {
              name: "Club S",
              price: "39,99€",
              period: "/mois",
              badge: "Clubs · Associations",
              features: ["Jusqu'à 50 membres", "Tout le plan Équipe", "Alertes email automatiques", "Export données", "Support prioritaire"],
              cta: "Créer un compte",
              href: "/register?plan=club-s",
              highlight: true,
            },
            {
              name: "Club L",
              price: "79,99€",
              period: "/mois",
              badge: "CAF · Grandes associations",
              features: ["Jusqu'à 300 membres", "Tout le plan Club S", "Onboarding dédié", "Export comptable", "Au-delà : sur devis"],
              cta: "Nous contacter",
              href: "mailto:contact@safeline.fr",
              highlight: false,
            },
          ].map((plan) => (
            <div key={plan.name} className={`rounded-2xl p-7 flex flex-col ${plan.highlight ? "bg-blue-500 border-2 border-blue-400 scale-105" : "bg-white/5 border border-white/10"}`}>
              <h3 className="text-xl font-bold mb-1">{plan.name}</h3>
              {plan.badge && <p className="text-xs text-blue-200/70 mb-3">{plan.badge}</p>}
              <div className="flex items-end gap-1 mb-6">
                <span className="text-4xl font-bold">{plan.price}</span>
                <span className="text-sm text-blue-200 mb-1">{plan.period}</span>
              </div>
              <ul className="space-y-2 mb-8 flex-1">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm">
                    <Check className="h-4 w-4 text-green-400 flex-shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <Link href={plan.href}>
                <Button className={`w-full ${plan.highlight ? "bg-white text-blue-700 hover:bg-blue-50" : "bg-blue-500 hover:bg-blue-400"}`}>
                  {plan.cta}
                </Button>
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 py-8 px-6 text-center text-blue-200/50 text-sm">
        <div className="flex items-center justify-center gap-2 mb-3">
          <ShieldCheck className="h-5 w-5 text-blue-400" />
          <span className="font-semibold text-white">SafeLine</span>
        </div>
        <p>Gestion des EPI pour les professionnels et sportifs · France</p>
        <div className="flex items-center justify-center gap-4 mt-3">
          <Link href="/terms" className="hover:text-white transition-colors">CGU</Link>
          <Link href="/privacy" className="hover:text-white transition-colors">Confidentialité</Link>
        </div>
      </footer>
    </div>
  );
}
