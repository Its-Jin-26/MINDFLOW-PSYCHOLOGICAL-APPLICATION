import { useEffect, useState } from 'react';
import { authStorage } from '../../lib/api';
import { apiDeleteGoal, apiListGoals, Goal } from '../../lib/goals';
import { Trash2 } from 'lucide-react';

export default function GoalsPage() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);

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
      setLoaded(true);
    }
  }

  useEffect(() => { load(); }, []);

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
    <div
      className={`space-y-6 transform transition-all duration-300 ${
        loaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
      }`}
    >
      <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Objetivos y Planificación</h1>
      {error && <div className="text-sm text-rose-500">{error}</div>}

      <div className="rounded-xl bg-white p-5 ring-1 ring-slate-200 dark:bg-slate-900/60 dark:ring-black/20">
        {loading ? (
          <div className="text-slate-500 dark:text-slate-400">Cargando...</div>
        ) : goals.length === 0 ? (
          <div className="text-slate-500 dark:text-slate-400">No hay objetivos registrados. Crea hábitos con objetivos para verlos aquí.</div>
        ) : (
          <ul className="divide-y divide-slate-200 dark:divide-slate-800">
            {goals.map((g) => (
              <li key={g.id} className="flex items-center justify-between py-3">
                <div>
                  <div className="font-medium text-slate-900 dark:text-slate-100">{g.title}</div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">
                    {g.dueDate ? new Date(g.dueDate).toLocaleDateString() : 'Sin fecha límite'}
                    {' · Estado: '}
                    {g.status === 'DONE' ? 'Logrado' : 'En progreso'}
                  </div>
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
