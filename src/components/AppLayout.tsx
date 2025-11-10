import { Brain, CalendarDays, Gauge, LineChart, LayoutDashboard, User } from 'lucide-react';
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import ThemeSwitcher from './ThemeSwitcher';
import { useEffect, useState } from 'react';
import { apiMe, authStorage } from '../lib/api';

export default function AppLayout() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [userName, setUserName] = useState<string | null>(null);
  const [userIdentifier, setUserIdentifier] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = authStorage.getToken();
    if (!token) return;
    apiMe(token)
      .then((u) => {
        setUserName(u.name || u.identifier);
        setUserIdentifier(u.identifier);
      })
      .catch(() => {
        authStorage.clear();
        navigate('/app/login', { replace: true });
      });
  }, [navigate]);

  const navItem = (
    to: string,
    label: string,
    icon: JSX.Element,
    opts?: { end?: boolean },
  ) => (
    <NavLink
      to={to}
      end={opts?.end}
      className={({ isActive }) =>
        `flex items-center gap-3 rounded-lg px-3 py-2.5 text-base font-medium transition ${
          isActive
            ? 'bg-purple-600/15 ring-1 ring-purple-200 text-slate-900 dark:bg-purple-600/20 dark:ring-purple-700/50 dark:text-slate-100'
            : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800/60 dark:hover:text-slate-100'
        }`
      }
    >
      {icon}
      {label}
    </NavLink>
  );

  return (
    <div className="min-h-screen w-full bg-white text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      {/* Top bar */}
      <header className="flex h-14 items-center justify-between bg-white/90 dark:bg-slate-900/95 px-4 shadow-sm ring-1 ring-slate-200 dark:ring-black/20">
        <Link to="/app/dashboard" className="flex items-center gap-2">
          <div className="rounded bg-purple-700/30 p-1.5">
            <Brain className="h-5 w-5 text-purple-400" />
          </div>
          <span className="font-semibold text-slate-900 dark:text-slate-100">MindFlow</span>
        </Link>

        <div className="flex items-center gap-3">
          <ThemeSwitcher />
          <div className="relative">
            <button
              onClick={() => setMenuOpen((v) => !v)}
              className="inline-flex h-10 w-10 items-center justify-center rounded-md ring-1 bg-slate-200 text-slate-700 ring-slate-300 hover:bg-slate-300 dark:bg-slate-800 dark:text-slate-200 dark:ring-white/10 dark:hover:bg-slate-700"
              aria-label="Usuario"
            >
              <User className="h-5 w-5" />
            </button>
            {menuOpen && (
              <div className="absolute right-0 mt-2 w-56 overflow-hidden rounded-md bg-white dark:bg-slate-900 p-2 text-slate-700 dark:text-slate-200 ring-1 ring-slate-200 dark:ring-black/20 shadow-xl">
                <div className="px-3 py-2 text-sm">
                  <div className="font-semibold">{userName ?? 'Usuario'}</div>
                  <div className="text-slate-400 text-xs">{userIdentifier ?? ''}</div>
                </div>
                <Link to="/app/dashboard/settings" className="block rounded px-3 py-2 text-sm hover:bg-slate-800" onClick={() => setMenuOpen(false)}>
                  Configuración
                </Link>
                <button
                  className="mt-1 w-full rounded px-3 py-2 text-left text-sm text-rose-400 hover:bg-slate-800"
                  onClick={() => {
                    // simple logout placeholder: clear session storage/localStorage and go to login
                    authStorage.clear();
                    setMenuOpen(false);
                    navigate('/app/login');
                  }}
                >
                  Cerrar Sesión
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Body with sidebar */}
      <div className="mx-auto flex w-full max-w-6xl gap-6 px-3 py-6">
        <aside className="w-[16rem] shrink-0">
          <nav className="flex flex-col gap-1.5">
            {navItem('/app/dashboard', 'Dashboard', <LayoutDashboard className="h-5 w-5" />, { end: true })}
            {navItem('/app/dashboard/emotional', 'Espacio Emocional', <Gauge className="h-5 w-5" />)}
            {navItem('/app/dashboard/habits', 'Hábitos Diarios', <CalendarDays className="h-5 w-5" />)}
            {navItem('/app/dashboard/goals', 'Objetivos', <Gauge className="h-5 w-5" />)}
            {navItem('/app/dashboard/progress', 'Progreso', <LineChart className="h-5 w-5" />)}
          </nav>
        </aside>
        <main className="flex-1">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
