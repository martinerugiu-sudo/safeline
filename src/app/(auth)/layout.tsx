import { ShieldCheck } from "lucide-react";
import Link from "next/link";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-blue-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 text-white">
            <ShieldCheck className="h-8 w-8 text-blue-400" />
            <span className="text-2xl font-bold">SafeLine</span>
          </Link>
          <p className="text-blue-200 text-sm mt-2">Gestion EPI & Sécurité Cordiste</p>
        </div>
        <div className="bg-white rounded-2xl shadow-2xl p-8">{children}</div>
      </div>
    </div>
  );
}
