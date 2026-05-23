"use client";

import React, { useEffect, useState } from "react";
import { RichTextEditor } from "./rich-text-editor";
import { usePageEditor } from "@/hooks/use-page-editor";
import { cn } from "@/lib/utils";
import { Loader2, CheckCircle2 } from "lucide-react";

interface EditorPageProps {
  pageId?: string;
  onPublish?: (pageId: string) => void;
  className?: string;
}

export function EditorPage({ pageId, onPublish, className }: EditorPageProps) {
  const {
    state,
    loadPage,
    createPage,
    savePage,
    updateMetadata,
    publishPage,
  } = usePageEditor({
    onPublishSuccess: () => {
      if (state.id && onPublish) {
        onPublish(state.id);
      }
    },
  });

  const [isCreating, setIsCreating] = useState(false);
  const [showMetadata, setShowMetadata] = useState(false);
  const [metaTitle, setMetaTitle] = useState("");
  const [metaDescription, setMetaDescription] = useState("");

  // Load page if ID is provided
  useEffect(() => {
    if (pageId) {
      loadPage(pageId);
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
      const slug = state.title.toLowerCase().replace(/\s+/g, "-");
      await createPage({
        title: state.title,
        slug,
        contentJson: state.contentJson || { type: "doc", content: [] },
      });
    } finally {
      setIsCreating(false);
    }
  };

  const handleSave = async (
    contentJson: Record<string, unknown>,
    html: string
  ) => {
    const plainText = html
      .replace(/<[^>]*>/g, "")
      .substring(0, 160)
      .trim();

    await savePage(contentJson, plainText);
  };

  const handlePublish = async () => {
    await publishPage();
  };

  const handleUpdateMetadata = async () => {
    await updateMetadata({
      title: metaTitle,
      metaTitle,
      metaDescription,
    });
  };

  return (
    <div className={cn("min-h-screen bg-zinc-50 dark:bg-zinc-950", className)}>
      {/* Header */}
      <div className="sticky top-0 z-40 border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/95 backdrop-blur supports-backdrop-filter:bg-white/75 dark:supports-backdrop-filter:bg-zinc-900/75">
        <div className="mx-auto max-w-6xl px-4 py-4 flex items-center justify-between gap-4">
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

      <div className="mx-auto max-w-6xl px-4 py-8">
        {!state.id ? (
          /* Create New Page */
          <div className="space-y-6 max-w-2xl">
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
            {/* SEO Metadata Panel */}
            {showMetadata && (
              <div className="mb-8 p-6 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800 space-y-4">
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
            <div className="bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800 p-6">
              <RichTextEditor
                content=""
                onChange={handleSave}
                documentId={state.id}
                className="min-h-96"
              />
            </div>

            {/* Status */}
            <div className="mt-8 flex items-center gap-4 text-sm text-zinc-600 dark:text-zinc-400">
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
