export const TEAM_ROLES = [
  { value: 'editor', label: 'Editor' },
  { value: 'photographer', label: 'Cameraman' },
  { value: 'admin', label: 'Admin' },
];

export const TEAM_ROLE_STYLES = {
  editor: 'bg-amber-100 text-amber-800 border-amber-200',
  photographer: 'bg-blue-100 text-blue-800 border-blue-200',
  admin: 'bg-primary/10 text-primary border-primary/20',
};

const AVATARS = {
  alex:
    'https://lh3.googleusercontent.com/aida-public/AB6AXuAa5JfhDirh4MB4mdxj8QAAS5HwyW5iVpHfPA8I79cocdxahB8AIWzFj6lS8rlr6EnFC_4GFW5JuoQbeIy2dL19oXQ61jRanunurzmdyvBt6D5IW2Y_fgKg7gif7w_8bOeHu02goeEfwW1sasMxPRl4zovCecOvkLUaxGYuGPfUeVCK4fa2rBEzbzzQnDD7xYPqsXAIPBrYRN1KpZbpnIN5JklRM6Y9h1vNL-04eIGsAlqCNZQtQRVGUMvC9OkC_bHJRveGkLPWeQ',
  sarah:
    'https://lh3.googleusercontent.com/aida-public/AB6AXuCcApZQzG_7omYr3DYyCe8k5gR0YIjhnMw0MFxqSg-pSl2f7pm2PAWJcmBuQN9SceJpx0xoYXRR-F62F0X-rbLWQKzpS2Ux4Z-Idv4JU5vrbU5aKVNKPyeOMm1vEDRmQnrXKjA8RJBHhnboO2l1iLzSQGU5Gs6lJY3DRO3e5opK5VtT9EfsGS-mbUY1KxcjesAZVGet7Im8vcbkdvau2yCfdebTfrBHVs3-OGcBxVhlFt8Kb05yMdPrdjZgkJP6VXLHwJmWYgyfOw',
  james:
    'https://lh3.googleusercontent.com/aida-public/AB6AXuDYZizD6Ihbjvpo5-WYHzCLI-hCb_MKEdoh2WAWSoNah25hpfGtRaISo9rgChn0kckjswuNryTnJy_EFWbn-Rco663D9K6Qlmx9lzC_tjX6OfZYK1m2R8ngbCWxProcLRu2JGYVvStOdLkB3GxMYD2oR7Gu03gLY42FoFd3IJNKBuYZFcjY3LE4CfVTbfdssO4AuR1hnXSugD-VXRILAPQxWlk0rzxcH0vWFyhmnj-A5osfcmVQkJ4vMQxG4zJgfoHgnG65rnSZTQ',
  elena:
    'https://lh3.googleusercontent.com/aida-public/AB6AXuCP_PmU5EYGynuj_j3ta3fKkV1xSeUF59gW_ZJyeg2cfrZKohcLjDcl-fvf46dSpDjr6tA7ztDW001Wp1hNX2RJOGnuCBH5F_ob7AIGZgzztsAiSTkMMJMtz-NaqMTmnWqFCRxw2OhRvhKuTqKp6RqldVSzgDjYCEQbXYmXsYKVuFatD13ciAKwckX2aiPDt3PpBAXsqzFR0rvkIfPUKE2tqJ1dJye0NTVeLxqK0AOz3hQuqbl74lnYJiS5qY9uhEk5u5R815DJhg',
};

export const INITIAL_TEAM = [
  {
    id: 'tm-1',
    name: 'Alex Rivera',
    role: 'editor',
    title: 'Senior Editor',
    email: 'alex.rivera@mediaflow.app',
    eventsEdited: 48,
    eventsCovered: 0,
    videosUploaded: 312,
    status: 'active',
    joinedAt: 'Mar 2022',
    avatar: AVATARS.alex,
  },
  {
    id: 'tm-2',
    name: 'Sarah Chen',
    role: 'editor',
    title: 'Video Editor',
    email: 'sarah.chen@mediaflow.app',
    eventsEdited: 36,
    eventsCovered: 0,
    videosUploaded: 198,
    status: 'active',
    joinedAt: 'Aug 2022',
    avatar: AVATARS.sarah,
  },
  {
    id: 'tm-3',
    name: 'John Doe',
    role: 'editor',
    title: 'Junior Editor',
    email: 'john.doe@mediaflow.app',
    eventsEdited: 22,
    eventsCovered: 0,
    videosUploaded: 94,
    status: 'active',
    joinedAt: 'Jan 2024',
    avatar: null,
    initials: 'JD',
  },
  {
    id: 'tm-4',
    name: 'James Wilson',
    role: 'photographer',
    title: 'Lead Cameraman',
    email: 'james.wilson@mediaflow.app',
    eventsEdited: 0,
    eventsCovered: 28,
    videosUploaded: 0,
    status: 'active',
    joinedAt: 'Jun 2021',
    avatar: AVATARS.james,
  },
  {
    id: 'tm-5',
    name: 'Elena Rodriguez',
    role: 'photographer',
    title: 'Cameraman',
    email: 'elena.rodriguez@mediaflow.app',
    eventsEdited: 0,
    eventsCovered: 24,
    videosUploaded: 0,
    status: 'active',
    joinedAt: 'Feb 2022',
    avatar: AVATARS.elena,
  },
  {
    id: 'tm-6',
    name: 'Marcus Chen',
    role: 'photographer',
    title: 'Cameraman',
    email: 'marcus.chen@mediaflow.app',
    eventsEdited: 0,
    eventsCovered: 19,
    videosUploaded: 0,
    status: 'active',
    joinedAt: 'Nov 2022',
    avatar: null,
    initials: 'MC',
  },
  {
    id: 'tm-7',
    name: 'Sarah Jenkins',
    role: 'photographer',
    title: 'Cameraman',
    email: 'sarah.jenkins@mediaflow.app',
    eventsEdited: 0,
    eventsCovered: 15,
    videosUploaded: 0,
    status: 'active',
    joinedAt: 'May 2023',
    avatar: null,
    initials: 'SJ',
  },
  {
    id: 'tm-8',
    name: 'Morgan Blake',
    role: 'admin',
    title: 'Administrator',
    email: 'morgan.blake@mediaflow.app',
    eventsEdited: 0,
    eventsCovered: 0,
    videosUploaded: 0,
    eventsManaged: 124,
    status: 'active',
    joinedAt: 'Jan 2021',
    avatar: null,
    initials: 'MB',
  },
];

export function getRoleLabel(role) {
  return TEAM_ROLES.find((r) => r.value === role)?.label ?? role;
}
