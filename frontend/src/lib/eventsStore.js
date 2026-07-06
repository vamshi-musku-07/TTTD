import { EVENTS } from './eventsData';

const STORAGE_KEY = 'tttd_events';

export function loadEvents() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed) && parsed.length > 0) return sortEvents(parsed);
    }
  } catch {
    // fall through to defaults
  }
  return sortEvents(EVENTS.map((event) => ({ ...event })));
}

export function saveEvents(events) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(events));
}

export function sortEvents(events) {
  return [...events].sort((a, b) => {
    if (a.isNew !== b.isNew) return a.isNew ? -1 : 1;
    return (b.createdAt ?? 0) - (a.createdAt ?? 0);
  });
}

export function findDuplicateTitle(events, title, excludeId) {
  const normalized = title.trim().toLowerCase();
  return events.find(
    (event) => event.id !== excludeId && event.title.trim().toLowerCase() === normalized
  );
}

export function getStoredEventById(eventId) {
  return loadEvents().find((event) => event.id === eventId || event.slug === eventId);
}
