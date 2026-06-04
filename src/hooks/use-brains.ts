'use client';

import { useState, useEffect, useCallback } from 'react';

interface Brain {
  id: string;
  name: string;
  description?: string;
  status: string;
  file_count: number;
  created_at: string;
  updated_at: string;
}

export function useBrains() {
  const [brains, setBrains] = useState<Brain[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBrains = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch('/api/brains');
      if (!res.ok) throw new Error('Failed to fetch brains');
      const data = await res.json();
      setBrains(Array.isArray(data) ? data : []);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBrains();
  }, [fetchBrains]);

  const createBrain = useCallback(async (data: { name: string; description?: string }) => {
    const res = await fetch('/api/brains', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to create brain');
    const brain = await res.json();
    await fetchBrains(); // Refresh list
    return brain;
  }, [fetchBrains]);

  return {
    brains,
    loading,
    error,
    createBrain,
    refreshBrains: fetchBrains,
  };
}
