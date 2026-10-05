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
const AdminRoot = lazy(() => import('./layouts/AdminRoot.jsx'));
const AdminLayout = lazy(() => import('./layouts/AdminLayout.jsx'));
const RequireAdmin = lazy(() => import('./components/admin/RequireAdmin.jsx'));
const Login = lazy(() => import('./pages/admin/Login.jsx'));
const Dashboard = lazy(() => import('./pages/admin/Dashboard.jsx'));
const MenuAdmin = lazy(() => import('./pages/admin/MenuAdmin.jsx'));
const ReservationsAdmin = lazy(() => import('./pages/admin/ReservationsAdmin.jsx'));
const EnquiriesAdmin = lazy(() => import('./pages/admin/EnquiriesAdmin.jsx'));

export default function App() {
  return (
    <ErrorBoundary>
      <Suspense fallback={<Loading />}>
        <Routes>
          <Route path="admin" element={<AdminRoot />}>
            <Route path="login" element={<Login />} />
            <Route element={<RequireAdmin><AdminLayout /></RequireAdmin>}>
              <Route index element={<Dashboard />} />
              <Route path="menu" element={<MenuAdmin />} />
              <Route path="reservations" element={<ReservationsAdmin />} />
              <Route path="enquiries" element={<EnquiriesAdmin />} />
            </Route>
          </Route>
          <Route element={<PublicLayout />}>
            <Route index element={<Home />} />
            <Route path="menu" element={<Menu />} />
            <Route path="about" element={<About />} />
            <Route path="reservations" element={<Reservations />} />
            <Route path="contact" element={<Contact />} />
            <Route path="privacy" element={<Privacy />} />
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </Suspense>
    </ErrorBoundary>
  );
}
