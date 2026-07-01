import { useTheme } from '../../context/ThemeContext';

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="theme-toggle" role="group" aria-label="Theme">
      <button
        type="button"
        className={`theme-toggle__btn ${theme === 'light' ? 'theme-toggle__btn--active' : ''}`}
        onClick={() => setTheme('light')}
        aria-label="Light theme"
        aria-pressed={theme === 'light'}
      >
        <span className="material-symbols-outlined text-[18px]">light_mode</span>
      </button>
      <button
        type="button"
        className={`theme-toggle__btn ${theme === 'dark' ? 'theme-toggle__btn--active' : ''}`}
        onClick={() => setTheme('dark')}
        aria-label="Dark theme"
        aria-pressed={theme === 'dark'}
      >
        <span className="material-symbols-outlined text-[18px]">dark_mode</span>
      </button>
    </div>
  );
}
