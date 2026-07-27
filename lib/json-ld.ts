interface GenerateArticleJsonLdProps {
  title: string;
  description: string;
  url: string;
  datePublished?: string;
  dateModified?: string;
  authorName?: string;
}

interface BreadcrumbItem {
  title: string;
  href: string;
}

export function generateArticleJsonLd({
  title,
  description,
  url,
  datePublished,
  dateModified,
  authorName = "LambdaIDX Engineering",
}: GenerateArticleJsonLdProps) {
  return {
    "@context": "https://schema.org",
    "@type": "TechArticle",
    headline: title,
    description: description,
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": url,
    },
    datePublished: datePublished || new Date().toISOString(),
    dateModified: dateModified || new Date().toISOString(),
    inLanguage: "es",
    author: {
      "@type": "Organization",
      name: authorName,
      url: "https://lambdaidx.com",
    },
    publisher: {
      "@type": "Organization",
      name: "LambdaIDX",
      url: "https://lambdaidx.com",
      logo: {
        "@type": "ImageObject",
        url: "https://lambdaidx.com/icon.svg",
      },
    },
  };
}

export function generateBreadcrumbJsonLd(baseUrl: string, breadcrumbs: BreadcrumbItem[]) {
  const itemListElement = [
    {
      "@type": "ListItem",
      position: 1,
      name: "Inicio",
      item: baseUrl,
    },
    ...breadcrumbs.map((b, index) => ({
      "@type": "ListItem",
      position: index + 2,
      name: b.title,
      item: b.href.startsWith("http") ? b.href : `${baseUrl}${b.href.startsWith('/') ? b.href : `/${b.href}`}`,
    })),
  ];

  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement,
  };
}
