import { useMemo } from 'react';
import { InfoPanel } from '../components/InfoPanel';
import { useParkingAreas } from '../hooks/useParkingAreas';

export function DashboardHomePage() {
  const { areas, isLoading, error, reload } = useParkingAreas();

  const metrics = useMemo(() => {
    const totalSlots = areas.reduce((sum, area) => sum + area.totalSlots, 0);
    const availableSlots = areas.reduce((sum, area) => sum + area.availableSlots, 0);

    return {
      areaCount: areas.length,
      totalSlots,
      availableSlots,
    };
  }, [areas]);

  if (error) {
    return (
      <section className="shell-page">
        <InfoPanel
          title="Unable to load admin overview"
          message={error.message}
          actionLabel="Retry Firestore read"
          onAction={() => {
            void reload();
          }}
        />
      </section>
    );
  }

  return (
    <section className="shell-page">
      <div className="hero-card">
        <div>
          <p className="eyebrow">Overview</p>
          <h3>Admin shell ready for baseline parking visibility</h3>
          <p>
            The dashboard now reads parking area data from Firestore and prepares the prototype for
            slot-level controls in the next task.
          </p>
        </div>
        <div className="hero-card__metrics">
          <article>
            <strong>{isLoading ? '...' : metrics.areaCount}</strong>
            <span>Parking areas discovered</span>
          </article>
          <article>
            <strong>{isLoading ? '...' : metrics.availableSlots}</strong>
            <span>Available slots reported</span>
          </article>
          <article>
            <strong>{isLoading ? '...' : metrics.totalSlots}</strong>
            <span>Total slots indexed</span>
          </article>
        </div>
      </div>
    </section>
  );
}
