import { BASE_URL } from './api';

export type Goal = { id: string; title: string; dueDate: string | null; status: string; createdAt: string };

async function safeJson(res: Response) {
  try { return await res.json(); } catch { return null; }
}

export async function apiListGoals(token: string) {
  const res = await fetch(`${BASE_URL}/goals`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await safeJson(res);
  if (!res.ok) throw new Error(data?.error || 'No se pudieron obtener los objetivos');
  return data as Goal[];
}

export async function apiCreateGoal(token: string, input: { title: string; dueDate?: string | null }) {
  const res = await fetch(`${BASE_URL}/goals`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify(input),
  });
  const data = await safeJson(res);
  if (!res.ok) throw new Error(data?.error || 'No se pudo crear el objetivo');
  return data as Goal;
}

export async function apiDeleteGoal(token: string, id: string) {
  const res = await fetch(`${BASE_URL}/goals/${id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await safeJson(res);
  if (!res.ok) throw new Error(data?.error || 'No se pudo eliminar el objetivo');
  return data as { ok: boolean };
}
