/**
 * Simple chart components using canvas
 */

export function SimpleBarChart({ data = [], height = 200 }) {
  if (!data || data.length === 0) {
    return (
      <div
        style={{
          height,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "var(--bg-secondary)",
          borderRadius: "var(--radius-md)",
        }}
      >
        <p className="subtitle">No data available</p>
      </div>
    );
  }

  const maxValue = Math.max(...data.map((d) => d.value), 1);

  return (
    <div
      className="bar-chart-container"
      style={{ height, display: "flex", flexDirection: "column" }}
    >
      <div
        className="bar-chart-main"
        style={{
          flex: 1,
          display: "flex",
          alignItems: "flex-end",
          gap: "12px",
          padding: "20px 0 10px 0",
        }}
      >
        {data.map((item, idx) => {
          const barHeight = (item.value / maxValue) * 100;
          return (
            <div
              key={idx}
              style={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "4px",
                height: "100%",
              }}
            >
              <div
                style={{
                  flex: 1,
                  width: "100%",
                  display: "flex",
                  alignItems: "flex-end",
                }}
              >
                <div
                  className="bar-fill"
                  style={{
                    height: `${Math.max(barHeight, 2)}%`,
                    width: "100%",
                    backgroundColor: item.color || "var(--accent)",
                    borderRadius: "4px 4px 0 0",
                    transition: "height 0.3s ease",
                    position: "relative",
                  }}
                  title={`${item.label}: ${item.value}`}
                >
                  <span
                    style={{
                      position: "absolute",
                      top: "-18px",
                      left: "50%",
                      transform: "translateX(-50%)",
                      fontSize: "0.7rem",
                      fontWeight: "bold",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {item.value || 0}
                  </span>
                </div>
              </div>
              <div
                style={{
                  fontSize: "0.7rem",
                  color: "var(--text-secondary)",
                  textAlign: "center",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  width: "100%",
                }}
              >
                {item.label}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function SimpleLineChart({ data = [], height = 200 }) {
  if (!data || data.length === 0) {
    return (
      <div
        style={{
          height,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "var(--bg-secondary)",
          borderRadius: "var(--radius-md)",
        }}
      >
        <p className="subtitle">No data available</p>
      </div>
    );
  }

  const maxValue = Math.max(...data.map((d) => d.value), 1);
  const chartPadding = 6; // percent padding inside the svg (top/bottom)

  // Calculate SVG points (0..100 coordinate space)
  const points = data.map((item, idx) => {
    const denom = data.length > 1 ? data.length - 1 : 1;
    const x = data.length === 1 ? 50 : (idx / denom) * 100; // center single points
    // map value to y (invert for SVG coordinate system) and add vertical padding
    const rawY = 100 - (item.value / maxValue) * 100;
    const y = Math.max(chartPadding, Math.min(100 - chartPadding, rawY));
    return {
      x: Number(x.toFixed(2)),
      y: Number(y.toFixed(2)),
      value: item.value,
      label: item.label,
    };
  });

  const polylinePoints = points.map((p) => `${p.x},${p.y}`).join(" ");

  return (
    <div
      className="line-chart-container"
      style={{
        height,
        display: "flex",
        flexDirection: "column",
        position: "relative",
        padding: `${chartPadding}px 10px`,
      }}
    >
      <div style={{ flex: 1, position: "relative" }}>
        <svg
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          style={{ width: "100%", height: "100%", overflow: "visible" }}
          className="line-chart"
        >
          {/* Grid lines */}
          <line
            x1="0"
            y1="0"
            x2="100"
            y2="0"
            stroke="var(--border-soft)"
            strokeWidth="0.5"
          />
          <line
            x1="0"
            y1="50"
            x2="100"
            y2="50"
            stroke="var(--border-soft)"
            strokeWidth="0.5"
          />
          <line
            x1="0"
            y1="100"
            x2="100"
            y2="100"
            stroke="var(--border-soft)"
            strokeWidth="0.5"
          />

          <polyline
            points={polylinePoints}
            fill="none"
            stroke="var(--accent)"
            strokeWidth="2"
            strokeLinejoin="round"
            strokeLinecap="round"
            vectorEffect="non-scaling-stroke"
          />

          {points.map((p, i) => (
            <g key={i}>
              <circle
                cx={p.x}
                cy={p.y}
                r="3"
                fill="var(--bg)"
                stroke="var(--accent)"
                strokeWidth="1.8"
              />
              <text
                x={p.x}
                y={p.y - 6}
                textAnchor="middle"
                fontSize="6"
                fontWeight="700"
                fill="var(--text)"
              >
                {p.value}
              </text>
            </g>
          ))}
        </svg>
      </div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginTop: "10px",
        }}
      >
        {data.map((item, idx) => (
          <div
            key={idx}
            style={{
              fontSize: "0.65rem",
              color: "var(--text-secondary)",
              textAlign: "center",
              width: `${100 / data.length}%`,
            }}
          >
            {item.label}
          </div>
        ))}
      </div>
    </div>
  );
}

export function StatCard({
  title,
  value,
  icon: Icon,
  color = "var(--accent)",
  trend,
}) {
  return (
    <div className="stat-card" style={{ borderLeftColor: color }}>
      <div className="stat-header">
        <h3>{title}</h3>
        {Icon && <Icon size={24} style={{ color }} />}
      </div>
      <div className="stat-value">{value}</div>
      {trend && (
        <div
          className="stat-trend"
          style={{ color: trend.positive ? "var(--accent)" : "var(--danger)" }}
        >
          {trend.positive ? "↑" : "↓"} {trend.percent}% {trend.period}
        </div>
      )}
    </div>
  );
}
