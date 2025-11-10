import { useEffect, useState } from 'react';
import { apiDeleteUser, apiMe, apiResetUser, apiUpdateUser, authStorage } from '../../lib/api';
import { useNavigate } from 'react-router-dom';
import ConfirmDialog from '../../components/ConfirmDialog';

export default function SettingsPage() {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [identifier, setIdentifier] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [openReset, setOpenReset] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);

  useEffect(() => {
    const token = authStorage.getToken();
    if (!token) return navigate('/app/login', { replace: true });
    apiMe(token)
      .then((u) => {
        setName(u.name || '');
        setIdentifier(u.identifier || '');
      })
      .catch(() => {
        authStorage.clear();
        navigate('/app/login', { replace: true });
      });
  }, [navigate]);

  async function onSave(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setSaving(true);
    try {
      const token = authStorage.getToken();
      if (!token) throw new Error('Sesión no válida');
      await apiUpdateUser(token, { name, identifier });
      setMessage('Cambios guardados');
    } catch (err: any) {
      setError(err?.message || 'No se pudo guardar');
    } finally {
      setSaving(false);
    }
  }

  async function doReset() {
    setLoading(true);
    setError(null);
    setMessage(null);
    try {
      const token = authStorage.getToken();
      if (!token) throw new Error('Sesión no válida');
      await apiResetUser(token);
      setMessage('Progreso reseteado');
    } catch (err: any) {
      setError(err?.message || 'No se pudo resetear');
    } finally {
      setLoading(false);
      setOpenReset(false);
    }
  }

  async function doDelete() {
    setLoading(true);
    setError(null);
    try {
      const token = authStorage.getToken();
      if (!token) throw new Error('Sesión no válida');
      await apiDeleteUser(token);
      authStorage.clear();
      navigate('/app/login', { replace: true });
    } catch (err: any) {
      setError(err?.message || 'No se pudo eliminar la cuenta');
    } finally {
      setLoading(false);
      setOpenDelete(false);
    }
  }

  return (
    <div className="max-w-2xl space-y-6">
      <h1 className="text-2xl font-bold text-slate-100">Configuración</h1>

      <form onSubmit={onSave} className="space-y-5 rounded-xl bg-slate-900/60 p-5 ring-1 ring-black/20">
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-200">Nombre</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-md border border-slate-700 bg-slate-800/80 px-4 py-2.5 text-slate-100 placeholder:text-slate-400 outline-none focus:border-slate-500 focus:ring-2 focus:ring-purple-600/40"
          />
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-200">Correo o Teléfono</label>
          <input
            type="text"
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            className="w-full rounded-md border border-slate-700 bg-slate-800/80 px-4 py-2.5 text-slate-100 placeholder:text-slate-400 outline-none focus:border-slate-500 focus:ring-2 focus:ring-purple-600/40"
          />
        </div>

        {error && <div className="text-sm text-rose-400">{error}</div>}
        {message && <div className="text-sm text-emerald-400">{message}</div>}

        <button
          type="submit"
          disabled={saving}
          className="rounded-md bg-purple-600 px-4 py-2.5 font-semibold text-white shadow-lg shadow-purple-900/30 transition hover:bg-purple-500 disabled:opacity-60"
        >
          {saving ? 'Guardando...' : 'Guardar Cambios'}
        </button>
      </form>

      <div className="rounded-xl bg-slate-900/60 p-5 ring-1 ring-black/20">
        <h2 className="mb-3 text-lg font-semibold text-slate-100">Acciones de Cuenta</h2>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => setOpenReset(true)}
            disabled={loading}
            className="rounded-md bg-slate-700 px-4 py-2.5 text-slate-100 hover:bg-slate-600 disabled:opacity-60"
          >
            Resetear Progreso
          </button>
          <button
            onClick={() => setOpenDelete(true)}
            disabled={loading}
            className="rounded-md bg-rose-600 px-4 py-2.5 text-white hover:bg-rose-500 disabled:opacity-60"
          >
            Eliminar Cuenta
          </button>
        </div>
      </div>

      {/* Confirm dialogs */}
      <ConfirmDialog
        open={openReset}
        title="Resetear Progreso"
        description="¿Seguro que deseas resetear tu progreso? Esta acción no se puede deshacer."
        confirmText="Sí, resetear"
        cancelText="Cancelar"
        loading={loading}
        onCancel={() => setOpenReset(false)}
        onConfirm={doReset}
      />
      <ConfirmDialog
        open={openDelete}
        title="Eliminar Cuenta"
        description="¿Seguro que deseas eliminar tu cuenta? Esta acción es permanente."
        confirmText="Sí, eliminar"
        cancelText="Cancelar"
        confirmVariant="danger"
        loading={loading}
        onCancel={() => setOpenDelete(false)}
        onConfirm={doDelete}
      />
    </div>
  );
}
