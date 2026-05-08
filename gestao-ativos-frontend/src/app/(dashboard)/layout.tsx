import type { Metadata } from "next";
import { AppNavbar } from "@/components/Navbar";
import "../globals.css";
import { AuthGuard } from "@/components/AuthGuard";

export const metadata: Metadata = {
  title: "Gestão de ativos",
  description: "Plataforma de negociação de ativos",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" className="dark">
      <body className="min-h-screen bg-gray-50 text-gray-900 dark:bg-gray-900 dark:text-white">
        <AuthGuard>
          <AppNavbar />
          <div className="pt-4 pb-12">{children}</div>
        </AuthGuard>
      </body>
    </html>
  );
}
