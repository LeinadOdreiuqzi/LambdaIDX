import React from "react";
import { ArrowLeft, Terminal } from "lucide-react";
import { StatusPage } from "@/components/shared/status-page";

export default function NotFound() {
  return (
    <StatusPage
      variant="not-found"
      icon={<Terminal className="w-12 h-12 text-zinc-500 dark:text-zinc-600" />}
      badge="ERROR::NODO_NO_ENCONTRADO_404"
      heading={
        <>
          404<br />
          <span className="text-zinc-500 dark:text-zinc-700">The Void</span>
        </>
      }
      description="El nodo de conocimiento que estás buscando ha sido movido, eliminado o nunca ha existido en esta jerarquía."
      action={{
        label: "Volver al Origen",
        href: "/",
        icon: <ArrowLeft className="w-4 h-4" />,
      }}
    />
  );
}
