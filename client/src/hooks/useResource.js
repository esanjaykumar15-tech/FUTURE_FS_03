import { useCallback, useEffect, useRef, useState } from 'react';

// Loads data with loading/ready/error state. Ignores stale responses.
export function useResource(fetcher, deps = []) {
  const [state, setState] = useState({ status: 'loading', data: null, error: '' });
  const seq = useRef(0);

  const load = useCallback(async () => {
    const id = ++seq.current;
    setState((s) => ({ ...s, status: 'loading', error: '' }));
    try {
      const data = await fetcher();
      if (id === seq.current) setState({ status: 'ready', data, error: '' });
    } catch (e) {
      if (id === seq.current) setState({ status: 'error', data: null, error: e.message });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  useEffect(() => { load(); }, [load]);
  return { ...state, reload: load };
}
