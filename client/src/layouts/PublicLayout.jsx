import { Outlet } from 'react-router-dom';
import Header from '../components/Header.jsx';
import Footer from '../components/Footer.jsx';
import { business } from '../config/business.js';

export default function PublicLayout() {
  return (
    <>
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-full focus:bg-espresso focus:px-4 focus:py-2 focus:text-cream">Skip to content</a>
      {business.isSample && (
        <p className="border-b-4 border-caramel bg-cream-deep px-4 py-2 text-center text-sm font-semibold text-espresso">
          Demo site: menu, prices, hours and contact details are sample content until verified by the café.
        </p>
      )}
      <Header />
      <main id="main" tabIndex={-1}><Outlet /></main>
      <Footer />
    </>
  );
}
