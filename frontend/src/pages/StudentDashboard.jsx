import React, { useEffect, useMemo, useState } from 'react';
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import AIChatbot from '../components/AIChatbot';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { api } from '../services/api';

const levelColor = {
  Low: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  Medium: 'bg-amber-50 text-amber-700 border-amber-200',
  High: 'bg-orange-50 text-orange-700 border-orange-200',
  Critical: 'bg-red-50 text-red-700 border-red-200',
};

export default function StudentDashboard() {
  const { user, logout } = useAuth();
  const socket = useSocket();
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');
  const [checkins, setCheckins] = useState([]);
  const [riskScore, setRiskScore] = useState({ score: 0, riskLevel: 'Low', factors: [] });
  const [academics, setAcademics] = useState(null);

  const [academicForm, setAcademicForm] = useState({
    attendancePercentage: academics?.attendancePercentage ?? 85,
    assignmentSubmissionRate: academics?.assignmentSubmissionRate ?? 90,
    averageExamScore: academics?.averageExamScore ?? 70,
  });

  const [form, setForm] = useState({
    moodScore: 6,
    stressLevel: 5,
    sleepHours: 7,
    notes: '',
  });

  const trendData = useMemo(() => {
    return [...checkins]
      .slice()
      .reverse()
      .map((c) => ({
        date: new Date(c.submittedAt).toLocaleDateString(),
        mood: c.moodScore,
        stress: c.stressLevel,
        sleep: c.sleepHours,
      }));
  }, [checkins]);

  const fetchDashboard = async () => {
    setErr('');
    setLoading(true);
    try {
      const { data } = await api.get('/api/student/dashboard');
      setCheckins(data.checkins || []);
      setRiskScore(data.riskScore || { score: 0, riskLevel: 'Low', factors: [] });
      setAcademics(data.academics || null);
      if (data.academics) {
        setAcademicForm({
          attendancePercentage: data.academics.attendancePercentage ?? 85,
          assignmentSubmissionRate: data.academics.assignmentSubmissionRate ?? 90,
          averageExamScore: data.academics.averageExamScore ?? 70,
        });
      }
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
    const onRiskUpdate = (payload) => {
      if (payload?.studentId === user?._id) {
        setRiskScore({
          score: payload.score,
          riskLevel: payload.riskLevel,
          factors: payload.factors || [],
        });
      }
    };
    socket.on('riskUpdate', onRiskUpdate);
    return () => socket.off('riskUpdate', onRiskUpdate);
  }, [socket, user?._id]);

  const submitCheckin = async (e) => {
    e.preventDefault();
    setErr('');
    try {
      await api.post('/api/student/wellness', {
        moodScore: Number(form.moodScore),
        stressLevel: Number(form.stressLevel),
        sleepHours: Number(form.sleepHours),
        notes: form.notes,
      });
      setForm((f) => ({ ...f, notes: '' }));
      await fetchDashboard();
    } catch (e2) {
      setErr(e2.response?.data?.message || 'Failed to submit check-in');
    }
  };

  const submitAcademics = async (e) => {
    e.preventDefault();
    setErr('');
    try {
      await api.post('/api/student/academics', {
        attendancePercentage: Number(academicForm.attendancePercentage),
        assignmentSubmissionRate: Number(academicForm.assignmentSubmissionRate),
        averageExamScore: Number(academicForm.averageExamScore),
      });
      await fetchDashboard();
    } catch (e2) {
      setErr(e2.response?.data?.message || 'Failed to save academic details');
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading dashboard…</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="sticky top-0 z-10 bg-white border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <div className="text-xs text-gray-500">Student Dashboard</div>
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
        {err && <div className="border border-red-200 bg-red-50 text-red-700 rounded-xl p-4">{err}</div>}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
            <div className="text-sm text-gray-500">Current Risk</div>
            <div className="mt-2 flex items-center gap-3">
              <div className="text-4xl font-extrabold">{Math.round(riskScore.score)}%</div>
              <div className={`px-3 py-1 rounded-full border text-sm ${levelColor[riskScore.riskLevel] || levelColor.Low}`}>
                {riskScore.riskLevel}
              </div>
            </div>
            <div className="mt-3 text-sm text-gray-600">
              {(riskScore.factors || []).slice(0, 3).join(' • ') || 'No risk factors detected yet.'}
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
            <div className="text-sm text-gray-500">Latest Check-in</div>
            {checkins?.[0] ? (
              <div className="mt-2 text-sm text-gray-700 space-y-1">
                <div>
                  <span className="font-semibold">Mood</span>: {checkins[0].moodScore}/10
                </div>
                <div>
                  <span className="font-semibold">Stress</span>: {checkins[0].stressLevel}/10
                </div>
                <div>
                  <span className="font-semibold">Sleep</span>: {checkins[0].sleepHours} hrs
                </div>
              </div>
            ) : (
              <div className="mt-2 text-sm text-gray-600">No check-ins yet. Submit one below.</div>
            )}
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
            <div className="text-sm text-gray-500">Academic Snapshot</div>
            {academics ? (
              <div className="mt-2 text-sm text-gray-700 space-y-1">
                <div>
                  <span className="font-semibold">Attendance</span>: {academics.attendancePercentage ?? '—'}%
                </div>
                <div>
                  <span className="font-semibold">Assignment Submissions</span>: {academics.assignmentSubmissionRate ?? '—'}%
                </div>
                <div>
                  <span className="font-semibold">Avg Exam Score</span>: {academics.averageExamScore ?? '—'}%
                </div>
              </div>
            ) : (
              <div className="mt-2 text-sm text-gray-600">No academic record found yet.</div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-lg font-bold">Well-being Trend</div>
              <div className="text-sm text-gray-500">Mood, stress, and sleep from recent check-ins</div>
            </div>
            <button
              onClick={fetchDashboard}
              className="px-3 py-2 rounded-lg text-sm border border-gray-200 hover:bg-gray-50"
            >
              Refresh
            </button>
          </div>
          <div className="mt-4 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="mood" stroke="#0ea5e9" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="stress" stroke="#14b8a6" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="sleep" stroke="#6366f1" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
            <div className="text-lg font-bold">Submit a Wellness Check-in</div>
            <div className="text-sm text-gray-500">This updates your risk score and can trigger support alerts.</div>
            <form className="mt-4 space-y-3" onSubmit={submitCheckin}>
              <div className="grid grid-cols-3 gap-3">
                <label className="text-sm">
                  <div className="text-gray-600 mb-1">Mood (1-10)</div>
                  <input
                    className="w-full rounded-lg border border-gray-200 px-3 py-2"
                    type="number"
                    min="1"
                    max="10"
                    value={form.moodScore}
                    onChange={(e) => setForm((f) => ({ ...f, moodScore: e.target.value }))}
                  />
                </label>
                <label className="text-sm">
                  <div className="text-gray-600 mb-1">Stress (1-10)</div>
                  <input
                    className="w-full rounded-lg border border-gray-200 px-3 py-2"
                    type="number"
                    min="1"
                    max="10"
                    value={form.stressLevel}
                    onChange={(e) => setForm((f) => ({ ...f, stressLevel: e.target.value }))}
                  />
                </label>
                <label className="text-sm">
                  <div className="text-gray-600 mb-1">Sleep (hrs)</div>
                  <input
                    className="w-full rounded-lg border border-gray-200 px-3 py-2"
                    type="number"
                    min="0"
                    max="16"
                    value={form.sleepHours}
                    onChange={(e) => setForm((f) => ({ ...f, sleepHours: e.target.value }))}
                  />
                </label>
              </div>
              <label className="text-sm block">
                <div className="text-gray-600 mb-1">Notes (optional)</div>
                <textarea
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 min-h-24"
                  value={form.notes}
                  onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                  placeholder="Anything you want to share…"
                />
              </label>
              <button className="w-full py-3 rounded-lg bg-primary text-white font-medium hover:bg-opacity-90">
                Submit Check-in
              </button>
            </form>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
            <div className="text-lg font-bold">Update Academic Details</div>
            <div className="text-sm text-gray-500">Used by the AI risk engine (attendance, assignments, exams)</div>
            <form className="mt-4 space-y-3" onSubmit={submitAcademics}>
              <div className="grid grid-cols-3 gap-3">
                <label className="text-sm">
                  <div className="text-gray-600 mb-1">Attendance %</div>
                  <input
                    className="w-full rounded-lg border border-gray-200 px-3 py-2"
                    type="number"
                    min="0"
                    max="100"
                    value={academicForm.attendancePercentage}
                    onChange={(e) =>
                      setAcademicForm((f) => ({ ...f, attendancePercentage: e.target.value }))
                    }
                  />
                </label>
                <label className="text-sm">
                  <div className="text-gray-600 mb-1">Assignments %</div>
                  <input
                    className="w-full rounded-lg border border-gray-200 px-3 py-2"
                    type="number"
                    min="0"
                    max="100"
                    value={academicForm.assignmentSubmissionRate}
                    onChange={(e) =>
                      setAcademicForm((f) => ({ ...f, assignmentSubmissionRate: e.target.value }))
                    }
                  />
                </label>
                <label className="text-sm">
                  <div className="text-gray-600 mb-1">Avg Exam %</div>
                  <input
                    className="w-full rounded-lg border border-gray-200 px-3 py-2"
                    type="number"
                    min="0"
                    max="100"
                    value={academicForm.averageExamScore}
                    onChange={(e) =>
                      setAcademicForm((f) => ({ ...f, averageExamScore: e.target.value }))
                    }
                  />
                </label>
              </div>
              <button className="w-full py-3 rounded-lg bg-secondary text-white font-medium hover:bg-opacity-90">
                Save Academic Details
              </button>
            </form>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
            <div className="text-lg font-bold">Recommended Support</div>
            <div className="text-sm text-gray-500">Based on your current signals</div>
            <div className="mt-4 space-y-3 text-sm">
              {riskScore.riskLevel === 'Critical' && (
                <div className="p-3 rounded-xl border border-red-200 bg-red-50 text-red-800">
                  Please contact a counselor immediately. You can also reach emergency support in your region.
                </div>
              )}
              {riskScore.riskLevel === 'High' && (
                <div className="p-3 rounded-xl border border-orange-200 bg-orange-50 text-orange-800">
                  Consider scheduling a counselor check-in and connecting with a mentor this week.
                </div>
              )}
              {(riskScore.riskLevel === 'Low' || riskScore.riskLevel === 'Medium') && (
                <div className="p-3 rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-800">
                  Keep up healthy routines. Try small daily habits: hydration, a short walk, and consistent sleep.
                </div>
              )}
              <div className="p-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-700">
                Tip: Use the AI Wellness Assistant (bottom-right) for anonymous support and campus resources.
              </div>
            </div>
          </div>
        </div>
      </div>

      <AIChatbot />
    </div>
  );
}

