import React from "react";
import { PageService } from "@/services/page-service";
import { NavigationProvider } from "@/hooks/use-navigation";
import { AdminClientLayout } from "@/components/features/navigation/admin-client-layout";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
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
