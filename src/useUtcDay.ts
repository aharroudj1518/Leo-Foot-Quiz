import { useEffect, useState } from 'react';
import { AppState } from 'react-native';

export function utcDay() { return new Date().toISOString().slice(0, 10); }

// Refresh while open at midnight and after a suspended app returns to the foreground.
export function useUtcDay() {
  const [day, setDay] = useState(utcDay);
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    function refresh() {
      clearTimeout(timer);
      setDay(utcDay());
      const now = new Date();
      const midnight = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1);
      timer = setTimeout(refresh, midnight - now.getTime() + 50);
    }
    refresh();
    const subscription = AppState.addEventListener('change', state => { if (state === 'active') refresh(); });
    return () => { clearTimeout(timer); subscription.remove(); };
  }, []);
  return day;
}
