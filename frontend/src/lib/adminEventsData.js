export const EVENT_TYPES = [
  'Corporate Film',
  'Live Broadcast',
  'Social Media Reel',
  'Documentary',
];

export const CAMERAMEN = [
  'James Wilson',
  'Elena Rodriguez',
  'Marcus Chen',
  'Sarah Jenkins',
];

export const INITIAL_ADMIN_EVENTS = [
  {
    id: 'evt-1',
    title: 'Global Fintech Expo',
    type: 'Live Broadcast',
    date: 'Oct 24, 2024',
    location: 'New York, NY',
    cameraman: 'James Wilson',
    status: 'Assigned',
    statusClass: 'bg-primary/10 text-primary border border-primary/20',
  },
  {
    id: 'evt-2',
    title: 'Luxury Brand Launch',
    type: 'Social Media Reel',
    date: 'Oct 22, 2024',
    location: 'Paris, FR',
    cameraman: 'Elena Rodriguez',
    status: 'Shot',
    statusClass: 'bg-green-100 text-green-700 border border-green-200',
  },
  {
    id: 'evt-3',
    title: 'Sustainable Future Forum',
    type: 'Documentary',
    date: 'Oct 26, 2024',
    location: 'Berlin, GER',
    cameraman: 'Marcus Chen',
    status: 'In-Progress',
    statusClass: 'bg-amber-100 text-amber-700 border border-amber-200',
  },
  {
    id: 'evt-4',
    title: 'City Marathon Highlights',
    type: 'Corporate Film',
    date: 'Oct 28, 2024',
    location: 'London, UK',
    cameraman: 'Sarah Jenkins',
    status: 'Assigned',
    statusClass: 'bg-primary/10 text-primary border border-primary/20',
  },
];

export function formatEventDate(isoDate) {
  if (!isoDate) return '';
  const date = new Date(`${isoDate}T12:00:00`);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}
