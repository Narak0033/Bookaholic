import { Outlet, Link } from 'react-router-dom';
import SpineNav from '../components/SpineNav';
import ProfileMenu from '../components/ProfileMenu';
import NotificationBell from '../components/NotificationBell';

export default function MainLayout() {
  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="app-header-inner">
          <Link to="/" className="app-logo">Bookaholic</Link>
          <SpineNav />
          <div className="app-header-right">
            <NotificationBell />
            <ProfileMenu />
          </div>
        </div>
      </header>
      <main className="app-main">
        <Outlet />
      </main>
    </div>
  );
}