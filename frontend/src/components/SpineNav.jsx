import { NavLink } from 'react-router-dom';
import './SpineNav.css';

const TABS = [
  { to: '/shelf', label: 'shelf', color: 'rose' },
  { to: '/discover', label: 'discover', color: 'gold' },
  { to: '/clubs', label: 'clubs', color: 'wine' },
  { to: '/wrapped', label: 'wrapped', color: 'dark' },
];

export default function SpineNav() {
  return (
    <nav className="spine-nav">
      {TABS.map((tab) => (
        <NavLink
          key={tab.to}
          to={tab.to}
          className={({ isActive }) =>
            `spine spine-${tab.color}${isActive ? ' spine-active' : ''}`
          }
        >
          {tab.label}
        </NavLink>
      ))}
    </nav>
  );
}