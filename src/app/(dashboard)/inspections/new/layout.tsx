import { Suspense } from "react";

export default function NewInspectionLayout({ children }: { children: React.ReactNode }) {
  return <Suspense>{children}</Suspense>;
}
