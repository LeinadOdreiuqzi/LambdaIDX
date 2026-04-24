"use client";

import React from "react";
import { AlertTriangle, ArrowLeft } from "lucide-react";
import { StatusPage } from "@/components/shared/status-page";

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <StatusPage
      variant="error"
      icon={<AlertTriangle className="w-12 h-12 text-red-500 dark:text-red-400" />}
      badge={`ERROR::ADMIN_${error.digest || "RUNTIME_EXCEPTION"}`}
      heading={
        <>
          Admin <br />
          <span className="text-zinc-500 dark:text-zinc-700">Crash.</span>
        </>
      }
      description="The admin panel encountered an unexpected error. Please try again or return to the dashboard."
      action={{
        label: "Return to Dashboard",
        href: "/dashboard",
        icon: <ArrowLeft className="w-4 h-4" />,
      }}
    />
  );
}
