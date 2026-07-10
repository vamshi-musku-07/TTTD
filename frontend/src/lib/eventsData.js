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
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuA9EiobPBW5YcYurwa7nU3k-rkJLEnqbpClsAFMoWiTqAwXt4lW_G14V8ToYuAAXdSRQPrJLEriIl-BR_9h0mwlloKfk2RnDVN6P1T2bvkzn_LZ4eNmgu0WTuxGscDXPc2zzivE8Lg1WcNV8-s8vhjI8V9U4lNQjxya_FUabcdmChAJZzkTv1Ap7IfJ-Y-Sfd3Eh_j4LxlXsf6d70YnblwrRy--8qj_THUjxm6KOP-gIciFM3Fj22RSo8BNVomBEPpUv96iSi-puA',
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
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuC-rNejgm_jXxYM9ScZhQk811hohwWt-mOsJBo7lAlZvFisoXHFu1sYIEi2w-4_79nrw-yPDoBPIOZHfSkPTYyNTwdjzlmXkDYhfhhVgZBgQfn3MZB79HR6eTqp-7xcilllGdW_2k26JjkSxWAfEc1qqbbCFj4EPNJYqREhyXT4ObDKxktfYi0VtRHZQPqMZIwGuADbhPs8Zj1JV5keyWy8D_HpUK9_ZTxwVoN36NjwKYEPi8aVituNuL1Pj_svsE5XEnmnJLCKSw',
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
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuAs2Q44zxkIIR7Hi9wNLu674gQDS_ob_2_r4PA7wodQRzYbuCDf1BJupTa9TFKCGvw04oU8vjt3fMTMwNzmCWHgBsIR0-ZWHtrFoAAKCX-__Wbg4qdznSwOweFRZhRdiov_PRbMXpldwIQO7v20qBzM2RVFdetGoF0D41OSDNlkWQ1GKf4jzVf5rUbRk9F-wpFpPj8rw9zizeQNHvm75K6lSWbRUwUHtHH9Jo7m60FELcG6GnqhMEaMWG-Uj7yi_Rxugy_qEC1VAQ',
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
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCbeAH40hH9tZpzXKZmubyKK1xGAYMppOcjA2VaiAoDSlqD01wenFnnFG-2rO4zOqgY7gFVv30ST4wuRsQNSTLSIwHniNHKSW5iDvEbcs735-mw3ZOTuPfpHZ5zLRjfP1VV3qFGRKOEIjCLq2Fy8HYChYhk4qzQl4rjDO946KDa4l8n53bbQ5GrkkD1eQrX6TPUW74FSztsZxTGIzJVPTaftDqjQLSoSz6KPN1U88rGqL2wFv1DWdbOUNOt3zIo20FOXldYXFbloA',
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

const VIDEO_THUMB =
  'https://images.unsplash.com/photo-1540575861501-7cf05a4b125a?q=80&w=800&auto=format&fit=crop';

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
