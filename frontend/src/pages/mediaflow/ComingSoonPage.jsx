import { useLocation } from 'react-router-dom';

const PAGE_TITLES = {
  dashboard: 'Dashboard',
  complaints: 'Complaints',
  support: 'Support',
  settings: 'Settings',
  events: 'Events',
  footage: 'Footage',
  team: 'Team',
};

export default function ComingSoonPage() {
  const { pathname } = useLocation();
  const segment = pathname.split('/').pop() || 'page';
  const title = PAGE_TITLES[segment] || 'Page';

  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] text-center">
      <div className="w-16 h-16 rounded-[24px] mf-card flex items-center justify-center mb-6">
        <span className="material-symbols-outlined text-on-surface text-[32px]">construction</span>
      </div>
      <h2 className="mf-text-section">{title}</h2>
      <p className="mf-text-body mt-2 max-w-md">
        This section is under development. We&apos;re designing it next.
      </p>
      <span className="mt-6 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-surface-container mf-text-meta font-semibold uppercase tracking-wide">
        Coming soon
      </span>
    </div>
  );
}
