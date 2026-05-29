import { Suspense } from "react";

export default function NewInvoiceLayout({ children }: { children: React.ReactNode }) {
  return <Suspense>{children}</Suspense>;
}
