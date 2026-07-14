import { Outlet } from 'react-router-dom';
import SpineNav from '../components/SpineNav';

export default function MainLayout() {
  return (
    <div className="app-shell">
      <header className="app-header">
        <SpineNav />
      </header>
      <main className="app-main">
        <Outlet />
      </main>
    </div>
  );
}