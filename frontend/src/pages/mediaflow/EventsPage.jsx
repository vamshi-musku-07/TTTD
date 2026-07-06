import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useRole } from '../../context/RoleContext';
import { api, ApiError, isSessionExpiredError } from '../../lib/api';
import {
  EDITOR_EVENT_STATUSES,
  CAMERAMAN_EVENT_STATUSES,
  getEditorStatusMeta,
  getCameramanStatusMeta,
} from '../../lib/eventsData';
import { CAMERAMEN, EVENT_TYPES } from '../../lib/adminEventsData';

const fieldClass =
  'w-full rounded-xl border border-outline-variant bg-surface-bright px-4 py-3 text-sm text-on-surface outline-none transition-colors focus:border-primary';

const statusSelectClass =
  'rounded-lg border border-outline-variant bg-surface-bright px-3 py-2 text-xs font-semibold text-on-surface outline-none focus:border-primary min-w-[180px]';

function StatusBadge({ meta }) {
  return (
    <span
      className={`inline-flex w-full items-center justify-center rounded-md px-2 py-1.5 text-[11px] font-semibold ${meta.className}`}
    >
      {meta.label}
    </span>
  );
}

function AdminStatusCell({ event }) {
  const cameramanMeta = getCameramanStatusMeta(event.cameramanStatus);
  const editorMeta = getEditorStatusMeta(event.editorStatus);

  return (
    <div className="flex min-w-[190px] flex-col gap-2.5">
      <div>
        <p className="mb-1 flex items-center gap-1 mf-text-label-caps text-[9px] text-on-surface-variant">
          <span className="material-symbols-outlined text-[13px]">videocam</span>
          Cameraman
        </p>
        <StatusBadge meta={cameramanMeta} />
      </div>
      <div>
        <p className="mb-1 flex items-center gap-1 mf-text-label-caps text-[9px] text-on-surface-variant">
          <span className="material-symbols-outlined text-[13px]">movie_edit</span>
          Editor
        </p>
        <StatusBadge meta={editorMeta} />
      </div>
    </div>
  );
}

function EventStatusSelect({ role, event, onStatusChange, showShotDone }) {
  const isEditor = role === 'editor';
  const statusKey = isEditor ? 'editorStatus' : 'cameramanStatus';
  const options = isEditor ? EDITOR_EVENT_STATUSES : CAMERAMAN_EVENT_STATUSES;
  const meta = isEditor
    ? getEditorStatusMeta(event[statusKey])
    : getCameramanStatusMeta(event[statusKey]);

  const handleShotDone = (e) => {
    e.stopPropagation();
    onStatusChange(event.id, statusKey, 'footage-covered');
  };

  return (
    <div className="flex items-center justify-center gap-2">
      <select
        value={event[statusKey]}
        onChange={(e) => onStatusChange(event.id, statusKey, e.target.value)}
        onClick={(e) => e.stopPropagation()}
        onKeyDown={(e) => e.stopPropagation()}
        className={`${statusSelectClass} ${meta.className}`}
        aria-label={`Status for ${event.title}`}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {showShotDone && (
        <button
          type="button"
          onClick={handleShotDone}
          className="mf-btn-secondary !h-9 shrink-0 whitespace-nowrap !px-3 !text-xs font-bold uppercase tracking-wide"
        >
          Shot Done
        </button>
      )}
    </div>
  );
}

function CreateEventModal({ open, onClose, onCreated, accessToken, isAdmin }) {
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [location, setLocation] = useState('');
  const [eventType, setEventType] = useState(EVENT_TYPES[0]);
  const [cameraman, setCameraman] = useState(CAMERAMEN[0]);
  const [fieldErrors, setFieldErrors] = useState({});
  const [error, setError] = useState('');
  const [submitState, setSubmitState] = useState('idle');

  useEffect(() => {
    if (!open) return;
    setTitle('');
    setDate('');
    setLocation('');
    setEventType(EVENT_TYPES[0]);
    setCameraman(CAMERAMEN[0]);
    setFieldErrors({});
    setError('');
    setSubmitState('idle');
  }, [open]);

  if (!open) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();

    const errors = {};
    if (!title.trim()) errors.title = true;
    if (!date) errors.date = true;
    if (!location.trim()) errors.location = true;

    setFieldErrors(errors);
    setError('');
    if (Object.keys(errors).length > 0 || submitState !== 'idle') return;

    setSubmitState('submitting');

    try {
      const data = await api.createEvent(
        {
          title: title.trim(),
          scheduleDate: date,
          location: location.trim(),
          type: eventType,
          ...(isAdmin ? { cameraman } : {}),
        },
        accessToken
      );
      setSubmitState('success');
      onCreated(data.event);
      setTimeout(onClose, 800);
    } catch (err) {
      setSubmitState('idle');
      if (isSessionExpiredError(err)) return;
      setError(err instanceof ApiError ? err.message : 'Failed to create event');
    }
  };

  const submitLabel =
    submitState === 'submitting'
      ? 'Creating...'
      : submitState === 'success'
        ? 'Created!'
        : 'Create Event';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button type="button" className="absolute inset-0 bg-black/40" onClick={onClose} aria-label="Close" />
      <div className="relative z-10 w-full max-w-2xl mf-card p-6 sm:p-8 max-h-[90vh] overflow-y-auto">
        <div className="mb-6 flex items-center justify-between gap-4 border-b border-outline-variant pb-4">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">add_circle</span>
            <h2 className="mf-text-card-title">Create New Event</h2>
          </div>
          <button type="button" className="mf-icon-btn" onClick={onClose} aria-label="Close dialog">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {error && (
          <div className="mb-4 rounded-xl border border-error/30 bg-error/5 px-4 py-3 text-sm text-error">
            {error}
          </div>
        )}

        <form className="grid grid-cols-1 gap-4 sm:grid-cols-2" onSubmit={handleSubmit} noValidate>
          <div className="sm:col-span-2">
            <label htmlFor="modal-event-title" className="mb-1 block mf-text-label-caps">
              Event Title
            </label>
            <input
              id="modal-event-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Annual Tech Summit 2024"
              className={`${fieldClass} ${fieldErrors.title ? 'border-error' : ''}`}
            />
          </div>

          <div>
            <label htmlFor="modal-event-date" className="mb-1 block mf-text-label-caps">
              Date
            </label>
            <input
              id="modal-event-date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className={`${fieldClass} ${fieldErrors.date ? 'border-error' : ''}`}
            />
          </div>

          <div>
            <label htmlFor="modal-event-location" className="mb-1 block mf-text-label-caps">
              Location
            </label>
            <input
              id="modal-event-location"
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="London, UK"
              className={`${fieldClass} ${fieldErrors.location ? 'border-error' : ''}`}
            />
          </div>

          <div className={isAdmin ? '' : 'sm:col-span-2'}>
            <label htmlFor="modal-event-type" className="mb-1 block mf-text-label-caps">
              Event Type
            </label>
            <select
              id="modal-event-type"
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

          {isAdmin && (
            <div>
              <label htmlFor="modal-event-cameraman" className="mb-1 block mf-text-label-caps">
                Assign Cameraman
              </label>
              <select
                id="modal-event-cameraman"
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
          )}

          <div className="flex justify-end gap-3 sm:col-span-2 pt-2">
            <button type="button" className="mf-btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitState === 'submitting'}
              className={`mf-btn-primary gap-2 px-8 ${submitState === 'success' ? '!bg-green-600' : ''} ${
                submitState === 'submitting' ? 'opacity-50' : ''
              }`}
            >
              <span className="material-symbols-outlined text-sm">send</span>
              {submitLabel}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function EventsPage() {
  const navigate = useNavigate();
  const { accessToken, user } = useAuth();
  const { role, isAdmin, isPhotographer } = useRole();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [showModal, setShowModal] = useState(false);

  const userDisplayName = useMemo(
    () => user?.fullName?.trim() || `${user?.firstName || ''} ${user?.lastName || ''}`.trim(),
    [user]
  );

  const cameramanEvents = useMemo(() => {
    if (!isPhotographer) return [];
    return events.filter((event) => {
      const isAssigned =
        userDisplayName &&
        event.cameraman &&
        event.cameraman !== 'Unassigned' &&
        event.cameraman === userDisplayName;
      const isCreated = user?.id && event.createdBy?.id === user.id;
      return isAssigned || isCreated;
    });
  }, [events, isPhotographer, userDisplayName, user?.id]);

  const newEventsCount = useMemo(() => events.filter((event) => event.isNew).length, [events]);

  const stats = useMemo(() => {
    if (isPhotographer) {
      return [
        { label: 'Total events', value: String(cameramanEvents.length), accent: false },
        {
          label: 'Cancelled events',
          value: String(cameramanEvents.filter((e) => e.cameramanStatus === 'cancelled').length),
          accent: false,
        },
        {
          label: 'Event Done',
          value: String(cameramanEvents.filter((e) => e.cameramanStatus === 'delivered').length),
          accent: false,
        },
      ];
    }

    return [
      { label: 'Total events', value: String(events.length), accent: false },
      { label: 'Live now', value: String(events.filter((e) => e.live).length), accent: true },
      { label: 'New events', value: String(newEventsCount), accent: false },
      {
        label: 'Editing Done',
        value: String(events.filter((e) => e.editorStatus === 'event-done').length),
        accent: false,
      },
    ];
  }, [events, newEventsCount, isPhotographer, cameramanEvents]);

  const columns = isAdmin
    ? ['Event title', 'Schedule date', 'Location', 'Status', '']
    : ['Event title', 'Schedule date', 'Location', 'Status', ''];

  const fetchEvents = async () => {
    setLoading(true);
    setLoadError('');
    try {
      const data = await api.getEvents(accessToken);
      setEvents(data.events);
    } catch (err) {
      if (isSessionExpiredError(err)) return;
      setLoadError(err instanceof ApiError ? err.message : 'Failed to load events');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, [accessToken]);

  const handleStatusChange = async (eventId, statusKey, value) => {
    const previous = events;
    setEvents((prev) =>
      prev.map((event) => (event.id === eventId ? { ...event, [statusKey]: value } : event))
    );

    try {
      const body =
        statusKey === 'editorStatus'
          ? { editorStatus: value }
          : { cameramanStatus: value };
      const data = await api.updateEventStatus(eventId, body, accessToken);
      setEvents((prev) => prev.map((event) => (event.id === eventId ? data.event : event)));
    } catch {
      setEvents(previous);
    }
  };

  const handleRowClick = (event) => {
    navigate(`/app/events/${event.id}`);
  };

  const handleEventCreated = (event) => {
    setEvents((prev) => [
      event,
      ...prev.map((e) => (e.isNew ? { ...e, isNew: false, badge: 'Active Event' } : e)),
    ]);
  };

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-6 gap-4">
        <div>
          <h2 className="mf-text-section">Event Management</h2>
          <p className="mf-text-body mt-1">
            Review and manage upcoming production events and live broadcast schedules.
          </p>
        </div>
        <button type="button" className="mf-btn-primary" onClick={() => setShowModal(true)}>
          <span className="material-symbols-outlined text-[20px]">add</span>
          Create Event
        </button>
      </div>

      {newEventsCount > 0 && (
        <div className="mb-6 flex items-start gap-3 rounded-2xl border border-primary/30 bg-primary/5 px-5 py-4">
          <span className="material-symbols-outlined mt-0.5 text-primary">new_releases</span>
          <div>
            <p className="font-semibold text-on-surface">
              {newEventsCount} newly created event{newEventsCount > 1 ? 's' : ''} at the top
            </p>
            <p className="mf-text-body mt-1">
              Highlighted rows are fresh additions. Review them before creating another event with the same name.
            </p>
          </div>
        </div>
      )}

      <CreateEventModal
        open={showModal}
        onClose={() => setShowModal(false)}
        onCreated={handleEventCreated}
        accessToken={accessToken}
        isAdmin={isAdmin}
      />

      <div className={`grid grid-cols-1 sm:grid-cols-2 gap-5 mb-6 ${isPhotographer ? 'lg:grid-cols-3' : 'lg:grid-cols-4'}`}>
        {stats.map((stat) => (
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

        {loading ? (
          <div className="px-6 py-12 text-center mf-text-body">Loading events...</div>
        ) : loadError ? (
          <div className="px-6 py-12 text-center">
            <p className="text-error mb-4">{loadError}</p>
            <button type="button" className="mf-btn-secondary" onClick={fetchEvents}>
              Retry
            </button>
          </div>
        ) : events.length === 0 ? (
          <div className="px-6 py-12 text-center mf-text-body">
            No events yet. Create the first event to get started.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-outline-variant">
                  {columns.map((col) => (
                    <th
                      key={col || 'actions'}
                      className={`px-6 py-4 mf-text-label-caps ${
                        col.includes('Status') ? 'text-center' : col === '' ? 'text-right' : ''
                      }`}
                    >
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {events.map((event) => (
                  <tr
                    key={event.id}
                    onClick={() => handleRowClick(event)}
                    onKeyDown={(e) => e.key === 'Enter' && handleRowClick(event)}
                    tabIndex={0}
                    role="link"
                    className={`border-b border-outline-variant last:border-0 transition-colors group cursor-pointer ${
                      event.isNew
                        ? 'bg-primary/5 border-l-4 border-l-primary hover:bg-primary/10'
                        : 'hover:bg-surface-container-low'
                    }`}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl overflow-hidden relative shrink-0 bg-surface-container">
                          <img className="w-full h-full object-cover" alt="" src={event.image} />
                          {event.live && <div className="absolute inset-0 bg-error/20 animate-pulse" />}
                        </div>
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="mf-text-card-title">{event.title}</p>
                            {event.isNew && (
                              <span className="inline-flex items-center gap-1 rounded-full bg-primary px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-on-primary animate-pulse">
                                <span className="material-symbols-outlined text-[12px]">fiber_new</span>
                                New
                              </span>
                            )}
                          </div>
                          <p className="mf-text-meta mt-0.5">{event.subtitle}</p>
                          {isAdmin && (
                            <p className="mf-text-meta mt-0.5 flex items-center gap-1">
                              <span className="material-symbols-outlined text-[12px]">person</span>
                              {event.cameraman}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className={`text-sm ${event.live ? 'font-bold text-error' : 'text-on-surface'}`}>
                        {event.date}
                      </p>
                      <p className="mf-text-meta mt-0.5">{event.time}</p>
                    </td>
                    <td className="px-6 py-4 text-sm text-on-surface">
                      <p>{event.location}</p>
                    </td>
                    <td className="px-6 py-4">
                      {isAdmin ? (
                        <AdminStatusCell event={event} />
                      ) : (
                        <div className="flex justify-center">
                          <EventStatusSelect
                            role={role}
                            event={event}
                            onStatusChange={handleStatusChange}
                            showShotDone={isPhotographer}
                          />
                        </div>
                      )}
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
        )}

        <div className="px-6 py-4 border-t border-outline-variant flex items-center justify-between">
          <p className="mf-text-meta">Showing {events.length} event{events.length !== 1 ? 's' : ''}</p>
        </div>
      </div>
    </div>
  );
}
