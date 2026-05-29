# SafeLine — SaaS Gestion EPI Cordiste

## Stack
- Next.js 15 (App Router) + TypeScript
- Supabase (PostgreSQL + Auth + Storage)
- Stripe (abonnements)
- Tailwind CSS + shadcn/ui
- Vercel (déploiement)

## Setup

### 1. Installer les dépendances
```bash
npm install
```

### 2. Variables d'environnement
```bash
cp .env.local.example .env.local
# Remplir les variables Supabase, Stripe, Resend
```

### 3. Supabase — Créer le projet
1. Créer un projet sur https://app.supabase.com
2. Récupérer URL et anon key dans Settings > API
3. Exécuter les migrations dans l'ordre dans l'éditeur SQL :
   - `supabase/migrations/001_initial_schema.sql`
   - `supabase/migrations/002_seed_data.sql`
   - `supabase/migrations/003_storage.sql`

### 4. Stripe — Créer les produits
1. Créer deux produits dans Dashboard Stripe :
   - "SafeLine Pro" — 9,99€/mois → copier le Price ID dans `STRIPE_PRICE_PRO_MONTHLY`
   - "SafeLine Équipe" — 19,99€/mois → copier dans `STRIPE_PRICE_TEAM_MONTHLY`
2. Configurer le webhook Stripe pointant vers `/api/webhooks/stripe`
   - Événements : `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`

### 5. Lancer en développement
```bash
npm run dev
# → http://localhost:3000
```

### 6. Cron d'alertes (optionnel en dev)
```bash
# Tester manuellement :
curl -H "Authorization: Bearer votre_cron_secret" http://localhost:3000/api/cron/send-alerts
```
En production, configurer un cron job Vercel ou un pg_cron Supabase pour appeler cet endpoint chaque nuit.

## Structure
```
src/
├── app/
│   ├── (auth)/           # Login, Register
│   ├── (dashboard)/      # Dashboard, Equipment, Invoices, Inspections, Alerts, Regulations, Team, Settings
│   └── api/              # Webhooks Stripe, Cron alertes, Auth callback
├── components/
│   ├── ui/               # Composants shadcn/ui
│   ├── dashboard/
│   └── layout/           # Sidebar
├── lib/
│   ├── supabase/         # Client, Server, Middleware
│   ├── stripe/
│   └── use-toast.ts
└── types/
    └── database.ts       # Types TypeScript complets
```
