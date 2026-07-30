import { useEffect, useState } from 'react';
import { api, ApiError, isSessionExpiredError } from '../../lib/api';
import { EVENT_TYPES } from '../../lib/adminEventsData';

const fieldClass =
  'w-full rounded-xl border border-outline-variant bg-surface-bright px-4 py-3 text-sm text-on-surface outline-none transition-colors focus:border-primary';

export function toDateInputValue(value) {
  if (!value) return '';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '';
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function EventFormModal({ open, event, onClose, onSaved, accessToken }) {
  const isEdit = Boolean(event);
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [location, setLocation] = useState('');
  const [eventType, setEventType] = useState(EVENT_TYPES[0]);
  const [fieldErrors, setFieldErrors] = useState({});
  const [error, setError] = useState('');
  const [submitState, setSubmitState] = useState('idle');

  useEffect(() => {
    if (!open) return;
    setTitle(event?.title || '');
    setDate(toDateInputValue(event?.scheduleDate));
    setLocation(event?.location || '');
    setEventType(event?.type || EVENT_TYPES[0]);
    setFieldErrors({});
    setError('');
    setSubmitState('idle');
  }, [open, event]);

  if (!open) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();

    const errors = {};
    if (!title.trim()) errors.title = true;
    if (!date) errors.date = true;

    setFieldErrors(errors);
    setError('');
    if (Object.keys(errors).length > 0 || submitState !== 'idle') return;

    setSubmitState('submitting');
    const payload = {
      title: title.trim(),
      scheduleDate: date,
      location: location.trim(),
      type: eventType,
    };

    try {
      const data = isEdit
        ? await api.updateEvent(event.id, payload, accessToken)
        : await api.createEvent(payload, accessToken);
      setSubmitState('success');
      onSaved(data.event, isEdit ? 'updated' : 'created');
      setTimeout(onClose, 700);
    } catch (err) {
      setSubmitState('idle');
      if (isSessionExpiredError(err)) return;
      setError(
        err instanceof ApiError
          ? err.message
          : isEdit
            ? 'Failed to update event'
            : 'Failed to create event'
      );
    }
  };

  const submitLabel =
    submitState === 'submitting'
      ? isEdit
        ? 'Saving...'
        : 'Creating...'
      : submitState === 'success'
        ? isEdit
          ? 'Saved!'
          : 'Created!'
        : isEdit
          ? 'Save Changes'
          : 'Create Event';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button type="button" className="absolute inset-0 bg-black/40" onClick={onClose} aria-label="Close" />
      <div className="relative z-10 w-full max-w-2xl mf-card p-6 sm:p-8 max-h-[90vh] overflow-y-auto">
        <div className="mb-6 flex items-center justify-between gap-4 border-b border-outline-variant pb-4">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">
              {isEdit ? 'edit_calendar' : 'add_circle'}
            </span>
            <h2 className="mf-text-card-title">{isEdit ? 'Edit Event' : 'Create New Event'}</h2>
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
              placeholder="London, UK (optional)"
              className={fieldClass}
            />
          </div>

          <div className="sm:col-span-2">
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
              <span className="material-symbols-outlined text-sm">
                {isEdit ? 'save' : 'send'}
              </span>
              {submitLabel}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function DeleteEventDialog({ event, onClose, onConfirm, deleting }) {
  if (!event) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button type="button" className="absolute inset-0 bg-black/40" onClick={onClose} aria-label="Close" />
      <div className="relative z-10 w-full max-w-md mf-card p-6">
        <div className="mb-4 flex items-start gap-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-error/10 text-error">
            <span className="material-symbols-outlined">delete</span>
          </span>
          <div>
            <h2 className="mf-text-card-title">Delete event?</h2>
            <p className="mf-text-body mt-2">
              Remove <span className="font-semibold text-on-surface">{event.title}</span>? All videos
              linked to this event will also be deleted. This cannot be undone.
            </p>
          </div>
        </div>
        <div className="mt-6 flex justify-end gap-3">
          <button type="button" className="mf-btn-secondary" onClick={onClose} disabled={deleting}>
            Cancel
          </button>
          <button
            type="button"
            className="mf-btn-primary !bg-error gap-2"
            disabled={deleting}
            onClick={onConfirm}
          >
            <span className="material-symbols-outlined text-[18px]">delete</span>
            {deleting ? 'Deleting...' : 'Delete Event'}
          </button>
        </div>
      </div>
    </div>
  );
}

