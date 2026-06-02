import { useState, useEffect } from "react";
import { useApp } from "../../context/AppContext.jsx";
import { AdminLayout } from "../../components/layout/AdminLayout.jsx";
import {
  StatCard,
  SimpleBarChart,
  SimpleLineChart,
} from "../../components/ui/Charts.jsx";
import { Users, TrendingUp, FolderKanban, Activity } from "lucide-react";
import { supabase } from "../../services/integrations.js";

export default function AdminAnalyticsPage() {
  const { session, showToast, workspaceLoading } = useApp();
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalTeachers: 0,
    totalStudents: 0,
    totalParents: 0,
    totalModules: 0,
    totalActivities: 0,
  });
  const [chartData, setChartData] = useState({
    userGrowth: [],
    roleDistribution: [],
    moduleActivity: [],
    recentModules: [],
  });
  const [summary, setSummary] = useState({
    activeUsers: 0,
    avgModules: 0,
    totalSessions: 0,
    usageRate: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!workspaceLoading && session.role === "admin") {
      fetchAnalytics();
    }
  }, [workspaceLoading, session.role]);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      // 1. Fetch Basic Counts
      const [
        { count: totalUsers },
        { count: totalTeachers },
        { count: totalStudents },
        { count: totalParents },
        { count: totalModulesCount },
        { count: totalActivities },
        { count: totalAdmins },
      ] = await Promise.all([
        supabase.from("profiles").select("*", { count: "exact", head: true }),
        supabase.from("profiles").select("*", { count: "exact", head: true }).eq("role", "teacher"),
        supabase.from("profiles").select("*", { count: "exact", head: true }).eq("role", "student"),
        supabase.from("profiles").select("*", { count: "exact", head: true }).eq("role", "parent"),
        supabase.from("modules").select("*", { count: "exact", head: true }),
        supabase.from("activities").select("*", { count: "exact", head: true }),
        supabase.from("profiles").select("*", { count: "exact", head: true }).eq("role", "admin"),
      ]);

      setStats({
        totalUsers: totalUsers || 0,
        totalTeachers: totalTeachers || 0,
        totalStudents: totalStudents || 0,
        totalParents: totalParents || 0,
        totalModules: totalModulesCount || 0,
        totalActivities: totalActivities || 0,
      });

      // 2. Fetch Time-series Data for User Growth (Profiles created_at)
      const { data: profileDates } = await supabase
        .from("profiles")
        .select("created_at")
        .order("created_at", { ascending: true });

      const growthMap = {};
      profileDates?.forEach(p => {
        const date = new Date(p.created_at);
        const month = date.toLocaleString('default', { month: 'short', year: '2-digit' });
        growthMap[month] = (growthMap[month] || 0) + 1;
      });

      let cumulative = 0;
      const userGrowth = Object.entries(growthMap).map(([label, value]) => {
        cumulative += value;
        return { label, value: cumulative };
      });

      // 3. Recent App Activity (Sessions last 7 days)
      const { data: activitySessions } = await supabase
        .from("user_activity_sessions")
        .select("started_at, user_id")
        .gte("started_at", sevenDaysAgo.toISOString());

      const activityMap = {};
      const activeUsersSet = new Set();

      for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const label = d.toLocaleDateString('default', { weekday: 'short' });
        activityMap[label] = 0;
      }

      activitySessions?.forEach(s => {
        const d = new Date(s.started_at);
        const label = d.toLocaleDateString('default', { weekday: 'short' });
        if (activityMap[label] !== undefined) {
          activityMap[label]++;
        }
        activeUsersSet.add(s.user_id);
      });

      const moduleActivity = Object.entries(activityMap).map(([label, value]) => ({ label, value }));

      // 4. Recent Modules Created (last 7 days)
      const { data: recentModulesData } = await supabase
        .from("modules")
        .select("created_at")
        .gte("created_at", sevenDaysAgo.toISOString());

      const moduleCreationMap = {};
      for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const label = d.toLocaleDateString('default', { weekday: 'short' });
        moduleCreationMap[label] = 0;
      }

      recentModulesData?.forEach(m => {
        const d = new Date(m.created_at);
        const label = d.toLocaleDateString('default', { weekday: 'short' });
        if (moduleCreationMap[label] !== undefined) {
          moduleCreationMap[label]++;
        }
      });

      const recentModules = Object.entries(moduleCreationMap).map(([label, value]) => ({ label, value }));

      // 5. Summaries
      const { count: totalSessions } = await supabase
        .from("user_activity_sessions")
        .select("*", { count: "exact", head: true });

      setSummary({
        activeUsers: activeUsersSet.size,
        avgModules: totalTeachers > 0 ? (totalModulesCount / totalTeachers).toFixed(1) : 0,
        totalSessions: totalSessions || 0,
        usageRate: totalUsers > 0 ? Math.round((activeUsersSet.size / totalUsers) * 100) : 0,
      });

      // 6. Final Chart Data
      setChartData({
        userGrowth: userGrowth.slice(-6),
        roleDistribution: [
          { label: "Teachers", value: totalTeachers || 0, color: "#ef4444" },
          { label: "Students", value: totalStudents || 0, color: "#ef4444" },
          { label: "Parents", value: totalParents || 0, color: "var(--accent)" },
          { label: "Admins", value: totalAdmins || 0, color: "#34d399" },
        ],
        moduleActivity,
        recentModules,
      });

    } catch (error) {
      console.error("Analytics fetch error:", error);
      showToast("Error fetching analytics");
    }
    setLoading(false);
  };

  if (workspaceLoading) return null;

  if (session.role !== "admin") {
    return (
      <AdminLayout title="Access Denied">
        <p>You do not have permission to view this page.</p>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout
      title="Analytics & Reports"
      subtitle="System-wide analytics and performance metrics"
    >
      {loading ? (
        <p>Loading analytics...</p>
      ) : (
        <>
          {/* Key Metrics */}
          <div className="admin-stats-grid">
            <StatCard
              title="Total Users"
              value={stats.totalUsers}
              icon={Users}
              color="var(--accent)"
            />
            <StatCard
              title="Teachers"
              value={stats.totalTeachers}
              icon={TrendingUp}
              color="#ef4444"
            />
            <StatCard
              title="Students"
              value={stats.totalStudents}
              icon={Users}
              color="#ef4444"
            />
            <StatCard
              title="Parents"
              value={stats.totalParents}
              icon={Users}
              color="#fbbf24"
            />
          </div>

          {/* Charts */}
          <div className="admin-charts-grid">
            <div className="chart-card">
              <h3>User Growth (Cumulative)</h3>
              <SimpleLineChart
                data={chartData.userGrowth}
                label="Users"
                height={250}
              />
            </div>

            <div className="chart-card">
              <h3>Role Distribution</h3>
              <SimpleBarChart
                data={chartData.roleDistribution}
                height={250}
              />
            </div>

            <div className="chart-card">
              <h3>Recent App Activity (Sessions last 7 days)</h3>
              <SimpleLineChart
                data={chartData.moduleActivity}
                label="Sessions"
                height={250}
              />
            </div>

            <div className="chart-card">
              <h3>Recent Modules Created (Last 7 days)</h3>
              <SimpleLineChart
                data={chartData.recentModules}
                label="Modules"
                height={250}
              />
            </div>
          </div>

          {/* Summary Stats */}
          <div className="admin-summary-card" style={{ marginTop: "2rem" }}>
            <h3>System Summary</h3>
            <div className="summary-grid">
              <div className="summary-item">
                <span className="summary-label">Active Users (Last 7 Days)</span>
                <span className="summary-value">{summary.activeUsers}</span>
              </div>
              <div className="summary-item">
                <span className="summary-label">Avg. Modules per Teacher</span>
                <span className="summary-value">{summary.avgModules}</span>
              </div>
              <div className="summary-item">
                <span className="summary-label">Total Activities Performed</span>
                <span className="summary-value">{summary.totalSessions.toLocaleString()}</span>
              </div>
              <div className="summary-item">
                <span className="summary-label">Total Shared Items</span>
                <span className="summary-value">{stats.totalActivities}</span>
              </div>
            </div>
          </div>
        </>
      )}
    </AdminLayout>
  );
}
