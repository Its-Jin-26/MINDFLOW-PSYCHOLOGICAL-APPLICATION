import { Brain } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { apiLogin, authStorage } from '../lib/api';

export default function LoginPage() {
  const navigate = useNavigate();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-purple-500 via-purple-600 to-violet-700 flex items-center justify-center p-4">
      <div className="w-full max-w-md rounded-xl bg-slate-900/95 p-8 shadow-2xl ring-1 ring-black/10">
        <div className="mb-6 flex items-center justify-center gap-3">
          <div className="rounded-full bg-slate-800 p-3 ring-1 ring-white/10">
            <Brain className="h-7 w-7 text-white" />
          </div>
          <h1 className="text-3xl font-extrabold text-white">MindFlow</h1>
        </div>

        <form
          className="space-y-5"
          onSubmit={async (e) => {
            e.preventDefault();
            setError(null);
            setLoading(true);
            try {
              const res = await apiLogin({ identifier, password });
              authStorage.setToken(res.token);
              navigate('/app/dashboard');
            } catch (err:any) {
              setError(err?.message || 'Error en login');
            } finally {
              setLoading(false);
            }
          }}
        >
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-200">
              Correo Electrónico o Número de Teléfono
            </label>
            <input
              type="text"
              value={identifier}
              onChange={(e)=>setIdentifier(e.target.value)}
              placeholder="correo@ejemplo.com o número de 10 dígitos"
              className="w-full rounded-md border border-slate-700 bg-slate-800/80 px-4 py-2.5 text-slate-100 placeholder:text-slate-400 outline-none focus:border-slate-500 focus:ring-2 focus:ring-purple-600/40"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-200">Contraseña</label>
            <input
              type="password"
              value={password}
              onChange={(e)=>setPassword(e.target.value)}
              placeholder="********"
              className="w-full rounded-md border border-slate-700 bg-slate-800/80 px-4 py-2.5 text-slate-100 placeholder:text-slate-400 outline-none focus:border-slate-500 focus:ring-2 focus:ring-purple-600/40"
            />
          </div>

          {error && <div className="text-sm text-rose-400">{error}</div>}

          <button
            type="submit"
            disabled={loading}
            className="mt-2 w-full rounded-md bg-purple-600 px-4 py-2.5 font-semibold text-white shadow-lg shadow-purple-900/30 transition hover:bg-purple-500 disabled:opacity-60 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-offset-2 focus:ring-offset-slate-900"
          >
            {loading ? 'Ingresando...' : 'Iniciar Sesión'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-400">
          ¿No tienes cuenta?{' '}
          <Link to="/app/register" className="font-medium text-slate-200 hover:underline">
            Regístrate
          </Link>
        </p>
      </div>
    </div>
  );
}
