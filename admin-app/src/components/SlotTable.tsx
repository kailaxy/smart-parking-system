import { useState, useMemo } from 'react';
import { ParkingSlotModel } from '../services/firestoreContracts';

type SlotTableProps = {
  areaName: string;
  slots: ParkingSlotModel[];
  selectedSlotId: string | null;
  onSelectSlot: (slotId: string) => void;
};

const SLOTS_PER_PAGE = 15;

const formatTimestamp = (value: ParkingSlotModel['lastUpdated']) => {
  if (!value) {
    return 'Pending timestamp';
  }

  if (typeof value === 'string') {
    return new Date(value).toLocaleString();
  }

  if (typeof value === 'number') {
    return new Date(value).toLocaleString();
  }

  if (value instanceof Date) {
    return value.toLocaleString();
  }

  if (typeof value === 'object' && 'toDate' in value && typeof value.toDate === 'function') {
    return value.toDate().toLocaleString();
  }

  return 'Timestamp available';
};

export function SlotTable({ areaName, slots, selectedSlotId, onSelectSlot }: SlotTableProps) {
  const [currentPage, setCurrentPage] = useState(1);

  const { paginatedSlots, totalPages } = useMemo(() => {
    const total = Math.ceil(slots.length / SLOTS_PER_PAGE);
    const start = (currentPage - 1) * SLOTS_PER_PAGE;
    const end = start + SLOTS_PER_PAGE;
    return {
      paginatedSlots: slots.slice(start, end),
      totalPages: total,
    };
  }, [slots, currentPage]);

  const handlePreviousPage = () => {
    setCurrentPage((prev) => Math.max(1, prev - 1));
  };

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(totalPages, prev + 1));
  };

  return (
    <div className="content-card">
      <div className="panel-header">
        <div>
          <p className="eyebrow">Selected area</p>
          <h3>{areaName}</h3>
        </div>
        <span className="status-pill">{slots.length} slots loaded</span>
      </div>

      <div className="slot-table-wrapper">
        <table className="slot-table">
          <thead>
            <tr>
              <th>Slot</th>
              <th>Status</th>
              <th>Vehicle</th>
              <th>Position</th>
              <th>Last updated</th>
            </tr>
          </thead>
          <tbody>
            {paginatedSlots.map((slot) => (
              <tr
                key={slot.id}
                className={slot.id === selectedSlotId ? 'slot-table__row slot-table__row--selected' : 'slot-table__row'}
                onClick={() => onSelectSlot(slot.id)}
              >
                <td>{slot.slotNumber}</td>
                <td>
                  <span className={`availability-chip availability-chip--${slot.status === 'available' ? 'healthy' : 'critical'}`}>
                    {slot.status}
                  </span>
                </td>
                <td>{slot.vehicleType}</td>
                <td>
                  {slot.position.x}, {slot.position.y}
                </td>
                <td>{formatTimestamp(slot.lastUpdated)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '16px', padding: '12px 0' }}>
          <button
            onClick={handlePreviousPage}
            disabled={currentPage === 1}
            style={{
              padding: '8px 12px',
              border: '1px solid #9ca3b8',
              borderRadius: '6px',
              backgroundColor: currentPage === 1 ? '#e5e7eb' : '#ffffff',
              cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
              color: currentPage === 1 ? '#9ca3b8' : '#1f2937',
              fontWeight: '600',
            }}
          >
            ← Previous
          </button>
          <span style={{ fontWeight: '600', color: '#1f2937' }}>
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={handleNextPage}
            disabled={currentPage === totalPages}
            style={{
              padding: '8px 12px',
              border: '1px solid #9ca3b8',
              borderRadius: '6px',
              backgroundColor: currentPage === totalPages ? '#e5e7eb' : '#ffffff',
              cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
              color: currentPage === totalPages ? '#9ca3b8' : '#1f2937',
              fontWeight: '600',
            }}
          >
            Next →
          </button>
        </div>
      )}
    </div>
  );
}
