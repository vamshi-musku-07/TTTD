import { useNavigate } from 'react-router-dom';
import { EVENTS } from '../../lib/eventsData';

const STATS = [
  { label: 'Total events', value: '24', accent: false },
  { label: 'Live now', value: '02', accent: true },
  { label: 'Upcoming (7d)', value: '12', accent: false },
  { label: 'Completed', value: '158', accent: false },
];

const BADGE = {
  neutral: 'bg-surface-container text-on-surface',
  muted: 'bg-surface-container-high text-on-surface-variant',
  live: 'bg-error/10 text-error border border-error/20',
};

function StatusBadge({ status }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full mf-text-meta font-semibold uppercase tracking-wide ${BADGE[status.variant]}`}
    >
      {status.pulse && <span className="w-1.5 h-1.5 rounded-full bg-error animate-ping" />}
      {status.label}
    </span>
  );
}

export default function EventsPage() {
  const navigate = useNavigate();

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-6 gap-4">
        <div>
          <h2 className="mf-text-section">Event Management</h2>
          <p className="mf-text-body mt-1">
            Review and manage upcoming production events and live broadcast schedules.
          </p>
        </div>
        <button type="button" className="mf-btn-primary">
          <span className="material-symbols-outlined text-[20px]">add</span>
          Add New Event
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-6">
        {STATS.map((stat) => (
          <div key={stat.label} className="mf-stat-card">
            <p className="mf-text-label-caps mb-2">{stat.label}</p>
            <p
              className={`text-[32px] font-bold tracking-tight leading-none ${
                stat.accent ? 'text-error' : 'text-on-surface'
              }`}
            >
              {stat.value}
            </p>
          </div>
        ))}
      </div>

      <div className="mf-card overflow-hidden">
        <div className="px-6 py-4 flex items-center justify-between gap-4 border-b border-outline-variant">
          <div className="mf-search flex-1 max-w-md">
            <span className="material-symbols-outlined mf-search__icon">search</span>
            <input type="text" placeholder="Search events..." />
          </div>
          <button type="button" className="mf-icon-btn shrink-0">
            <span className="material-symbols-outlined">filter_list</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-outline-variant">
                {['Event title', 'Schedule date', 'Location', 'Status', ''].map((col, i) => (
                  <th
                    key={col || 'actions'}
                    className={`px-6 py-4 mf-text-label-caps ${i === 3 ? 'text-center' : i === 4 ? 'text-right' : ''}`}
                  >
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {EVENTS.map((event) => (
                <tr
                  key={event.id}
                  onClick={() => navigate(`/app/events/${event.id}`)}
                  onKeyDown={(e) => e.key === 'Enter' && navigate(`/app/events/${event.id}`)}
                  tabIndex={0}
                  role="link"
                  className="border-b border-outline-variant last:border-0 hover:bg-surface-container-low transition-colors cursor-pointer group"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl overflow-hidden relative shrink-0 bg-surface-container">
                        <img className="w-full h-full object-cover" alt="" src={event.image} />
                        {event.live && <div className="absolute inset-0 bg-error/20 animate-pulse" />}
                      </div>
                      <div>
                        <p className="mf-text-card-title">{event.title}</p>
                        <p className="mf-text-meta mt-0.5">{event.subtitle}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className={`text-sm ${event.live ? 'font-bold text-error' : 'text-on-surface'}`}>
                      {event.date}
                    </p>
                    <p className="mf-text-meta mt-0.5">{event.time}</p>
                  </td>
                  <td className="px-6 py-4 text-sm text-on-surface">{event.location}</td>
                  <td className="px-6 py-4">
                    <div className="flex justify-center">
                      <StatusBadge status={event.status} />
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className="material-symbols-outlined text-on-surface-variant group-hover:text-on-surface transition-colors">
                      chevron_right
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="px-6 py-4 border-t border-outline-variant flex items-center justify-between">
          <p className="mf-text-meta">Showing {EVENTS.length} of 24 events</p>
          <div className="flex items-center gap-2">
            <button type="button" className="mf-icon-btn opacity-40" disabled>
              <span className="material-symbols-outlined">chevron_left</span>
            </button>
            <button type="button" className="mf-icon-btn">
              <span className="material-symbols-outlined">chevron_right</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
