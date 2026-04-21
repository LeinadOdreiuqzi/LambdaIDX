import React from "react";
import { notFound } from "next/navigation";
import { PageService } from "@/services/page-service";
import { ArticleView } from "@/components/features/content/article-view";
import { Metadata } from "next";

interface PageProps {
  params: Promise<{ slug: string }>;
}

/**
 * Generate dynamic SEO metadata for each knowledge page.
 */
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const page = await PageService.getPageBySlug(slug);

  if (!page) {
    return {
      title: "Page Not Found | LambdaIDX",
    };
  }

  return {
    title: `${page.title} | LambdaIDX`,
    description: page.excerpt || `Read about ${page.title} on LambdaIDX knowledge platform.`,
    openGraph: {
      title: page.title,
      description: page.excerpt || "",
      type: "article",
    },
  };
}

export default async function KnowledgePage({ params }: PageProps) {
  const { slug } = await params;
  
  // Fetch page data
  const page = await PageService.getPageBySlug(slug);

  if (!page) {
    notFound();
  }

  // Fetch breadcrumbs based on the page path
  const breadcrumbs = await PageService.getBreadcrumbs(page);

  return (
    <div className="animate-in fade-in duration-700">
      <ArticleView 
        title={page.title}
        content={(page as any).content}
        breadcrumbs={breadcrumbs as any}
      />
    </div>
  );
}
