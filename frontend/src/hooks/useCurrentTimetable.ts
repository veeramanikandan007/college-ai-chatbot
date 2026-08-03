import { useState, useEffect } from 'react';

export function useCurrentTimetable() {
  const [todayData, setTodayData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTimetable = async () => {
      try {
        const url = '/api/v1/timetable/today';
        const res = await fetch(url);
        if (!res.ok) throw new Error('Failed to fetch today timetable');
        const json = await res.json();
        setTodayData(json);
        setError(null);
      } catch (err: any) {
        console.error('Timetable sync error:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchTimetable();
    // Auto-refresh every 30 seconds for live progress and class transition
    const intervalId = setInterval(fetchTimetable, 30000);
    return () => clearInterval(intervalId);
  }, []);

  return { todayData, loading, error };
}
