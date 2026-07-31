import React, { Suspense } from "react";
import { notFound } from "next/navigation";
import { PageService } from "@/services/page-service";
import { ArticleView } from "@/components/features/content/article-view";
import { generateArticleJsonLd, generateBreadcrumbJsonLd } from "@/lib/json-ld";
import { Metadata } from "next";

interface PageProps {
  params: Promise<{ slug: string[] }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || "https://lambdaidx.com";

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
  const pageUrl = `${BASE_URL}${page.path}`;
  const publishedTime = page.createdAt ? new Date(page.createdAt).toISOString() : undefined;
  const modifiedTime = page.updatedAt ? new Date(page.updatedAt).toISOString() : undefined;

  return {
    title: `${page.title}${titleSuffix} | LambdaIDX`,
    description: page.excerpt || `Read about ${page.title} on LambdaIDX knowledge platform.`,
    alternates: {
      canonical: pageUrl,
    },
    openGraph: {
      title: `${page.title}${titleSuffix}`,
      description: page.excerpt || `Explora ${page.title} en LambdaIDX.`,
      url: pageUrl,
      siteName: "LambdaIDX",
      type: "article",
      publishedTime,
      modifiedTime,
    },
    twitter: {
      card: "summary_large_image",
      title: page.title,
      description: page.excerpt || "",
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
  const pageUrl = `${BASE_URL}${page.path}`;
  const publishedTime = page.createdAt ? new Date(page.createdAt).toISOString() : undefined;
  const modifiedTime = page.updatedAt ? new Date(page.updatedAt).toISOString() : undefined;

  // Generate Schema.org JSON-LD Structured Data
  const articleJsonLd = generateArticleJsonLd({
    title: page.title,
    description: page.excerpt || `Lectura e investigación de ${page.title} en LambdaIDX.`,
    url: pageUrl,
    datePublished: publishedTime,
    dateModified: modifiedTime,
  });

  const breadcrumbJsonLd = generateBreadcrumbJsonLd(BASE_URL, breadcrumbs);

  return (
    <div className="animate-in fade-in duration-700">
      {/* Schema.org / JSON-LD Rich Snippets Scripts */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />

      <Suspense fallback={<div className="min-h-screen animate-pulse bg-zinc-50/50 dark:bg-zinc-950/20" />}>
        <ArticleView
          title={page.title}
          content=""
          contentJson={page.contentJson as Record<string, unknown>}
          breadcrumbs={breadcrumbs}
          relations={page.relations}
          tags={page.tags}
          resources={page.resources}
        />
      </Suspense>
    </div>
  );
}
