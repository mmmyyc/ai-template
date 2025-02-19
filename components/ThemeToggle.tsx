import { useEffect, useState } from 'react';
import { Theme } from '@/types/config';

const themes: Theme[] = [
  "light",
  "dark",
  "cupcake",
  "bumblebee",
  "emerald",
  "corporate",
  "synthwave",
  "retro",
  "cyberpunk",
  "valentine",
  "halloween",
  "garden",
  "forest",
  "aqua",
  "lofi",
  "pastel",
  "fantasy",
  "wireframe",
  "black",
  "luxury",
  "dracula"
];

export default function ThemeToggle() {
  const [currentTheme, setCurrentTheme] = useState<Theme>('light');

  useEffect(() => {
    // 获取当前主题
    const theme = document.documentElement.getAttribute('data-theme') as Theme;
    setCurrentTheme(theme || 'light');
  }, []);

  const handleThemeChange = (theme: Theme) => {
    document.documentElement.setAttribute('data-theme', theme);
    setCurrentTheme(theme);
    // 可选：将主题保存到 localStorage
    localStorage.setItem('theme', theme);
  };

  return (
    <div className="dropdown dropdown-end">
      <div tabIndex={0} role="button" className="btn btn-ghost gap-1 normal-case">
        <svg
          width="20"
          height="20"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          className="inline-block h-5 w-5 stroke-current md:h-6 md:w-6"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01"
          />
        </svg>
        <span className="hidden md:inline">Theme</span>
        <svg
          width="12px"
          height="12px"
          className="ml-1 hidden h-3 w-3 fill-current opacity-60 sm:inline-block"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 2048 2048"
        >
          <path d="M1799 349l242 241-1017 1017L7 590l242-241 775 775 775-775z" />
        </svg>
      </div>
      <div className="dropdown-content bg-base-200 text-base-content rounded-box top-px h-[70vh] max-h-96 w-56 overflow-y-auto shadow-2xl">
        <div className="grid grid-cols-1 gap-3 p-3" tabIndex={0}>
          {themes.map((theme) => (
            <button
              key={theme}
              className={`overflow-hidden rounded-lg text-left ${
                currentTheme === theme ? 'outline outline-2 outline-offset-2 outline-base-content' : ''
              }`}
              onClick={() => handleThemeChange(theme)}
            >
              <div
                data-theme={theme}
                className="bg-base-100 text-base-content w-full cursor-pointer font-sans"
              >
                <div className="grid grid-cols-5 grid-rows-3">
                  <div className="col-span-5 row-span-3 row-start-1 flex items-center gap-2 px-4 py-3">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      className={`h-3 w-3 ${currentTheme === theme ? 'visible' : 'invisible'}`}
                    >
                      <path d="M20.285 2l-11.285 11.567-5.286-5.011-3.714 3.716 9 8.728 15-15.285z" />
                    </svg>
                    <div className="flex-grow text-sm">{theme}</div>
                    <div className="flex h-full flex-shrink-0 flex-wrap gap-1">
                      <div className="bg-primary w-2 rounded" />
                      <div className="bg-secondary w-2 rounded" />
                      <div className="bg-accent w-2 rounded" />
                      <div className="bg-neutral w-2 rounded" />
                    </div>
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
} 