"use client";

import React from "react";
import { ArrowLeft, AlertTriangle } from "lucide-react";
import { StatusPage } from "@/components/shared/status-page";

export default function Error({
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
      badge={`ERROR::${error.digest || "RUNTIME_EXCEPTION"}`}
      heading={
        <>
          System <br />
          <span className="text-zinc-500 dark:text-zinc-700">Failure.</span>
        </>
      }
      description="An unexpected error occurred while processing this node. The engineering team has been notified."
      action={{
        label: "Retry Operation",
        href: "#",
        icon: <ArrowLeft className="w-4 h-4" />,
      }}
    />
  );
}
