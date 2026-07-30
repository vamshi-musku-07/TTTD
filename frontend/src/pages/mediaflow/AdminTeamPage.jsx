import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useRole } from '../../context/RoleContext';
import { api, ApiError, isSessionExpiredError } from '../../lib/api';
import { TEAM_ROLE_STYLES, getRoleLabel } from '../../lib/teamData';
import { NameAvatar } from '../../components/NameAvatar';
import { ProfileImageField } from '../../components/ProfileImageField';

const fieldClass =
  'w-full rounded-xl border border-outline-variant bg-surface-bright px-4 py-3 text-sm text-on-surface outline-none transition-colors focus:border-primary';

function MemberAvatar({ member }) {
  return (
    <NameAvatar
      name={member.name}
      avatar={member.avatar}
      className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-container text-lg font-bold text-on-primary border-2 border-surface-container-lowest shadow-sm"
      title={member.name}
    />
  );
}

function RoleBadge({ role }) {
  return (
    <span
      className={`inline-flex rounded-full border px-3 py-1 text-[10px] font-bold uppercase tracking-wide ${TEAM_ROLE_STYLES[role] || TEAM_ROLE_STYLES.editor}`}
    >
      {getRoleLabel(role)}
    </span>
  );
}

function StatItem({ label, value, icon }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-xl border border-outline-variant/60 bg-surface-container-low/50 px-4 py-3.5">
      <div className="flex min-w-0 items-center gap-2.5">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-surface-bright text-on-surface-variant">
          <span className="material-symbols-outlined text-[18px]">{icon}</span>
        </span>
        <span className="mf-text-body text-sm text-on-surface-variant">{label}</span>
      </div>
      <p className="shrink-0 text-lg font-semibold tabular-nums text-on-surface">{value}</p>
    </div>
  );
}

function TeamMemberCard({ member, canManage, onEdit, onRemove }) {
  const isEditor = member.role === 'editor';
  const stats = isEditor
    ? [
        { label: 'Events edited', value: member.eventsEdited, icon: 'movie_edit' },
        { label: 'Videos uploaded', value: member.videosUploaded, icon: 'upload' },
      ]
    : [{ label: 'Events managed', value: member.eventsManaged ?? 0, icon: 'dashboard' }];

  return (
    <article className="mf-card flex flex-col overflow-hidden transition-colors hover:bg-surface-container-low/40">
      <div className="border-b border-outline-variant bg-surface-container-low px-6 py-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex min-w-0 items-center gap-4">
            <MemberAvatar member={member} />
            <div className="min-w-0">
              <h3 className="mf-text-card-title truncate">{member.name}</h3>
              <p className="mf-text-body mt-0.5">{member.title}</p>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <RoleBadge role={member.role} />
                <span className="mf-text-meta">Joined {member.joinedAt}</span>
              </div>
            </div>
          </div>
          <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-green-100 px-2.5 py-1 text-[10px] font-bold uppercase text-green-800">
            <span className="h-1.5 w-1.5 rounded-full bg-green-600" />
            {member.status}
          </span>
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-6 p-6">
        <div className="rounded-xl border border-outline-variant/60 bg-surface-container-low/40 px-4 py-3.5">
          <p className="mb-1 mf-text-label-caps text-[10px] text-on-surface-variant">Email</p>
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="material-symbols-outlined shrink-0 text-[18px] text-on-surface-variant">mail</span>
            <span className="truncate text-sm font-medium text-on-surface">{member.email}</span>
          </div>
        </div>

        <div className="space-y-3">
          <p className="mf-text-label-caps text-[10px] text-on-surface-variant">Activity</p>
          <div className="space-y-2.5">
            {stats.map((stat) => (
              <StatItem key={stat.label} {...stat} />
            ))}
          </div>
        </div>

        {canManage && isEditor && (
          <div className="mt-auto flex gap-3 border-t border-outline-variant/60 pt-5">
            <button
              type="button"
              onClick={() => onEdit(member)}
              className="mf-btn-secondary flex-1 justify-center !h-10 !text-xs font-bold uppercase tracking-wide"
            >
              <span className="material-symbols-outlined text-[16px]">edit</span>
              Edit
            </button>
            <button
              type="button"
              onClick={() => onRemove(member)}
              className="mf-btn-secondary flex-1 justify-center !h-10 !text-xs font-bold uppercase tracking-wide !border-error/30 !text-error hover:!bg-error/10"
            >
              <span className="material-symbols-outlined text-[16px]">person_remove</span>
              Remove
            </button>
          </div>
        )}
      </div>
    </article>
  );
}

function MemberFormModal({ title, initial, onClose, onSave, error, saving }) {
  const [form, setForm] = useState({
    name: initial?.name || '',
    email: initial?.email || '',
    password: '',
    avatar: initial?.avatar || null,
  });
  const [fieldErrors, setFieldErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [imageError, setImageError] = useState('');

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (fieldErrors[field]) setFieldErrors((prev) => ({ ...prev, [field]: false }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const nextErrors = {};
    if (!form.name.trim()) nextErrors.name = true;
    if (!form.email.trim()) nextErrors.email = true;
    if (!initial && !form.password.trim()) nextErrors.password = true;

    setFieldErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    const payload = {
      name: form.name.trim(),
      email: form.email.trim(),
      avatar: form.avatar || '',
    };
    if (form.password.trim()) payload.password = form.password;

    onSave(payload);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button type="button" className="absolute inset-0 bg-black/40" onClick={onClose} aria-label="Close" />
      <div className="relative z-10 w-full max-w-lg mf-card max-h-[90vh] overflow-y-auto p-6 sm:p-8">
        <div className="mb-6 flex items-center justify-between gap-4 border-b border-outline-variant pb-4">
          <h2 className="mf-text-card-title">{title}</h2>
          <button type="button" className="mf-icon-btn" onClick={onClose} aria-label="Close dialog">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {error && (
          <div className="mb-4 rounded-xl border border-error/30 bg-error/5 px-4 py-3 text-sm text-error">
            {error}
          </div>
        )}
        {imageError && (
          <div className="mb-4 rounded-xl border border-error/30 bg-error/5 px-4 py-3 text-sm text-error">
            {imageError}
          </div>
        )}

        <form className="space-y-4" onSubmit={handleSubmit} noValidate>
          <div>
            <p className="mb-3 mf-text-label-caps">Profile photo</p>
            <ProfileImageField
              name={form.name}
              avatar={form.avatar}
              onChange={(value, errMsg) => {
                if (errMsg) {
                  setImageError(errMsg);
                  return;
                }
                setImageError('');
                handleChange('avatar', value);
              }}
              onClear={() => {
                handleChange('avatar', null);
                setImageError('');
              }}
            />
          </div>

          <div>
            <label htmlFor="member-name" className="mb-1 block mf-text-label-caps">
              Name
            </label>
            <input
              id="member-name"
              type="text"
              value={form.name}
              onChange={(e) => handleChange('name', e.target.value)}
              className={`${fieldClass} ${fieldErrors.name ? 'border-error' : ''}`}
            />
          </div>
          <div>
            <label htmlFor="member-email" className="mb-1 block mf-text-label-caps">
              Email
            </label>
            <input
              id="member-email"
              type="email"
              value={form.email}
              onChange={(e) => handleChange('email', e.target.value)}
              className={`${fieldClass} ${fieldErrors.email ? 'border-error' : ''}`}
            />
          </div>
          <div>
            <label htmlFor="member-password" className="mb-1 block mf-text-label-caps">
              {initial ? 'New password (optional)' : 'Password'}
            </label>
            <div className="relative">
              <input
                id="member-password"
                type={showPassword ? 'text' : 'password'}
                value={form.password}
                onChange={(e) => handleChange('password', e.target.value)}
                placeholder={initial ? 'Leave blank to keep current password' : 'Minimum 8 characters'}
                className={`${fieldClass} pr-12 ${fieldErrors.password ? 'border-error' : ''}`}
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface transition-colors"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                tabIndex={-1}
              >
                <span className="material-symbols-outlined text-[20px]">
                  {showPassword ? 'visibility_off' : 'visibility'}
                </span>
              </button>
            </div>
          </div>

          <p className="text-sm text-on-surface-variant">Role is fixed to Editor.</p>

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" className="mf-btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="mf-btn-primary" disabled={saving}>
              {saving ? 'Saving...' : initial ? 'Save Changes' : 'Add Editor'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function AdminTeamPage() {
  const { accessToken } = useAuth();
  const { isSuperAdmin } = useRole();
  const canManage = isSuperAdmin;

  const [team, setTeam] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [editingMember, setEditingMember] = useState(null);
  const [addingMember, setAddingMember] = useState(false);
  const [removingMember, setRemovingMember] = useState(null);
  const [modalError, setModalError] = useState('');
  const [saving, setSaving] = useState(false);

  const loadTeam = async () => {
    setLoading(true);
    setLoadError('');
    try {
      const data = await api.getTeamMembers(accessToken);
      setTeam(data.members);
    } catch (err) {
      if (isSessionExpiredError(err)) return;
      setLoadError(err instanceof ApiError ? err.message : 'Failed to load team');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTeam();
  }, [accessToken]);

  const stats = useMemo(
    () => ({
      total: team.length,
      editors: team.filter((m) => m.role === 'editor').length,
    }),
    [team]
  );

  const visibleTeam = useMemo(() => {
    if (filter === 'all') return team;
    return team.filter((member) => member.role === filter);
  }, [team, filter]);

  const handleCreate = async (payload) => {
    setSaving(true);
    setModalError('');
    try {
      const data = await api.createTeamMember(payload, accessToken);
      setTeam((prev) => [data.member, ...prev]);
      setAddingMember(false);
    } catch (err) {
      if (isSessionExpiredError(err)) return;
      setModalError(err instanceof ApiError ? err.message : 'Failed to add editor');
    } finally {
      setSaving(false);
    }
  };

  const handleUpdate = async (payload) => {
    if (!editingMember) return;
    setSaving(true);
    setModalError('');
    try {
      const data = await api.updateTeamMember(editingMember.id, payload, accessToken);
      setTeam((prev) => prev.map((member) => (member.id === editingMember.id ? data.member : member)));
      setEditingMember(null);
    } catch (err) {
      if (isSessionExpiredError(err)) return;
      setModalError(err instanceof ApiError ? err.message : 'Failed to update editor');
    } finally {
      setSaving(false);
    }
  };

  const handleRemove = async () => {
    if (!removingMember) return;
    setSaving(true);
    try {
      await api.deleteTeamMember(removingMember.id, accessToken);
      setTeam((prev) => prev.filter((member) => member.id !== removingMember.id));
      setRemovingMember(null);
    } catch (err) {
      if (isSessionExpiredError(err)) return;
      setLoadError(err instanceof ApiError ? err.message : 'Failed to remove editor');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-7xl space-y-gutter">
      <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <h1 className="mf-text-display text-[32px] leading-tight">Team</h1>
          <p className="mf-text-body mt-2 text-[16px]">
            {canManage
              ? 'Add and manage editors on MediaFlow.'
              : 'View editors and admins across MediaFlow.'}
          </p>
        </div>
        {canManage && (
          <button type="button" className="mf-btn-primary shrink-0" onClick={() => setAddingMember(true)}>
            <span className="material-symbols-outlined text-[20px]">person_add</span>
            Add Editor
          </button>
        )}
      </header>

      {loading ? (
        <div className="mf-text-body py-12 text-center">Loading team...</div>
      ) : loadError ? (
        <div className="mf-card p-8 text-center">
          <p className="text-error mb-4">{loadError}</p>
          <button type="button" className="mf-btn-secondary" onClick={loadTeam}>
            Retry
          </button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-4">
            {[
              { label: 'Total members', value: stats.total, icon: 'groups' },
              { label: 'Editors', value: stats.editors, icon: 'movie_edit' },
            ].map((stat) => (
              <div key={stat.label} className="mf-stat-card">
                <div className="mb-2 flex items-center justify-between">
                  <p className="mf-text-label-caps">{stat.label}</p>
                  <span className="material-symbols-outlined text-on-surface-variant">{stat.icon}</span>
                </div>
                <p className="text-[32px] font-bold tracking-tight text-on-surface">{stat.value}</p>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap gap-2">
            {[
              { id: 'all', label: 'All' },
              { id: 'editor', label: 'Editors' },
              { id: 'admin', label: 'Admins' },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setFilter(tab.id)}
                className={`rounded-full px-4 py-2 text-xs font-bold uppercase tracking-wide transition-colors ${
                  filter === tab.id
                    ? 'bg-on-surface text-surface-container-lowest'
                    : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {visibleTeam.length === 0 ? (
            <div className="mf-card p-12 text-center">
              <span className="material-symbols-outlined mb-3 text-[40px] text-on-surface-variant">group_off</span>
              <p className="mf-text-card-title">No team members in this filter</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-gutter md:grid-cols-2 xl:grid-cols-3">
              {visibleTeam.map((member) => (
                <TeamMemberCard
                  key={member.id}
                  member={member}
                  canManage={canManage}
                  onEdit={setEditingMember}
                  onRemove={setRemovingMember}
                />
              ))}
            </div>
          )}
        </>
      )}

      {addingMember && (
        <MemberFormModal
          title="Add Editor"
          onClose={() => {
            setAddingMember(false);
            setModalError('');
          }}
          onSave={handleCreate}
          error={modalError}
          saving={saving}
        />
      )}

      {editingMember && (
        <MemberFormModal
          title="Edit Editor"
          initial={editingMember}
          onClose={() => {
            setEditingMember(null);
            setModalError('');
          }}
          onSave={handleUpdate}
          error={modalError}
          saving={saving}
        />
      )}

      {removingMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <button
            type="button"
            className="absolute inset-0 bg-black/40"
            onClick={() => setRemovingMember(null)}
            aria-label="Close"
          />
          <div className="relative z-10 w-full max-w-md mf-card p-6">
            <div className="mb-4 flex items-center gap-3">
              <span className="material-symbols-outlined text-[28px] text-error">warning</span>
              <h2 className="mf-text-card-title">Remove editor?</h2>
            </div>
            <p className="mf-text-body">
              Remove <span className="font-semibold text-on-surface">{removingMember.name}</span> from the
              MediaFlow team? This cannot be undone.
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <button type="button" className="mf-btn-secondary" onClick={() => setRemovingMember(null)}>
                Cancel
              </button>
              <button
                type="button"
                className="mf-btn-primary !bg-error hover:!opacity-90"
                onClick={handleRemove}
                disabled={saving}
              >
                {saving ? 'Removing...' : 'Remove'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
