import { useEffect, useState } from 'react';
import { authStorage } from '../../lib/api';
import { apiCreateGoal, apiDeleteGoal, apiListGoals, Goal } from '../../lib/goals';
import { Trash2, Calendar } from 'lucide-react';

export default function GoalsPage() {
  const [title, setTitle] = useState('');
  const [dueDate, setDueDate] = useState<string>('');
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const token = authStorage.getToken();
      if (!token) throw new Error('Sesión no válida');
      const data = await apiListGoals(token);
      setGoals(data);
    } catch (err: any) {
      setError(err?.message || 'No se pudieron cargar los objetivos');
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
      const newGoal = await apiCreateGoal(token, { title: title.trim(), dueDate: dueDate || null });
      setGoals((gs) => [newGoal, ...gs]);
      setTitle('');
      setDueDate('');
    } catch (err: any) {
      setError(err?.message || 'No se pudo crear el objetivo');
    } finally {
      setCreating(false);
    }
  }

  async function onDelete(id: string) {
    try {
      const token = authStorage.getToken();
      if (!token) throw new Error('Sesión no válida');
      await apiDeleteGoal(token, id);
      setGoals((gs) => gs.filter((g) => g.id !== id));
    } catch (err: any) {
      setError(err?.message || 'No se pudo eliminar el objetivo');
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Objetivos y Planificación</h1>

      <div className="rounded-xl bg-white p-5 ring-1 ring-slate-200 dark:bg-slate-900/60 dark:ring-black/20">
        <form onSubmit={onCreate} className="grid grid-cols-1 gap-3 md:grid-cols-[1fr,14rem,8rem]">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Describe tu objetivo..."
            className="rounded-md border border-slate-300 bg-white px-4 py-2.5 text-slate-900 placeholder:text-slate-400 outline-none focus:border-slate-400 focus:ring-2 focus:ring-purple-600/30 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
          />
          <div className="relative">
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"><Calendar className="h-4 w-4" /></span>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full rounded-md border border-slate-300 bg-white pl-10 pr-3 py-2.5 text-slate-900 placeholder:text-slate-400 outline-none focus:border-slate-400 focus:ring-2 focus:ring-purple-600/30 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
            />
          </div>
          <button
            type="submit"
            disabled={creating}
            className="rounded-md bg-purple-600 px-4 py-2.5 font-semibold text-white hover:bg-purple-500 disabled:opacity-60"
          >
            {creating ? 'Agregando...' : 'Agregar Objetivo'}
          </button>
        </form>
        {error && <div className="mt-3 text-sm text-rose-500">{error}</div>}
      </div>

      <div className="rounded-xl bg-white p-5 ring-1 ring-slate-200 dark:bg-slate-900/60 dark:ring-black/20">
        {loading ? (
          <div className="text-slate-500 dark:text-slate-400">Cargando...</div>
        ) : goals.length === 0 ? (
          <div className="text-slate-500 dark:text-slate-400">No hay objetivos registrados. ¡Comienza agregando uno!</div>
        ) : (
          <ul className="divide-y divide-slate-200 dark:divide-slate-800">
            {goals.map((g) => (
              <li key={g.id} className="flex items-center justify-between py-3">
                <div>
                  <div className="font-medium text-slate-900 dark:text-slate-100">{g.title}</div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">{g.dueDate ? new Date(g.dueDate).toLocaleDateString() : 'Sin fecha límite'}</div>
                </div>
                <button onClick={() => onDelete(g.id)} className="rounded-md bg-slate-200 p-2 text-slate-700 hover:bg-slate-300 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700" aria-label="Eliminar">
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
