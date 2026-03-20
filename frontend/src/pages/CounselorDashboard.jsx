import React, { useEffect, useMemo, useState } from 'react';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { api } from '../services/api';

export default function CounselorDashboard() {
  const { user, logout } = useAuth();
  const socket = useSocket();
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');
  const [highRiskStudents, setHighRiskStudents] = useState([]);
  const [alerts, setAlerts] = useState([]);

  const chartData = useMemo(() => {
    const grouped = { High: 0, Critical: 0 };
    for (const r of highRiskStudents) grouped[r.riskLevel] = (grouped[r.riskLevel] || 0) + 1;
    return [
      { level: 'High', count: grouped.High || 0 },
      { level: 'Critical', count: grouped.Critical || 0 },
    ];
  }, [highRiskStudents]);

  const fetchDashboard = async () => {
    setErr('');
    setLoading(true);
    try {
      const { data } = await api.get('/api/counselor/dashboard');
      setHighRiskStudents(data.highRiskStudents || []);
      setAlerts(data.alerts || []);
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
    const onNewAlert = (alert) => setAlerts((prev) => [alert, ...prev]);
    socket.on('newAlert', onNewAlert);
    return () => socket.off('newAlert', onNewAlert);
  }, [socket]);

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading dashboard…</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="sticky top-0 z-10 bg-white border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <div className="text-xs text-gray-500">Counselor / Mentor Dashboard</div>
            <div className="text-xl font-extrabold text-primary">
              Campus Guardian <span className="text-secondary">AI</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-sm text-gray-700">{user?.name}</div>
            <button onClick={logout} className="px-3 py-2 rounded-lg text-sm bg-gray-900 text-white hover:bg-gray-800">
              Logout
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
        {err && <div className="border border-red-200 bg-red-50 text-red-700 rounded-xl p-4">{err}</div>}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm lg:col-span-1">
            <div className="text-sm text-gray-500">High-Risk Overview</div>
            <div className="mt-2 text-3xl font-extrabold">{highRiskStudents.length}</div>
            <div className="mt-3 h-40">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="level" />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#ef4444" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <button onClick={fetchDashboard} className="mt-3 w-full px-3 py-2 rounded-lg text-sm border border-gray-200 hover:bg-gray-50">
              Refresh
            </button>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm lg:col-span-2">
            <div className="text-lg font-bold">High-Risk Students</div>
            <div className="text-sm text-gray-500">Sorted by risk score</div>
            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-left text-gray-500">
                  <tr>
                    <th className="py-2">Student</th>
                    <th className="py-2">Risk</th>
                    <th className="py-2">Score</th>
                    <th className="py-2">Last Calculated</th>
                  </tr>
                </thead>
                <tbody>
                  {highRiskStudents.map((r) => (
                    <tr key={r._id} className="border-t border-gray-100">
                      <td className="py-3">
                        <div className="font-semibold">{r.studentId?.name || 'Unknown'}</div>
                        <div className="text-gray-500">{r.studentId?.email || ''}</div>
                      </td>
                      <td className="py-3">
                        <span className={`px-2 py-1 rounded-full text-xs ${r.riskLevel === 'Critical' ? 'bg-red-50 text-red-700' : 'bg-orange-50 text-orange-700'}`}>
                          {r.riskLevel}
                        </span>
                      </td>
                      <td className="py-3 font-semibold">{Math.round(r.score)}%</td>
                      <td className="py-3 text-gray-600">{new Date(r.calculatedAt).toLocaleString()}</td>
                    </tr>
                  ))}
                  {highRiskStudents.length === 0 && (
                    <tr>
                      <td className="py-6 text-gray-600" colSpan={4}>
                        No high-risk students right now.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
          <div className="text-lg font-bold">Unread Alerts (Realtime)</div>
          <div className="text-sm text-gray-500">New alerts will appear instantly</div>
          <div className="mt-4 space-y-3">
            {alerts.map((a) => (
              <div key={a._id} className="p-4 rounded-xl border border-gray-100 bg-gray-50">
                <div className="flex items-center justify-between gap-4">
                  <div className="font-semibold text-gray-800">{a.type}</div>
                  <div className="text-xs text-gray-500">{new Date(a.createdAt).toLocaleString()}</div>
                </div>
                <div className="mt-2 text-sm text-gray-700">{a.message}</div>
              </div>
            ))}
            {alerts.length === 0 && <div className="text-sm text-gray-600">No unread alerts.</div>}
          </div>
        </div>
      </div>
    </div>
  );
}

