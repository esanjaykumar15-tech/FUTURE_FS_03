import { useCallback, useEffect, useState } from 'react';
import { api } from '../services/api.js';

export function useMenu() {
  const [state, setState] = useState({ status: 'loading', items: [], error: '' });

  const load = useCallback(async () => {
    setState((s) => ({ ...s, status: 'loading', error: '' }));
    try {
      const items = await api.getMenu();
      setState({ status: 'ready', items, error: '' });
    } catch (e) {
      setState({ status: 'error', items: [], error: e.message });
    }
  }, []);

  useEffect(() => { load(); }, [load]);
  return { ...state, reload: load };
}
