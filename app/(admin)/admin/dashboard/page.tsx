"use client";

import React, { useState, useEffect } from "react";
import { usePageEditor } from "@/hooks/use-page-editor";
import { RichTextEditor } from "@/components/features/editor/rich-text-editor";
import { Loader2, CheckCircle2, Plus, RefreshCw } from "lucide-react";
import { toast } from "sonner";

export default function AdminDashboard() {
  const {
    state,
    createPage,
    savePage,
    updateMetadata,
    publishPage,
  } = usePageEditor();

  const [isCreating, setIsCreating] = useState(false);
  const [isCreatingChild, setIsCreatingChild] = useState(false);
  const [pageTitle, setPageTitle] = useState("");
  const [childTitle, setChildTitle] = useState("");
  const [metaTitle, setMetaTitle] = useState("");
  const [metaDescription, setMetaDescription] = useState("");
  const [showMetadata, setShowMetadata] = useState(false);

  const handleCreateNewPage = async () => {
    if (!pageTitle.trim()) {
      toast.error("Please enter a page title");
      return;
    }

    setIsCreating(true);
    try {
      const slug = pageTitle.toLowerCase().replace(/\s+/g, "-");
      await createPage({
        title: pageTitle,
        slug,
        contentJson: { type: "doc", content: [] },
      });
      setPageTitle("");
      toast.success("Page created! Start editing below.");
    } catch (error) {
      toast.error("Failed to create page");
    } finally {
      setIsCreating(false);
    }
  };

  const handleCreateChildPage = async () => {
    if (!childTitle.trim()) {
      toast.error("Please enter a child page title");
      return;
    }

    setIsCreatingChild(true);
    try {
      const slug = childTitle.toLowerCase().replace(/\s+/g, "-");
      await createPage({
        title: childTitle,
        slug,
        parentId: state.id || undefined,
        contentJson: { type: "doc", content: [] },
      });
      setChildTitle("");
      setIsCreatingChild(false);
      toast.success("Child page created! Refresh sidebar to see it.", {
        action: {
          label: "Refresh",
          onClick: () => window.location.reload(),
        },
      });
    } catch (error) {
      toast.error("Failed to create child page");
      setIsCreatingChild(false);
    }
  };

  const handleSave = async (html: string, contentJson: Record<string, unknown>) => {
    const excerpt = html
      .replace(/<[^>]*>/g, "")
      .substring(0, 160)
      .trim();
    await savePage(contentJson, excerpt);
  };

  const handlePublish = async () => {
    await publishPage();
  };

  const handleUpdateMetadata = async () => {
    await updateMetadata({
      title: metaTitle || state.title,
      metaTitle: metaTitle || state.title,
      metaDescription: metaDescription,
    });
    setShowMetadata(false);
  };

  // Sync metadata when page loads
  useEffect(() => {
    setMetaTitle(state.title);
  }, [state.title]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 border-b border-zinc-200 dark:border-zinc-800 pb-4">
        <div>
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-white">
            {state.id ? `Editing: ${state.title}` : "New Page Editor"}
          </h1>
          {state.id && (
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
              Status: <span className="font-semibold">{state.status}</span>
            </p>
          )}
        </div>

        <div className="flex items-center gap-3">
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

          {state.status === "DRAFT" && state.id && (
            <button
              onClick={handlePublish}
              disabled={state.isPublishing}
              className="px-4 py-2 rounded-md bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50 transition-colors text-sm font-medium"
            >
              {state.isPublishing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin inline mr-2" />
                  Publishing...
                </>
              ) : (
                "Publish"
              )}
            </button>
          )}

          <button
            onClick={() => setShowMetadata(!showMetadata)}
            className="px-4 py-2 rounded-md border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-sm font-medium"
          >
            {showMetadata ? "Hide" : "SEO"} Settings
          </button>
        </div>
      </div>

      {!state.id ? (
        /* Quick Create New Page */
        <div className="bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800 p-6 space-y-4">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">
            Create New Page
          </h2>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                Page Title
              </label>
              <input
                type="text"
                value={pageTitle}
                onChange={(e) => setPageTitle(e.target.value)}
                placeholder="e.g., Quantum Physics Basics"
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleCreateNewPage();
                }}
                className="w-full rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 py-2 text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <button
              onClick={handleCreateNewPage}
              disabled={!pageTitle.trim() || isCreating}
              className="w-full px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
            >
              {isCreating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin inline mr-2" />
                  Creating...
                </>
              ) : (
                "Create and Edit"
              )}
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* Create Child Page Section */}
          <div className="bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800 p-6 space-y-4">
            <div className="flex items-start gap-3">
              <Plus className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-1 shrink-0" />
              <div className="flex-1">
                <h3 className="font-semibold text-zinc-900 dark:text-white mb-3">
                  Create Child Page
                </h3>
                <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-4">
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
            </div>
          </div>

          {/* SEO Settings */}
          {showMetadata && (
            <div className="bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800 p-6 space-y-4">
              <h3 className="font-semibold text-zinc-900 dark:text-white">
                SEO & Metadata
              </h3>

              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                  Meta Title <span className="text-xs text-zinc-500">({metaTitle.length}/60)</span>
                </label>
                <input
                  type="text"
                  value={metaTitle}
                  onChange={(e) => setMetaTitle(e.target.value.slice(0, 60))}
                  maxLength={60}
                  className="w-full rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 py-2 text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                  Meta Description <span className="text-xs text-zinc-500">({metaDescription.length}/160)</span>
                </label>
                <textarea
                  value={metaDescription}
                  onChange={(e) => setMetaDescription(e.target.value.slice(0, 160))}
                  maxLength={160}
                  rows={2}
                  className="w-full rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 py-2 text-sm resize-none"
                />
              </div>

              <button
                onClick={handleUpdateMetadata}
                className="px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 text-sm font-medium"
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
              contentJson={state.contentJson as Record<string, unknown> | undefined}
              className="min-h-96"
            />
          </div>
        </>
      )}
    </div>
  );
}
