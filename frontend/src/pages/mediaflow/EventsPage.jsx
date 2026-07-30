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
import { EventFormModal, DeleteEventDialog } from '../../components/mediaflow/EventModals';

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
  const editorMeta = getEditorStatusMeta(event.editorStatus);

  return (
    <div className="flex min-w-[190px] flex-col gap-2.5">
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

export default function EventsPage() {
  const navigate = useNavigate();
  const { accessToken } = useAuth();
  const { role, isAdmin } = useRole();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [deletingEvent, setDeletingEvent] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const newEventsCount = useMemo(() => events.filter((event) => event.isNew).length, [events]);

  const stats = useMemo(
    () => [
      { label: 'Total events', value: String(events.length), accent: false },
      { label: 'Live now', value: String(events.filter((e) => e.live).length), accent: true },
      { label: 'New events', value: String(newEventsCount), accent: false },
      {
        label: 'Editing Done',
        value: String(events.filter((e) => e.editorStatus === 'event-done').length),
        accent: false,
      },
    ],
    [events, newEventsCount]
  );

  const columns = ['Event title', 'Schedule date', 'Location', 'Status', 'Actions'];

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

  const openCreateModal = () => {
    setEditingEvent(null);
    setModalOpen(true);
  };

  const openEditModal = (event) => {
    setEditingEvent(event);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingEvent(null);
  };

  const handleEventSaved = (event, mode) => {
    if (mode === 'created') {
      setEvents((prev) => [
        event,
        ...prev.map((e) => (e.isNew ? { ...e, isNew: false, badge: 'Active Event' } : e)),
      ]);
      return;
    }
    setEvents((prev) => prev.map((e) => (e.id === event.id ? event : e)));
  };

  const handleConfirmDelete = async () => {
    if (!deletingEvent) return;
    setDeleting(true);
    try {
      await api.deleteEvent(deletingEvent.id, accessToken);
      setEvents((prev) => prev.filter((e) => e.id !== deletingEvent.id));
      setDeletingEvent(null);
    } catch (err) {
      if (isSessionExpiredError(err)) return;
      setLoadError(err instanceof ApiError ? err.message : 'Failed to delete event');
      setDeletingEvent(null);
    } finally {
      setDeleting(false);
    }
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
        <button type="button" className="mf-btn-primary" onClick={openCreateModal}>
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

      <EventFormModal
        open={modalOpen}
        event={editingEvent}
        onClose={closeModal}
        onSaved={handleEventSaved}
        accessToken={accessToken}
      />

      <DeleteEventDialog
        event={deletingEvent}
        onClose={() => !deleting && setDeletingEvent(null)}
        onConfirm={handleConfirmDelete}
        deleting={deleting}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-6">
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
                      key={col}
                      className={`px-6 py-4 mf-text-label-caps ${
                        col.includes('Status') ? 'text-center' : col === 'Actions' ? 'text-right' : ''
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
                        <div className="w-28 h-16 rounded-xl overflow-hidden relative shrink-0 bg-white border border-outline-variant">
                          <img className="w-full h-full object-contain p-1" alt="" src={event.image} />
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
                      <p>{event.location || '—'}</p>
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
                            showShotDone={false}
                          />
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div
                        className="flex items-center justify-end gap-1"
                        onClick={(e) => e.stopPropagation()}
                        onKeyDown={(e) => e.stopPropagation()}
                      >
                        <button
                          type="button"
                          className="mf-icon-btn opacity-70 transition group-hover:opacity-100"
                          aria-label={`Edit ${event.title}`}
                          title="Edit event"
                          onClick={() => openEditModal(event)}
                        >
                          <span className="material-symbols-outlined">edit</span>
                        </button>
                        <button
                          type="button"
                          className="mf-icon-btn opacity-70 transition group-hover:opacity-100 hover:!bg-error/10 hover:!text-error"
                          aria-label={`Delete ${event.title}`}
                          title="Delete event"
                          onClick={() => setDeletingEvent(event)}
                        >
                          <span className="material-symbols-outlined">delete</span>
                        </button>
                        <button
                          type="button"
                          className="mf-icon-btn opacity-70 transition group-hover:opacity-100"
                          aria-label={`Open ${event.title}`}
                          title="Open event"
                          onClick={() => handleRowClick(event)}
                        >
                          <span className="material-symbols-outlined">chevron_right</span>
                        </button>
                      </div>
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
