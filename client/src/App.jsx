import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import PublicLayout from './layouts/PublicLayout.jsx';
import ErrorBoundary from './components/ErrorBoundary.jsx';
import { Loading } from './components/States.jsx';

const Home = lazy(() => import('./pages/Home.jsx'));
const Menu = lazy(() => import('./pages/Menu.jsx'));
const About = lazy(() => import('./pages/About.jsx'));
const Reservations = lazy(() => import('./pages/Reservations.jsx'));
const Contact = lazy(() => import('./pages/Contact.jsx'));
const Privacy = lazy(() => import('./pages/Privacy.jsx'));
const NotFound = lazy(() => import('./pages/NotFound.jsx'));

export default function App() {
  return (
    <ErrorBoundary>
      <Suspense fallback={<Loading />}>
        <Routes>
          <Route element={<PublicLayout />}>
            <Route index element={<Home />} />
            <Route path="menu" element={<Menu />} />
            <Route path="about" element={<About />} />
            <Route path="reservations" element={<Reservations />} />
            <Route path="contact" element={<Contact />} />
            <Route path="privacy" element={<Privacy />} />
            {/* Stage 4 adds /admin routes here */}
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </Suspense>
    </ErrorBoundary>
  );
}
