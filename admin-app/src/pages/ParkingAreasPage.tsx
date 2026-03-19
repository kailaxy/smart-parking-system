import { useEffect, useMemo, useState } from 'react';
import { AreaSummaryList } from '../components/AreaSummaryList';
import { InfoPanel } from '../components/InfoPanel';
import { SlotActionPanel } from '../components/SlotActionPanel';
import { SlotTable } from '../components/SlotTable';
import { useParkingAreas } from '../hooks/useParkingAreas';
import { useParkingSlots } from '../hooks/useParkingSlots';
import { SlotStatus } from '../services/firestoreContracts';

type ActionFeedback = {
  type: 'success' | 'error';
  message: string;
};

type LastToggleAttempt = {
  slotId: string;
  previousStatus: SlotStatus;
};

export function ParkingAreasPage() {
  const { areas, isLoading, error, reload } = useParkingAreas();
  const [selectedAreaId, setSelectedAreaId] = useState<string | null>(null);
  const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null);
  const [actionFeedback, setActionFeedback] = useState<ActionFeedback | null>(null);
  const [lastToggleAttempt, setLastToggleAttempt] = useState<LastToggleAttempt | null>(null);

  useEffect(() => {
    if (!areas.length) {
      setSelectedAreaId(null);
      setSelectedSlotId(null);
      return;
    }

    setSelectedAreaId((current) => current ?? areas[0].id);
  }, [areas]);

  const selectedArea = useMemo(
    () => areas.find((area) => area.id === selectedAreaId) ?? null,
    [areas, selectedAreaId],
  );
  const {
    slots,
    isLoading: isLoadingSlots,
    error: slotsError,
    isUpdatingSlot,
    toggleSlotStatus,
  } = useParkingSlots(selectedArea?.id ?? null);

  useEffect(() => {
    if (!slots.length) {
      setSelectedSlotId(null);
      setActionFeedback(null);
      return;
    }

    setSelectedSlotId((current) => {
      if (current && slots.some((slot) => slot.id === current)) {
        return current;
      }

      return slots[0].id;
    });
  }, [slots]);

  const selectedSlot = useMemo(
    () => slots.find((slot) => slot.id === selectedSlotId) ?? null,
    [selectedSlotId, slots],
  );

  const toggleSlot = async (slotId: string, previousStatus: SlotStatus) => {
    setLastToggleAttempt({ slotId, previousStatus });
    const nextStatus: SlotStatus = previousStatus === 'available' ? 'occupied' : 'available';
    const result = await toggleSlotStatus(slotId, previousStatus);

    if (result.ok) {
      setActionFeedback({
        type: 'success',
        message: `Slot ${result.data.slotNumber} updated to ${nextStatus}.`,
      });
      return;
    }

    setActionFeedback({
      type: 'error',
      message: `Update failed (${result.error.code}): ${result.error.message}`,
    });
  };

  const handleToggleSelectedSlot = () => {
    if (!selectedSlot || isUpdatingSlot) {
      return;
    }

    void toggleSlot(selectedSlot.id, selectedSlot.status);
  };

  const handleRetryToggle = () => {
    if (!lastToggleAttempt || isUpdatingSlot) {
      return;
    }

    void toggleSlot(lastToggleAttempt.slotId, lastToggleAttempt.previousStatus);
  };

  if (error) {
    return (
      <section className="shell-page">
        <InfoPanel
          title="Parking areas unavailable"
          message={error.message}
          actionLabel="Retry area read"
          onAction={() => {
            void reload();
          }}
        />
      </section>
    );
  }

  if (!isLoading && !areas.length) {
    return (
      <section className="shell-page">
        <InfoPanel
          title="No parking areas found"
          message="Firestore is connected, but the admin shell did not find any parking area documents yet."
          actionLabel="Refresh"
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
        <div className="panel-header">
          <div>
            <p className="eyebrow">Parking areas</p>
            <h3>Area context and slot drill-down</h3>
          </div>
          <button
            type="button"
            className="ghost-button"
            onClick={() => {
              void reload();
            }}
          >
            Refresh areas
          </button>
        </div>
        <p>
          Select an area to inspect its slots, then choose a slot row to prepare a manual status
          change action. This stays inside the current prototype access gate model.
        </p>
      </div>

      <AreaSummaryList areas={areas} selectedAreaId={selectedAreaId} onSelectArea={setSelectedAreaId} />

      {selectedArea ? (
        slotsError ? (
          <InfoPanel title="Slot list unavailable" message={slotsError.message} />
        ) : isLoadingSlots ? (
          <InfoPanel title="Loading slots" message={`Reading slot data for ${selectedArea.name} from Firestore.`} />
        ) : (
          <div className="shell-grid">
            <SlotTable
              areaName={selectedArea.name}
              slots={slots}
              selectedSlotId={selectedSlotId}
              onSelectSlot={setSelectedSlotId}
            />
            <SlotActionPanel
              slot={selectedSlot}
              isUpdating={isUpdatingSlot}
              onToggleStatus={handleToggleSelectedSlot}
              feedback={actionFeedback}
              onRetry={handleRetryToggle}
            />
          </div>
        )
      ) : (
        <InfoPanel title="Select an area" message="Choose a parking area card to preview its current slot dataset." />
      )}
    </section>
  );
}
