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

  const dayLabels = useMemo(() => {
    const labels = data?.labels || ['dom', 'lun', 'mar', 'mié', 'jue', 'vie', 'sáb'];
    return labels;
  }, [data]);

  const safePercent = Math.max(0, Math.min(100, Math.round(data?.weeklyAverage || 0)));
  const safeStreak = Math.max(0, Math.floor(data?.streakDays || 0));
  const totalSteps = 7;
  const completedSteps = Math.min(totalSteps, safeStreak);

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
        <div className="mb-6 text-base font-semibold text-slate-900 dark:text-slate-100">Progreso Semanal</div>
        
        {loading ? (
          <div className="text-slate-500 dark:text-slate-400">Cargando...</div>
        ) : error ? (
          <div className="text-rose-500">{error}</div>
        ) : (
          <div className="space-y-8">
            {/* Contenedor principal de pasos */}
            <div className="relative flex w-full justify-between items-start">
              
              {/* LÍNEA DE CONEXIÓN ENTRE NÚMEROS: Empieza en el centro del 1 y termina en el centro del 7 */}
              <div 
                className="absolute top-4 sm:top-[18px] h-[2px] bg-slate-800 z-0"
                style={{ 
                  left: `${100 / (totalSteps * 2)}%`, 
                  right: `${100 / (totalSteps * 2)}%` 
                }}
              >
                <div 
                  className="h-full bg-purple-500 transition-all duration-500 ease-out"
                  style={{ width: `${Math.max(0, (completedSteps - 1) / (totalSteps - 1)) * 100}%` }}
                />
              </div>

              {Array.from({ length: totalSteps }).map((_, index) => {
                const step = index + 1;
                const isCompleted = step <= completedSteps && completedSteps > 0;
                const isActive = !isCompleted && step === (completedSteps === totalSteps ? totalSteps : completedSteps + 1);

                return (
                  <div key={step} className="flex flex-1 flex-col items-center z-10">
                    <div className="flex items-center justify-center w-full">
                      <div
                        className={`flex h-8 w-8 sm:h-9 sm:w-9 shrink-0 items-center justify-center rounded-md text-xs sm:text-sm font-semibold ring-1 transition-colors ${
                          isCompleted
                            ? 'bg-purple-600 text-white ring-purple-500' 
                            : isActive
                            ? 'bg-slate-900 text-purple-500 ring-purple-500/50' 
                            : 'bg-slate-900 text-slate-400 ring-slate-700'
                        }`}
                      >
                        {isCompleted ? '✓' : step}
                      </div>
                    </div>
                    <div className="mt-3 text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 font-medium text-center">
                      {dayLabels[index] ?? ''}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* BARRA DE PORCENTAJE AL RAS: Ajustada para coincidir con los bordes de los cuadros 1 y 7 */}
            <div className="px-4 sm:px-[18px]"> 
              <div className="flex items-center gap-3 pt-2">
                <div className="relative h-2.5 flex-1 overflow-hidden rounded-full bg-slate-900/40">
                  <div
                    className="absolute inset-y-0 left-0 rounded-full bg-purple-500 transition-all duration-700 ease-out"
                    style={{ width: `${safePercent}%` }}
                  />
                </div>
                <div className="text-xs sm:text-sm font-bold text-slate-300 min-w-[35px] text-right">
                  {safePercent}%
                </div>
              </div>
            </div>
          </div>
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
