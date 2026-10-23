import { useEffect, useState } from 'react';
import axiosClient from '../api/axiosClient';

export const useAntiCapture = () => {
  const [isProtected, setIsProtected] = useState(false);

  useEffect(() => {
    // 1. Context Menu / Right Click Disable
    const handleContextMenu = (e) => {
      e.preventDefault();
      return false;
    };

    // 2. Keystroke interceptor (PrintScreen, Ctrl+P, DevTools, Ctrl+S, Ctrl+U)
    const handleKeyDown = (e) => {
      if (
        e.key === 'PrintScreen' ||
        (e.ctrlKey && ['p', 'P', 's', 'S', 'u', 'U'].includes(e.key)) ||
        (e.ctrlKey && e.shiftKey && ['i', 'I', 'j', 'J', 'c', 'C'].includes(e.key)) ||
        e.key === 'F12'
      ) {
        e.preventDefault();
        setIsProtected(true);
        navigator.clipboard?.writeText?.(''); // Wipe clipboard buffer

        // Notify server of client breach attempt
        axiosClient.post('/secure/log-breach', { reason: `Blocked Hotkey Trigger: ${e.key}` }).catch(() => {});
      }
    };

    // 3. Tab switch or screenshot software focusing outside browser
    const handleVisibilityChange = () => {
      if (document.hidden) {
        setIsProtected(true);
      }
    };

    const handleWindowBlur = () => {
      setIsProtected(true);
    };

    const handleWindowFocus = () => {
      setIsProtected(false);
    };

    window.addEventListener('contextmenu', handleContextMenu);
    window.addEventListener('keydown', handleKeyDown);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleWindowBlur);
    window.addEventListener('focus', handleWindowFocus);

    return () => {
      window.removeEventListener('contextmenu', handleContextMenu);
      window.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleWindowBlur);
      window.removeEventListener('focus', handleWindowFocus);
    };
  }, []);

  return { isProtected, setIsProtected };
};