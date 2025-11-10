import { useEffect, useState } from 'react';
import { authStorage } from '../../lib/api';
import { apiCreateHabit, apiDeleteHabit, apiListHabitsToday, apiCheckinHabit, apiUncheckinHabit, HabitToday } from '../../lib/habits';
import { Trash2 } from 'lucide-react';

export default function HabitsPage() {
  const [habits, setHabits] = useState<HabitToday[]>([]);
  const [title, setTitle] = useState('');
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const token = authStorage.getToken();
      if (!token) throw new Error('Sesión no válida');
      const data = await apiListHabitsToday(token);
      setHabits(data);
    } catch (err: any) {
      setError(err?.message || 'No se pudieron cargar los hábitos');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  async function onCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    setCreating(true);
    setError(null);
    try {
      const token = authStorage.getToken();
      if (!token) throw new Error('Sesión no válida');
      await apiCreateHabit(token, title.trim());
      setTitle('');
      await load();
    } catch (err: any) {
      setError(err?.message || 'No se pudo crear el hábito');
    } finally {
      setCreating(false);
    }
  }

  async function onDelete(id: string) {
    try {
      const token = authStorage.getToken();
      if (!token) throw new Error('Sesión no válida');
      await apiDeleteHabit(token, id);
      setHabits((hs) => hs.filter((h) => h.id !== id));
    } catch (err: any) {
      setError(err?.message || 'No se pudo eliminar el hábito');
    }
  }

  async function toggleDone(habitId: string, next: boolean) {
    try {
      const token = authStorage.getToken();
      if (!token) throw new Error('Sesión no válida');
      if (next) await apiCheckinHabit(token, habitId); else await apiUncheckinHabit(token, habitId);
      setHabits((hs) => hs.map(h => h.id === habitId ? { ...h, doneToday: next } : h));
    } catch (err: any) {
      setError(err?.message || 'No se pudo actualizar el hábito');
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Hábitos Diarios</h1>

      <div className="rounded-xl bg-white p-5 ring-1 ring-slate-200 dark:bg-slate-900/60 dark:ring-black/20">
        <form onSubmit={onCreate} className="flex gap-3">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Describe tu nuevo hábito..."
            className="flex-1 rounded-md border border-slate-300 bg-white px-4 py-2.5 text-slate-900 placeholder:text-slate-400 outline-none focus:border-slate-400 focus:ring-2 focus:ring-purple-600/30 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
          />
          <button
            type="submit"
            disabled={creating}
            className="rounded-md bg-purple-600 px-4 py-2.5 font-semibold text-white hover:bg-purple-500 disabled:opacity-60"
          >
            {creating ? 'Agregando...' : 'Agregar'}
          </button>
        </form>
        {error && <div className="mt-3 text-sm text-rose-500">{error}</div>}
      </div>

      <div className="rounded-xl bg-white p-5 ring-1 ring-slate-200 dark:bg-slate-900/60 dark:ring-black/20">
        {loading ? (
          <div className="text-slate-500 dark:text-slate-400">Cargando...</div>
        ) : habits.length === 0 ? (
          <div className="text-slate-500 dark:text-slate-400">No hay hábitos para hoy. ¡Comienza agregando uno!</div>
        ) : (
          <ul className="divide-y divide-slate-200 dark:divide-slate-800">
            {habits.map((h) => (
              <li key={h.id} className="flex items-center justify-between py-3">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={h.doneToday}
                    onChange={(e) => toggleDone(h.id, e.target.checked)}
                    className="h-5 w-5 accent-purple-600"
                  />
                  <div>
                    <div className="font-medium text-slate-900 dark:text-slate-100">{h.title}</div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">Creado: {new Date(h.createdAt).toLocaleDateString()}</div>
                  </div>
                </div>
                <button onClick={() => onDelete(h.id)} className="rounded-md bg-slate-200 p-2 text-slate-700 hover:bg-slate-300 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700" aria-label="Eliminar">
                  <Trash2 className="h-4 w-4" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
