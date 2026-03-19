import { DEFAULT_PROTOTYPE_ACCESS_CODE } from '../utils/prototypeAccess';

export function DemoSettingsPage() {
  return (
    <section className="shell-page">
      <div className="content-card">
        <p className="eyebrow">Demo settings</p>
        <h3>Prototype access notes</h3>
        <ul className="content-list">
          <li>Gate persistence uses local browser storage only.</li>
          <li>Environment override: <strong>VITE_ADMIN_DEMO_CODE</strong>.</li>
          <li>Fallback demo code: <strong>{DEFAULT_PROTOTYPE_ACCESS_CODE}</strong>.</li>
          <li>Production authentication remains intentionally out of scope for this prototype.</li>
        </ul>
      </div>
    </section>
  );
}
