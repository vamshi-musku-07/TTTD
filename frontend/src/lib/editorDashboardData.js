export const EDITOR_METRICS = [
  {
    label: 'Total Videos Uploaded',
    value: '1,248',
    icon: 'movie',
    iconClass: 'text-primary',
    footerType: 'trend',
    footerText: '+12% from last month',
    footerClass: 'text-primary text-sm font-semibold',
  },
  {
    label: 'Events Covered',
    value: '42',
    icon: 'event',
    iconClass: 'text-secondary',
    footerType: 'history',
    footerText: 'Across 8 locations',
    footerClass: 'text-on-surface-variant text-sm',
  },
  {
    label: 'Uploads Today',
    value: '14',
    icon: 'upload',
    iconClass: 'text-amber-700',
    progress: 70,
    progressLabel: 'Target: 20 videos',
  },
  {
    label: 'Active Tasks',
    value: '07',
    icon: 'assignment',
    iconClass: 'text-error',
    footerType: 'pulse',
    footerText: '3 high priority projects',
    footerClass: 'text-xs text-on-surface-variant',
  },
];

export const UPLOAD_CHART = [
  { day: 'MON', clips: 40, masters: 20 },
  { day: 'TUE', clips: 60, masters: 35 },
  { day: 'WED', clips: 30, masters: 50 },
  { day: 'THU', clips: 85, masters: 15 },
  { day: 'FRI', clips: 45, masters: 60 },
  { day: 'SAT', clips: 10, masters: 5 },
  { day: 'SUN', clips: 15, masters: 10 },
];

export const PENDING_FOOTAGE_TASKS = [
  {
    project: 'City Marathon 2024',
    status: 'Processing',
    statusClass: 'bg-yellow-100 text-yellow-800',
    deadline: 'Today, 5:00 PM',
    assignee: 'Alex Rivera',
    avatar:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuAa5JfhDirh4MB4mdxj8QAAS5HwyW5iVpHfPA8I79cocdxahB8AIWzFj6lS8rlr6EnFC_4GFW5JuoQbeIy2dL19oXQ61jRanunurzmdyvBt6D5IW2Y_fgKg7gif7w_8bOeHu02goeEfwW1sasMxPRl4zovCecOvkLUaxGYuGPfUeVCK4fa2rBEzbzzQnDD7xYPqsXAIPBrYRN1KpZbpnIN5JklRM6Y9h1vNL-04eIGsAlqCNZQtQRVGUMvC9OkC_bHJRveGkLPWeQ',
  },
  {
    project: 'Product Launch: X-100',
    status: 'Queued',
    statusClass: 'bg-blue-100 text-blue-800',
    deadline: 'Tomorrow',
    assignee: 'Sarah Chen',
    avatar:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCcApZQzG_7omYr3DYyCe8k5gR0YIjhnMw0MFxqSg-pSl2f7pm2PAWJcmBuQN9SceJpx0xoYXRR-F62F0X-rbLWQKzpS2Ux4Z-Idv4JU5vrbU5aKVNKPyeOMm1vEDRmQnrXKjA8RJBHhnboO2l1iLzSQGU5Gs6lJY3DRO3e5opK5VtT9EfsGS-mbUY1KxcjesAZVGet7Im8vcbkdvau2yCfdebTfrBHVs3-OGcBxVhlFt8Kb05yMdPrdjZgkJP6VXLHwJmWYgyfOw',
  },
  {
    project: 'Internal Training Vid',
    status: 'Review',
    statusClass: 'bg-green-100 text-green-800',
    deadline: 'Oct 12, 2024',
    assignee: 'John Doe',
    initials: 'JD',
  },
];
