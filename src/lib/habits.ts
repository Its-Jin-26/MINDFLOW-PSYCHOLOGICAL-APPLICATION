import { BASE_URL } from './api';

export type Habit = { id: string; title: string; createdAt: string };
export type HabitToday = Habit & { doneToday: boolean };

async function safeJson(res: Response) {
  try { return await res.json(); } catch { return null; }
}

export async function apiListHabits(token: string) {
  const res = await fetch(`${BASE_URL}/habits`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await safeJson(res);
  if (!res.ok) throw new Error(data?.error || 'No se pudieron obtener los hábitos');
  return data as Habit[];
}

export async function apiCreateHabit(token: string, title: string, goalTitle?: string, dueDate?: string | null) {
  const res = await fetch(`${BASE_URL}/habits`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ title, goalTitle, dueDate }),
  });
  const data = await safeJson(res);
  if (!res.ok) throw new Error(data?.error || 'No se pudo crear el hábito');
  return data as Habit;
}

export async function apiDeleteHabit(token: string, id: string) {
  const res = await fetch(`${BASE_URL}/habits/${id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await safeJson(res);
  if (!res.ok) throw new Error(data?.error || 'No se pudo eliminar el hábito');
  return data as { ok: boolean };
}

export async function apiListHabitsToday(token: string) {
  const res = await fetch(`${BASE_URL}/habits/today`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await safeJson(res);
  if (!res.ok) throw new Error(data?.error || 'No se pudieron obtener los hábitos de hoy');
  return data as HabitToday[];
}

export async function apiCheckinHabit(token: string, id: string) {
  const res = await fetch(`${BASE_URL}/habits/${id}/checkin`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await safeJson(res);
  if (!res.ok) throw new Error(data?.error || 'No se pudo marcar el hábito');
  return data as { ok: boolean };
}

export async function apiUncheckinHabit(token: string, id: string) {
  const res = await fetch(`${BASE_URL}/habits/${id}/checkin`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await safeJson(res);
  if (!res.ok) throw new Error(data?.error || 'No se pudo desmarcar el hábito');
  return data as { ok: boolean };
}
