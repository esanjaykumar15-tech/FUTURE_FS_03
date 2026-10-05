import { Link } from 'react-router-dom';
import { useDocumentTitle } from '../hooks/useDocumentTitle.js';

export default function NotFound() {
  useDocumentTitle('Page not found');
  return (
    <div className="container-page py-24 text-center">
      <h1 className="text-5xl font-bold">Page not found</h1>
      <p className="mx-auto mt-4 max-w-md text-espresso/80">That page doesn’t exist or has moved. Head back to the menu or the home page.</p>
      <div className="mt-8 flex justify-center gap-3"><Link to="/" className="btn btn-primary">Go home</Link><Link to="/menu" className="btn btn-secondary">View menu</Link></div>
    </div>
  );
}
