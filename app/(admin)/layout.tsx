import React from "react";
import { redirect } from "next/navigation";
import { PageService } from "@/services/page-service";
import { NavigationProvider } from "@/hooks/use-navigation";
import { AdminClientLayout } from "@/components/features/navigation/admin-client-layout";
import { requireAdminSession } from "@/lib/auth";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  try {
    await requireAdminSession();
  } catch {
    redirect("/login");
  }

  // Fetch ALL hierarchy nodes only after authorization succeeds.
  const tree = await PageService.getHierarchyTree(true);

  return (
    <NavigationProvider>
      <AdminClientLayout tree={tree}>
        {children}
      </AdminClientLayout>
    </NavigationProvider>
  );
}
