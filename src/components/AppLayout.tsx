import { Brain, CalendarDays, Gauge, LineChart, LayoutDashboard, Menu, User, X } from 'lucide-react';
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import ThemeSwitcher from './ThemeSwitcher';
import { useEffect, useState } from 'react';
import { apiMe, authStorage } from '../lib/api';

export default function AppLayout() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [navOpen, setNavOpen] = useState(false);
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
    opts?: { end?: boolean; onClick?: () => void },
  ) => (
    <NavLink
      to={to}
      end={opts?.end}
      onClick={opts?.onClick}
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
      <header className="flex h-20 md:h-14 items-center justify-between bg-white/90 dark:bg-slate-900/95 px-4 shadow-sm ring-1 ring-slate-200 dark:ring-black/20">
        <Link to="/app/dashboard" className="flex items-center gap-2">
          <div className="rounded bg-purple-700/30 p-2 md:p-1.5">
            <Brain className="h-6 w-6 md:h-5 md:w-5 text-purple-400" />
          </div>
          <span className="font-semibold text-lg md:text-base text-slate-900 dark:text-slate-100">MindFlow</span>
        </Link>

        <div className="flex items-center gap-3">
          <ThemeSwitcher />
          <div className="relative">
            <button
              onClick={() => setMenuOpen((v) => !v)}
              className="inline-flex h-12 w-12 md:h-10 md:w-10 items-center justify-center rounded-md ring-1 bg-slate-200 text-slate-700 ring-slate-300 hover:bg-slate-300 dark:bg-slate-800 dark:text-slate-200 dark:ring-white/10 dark:hover:bg-slate-700"
              aria-label="Usuario"
            >
              <User className="h-5 w-5 md:h-5 md:w-5" />
            </button>
            <div
              className={`absolute right-0 mt-2 w-64 overflow-hidden rounded-md bg-white p-3 text-slate-700 ring-1 ring-slate-200 shadow-xl transition-all duration-200 ease-out dark:bg-slate-900 dark:text-slate-200 dark:ring-black/20 hidden md:block ${
                menuOpen ? 'opacity-100 translate-x-0 pointer-events-auto' : 'opacity-0 -translate-x-4 pointer-events-none'
              }`}
            >
              <div className="px-3 py-2 text-sm">
                <div className="text-base font-semibold">{userName ?? 'Usuario'}</div>
                <div className="text-slate-400 text-xs">{userIdentifier ?? ''}</div>
              </div>
              <Link
                to="/app/dashboard/settings"
                className="block rounded px-3 py-2.5 text-sm hover:bg-slate-800"
                onClick={() => setMenuOpen(false)}
              >
                Configuración
              </Link>
              <button
                className="mt-1 w-full rounded px-3 py-2.5 text-left text-sm text-rose-400 hover:bg-slate-800"
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
          </div>
          <button
            onClick={() => setNavOpen((v) => !v)}
            className="inline-flex h-12 w-12 md:h-10 md:w-10 items-center justify-center rounded-md ring-1 bg-slate-200 text-slate-700 ring-slate-300 hover:bg-slate-300 dark:bg-slate-800 dark:text-slate-200 dark:ring-white/10 dark:hover:bg-slate-700 md:hidden"
            aria-label={navOpen ? 'Cerrar menú de navegación' : 'Abrir menú de navegación'}
          >
            {navOpen ? <X className="h-5 w-5 md:h-5 md:w-5" /> : <Menu className="h-5 w-5 md:h-5 md:w-5" />}
          </button>
        </div>
      </header>

      {/* Mobile user menu: slide-in panel from right */}
      <div className="fixed inset-0 z-40 md:hidden pointer-events-none">
        {/* Backdrop */}
        <div
          className={`absolute inset-0 bg-black/30 transition-opacity duration-300 ${
            menuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
          }`}
          onClick={() => setMenuOpen(false)}
        />
        {/* Panel aligned to right */}
        <div className="relative flex h-full justify-end">
          <div
            className={`mt-3 w-72 self-start rounded-l-2xl border-l border-slate-800 bg-slate-950/95 py-5 shadow-xl transition-transform duration-300 ease-out ${
              menuOpen ? 'translate-x-0 pointer-events-auto' : 'translate-x-full pointer-events-none'
            }`}
          >
            <div className="px-4 pb-2 text-sm">
              <div className="text-base font-semibold">{userName ?? 'Usuario'}</div>
              <div className="text-slate-400 text-xs">{userIdentifier ?? ''}</div>
            </div>
            <button
              className="mt-1 block w-full rounded px-4 py-3 text-left text-base hover:bg-slate-800"
              onClick={() => {
                setMenuOpen(false);
                navigate('/app/dashboard/settings');
              }}
            >
              Configuración
            </button>
            <button
              className="mt-1 w-full rounded px-4 py-3 text-left text-base text-rose-400 hover:bg-slate-800"
              onClick={() => {
                authStorage.clear();
                setMenuOpen(false);
                navigate('/app/login');
              }}
            >
              Cerrar Sesión
            </button>
          </div>
        </div>
      </div>

      {/* Mobile navigation: slide-in panel from right */}
      <div className="fixed inset-0 z-40 md:hidden pointer-events-none">
        {/* Backdrop full-screen */}
        <div
          className={`absolute inset-0 bg-black/30 transition-opacity duration-300 ${
            navOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
          }`}
          onClick={() => setNavOpen(false)}
        />
        {/* Panel container aligned to right */}
        <div className="relative flex h-full justify-end">
          <div
            className={`mt-2 w-64 self-start rounded-l-xl border-l border-slate-800 bg-slate-950/95 px-3 py-4 shadow-xl transition-transform duration-300 ease-out ${
              navOpen ? 'translate-x-0 pointer-events-auto' : 'translate-x-full pointer-events-none'
            }`}
          >
            <nav className="mt-2 flex flex-col gap-1.5">
              {navItem('/app/dashboard', 'Dashboard', <LayoutDashboard className="h-5 w-5" />, {
                end: true,
                onClick: () => setNavOpen(false),
              })}
              {navItem('/app/dashboard/emotional', 'Espacio Emocional', <Gauge className="h-5 w-5" />, {
                onClick: () => setNavOpen(false),
              })}
              {navItem('/app/dashboard/habits', 'Hábitos Diarios', <CalendarDays className="h-5 w-5" />, {
                onClick: () => setNavOpen(false),
              })}
              {navItem('/app/dashboard/goals', 'Objetivos', <Gauge className="h-5 w-5" />, {
                onClick: () => setNavOpen(false),
              })}
              {navItem('/app/dashboard/progress', 'Progreso', <LineChart className="h-5 w-5" />, {
                onClick: () => setNavOpen(false),
              })}
            </nav>
          </div>
        </div>
      </div>

      {/* Body with sidebar */}
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-3 py-6 md:flex-row">
        <aside className="hidden w-[16rem] shrink-0 md:block">
          <nav className="flex flex-col gap-1.5">
            {navItem('/app/dashboard', 'Dashboard', <LayoutDashboard className="h-5 w-5" />, { end: true })}
            {navItem('/app/dashboard/emotional', 'Espacio Emocional', <Gauge className="h-5 w-5" />)}
            {navItem('/app/dashboard/habits', 'Hábitos Diarios', <CalendarDays className="h-5 w-5" />)}
            {navItem('/app/dashboard/goals', 'Objetivos', <Gauge className="h-5 w-5" />)}
            {navItem('/app/dashboard/progress', 'Progreso', <LineChart className="h-5 w-5" />)}
          </nav>
        </aside>
        <main className="mx-auto w-full max-w-xl flex-1 md:mx-0 md:max-w-none">
          <Outlet />
        </main>
      </div>
    </div>
  );
} 
