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
