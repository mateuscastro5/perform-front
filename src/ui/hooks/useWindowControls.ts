import { useEffect, useState } from 'react';

const hasElectron = typeof window !== 'undefined' && 'electronAPI' in window;

export function useWindowControls() {
  const [isMaximized, setIsMaximized] = useState(false);

  useEffect(() => {
    if (!hasElectron) return;
    window.electronAPI.window.onMaximized(() => setIsMaximized(true));
    window.electronAPI.window.onUnmaximized(() => setIsMaximized(false));
  }, []);

  const minimize = async () => {
    if (hasElectron) await window.electronAPI.window.minimize();
  };

  const maximize = async () => {
    if (hasElectron) await window.electronAPI.window.maximize();
  };

  const close = async () => {
    if (hasElectron) await window.electronAPI.window.close();
  };

  return { isElectron: hasElectron, isMaximized, minimize, maximize, close };
}
