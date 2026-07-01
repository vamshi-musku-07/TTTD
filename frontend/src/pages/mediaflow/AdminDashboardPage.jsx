const METRICS = [
  {
    label: 'Total events',
    value: '124',
    sub: '↑ 12% vs last month',
    subClass: 'text-green-600',
    icon: 'event_note',
    iconClass: 'text-on-surface bg-surface-container',
  },
  {
    label: 'Active events',
    value: '12',
    sub: 'Live studio sessions',
    subClass: 'text-on-surface-variant',
    icon: 'sensors',
    iconClass: 'text-on-surface-variant bg-surface-container-high',
  },
  {
    label: 'Footage items',
    value: '540',
    sub: '3.2 TB total storage',
    subClass: 'text-on-surface-variant',
    icon: 'video_library',
    iconClass: 'text-on-surface-variant bg-surface-container-high',
  },
  {
    label: 'Open complaints',
    value: '3',
    sub: 'High priority attention',
    subClass: 'text-error font-semibold',
    icon: 'report',
    iconClass: 'text-error bg-error/10',
    valueClass: 'text-error',
    badge: '3',
  },
];

const RECENT_EVENTS = [
  { title: 'Global Film Festival 2024', type: 'Live Broadcast', date: 'Oct 24, 2023', status: 'Scheduled', statusClass: 'bg-surface-container text-on-surface' },
  { title: 'Tech Summit Opening Keynote', type: 'Live Broadcast', date: 'Oct 22, 2023', status: 'Completed', statusClass: 'bg-green-500/10 text-green-600' },
  { title: 'Underground Music Session', type: 'Recording', date: 'Oct 21, 2023', status: 'On Air', statusClass: 'bg-amber-500/10 text-amber-600' },
  { title: 'Fashion Week Runway A', type: 'Live Broadcast', date: 'Oct 20, 2023', status: 'Completed', statusClass: 'bg-green-500/10 text-green-600' },
  { title: 'CEO Interview Series', type: 'Podcast', date: 'Oct 19, 2023', status: 'Completed', statusClass: 'bg-green-500/10 text-green-600' },
];

const COMPLAINTS = [
  {
    name: 'Jordan Smith',
    role: 'Camera Crew Lead',
    time: '2h ago',
    avatar:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuDYZizD6Ihbjvpo5-WYHzCLI-hCb_MKEdoh2WAWSoNah25hpfGtRaISo9rgChn0kckjswuNryTnJy_EFWbn-Rco663D9K6Qlmx9lzC_tjX6OfZYK1m2R8ngbCWxProcLRu2JGYVvStOdLkB3GxMYD2oR7Gu03gLY42FoFd3IJNKBuYZFcjY3LE4CfVTbfdssO4AuR1hnXSugD-VXRILAPQxWlk0rzxcH0vWFyhmnj-A5osfcmVQkJ4vMQxG4zJgfoHgnG65rnSZTQ',
    body: 'The video uplink for Studio B is experiencing intermittent frame drops during live sessions. Needs immediate technical inspection before the 6PM broadcast.',
  },
  {
    name: 'Sarah Connor',
    role: 'Project Manager',
    time: '5h ago',
    avatar:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCP_PmU5EYGynuj_j3ta3fKkV1xSeUF59gW_ZJyeg2cfrZKohcLjDcl-fvf46dSpDjr6tA7ztDW001Wp1hNX2RJOGnuCBH5F_ob7AIGZgzztsAiSTkMMJMtz-NaqMTmnWqFCRxw2OhRvhKuTqKp6RqldVSzgDjYCEQbXYmXsYKVuFatD13ciAKwckX2aiPDt3PpBAXsqzFR0rvkIfPUKE2tqJ1dJye0NTVeLxqK0AOz3hQuqbl74lnYJiS5qY9uhEk5u5R815DJhg',
    body: "Access permissions for the 'Team Alpha' footage folder seem to be broken. Multiple editors cannot retrieve archived clips from yesterday's shoot.",
  },
];

function StatusPill({ label, className }) {
  return (
    <span className={`inline-block px-2.5 py-1 rounded-full mf-text-meta font-bold uppercase tracking-wide ${className}`}>
      {label}
    </span>
  );
}

function ComplaintCard({ complaint }) {
  return (
    <div className="mf-card p-5 flex flex-col gap-4 relative overflow-hidden">
      <div className="absolute left-0 top-0 bottom-0 w-1 bg-error rounded-l-[24px]" />
      <div className="flex justify-between items-start gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <img src={complaint.avatar} alt="" className="w-10 h-10 rounded-full object-cover bg-surface-container shrink-0" />
          <div className="min-w-0">
            <h4 className="mf-text-card-title text-sm">{complaint.name}</h4>
            <p className="mf-text-meta">{complaint.role}</p>
          </div>
        </div>
        <span className="mf-text-meta shrink-0">{complaint.time}</span>
      </div>
      <p className="mf-text-body leading-relaxed">{complaint.body}</p>
      <div className="flex gap-2">
        <button type="button" className="mf-btn-primary flex-1 !h-9 !text-xs !rounded-xl">
          Resolve
        </button>
        <button type="button" className="mf-icon-btn !w-9 !h-9 border border-outline-variant">
          <span className="material-symbols-outlined text-[18px]">more_horiz</span>
        </button>
      </div>
    </div>
  );
}

export default function AdminDashboardPage() {
  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
        <div>
          <h2 className="mf-text-section">Administrative Overview</h2>
          <p className="mf-text-body mt-1">Real-time media operations and studio management.</p>
        </div>
        <button type="button" className="mf-btn-primary shrink-0">
          <span className="material-symbols-outlined text-[20px]">add</span>
          New Project
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 mb-6">
        {METRICS.map((m) => (
          <div key={m.label} className="mf-stat-card flex flex-col">
            <div className="flex justify-between items-start mb-4">
              <span className="mf-text-label-caps">{m.label}</span>
              <div className="flex items-center gap-2">
                {m.badge && (
                  <span className="bg-error text-white text-[10px] px-1.5 py-0.5 rounded-full font-bold">
                    {m.badge}
                  </span>
                )}
                <span className={`material-symbols-outlined p-1.5 rounded-lg text-[20px] ${m.iconClass}`}>
                  {m.icon}
                </span>
              </div>
            </div>
            <p className={`text-[32px] font-bold tracking-tight leading-none ${m.valueClass || 'text-on-surface'}`}>
              {m.value}
            </p>
            <p className={`mf-text-meta mt-2 ${m.subClass}`}>{m.sub}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        <div className="lg:col-span-8 mf-card overflow-hidden flex flex-col">
          <div className="px-6 py-4 border-b border-outline-variant flex justify-between items-center">
            <h3 className="mf-text-card-title text-base">Recent Events</h3>
            <button type="button" className="mf-text-label-caps text-on-surface hover:underline transition-all">
              View all
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-outline-variant bg-surface-container-low">
                  {['Title', 'Type', 'Date', 'Status'].map((h) => (
                    <th key={h} className="px-6 py-3.5 mf-text-label-caps">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {RECENT_EVENTS.map((row) => (
                  <tr
                    key={row.title}
                    className="border-b border-outline-variant last:border-0 hover:bg-surface-container-low transition-colors"
                  >
                    <td className="px-6 py-4 text-sm font-medium text-on-surface">{row.title}</td>
                    <td className="px-6 py-4 mf-text-body">{row.type}</td>
                    <td className="px-6 py-4 mf-text-body">{row.date}</td>
                    <td className="px-6 py-4">
                      <StatusPill label={row.status} className={row.statusClass} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="lg:col-span-4 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h3 className="mf-text-card-title text-base">Pending Complaints</h3>
            <span className="mf-text-meta bg-error/10 text-error px-2 py-0.5 rounded-full font-bold">
              High priority
            </span>
          </div>

          {COMPLAINTS.map((c) => (
            <ComplaintCard key={c.name} complaint={c} />
          ))}

          <button
            type="button"
            className="w-full py-3 border border-dashed border-outline-variant text-on-surface-variant rounded-[24px] mf-text-meta font-semibold uppercase tracking-wide hover:bg-surface-container-low transition-colors"
          >
            View all complaints
          </button>
        </div>
      </div>
    </div>
  );
}
