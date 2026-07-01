import {
  EDITOR_METRICS,
  PENDING_FOOTAGE_TASKS,
  UPLOAD_CHART,
} from '../../lib/editorDashboardData';

function MetricFooter({ metric }) {
  if (metric.footerType === 'trend') {
    return (
      <div className={`mt-4 flex items-center gap-1 ${metric.footerClass}`}>
        <span className="material-symbols-outlined text-[16px]">trending_up</span>
        {metric.footerText}
      </div>
    );
  }

  if (metric.footerType === 'history') {
    return (
      <div className={`mt-4 flex items-center gap-1 ${metric.footerClass}`}>
        <span className="material-symbols-outlined text-[16px]">history</span>
        {metric.footerText}
      </div>
    );
  }

  if (metric.footerType === 'pulse') {
    return (
      <div className={`mt-4 flex items-center gap-1 ${metric.footerClass}`}>
        <span className="h-2 w-2 animate-pulse rounded-full bg-error" />
        {metric.footerText}
      </div>
    );
  }

  return null;
}

function MetricCard({ metric }) {
  return (
    <div className="mf-card flex flex-col justify-between p-6 transition-colors hover:bg-surface-container-low">
      <div>
        <div className="mb-4 flex items-start justify-between">
          <span className="mf-text-label-caps">{metric.label}</span>
          <span className={`material-symbols-outlined ${metric.iconClass}`}>{metric.icon}</span>
        </div>
        <p className="text-[32px] font-semibold leading-none tracking-tight text-on-surface">{metric.value}</p>
      </div>

      {metric.progress !== undefined ? (
        <div className="mt-4">
          <div className="h-1 w-full overflow-hidden rounded-full bg-surface-container">
            <div className="h-full bg-primary" style={{ width: `${metric.progress}%` }} />
          </div>
          <p className="mt-2 text-xs text-on-surface-variant">{metric.progressLabel}</p>
        </div>
      ) : (
        <MetricFooter metric={metric} />
      )}
    </div>
  );
}

function UploadChart() {
  return (
    <div className="mf-card col-span-12 flex h-[400px] flex-col p-6 lg:col-span-12">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4 border-b border-outline-variant pb-4">
        <h3 className="mf-text-card-title">Upload Frequency</h3>
        <div className="flex gap-4">
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-sm bg-primary" />
            <span className="mf-text-body">4K Masters</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-sm bg-secondary-container" />
            <span className="mf-text-body">Social Clips</span>
          </div>
        </div>
      </div>

      <div className="relative flex min-h-0 flex-1 items-end justify-between gap-4 pt-6">
        <div className="pointer-events-none absolute inset-x-0 top-6 bottom-8 flex flex-col justify-between">
          {[0, 1, 2, 3].map((line) => (
            <div key={line} className="w-full border-b border-outline-variant/30" />
          ))}
        </div>

        {UPLOAD_CHART.map((item) => (
          <div key={item.day} className="relative z-10 flex flex-1 flex-col items-center gap-1">
            <div className="flex h-60 w-full flex-col justify-end">
              <div
                className="w-full rounded-t-sm bg-secondary-container transition-all hover:brightness-110"
                style={{ height: `${item.clips}%` }}
              />
              <div
                className="w-full rounded-t-sm bg-primary transition-all hover:brightness-110"
                style={{ height: `${item.masters}%` }}
              />
            </div>
            <span className="mf-text-label-caps shrink-0 text-[10px]">{item.day}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function TaskStatusBadge({ label, className }) {
  return (
    <span className={`rounded-full px-2 py-1 text-[10px] font-bold uppercase ${className}`}>{label}</span>
  );
}

export default function EditorDashboardPage() {
  return (
    <div className="mx-auto max-w-7xl">
      <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <h1 className="mf-text-display text-[32px] leading-tight">Editor Analytics</h1>
          <p className="mf-text-body mt-2 text-[16px]">
            Performance metrics and project status for the current cycle.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button type="button" className="mf-btn-secondary">
            <span className="material-symbols-outlined text-[18px]">filter_list</span>
            Last 7 Days
          </button>
          <button type="button" className="mf-btn-secondary">
            <span className="material-symbols-outlined text-[18px]">download</span>
            Export PDF
          </button>
        </div>
      </div>

      <div className="mb-gutter grid grid-cols-12 gap-gutter">
        {EDITOR_METRICS.map((metric) => (
          <div key={metric.label} className="col-span-12 md:col-span-3">
            <MetricCard metric={metric} />
          </div>
        ))}

        <UploadChart />
      </div>

      <div className="mf-card overflow-hidden">
        <div className="flex items-center justify-between border-b border-outline-variant px-6 py-4">
          <h3 className="mf-text-card-title">Pending Footage Tasks</h3>
          <div className="rounded-full bg-surface-container-high px-3 py-1 mf-text-label-caps text-[11px]">
            8 Items Pending
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-outline-variant bg-surface mf-text-label-caps">
                {['Project Name', 'Status', 'Deadline', 'Assigned To', ''].map((col, i) => (
                  <th key={col || 'action'} className={`px-6 py-4 ${i === 4 ? 'text-right' : ''}`}>
                    {col || 'Action'}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant">
              {PENDING_FOOTAGE_TASKS.map((task) => (
                <tr key={task.project} className="cursor-pointer transition-colors hover:bg-surface-container-low">
                  <td className="px-6 py-4 font-semibold text-on-surface">{task.project}</td>
                  <td className="px-6 py-4">
                    <TaskStatusBadge label={task.status} className={task.statusClass} />
                  </td>
                  <td className="px-6 py-4 text-on-surface">{task.deadline}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      {task.avatar ? (
                        <img src={task.avatar} alt="" className="h-6 w-6 rounded-full object-cover" />
                      ) : (
                        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary-container text-[10px] font-bold text-on-primary">
                          {task.initials}
                        </div>
                      )}
                      <span>{task.assignee}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button type="button" className="text-primary hover:underline">
                      Edit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
