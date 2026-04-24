import React from "react";
import { ArrowLeft, Terminal } from "lucide-react";
import { StatusPage } from "@/components/shared/status-page";

export default function NotFound() {
  return (
    <StatusPage
      variant="not-found"
      icon={<Terminal className="w-12 h-12 text-zinc-500 dark:text-zinc-600" />}
      badge="ERROR::NODE_NOT_FOUND_404"
      heading={
        <>
          The Void <br />
          <span className="text-zinc-500 dark:text-zinc-700">Awaits.</span>
        </>
      }
      description="The knowledge node you are looking for has been moved, deleted, or never existed in this hierarchy."
      action={{
        label: "Return to Origin",
        href: "/",
        icon: <ArrowLeft className="w-4 h-4" />,
      }}
    />
  );
}
