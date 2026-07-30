export const EDITOR_EVENT_STATUSES = [
  { value: 'event-scheduled', label: 'Event Scheduled', className: 'bg-blue-100 text-blue-800' },
  { value: 'editing-ongoing', label: 'Editing Ongoing', className: 'bg-amber-100 text-amber-800' },
  { value: 'footage-received', label: 'Footage Received', className: 'bg-blue-100 text-blue-800' },
  { value: 'event-done', label: 'Editing Done', className: 'bg-green-100 text-green-800' },
];

export const CAMERAMAN_EVENT_STATUSES = [
  { value: 'cancelled', label: 'Event Cancelled', className: 'bg-red-100 text-red-800' },
  { value: 'scheduled', label: 'Event Scheduled', className: 'bg-blue-100 text-blue-800' },
  { value: 'started', label: 'Event Started', className: 'bg-amber-100 text-amber-800' },
  { value: 'footage-covered', label: 'Event Footage Covered', className: 'bg-green-100 text-green-800' },
  { value: 'delivered', label: 'Event Done', className: 'bg-emerald-100 text-emerald-800' },
];

export const EVENTS = [
  {
    id: '1',
    slug: 'tech-summit-2024',
    title: 'Tech Summit 2024',
    subtitle: 'Global Keynote Series',
    image: '/tea-time-telugu-logo.png',
    date: 'Oct 12, 2024',
    time: '09:00 AM EST',
    location: 'San Francisco, CA',
    type: 'Live Broadcast',
    cameraman: 'James Wilson',
    live: false,
    badge: 'Active Event',
    editorStatus: 'footage-received',
    cameramanStatus: 'scheduled',
  },
  {
    id: '2',
    slug: 'luxury-brand-launch',
    title: 'Luxury Brand Launch',
    subtitle: 'Seasonal Collection',
    image: '/tea-time-telugu-logo.png',
    date: 'Nov 05, 2024',
    time: '07:30 PM CET',
    location: 'Paris, France',
    type: 'Social Media Reel',
    cameraman: 'Elena Rodriguez',
    live: false,
    badge: 'In Planning',
    editorStatus: 'editing-ongoing',
    cameramanStatus: 'scheduled',
  },
  {
    id: '3',
    slug: 'global-media-expo',
    title: 'Global Media Expo',
    subtitle: 'Production Workflow Hub',
    image: '/tea-time-telugu-logo.png',
    date: 'Happening now',
    time: 'Started at 08:00 AM',
    location: 'New York, NY',
    type: 'Live Broadcast',
    cameraman: 'Marcus Chen',
    live: true,
    badge: 'Live Now',
    editorStatus: 'editing-ongoing',
    cameramanStatus: 'started',
  },
  {
    id: '4',
    slug: 'sustainability-forum',
    title: 'Sustainability Forum',
    subtitle: 'Panel Discussions',
    image: '/tea-time-telugu-logo.png',
    date: 'Dec 01, 2024',
    time: '10:00 AM GMT',
    location: 'London, UK',
    type: 'Documentary',
    cameraman: 'Sarah Jenkins',
    live: false,
    badge: 'Active Event',
    editorStatus: 'event-done',
    cameramanStatus: 'footage-covered',
  },
];

export const VIDEO_TYPES = ['Shortform', 'Longform'];
export const RAW_VIDEO_TYPE = 'Raw';

export const SOCIAL_PLATFORMS = ['Facebook', 'Instagram', 'YouTube', 'Threads'];

const VIDEO_THUMB = '/tea-time-telugu-logo.png';

export const DEFAULT_VIDEOS = [
  { id: 'v1', title: 'Keynote Highlights - AI Integration', type: 'Shortform', slug: 'summit24_01', platforms: ['IG', 'YT'], editor: 'Editor 1' },
  { id: 'v2', title: 'Panel Discussion: Future of SaaS', type: 'Longform', slug: 'summit24_02', platforms: ['FB', 'YT', 'TH'], editor: 'Editor 1' },
  { id: 'v3', title: 'Behind the Scenes - Stage Setup', type: 'Shortform', slug: 'summit24_03', platforms: ['IG'], editor: 'Editor 2' },
  { id: 'v4', title: 'Sponsor Spotlight: CloudSphere', type: 'Longform', slug: 'summit24_04', platforms: ['YT'], editor: 'Editor 1' },
  { id: 'v5', title: 'Attendee Vox Pops - Day 1', type: 'Shortform', slug: 'summit24_05', platforms: ['IG', 'TH'], editor: 'Editor 3' },
  { id: 'v6', title: 'Closing Ceremony Recap', type: 'Longform', slug: 'summit24_06', platforms: ['FB', 'YT'], editor: 'Editor 1' },
  { id: 'v7', title: 'Cybersecurity Deep Dive Part 1', type: 'Longform', slug: 'summit24_07', platforms: ['YT'], editor: 'Editor 2' },
  { id: 'v8', title: 'Mobile App Launch Trailer', type: 'Shortform', slug: 'summit24_08', platforms: ['IG', 'FB'], editor: 'Editor 1' },
  { id: 'v9', title: 'Developer Workshop: Rust Fundamentals', type: 'Longform', slug: 'summit24_09', platforms: ['YT'], editor: 'Editor 3' },
  { id: 'v10', title: 'Networking Mixer Montage', type: 'Shortform', slug: 'summit24_10', platforms: ['IG', 'TH', 'FB'], editor: 'Editor 2' },
].map((v) => ({ ...v, thumbnail: VIDEO_THUMB }));

export function getEventById(eventId) {
  return EVENTS.find((e) => e.id === eventId || e.slug === eventId);
}

export function getEditorStatusMeta(value) {
  return EDITOR_EVENT_STATUSES.find((s) => s.value === value) ?? EDITOR_EVENT_STATUSES[0];
}

export function getCameramanStatusMeta(value) {
  return CAMERAMAN_EVENT_STATUSES.find((s) => s.value === value) ?? CAMERAMAN_EVENT_STATUSES[0];
}
