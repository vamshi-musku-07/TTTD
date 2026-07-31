import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api, ApiError, isSessionExpiredError } from '../../lib/api';
import EditorProgressPanel from '../../components/mediaflow/EditorProgressPanel';

function getActiveRole(user) {
  if (user?.role === 'super_admin') return 'super_admin';
  if (user?.role === 'admin') return 'admin';
  return 'admin';
}

export default function AdminDashboardPage() {
  const { accessToken, user } = useAuth();
  const activeRole = getActiveRole(user);

  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadDashboard = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await api.getAdminDashboard(accessToken, activeRole);
      setMetrics(data.metrics);
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
        sub: 'Events not yet marked as editing done',
        subClass: 'text-on-surface-variant',
        icon: 'sensors',
        iconClass: 'text-amber-700 bg-amber-500/10',
      },
      {
        label: 'Total videos uploaded',
        value: String(metrics.totalVideosUploaded ?? 0),
        sub: 'Videos uploaded by editors',
        subClass: 'text-on-surface-variant',
        icon: 'video_library',
        iconClass: 'text-primary bg-primary/10',
      },
    ];
  }, [metrics]);

  return (
    <div className="mx-auto w-full min-w-0 max-w-7xl overflow-x-hidden">
      <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div className="min-w-0">
          <h2 className="mf-text-section">Dashboard</h2>
          <p className="mf-text-body mt-1">Overview and editor progress in one place.</p>
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
          <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3 sm:gap-5">
            {metricCards.map((m) => (
              <div key={m.label} className="mf-stat-card flex min-w-0 flex-col">
                <div className="mb-4 flex items-start justify-between">
                  <span className="mf-text-label-caps">{m.label}</span>
                  <span className={`material-symbols-outlined rounded-lg p-1.5 text-[20px] ${m.iconClass}`}>
                    {m.icon}
                  </span>
                </div>
                <p className="text-[32px] font-bold leading-none tracking-tight text-on-surface">{m.value}</p>
                <p className={`mf-text-meta mt-2 ${m.subClass}`}>{m.sub}</p>
              </div>
            ))}
          </div>

          <EditorProgressPanel embedded />
        </>
      )}
    </div>
  );
}
