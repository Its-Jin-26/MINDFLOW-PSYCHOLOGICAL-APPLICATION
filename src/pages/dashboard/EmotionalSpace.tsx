import { useEffect, useState } from 'react';
import { authStorage } from '../../lib/api';
import { apiCreateMood, apiGetLatestMood, getMoodLabel, type Mood } from '../../lib/moods.ts';
import { Smile, Meh, Frown, Sun, CloudRain, Heart, ThumbsUp, Brain } from 'lucide-react';

const MOODS: { key: string; label: string; icon: JSX.Element }[] = [
  { key: 'FELIZ', label: 'Feliz', icon: <Smile className="h-6 w-6" /> },
  { key: 'NEUTRAL', label: 'Neutral', icon: <Meh className="h-6 w-6" /> },
  { key: 'TRISTE', label: 'Triste', icon: <Frown className="h-6 w-6" /> },
  { key: 'ENERGETICO', label: 'Energético', icon: <Sun className="h-6 w-6" /> },
  { key: 'PENSATIVO', label: 'Pensativo', icon: <Brain className="h-6 w-6" /> },
  { key: 'ABRUMADO', label: 'Abrumado', icon: <CloudRain className="h-6 w-6" /> },
  { key: 'AMADO', label: 'Amado', icon: <Heart className="h-6 w-6" /> },
  { key: 'OPTIMISTA', label: 'Optimista', icon: <ThumbsUp className="h-6 w-6" /> },
];

export default function EmotionalSpace() {
  const [selected, setSelected] = useState<string | null>(null);
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [latestMood, setLatestMood] = useState<Mood>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const token = authStorage.getToken();
    if (!token) return;
    apiGetLatestMood(token)
      .then((m) => {
        if (m) {
          setLatestMood(m);
        }
      })
      .catch(() => {})
      .finally(() => {
        setLoaded(true);
      });
  }, []);

  async function onSave(e: React.FormEvent) {
    e.preventDefault();
    if (!selected) return;
    setSaving(true);
    setMessage(null);
    try {
      const token = authStorage.getToken();
      if (!token) throw new Error('Sesión no válida');
      const saved = await apiCreateMood(token, { type: selected, note });
      setLatestMood(saved);
      setMessage('Estado emocional guardado');
      // Reset completo del formulario
      setSelected(null);
      setNote('');
    } catch (err: any) {
      setMessage(err?.message || 'No se pudo guardar');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div
      className={`space-y-6 md:space-y-4 transform transition-all duration-300 ${
        loaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
      }`}
    >
      <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Espacio Emocional</h1>

      <div className="rounded-xl bg-white p-6 md:p-5 ring-1 ring-slate-200 dark:bg-slate-900/60 dark:ring-black/20">
        <div className="mb-4 text-base font-semibold text-slate-900 dark:text-slate-100">¿Cómo te sientes hoy?</div>

        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {MOODS.map((m: typeof MOODS[number]) => {
            const active = selected === m.key;
            return (
              <button
                key={m.key}
                onClick={() => setSelected(m.key)}
                className={`flex items-center justify-center gap-2 rounded-lg border px-4 py-4 transition ${
                  active
                    ? 'border-purple-500 bg-purple-50 text-purple-700 dark:bg-purple-700/20 dark:text-purple-300'
                    : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                <span className={active ? 'text-purple-600 dark:text-purple-400' : 'text-slate-500 dark:text-slate-300'}>{m.icon}</span>
                <span className="text-sm font-medium">{m.label}</span>
              </button>
            );
          })}
        </div>

        <div className="mt-6 text-sm font-medium text-slate-700 dark:text-slate-200">¿Quieres agregar una nota sobre cómo te sientes?</div>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          rows={1}
          placeholder="Escribe aquí tus pensamientos..."
          className="mt-2 w-full rounded-md border border-slate-200 bg-white p-3 text-slate-900 placeholder:text-slate-400 outline-none focus:border-slate-400 focus:ring-2 focus:ring-purple-600/30 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-400"
        />

        {message && (
          <div className="mt-4 text-sm text-emerald-600 dark:text-emerald-400">
            {message}
          </div>
        )}

        <button
          onClick={onSave}
          disabled={!selected || saving}
          className="mt-4 rounded-md bg-purple-600 px-4 py-2.5 font-semibold text-white shadow-lg shadow-purple-900/30 transition hover:bg-purple-500 disabled:opacity-60"
        >
          {saving ? 'Guardando...' : 'Guardar Estado Emocional'}
        </button>
        {latestMood && (
          <div className="mt-6 md:mt-4 rounded-lg bg-slate-50 p-4 text-sm text-slate-700 dark:bg-slate-800/80 dark:text-slate-100">
            <div className="font-semibold text-slate-900 dark:text-slate-50">Último estado guardado</div>
            <div className="mt-1">
              <span className="font-medium">Estado:</span> {getMoodLabel(latestMood.type)}
            </div>
            {latestMood.note && (
              <div className="mt-1">
                <span className="font-medium">Nota:</span> {latestMood.note}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
