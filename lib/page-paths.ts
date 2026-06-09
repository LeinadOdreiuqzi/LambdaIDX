export function buildPublicPageHref(slugSegments: string[]) {
  const normalizedSegments = slugSegments
    .map((segment) => segment.trim())
    .filter(Boolean)
    .map((segment) => encodeURIComponent(segment));

  return normalizedSegments.length > 0
    ? `/p/${normalizedSegments.join("/")}`
    : "/p";
}
