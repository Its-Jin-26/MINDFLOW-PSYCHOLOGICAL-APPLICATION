import { BASE_URL } from './api';

export type MoodInput = { type: string; note?: string | null };
export type Mood = { id: string; type: string; note: string | null; date: string } | null;

async function safeJson(res: Response) {
  try { return await res.json(); } catch { return null; }
}

export async function apiCreateMood(token: string, input: MoodInput) {
  const res = await fetch(`${BASE_URL}/moods`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify(input),
  });
  const data = await safeJson(res);
  if (!res.ok) throw new Error(data?.error || 'No se pudo guardar el estado de ánimo');
  return data as NonNullable<Mood>;
}

export async function apiGetLatestMood(token: string) {
  const res = await fetch(`${BASE_URL}/moods/latest`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await safeJson(res);
  if (!res.ok) throw new Error(data?.error || 'No se pudo obtener el estado de ánimo');
  return data as Mood;
}
