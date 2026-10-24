export function StatusBadge({ status }) {
  const text = status || 'PENDING';
  return <span className={`status-badge ${String(text).toLowerCase()}`}>{text}</span>;
}

export function LoadingState({ children = 'Loading...' }) {
  return <div className="page-shell"><div className="loader-box" role="status">{children}</div></div>;
}

export function ErrorState({ children }) {
  return <div className="page-shell"><p className="error" role="alert">{children}</p></div>;
}

export function StatsGrid({ items }) {
  return (
    <div className="stats-grid">
      {items.map((item) => (
        <article className="stat-card" key={item.label}>
          <span>{item.label}</span>
          <strong>{item.value ?? 0}</strong>
        </article>
      ))}
    </div>
  );
}

export function getLocalDateString() {
  const date = new Date();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`;
}
