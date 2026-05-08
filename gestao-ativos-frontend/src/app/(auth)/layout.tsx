import type { Metadata } from "next";
import "../globals.css";

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
      <body className="bg-gray-50 text-gray-900 dark:bg-gray-900 dark:text-white min-h-screen">
        <div className="pb-12">
          {children}
        </div>
      </body>
    </html>
  );
}