import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Logo } from '../components/Logo';
import { Button } from '../components/Button';
import { NameAvatar } from '../components/NameAvatar';

export default function DashboardPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const displayName = user?.fullName?.trim() || `${user?.firstName || ''} ${user?.lastName || ''}`.trim();

  return (
    <div className="min-h-screen auth-bg">
      <header className="border-b border-[rgba(255,255,255,0.06)] bg-[rgba(10,10,10,0.8)] backdrop-blur-xl sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <Logo size="sm" />
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-2.5">
              <NameAvatar
                name={displayName}
                className="w-7 h-7 rounded-full bg-[#1a1a1a] border border-[rgba(255,255,255,0.1)] flex items-center justify-center text-[10px] font-medium text-[#a1a1aa]"
                title={displayName}
              />
              <span className="text-sm text-[#a1a1aa]">{user?.email}</span>
            </div>
            <Button variant="ghost" onClick={handleLogout}>
              Sign out
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-10">
        <div className="mb-8">
          <p className="text-[11px] font-mono uppercase tracking-widest text-[#52525b] mb-2">
            Workspace
          </p>
          <h1 className="text-2xl font-semibold tracking-[-0.02em]">
            Good {getGreeting()}, {user?.firstName}
          </h1>
        </div>

        <div className="grid gap-4 sm:grid-cols-3 mb-6">
          {[
            { label: 'Plan', value: 'Pro Trial', sub: '12 days remaining' },
            { label: 'Team members', value: '1', sub: 'Invite your team' },
            { label: 'Status', value: user?.isEmailVerified ? 'Active' : 'Pending', sub: user?.isEmailVerified ? 'All systems go' : 'Verify your email' },
          ].map((card) => (
            <div
              key={card.label}
              className="rounded-xl border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.02)] p-5"
            >
              <p className="text-[11px] font-mono uppercase tracking-widest text-[#52525b]">
                {card.label}
              </p>
              <p className="text-xl font-semibold mt-1.5 tracking-tight">{card.value}</p>
              <p className="text-xs text-[#71717a] mt-1">{card.sub}</p>
            </div>
          ))}
        </div>

        <div className="auth-card rounded-2xl p-6">
          <div className="flex items-center gap-4">
            <NameAvatar
              name={displayName}
              className="w-14 h-14 rounded-xl bg-gradient-to-br from-[#e11d48] to-[#9f1239] flex items-center justify-center text-lg font-semibold text-white"
              title={displayName}
            />
            <div>
              <p className="font-medium text-[#fafafa]">
                {user?.firstName} {user?.lastName}
              </p>
              <p className="text-sm text-[#71717a] mt-0.5">{user?.email}</p>
              <div className="flex gap-2 mt-2.5">
                <span className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.08)] text-[#a1a1aa] uppercase tracking-wide">
                  {user?.authProvider === 'google' ? 'Google SSO' : 'Email'}
                </span>
                {user?.isEmailVerified && (
                  <span className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-[rgba(34,197,94,0.1)] border border-[rgba(34,197,94,0.2)] text-[#4ade80] uppercase tracking-wide">
                    Verified
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'morning';
  if (hour < 17) return 'afternoon';
  return 'evening';
}
