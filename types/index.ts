import { Page } from "@prisma/client";

export interface NavPage extends Pick<Page, 'id' | 'title' | 'slug' | 'parentId' | 'path' | 'depth' | 'sortOrder' | 'status'> {
  children: NavPage[];
}

export interface PageContent {
  id: string;
  title: string;
  slug: string;
  contentJson: unknown | null;
  excerpt?: string | null;
  path: string;
  parentId?: string | null;
  status?: string;
  createdAt?: Date | string | null;
  updatedAt?: Date | string | null;
  relations?: { id: string; title: string; slug: string; href?: string; type: string; relationId?: string }[];
  tags?: string[];
  resources?: { title: string; url: string; type: string; description?: string | null }[];
}

export interface BreadcrumbItem {
  title: string;
  slug: string;
  href: string;
}
