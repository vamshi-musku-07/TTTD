import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useRole } from '../../context/RoleContext';
import { api, ApiError, isSessionExpiredError } from '../../lib/api';
import { COMPLAINT_CATEGORIES } from '../../lib/complaintsData';

const CATEGORY_STYLES = {
  'General Suggestion': 'text-amber-800 bg-amber-100',
  Other: 'text-on-surface bg-surface-container-high',
  default: 'text-primary bg-primary/10',
};

function getComplaintActiveRole(user) {
  if (user?.role === 'super_admin') return 'super_admin';
  if (user?.role === 'admin') return 'admin';
  if (user?.role === 'photographer') return 'photographer';
  return 'editor';
}

function StatusBadge({ status }) {
  if (status === 'open') {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-3 py-1 mf-text-label-caps text-red-700">
        <span className="h-1.5 w-1.5 rounded-full bg-error" />
        Open
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-secondary-container/20 px-3 py-1 mf-text-label-caps text-secondary">
      <span className="h-1.5 w-1.5 rounded-full bg-secondary" />
      Resolved
    </span>
  );
}

function ComplaintCard({ complaint, isAdmin, onResolve, resolving }) {
  const categoryClass = CATEGORY_STYLES[complaint.category] || CATEGORY_STYLES.default;

  return (
    <article
      className={`mf-card overflow-hidden transition-colors hover:bg-surface-container-low/50 ${
        complaint.isSuggestion ? 'opacity-80' : ''
      }`}
    >
      <div className="p-6">
        <div className="mb-4 flex items-start justify-between gap-4">
          <div className="space-y-1">
            <span className={`inline-block rounded px-2 py-0.5 mf-text-label-caps uppercase ${categoryClass}`}>
              {complaint.category}
            </span>
            {complaint.category === 'Other' && complaint.subject && (
              <p className="mf-text-card-title">{complaint.subject}</p>
            )}
            <p className="mf-text-meta">
              Submitted {complaint.submittedAt} • Ticket ID: {complaint.id}
            </p>
            {isAdmin && complaint.submittedBy && (
              <p className="mf-text-meta">
                From {complaint.submittedBy} ({complaint.submittedByRole})
              </p>
            )}
            <p className="mf-text-meta">
              Sent to {complaint.assignedTo} ({complaint.assignedToRole})
            </p>
          </div>
          <StatusBadge status={complaint.status} />
        </div>

        <p
          className={`mb-4 text-on-surface leading-relaxed ${
            complaint.isSuggestion ? 'mf-text-body italic' : 'text-[16px]'
          }`}
        >
          {complaint.isSuggestion ? `"${complaint.description}"` : complaint.description}
        </p>

        {complaint.awaitingReview && (
          <div className="flex items-center gap-2 rounded border-l-4 border-outline-variant bg-surface-container p-3 text-on-surface-variant">
            <span className="material-symbols-outlined text-sm">hourglass_empty</span>
            <span className="mf-text-body italic">Awaiting admin review...</span>
          </div>
        )}

        {complaint.adminReply && (
          <div className="space-y-2 rounded border border-outline-variant bg-surface p-4">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-[10px] text-on-primary">
                  A
                </div>
                <span className="mf-text-label-caps text-on-surface">{complaint.adminReply.author}</span>
              </div>
              <span className="text-[11px] uppercase text-on-surface-variant">{complaint.adminReply.date}</span>
            </div>
            <p className="mf-text-body leading-relaxed">&ldquo;{complaint.adminReply.message}&rdquo;</p>
          </div>
        )}

        {isAdmin && complaint.status === 'open' && (
          <div className="mt-4 flex justify-end">
            <button
              type="button"
              onClick={() => onResolve(complaint.id)}
              disabled={resolving === complaint.id}
              className="mf-btn-primary !h-9 !px-4 !text-xs font-bold uppercase tracking-wide"
            >
              {resolving === complaint.id ? 'Resolving...' : 'Mark Resolved'}
            </button>
          </div>
        )}
      </div>
    </article>
  );
}

export default function ComplaintsPage() {
  const { accessToken, user } = useAuth();
  const { isAdmin, isPhotographer, isEditor } = useRole();
  const activeRole = getComplaintActiveRole(user);
  const canSubmit = !isAdmin && (isEditor || isPhotographer);

  const [complaints, setComplaints] = useState([]);
  const [recipients, setRecipients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [filter, setFilter] = useState('all');
  const [category, setCategory] = useState(COMPLAINT_CATEGORIES[0]);
  const [otherDetails, setOtherDetails] = useState('');
  const [assignedToId, setAssignedToId] = useState('');
  const [description, setDescription] = useState('');
  const [submitState, setSubmitState] = useState('idle');
  const [submitError, setSubmitError] = useState('');
  const [resolving, setResolving] = useState(null);

  const openCount = useMemo(() => complaints.filter((c) => c.status === 'open').length, [complaints]);

  const visibleComplaints = useMemo(() => {
    if (filter === 'open') return complaints.filter((c) => c.status === 'open');
    return complaints;
  }, [complaints, filter]);

  const fetchData = async () => {
    setLoading(true);
    setLoadError('');
    try {
      const [complaintsData, recipientsData] = await Promise.all([
        api.getComplaints(accessToken, activeRole),
        canSubmit ? api.getComplaintRecipients(accessToken) : Promise.resolve({ recipients: [] }),
      ]);
      setComplaints(complaintsData.complaints);
      setRecipients(recipientsData.recipients);
      if (recipientsData.recipients.length > 0 && !assignedToId) {
        setAssignedToId(recipientsData.recipients[0].id);
      }
    } catch (err) {
      if (isSessionExpiredError(err)) return;
      setLoadError(err instanceof ApiError ? err.message : 'Failed to load complaints');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [accessToken, activeRole, canSubmit]);

  const isOtherCategory = category === 'Other';

  const handleClear = () => {
    setCategory(COMPLAINT_CATEGORIES[0]);
    setOtherDetails('');
    setDescription('');
    setSubmitError('');
    if (recipients.length > 0) setAssignedToId(recipients[0].id);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const needsOtherDetails = isOtherCategory && !otherDetails.trim();
    if (needsOtherDetails || !description.trim() || !assignedToId || submitState !== 'idle') return;

    setSubmitState('submitting');
    setSubmitError('');

    try {
      const data = await api.createComplaint(
        {
          category,
          description: description.trim(),
          ...(isOtherCategory ? { otherDetails: otherDetails.trim() } : {}),
          assignedToId,
          submitterRole: isPhotographer ? 'photographer' : 'editor',
        },
        accessToken
      );
      setComplaints((prev) => [data.complaint, ...prev]);
      setSubmitState('success');
      setTimeout(() => {
        setSubmitState('idle');
        handleClear();
      }, 1500);
    } catch (err) {
      setSubmitState('idle');
      if (isSessionExpiredError(err)) return;
      setSubmitError(err instanceof ApiError ? err.message : 'Failed to submit complaint');
    }
  };

  const handleResolve = async (complaintId) => {
    setResolving(complaintId);
    try {
      const data = await api.resolveComplaint(complaintId, {}, accessToken, activeRole);
      setComplaints((prev) =>
        prev.map((c) => (c.id === complaintId ? data.complaint : c))
      );
    } catch (err) {
      if (isSessionExpiredError(err)) return;
      setLoadError(err instanceof ApiError ? err.message : 'Failed to resolve complaint');
    } finally {
      setResolving(null);
    }
  };

  const submitLabel =
    submitState === 'submitting'
      ? 'Submitting...'
      : submitState === 'success'
        ? 'Submitted Successfully!'
        : 'Submit Ticket';

  return (
    <div className="mx-auto max-w-9xl">
      <div className="mb-10">
        <h1 className="mf-text-display text-[32px] leading-tight">
          {isAdmin ? 'Complaint Management' : 'Complaints & Suggestions'}
        </h1>
        <p className="mf-text-body mt-2 text-[16px]">
          {isAdmin
            ? 'Review and resolve complaints submitted by editors and cameramen across MediaFlow.'
            : 'Submit feedback or report issues and send them directly to an admin or super admin.'}
        </p>
      </div>

      <div className="grid grid-cols-12 gap-gutter">
        {canSubmit && (
          <section className="col-span-12 mf-card p-6 lg:col-span-5">
            <div className="mb-6 flex items-center gap-2 border-b border-outline-variant pb-4">
              <span className="material-symbols-outlined text-primary">edit_note</span>
              <h2 className="mf-text-label-caps text-primary">Submit a Complaint</h2>
            </div>

            {submitError && (
              <div className="mb-4 rounded-xl border border-error/30 bg-error/5 px-4 py-3 text-sm text-error">
                {submitError}
              </div>
            )}

            <form className="space-y-6" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <label htmlFor="complaint-recipient" className="mf-text-label-caps">
                  Send to
                </label>
                <select
                  id="complaint-recipient"
                  value={assignedToId}
                  onChange={(e) => setAssignedToId(e.target.value)}
                  className="w-full rounded border border-outline-variant bg-surface p-3 text-on-surface transition-colors focus:border-primary focus:ring-0"
                  required
                >
                  {recipients.length === 0 ? (
                    <option value="">No admins available</option>
                  ) : (
                    recipients.map((recipient) => (
                      <option key={recipient.id} value={recipient.id}>
                        {recipient.name} — {recipient.label}
                      </option>
                    ))
                  )}
                </select>
              </div>

              <div className="space-y-2">
                <label htmlFor="complaint-category" className="mf-text-label-caps">
                  Category
                </label>
                <select
                  id="complaint-category"
                  value={category}
                  onChange={(e) => {
                    setCategory(e.target.value);
                    if (e.target.value !== 'Other') setOtherDetails('');
                  }}
                  className="w-full rounded border border-outline-variant bg-surface p-3 text-on-surface transition-colors focus:border-primary focus:ring-0"
                >
                  {COMPLAINT_CATEGORIES.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </div>

              {isOtherCategory && (
                <div className="space-y-2">
                  <label htmlFor="complaint-other-details" className="mf-text-label-caps">
                    Other issue details
                  </label>
                  <input
                    id="complaint-other-details"
                    type="text"
                    value={otherDetails}
                    onChange={(e) => setOtherDetails(e.target.value)}
                    placeholder="Briefly describe the type of issue..."
                    className="w-full rounded border border-outline-variant bg-surface p-3 text-on-surface transition-colors focus:border-primary focus:ring-0"
                    required
                  />
                </div>
              )}

              <div className="space-y-2">
                <label htmlFor="complaint-description" className="mf-text-label-caps">
                  Description
                </label>
                <textarea
                  id="complaint-description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Please provide detailed information..."
                  rows={5}
                  className="w-full resize-none rounded border border-outline-variant bg-surface p-3 text-on-surface transition-colors focus:border-primary focus:ring-0"
                />
              </div>

              <div className="flex items-center gap-4">
                <button
                  type="submit"
                  disabled={
                    submitState !== 'idle' ||
                    !description.trim() ||
                    !assignedToId ||
                    (isOtherCategory && !otherDetails.trim())
                  }
                  className={`mf-btn-primary flex-1 justify-center ${
                    submitState === 'success' ? 'bg-secondary' : ''
                  } ${submitState === 'submitting' ? 'opacity-50' : ''}`}
                >
                  {submitLabel}
                </button>
                <button
                  type="button"
                  onClick={handleClear}
                  className="mf-btn-secondary px-6"
                  disabled={submitState === 'submitting'}
                >
                  Clear
                </button>
              </div>
            </form>
          </section>
        )}

        <section className={`col-span-12 space-y-6 ${canSubmit ? 'lg:col-span-7' : ''}`}>
          <div className="flex items-center justify-between rounded border border-outline-variant bg-surface-container-highest/30 p-4">
            <h2 className="mf-text-card-title">
              {isAdmin ? 'Incoming Complaints' : 'My Complaints'}
            </h2>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setFilter('all')}
                className={`rounded-full px-3 py-1 mf-text-label-caps transition-colors ${
                  filter === 'all'
                    ? 'bg-primary/10 text-primary'
                    : 'text-on-surface-variant hover:bg-surface-container-high'
                }`}
              >
                All ({complaints.length})
              </button>
              <button
                type="button"
                onClick={() => setFilter('open')}
                className={`rounded-full px-3 py-1 mf-text-label-caps transition-colors ${
                  filter === 'open'
                    ? 'bg-primary/10 text-primary'
                    : 'text-on-surface-variant hover:bg-surface-container-high'
                }`}
              >
                Open ({openCount})
              </button>
            </div>
          </div>

          {loading ? (
            <div className="mf-card p-8 text-center mf-text-body">Loading complaints...</div>
          ) : loadError ? (
            <div className="mf-card p-8 text-center">
              <p className="text-error mb-4">{loadError}</p>
              <button type="button" className="mf-btn-secondary" onClick={fetchData}>
                Retry
              </button>
            </div>
          ) : visibleComplaints.length === 0 ? (
            <div className="mf-card p-8 text-center">
              <span className="material-symbols-outlined mb-3 text-[32px] text-on-surface-variant">
                inbox
              </span>
              <p className="mf-text-body">No complaints match this filter.</p>
            </div>
          ) : (
            visibleComplaints.map((complaint) => (
              <ComplaintCard
                key={complaint.id}
                complaint={complaint}
                isAdmin={isAdmin}
                onResolve={handleResolve}
                resolving={resolving}
              />
            ))
          )}
        </section>
      </div>
    </div>
  );
}
