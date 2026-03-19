import { FormEvent, ReactNode, useMemo, useState } from 'react';
import {
  clearPrototypeSession,
  DEFAULT_PROTOTYPE_ACCESS_CODE,
  getPrototypeAccessCode,
  PrototypeSession,
  writePrototypeSession,
} from '../utils/prototypeAccess';

type PrototypeAccessGateProps = {
  session: PrototypeSession | null;
  onSessionChange: (session: PrototypeSession | null) => void;
  children: ReactNode;
};

export function PrototypeAccessGate({ session, onSessionChange, children }: PrototypeAccessGateProps) {
  const [displayName, setDisplayName] = useState(session?.displayName ?? '');
  const [accessCode, setAccessCode] = useState('');
  const [error, setError] = useState('');
  const expectedAccessCode = useMemo(() => getPrototypeAccessCode(), []);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const trimmedName = displayName.trim();
    const trimmedCode = accessCode.trim();

    if (!trimmedName) {
      setError('Enter a display name to unlock the prototype shell.');
      return;
    }

    if (trimmedCode !== expectedAccessCode) {
      setError('The demo access code is incorrect.');
      return;
    }

    const nextSession = {
      displayName: trimmedName,
      grantedAt: new Date().toISOString(),
    } satisfies PrototypeSession;

    writePrototypeSession(nextSession);
    onSessionChange(nextSession);
    setAccessCode('');
    setError('');
  };

  const handleReset = () => {
    clearPrototypeSession();
    setAccessCode('');
    onSessionChange(null);
  };

  if (session) {
    return (
      <>
        <div className="prototype-banner">
          <div>
            <p className="prototype-banner__label">Prototype access</p>
            <strong>{session.displayName}</strong>
            <span>Unlocked for demo use</span>
          </div>
          <button type="button" className="ghost-button" onClick={handleReset}>
            Lock shell
          </button>
        </div>
        {children}
      </>
    );
  }

  return (
    <main className="access-gate-page">
      <section className="access-gate-card">
        <p className="eyebrow">Prototype access gate</p>
        <h1>Open the admin dashboard demo</h1>
        <p className="access-gate-copy">
          This concept shell uses a lightweight gate instead of full authentication. Enter a display
          name plus the shared demo access code to continue.
        </p>
        <form className="access-gate-form" onSubmit={handleSubmit}>
          <label>
            Display name
            <input
              value={displayName}
              onChange={(event) => setDisplayName(event.target.value)}
              placeholder="Campus operations"
              autoComplete="name"
            />
          </label>
          <label>
            Demo access code
            <input
              type="password"
              value={accessCode}
              onChange={(event) => setAccessCode(event.target.value)}
              placeholder="Enter shared code"
              autoComplete="current-password"
            />
          </label>
          {error ? <p className="form-error">{error}</p> : null}
          <div className="access-gate-actions">
            <button type="submit" className="primary-button">
              Continue to dashboard
            </button>
            <p className="access-gate-hint">
              Default local code: <strong>{DEFAULT_PROTOTYPE_ACCESS_CODE}</strong>
            </p>
          </div>
        </form>
      </section>
    </main>
  );
}
