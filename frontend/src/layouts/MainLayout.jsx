import { Outlet, Link } from 'react-router-dom';
import SpineNav from '../components/SpineNav';
import ProfileMenu from '../components/ProfileMenu';

export default function MainLayout() {
  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="app-header-inner">
          <Link to="/" className="app-logo">Bookaholic</Link>
          <SpineNav />
          <ProfileMenu />
        </div>
      </header>
      <main className="app-main">
        <Outlet />
      </main>
    </div>
  );
}