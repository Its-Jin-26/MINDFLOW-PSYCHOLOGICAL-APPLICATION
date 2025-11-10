export const BASE_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:3000';

export type LoginInput = { identifier: string; password: string };
export type RegisterInput = { name: string; identifier: string; password: string };

export async function apiLogin(input: LoginInput) {
  const res = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  if (!res.ok) {
    const data = await safeJson(res);
    throw new Error(data?.error || 'Error en login');
  }
  return res.json() as Promise<{ token: string; user: { id: string; name: string | null; identifier: string } }>;
}

export async function apiRegister(input: RegisterInput) {
  const res = await fetch(`${BASE_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  if (!res.ok) {
    const data = await safeJson(res);
    throw new Error(data?.error || 'Error en registro');
  }
  return res.json() as Promise<{ token: string; user: { id: string; name: string | null; identifier: string } }>;
}

export async function apiMe(token: string) {
  const res = await fetch(`${BASE_URL}/auth/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error('No autenticado');
  return res.json() as Promise<{ id: string; name: string | null; identifier: string }>;
}

async function safeJson(res: Response) {
  try { return await res.json(); } catch { return null; }
}

export const authStorage = {
  getToken(): string | null {
    try { return localStorage.getItem('token'); } catch { return null; }
  },
  setToken(token: string) {
    try { localStorage.setItem('token', token); } catch {}
  },
  clear() {
    try { localStorage.removeItem('token'); } catch {}
  },
};

export async function apiUpdateUser(token: string, input: { name?: string | null; identifier?: string | null }) {
  const res = await fetch(`${BASE_URL}/user`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify(input),
  });
  const data = await safeJson(res);
  if (!res.ok) throw new Error(data?.error || 'No se pudo actualizar');
  return data as { id: string; name: string | null; identifier: string };
}

export async function apiResetUser(token: string) {
  const res = await fetch(`${BASE_URL}/user/reset`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await safeJson(res);
  if (!res.ok) throw new Error(data?.error || 'No se pudo resetear');
  return data as { ok: boolean };
}

export async function apiDeleteUser(token: string) {
  const res = await fetch(`${BASE_URL}/user`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await safeJson(res);
  if (!res.ok) throw new Error(data?.error || 'No se pudo eliminar la cuenta');
  return data as { ok: boolean };
}
