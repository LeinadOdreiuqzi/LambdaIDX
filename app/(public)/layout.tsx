import React from "react";
import { PageService } from "@/services/page-service";
import { NavigationProvider } from "@/hooks/use-navigation";
import { PublicClientLayout } from "@/components/features/navigation/public-client-layout";

// Forzar renderizado dinamico en Vercel para reflejar arbol de paginas en tiempo real
export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Fetch hierarchy tree on the server
  const tree = await PageService.getHierarchyTree();

  return (
    <NavigationProvider>
      <PublicClientLayout tree={tree}>
        {children}
      </PublicClientLayout>
    </NavigationProvider>
  );
}
