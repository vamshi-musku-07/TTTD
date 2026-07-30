import { useState } from 'react';
import {
  CAMERAMEN,
  EVENT_TYPES,
  formatEventDate,
  INITIAL_ADMIN_EVENTS,
} from '../../lib/adminEventsData';

const fieldClass =
  'w-full rounded-xl border border-outline-variant bg-surface-bright px-4 py-3 text-sm text-on-surface outline-none transition-colors focus:border-primary';

function StatusBadge({ label, className }) {
  return (
    <span className={`inline-flex rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wide ${className}`}>
      {label}
    </span>
  );
}

function generateEventId() {
  return `evt-${Date.now()}`;
}

export default function AdminEventsPage() {
  const [events, setEvents] = useState(INITIAL_ADMIN_EVENTS);
  const [selectedId, setSelectedId] = useState(null);
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [location, setLocation] = useState('');
  const [eventType, setEventType] = useState(EVENT_TYPES[0]);
  const [cameraman, setCameraman] = useState(CAMERAMEN[0]);
  const [notes, setNotes] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [submitState, setSubmitState] = useState('idle');

  const totalEvents = 24;

  const handleSubmit = (e) => {
    e.preventDefault();

    const errors = {};
    if (!title.trim()) errors.title = true;
    if (!date) errors.date = true;

    setFieldErrors(errors);
    if (Object.keys(errors).length > 0 || submitState !== 'idle') return;

    setSubmitState('submitting');

    setTimeout(() => {
      const newEvent = {
        id: generateEventId(),
        title: title.trim(),
        type: eventType,
        date: formatEventDate(date),
        location: location.trim(),
        cameraman,
        status: 'Assigned',
        statusClass: 'bg-primary/10 text-primary border border-primary/20',
      };

      setEvents((prev) => [newEvent, ...prev]);
      setSubmitState('success');

      setTimeout(() => {
        setSubmitState('idle');
        setTitle('');
        setDate('');
        setLocation('');
        setEventType(EVENT_TYPES[0]);
        setCameraman(CAMERAMEN[0]);
        setNotes('');
        setFieldErrors({});
      }, 1500);
    }, 800);
  };

  const submitLabel =
    submitState === 'submitting' ? 'Adding...' : submitState === 'success' ? 'Event Added!' : 'Add Event';

  return (
    <div className="mx-auto max-w-9xl space-y-gutter">
      <header>
        <h1 className="mf-text-display text-[32px] leading-tight">Event Management</h1>
        <p className="mf-text-body mt-2 text-[16px]">
          Schedule and assign coverage for upcoming media events.
        </p>
      </header>

      <section className="mf-card p-6 sm:p-8">
        <div className="mb-6 flex items-center gap-2 border-b border-outline-variant pb-4">
          <span className="material-symbols-outlined text-primary">add_circle</span>
          <h2 className="mf-text-card-title">Add New Event</h2>
        </div>

        <form className="grid grid-cols-1 gap-gutter md:grid-cols-3" onSubmit={handleSubmit} noValidate>
          <div className="flex flex-col gap-2">
            <label htmlFor="event-title" className="mf-text-label-caps">
              Event Title
            </label>
            <input
              id="event-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Annual Tech Summit 2024"
              className={`${fieldClass} ${fieldErrors.title ? 'border-error' : ''}`}
            />
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="event-date" className="mf-text-label-caps">
              Date
            </label>
            <input
              id="event-date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className={`${fieldClass} ${fieldErrors.date ? 'border-error' : ''}`}
            />
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="event-location" className="mf-text-label-caps">
              Location
            </label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-sm text-on-surface-variant">
                location_on
              </span>
              <input
                id="event-location"
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="London, UK"
                className={`${fieldClass} pl-10`}
              />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="event-type" className="mf-text-label-caps">
              Event Type
            </label>
            <select
              id="event-type"
              value={eventType}
              onChange={(e) => setEventType(e.target.value)}
              className={fieldClass}
            >
              {EVENT_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="event-cameraman" className="mf-text-label-caps">
              Assign Cameraman
            </label>
            <select
              id="event-cameraman"
              value={cameraman}
              onChange={(e) => setCameraman(e.target.value)}
              className={fieldClass}
            >
              {CAMERAMEN.map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-2 md:col-span-3">
            <label htmlFor="event-notes" className="mf-text-label-caps">
              Notes
            </label>
            <textarea
              id="event-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Briefing details, equipment requirements..."
              rows={3}
              className={`${fieldClass} resize-none`}
            />
          </div>

          <div className="flex justify-end pt-2 md:col-span-3">
            <button
              type="submit"
              disabled={submitState === 'submitting'}
              className={`mf-btn-primary gap-2 px-8 active:scale-95 ${
                submitState === 'success' ? '!bg-green-600' : ''
              } ${submitState === 'submitting' ? 'opacity-50' : ''}`}
            >
              <span className="material-symbols-outlined text-sm">send</span>
              {submitLabel}
            </button>
          </div>
        </form>
      </section>

      <section className="mf-card overflow-hidden">
        <div className="flex items-center justify-between border-b border-outline-variant bg-surface-container-low px-6 py-4">
          <h2 className="mf-text-card-title">All Events</h2>
          <div className="flex items-center gap-1">
            <button type="button" className="mf-icon-btn !h-9 !w-9">
              <span className="material-symbols-outlined text-sm">filter_list</span>
            </button>
            <button type="button" className="mf-icon-btn !h-9 !w-9">
              <span className="material-symbols-outlined text-sm">download</span>
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-outline-variant bg-surface-container-low">
                {['Title', 'Type', 'Date', 'Location', 'Cameraman', 'Status'].map((col) => (
                  <th key={col} className="px-6 py-4 mf-text-label-caps first:pl-8 last:pr-8">
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant">
              {events.map((event) => (
                <tr
                  key={event.id}
                  onClick={() => setSelectedId(event.id)}
                  className={`cursor-pointer transition-colors hover:bg-surface-container-low ${
                    selectedId === event.id ? 'bg-primary/5' : ''
                  }`}
                >
                  <td className="px-8 py-5 font-semibold text-on-surface">{event.title}</td>
                  <td className="px-6 py-5 mf-text-body">{event.type}</td>
                  <td className="px-6 py-5 mf-text-body">{event.date}</td>
                  <td className="px-6 py-5 mf-text-body">{event.location}</td>
                  <td className="px-6 py-5 mf-text-body">{event.cameraman}</td>
                  <td className="px-8 py-5">
                    <StatusBadge label={event.status} className={event.statusClass} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between border-t border-outline-variant bg-surface-container-low px-8 py-4 mf-text-body">
          <span>
            Showing {events.length} of {totalEvents} events
          </span>
          <div className="flex items-center gap-4">
            <button type="button" className="mf-icon-btn opacity-30" disabled>
              <span className="material-symbols-outlined">chevron_left</span>
            </button>
            <span className="mf-text-label-caps">Page 1 of 6</span>
            <button type="button" className="mf-icon-btn">
              <span className="material-symbols-outlined">chevron_right</span>
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
