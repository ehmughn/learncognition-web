import { useEffect, useState } from "react";
import {
  BookOpen,
  CalendarDays,
  CheckCircle2,
  CloudSun,
  Droplets,
  MapPin,
  Users,
  Wind,
} from "lucide-react";
import { useApp } from "../context/AppContext.jsx";
import { PageShell } from "../components/layout/PageShell.jsx";
import { Card, StatusPill } from "../components/ui/Card.jsx";
import { PrimaryButton, SecondaryButton } from "../components/ui/Button.jsx";
import {
  fetchCurrentWeather,
  fetchUpcomingPublicHoliday,
} from "../services/integrations.js";

function formatDaysAway(daysUntil) {
  if (daysUntil == null) return "Date unavailable";
  if (daysUntil === 0) return "Today";
  if (daysUntil === 1) return "Tomorrow";
  return `${daysUntil} days away`;
}

function formatUpdatedAt(value) {
  if (!value) return "Updated just now";

  return `Updated ${new Intl.DateTimeFormat("en-PH", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value))}`;
}

function formatTrendLabel(value) {
  return new Intl.DateTimeFormat("en-PH", {
    month: "short",
    day: "numeric",
  }).format(new Date(value));
}

function buildTrendSeries(students) {
  const buckets = new Map();

  students.forEach((student) => {
    (student.records ?? []).forEach((record) => {
      const dateValue = record.date;
      if (!dateValue || dateValue === "Pending") return;

      const parsedDate = new Date(dateValue);
      if (Number.isNaN(parsedDate.getTime())) return;

      const key = parsedDate.toISOString().slice(0, 10);
      const current = buckets.get(key) ?? {
        sessions: 0,
        scoreTotal: 0,
        scoreCount: 0,
      };

      current.sessions += 1;
      const score = Number(record.score);
      if (Number.isFinite(score) && score > 0) {
        current.scoreTotal += score;
        current.scoreCount += 1;
      }

      buckets.set(key, current);
    });
  });

  const entries = [...buckets.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-6);
  const labels = entries.map(([date]) => formatTrendLabel(date));
  const maxSessions = Math.max(
    ...entries.map(([, bucket]) => bucket.sessions),
    0,
  );

  return {
    labels,
    bars: entries.map(([, bucket]) =>
      maxSessions
        ? Math.max(16, Math.round((bucket.sessions / maxSessions) * 100))
        : 0,
    ),
    line: entries.map(([, bucket]) =>
      bucket.scoreCount ? Math.round(bucket.scoreTotal / bucket.scoreCount) : 0,
    ),
  };
}

function LineChart({ data, labels }) {
  if (!data.length) {
    return (
      <div className="empty-state">
        <h3>No student records yet</h3>
        <p>
          Supabase activity data will populate this chart once students submit
          records.
        </p>
      </div>
    );
  }

  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = Math.max(max - min, 1);
  const flatSeries = max === min;
  const chartWidth = 300;
  const chartHeight = 200;
  const padding = 40;

  const points = data.map((value, i) => {
    const x =
      (i / Math.max(data.length - 1, 1)) * (chartWidth - padding * 2) + padding;
    const y = flatSeries
      ? chartHeight / 2
      : chartHeight -
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

      <line
        x1={padding}
        y1={padding}
        x2={padding}
        y2={chartHeight - padding}
        stroke="var(--border)"
        strokeWidth="2"
      />

      <line
        x1={padding}
        y1={chartHeight - padding}
        x2={chartWidth - padding}
        y2={chartHeight - padding}
        stroke="var(--border)"
        strokeWidth="2"
      />

      <path d={pathData} stroke="var(--accent)" strokeWidth="2.5" fill="none" />

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
  const { navigate, modules, students, workspaceSummary, workspaceLoading } =
    useApp();
  const [weatherSnapshot, setWeatherSnapshot] = useState(null);
  const [holidaySnapshot, setHolidaySnapshot] = useState(null);
  const trendData = buildTrendSeries(students);
  const summarySource = workspaceLoading ? null : workspaceSummary;
  const summaryItems = summarySource
    ? [
        {
          label: "Modules",
          value: summarySource.modulesCount,
          icon: BookOpen,
        },
        {
          label: "Students",
          value: summarySource.learnersCount,
          icon: Users,
        },
        {
          label: "Passing rate",
          value: `${summarySource.passingRate ?? summarySource.averageScore ?? 0}%`,
          icon: CheckCircle2,
        },
      ]
    : [
        { label: "Modules", value: "Loading...", icon: BookOpen },
        { label: "Students", value: "Loading...", icon: Users },
        { label: "Passing rate", value: "Loading...", icon: CheckCircle2 },
      ];

  useEffect(() => {
    let isMounted = true;

    async function loadIntegrations() {
      const [weatherResult, holidayResult] = await Promise.all([
        fetchCurrentWeather(),
        fetchUpcomingPublicHoliday(),
      ]);

      if (!isMounted) return;

      setWeatherSnapshot(weatherResult);
      setHolidaySnapshot(holidayResult);
    }

    loadIntegrations();

    return () => {
      isMounted = false;
    };
  }, []);

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
          {summaryItems.map((item) => (
            <Card key={item.label} className="stat-card">
              <div className="stat-card-icon">
                <item.icon size={16} aria-hidden="true" />
              </div>
              <p>{item.label}</p>
              <strong>{item.value}</strong>
            </Card>
          ))}
        </div>

        <div className="dashboard-api-grid">
          <Card className="dashboard-api-card dashboard-weather-card">
            <div className="panel-header">
              <div>
                <p className="eyebrow">Weather today</p>
                <h3>Silang weather</h3>
              </div>
              <StatusPill tone={weatherSnapshot?.live ? "accent" : "neutral"}>
                {weatherSnapshot?.live ? "Live" : "Fallback"}
              </StatusPill>
            </div>

            {weatherSnapshot ? (
              <div className="dashboard-weather-body">
                <div className="dashboard-weather-value">
                  <CloudSun size={32} aria-hidden="true" />
                  <div>
                    <strong>{Math.round(weatherSnapshot.temperature)}°C</strong>
                    <p>{weatherSnapshot.description}</p>
                  </div>
                </div>

                <div className="dashboard-weather-meta">
                  <span>
                    <MapPin size={14} aria-hidden="true" />
                    {weatherSnapshot.city}, {weatherSnapshot.country}
                  </span>
                  <span>
                    <Droplets size={14} aria-hidden="true" />
                    {Math.round(weatherSnapshot.humidity)}% humidity
                  </span>
                  <span>
                    <Wind size={14} aria-hidden="true" />
                    {Math.round(weatherSnapshot.windSpeed)} km/h wind
                  </span>
                </div>

                <p className="dashboard-weather-note">
                  {weatherSnapshot.advice}
                </p>

                <p className="dashboard-api-note">
                  {formatUpdatedAt(weatherSnapshot.updatedAt)}
                </p>
              </div>
            ) : (
              <p>Loading weather data...</p>
            )}
          </Card>

          <Card className="dashboard-api-card dashboard-supabase-card">
            <div className="panel-header">
              <div>
                <p className="eyebrow">Summary</p>
                <h3>Dashboard summary</h3>
              </div>
              <StatusPill tone={summarySource?.live ? "accent" : "neutral"}>
                {summarySource
                  ? summarySource.live
                    ? "Synced"
                    : "Fallback"
                  : "Loading"}
              </StatusPill>
            </div>

            {summarySource ? (
              <div className="dashboard-supabase-stack">
                <div className="dashboard-supabase-grid">
                  <div className="dashboard-supabase-stat">
                    <strong>{summarySource.modulesCount}</strong>
                    <span>modules</span>
                  </div>
                  <div className="dashboard-supabase-stat">
                    <strong>{summarySource.sectionsCount}</strong>
                    <span>sections</span>
                  </div>
                  <div className="dashboard-supabase-stat">
                    <strong>{summarySource.activitiesCount}</strong>
                    <span>activities</span>
                  </div>
                  <div className="dashboard-supabase-stat">
                    <strong>{summarySource.learnersCount}</strong>
                    <span>learners</span>
                  </div>
                </div>

                <div className="dashboard-supabase-footer">
                  <span>{summarySource.sessionsCount} sessions tracked</span>
                  <span>Average score {summarySource.averageScore}%</span>
                </div>

                <p className="dashboard-api-note">
                  {formatUpdatedAt(summarySource.updatedAt)}
                </p>
              </div>
            ) : (
              <p>Loading Supabase summary...</p>
            )}
          </Card>

          <Card className="dashboard-api-card dashboard-holiday-card">
            <div className="panel-header">
              <div>
                <p className="eyebrow">Next holiday</p>
                <h3>Upcoming holiday</h3>
              </div>
              <StatusPill tone={holidaySnapshot?.live ? "accent" : "neutral"}>
                {holidaySnapshot?.live ? "Live" : "Fallback"}
              </StatusPill>
            </div>

            {holidaySnapshot ? (
              <div className="dashboard-holiday-stack">
                <div className="dashboard-holiday-figure">
                  <CalendarDays size={30} aria-hidden="true" />
                  <div>
                    <strong>{holidaySnapshot.name}</strong>
                    <span>{holidaySnapshot.dateLabel}</span>
                  </div>
                </div>

                <div className="dashboard-holiday-pill">
                  {formatDaysAway(holidaySnapshot.daysUntil)}
                </div>

                <p className="dashboard-api-note">
                  Plan ahead your module release schedule.
                </p>
              </div>
            ) : (
              <p>Loading public holiday data...</p>
            )}
          </Card>
        </div>

        <div className="content-grid dashboard-insights">
          <Card>
            <div className="panel-header">
              <div>
                <p className="eyebrow">Module analytics</p>
                <h3>Recent activity volume</h3>
              </div>
              <StatusPill tone={workspaceSummary.live ? "accent" : "neutral"}>
                {workspaceSummary.live ? "Live" : "Loading"}
              </StatusPill>
            </div>
            {trendData.labels.length ? (
              <div className="bar-chart">
                {trendData.bars.map((bar, index) => (
                  <div key={trendData.labels[index]} className="bar-column">
                    <div className="bar-track">
                      <span style={{ height: `${bar}%` }} />
                    </div>
                    <strong>{bar}%</strong>
                    <p>{trendData.labels[index]}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <h3>
                  {workspaceSummary.live
                    ? "No student activity yet"
                    : "Loading student activity"}
                </h3>
                <p>
                  {workspaceSummary.live
                    ? "Once students submit records in Supabase, this chart will reflect the live workspace activity."
                    : "Waiting for student records to sync from Supabase."}
                </p>
              </div>
            )}
          </Card>

          <Card>
            <div className="panel-header">
              <div>
                <p className="eyebrow">Scoring trend</p>
                <h3>Average scores by day</h3>
              </div>
              <StatusPill tone={workspaceSummary.live ? "accent" : "neutral"}>
                {workspaceSummary.live ? "Live" : "Loading"}
              </StatusPill>
            </div>
            <LineChart data={trendData.line} labels={trendData.labels} />
          </Card>
        </div>

        <div className="content-grid two-column">
          <Card>
            <div className="panel-header">
              <div>
                <p className="eyebrow">Module ranking</p>
                <h3>Highest scoring modules</h3>
              </div>
              <StatusPill tone={workspaceSummary.live ? "accent" : "neutral"}>
                {workspaceSummary.live ? "Live" : "Loading"}
              </StatusPill>
            </div>
            {modules.length ? (
              <div className="stack">
                {modules.map((module) => (
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
            ) : (
              <div className="empty-state">
                <h3>
                  {workspaceSummary.live
                    ? "No modules saved yet"
                    : "Loading modules"}
                </h3>
                <p>
                  {workspaceSummary.live
                    ? "Create or sync modules in Supabase to see live rankings here."
                    : "Waiting for module rows to load from Supabase."}
                </p>
              </div>
            )}
          </Card>

          <Card>
            <div className="panel-header">
              <div>
                <p className="eyebrow">Student pulse</p>
                <h3>Recent student performance</h3>
              </div>
              <StatusPill tone={workspaceSummary.live ? "accent" : "neutral"}>
                {workspaceSummary.live ? "Class view" : "Loading"}
              </StatusPill>
            </div>
            {students.length ? (
              <div className="stack">
                {students.slice(0, 3).map((student) => (
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
            ) : (
              <div className="empty-state">
                <h3>
                  {workspaceSummary.live
                    ? "No student records yet"
                    : "Loading students"}
                </h3>
                <p>
                  {workspaceSummary.live
                    ? "Once student rows exist in Supabase, their latest scores will show here."
                    : "Waiting for student rows to load from Supabase."}
                </p>
              </div>
            )}
          </Card>
        </div>
      </div>
    </PageShell>
  );
}
