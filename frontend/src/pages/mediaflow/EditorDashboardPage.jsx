import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useRole } from '../../context/RoleContext';
import { api, ApiError, isSessionExpiredError } from '../../lib/api';
import UploadFrequencyChart from '../../components/mediaflow/UploadFrequencyChart';
import { NameAvatar } from '../../components/NameAvatar';

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

function EditorPersonFilter({ editors, selectedEditorId, onChange, disabled }) {
  const selected = editors.find((e) => e.id === selectedEditorId);

  return (
    <div className="flex flex-col gap-2 sm:items-end">
      <label htmlFor="editor-person-filter" className="mf-text-label-caps">
        View by editor
      </label>
      <div className="flex items-center gap-3">
        {selectedEditorId !== 'all' && selected && (
          <NameAvatar
            name={selected.name}
            avatar={selected.avatar}
            className="hidden sm:flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary"
            title={selected.name}
          />
        )}
        <select
          id="editor-person-filter"
          value={selectedEditorId}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          className="min-w-[220px] rounded-xl border border-outline-variant bg-surface-bright px-4 py-2.5 text-sm font-medium text-on-surface outline-none transition-colors focus:border-primary disabled:opacity-50"
        >
          <option value="all">All editors</option>
          {editors.map((editor) => (
            <option key={editor.id} value={editor.id}>
              {editor.name}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}

export default function EditorDashboardPage() {
  const { accessToken } = useAuth();
  const { isAdmin } = useRole();

  const [metrics, setMetrics] = useState(null);
  const [uploadChart, setUploadChart] = useState([]);
  const [editors, setEditors] = useState([]);
  const [selectedEditorId, setSelectedEditorId] = useState('all');
  const [selectedEditor, setSelectedEditor] = useState(null);
  const [viewMode, setViewMode] = useState('self');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError('');
      try {
        const data = await api.getEditorDashboard(
          accessToken,
          isAdmin ? { editorId: selectedEditorId } : {}
        );
        setMetrics(data.metrics);
        setUploadChart(data.uploadChart);
        setEditors(data.editors || []);
        setViewMode(data.viewMode || 'self');
        setSelectedEditor(data.selectedEditor || null);
        if (isAdmin && data.selectedEditorId) {
          setSelectedEditorId(data.selectedEditorId);
        }
      } catch (err) {
        if (isSessionExpiredError(err)) return;
        setError(err instanceof ApiError ? err.message : 'Failed to load dashboard');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [accessToken, isAdmin, selectedEditorId]);

  const personLabel = useMemo(() => {
    if (!isAdmin || viewMode === 'self') return 'you';
    if (viewMode === 'all') return 'all editors';
    return selectedEditor?.name || 'this editor';
  }, [isAdmin, viewMode, selectedEditor]);

  const metricCards = useMemo(() => {
    if (!metrics) return [];
    return [
      {
        label: 'Total Videos Uploaded',
        value: String(metrics.totalVideosUploaded),
        icon: 'movie',
        iconClass: 'text-primary',
        footerText:
          viewMode === 'all'
            ? 'Videos uploaded by all editors'
            : `Videos ${personLabel === 'you' ? 'you' : personLabel} uploaded across all events`,
      },
      {
        label: 'Events Covered',
        value: String(metrics.eventsCovered),
        icon: 'event',
        iconClass: 'text-secondary',
        footerText:
          viewMode === 'all'
            ? 'Events with at least one editor upload'
            : `Events where ${personLabel === 'you' ? 'you' : personLabel} uploaded at least one video`,
      },
      {
        label: 'Uploads Today',
        value: String(metrics.uploadsToday),
        icon: 'upload',
        iconClass: 'text-amber-700',
        footerText:
          viewMode === 'all' ? 'Videos uploaded today by all editors' : 'Videos uploaded today',
      },
    ];
  }, [metrics, viewMode, personLabel]);

  const subtitle = isAdmin
    ? viewMode === 'all'
      ? 'Progress across all editors. Select a person to focus on one editor.'
      : `Progress for ${selectedEditor?.name || 'selected editor'}.`
    : 'Your upload stats and activity.';

  return (
    <div className="mx-auto max-w-7xl">
      <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <h1 className="mf-text-display text-[32px] leading-tight">
            {isAdmin ? 'Editor Progress' : 'Editor Analytics'}
          </h1>
          <p className="mf-text-body mt-2 text-[16px]">{subtitle}</p>
        </div>
        {isAdmin && editors.length > 0 && (
          <EditorPersonFilter
            editors={editors}
            selectedEditorId={selectedEditorId}
            onChange={setSelectedEditorId}
            disabled={loading}
          />
        )}
      </div>

      {loading && !metrics ? (
        <div className="mf-text-body py-12 text-center">Loading dashboard...</div>
      ) : error ? (
        <div className="mf-card p-8 text-center">
          <p className="text-error mb-4">{error}</p>
        </div>
      ) : (
        <div className={`mb-gutter grid grid-cols-12 gap-gutter ${loading ? 'opacity-60' : ''}`}>
          {isAdmin && editors.length === 0 && (
            <div className="col-span-12 mf-card p-6 text-center mf-text-body">
              No editors on the team yet. Add editors from Team to track their progress here.
            </div>
          )}

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
