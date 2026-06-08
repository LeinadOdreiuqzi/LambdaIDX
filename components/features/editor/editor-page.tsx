"use client";

import React, { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { RichTextEditor } from "./rich-text-editor";
import { usePageEditor } from "@/hooks/use-page-editor";
import { cn } from "@/lib/utils";
import { Loader2, CheckCircle2, Save } from "lucide-react";

interface EditorPageProps {
  pageId?: string;
  onPublish?: (pageId: string) => void;
  className?: string;
}

export function EditorPage({ pageId, onPublish, className }: EditorPageProps) {
  const router = useRouter();
  const {
    state,
    loadPage,
    createPage,
    savePage,
    updateMetadata,
    publishPage,
  } = usePageEditor({
    onSaveSuccess: () => {
      router.refresh();
    },
    onPublishSuccess: () => {
      router.refresh();
      if (state.id && onPublish) {
        onPublish(state.id);
      }
    },
  });

  const [isCreating, setIsCreating] = useState(false);
  const [isCreatingChild, setIsCreatingChild] = useState(false);
  const [childTitle, setChildTitle] = useState("");
  const [showMetadata, setShowMetadata] = useState(false);
  const [metaTitle, setMetaTitle] = useState("");
  const [metaDescription, setMetaDescription] = useState("");
  const [loadError, setLoadError] = useState<string | null>(null);
  const editorRef = useRef<any>(null);

  // Load page if ID is provided
  useEffect(() => {
    if (pageId) {
      setLoadError(null);
      loadPage(pageId).catch(() => {
        setLoadError("Page not found or could not be loaded.");
      });
    }
  }, [pageId, loadPage]);

  // Sync metadata when page loads
  useEffect(() => {
    setMetaTitle(state.title);
    setMetaDescription("");
  }, [state.title]);

  const handleCreatePage = async () => {
    setIsCreating(true);
    try {
      const slug = state.title
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-")
        .trim();
      await createPage({
        title: state.title,
        slug,
        contentJson: state.contentJson || { type: "doc", content: [] },
      });
    } finally {
      setIsCreating(false);
    }
  };

  const handleCreateChildPage = async () => {
    if (!childTitle.trim()) {
      return;
    }

    setIsCreatingChild(true);
    try {
      const slug = childTitle
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-")
        .trim();
      await createPage({
        title: childTitle,
        slug,
        parentId: state.id || undefined,
        contentJson: { type: "doc", content: [] },
      });
      setChildTitle("");
      router.push(`/admin/editor/${state.id}`);
    } finally {
      setIsCreatingChild(false);
    }
  };

  const handleSave = async (
    html: string,
    contentJson: Record<string, unknown>
  ) => {
    const plainText = html
      .replace(/<[^>]*>/g, "")
      .substring(0, 160)
      .trim();

    await savePage(contentJson, plainText);
  };

  const handlePublish = async () => {
    if (editorRef.current) {
      const editor = editorRef.current.getEditor();
      if (editor) {
        const contentJson = editor.getJSON();
        const html = editor.getHTML();
        const plainText = html
          .replace(/<[^>]*>/g, "")
          .substring(0, 160)
          .trim();
        await savePage(contentJson, plainText);
      }
    }
    await publishPage();
  };

  const handleManualSave = async () => {
    if (editorRef.current) {
      const editor = editorRef.current.getEditor();
      if (editor) {
        const contentJson = editor.getJSON();
        const html = editor.getHTML();
        const plainText = html
          .replace(/<[^>]*>/g, "")
          .substring(0, 160)
          .trim();
        await savePage(contentJson, plainText);
      }
    }
  };

  const handleUpdateMetadata = async () => {
    await updateMetadata({
      title: metaTitle,
      metaTitle,
      metaDescription,
    });
  };

  if (loadError) {
    return (
      <div className={cn("min-h-screen bg-zinc-50 dark:bg-zinc-950 flex items-center justify-center p-8", className)}>
        <div className="max-w-md rounded-3xl border border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950/40 p-10 text-center">
          <p className="text-lg font-semibold text-red-700 dark:text-red-200">{loadError}</p>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
            Revisa que la página exista o que el ID sea correcto.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("min-h-screen w-full bg-zinc-50 dark:bg-zinc-950", className)}>
      {/* Header */}
      <div className="sticky top-0 z-40 border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/95 backdrop-blur supports-backdrop-filter:bg-white/75 dark:supports-backdrop-filter:bg-zinc-900/75">
        <div className="w-full py-4 flex items-center justify-between gap-4 px-6">
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">
              {state.title || "Untitled Page"}
            </h1>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
              Status: <span className="font-semibold">{state.status}</span>
            </p>
          </div>

          <div className="flex items-center gap-2">
            {state.isSaving && (
              <div className="flex items-center gap-2 text-sm text-amber-600 dark:text-amber-500">
                <Loader2 className="h-4 w-4 animate-spin" />
                Saving...
              </div>
            )}

            {!state.isSaving && state.id && (
              <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-500">
                <CheckCircle2 className="h-4 w-4" />
                Saved
              </div>
            )}

            <button
              onClick={handleManualSave}
              disabled={state.isSaving || !state.id}
              className="inline-flex items-center justify-center gap-2 rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-4 py-2 text-sm font-medium text-zinc-900 dark:text-white hover:bg-zinc-50 dark:hover:bg-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Save className="h-4 w-4" />
              Save
            </button>

            {state.status === "DRAFT" && (
              <button
                onClick={handlePublish}
                disabled={state.isPublishing || !state.id}
                className="inline-flex items-center justify-center gap-2 rounded-md bg-zinc-900 dark:bg-white px-4 py-2 text-sm font-medium text-white dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {state.isPublishing ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Publishing...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="h-4 w-4" />
                    Publish
                  </>
                )}
              </button>
            )}

            <button
              onClick={() => setShowMetadata(!showMetadata)}
              className="inline-flex items-center justify-center rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-4 py-2 text-sm font-medium text-zinc-900 dark:text-white hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
            >
              {showMetadata ? "Hide" : "SEO"} Settings
            </button>
          </div>
        </div>
      </div>

      <div className="w-full py-6">
        {!state.id ? (
          /* Create New Page */
          <div className="max-w-2xl space-y-6 px-6">
            <div>
              <label className="block text-sm font-medium text-zinc-900 dark:text-white mb-2">
                Page Title
              </label>
              <input
                type="text"
                placeholder="Enter page title..."
                className="w-full rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-2 text-base text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-zinc-500"
              />
            </div>

            <button
              onClick={handleCreatePage}
              disabled={!state.title || isCreating}
              className="w-full rounded-md bg-zinc-900 dark:bg-white px-4 py-3 text-base font-medium text-white dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors inline-flex items-center justify-center gap-2"
            >
              {isCreating ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create New Page"
              )}
            </button>
          </div>
        ) : (
          <>
            {/* Create Child Page Section */}
            {state.id && (
              <div className="mx-6 mb-6 space-y-4 rounded-lg border border-blue-200 bg-blue-50 p-6 dark:border-blue-800 dark:bg-blue-950/20">
                <h2 className="font-semibold text-zinc-900 dark:text-white">
                  Create Child Page
                </h2>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                  Add a sub-topic under "<strong>{state.title}</strong>"
                </p>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={childTitle}
                    onChange={(e) => setChildTitle(e.target.value)}
                    placeholder="e.g., Quantum Superposition"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleCreateChildPage();
                    }}
                    className="flex-1 rounded-md border border-blue-300 dark:border-blue-700 bg-white dark:bg-blue-900/30 px-3 py-2 text-sm text-zinc-900 dark:text-white placeholder-zinc-500 dark:placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    onClick={handleCreateChildPage}
                    disabled={!childTitle.trim() || isCreatingChild}
                    className="px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 text-sm font-medium transition-colors"
                  >
                    {isCreatingChild ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      "Create"
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* SEO Metadata Panel */}
            {showMetadata && (
              <div className="mx-6 mb-6 space-y-4 rounded-lg border border-blue-200 bg-blue-50 p-6 dark:border-blue-800 dark:bg-blue-950/20">
                <h2 className="font-semibold text-zinc-900 dark:text-white">
                  SEO & Metadata
                </h2>

                <div>
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                    Meta Title
                  </label>
                  <input
                    type="text"
                    value={metaTitle}
                    onChange={(e) => setMetaTitle(e.target.value)}
                    placeholder="Page title for search engines..."
                    maxLength={60}
                    className="w-full rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-2 text-sm text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                    {metaTitle.length}/60 characters
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                    Meta Description
                  </label>
                  <textarea
                    value={metaDescription}
                    onChange={(e) => setMetaDescription(e.target.value)}
                    placeholder="Brief description for search results..."
                    maxLength={160}
                    rows={3}
                    className="w-full rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-2 text-sm text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  />
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                    {metaDescription.length}/160 characters
                  </p>
                </div>

                <button
                  onClick={handleUpdateMetadata}
                  className="inline-flex items-center justify-center rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-2 text-sm font-medium text-zinc-900 dark:text-white hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
                >
                  Save SEO Settings
                </button>
              </div>
            )}

            {/* Rich Text Editor */}
            <RichTextEditor
              ref={editorRef}
              content={state.contentJson ? JSON.stringify(state.contentJson) : ""}
              onChange={handleSave}
              documentId={state.id}
              contentJson={state.contentJson as Record<string, unknown> | undefined}
              disableAutoSave={true}
              className="min-h-[calc(100vh-16rem)] rounded-2xl border border-zinc-200/70 shadow-sm dark:border-zinc-800/80"
            />

            {/* Status */}
            <div className="mt-6 flex items-center gap-4 px-6 text-sm text-zinc-600 dark:text-zinc-400">
              {state.isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Auto-saving...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-500" />
                  <span>All changes saved</span>
                </>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
