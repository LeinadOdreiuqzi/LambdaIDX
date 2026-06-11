"use client";

import React from "react";
import { EditorPage } from "@/components/features/editor/editor-page";

export default function AdminEditorNewPage() {
  return (
    <EditorPage
      pageId={undefined}
      onPublish={(pageId) => {
        console.log("Page published:", pageId);
      }}
    />
  );
}
