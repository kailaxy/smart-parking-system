type InfoPanelProps = {
  title: string;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
};

export function InfoPanel({ title, message, actionLabel, onAction }: InfoPanelProps) {
  return (
    <div className="content-card info-panel">
      <h3>{title}</h3>
      <p>{message}</p>
      {actionLabel && onAction ? (
        <button type="button" className="ghost-button" onClick={onAction}>
          {actionLabel}
        </button>
      ) : null}
    </div>
  );
}
