import type { ReactNode } from "react";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen w-full justify-center p-6 md:p-10 pt-20 bg-background">
      <div className="w-full max-w-sm flex flex-col gap-6">{children}</div>
    </div>
  );
}
