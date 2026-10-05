import { useMemo } from 'react';
import { useAuth } from './useAuth.jsx';
import { createAdminApi } from '../services/adminApi.js';

export function useAdminApi() {
  const auth = useAuth();
  const token = auth?.session?.access_token;
  return useMemo(() => createAdminApi(token), [token]);
}
