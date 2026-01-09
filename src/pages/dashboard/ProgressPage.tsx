import { useEffect, useMemo, useState } from 'react';
import { authStorage } from '../../lib/api';
import { apiGetProgress, ProgressData } from '../../lib/progress';
import { CalendarDays, Award, TrendingUp } from 'lucide-react';

export default function ProgressPage() {
  const [data, setData] = useState<ProgressData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [loaded, setLoaded] = useState(false);

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
        setLoaded(true);
      }
    })();
  }, []);

  const bars = useMemo(() => {
    const series = data?.weeklySeries || Array(7).fill(0);
    return series.map((v, i) => ({ value: v, label: data?.labels?.[i] || '' }));
  }, [data]);

  const dayLabels = useMemo(() => bars.map((b) => b.label || ''), [bars]);

  return (
    <div
      className={`space-y-6 transform transition-all duration-300 ${
        loaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
      }`}
    >
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
          <StepProgress
            percent={data?.weeklyAverage ?? 0}
            streak={data?.streakDays ?? 0}
            labels={dayLabels}
          />
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

function StepProgress({ percent, streak, labels }: { percent: number; streak: number; labels: string[] }) {
  const safePercent = Math.max(0, Math.min(100, Math.round(percent || 0)));
  const safeStreak = Math.max(0, Math.floor(streak || 0));
  const totalSteps = 7;

  // Cada día consecutivo hasta 7 marca un paso como completado
  const completedSteps = Math.min(totalSteps, safeStreak);
  const currentStep = completedSteps === totalSteps ? totalSteps : Math.max(1, completedSteps + 1);

  return (
    <div className="mb-6 space-y-3">
      {/* Steps */}
      <div className="flex items-center justify-between gap-2">
        {Array.from({ length: totalSteps }).map((_, index) => {
          const step = index + 1;
          const isCompleted = step <= completedSteps && completedSteps > 0;
          const isActive = !isCompleted && step === currentStep;
          return (
            <div key={step} className="flex flex-1 flex-col items-center">
              <div className="flex w-full items-center">
                <div
                  className={
                    `flex h-9 w-9 items-center justify-center rounded-md text-sm font-semibold ring-1 transition-colors ` +
                    (isCompleted
                      ? 'bg-purple-600 text-white ring-purple-500'
                      : isActive
                        ? 'bg-purple-600/10 text-purple-500 ring-purple-500/50'
                        : 'bg-slate-900/40 text-slate-400 ring-slate-700')
                  }
                >
                  {isCompleted ? '✓' : step}
                </div>
                {step !== totalSteps && (
                  <div className="mx-2 h-[2px] flex-1 rounded-full bg-slate-800">
                    <div
                      className={
                        'h-full rounded-full transition-colors ' +
                        (step < currentStep ? 'bg-purple-500' : 'bg-slate-700')
                      }
                    />
                  </div>
                )}
              </div>
              <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                {labels[index] ?? ''}
              </div>
            </div>
          );
        })}
      </div>

      {/* Percentage bar */}
      <div className="flex items-center gap-3">
        <div className="relative h-3 flex-1 overflow-hidden rounded-full bg-slate-900/40">
          <div
            className="absolute inset-y-0 left-0 rounded-full bg-purple-500 transition-all"
            style={{ width: `${safePercent}%` }}
          />
        </div>
        <div className="text-sm font-semibold text-slate-300">{safePercent}%</div>
      </div>
    </div>
  );
}
