import { Meilisearch } from "meilisearch";

const meilisearchSingleton = () => {
  const host = process.env.MEILISEARCH_HOST;

  if (!host) {
    return null;
  }

  return new Meilisearch({
    host,
    apiKey: process.env.MEILISEARCH_API_KEY,
    timeout: 5000,
  });
};

type MeilisearchClientSingleton = ReturnType<typeof meilisearchSingleton>;

const globalForMeilisearch = globalThis as unknown as {
  meilisearch: MeilisearchClientSingleton | undefined;
};

export const meilisearch =
  globalForMeilisearch.meilisearch ?? meilisearchSingleton();

export const PAGE_SEARCH_INDEX = "pages";

export function isMeilisearchConfigured() {
  return Boolean(process.env.MEILISEARCH_HOST);
}

export function getPagesSearchIndex() {
  return meilisearch?.index(PAGE_SEARCH_INDEX) ?? null;
}

if (process.env.NODE_ENV !== "production") {
  globalForMeilisearch.meilisearch = meilisearch;
}
