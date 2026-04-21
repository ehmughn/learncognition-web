import { useApp } from "../context/AppContext.jsx";
import { PageShell } from "../components/layout/PageShell.jsx";
import { Card, StatusPill } from "../components/ui/Card.jsx";
import { PrimaryButton, SecondaryButton } from "../components/ui/Button.jsx";

const chartBars = [62, 74, 69, 81, 88, 77];
const chartLabels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const chartLine = [55, 60, 64, 72, 79, 85];

function LineChart({ data, labels }) {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min;
  const chartWidth = 300;
  const chartHeight = 200;
  const padding = 40;

  const points = data.map((value, i) => {
    const x = (i / (data.length - 1)) * (chartWidth - padding * 2) + padding;
    const y =
      chartHeight -
      padding -
      ((value - min) / range) * (chartHeight - padding * 2);
    return { x, y, value };
  });

  const pathData = points
    .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`)
    .join(" ");

  return (
    <svg
      width="100%"
      viewBox={`0 0 ${chartWidth} ${chartHeight}`}
      className="line-chart"
    >
      {/* Grid lines */}
      {[0, 25, 50, 75, 100].map((percent) => {
        const y =
          chartHeight - padding - (percent / 100) * (chartHeight - padding * 2);
        return (
          <line
            key={`grid-${percent}`}
            x1={padding}
            y1={y}
            x2={chartWidth - padding}
            y2={y}
            stroke="var(--border-soft)"
            strokeWidth="1"
          />
        );
      })}

      {/* Y-axis */}
      <line
        x1={padding}
        y1={padding}
        x2={padding}
        y2={chartHeight - padding}
        stroke="var(--border)"
        strokeWidth="2"
      />

      {/* X-axis */}
      <line
        x1={padding}
        y1={chartHeight - padding}
        x2={chartWidth - padding}
        y2={chartHeight - padding}
        stroke="var(--border)"
        strokeWidth="2"
      />

      {/* Data line */}
      <path d={pathData} stroke="var(--accent)" strokeWidth="2.5" fill="none" />

      {/* Data points and labels */}
      {points.map((p, i) => (
        <g key={`point-${i}`}>
          <circle cx={p.x} cy={p.y} r="4" fill="var(--accent)" />
          <text
            x={p.x}
            y={chartHeight - padding + 20}
            textAnchor="middle"
            fontSize="12"
            fill="var(--muted)"
          >
            {labels[i]}
          </text>
          <text
            x={p.x}
            y={p.y - 10}
            textAnchor="middle"
            fontSize="11"
            fill="var(--accent)"
            fontWeight="600"
          >
            {p.value}%
          </text>
        </g>
      ))}
    </svg>
  );
}

export default function DashboardPage() {
  const { navigate } = useApp();
  const summary = [
    { label: "Modules scanned", value: "238" },
    { label: "Students taken", value: "96" },
    { label: "Average score", value: "87%" },
    { label: "Passing rate", value: "91%" },
  ];

  return (
    <PageShell
      eyebrow="Dashboard"
      title="Dashboard"
      actions={
        <>
          <PrimaryButton onClick={() => navigate("/create")}>
            New module
          </PrimaryButton>
          <SecondaryButton onClick={() => navigate("/modules")}>
            All modules
          </SecondaryButton>
        </>
      }
    >
      <div className="content-grid dashboard-grid">
        <div className="stat-grid four-up">
          {summary.map((item) => (
            <Card key={item.label} className="stat-card">
              <p>{item.label}</p>
              <strong>{item.value}</strong>
            </Card>
          ))}
        </div>
        <Card>
          <div className="panel-header">
            <div>
              <p className="eyebrow">Module analytics</p>
              <h3>Weekly completion trend</h3>
            </div>
            <StatusPill tone="accent">Updated today</StatusPill>
          </div>
          <div className="bar-chart">
            {chartBars.map((bar, index) => (
              <div key={chartLabels[index]} className="bar-column">
                <div className="bar-track">
                  <span style={{ height: `${bar}%` }} />
                </div>
                <strong>{bar}%</strong>
                <p>{chartLabels[index]}</p>
              </div>
            ))}
          </div>
        </Card>
        <Card>
          <div className="panel-header">
            <div>
              <p className="eyebrow">Scoring trend</p>
              <h3>Average scores by day</h3>
            </div>
            <StatusPill tone="accent">Updated today</StatusPill>
          </div>
          <LineChart data={chartLine} labels={chartLabels} />
        </Card>
      </div>
    </PageShell>
  );
}
