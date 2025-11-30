export const API_BASE_URL = import.meta.env.VITE_API_URL || ""; // use Vite proxy when empty

type Json = Record<string, unknown>;

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE_URL}${path}`;
  const res = await fetch(url, {
    headers: { "Content-Type": "application/json", ...(options.headers || {}) },
    credentials: "include",
    ...options,
  });
  if (!res.ok) {
    let message = res.statusText;
    try {
      const data = (await res.json()) as { error?: string };
      if (data?.error) message = data.error;
    } catch {}
    throw new Error(message);
  }
  // 204 No Content safety
  if (res.status === 204) return {} as T;
  return (await res.json()) as T;
}

export function apiLogin(payload: { email: string; password: string }) {
  return request<{ ok: boolean; name: string }>("/api/login", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function apiRegister(payload: {
  name: string;
  email: string;
  phone: string;
  password: string;
}) {
  return request<{ ok: boolean }>("/api/register", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function apiLogout() {
  return request<{ ok: boolean }>("/api/logout", { method: "POST" });
}

export async function apiGetMe() {
  try {
    return await request<{ authenticated: boolean; email?: string; name?: string }>("/api/me");
  } catch (error) {
    // Return unauthenticated response if 401
    return { authenticated: false };
  }
}

export function apiGetResources() {
  return request<{ resources: Array<Record<string, unknown>> }>("/api/resources");
}

export function apiGetMyResources() {
  return request<{ resources: Array<Record<string, unknown>> }>("/api/my-resources");
}

export function apiGetMyRequests() {
  return request<{ requests: Array<Record<string, unknown>> }>("/api/my-requests");
}

export function apiGetIncomingRequests() {
  return request<{ requests: Array<Record<string, unknown>> }>("/api/incoming-requests");
}

export function apiGetIncomingPendingCount() {
  return request<{ count: number }>("/api/incoming-requests/count");
}

export function apiUpdateRequest(requestId: string, action: "approve" | "reject") {
  return request<{ ok: boolean }>(`/api/requests/${requestId}/${action}`, {
    method: "POST",
  });
}

export function apiReturnRequest(requestId: string) {
  return request<{ ok: boolean; days: number; total_due: number; payment_methods: string[] }>(`/api/requests/${requestId}/return`, {
    method: "POST",
  });
}

export function apiCreateRequest(resourceId: string) {
  return request<{ ok: boolean }>("/api/requests", {
    method: "POST",
    body: JSON.stringify({ resource_id: resourceId }),
  });
}

export async function apiCreateResource(payload: {
  title: string;
  description: string;
  category: string;
  price: string | number;
  image?: File | null;
}) {
  const form = new FormData();
  form.append("title", payload.title);
  form.append("description", payload.description);
  form.append("category", payload.category);
  form.append("price", String(payload.price));
  if (payload.image) form.append("image", payload.image);

  const res = await fetch(`${API_BASE_URL}/api/resources`, {
    method: "POST",
    body: form,
    credentials: "include",
  });
  if (!res.ok) {
    let message = res.statusText;
    try {
      const data = (await res.json()) as { error?: string };
      if (data?.error) message = data.error;
    } catch {}
    throw new Error(message);
  }
  return (await res.json()) as { resource: Record<string, unknown> };
}


