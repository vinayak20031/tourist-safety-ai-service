import { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { HiOutlineSignal } from 'react-icons/hi2';
import StatsCards from '../components/dashboard/StatsCards';
import LiveMap from '../components/dashboard/LiveMap';
import IncidentPanel from '../components/dashboard/IncidentPanel';
import AnalyticsCharts from '../components/dashboard/AnalyticsCharts';
import HeatmapView from '../components/dashboard/HeatmapView';
import { analyticsAPI, incidentAPI } from '../services/api';
import useSocket from '../hooks/useSocket';
import toast from 'react-hot-toast';
import LoadingSpinner from '../components/common/LoadingSpinner';

const AuthorityDashboard = () => {
  const [stats, setStats] = useState(null);
  const [incidents, setIncidents] = useState([]);
  const [heatmapData, setHeatmapData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  const fetchData = useCallback(async () => {
    try {
      const [dashRes, incRes, heatRes] = await Promise.all([
        analyticsAPI.getDashboard(),
        incidentAPI.getAll({ limit: 50 }),
        analyticsAPI.getHeatmap({ days: 30 })
      ]);
      setStats(dashRes.data?.overview);
      setIncidents(incRes.data || []);
      setHeatmapData(heatRes.data || []);
    } catch (err) {
      console.error('Dashboard fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  // Real-time incident updates
  useSocket('incident:new', (data) => {
    setIncidents(prev => [data.incident, ...prev]);
    toast.error(`New ${data.incident.severity} incident: ${data.incident.type}`, {
      duration: 6000,
      icon: data.incident.type === 'sos' ? '🆘' : '⚠️'
    });
    setStats(prev => prev ? {
      ...prev,
      openIncidents: prev.openIncidents + 1,
      totalIncidents: prev.totalIncidents + 1,
      ...(data.incident.severity === 'critical' ? { criticalIncidents: prev.criticalIncidents + 1 } : {})
    } : prev);
  });

  useSocket('sos:alert', (data) => {
    toast.error(
      `🆘 SOS from ${data.tourist.name} (${data.tourist.dtid})!`,
      { duration: 10000 }
    );
  });

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'analytics', label: 'Analytics' },
    { id: 'heatmap', label: 'Heatmap' }
  ];

  if (loading) return <LoadingSpinner text="Loading dashboard..." />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Authority Dashboard</h1>
          <p className="text-[var(--text-secondary)] text-sm flex items-center gap-2 mt-1">
            <HiOutlineSignal className="w-4 h-4 text-green-500" />
            Real-time monitoring active
          </p>
        </div>

        {/* Tab selector */}
        <div className="flex gap-1 p-1 rounded-xl bg-gray-100 dark:bg-slate-800">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === tab.id
                  ? 'bg-white dark:bg-slate-700 shadow-sm'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Stats */}
      <StatsCards stats={stats} />

      {/* Tab content */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <LiveMap incidents={incidents} />
          </div>
          <div className="lg:col-span-1">
            <IncidentPanel incidents={incidents} onUpdate={fetchData} />
          </div>
        </div>
      )}

      {activeTab === 'analytics' && <AnalyticsCharts />}

      {activeTab === 'heatmap' && (
        <div>
          <h2 className="text-lg font-semibold mb-4">Risk Heatmap (Last 30 Days)</h2>
          <HeatmapView data={heatmapData} />
        </div>
      )}
    </div>
  );
};

export default AuthorityDashboard;
