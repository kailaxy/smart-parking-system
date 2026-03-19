import { useMemo } from 'react';
import { InfoPanel } from '../components/InfoPanel';
import { useParkingAreas } from '../hooks/useParkingAreas';

export function SlotMonitorPage() {
  const { areas, isLoading, error, reload } = useParkingAreas();

  const totals = useMemo(() => {
    const totalSlots = areas.reduce((sum, area) => sum + area.totalSlots, 0);
    const occupiedSlots = areas.reduce((sum, area) => sum + (area.totalSlots - area.availableSlots), 0);

    return {
      totalSlots,
      occupiedSlots,
      availableSlots: totalSlots - occupiedSlots,
    };
  }, [areas]);

  if (error) {
    return (
      <section className="shell-page">
        <InfoPanel
          title="Slot monitor unavailable"
          message={error.message}
          actionLabel="Retry overview"
          onAction={() => {
            void reload();
          }}
        />
      </section>
    );
  }

  return (
    <section className="shell-page">
      <div className="content-card">
        <p className="eyebrow">Slot monitor</p>
        <h3>Prototype slot readiness summary</h3>
        <p>
          This section keeps the shell focused on read readiness before edit controls are added. It
          summarizes the Firestore-backed inventory available for future status toggles.
        </p>
        <div className="hero-card__metrics compact-metrics">
          <article>
            <strong>{isLoading ? '...' : totals.totalSlots}</strong>
            <span>Total slots in scope</span>
          </article>
          <article>
            <strong>{isLoading ? '...' : totals.availableSlots}</strong>
            <span>Available now</span>
          </article>
          <article>
            <strong>{isLoading ? '...' : totals.occupiedSlots}</strong>
            <span>Occupied now</span>
          </article>
        </div>
      </div>
    </section>
  );
}
