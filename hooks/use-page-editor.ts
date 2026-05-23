import { useState, useCallback } from "react";
import { toast } from "sonner";

export interface PageEditorState {
  id: string | null;
  title: string;
  slug: string;
  contentJson: Record<string, unknown> | null;
  excerpt: string;
  status: string;
  isSaving: boolean;
  isPublishing: boolean;
}

interface UsePageEditorOptions {
  onSaveSuccess?: (page: PageEditorState) => void;
  onPublishSuccess?: (page: PageEditorState) => void;
}

export function usePageEditor(options?: UsePageEditorOptions) {
  const [state, setState] = useState<PageEditorState>({
    id: null,
    title: "",
    slug: "",
    contentJson: null,
    excerpt: "",
    status: "DRAFT",
    isSaving: false,
    isPublishing: false,
  });

  /**
   * Load page from API
   */
  const loadPage = useCallback(async (pageId: string) => {
    try {
      const response = await fetch(`/api/pages/${pageId}`);

      if (!response.ok) {
        throw new Error("Failed to load page");
      }

      const { data } = await response.json();

      setState({
        id: data.id,
        title: data.title,
        slug: data.slug,
        contentJson: data.contentJson,
        excerpt: data.excerpt || "",
        status: data.status,
        isSaving: false,
        isPublishing: false,
      });

      return data;
    } catch (error) {
      console.error("Failed to load page:", error);
      toast.error("Failed to load page");
      throw error;
    }
  }, []);

  /**
   * Create new page
   */
  const createPage = useCallback(
    async (data: {
      title: string;
      slug: string;
      parentId?: string;
      contentJson?: Record<string, unknown>;
      excerpt?: string;
    }) => {
      try {
        const response = await fetch("/api/pages", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });

        if (!response.ok) {
          throw new Error("Failed to create page");
        }

        const { data: page } = await response.json();

        setState({
          id: page.id,
          title: page.title,
          slug: page.slug,
          contentJson: page.contentJson,
          excerpt: page.excerpt || "",
          status: page.status,
          isSaving: false,
          isPublishing: false,
        });

        toast.success("Page created successfully");
        options?.onSaveSuccess?.(state);

        return page;
      } catch (error) {
        console.error("Failed to create page:", error);
        toast.error("Failed to create page");
        throw error;
      }
    },
    [state, options]
  );

  /**
   * Save page content (auto-save from editor)
   */
  const savePage = useCallback(
    async (contentJson: Record<string, unknown>, excerpt?: string) => {
      if (!state.id) {
        toast.error("No page loaded");
        return;
      }

      setState(prev => ({ ...prev, isSaving: true }));

      try {
        const response = await fetch(`/api/pages/${state.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contentJson,
            excerpt: excerpt || state.excerpt,
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to save page");
        }

        const { data } = await response.json();

        setState(prev => ({
          ...prev,
          contentJson: data.contentJson,
          excerpt: data.excerpt,
          isSaving: false,
        }));

        toast.success("Page saved", {
          duration: 2000,
          icon: "✓",
        });

        options?.onSaveSuccess?.(state);
        return data;
      } catch (error) {
        console.error("Failed to save page:", error);
        toast.error("Failed to save page");
        setState(prev => ({ ...prev, isSaving: false }));
        throw error;
      }
    },
    [state, options]
  );

  /**
   * Update page metadata
   */
  const updateMetadata = useCallback(
    async (metadata: {
      title?: string;
      metaTitle?: string;
      metaDescription?: string;
      canonicalUrl?: string;
      isFeatured?: boolean;
    }) => {
      if (!state.id) {
        toast.error("No page loaded");
        return;
      }

      try {
        const response = await fetch(`/api/pages/${state.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(metadata),
        });

        if (!response.ok) {
          throw new Error("Failed to update metadata");
        }

        const { data } = await response.json();

        setState(prev => ({
          ...prev,
          title: data.title,
        }));

        toast.success("Metadata updated");
        return data;
      } catch (error) {
        console.error("Failed to update metadata:", error);
        toast.error("Failed to update metadata");
        throw error;
      }
    },
    [state]
  );

  /**
   * Publish page
   */
  const publishPage = useCallback(async () => {
    if (!state.id) {
      toast.error("No page loaded");
      return;
    }

    setState(prev => ({ ...prev, isPublishing: true }));

    try {
      const response = await fetch(`/api/pages/${state.id}/publish`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) {
        throw new Error("Failed to publish page");
      }

      const { data } = await response.json();

      setState(prev => ({
        ...prev,
        status: data.status,
        isPublishing: false,
      }));

      toast.success("Page published successfully!");
      options?.onPublishSuccess?.(state);

      return data;
    } catch (error) {
      console.error("Failed to publish page:", error);
      toast.error("Failed to publish page");
      setState(prev => ({ ...prev, isPublishing: false }));
      throw error;
    }
  }, [state, options]);

  /**
   * Delete page
   */
  const deletePage = useCallback(async (pageId?: string) => {
    const id = pageId || state.id;

    if (!id) {
      toast.error("No page to delete");
      return;
    }

    try {
      const response = await fetch(`/api/pages/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete page");
      }

      setState({
        id: null,
        title: "",
        slug: "",
        contentJson: null,
        excerpt: "",
        status: "DRAFT",
        isSaving: false,
        isPublishing: false,
      });

      toast.success("Page deleted successfully");
      return true;
    } catch (error) {
      console.error("Failed to delete page:", error);
      toast.error("Failed to delete page");
      throw error;
    }
  }, [state.id]);

  return {
    state,
    setState,
    loadPage,
    createPage,
    savePage,
    updateMetadata,
    publishPage,
    deletePage,
  };
}
