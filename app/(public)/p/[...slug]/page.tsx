import React, { Suspense } from "react";
import { notFound } from "next/navigation";
import { PageService } from "@/services/page-service";
import { ArticleView } from "@/components/features/content/article-view";
import { Metadata } from "next";

interface PageProps {
  params: Promise<{ slug: string[] }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

/**
 * Generate dynamic SEO metadata for each knowledge page.
 */
export async function generateMetadata({ params, searchParams }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const resolvedSearchParams = await searchParams;
  const pageParam = resolvedSearchParams.page;
  const pageNum = typeof pageParam === "string" ? parseInt(pageParam, 10) : 1;
  const page = await PageService.getPageByNestedSlugs(slug);

  if (!page) {
    return {
      title: "Page Not Found | LambdaIDX",
    };
  }

  const titleSuffix = pageNum > 1 && !isNaN(pageNum) ? ` - Página ${pageNum}` : "";

  return {
    title: `${page.title}${titleSuffix} | LambdaIDX`,
    description: page.excerpt || `Read about ${page.title} on LambdaIDX knowledge platform.`,
    openGraph: {
      title: `${page.title}${titleSuffix}`,
      description: page.excerpt || "",
      type: "article",
    },
  };
}

export default async function KnowledgePage({ params }: PageProps) {
  const { slug } = await params;
  
  // Fetch page data
  const page = await PageService.getPageByNestedSlugs(slug);

  if (!page) {
    notFound();
  }

  // Fetch breadcrumbs based on the page path
  const breadcrumbs = await PageService.getBreadcrumbs({ path: page.path, id: page.id });

  return (
    <div className="animate-in fade-in duration-700">
      <Suspense fallback={<div className="min-h-screen animate-pulse bg-zinc-50/50 dark:bg-zinc-950/20" />}>
        <ArticleView
          title={page.title}
          content=""
          contentJson={page.contentJson as Record<string, unknown>}
          breadcrumbs={breadcrumbs}
        />
      </Suspense>
    </div>
  );
}
