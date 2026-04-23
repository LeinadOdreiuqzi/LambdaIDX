import { Page } from "@prisma/client";

export interface NavPage extends Pick<Page, 'id' | 'title' | 'slug' | 'parentId' | 'path' | 'depth' | 'sortOrder'> {
  children: NavPage[];
}
