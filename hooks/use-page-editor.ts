import { useState, useCallback } from "react";
import { toast } from "sonner";

export interface PageEditorRelation {
  id: string;
  title: string;
  slug: string;
  type: "RELATED" | "PREREQUISITE" | "NEXT_STEP" | "REFERENCE";
}

export interface PageEditorResource {
  id: string;
  title: string;
  url: string;
  type: "WEBSITE" | "PDF" | "VIDEO" | "BOOK" | "TOOL" | "ARTICLE";
  description?: string;
}

export interface PageEditorState {
  id: string | null;
  title: string;
  slug: string;
  contentJson: Record<string, unknown> | null;
  excerpt: string;
  status: string;
  isSaving: boolean;
  isPublishing: boolean;
  relations: PageEditorRelation[];
  tags: string[];
  resources: PageEditorResource[];
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
    relations: [],
    tags: [],
    resources: [],
  });

  /**
   * Fetch relations, tags, and resources
   */
  const loadRelations = useCallback(async (pageId: string) => {
    try {
      const response = await fetch(`/api/pages/${pageId}/relations`);
      if (response.ok) {
        const { data } = await response.json();
        if (data) {
          setState(prev => ({
            ...prev,
            relations: data.relations || [],
            tags: data.tags || [],
            resources: data.resources || [],
          }));
        }
      }
    } catch (error) {
      console.error("Failed to load relations:", error);
    }
  }, []);

  /**
   * Load page from API
   */
  const loadPage = useCallback(async (pageId: string) => {
    try {
      const response = await fetch(`/api/pages/${pageId}`);

      if (!response.ok) {
        const errorText = await response.text().catch(() => "");
        console.error(`Failed to load page ${pageId}:`, response.status, errorText);
        throw new Error(`Failed to load page (${response.status})`);
      }

      const { data } = await response.json();

      setState(prev => ({
        ...prev,
        id: data.id,
        title: data.title,
        slug: data.slug,
        contentJson: data.contentJson,
        excerpt: data.excerpt || "",
        status: data.status,
        isSaving: false,
        isPublishing: false,
      }));

      // Concurrently load page relations, tags & resources
      await loadRelations(pageId);

      return data;
    } catch (error) {
      console.error("Failed to load page:", error);
      toast.error("Failed to load page");
      throw error;
    }
  }, [loadRelations]);

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

        setState(prev => ({
          ...prev,
          id: page.id,
          title: page.title,
          slug: page.slug,
          contentJson: page.contentJson,
          excerpt: page.excerpt || "",
          status: page.status,
          isSaving: false,
          isPublishing: false,
          relations: [],
          tags: [],
          resources: [],
        }));

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
        relations: [],
        tags: [],
        resources: [],
      });

      toast.success("Page deleted successfully");
      return true;
    } catch (error) {
      console.error("Failed to delete page:", error);
      toast.error("Failed to delete page");
      throw error;
    }
  }, [state.id]);

  /**
   * Relation Mutations
   */
  const addRelation = useCallback(
    async (targetId: string, type: PageEditorRelation["type"]) => {
      if (!state.id) return;
      try {
        const response = await fetch(`/api/pages/${state.id}/relations`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "add_relation",
            payload: { targetId, type },
          }),
        });

        if (response.ok) {
          toast.success("Relación agregada exitosamente");
          await loadRelations(state.id);
        } else {
          toast.error("No se pudo agregar la relación");
        }
      } catch (err) {
        console.error("Add relation error:", err);
        toast.error("Error al agregar relación");
      }
    },
    [state.id, loadRelations]
  );

  const removeRelation = useCallback(
    async (targetId: string, type: PageEditorRelation["type"]) => {
      if (!state.id) return;
      try {
        const response = await fetch(`/api/pages/${state.id}/relations`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "remove_relation",
            payload: { targetId, type },
          }),
        });

        if (response.ok) {
          toast.success("Relación eliminada");
          await loadRelations(state.id);
        }
      } catch (err) {
        console.error("Remove relation error:", err);
      }
    },
    [state.id, loadRelations]
  );

  const addTag = useCallback(
    async (tag: string) => {
      if (!state.id) return;
      try {
        const response = await fetch(`/api/pages/${state.id}/relations`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "add_tag",
            payload: { tag },
          }),
        });

        if (response.ok) {
          toast.success(`Etiqueta #${tag} agregada`);
          await loadRelations(state.id);
        }
      } catch (err) {
        console.error("Add tag error:", err);
      }
    },
    [state.id, loadRelations]
  );

  const removeTag = useCallback(
    async (tag: string) => {
      if (!state.id) return;
      try {
        const response = await fetch(`/api/pages/${state.id}/relations`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "remove_tag",
            payload: { tag },
          }),
        });

        if (response.ok) {
          toast.success(`Etiqueta #${tag} eliminada`);
          await loadRelations(state.id);
        }
      } catch (err) {
        console.error("Remove tag error:", err);
      }
    },
    [state.id, loadRelations]
  );

  const addResource = useCallback(
    async (resource: { title: string; url: string; type: PageEditorResource["type"] }) => {
      if (!state.id) return;
      try {
        const response = await fetch(`/api/pages/${state.id}/relations`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "add_resource",
            payload: resource,
          }),
        });

        if (response.ok) {
          toast.success("Recurso externo agregado");
          await loadRelations(state.id);
        }
      } catch (err) {
        console.error("Add resource error:", err);
      }
    },
    [state.id, loadRelations]
  );

  const removeResource = useCallback(
    async (resourceId: string) => {
      if (!state.id) return;
      try {
        const response = await fetch(`/api/pages/${state.id}/relations`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "remove_resource",
            payload: { resourceId },
          }),
        });

        if (response.ok) {
          toast.success("Recurso eliminado");
          await loadRelations(state.id);
        }
      } catch (err) {
        console.error("Remove resource error:", err);
      }
    },
    [state.id, loadRelations]
  );

  return {
    state,
    setState,
    loadPage,
    loadRelations,
    createPage,
    savePage,
    updateMetadata,
    publishPage,
    deletePage,
    addRelation,
    removeRelation,
    addTag,
    removeTag,
    addResource,
    removeResource,
  };
}
