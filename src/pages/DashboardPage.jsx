import {
  Bell,
  BookOpen,
  CheckCircle2,
  Gauge,
  ScanSearch,
  Share2,
  TrendingUp,
  Users,
} from "lucide-react";
import { useApp } from "../context/AppContext.jsx";
import { PageShell } from "../components/layout/PageShell.jsx";
import { Card, StatusPill } from "../components/ui/Card.jsx";
import { PrimaryButton, SecondaryButton } from "../components/ui/Button.jsx";
import { modulesSeed } from "../constants/modules.js";
import { studentsSeed } from "../constants/students.js";

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
  const { navigate, notifications } = useApp();
  const unreadCount = notifications.filter((item) => !item.read).length;

  const totalScans = modulesSeed.reduce(
    (sum, module) => sum + module.stats.scanned,
    0,
  );
  const totalTaken = modulesSeed.reduce(
    (sum, module) => sum + module.stats.taken,
    0,
  );
  const totalItems = modulesSeed.reduce(
    (sum, module) => sum + module.stats.items,
    0,
  );
  const averageScore = Math.round(
    modulesSeed.reduce((sum, module) => sum + module.stats.averageScore, 0) /
      modulesSeed.length,
  );
  const passingRate = Math.round(
    modulesSeed.reduce((sum, module) => sum + module.stats.passingRate, 0) /
      modulesSeed.length,
  );
  const enrollments = modulesSeed.reduce(
    (sum, module) => sum + module.students.length,
    0,
  );

  const summary = [
    { label: "Modules", value: modulesSeed.length, icon: BookOpen },
    { label: "Students", value: studentsSeed.length, icon: Users },
    { label: "Items", value: totalItems, icon: ScanSearch },
    { label: "Scans", value: totalScans, icon: TrendingUp },
    { label: "Taken", value: totalTaken, icon: Share2 },
    { label: "Enrollments", value: enrollments, icon: Users },
    { label: "Average score", value: `${averageScore}%`, icon: Gauge },
    {
      label: "Passing rate",
      value: `${passingRate}%`,
      icon: CheckCircle2,
    },
    { label: "Unread alerts", value: unreadCount, icon: Bell },
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
        <div className="stat-grid dashboard-stat-grid">
          {summary.map((item) => (
            <Card key={item.label} className="stat-card">
              <div className="stat-card-icon">
                <item.icon size={16} aria-hidden="true" />
              </div>
              <p>{item.label}</p>
              <strong>{item.value}</strong>
            </Card>
          ))}
        </div>
        <div className="content-grid dashboard-insights">
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
        <div className="content-grid two-column">
          <Card>
            <div className="panel-header">
              <div>
                <p className="eyebrow">Module ranking</p>
                <h3>Highest scoring modules</h3>
              </div>
              <StatusPill tone="neutral">Live</StatusPill>
            </div>
            <div className="stack">
              {modulesSeed.map((module) => (
                <div className="activity-row" key={module.id}>
                  <div>
                    <strong>{module.name}</strong>
                    <p>
                      {module.stats.scanned} scans · {module.students.length}{" "}
                      students
                    </p>
                  </div>
                  <StatusPill tone="accent">
                    {module.stats.averageScore}%
                  </StatusPill>
                </div>
              ))}
            </div>
          </Card>

          <Card>
            <div className="panel-header">
              <div>
                <p className="eyebrow">Student pulse</p>
                <h3>Recent student performance</h3>
              </div>
              <StatusPill tone="neutral">Class view</StatusPill>
            </div>
            <div className="stack">
              {studentsSeed.slice(0, 3).map((student) => (
                <div className="activity-row" key={student.id}>
                  <div>
                    <strong>{student.name}</strong>
                    <p>{student.modulesTaken.length} modules taken</p>
                  </div>
                  <StatusPill
                    tone={student.score == null ? "neutral" : "accent"}
                  >
                    {student.score == null ? "Pending" : `${student.score}%`}
                  </StatusPill>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </PageShell>
  );
}
