export const PROTOTYPE_ACCESS_STORAGE_KEY = 'smart-parking-admin-prototype-session';
export const DEFAULT_PROTOTYPE_ACCESS_CODE = 'smartparking-demo';

export type PrototypeSession = {
  displayName: string;
  grantedAt: string;
};

const env = (import.meta as ImportMeta & { env?: Record<string, string | undefined> }).env ?? {};

export function getPrototypeAccessCode(): string {
  return env.VITE_ADMIN_DEMO_CODE?.trim() || DEFAULT_PROTOTYPE_ACCESS_CODE;
}

export function readPrototypeSession(): PrototypeSession | null {
  if (typeof window === 'undefined') {
    return null;
  }

  const raw = window.localStorage.getItem(PROTOTYPE_ACCESS_STORAGE_KEY);

  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw) as PrototypeSession;

    if (!parsed.displayName || !parsed.grantedAt) {
      return null;
    }

    return parsed;
  } catch {
    return null;
  }
}

export function writePrototypeSession(session: PrototypeSession): void {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.setItem(PROTOTYPE_ACCESS_STORAGE_KEY, JSON.stringify(session));
}

export function clearPrototypeSession(): void {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.removeItem(PROTOTYPE_ACCESS_STORAGE_KEY);
}
