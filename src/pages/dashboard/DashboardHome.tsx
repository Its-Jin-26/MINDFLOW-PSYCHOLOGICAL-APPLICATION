import { Brain, CalendarDays, Gauge, LineChart } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { apiMe, authStorage } from '../../lib/api';
import { apiGetLatestMood } from '../../lib/moods';
import { apiListHabitsToday } from '../../lib/habits';
import { apiListGoals } from '../../lib/goals';

export default function DashboardHome() {
  const [userName, setUserName] = useState<string | null>(null);
  const [mood, setMood] = useState<string>('—');
  const [habitsDone, setHabitsDone] = useState<string>('—');
  const [openGoals, setOpenGoals] = useState<string>('—');

  useEffect(() => {
    const token = authStorage.getToken();
    if (!token) return;
    apiMe(token).then((u) => setUserName(u.name || u.identifier)).catch(() => {});
    (async () => {
      try {
        const [m, today, goals] = await Promise.all([
          apiGetLatestMood(token),
          apiListHabitsToday(token),
          apiListGoals(token),
        ]);
        setMood(m ? m.type : '—');
        if (today && Array.isArray(today)) {
          const done = today.filter(t => t.doneToday).length;
          setHabitsDone(`${done}/${today.length}`);
        }
        if (goals && Array.isArray(goals)) {
          const open = goals.filter((g: any) => g.status === 'OPEN').length;
          setOpenGoals(String(open));
        }
      } catch {}
    })();
  }, []);

  return (
    <div className="space-y-6">
      {/* Hero */}
      <div className="rounded-xl bg-gradient-to-r from-purple-700 to-purple-600 px-6 py-6 text-white shadow">
        <h2 className="text-3xl font-extrabold">{`¡Bienvenido${userName ? `, ${userName}` : ''}!`}</h2>
        <p className="mt-1 text-white/80">¿Qué te gustaría hacer hoy?</p>
      </div>

      {/* Grid modules */}
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        <Link to="/app/dashboard/emotional" className="flex items-start gap-4 rounded-xl bg-white p-5 ring-1 ring-slate-200 hover:bg-slate-50 dark:bg-slate-800/70 dark:ring-black/20 dark:hover:bg-slate-800">
          <div className="rounded bg-purple-700/20 p-2 dark:bg-purple-700/30"><Gauge className="h-6 w-6 text-purple-500 dark:text-purple-400" /></div>
          <div>
            <div className="text-lg font-semibold text-slate-900 dark:text-slate-100">Espacio Emocional</div>
            <div className="text-sm text-slate-500 dark:text-slate-400">Registra y analiza tus estados de ánimo diarios</div>
          </div>
        </Link>

        <Link to="/app/dashboard/habits" className="flex items-start gap-4 rounded-xl bg-white p-5 ring-1 ring-slate-200 hover:bg-slate-50 dark:bg-slate-800/70 dark:ring-black/20 dark:hover:bg-slate-800">
          <div className="rounded bg-purple-700/20 p-2 dark:bg-purple-700/30"><CalendarDays className="h-6 w-6 text-purple-500 dark:text-purple-400" /></div>
          <div>
            <div className="text-lg font-semibold text-slate-900 dark:text-slate-100">Hábitos Diarios</div>
            <div className="text-sm text-slate-500 dark:text-slate-400">Desarrolla y mantén hábitos saludables</div>
          </div>
        </Link>

        <Link to="/app/dashboard/goals" className="flex items-start gap-4 rounded-xl bg-white p-5 ring-1 ring-slate-200 hover:bg-slate-50 dark:bg-slate-800/70 dark:ring-black/20 dark:hover:bg-slate-800">
          <div className="rounded bg-purple-700/20 p-2 dark:bg-purple-700/30"><Brain className="h-6 w-6 text-purple-500 dark:text-purple-400" /></div>
          <div>
            <div className="text-lg font-semibold text-slate-900 dark:text-slate-100">Objetivos</div>
            <div className="text-sm text-slate-500 dark:text-slate-400">Establece y alcanza tus metas personales</div>
          </div>
        </Link>

        <Link to="/app/dashboard/progress" className="flex items-start gap-4 rounded-xl bg-white p-5 ring-1 ring-slate-200 hover:bg-slate-50 dark:bg-slate-800/70 dark:ring-black/20 dark:hover:bg-slate-800">
          <div className="rounded bg-purple-700/20 p-2 dark:bg-purple-700/30"><LineChart className="h-6 w-6 text-purple-500 dark:text-purple-400" /></div>
          <div>
            <div className="text-lg font-semibold text-slate-900 dark:text-slate-100">Progreso</div>
            <div className="text-sm text-slate-500 dark:text-slate-400">Visualiza tu evolución y logros</div>
          </div>
        </Link>
      </div>

      {/* Resumen diario (vacío por nuevo usuario) */}
      <section className="space-y-3">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Resumen Diario</h3>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="rounded-lg bg-white p-4 ring-1 ring-slate-200 dark:bg-slate-800/70 dark:ring-black/20">
            <div className="text-sm text-slate-600 dark:text-slate-400">Estado de Ánimo</div>
            <div className="mt-1 text-xl font-semibold text-slate-800 dark:text-slate-300">{mood}</div>
          </div>
          <div className="rounded-lg bg-white p-4 ring-1 ring-slate-200 dark:bg-slate-800/70 dark:ring-black/20">
            <div className="text-sm text-slate-600 dark:text-slate-400">Hábitos Completados</div>
            <div className="mt-1 text-xl font-semibold text-slate-800 dark:text-slate-300">{habitsDone}</div>
          </div>
          <div className="rounded-lg bg-white p-4 ring-1 ring-slate-200 dark:bg-slate-800/70 dark:ring-black/20">
            <div className="text-sm text-slate-600 dark:text-slate-400">Objetivos Activos</div>
            <div className="mt-1 text-xl font-semibold text-slate-800 dark:text-slate-300">{openGoals}</div>
          </div>
        </div>
      </section>
    </div>
  );
}
