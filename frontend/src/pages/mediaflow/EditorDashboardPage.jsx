import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api, ApiError, isSessionExpiredError } from '../../lib/api';
import UploadFrequencyChart from '../../components/mediaflow/UploadFrequencyChart';

function MetricCard({ label, value, icon, iconClass, footerText }) {
  return (
    <div className="mf-card flex flex-col justify-between p-6 transition-colors hover:bg-surface-container-low">
      <div>
        <div className="mb-4 flex items-start justify-between">
          <span className="mf-text-label-caps">{label}</span>
          <span className={`material-symbols-outlined ${iconClass}`}>{icon}</span>
        </div>
        <p className="text-[32px] font-semibold leading-none tracking-tight text-on-surface">{value}</p>
      </div>
      {footerText && (
        <p className="mt-4 text-sm text-on-surface-variant">{footerText}</p>
      )}
    </div>
  );
}

export default function EditorDashboardPage() {
  const { accessToken } = useAuth();
  const [metrics, setMetrics] = useState(null);
  const [uploadChart, setUploadChart] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError('');
      try {
        const data = await api.getEditorDashboard(accessToken);
        setMetrics(data.metrics);
        setUploadChart(data.uploadChart);
      } catch (err) {
        if (isSessionExpiredError(err)) return;
        setError(err instanceof ApiError ? err.message : 'Failed to load dashboard');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [accessToken]);

  const metricCards = useMemo(() => {
    if (!metrics) return [];
    return [
      {
        label: 'Total Videos Uploaded',
        value: String(metrics.totalVideosUploaded),
        icon: 'movie',
        iconClass: 'text-primary',
        footerText: 'Videos you uploaded across all events',
      },
      {
        label: 'Events Covered',
        value: String(metrics.eventsCovered),
        icon: 'event',
        iconClass: 'text-secondary',
        footerText: 'Events where you uploaded at least one video',
      },
      {
        label: 'Uploads Today',
        value: String(metrics.uploadsToday),
        icon: 'upload',
        iconClass: 'text-amber-700',
        footerText: 'Videos uploaded today',
      },
    ];
  }, [metrics]);

  return (
    <div className="mx-auto max-w-7xl">
      <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <h1 className="mf-text-display text-[32px] leading-tight">Editor Analytics</h1>
          <p className="mf-text-body mt-2 text-[16px]">
            Your upload stats and team-wide upload activity.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="mf-text-body py-12 text-center">Loading dashboard...</div>
      ) : error ? (
        <div className="mf-card p-8 text-center">
          <p className="text-error mb-4">{error}</p>
        </div>
      ) : (
        <div className="mb-gutter grid grid-cols-12 gap-gutter">
          {metricCards.map((metric) => (
            <div key={metric.label} className="col-span-12 md:col-span-4">
              <MetricCard {...metric} />
            </div>
          ))}

          <div className="col-span-12">
            <UploadFrequencyChart chartData={uploadChart} />
          </div>
        </div>
      )}
    </div>
  );
}
