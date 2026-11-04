export const getApiUrl = () => {
  if (typeof window !== 'undefined') {
    return (process.env.NEXT_PUBLIC_API_URL && process.env.NEXT_PUBLIC_API_URL !== "undefined")
      ? process.env.NEXT_PUBLIC_API_URL
      : `http://${window.location.hostname}:3001/api/v1`;
  }
  return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';
};

export const API_URL = getApiUrl();

/**
 * Obtiene el ID de la sucursal activa persistido en el cliente.
 */
export const getAdminActiveBranchId = (): string | null => {
  if (typeof window === "undefined") return null;
  return (
    localStorage.getItem("taptrade_active_branch_id") ||
    localStorage.getItem("admin_active_store_id") ||
    null
  );
};

/**
 * Construye los encabezados estándar de autenticación y contexto de sucursal para el panel de administración.
 */
export const getAdminAuthHeaders = (
  extraHeaders?: Record<string, string>,
  targetStoreId?: string | null
): Record<string, string> => {
  const token = typeof window !== "undefined" ? localStorage.getItem("admin_token") : null;
  const activeBranchId = targetStoreId !== undefined ? targetStoreId : getAdminActiveBranchId();

  const headers: Record<string, string> = {
    "x-auth-scope": "admin",
    ...(extraHeaders || {}),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  if (activeBranchId) {
    headers["x-store-id"] = activeBranchId;
  }

  return headers;
};

/**
 * Función fetch estandarizada para el panel de administración que incluye automáticamente
 * credenciales (cookies), token de autenticación y el header x-store-id de la sucursal activa.
 * Resuelve automáticamente URLs relativas anteponiendo API_URL.
 */
export const adminFetch = async (
  input: RequestInfo | URL,
  init: RequestInit = {},
  targetStoreId?: string | null
): Promise<Response> => {
  let resolvedInput: RequestInfo | URL = input;

  if (typeof input === "string") {
    if (!input.startsWith("http://") && !input.startsWith("https://")) {
      const normalizedPath = input.startsWith("/") ? input : `/${input}`;
      resolvedInput = `${API_URL}${normalizedPath}`;
    }
  }

  const mergedHeaders = getAdminAuthHeaders(
    (init.headers as Record<string, string>) || {},
    targetStoreId
  );

  if (init.body && !(init.body instanceof FormData) && !mergedHeaders["Content-Type"]) {
    mergedHeaders["Content-Type"] = "application/json";
  }

  return fetch(resolvedInput, {
    ...init,
    credentials: init.credentials || "include",
    headers: mergedHeaders,
  });
};
