import { useEffect, useMemo, useState } from 'react';
import { authStorage } from '../../lib/api';
import { apiGetProgress, ProgressData } from '../../lib/progress';
import { CalendarDays, Award, TrendingUp } from 'lucide-react';

export default function ProgressPage() {
  const [data, setData] = useState<ProgressData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const token = authStorage.getToken();
        if (!token) throw new Error('Sesión no válida');
        const d = await apiGetProgress(token);
        setData(d);
      } catch (err: any) {
        setError(err?.message || 'No se pudo cargar el progreso');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const bars = useMemo(() => {
    const series = data?.weeklySeries || Array(7).fill(0);
    return series.map((v, i) => ({ value: v, label: data?.labels?.[i] || '' }));
  }, [data]);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Progreso y Estadísticas</h1>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <MetricCard icon={<CalendarDays className="h-5 w-5" />} title="Días Consecutivos" value={`${data?.streakDays ?? 0} días`} />
        <MetricCard icon={<TrendingUp className="h-5 w-5" />} title="Promedio Semanal" value={`${data?.weeklyAverage ?? 0}%`} />
        <MetricCard icon={<Award className="h-5 w-5" />} title="Logros Totales" value={`${data?.totalAchievements ?? 0}`} />
      </div>

      <div className="rounded-xl bg-white p-5 ring-1 ring-slate-200 dark:bg-slate-900/60 dark:ring-black/20">
        <div className="mb-3 text-base font-semibold text-slate-900 dark:text-slate-100">Progreso Semanal</div>
        {loading ? (
          <div className="text-slate-500 dark:text-slate-400">Cargando...</div>
        ) : error ? (
          <div className="text-rose-500">{error}</div>
        ) : (
          <BarChart data={bars} />
        )}
      </div>
    </div>
  );
}

function MetricCard({ icon, title, value }: { icon: JSX.Element; title: string; value: string }) {
  return (
    <div className="rounded-xl bg-white p-5 ring-1 ring-slate-200 dark:bg-slate-900/60 dark:ring-black/20">
      <div className="flex items-center justify-between">
        <div className="text-sm font-medium text-slate-500 dark:text-slate-400">{title}</div>
        <div className="text-slate-400">{icon}</div>
      </div>
      <div className="mt-2 text-2xl font-bold text-slate-900 dark:text-slate-100">{value}</div>
    </div>
  );
}

function BarChart({ data }: { data: { value: number; label: string }[] }) {
  const max = 100;
  return (
    <div className="mt-2 h-56 w-full">
      <div className="flex h-full items-end gap-3">
        {data.map((d, i) => (
          <div key={i} className="flex w-full flex-col items-center justify-end">
            <div
              className="w-full rounded-t bg-purple-600/80 dark:bg-purple-500/80"
              style={{ height: `${(d.value / max) * 100}%` }}
              title={`${d.value}%`}
            />
            <div className="mt-2 text-xs text-slate-500 dark:text-slate-400">{d.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
