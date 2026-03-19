import { ParkingSlotModel } from '../services/firestoreContracts';

type ActionFeedback = {
  type: 'success' | 'error';
  message: string;
};

type SlotActionPanelProps = {
  slot: ParkingSlotModel | null;
  isUpdating: boolean;
  onToggleStatus: () => void;
  feedback: ActionFeedback | null;
  onRetry: () => void;
};

const getNextStatusLabel = (status: ParkingSlotModel['status']) => {
  return status === 'available' ? 'Mark occupied' : 'Mark available';
};

export function SlotActionPanel({ slot, isUpdating, onToggleStatus, feedback, onRetry }: SlotActionPanelProps) {
  if (!slot) {
    return (
      <div className="content-card info-panel">
        <h3>Select a slot</h3>
        <p>Choose a slot row to review its current state and prepare a status change action.</p>
      </div>
    );
  }

  return (
    <div className="content-card action-panel">
      <div className="panel-header">
        <div>
          <p className="eyebrow">Selected slot</p>
          <h3>{slot.slotNumber}</h3>
        </div>
        <span className={`availability-chip availability-chip--${slot.status === 'available' ? 'healthy' : 'critical'}`}>
          {slot.status}
        </span>
      </div>

      <div className="action-panel__details">
        <article>
          <span>Vehicle type</span>
          <strong>{slot.vehicleType}</strong>
        </article>
        <article>
          <span>Area ID</span>
          <strong>{slot.areaId}</strong>
        </article>
        <article>
          <span>Coordinates</span>
          <strong>
            {slot.position.x}, {slot.position.y}
          </strong>
        </article>
      </div>

      <div className="action-panel__footer">
        <button type="button" className="primary-button" onClick={onToggleStatus} disabled={isUpdating}>
          {getNextStatusLabel(slot.status)}
        </button>
        {feedback ? (
          <div className={feedback.type === 'success' ? 'action-alert action-alert--success' : 'action-alert action-alert--error'}>
            <p>{feedback.message}</p>
            {feedback.type === 'error' ? (
              <button type="button" className="ghost-button" onClick={onRetry} disabled={isUpdating}>
                Retry update
              </button>
            ) : null}
          </div>
        ) : null}
        <p>
          {isUpdating
            ? 'Updating Firestore status and last_updated...'
            : 'Status updates persist through the admin service layer with status and last_updated writes.'}
        </p>
      </div>
    </div>
  );
}
