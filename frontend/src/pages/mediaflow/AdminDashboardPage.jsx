import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { api, ApiError, isSessionExpiredError } from '../../lib/api';
import UploadFrequencyChart from '../../components/mediaflow/UploadFrequencyChart';
import { NameAvatar } from '../../components/NameAvatar';

function getComplaintActiveRole(user) {
  if (user?.role === 'super_admin') return 'super_admin';
  if (user?.role === 'admin') return 'admin';
  return 'admin';
}

function ComplaintPreviewCard({ complaint, onResolve, resolving }) {
  return (
    <div className="mf-card relative flex flex-col gap-4 overflow-hidden p-5">
      <div className="absolute bottom-0 left-0 top-0 w-1 rounded-l-[24px] bg-error" />
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <NameAvatar
            name={complaint.name}
            avatar={complaint.avatar}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary"
            title={complaint.name}
          />
          <div className="min-w-0">
            <h4 className="mf-text-card-title truncate text-sm">{complaint.name}</h4>
            <p className="mf-text-meta">{complaint.role}</p>
          </div>
        </div>
        <span className="mf-text-meta shrink-0">{complaint.time}</span>
      </div>
      <div>
        <p className="text-sm font-semibold text-on-surface">
          {complaint.category === 'Other' ? complaint.subject : complaint.category}
        </p>
        <p className="mf-text-body mt-1 line-clamp-3 leading-relaxed">{complaint.body}</p>
      </div>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => onResolve(complaint.id)}
          disabled={resolving === complaint.id}
          className="mf-btn-primary !h-9 flex-1 !rounded-xl !text-xs"
        >
          {resolving === complaint.id ? 'Resolving...' : 'Resolve'}
        </button>
      </div>
    </div>
  );
}

export default function AdminDashboardPage() {
  const { accessToken, user } = useAuth();
  const activeRole = getComplaintActiveRole(user);

  const [metrics, setMetrics] = useState(null);
  const [uploadChart, setUploadChart] = useState([]);
  const [openComplaints, setOpenComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [resolving, setResolving] = useState('');

  const loadDashboard = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await api.getAdminDashboard(accessToken, activeRole);
      setMetrics(data.metrics);
      setUploadChart(data.uploadChart);
      setOpenComplaints(data.openComplaints);
    } catch (err) {
      if (isSessionExpiredError(err)) return;
      setError(err instanceof ApiError ? err.message : 'Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, [accessToken, activeRole]);

  const metricCards = useMemo(() => {
    if (!metrics) return [];
    return [
      {
        label: 'Total events',
        value: String(metrics.totalEvents),
        sub: 'All events in the system',
        subClass: 'text-on-surface-variant',
        icon: 'event_note',
        iconClass: 'text-on-surface bg-surface-container',
      },
      {
        label: 'Active events',
        value: String(metrics.activeEvents),
        sub: 'Events marked as started by cameramen',
        subClass: 'text-on-surface-variant',
        icon: 'sensors',
        iconClass: 'text-amber-700 bg-amber-500/10',
      },
      {
        label: 'Open complaints',
        value: String(metrics.openComplaints),
        sub: metrics.openComplaints > 0 ? 'Awaiting admin review' : 'No open complaints',
        subClass: metrics.openComplaints > 0 ? 'text-error font-semibold' : 'text-on-surface-variant',
        icon: 'report',
        iconClass: 'text-error bg-error/10',
        valueClass: metrics.openComplaints > 0 ? 'text-error' : 'text-on-surface',
        badge: metrics.openComplaints > 0 ? String(metrics.openComplaints) : null,
      },
    ];
  }, [metrics]);

  const handleResolve = async (complaintId) => {
    setResolving(complaintId);
    try {
      await api.resolveComplaint(complaintId, {}, accessToken, activeRole);
      setOpenComplaints((prev) => prev.filter((c) => c.id !== complaintId));
      setMetrics((prev) =>
        prev ? { ...prev, openComplaints: Math.max(0, prev.openComplaints - 1) } : prev
      );
    } catch {
      // keep card visible on failure
    } finally {
      setResolving('');
    }
  };

  return (
    <div>
      <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <h2 className="mf-text-section">Administrative Overview</h2>
          <p className="mf-text-body mt-1">Real-time media operations and studio management.</p>
        </div>
      </div>

      {loading ? (
        <div className="mf-text-body py-12 text-center">Loading dashboard...</div>
      ) : error ? (
        <div className="mf-card p-8 text-center">
          <p className="text-error mb-4">{error}</p>
          <button type="button" className="mf-btn-secondary" onClick={loadDashboard}>
            Retry
          </button>
        </div>
      ) : (
        <>
          <div className="mb-6 grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {metricCards.map((m) => (
              <div key={m.label} className="mf-stat-card flex flex-col">
                <div className="mb-4 flex items-start justify-between">
                  <span className="mf-text-label-caps">{m.label}</span>
                  <div className="flex items-center gap-2">
                    {m.badge && (
                      <span className="rounded-full bg-error px-1.5 py-0.5 text-[10px] font-bold text-white">
                        {m.badge}
                      </span>
                    )}
                    <span className={`material-symbols-outlined rounded-lg p-1.5 text-[20px] ${m.iconClass}`}>
                      {m.icon}
                    </span>
                  </div>
                </div>
                <p className={`text-[32px] font-bold leading-none tracking-tight ${m.valueClass || 'text-on-surface'}`}>
                  {m.value}
                </p>
                <p className={`mf-text-meta mt-2 ${m.subClass}`}>{m.sub}</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
            <div className="lg:col-span-8">
              <UploadFrequencyChart chartData={uploadChart} />
            </div>

            <div className="flex flex-col gap-4 lg:col-span-4">
              <div className="flex items-center justify-between">
                <h3 className="mf-text-card-title text-base">Open Complaints</h3>
                {metrics?.openComplaints > 0 && (
                  <span className="mf-text-meta rounded-full bg-error/10 px-2 py-0.5 font-bold text-error">
                    {metrics.openComplaints} open
                  </span>
                )}
              </div>

              {openComplaints.length === 0 ? (
                <div className="mf-card p-6 text-center mf-text-body">
                  No open complaints right now.
                </div>
              ) : (
                openComplaints.map((complaint) => (
                  <ComplaintPreviewCard
                    key={complaint.id}
                    complaint={complaint}
                    onResolve={handleResolve}
                    resolving={resolving}
                  />
                ))
              )}

              <Link
                to="/app/complaints"
                className="w-full rounded-[24px] border border-dashed border-outline-variant py-3 text-center mf-text-meta font-semibold uppercase tracking-wide text-on-surface-variant transition-colors hover:bg-surface-container-low"
              >
                View all complaints
              </Link>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
