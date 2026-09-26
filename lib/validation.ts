import { z } from "zod";

// Page validation schemas
export const createPageSchema = z.object({
  title: z.string().min(1, "Title is required").max(200, "Title must be less than 200 characters"),
  slug: z.string().min(1, "Slug is required").max(200, "Slug must be less than 200 characters")
    .regex(/^[a-z0-9-]+$/, "Slug must only contain lowercase letters, numbers, and hyphens"),
  parentId: z.string().min(1).max(50).optional(),
  excerpt: z.string().max(500, "Excerpt must be less than 500 characters").optional(),
  contentJson: z.object({ type: z.string(), content: z.array(z.any()) }).passthrough().optional(),
  metaTitle: z.string().max(60, "Meta title must be less than 60 characters").optional(),
  metaDescription: z.string().max(160, "Meta description must be less than 160 characters").optional(),
  status: z.literal("DRAFT").optional(),
});

export const updatePageContentSchema = z.object({
  contentJson: z.object({ type: z.string(), content: z.array(z.any()) }).passthrough().optional(),
  excerpt: z.string().max(500, "Excerpt must be less than 500 characters").optional(),
});

export const updatePageMetadataSchema = z.object({
  title: z.string().min(1, "Title is required").max(200, "Title must be less than 200 characters").optional(),
  metaTitle: z.string().max(60, "Meta title must be less than 60 characters").optional(),
  metaDescription: z.string().max(160, "Meta description must be less than 160 characters").optional(),
  canonicalUrl: z.string().url("Invalid URL format").optional(),
  isFeatured: z.boolean().optional(),
});

export const updatePageHierarchySchema = z.object({
  parentId: z.string().min(1).max(50).optional(),
  sortOrder: z.number().int("Sort order must be an integer").min(0, "Sort order must be non-negative").optional(),
});

// Search validation schema
export const searchSchema = z.object({
  query: z.string().min(1).max(200, "Query must be less than 200 characters"),
  limit: z.coerce.number().int("Limit must be an integer").min(1, "Limit must be at least 1").max(50, "Limit must be at most 50").optional(),
});

// ID validation schema - accepts UUIDs and CUIDs (Prisma default)
export const idSchema = z.string().min(1, "ID is required").max(50, "ID must be less than 50 characters");

// Auth validation schema with length bounding to prevent algorithmic DoS
export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "El correo electrónico es requerido")
    .max(255, "El correo no puede exceder 255 caracteres")
    .email("Formato de correo electrónico inválido"),
  password: z
    .string()
    .min(1, "La contraseña es requerida")
    .max(128, "La contraseña no puede exceder 128 caracteres"),
});

// Safe web URL schema preventing javascript: or data: XSS schemes
export const safeUrlSchema = z
  .string()
  .trim()
  .max(2048, "La URL no puede exceder 2048 caracteres")
  .refine((val) => /^https?:\/\//i.test(val), {
    message: "La URL debe comenzar con http:// o https://",
  });

export const addResourceSchema = z.object({
  title: z.string().trim().min(1, "El título es requerido").max(200, "El título no puede exceder 200 caracteres"),
  url: safeUrlSchema,
  type: z.enum(["WEBSITE", "PDF", "VIDEO", "BOOK", "TOOL", "ARTICLE"]).default("WEBSITE"),
  description: z.string().trim().max(500, "La descripción no puede exceder 500 caracteres").optional(),
});

// Helper function to validate request body
export function validateBody<T>(schema: z.ZodSchema<T>, body: unknown): { success: true; data: T } | { success: false; error: string } {
  const result = schema.safeParse(body);
  if (!result.success) {
    return {
      success: false,
      error: result.error.issues.map((e: z.ZodIssue) => `${e.path.join('.')}: ${e.message}`).join(", "),
    };
  }
  return { success: true, data: result.data };
}

// Helper function to validate query params
export function validateQuery<T>(schema: z.ZodSchema<T>, query: Record<string, string | string[] | undefined>): { success: true; data: T } | { success: false; error: string } {
  const result = schema.safeParse(query);
  if (!result.success) {
    return {
      success: false,
      error: result.error.issues.map((e: z.ZodIssue) => `${e.path.join('.')}: ${e.message}`).join(", "),
    };
  }
  return { success: true, data: result.data };
}
