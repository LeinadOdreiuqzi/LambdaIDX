import React from "react";
import { redirect } from "next/navigation";
import { PageService } from "@/services/page-service";
import { NavigationProvider } from "@/hooks/use-navigation";
import { AdminClientLayout } from "@/components/features/navigation/admin-client-layout";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // TODO: Implementar autenticación real en el futuro
  // Por ahora, redirigir siempre al login excepto en la página de login
  // Nota: Esta es una solución temporal para demostración
  
  // Fetch ALL hierarchy nodes for management (CRUD)
  const tree = await PageService.getHierarchyTree(true);

  return (
    <NavigationProvider>
      <AdminClientLayout tree={tree}>
        {children}
      </AdminClientLayout>
    </NavigationProvider>
  );
}
