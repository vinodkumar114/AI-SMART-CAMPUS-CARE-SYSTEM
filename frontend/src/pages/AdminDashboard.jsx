import React, { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { api } from '../services/api';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';

const COLORS = {
  Low: '#10b981',
  Medium: '#f59e0b',
  High: '#f97316',
  Critical: '#ef4444',
};

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const socket = useSocket();
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');
  const [resources, setResources] = useState([]);
  const [energy, setEnergy] = useState([]);
  const [riskDistribution, setRiskDistribution] = useState({ Low: 0, Medium: 0, High: 0, Critical: 0 });
  const [totalStudentsScored, setTotalStudentsScored] = useState(0);
  const [liveAlerts, setLiveAlerts] = useState([]);

  const pieData = useMemo(() => {
    return Object.entries(riskDistribution).map(([name, value]) => ({ name, value }));
  }, [riskDistribution]);

  const fetchDashboard = async () => {
    setErr('');
    setLoading(true);
    try {
      const { data } = await api.get('/api/admin/dashboard');
      setResources(data.resources || []);
      setEnergy(data.energy || []);
      setRiskDistribution(data.riskDistribution || { Low: 0, Medium: 0, High: 0, Critical: 0 });
      setTotalStudentsScored(data.totalStudentsScored || 0);
    } catch (e) {
      setErr(e.response?.data?.message || 'Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!socket) return;
    const onNewAlert = (alert) => setLiveAlerts((prev) => [alert, ...prev].slice(0, 8));
    socket.on('newAlert', onNewAlert);
    return () => socket.off('newAlert', onNewAlert);
  }, [socket]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading dashboard…</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="sticky top-0 z-10 bg-white border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <div className="text-xs text-gray-500">Admin Smart Campus Panel</div>
            <div className="text-xl font-extrabold text-primary">
              Campus Guardian <span className="text-secondary">AI</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-sm text-gray-700">{user?.name}</div>
            <button
              onClick={logout}
              className="px-3 py-2 rounded-lg text-sm bg-gray-900 text-white hover:bg-gray-800"
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
        {err && (
          <div className="border border-red-200 bg-red-50 text-red-700 rounded-xl p-4">
            {err}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
            <div className="text-sm text-gray-500">Students Scored</div>
            <div className="mt-2 text-3xl font-extrabold">{totalStudentsScored}</div>
            <button
              onClick={fetchDashboard}
              className="mt-3 w-full px-3 py-2 rounded-lg text-sm border border-gray-200 hover:bg-gray-50"
            >
              Refresh
            </button>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm lg:col-span-2">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-lg font-bold">Risk Distribution</div>
                <div className="text-sm text-gray-500">Campus-wide well-being snapshot</div>
              </div>
            </div>
            <div className="mt-4 h-56">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={pieData} dataKey="value" nameKey="name" innerRadius={55} outerRadius={85} paddingAngle={2}>
                    {pieData.map((entry) => (
                      <Cell key={entry.name} fill={COLORS[entry.name] || '#94a3b8'} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
            <div className="text-lg font-bold">Campus Resources</div>
            <div className="text-sm text-gray-500">Utilization & capacity</div>
            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-left text-gray-500">
                  <tr>
                    <th className="py-2">Resource</th>
                    <th className="py-2">Capacity</th>
                    <th className="py-2">In Use</th>
                    <th className="py-2">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {resources.map((r) => (
                    <tr key={r._id} className="border-t border-gray-100">
                      <td className="py-3 font-semibold">{r.name}</td>
                      <td className="py-3">{r.capacity ?? '—'}</td>
                      <td className="py-3">{r.currentUsage ?? '—'}</td>
                      <td className="py-3 text-gray-700">{r.status ?? '—'}</td>
                    </tr>
                  ))}
                  {resources.length === 0 && (
                    <tr>
                      <td className="py-6 text-gray-600" colSpan={4}>
                        No resources data yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
            <div className="text-lg font-bold">Realtime Alerts</div>
            <div className="text-sm text-gray-500">Live feed from the risk engine</div>
            <div className="mt-4 space-y-3">
              {liveAlerts.map((a) => (
                <div key={a._id} className="p-4 rounded-xl border border-gray-100 bg-gray-50">
                  <div className="flex items-center justify-between gap-4">
                    <div className="font-semibold text-gray-800">{a.type}</div>
                    <div className="text-xs text-gray-500">{new Date(a.createdAt).toLocaleString()}</div>
                  </div>
                  <div className="mt-2 text-sm text-gray-700">{a.message}</div>
                </div>
              ))}
              {liveAlerts.length === 0 && (
                <div className="text-sm text-gray-600">No live alerts yet. Submit a student check-in to trigger one.</div>
              )}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
          <div className="text-lg font-bold">Energy Usage (Recent)</div>
          <div className="text-sm text-gray-500">Last recorded readings</div>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-left text-gray-500">
                <tr>
                  <th className="py-2">Recorded At</th>
                  <th className="py-2">kWh</th>
                  <th className="py-2">Location</th>
                </tr>
              </thead>
              <tbody>
                {energy.map((e) => (
                  <tr key={e._id} className="border-t border-gray-100">
                    <td className="py-3 text-gray-700">{new Date(e.recordedAt).toLocaleString()}</td>
                    <td className="py-3 font-semibold">{e.kwh ?? '—'}</td>
                    <td className="py-3 text-gray-700">{e.location ?? '—'}</td>
                  </tr>
                ))}
                {energy.length === 0 && (
                  <tr>
                    <td className="py-6 text-gray-600" colSpan={3}>
                      No energy logs yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
