"use client";

import React, { useState } from "react";
import { createPortal } from "react-dom";
import { useRouter, usePathname } from "next/navigation";
import { X, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface PageActionDialogsState {
  type: "add" | "edit" | "delete" | null;
  parentId?: string;
  pageId?: string;
  currentTitle?: string;
}

export interface PageActionDialogHandle {
  openAddDialog: (parentId: string) => void;
  openEditDialog: (pageId: string, currentTitle: string) => void;
  openDeleteDialog: (pageId: string) => void;
}

interface PageActionDialogsProps {
  onPageAdded?: () => void;
  onPageUpdated?: () => void;
  onPageDeleted?: () => void;
  ref?: React.Ref<PageActionDialogHandle>;
}

export const PageActionDialogs = React.forwardRef<PageActionDialogHandle, PageActionDialogsProps>(
  ({ onPageAdded, onPageUpdated, onPageDeleted }, ref) => {
    const [state, setState] = useState<PageActionDialogsState>({ type: null });
    const [title, setTitle] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isMounted, setIsMounted] = useState(false);
    const router = useRouter();
    const pathname = usePathname();

    React.useImperativeHandle(ref, () => ({
      openAddDialog: (parentId: string) => {
        setTitle("");
        setState({ type: "add", parentId });
      },
      openEditDialog: (pageId: string, currentTitle: string) => {
        setTitle(currentTitle);
        setState({ type: "edit", pageId });
      },
      openDeleteDialog: (pageId: string) => {
        setState({ type: "delete", pageId });
      },
    }));

    React.useEffect(() => {
      setIsMounted(true);
    }, []);

    const handleClose = () => {
      setState({ type: null });
      setTitle("");
    };

    const handleAddPage = async () => {
      if (!title.trim()) return;

      setIsLoading(true);
      try {
        const slug = title.toLowerCase().replace(/\s+/g, "-");
        const payload: any = {
          title: title.trim(),
          slug,
          contentJson: { type: "doc", content: [] },
        };
        
        // Only add parentId if it's not empty (for child pages)
        if (state.parentId) {
          payload.parentId = state.parentId;
        }
        
        const response = await fetch("/api/pages", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          throw new Error("Failed to create page");
        }

        toast.success("Page created successfully");
        handleClose();
        onPageAdded?.();
      } catch (error) {
        console.error("Failed to add page:", error);
        toast.error("Failed to create page");
      } finally {
        setIsLoading(false);
      }
    };

    const handleEditPage = async () => {
      if (!title.trim() || !state.pageId) return;

      setIsLoading(true);
      try {
        const response = await fetch(`/api/pages/${state.pageId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: title.trim(),
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to update page");
        }

        toast.success("Page updated successfully");
        handleClose();
        onPageUpdated?.();
      } catch (error) {
        console.error("Failed to edit page:", error);
        toast.error("Failed to update page");
      } finally {
        setIsLoading(false);
      }
    };

    const handleDeletePage = async () => {
      if (!state.pageId) return;

      setIsLoading(true);
      try {
        const response = await fetch(`/api/pages/${state.pageId}`, {
          method: "DELETE",
        });

        if (!response.ok) {
          throw new Error("Failed to delete page");
        }

        toast.success("Page deleted successfully");

        // Check if the deleted page is currently being edited
        const currentPath = pathname;
        const isEditingCurrentPage = currentPath.includes(`/admin/editor/${state.pageId}`);

        handleClose();
        onPageDeleted?.();

        // Redirect to dashboard if the deleted page was being edited
        if (isEditingCurrentPage) {
          router.push("/admin/dashboard");
        }
      } catch (error) {
        console.error("Failed to delete page:", error);
        toast.error("Failed to delete page");
      } finally {
        setIsLoading(false);
      }
    };

    if (state.type === null || !isMounted) return null;

    // Use Portal to render outside of the sidebar tree
    const dialogContent = (
      <>
        {/* Backdrop */}
        <div
          className="fixed inset-0 bg-black/50 z-40 transition-opacity"
          onClick={handleClose}
        />

        {/* Dialog */}
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
          <div 
            className="bg-white dark:bg-zinc-900 rounded-lg shadow-lg max-w-sm w-full border border-zinc-200 dark:border-zinc-800 animate-in fade-in slide-in-from-bottom-4 duration-300 pointer-events-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-zinc-200 dark:border-zinc-800">
              <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">
                {state.type === "add" && "Add New Page"}
                {state.type === "edit" && "Edit Page"}
                {state.type === "delete" && "Delete Page"}
              </h2>
              <button
                onClick={handleClose}
                className="p-1 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-md transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-4">
              {(state.type === "add" || state.type === "edit") && (
                <>
                  {state.type === "add" && !state.parentId && (
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-800 px-3 py-2 rounded-md">
                      Creating a new root science topic
                    </p>
                  )}
                  {state.type === "add" && state.parentId && (
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 bg-blue-50 dark:bg-blue-900/20 px-3 py-2 rounded-md border border-blue-200 dark:border-blue-800">
                      Creating a child page under the selected topic
                    </p>
                  )}
                  <div>
                    <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                      Page Title
                    </label>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="Enter page title..."
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !isLoading) {
                          state.type === "add" ? handleAddPage() : handleEditPage();
                        }
                      }}
                      className="w-full rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 py-2 text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      autoFocus
                    />
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                      Slug will be auto-generated
                    </p>
                  </div>
                </>
              )}

              {state.type === "delete" && (
                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                  Are you sure you want to delete this page? This action cannot be undone.
                </p>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 p-6 border-t border-zinc-200 dark:border-zinc-800">
              <button
                onClick={handleClose}
                disabled={isLoading}
                className="px-4 py-2 rounded-md border border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-white hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (state.type === "add") handleAddPage();
                  else if (state.type === "edit") handleEditPage();
                  else if (state.type === "delete") handleDeletePage();
                }}
                disabled={isLoading || (state.type !== "delete" && !title.trim())}
                className={`px-4 py-2 rounded-md text-white inline-flex items-center gap-2 transition-colors disabled:opacity-50 ${
                  state.type === "delete"
                    ? "bg-red-600 hover:bg-red-700"
                    : "bg-blue-600 hover:bg-blue-700"
                }`}
              >
                {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                {state.type === "add" && "Create Page"}
                {state.type === "edit" && "Update Page"}
                {state.type === "delete" && "Delete Page"}
              </button>
            </div>
          </div>
        </div>
      </>
    );

    return createPortal(dialogContent, document.body);
  }
);

PageActionDialogs.displayName = "PageActionDialogs";
