function StatsCards({ highCount, moderateCount, lowCount, queueCount }) {
  return (
    <section className="stats-row">
      <div className="stat-card">
        <div className="stat-text">
          <span className="stat-label">High Risk Cases</span>
          <strong className="stat-number">{highCount}</strong>
        </div>
        <div className="stat-icon">⚠</div>
      </div>

      <div className="stat-card">
        <div className="stat-text">
          <span className="stat-label">Moderate Risk</span>
          <strong className="stat-number">{moderateCount}</strong>
        </div>
        <div className="stat-icon">∿</div>
      </div>

      <div className="stat-card">
        <div className="stat-text">
          <span className="stat-label">Low Risk</span>
          <strong className="stat-number">{lowCount}</strong>
        </div>
        <div className="stat-icon">◔</div>
      </div>

      <div className="stat-card">
        <div className="stat-text">
          <span className="stat-label">Today's Queue</span>
          <strong className="stat-number">{queueCount}</strong>
        </div>
        <div className="stat-icon">▣</div>
      </div>
    </section>
  );
}

export default StatsCards;