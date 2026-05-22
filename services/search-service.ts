import { PageStatus } from "@prisma/client";
import prisma from "@/lib/prisma";
import {
  getPagesSearchIndex,
  isMeilisearchConfigured,
  PAGE_SEARCH_INDEX,
} from "@/lib/meilisearch";
import { getRedisClient } from "@/lib/redis";

interface TipTapNode {
  text?: string;
  content?: TipTapNode[];
}

export interface SearchDocument {
  id: string;
  title: string;
  slug: string;
  path: string;
  excerpt: string;
  content: string;
  depth: number;
  updatedAt: string;
  publishedAt: string | null;
}

export interface SearchResult {
  hits: SearchDocument[];
  query: string;
  limit: number;
  estimatedTotalHits: number;
  processingTimeMs: number;
  source: "meilisearch" | "database";
  cached: boolean;
}

const SEARCH_CACHE_VERSION_KEY = "search:pages:version";
const DEFAULT_SEARCH_LIMIT = 10;
const DEFAULT_CACHE_TTL_SECONDS = 300;

export class SearchService {
  static async searchPages(rawQuery: string, rawLimit?: number): Promise<SearchResult> {
    const query = rawQuery.trim();
    const limit = normalizeLimit(rawLimit);

    if (!query) {
      return {
        hits: [],
        query,
        limit,
        estimatedTotalHits: 0,
        processingTimeMs: 0,
        source: "database",
        cached: false,
      };
    }

    const cacheVersion = await this.getCacheVersion();
    const cacheKey = `search:pages:v${cacheVersion}:${query.toLowerCase()}:${limit}`;
    const redis = await getRedisClient();

    if (redis) {
      const cached = await redis.get(cacheKey);
      if (cached) {
        return {
          ...(JSON.parse(cached) as Omit<SearchResult, "cached">),
          cached: true,
        };
      }
    }

    const searchResult = isMeilisearchConfigured()
      ? await this.searchWithMeilisearch(query, limit)
      : await this.searchWithDatabase(query, limit);

    if (redis) {
      await redis.set(
        cacheKey,
        JSON.stringify({
          ...searchResult,
          cached: false,
        }),
        "EX",
        getCacheTtlSeconds()
      );
    }

    await this.logSearch(query, searchResult.estimatedTotalHits);

    return searchResult;
  }

  static async reindexPublishedPages() {
    const index = getPagesSearchIndex();

    if (!index) {
      throw new Error("Meilisearch is not configured. Set MEILISEARCH_HOST first.");
    }

    if (!process.env.DATABASE_URL) {
      throw new Error("DATABASE_URL is required to reindex published pages.");
    }

    const pages = await prisma.page.findMany({
      where: { status: PageStatus.PUBLISHED },
      select: {
        id: true,
        title: true,
        slug: true,
        path: true,
        excerpt: true,
        contentJson: true,
        depth: true,
        updatedAt: true,
        publishedAt: true,
      },
      orderBy: [{ depth: "asc" }, { sortOrder: "asc" }],
    });

    const documents = pages.map((page) => this.toSearchDocument(page));

    await index.updateSearchableAttributes(["title", "excerpt", "content"]).waitTask();
    await index.updateDisplayedAttributes([
      "id",
      "title",
      "slug",
      "path",
      "excerpt",
      "depth",
      "updatedAt",
      "publishedAt",
    ]).waitTask();
    await index.updateFilterableAttributes(["depth"]).waitTask();
    await index.updateSortableAttributes(["updatedAt", "publishedAt", "depth"]).waitTask();
    await index.addDocuments(documents, { primaryKey: "id" }).waitTask();

    const cacheVersion = await this.bumpCacheVersion();

    return {
      index: PAGE_SEARCH_INDEX,
      indexedCount: documents.length,
      cacheVersion,
    };
  }

  private static async searchWithMeilisearch(query: string, limit: number): Promise<SearchResult> {
    const index = getPagesSearchIndex();

    if (!index) {
      return this.searchWithDatabase(query, limit);
    }

    const startedAt = Date.now();
    const response = await index.search<SearchDocument>(query, {
      limit,
      attributesToHighlight: ["title", "excerpt"],
    });

    return {
      hits: response.hits,
      query,
      limit,
      estimatedTotalHits: response.estimatedTotalHits ?? response.hits.length,
      processingTimeMs: response.processingTimeMs ?? Date.now() - startedAt,
      source: "meilisearch",
      cached: false,
    };
  }

  private static async searchWithDatabase(query: string, limit: number): Promise<SearchResult> {
    const startedAt = Date.now();

    if (!process.env.DATABASE_URL) {
      return {
        hits: [],
        query,
        limit,
        estimatedTotalHits: 0,
        processingTimeMs: Date.now() - startedAt,
        source: "database",
        cached: false,
      };
    }

    const pages = await prisma.page.findMany({
      where: {
        status: PageStatus.PUBLISHED,
        OR: [
          { title: { contains: query, mode: "insensitive" } },
          { excerpt: { contains: query, mode: "insensitive" } },
        ],
      },
      select: {
        id: true,
        title: true,
        slug: true,
        path: true,
        excerpt: true,
        contentJson: true,
        depth: true,
        updatedAt: true,
        publishedAt: true,
      },
      orderBy: [{ depth: "asc" }, { updatedAt: "desc" }],
      take: limit,
    });

    const hits = pages.map((page) => this.toSearchDocument(page));

    return {
      hits,
      query,
      limit,
      estimatedTotalHits: hits.length,
      processingTimeMs: Date.now() - startedAt,
      source: "database",
      cached: false,
    };
  }

  private static toSearchDocument(page: {
    id: string;
    title: string;
    slug: string;
    path: string;
    excerpt: string | null;
    contentJson: unknown;
    depth: number;
    updatedAt: Date;
    publishedAt: Date | null;
  }): SearchDocument {
    return {
      id: page.id,
      title: page.title,
      slug: page.slug,
      path: page.path,
      excerpt: page.excerpt || "",
      content: extractPlainText(page.contentJson),
      depth: page.depth,
      updatedAt: page.updatedAt.toISOString(),
      publishedAt: page.publishedAt?.toISOString() ?? null,
    };
  }

  private static async getCacheVersion() {
    const redis = await getRedisClient();

    if (!redis) {
      return "1";
    }

    const currentVersion = await redis.get(SEARCH_CACHE_VERSION_KEY);
    if (currentVersion) {
      return currentVersion;
    }

    await redis.set(SEARCH_CACHE_VERSION_KEY, "1");
    return "1";
  }

  private static async bumpCacheVersion() {
    const redis = await getRedisClient();

    if (!redis) {
      return "1";
    }

    const nextVersion = await redis.incr(SEARCH_CACHE_VERSION_KEY);
    return String(nextVersion);
  }

  private static async logSearch(query: string, results: number) {
    if (!process.env.DATABASE_URL) {
      return;
    }

    try {
      await prisma.searchLog.create({
        data: {
          query,
          results,
        },
      });
    } catch (error) {
      console.warn("Search log insert failed:", error);
    }
  }
}

function normalizeLimit(limit?: number) {
  if (!limit || Number.isNaN(limit)) {
    return DEFAULT_SEARCH_LIMIT;
  }

  return Math.min(Math.max(limit, 1), 50);
}

function getCacheTtlSeconds() {
  const ttl = Number(process.env.SEARCH_CACHE_TTL_SECONDS);

  if (Number.isNaN(ttl) || ttl <= 0) {
    return DEFAULT_CACHE_TTL_SECONDS;
  }

  return ttl;
}

function extractPlainText(contentJson: unknown): string {
  if (!contentJson || typeof contentJson !== "object") {
    return "";
  }

  const text = walkContentTree(contentJson as TipTapNode).trim();
  return text.replace(/\s+/g, " ");
}

function walkContentTree(node: TipTapNode): string {
  const ownText = node.text || "";
  const childrenText = (node.content || []).map(walkContentTree).join(" ");
  return `${ownText} ${childrenText}`.trim();
}
