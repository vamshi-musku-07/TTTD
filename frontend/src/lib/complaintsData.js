export const COMPLAINT_CATEGORIES = [
  'Technical Issue',
  'Production Equipment',
  'Facility/Studio',
  'Software Bug',
  'General Suggestion',
];

export const COMPLAINT_STATS = [
  { value: '24h', label: 'Avg Response Time' },
  { value: '92%', label: 'Resolution Rate' },
  { value: 'Studio A', label: 'Most Active Facility' },
];

export const INITIAL_COMPLAINTS = [
  {
    id: 'MF-9823',
    category: 'Technical Issue',
    subject: 'Lag in 4K Render Engine #04',
    description:
      'The render farm is experiencing significant frame drops when processing 4K ProRes 4444 assets. This is delaying the final delivery of the "Sunset Ridge" project.',
    submittedAt: '2 hours ago',
    status: 'open',
    awaitingReview: true,
    adminReply: null,
  },
  {
    id: 'MF-9751',
    category: 'Facility/Studio',
    subject: 'Lighting Rig Calibration - Studio B',
    description:
      'The overhead LED grid in Studio B is flickering when set to anything below 20% brightness. Needs urgent inspection.',
    submittedAt: '3 days ago',
    status: 'resolved',
    awaitingReview: false,
    adminReply: {
      author: 'Admin Response (Maintenance)',
      date: 'Jan 14, 2024',
      message:
        'Technician visited Studio B this morning. The power driver for Grid 4 was replaced. All LEDs are now dimming correctly without flicker. Marking as resolved.',
    },
  },
  {
    id: 'MF-9610',
    category: 'General Suggestion',
    subject: 'Shared Asset Library Organization',
    description:
      'The current folder structure for shared SFX is getting messy. Can we implement a tagging system instead?',
    submittedAt: '1 week ago',
    status: 'resolved',
    awaitingReview: false,
    isSuggestion: true,
    adminReply: null,
  },
];
