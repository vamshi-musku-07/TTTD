import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useRole } from '../../context/RoleContext';
import { api, ApiError, isSessionExpiredError } from '../../lib/api';
import UploadFrequencyChart from '../../components/mediaflow/UploadFrequencyChart';
import { NameAvatar } from '../../components/NameAvatar';

const DATE_RANGES = [
  { value: 'day', label: 'Day' },
  { value: 'week', label: 'Week' },
  { value: 'month', label: 'Month' },
  { value: 'custom', label: 'Custom' },
  { value: 'lifetime', label: 'Lifetime' },
];

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
    <div className="flex w-full flex-col gap-2 sm:w-auto sm:items-end">
      <label htmlFor="editor-person-filter" className="mf-text-label-caps">
        View by editor
      </label>
      <div className="flex w-full items-center gap-3 sm:w-auto">
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
          className="w-full min-w-0 rounded-xl border border-outline-variant bg-surface-bright px-4 py-2.5 text-sm font-medium text-on-surface outline-none transition-colors focus:border-primary disabled:opacity-50 sm:min-w-[220px]"
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

function DateRangeFilter({
  range,
  onRangeChange,
  customFrom,
  customTo,
  onCustomFromChange,
  onCustomToChange,
  onApplyCustom,
  rangeLabel,
  disabled,
}) {
  return (
    <div className="mf-card min-w-0 overflow-hidden p-4 sm:p-5">
      <div className="flex flex-col gap-3">
        <div className="min-w-0">
          <p className="mf-text-label-caps">Sort by period</p>
          <p className="mf-text-meta mt-1 break-words">
            Showing: <span className="font-semibold text-on-surface">{rangeLabel || 'Lifetime'}</span>
          </p>
        </div>

        <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 [scrollbar-width:thin]">
          {DATE_RANGES.map((option) => (
            <button
              key={option.value}
              type="button"
              disabled={disabled}
              onClick={() => onRangeChange(option.value)}
              className={`shrink-0 rounded-xl px-3.5 py-2 text-sm font-semibold transition-colors ${
                range === option.value
                  ? 'bg-on-surface text-surface-container-lowest'
                  : 'bg-surface-container text-on-surface-variant hover:text-on-surface'
              } disabled:opacity-50`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {range === 'custom' && (
        <div className="mt-4 grid grid-cols-1 gap-3 border-t border-outline-variant pt-4 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
          <div className="min-w-0">
            <label htmlFor="editor-range-from" className="mb-1.5 block mf-text-label-caps">
              From
            </label>
            <input
              id="editor-range-from"
              type="date"
              value={customFrom}
              onChange={(e) => onCustomFromChange(e.target.value)}
              disabled={disabled}
              className="w-full rounded-xl border border-outline-variant bg-surface-bright px-4 py-2.5 text-sm text-on-surface outline-none focus:border-primary disabled:opacity-50"
            />
          </div>
          <div className="min-w-0">
            <label htmlFor="editor-range-to" className="mb-1.5 block mf-text-label-caps">
              To
            </label>
            <input
              id="editor-range-to"
              type="date"
              value={customTo}
              onChange={(e) => onCustomToChange(e.target.value)}
              disabled={disabled}
              className="w-full rounded-xl border border-outline-variant bg-surface-bright px-4 py-2.5 text-sm text-on-surface outline-none focus:border-primary disabled:opacity-50"
            />
          </div>
          <button
            type="button"
            className="mf-btn-primary w-full sm:w-auto"
            disabled={disabled || !customFrom || !customTo}
            onClick={onApplyCustom}
          >
            Apply
          </button>
        </div>
      )}
    </div>
  );
}

function toLocalIsoDate(date = new Date()) {
  const d = new Date(date);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function defaultCustomFrom() {
  const d = new Date();
  d.setDate(d.getDate() - 6);
  return toLocalIsoDate(d);
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
  const [dateRange, setDateRange] = useState({ range: 'lifetime', label: 'Lifetime' });
  const [range, setRange] = useState('lifetime');
  const [customFrom, setCustomFrom] = useState(defaultCustomFrom);
  const [customTo, setCustomTo] = useState(() => toLocalIsoDate());
  const [appliedCustom, setAppliedCustom] = useState({ from: '', to: '' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError('');
      try {
        const params = isAdmin
          ? {
              editorId: selectedEditorId,
              range,
              ...(range === 'custom'
                ? {
                    from: appliedCustom.from || customFrom,
                    to: appliedCustom.to || customTo,
                  }
                : {}),
            }
          : {};

        const data = await api.getEditorDashboard(accessToken, params);
        setMetrics(data.metrics);
        setUploadChart(data.uploadChart);
        setEditors(data.editors || []);
        setViewMode(data.viewMode || 'self');
        setSelectedEditor(data.selectedEditor || null);
        if (data.dateRange) setDateRange(data.dateRange);
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
  }, [accessToken, isAdmin, selectedEditorId, range, appliedCustom.from, appliedCustom.to]);

  const personLabel = useMemo(() => {
    if (!isAdmin || viewMode === 'self') return 'you';
    if (viewMode === 'all') return 'all editors';
    return selectedEditor?.name || 'this editor';
  }, [isAdmin, viewMode, selectedEditor]);

  const periodPhrase = dateRange?.label || 'Lifetime';

  const metricCards = useMemo(() => {
    if (!metrics) return [];
    const third =
      range === 'day'
        ? {
            label: 'Uploads Today',
            value: String(metrics.uploadsToday ?? metrics.totalVideosUploaded),
            icon: 'upload',
            iconClass: 'text-amber-700',
            footerText: 'Videos uploaded today',
          }
        : {
            label: 'Active days',
            value: String(metrics.activeDays ?? 0),
            icon: 'calendar_month',
            iconClass: 'text-amber-700',
            footerText: `Days with uploads in ${periodPhrase.toLowerCase()}`,
          };

    return [
      {
        label: 'Total Videos Uploaded',
        value: String(metrics.totalVideosUploaded),
        icon: 'movie',
        iconClass: 'text-primary',
        footerText:
          viewMode === 'all'
            ? `Videos uploaded by all editors · ${periodPhrase}`
            : `Videos ${personLabel === 'you' ? 'you' : personLabel} uploaded · ${periodPhrase}`,
      },
      {
        label: 'Events Covered',
        value: String(metrics.eventsCovered),
        icon: 'event',
        iconClass: 'text-secondary',
        footerText:
          viewMode === 'all'
            ? `Events with uploads · ${periodPhrase}`
            : `Events with uploads by ${personLabel === 'you' ? 'you' : personLabel} · ${periodPhrase}`,
      },
      third,
    ];
  }, [metrics, viewMode, personLabel, range, periodPhrase]);

  const subtitle = isAdmin
    ? viewMode === 'all'
      ? 'Filter by editor and period to review progress.'
      : `Progress for ${selectedEditor?.name || 'selected editor'} · ${periodPhrase}.`
    : 'Your upload stats and activity.';

  const chartSubtitle = useMemo(() => {
    if (!isAdmin) return 'Your uploads over the last 7 days';
    const who =
      viewMode === 'all'
        ? 'All editors'
        : selectedEditor?.name || 'Selected editor';
    return `${who} · ${periodPhrase}`;
  }, [isAdmin, viewMode, selectedEditor, periodPhrase]);

  const handleRangeChange = (nextRange) => {
    setRange(nextRange);
    if (nextRange === 'custom' && (!appliedCustom.from || !appliedCustom.to)) {
      setAppliedCustom({ from: customFrom, to: customTo });
    }
  };

  const handleApplyCustom = () => {
    if (!customFrom || !customTo) return;
    setAppliedCustom({ from: customFrom, to: customTo });
    setRange('custom');
  };

  return (
    <div className="mx-auto w-full min-w-0 max-w-7xl overflow-x-hidden">
      <div className="mb-5 flex flex-col gap-4 sm:mb-6 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <h1 className="mf-text-display text-[28px] leading-tight sm:text-[32px]">
            {isAdmin ? 'Editor Progress' : 'Editor Analytics'}
          </h1>
          <p className="mf-text-body mt-2 text-sm sm:text-[16px]">{subtitle}</p>
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

      {isAdmin && (
        <div className="mb-5 min-w-0 sm:mb-6">
          <DateRangeFilter
            range={range}
            onRangeChange={handleRangeChange}
            customFrom={customFrom}
            customTo={customTo}
            onCustomFromChange={setCustomFrom}
            onCustomToChange={setCustomTo}
            onApplyCustom={handleApplyCustom}
            rangeLabel={dateRange?.label}
            disabled={loading}
          />
        </div>
      )}

      {loading && !metrics ? (
        <div className="mf-text-body py-12 text-center">Loading dashboard...</div>
      ) : error ? (
        <div className="mf-card p-8 text-center">
          <p className="text-error mb-4">{error}</p>
        </div>
      ) : (
        <div className={`grid min-w-0 grid-cols-1 gap-4 sm:gap-5 ${loading ? 'opacity-60' : ''}`}>
          {isAdmin && editors.length === 0 && (
            <div className="mf-card p-6 text-center mf-text-body">
              No editors on the team yet. Add editors from Team to track their progress here.
            </div>
          )}

          <div className="grid min-w-0 grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {metricCards.map((metric) => (
              <div key={metric.label} className="min-w-0">
                <MetricCard {...metric} />
              </div>
            ))}
          </div>

          <div className="min-w-0">
            <UploadFrequencyChart chartData={uploadChart} subtitle={chartSubtitle} />
          </div>
        </div>
      )}
    </div>
  );
}
