const isDemoMode = import.meta.env.VITE_DEMO_MODE === "true";
const rawApiBase = import.meta.env.VITE_API_BASE_URL;
const fallbackBase =
  typeof window !== "undefined" ? window.location.origin : undefined;
const resolvedApiBase =
  rawApiBase ?? (isDemoMode ? fallbackBase : undefined);

if (!resolvedApiBase) {
  console.error(
    "CRITICAL ERROR: VITE_API_BASE_URL is not defined. Set it in .env or enable demo mode via VITE_DEMO_MODE=true.",
  );
  throw new Error(
    "API Base URL not configured. Define VITE_API_BASE_URL in .env or enable demo mode.",
  );
}

if (!rawApiBase && isDemoMode) {
  console.warn(
    "[Demo Mode] VITE_API_BASE_URL not set. Falling back to window.location.origin for mocked APIs.",
  );
}

export const API_BASE_URL = `${resolvedApiBase}/kawsay`;

export async function handleResponse<T>(response: Response): Promise<T> {
  const url = response.url;
  if (!response.ok) {
    let errorMessage = `API Error: ${response.status} ${response.statusText}`;
    try {
      const errorBody = await response.json();
      errorMessage =
        errorBody?.message ||
        errorBody?.error ||
        errorBody?.title ||
        errorMessage;
    } catch (e) {
      console.warn("Could not parse error body for API error response:", e);
    }
    console.error("API Error Response:", {
      status: response.status,
      statusText: response.statusText,
      url: url,
      errorMessage,
    });
    throw new Error(errorMessage);
  }

  const contentType = response.headers.get("content-type");
  if (contentType && contentType.includes("application/json")) {
    const text = await response.text();
    // Handle cases where the response is valid but the body is empty
    try {
      return text ? (JSON.parse(text) as T) : (null as T);
    } catch (e) {
      console.warn(
        `Could not parse JSON response for ${url} despite content-type header.`,
        e,
      );
      return null as T;
    }
  }

  if (response.status === 204) {
    return null as T; // No content to parse
  }

  // Handle non-JSON responses if necessary, or just return null/empty object
  console.log(
    `Received non-JSON OK response for ${url}, Status: ${response.status}, Content-Type: ${contentType}`,
  );
  return null as T;
}

type CacheEntry = {
  expiresAt: number;
  data: unknown;
};

const responseCache = new Map<string, CacheEntry>();

export type ApiRequestOptions = RequestInit & {
  timeoutMs?: number;
  retries?: number;
  retryDelayMs?: number;
  cacheKey?: string;
  cacheTtlMs?: number;
};

const DEFAULT_TIMEOUT = 10000;
const DEFAULT_RETRY_DELAY = 400;

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const isAbortError = (error: unknown) => {
  if (!error) return false;
  if (typeof DOMException !== "undefined" && error instanceof DOMException) {
    return error.name === "AbortError";
  }
  if (error instanceof Error) {
    return error.name === "AbortError";
  }
  return false;
};

export async function apiRequest<T>(
  url: string,
  options: ApiRequestOptions = {},
): Promise<T> {
  const {
    timeoutMs = DEFAULT_TIMEOUT,
    retries = 0,
    retryDelayMs = DEFAULT_RETRY_DELAY,
    cacheKey,
    cacheTtlMs,
    ...rest
  } = options;

  const method = (rest.method ?? "GET").toUpperCase();
  const finalCacheKey =
    cacheKey ?? (method === "GET" && cacheTtlMs ? `GET:${url}` : undefined);

  if (finalCacheKey) {
    const cached = responseCache.get(finalCacheKey);
    if (cached && cached.expiresAt > Date.now()) {
      return cached.data as T;
    }
    if (cached) {
      responseCache.delete(finalCacheKey);
    }
  }

  let attempt = 0;
  let lastError: unknown = null;

  while (attempt <= retries) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
      const response = await fetch(url, {
        ...rest,
        method,
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      const data = await handleResponse<T>(response);

      if (finalCacheKey && cacheTtlMs) {
        responseCache.set(finalCacheKey, {
          data,
          expiresAt: Date.now() + cacheTtlMs,
        });
      }

      return data;
    } catch (error) {
      lastError = error;
      const shouldRetry = attempt < retries;
      if (!shouldRetry) {
        if (isAbortError(error)) {
          throw new Error("The request timed out. Please try again.");
        }
        throw error instanceof Error
          ? error
          : new Error("Unexpected error while calling API.");
      }
      const delay = retryDelayMs * (attempt + 1);
      await sleep(delay);
      attempt += 1;
    }
  }

  throw lastError instanceof Error
    ? lastError
    : new Error("API request failed after retries.");
}

export function clearApiCache(keys?: string[]) {
  if (!keys) {
    responseCache.clear();
    return;
  }
  keys.forEach((key) => responseCache.delete(key));
}
