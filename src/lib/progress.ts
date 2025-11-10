import { BASE_URL } from './api';

export type ProgressData = {
  streakDays: number;
  weeklyAverage: number; // 0-100
  totalAchievements: number;
  weeklySeries: number[]; // 7 values 0-100
  labels: string[]; // 7 labels
};

async function safeJson(res: Response) {
  try { return await res.json(); } catch { return null; }
}

export async function apiGetProgress(token: string) {
  const res = await fetch(`${BASE_URL}/progress`, { headers: { Authorization: `Bearer ${token}` } });
  const data = await safeJson(res);
  if (!res.ok) throw new Error(data?.error || 'No se pudo obtener el progreso');
  return data as ProgressData;
}
