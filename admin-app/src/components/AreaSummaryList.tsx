import { ParkingAreaModel } from '../services/firestoreContracts';

type AreaSummaryListProps = {
  areas: ParkingAreaModel[];
  selectedAreaId: string | null;
  onSelectArea: (areaId: string) => void;
};

const getAvailabilityTone = (availableSlots: number, totalSlots: number) => {
  const ratio = totalSlots === 0 ? 0 : availableSlots / totalSlots;

  if (ratio <= 0.25) {
    return 'critical';
  }

  if (ratio <= 0.5) {
    return 'warning';
  }

  return 'healthy';
};

export function AreaSummaryList({ areas, selectedAreaId, onSelectArea }: AreaSummaryListProps) {
  return (
    <div className="area-grid">
      {areas.map((area) => {
        const tone = getAvailabilityTone(area.availableSlots, area.totalSlots);
        const isSelected = area.id === selectedAreaId;

        return (
          <button
            key={area.id}
            type="button"
            className={isSelected ? 'area-card area-card--selected' : 'area-card'}
            onClick={() => onSelectArea(area.id)}
          >
            <div className="area-card__header">
              <p className="eyebrow">{area.type} parking</p>
              <span className={`availability-chip availability-chip--${tone}`}>{tone}</span>
            </div>
            <h4>{area.name}</h4>
            <div className="area-card__metrics">
              <article>
                <strong>{area.availableSlots}</strong>
                <span>Available</span>
              </article>
              <article>
                <strong>{area.totalSlots}</strong>
                <span>Total slots</span>
              </article>
            </div>
          </button>
        );
      })}
    </div>
  );
}
