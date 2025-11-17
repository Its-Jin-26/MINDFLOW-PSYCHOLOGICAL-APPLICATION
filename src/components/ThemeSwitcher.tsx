import { Moon, Sun, Laptop } from 'lucide-react';
import { useEffect, useState } from 'react';

type Theme = 'light' | 'dark' | 'system';

function applyTheme(theme: Theme) {
  const root = document.documentElement;
  if (theme === 'system') {
    root.classList.add('dark');
  } else {
    root.classList.toggle('dark', theme === 'dark');
  }
}

export default function ThemeSwitcher() {
  const [theme, setTheme] = useState<Theme>((localStorage.getItem('theme') as Theme) || 'system');

  useEffect(() => {
    applyTheme(theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  return (
    <button
      onClick={() => setTheme(nextTheme(theme))}
      className="inline-flex h-12 w-12 md:h-10 md:w-10 items-center justify-center rounded-md ring-1 bg-slate-200 text-slate-700 ring-slate-300 hover:bg-slate-300 dark:bg-slate-800 dark:text-slate-200 dark:ring-white/10 dark:hover:bg-slate-700"
      aria-label="Cambiar tema"
      title={`Tema: ${theme}`}
    >
      {theme === 'dark' ? <Moon className="h-5 w-5" /> : theme === 'light' ? <Sun className="h-5 w-5" /> : <Laptop className="h-5 w-5" />}
    </button>
  );
}

function nextTheme(t: Theme): Theme {
  if (t === 'light') return 'dark';
  if (t === 'dark') return 'system';
  return 'light';
}
