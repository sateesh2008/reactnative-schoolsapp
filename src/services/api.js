const API_BASE_URL = (
  process.env.EXPO_PUBLIC_API_URL || "https://educampus360.com/api"
).replace(/\/$/, "");

export class ApiError extends Error {
  constructor(message, status, details) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.details = details;
  }
}
export const isApiConfigured = Boolean(API_BASE_URL);

export function resolveApiUrl(path) {
  const value = String(path ?? "").trim();
  if (/^https?:\/\//i.test(value)) return value;

  const baseOrigin = new URL(API_BASE_URL).origin;
  return new URL(
    value.startsWith("/") ? value : `/${value}`,
    baseOrigin,
  ).toString();
}

const errorMessageForStatus = (status) => {
  if (status === 401) return "Your session has expired. Please login again.";
  if (status === 403)
    return "You do not have permission to complete this request.";
  if (status === 404) return "The requested API endpoint was not found.";
  if (status >= 500) return "Something went wrong. Please try again later.";
  return "The request could not be completed. Please try again.";
};

const parseResponseBody = async (response) => {
  const contentType = response.headers.get("content-type") || "";
  const rawBody = await response.text();

  if (!rawBody) {
    return null;
  }

  if (!contentType.includes("application/json")) {
    return rawBody;
  }

  try {
    return JSON.parse(rawBody);
  } catch {
    return rawBody;
  }
};

export async function apiRequest(
  path,
  { method = "GET", token, query, body, signal, headers: extraHeaders } = {},
) {
  if (!API_BASE_URL) {
    return null;
  }

  const normalizedPath = String(path ?? "").trim();
  const cleanPath = normalizedPath.startsWith("/")
    ? normalizedPath
    : `/${normalizedPath}`;
  const url = new URL(`${API_BASE_URL}${cleanPath}`);
  Object.entries(query || {}).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "")
      url.searchParams.set(key, String(value));
  });

  const requestUrl = url.toString();
  if (__DEV__) {
    console.info(`[API] ${method} ${requestUrl}`);
  }

  let response;
  try {
    response = await fetch(requestUrl, {
      method,
      signal,
      headers: {
        Accept: "application/json",
        ...(extraHeaders || {}),
        ...(body ? { "Content-Type": "application/json" } : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      ...(body ? { body: JSON.stringify(body) } : {}),
    });
  } catch (error) {
    if (__DEV__) {
      console.warn(`[API] ${method} ${requestUrl} failed to connect`, error);
    }
    throw new ApiError(
      "Unable to connect to the server. Please check your internet connection and try again.",
      0,
      error,
    );
  }

  const payload = await parseResponseBody(response);

  if (!response.ok) {
    if (__DEV__) {
      console.warn(
        `[API] ${method} ${requestUrl} returned status ${response.status}`,
        payload,
      );
    }

    const payloadMessage =
      payload && typeof payload === "object"
        ? payload.message || payload.error || payload.errors
        : undefined;
    const message = Array.isArray(payloadMessage)
      ? payloadMessage.filter(Boolean).join(" ")
      : typeof payloadMessage === "object"
        ? Object.values(payloadMessage).flat().filter(Boolean).join(" ")
        : payloadMessage;

    throw new ApiError(
      message ||
        `${errorMessageForStatus(response.status)} (${method} ${path})`,
      response.status,
      payload,
    );
  }

  if (__DEV__) {
    console.info(
      `[API] ${method} ${requestUrl} succeeded with status ${response.status}`,
      payload,
    );
  }
  return payload;
}
