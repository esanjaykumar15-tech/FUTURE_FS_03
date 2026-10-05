import { useEffect } from 'react';
import { business } from '../config/business.js';

export function useDocumentTitle(title) {
  useEffect(() => {
    document.title = title ? `${title} | ${business.name}` : business.name;
  }, [title]);
}
