import { NextResponse } from "next/server";

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  pagination?: {
    total: number;
    page: number;
    limit: number;
  };
}

/**
 * Standardize API responses
 */
export function standardResponse<T>(
  data: T,
  options?: { message?: string; status?: number; pagination?: ApiResponse["pagination"] }
) {
  return NextResponse.json(
    {
      success: true,
      data,
      message: options?.message,
      pagination: options?.pagination,
    },
    { status: options?.status || 200 }
  );
}

/**
 * Standardize API error responses
 */
export function errorResponse(error: string, status: number = 500) {
  return NextResponse.json(
    {
      success: false,
      error,
    },
    { status }
  );
}

/**
 * Retry utility with exponential backoff for transient failures (like API quotas/rate limits)
 */
export async function withRetry<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  baseDelayMs: number = 500
): Promise<T> {
  let attempt = 0;
  while (attempt < maxRetries) {
    try {
      return await operation();
    } catch (error: unknown) {
      attempt++;
      if (attempt >= maxRetries) {
        throw error;
      }
      
      const message = error instanceof Error ? error.message : String(error);
      // Only retry on typical transient errors (rate limit, timeout, network error)
      if (
        !message.includes("429") && 
        !message.includes("quota") && 
        !message.includes("rate") && 
        !message.includes("fetch") && 
        !message.includes("timeout")
      ) {
        throw error;
      }

      // Exponential backoff
      const delay = baseDelayMs * Math.pow(2, attempt - 1);
      console.info(`Retry attempt ${attempt}/${maxRetries} after ${delay}ms...`);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
  throw new Error("Retry failed");
}

/**
 * A lightweight in-memory cache for frequently accessed API data
 */
export class LightweightCache<T> {
  private cache: Map<string, { value: T; expiresAt: number }>;
  private ttlMs: number;

  constructor(ttlSeconds: number = 300) {
    this.cache = new Map();
    this.ttlMs = ttlSeconds * 1000;
  }

  get(key: string): T | null {
    const item = this.cache.get(key);
    if (!item) return null;
    
    if (Date.now() > item.expiresAt) {
      this.cache.delete(key);
      return null;
    }
    return item.value;
  }

  set(key: string, value: T): void {
    this.cache.set(key, {
      value,
      expiresAt: Date.now() + this.ttlMs,
    });
  }

  clear(): void {
    this.cache.clear();
  }
}

// Singleton instances for shared caches across API routes (in-memory per serverless worker)
export const aiAskCache = new LightweightCache<unknown>(3600); // 1 hour for generic questions
