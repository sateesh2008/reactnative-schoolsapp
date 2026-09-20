import { apiRequest } from "./api";

const DEFAULT_LOGIN_PATH = "/auth/login";
const FALLBACK_LOGIN_PATH = "/login";
const API_BASE_URL = (
  process.env.EXPO_PUBLIC_API_URL || "https://educampus360.com/api"
).replace(/\/+$/, "");

const sanitizeLoginPath = (path) => {
  const normalizedPath = String(path ?? "")
    .trim()
    .replace(/[`]+/g, "")
    .replace(/\/+$/, "");
  if (!normalizedPath) {
    return "";
  }

  return normalizedPath.startsWith("/") ? normalizedPath : `/${normalizedPath}`;
};

const buildFullLoginUrl = (path) => {
  const sanitizedPath = sanitizeLoginPath(path || DEFAULT_LOGIN_PATH);
  if (!sanitizedPath) {
    return "";
  }

  return new URL(`${API_BASE_URL}${sanitizedPath}`).toString();
};

export async function login(email, password) {
  const configuredLoginPath = sanitizeLoginPath(
    process.env.EXPO_PUBLIC_LOGIN_PATH,
  );
  const loginPaths = Array.from(
    new Set(
      [
        configuredLoginPath || DEFAULT_LOGIN_PATH,
        DEFAULT_LOGIN_PATH,
        FALLBACK_LOGIN_PATH,
      ].filter(Boolean),
    ),
  );

  let lastError;

  for (const loginPath of loginPaths) {
    try {
      return await apiRequest(loginPath, {
        method: "POST",
        body: { email, password },
      });
    } catch (error) {
      lastError = error;
      if (error?.status !== 404) {
        throw error;
      }
    }
  }

  if (lastError?.status === 404) {
    lastError.message = `Login endpoint was not found at ${buildFullLoginUrl(DEFAULT_LOGIN_PATH)}. Please confirm the backend route is available.`;
  }

  throw lastError;
}
