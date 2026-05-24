"use client";

import React, { useEffect } from "react";
import { EditorPage } from "@/components/features/editor/editor-page";

interface AdminEditorPageProps {
  params: Promise<{ id: string }>;
}

export default function AdminEditorPage({ params }: AdminEditorPageProps) {
  const [id, setId] = React.useState<string | null>(null);

  useEffect(() => {
    params.then((p) => {
      if (p.id !== "new") {
        setId(p.id);
      }
    });
  }, [params]);

  return (
    <EditorPage
      pageId={id || undefined}
      onPublish={(pageId) => {
        console.log("Page published:", pageId);
      }}
    />
  );
}
