import { useState } from 'react';
import {
  ACTIVITY_STATS,
  ASSIGNED_EVENTS,
} from '../../lib/cameramanEventsData';

const fieldClass =
  'w-full rounded-xl border border-outline-variant bg-surface-bright px-4 py-2.5 text-sm text-on-surface outline-none transition-colors focus:border-primary';

function EventStatusBadge({ label, className }) {
  return (
    <span className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-bold uppercase tracking-tight ${className}`}>
      {label}
    </span>
  );
}

export default function CameramanEventsPage() {
  const [events, setEvents] = useState(ASSIGNED_EVENTS);
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [notes, setNotes] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [submitState, setSubmitState] = useState('idle');

  const pendingCount = events.filter((e) => e.status !== 'Completed').length;

  const handleMarkShot = (eventId) => {
    setEvents((prev) =>
      prev.map((event) =>
        event.id === eventId
          ? { ...event, status: 'Completed', statusClass: 'bg-green-100 text-green-800' }
          : event
      )
    );
  };

  const handleBookingSubmit = (e) => {
    e.preventDefault();

    const errors = {};
    if (!title.trim()) errors.title = true;
    if (!date) errors.date = true;
    if (!time) errors.time = true;

    setFieldErrors(errors);
    if (Object.keys(errors).length > 0 || submitState !== 'idle') return;

    setSubmitState('submitting');

    setTimeout(() => {
      setSubmitState('success');
      setTimeout(() => {
        setSubmitState('idle');
        setTitle('');
        setDate('');
        setTime('');
        setNotes('');
        setFieldErrors({});
      }, 2000);
    }, 1000);
  };

  const bookingLabel =
    submitState === 'submitting'
      ? 'Adding...'
      : submitState === 'success'
        ? 'Success!'
        : 'Add Private Booking';

  return (
    <div className="mx-auto max-w-9xl space-y-gutter">
      <div>
        <h1 className="mf-text-display text-[32px] leading-tight">Cameraman Portal</h1>
        <p className="mf-text-body mt-2 text-[16px]">
          Manage your assigned shoots and schedule private bookings.
        </p>
      </div>

      <div className="grid grid-cols-12 gap-gutter">
        <section className="mf-card col-span-12 flex flex-col overflow-hidden lg:col-span-8">
          <div className="flex items-center justify-between border-b border-outline-variant px-6 py-4">
            <h3 className="mf-text-card-title flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">assignment</span>
              My Assigned Events
            </h3>
            <span className="rounded-full bg-surface-container-high px-3 py-1 mf-text-label-caps">
              {pendingCount} Pending
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="bg-surface-container-low">
                  {['Event Details', 'Time & Venue', 'Status', 'Actions'].map((col, i) => (
                    <th
                      key={col}
                      className={`px-6 py-4 mf-text-label-caps text-[11px] ${i === 3 ? 'text-right' : ''}`}
                    >
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant">
                {events.map((event) => (
                  <tr key={event.id} className="transition-colors hover:bg-surface-container-low/50">
                    <td className="px-6 py-5">
                      <div className="font-semibold text-on-surface">{event.title}</div>
                      <div className="mt-0.5 text-xs text-on-surface-variant">Production #{event.id}</div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="text-sm text-on-surface">{event.datetime}</div>
                      <div className="mt-0.5 text-xs text-on-surface-variant">{event.venue}</div>
                    </td>
                    <td className="px-6 py-5">
                      <EventStatusBadge label={event.status} className={event.statusClass} />
                    </td>
                    <td className="px-6 py-5 text-right">
                      <button
                        type="button"
                        onClick={() => handleMarkShot(event.id)}
                        disabled={event.status === 'Completed'}
                        className="mf-btn-primary !h-9 !px-4 !text-xs active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        Mark Shot
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="col-span-12 lg:col-span-4">
          <div className="mf-card p-6">
            <div className="mb-6 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">bookmark</span>
              <h3 className="mf-text-card-title">Personal Events</h3>
            </div>
            <p className="mf-text-body mb-6">
              Log private bookings to manage your availability within the MediaFlow ecosystem.
            </p>

            <form className="space-y-4" onSubmit={handleBookingSubmit} noValidate>
              <div>
                <label htmlFor="booking-title" className="mb-1 block mf-text-label-caps">
                  Title
                </label>
                <input
                  id="booking-title"
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Private Wedding Shoot"
                  className={`${fieldClass} ${fieldErrors.title ? 'border-error' : ''}`}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="booking-date" className="mb-1 block mf-text-label-caps">
                    Date
                  </label>
                  <input
                    id="booking-date"
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className={`${fieldClass} ${fieldErrors.date ? 'border-error' : ''}`}
                  />
                </div>
                <div>
                  <label htmlFor="booking-time" className="mb-1 block mf-text-label-caps">
                    Time
                  </label>
                  <input
                    id="booking-time"
                    type="time"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className={`${fieldClass} ${fieldErrors.time ? 'border-error' : ''}`}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="booking-notes" className="mb-1 block mf-text-label-caps">
                  Notes
                </label>
                <textarea
                  id="booking-notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Additional details..."
                  rows={3}
                  className={`${fieldClass} resize-none`}
                />
              </div>

              <button
                type="submit"
                disabled={submitState === 'submitting'}
                className={`mf-btn-secondary w-full justify-center font-bold uppercase tracking-wide ${
                  submitState === 'success' ? '!border-green-600 !bg-green-600 !text-white' : ''
                } ${submitState === 'submitting' ? 'opacity-50' : ''}`}
              >
                {submitState === 'submitting' && (
                  <span className="material-symbols-outlined animate-spin text-[16px]">refresh</span>
                )}
                {bookingLabel}
              </button>
            </form>
          </div>
        </section>

        <section className="mf-card col-span-12 p-6">
          <div className="mb-6 flex items-center justify-between gap-4">
            <h3 className="mf-text-card-title">Recent Activity</h3>
            <button type="button" className="flex items-center gap-1 mf-text-label-caps text-primary hover:underline">
              View All History
              <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
            </button>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {ACTIVITY_STATS.map((stat) => (
              <div
                key={stat.label}
                className="flex items-center gap-4 rounded-xl border border-outline-variant bg-surface p-4"
              >
                <div
                  className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full ${stat.iconClass}`}
                >
                  <span className="material-symbols-outlined">{stat.icon}</span>
                </div>
                <div>
                  <p className="mf-text-label-caps">{stat.label}</p>
                  <p className="text-[24px] font-semibold leading-tight tracking-tight text-on-surface">
                    {stat.value}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
