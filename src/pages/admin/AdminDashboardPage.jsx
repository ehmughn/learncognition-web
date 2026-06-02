import { useState, useEffect } from "react";
import { useApp } from "../../context/AppContext.jsx";
import { AdminLayout } from "../../components/layout/AdminLayout.jsx";
import { SimpleBarChart, StatCard } from "../../components/ui/Charts.jsx";
import { PrimaryButton } from "../../components/ui/Button.jsx";
import {
  Users,
  Package,
  FolderKanban,
  TrendingUp,
  ArrowRight,
} from "lucide-react";
import { supabase } from "../../services/integrations.js";

// Internal component for the dashboard stats
function DashboardStatCard({ title, value, icon: Icon, color }) {
  // Handle background color (hex vs variables)
  const isHex = color?.startsWith("#");
  const bgColor = isHex
    ? `${color}15`
    : `color-mix(in srgb, ${color}, transparent 85%)`;

  return (
    <div className="stat-card">
      <div
        className="stat-card-icon"
        style={{ backgroundColor: bgColor, color: color }}
      >
        <Icon size={24} />
      </div>
      <div className="stat-card-content">
        <p className="stat-card-title">{title}</p>
        <h3 className="stat-card-value">{value}</h3>
      </div>
    </div>
  );
}

export default function AdminDashboardPage() {
  const { session, workspaceLoading, navigate } = useApp();
  const [stats, setStats] = useState({
    accounts: 0,
    teachers: 0,
    students: 0,
    parents: 0,
    modules: 0,
    items: 0,
  });
  const [loading, setLoading] = useState(true);
  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    if (!workspaceLoading && session.role === "admin") {
      fetchStats();
    }
  }, [workspaceLoading, session.role]);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const [
        { count: accountsCount },
        { count: teachersCount },
        { count: studentsCount },
        { count: parentsCount },
        { count: itemsCount },
        { count: modulesCount },
      ] = await Promise.all([
        supabase.from("profiles").select("*", { count: "exact", head: true }),
        supabase
          .from("profiles")
          .select("*", { count: "exact", head: true })
          .eq("role", "teacher"),
        supabase
          .from("profiles")
          .select("*", { count: "exact", head: true })
          .eq("role", "student"),
        supabase
          .from("profiles")
          .select("*", { count: "exact", head: true })
          .eq("role", "parent"),
        supabase
          .from("shared_activity_objects")
          .select("*", { count: "exact", head: true }),
        supabase.from("modules").select("*", { count: "exact", head: true }),
      ]);

      setStats({
        accounts: accountsCount ?? 0,
        teachers: teachersCount ?? 0,
        students: studentsCount ?? 0,
        parents: parentsCount ?? 0,
        modules: modulesCount ?? 0,
        items: itemsCount ?? 0,
      });

      // Generate chart data matching all roles
      setChartData([
        { label: "Teachers", value: teachersCount ?? 0, color: "#ef4444" },
        { label: "Students", value: studentsCount ?? 0, color: "#ef4444" },
        { label: "Parents", value: parentsCount ?? 0, color: "var(--accent)" },
      ]);
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <AdminLayout title="Dashboard">
        <p>Loading dashboard...</p>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout
      title="Dashboard"
      subtitle="Overview of the LearnCognition system"
    >
      <>
        {/* Key Metrics */}
          <div className="admin-stats-grid">
            <StatCard
              title="Total Accounts"
              value={stats.accounts}
              icon={Users}
              color="var(--accent)"
            />
            <StatCard
              title="Teachers"
              value={stats.teachers}
              icon={Users}
              color="#ef4444"
            />
            <StatCard
              title="Students"
              value={stats.students}
              icon={Users}
              color="#ef4444"
            />
            <StatCard
              title="Modules"
              value={stats.modules}
              icon={FolderKanban}
              color="#ef4444"
            />
          </div>

          {/* Main Grid */}
          <div className="admin-dashboard-grid">
            {/* User Distribution */}
            <div className="dashboard-card">
              <h3>User Distribution</h3>
              <SimpleBarChart data={chartData} height={200} />
              <PrimaryButton
                onClick={() => navigate("/admin/accounts")}
                style={{
                  width: "100%",
                  marginTop: "1.5rem",
                }}
              >
                <Users size={16} /> Manage Users
              </PrimaryButton>
            </div>

            {/* Quick Actions */}
            <div className="dashboard-card quick-actions">
              <h3>Quick Actions</h3>
              <div className="actions-list">
                <button
                  onClick={() => navigate("/admin/accounts")}
                  className="action-link"
                >
                  <span>Manage Accounts</span>
                  <ArrowRight size={16} />
                </button>
                <button
                  onClick={() => navigate("/admin/teachers")}
                  className="action-link"
                >
                  <span>Teachers</span>
                  <ArrowRight size={16} />
                </button>
                <button
                  onClick={() => navigate("/admin/parents")}
                  className="action-link"
                >
                  <span>Parents</span>
                  <ArrowRight size={16} />
                </button>
                <button
                  onClick={() => navigate("/admin/students")}
                  className="action-link"
                >
                  <span>Students</span>
                  <ArrowRight size={16} />
                </button>
                <button
                  onClick={() => navigate("/admin/analytics")}
                  className="action-link"
                >
                  <span>Analytics</span>
                  <ArrowRight size={16} />
                </button>
                <button
                  onClick={() => navigate("/admin/items")}
                  className="action-link"
                >
                  <span>Items</span>
                  <ArrowRight size={16} />
                </button>
              </div>
            </div>
          </div>

          {/* System Info */}
          <div className="system-info-card">
            <h3>System Information</h3>
            <div className="info-grid">
              <div className="info-item">
                <span className="info-label">Platform Status</span>
                <span className="info-value">
                  <span className="status-dot active" /> Operational
                </span>
              </div>
              <div className="info-item">
                <span className="info-label">Total Items in Library</span>
                <span className="info-value">{stats.items}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Last Updated</span>
                <span className="info-value">
                  {new Date().toLocaleDateString()}
                </span>
              </div>
              <div className="info-item">
                <span className="info-label">Admin Role</span>
                <span className="info-value">
                  {session.role?.toUpperCase()}
                </span>
              </div>
            </div>
          </div>
        </>
    </AdminLayout>
  );
}
