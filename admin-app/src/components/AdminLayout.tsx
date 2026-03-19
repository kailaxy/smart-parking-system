import { NavLink, Outlet } from 'react-router-dom';

type AdminLayoutProps = {
  displayName: string;
};

const navigationItems = [
  { to: '/', label: 'Overview', end: true },
  { to: '/areas', label: 'Parking Areas' },
  { to: '/slots', label: 'Slot Monitor' },
] as const;

export function AdminLayout({ displayName }: AdminLayoutProps) {
  return (
    <div className="admin-shell">
      <aside className="admin-shell__sidebar">
        <div>
          <p className="eyebrow">Smart Parking</p>
          <h1 className="admin-shell__title">Admin Prototype</h1>
          <p className="admin-shell__copy">
            Lightweight control surface for demo reviews and parking operations walkthroughs.
          </p>
        </div>

        <nav className="admin-shell__nav" aria-label="Primary navigation">
          {navigationItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={'end' in item ? item.end : false}
              className={({ isActive }) =>
                isActive ? 'admin-shell__nav-link admin-shell__nav-link--active' : 'admin-shell__nav-link'
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="admin-shell__sidebar-card">
          <p className="admin-shell__sidebar-label">Session owner</p>
          <strong>{displayName}</strong>
          <span>Prototype mode · Full auth deferred</span>
        </div>
      </aside>

      <div className="admin-shell__content">
        <header className="admin-shell__header">
          <div>
            <p className="admin-shell__section-label">Dashboard shell</p>
            <h2>Manual parking operations workspace</h2>
          </div>
          <div className="admin-shell__status-group">
            <span className="status-pill status-pill--ready">Offline mode ready</span>
            <span className="status-pill">Dashboard active</span>
          </div>
        </header>

        <Outlet />
      </div>
    </div>
  );
}
