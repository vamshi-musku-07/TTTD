import { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import { getCameramanStatusMeta } from '../../lib/eventsData';

const fieldClass =
  'w-full rounded-xl border border-outline-variant bg-surface-bright px-4 py-2.5 text-sm text-on-surface outline-none transition-colors focus:border-primary';

export default function CameramanEventsPage() {
  const [assignedEvents, setAssignedEvents] = useState([]);
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [notes, setNotes] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [submitState, setSubmitState] = useState('idle');

  useEffect(() => {
    api.getEvents().then((data) => {
      setAssignedEvents(data.events.filter((e) => e.cameraman && e.cameraman !== 'Unassigned'));
    }).catch(() => setAssignedEvents([]));
  }, []);

  const pendingCount = assignedEvents.filter(
    (e) =>
      e.cameramanStatus !== 'footage-covered' &&
      e.cameramanStatus !== 'delivered' &&
      e.cameramanStatus !== 'cancelled'
  ).length;

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
    <div className="mx-auto max-w-7xl space-y-gutter">
      <div>
        <h1 className="mf-text-display text-[32px] leading-tight">Dashboard</h1>
        <p className="mf-text-body mt-2 text-[16px]">
          Manage your assigned shoots and schedule private bookings.
        </p>
      </div>

      <div className="grid grid-cols-12 gap-gutter">
        <section className="mf-card col-span-12 flex flex-col overflow-hidden lg:col-span-8">
          <div className="flex items-center justify-between border-b border-outline-variant px-6 py-4">
            <h3 className="mf-text-card-title flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">assignment</span>
              Upcoming Assignments
            </h3>
            <span className="rounded-full bg-surface-container-high px-3 py-1 mf-text-label-caps">
              {pendingCount} Active
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="bg-surface-container-low">
                  {['Event Details', 'Time & Location', 'Status'].map((col) => (
                    <th key={col} className="px-6 py-4 mf-text-label-caps text-[11px]">
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant">
                {assignedEvents.map((event) => {
                  const statusMeta = getCameramanStatusMeta(event.cameramanStatus);
                  return (
                    <tr key={event.id} className="transition-colors hover:bg-surface-container-low/50">
                      <td className="px-6 py-5">
                        <div className="font-semibold text-on-surface">{event.title}</div>
                        <div className="mt-0.5 text-xs text-on-surface-variant">{event.subtitle}</div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="text-sm text-on-surface">{event.date}</div>
                        <div className="mt-0.5 text-xs text-on-surface-variant">{event.location}</div>
                      </td>
                      <td className="px-6 py-5">
                        <span
                          className={`inline-flex rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wide ${statusMeta.className}`}
                        >
                          {statusMeta.label}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="border-t border-outline-variant px-6 py-3">
            <p className="mf-text-meta">
              Update event status from the{' '}
              <span className="font-semibold text-on-surface">Events</span> page.
            </p>
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
      </div>
    </div>
  );
}
