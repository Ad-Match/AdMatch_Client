import { AuthProvider } from "@/context/AuthProvider";
import { ConditionalSiteFooter } from "@/components/layout/ConditionalSiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { ToastProvider } from "@/components/ui/Toast";

export default function SiteLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <AuthProvider>
      <ToastProvider>
        <div className="flex min-h-screen flex-col bg-[#FAF6F9]">
          <SiteHeader />
          <main className="flex-1">{children}</main>
          <ConditionalSiteFooter />
        </div>
      </ToastProvider>
    </AuthProvider>
  );
}
