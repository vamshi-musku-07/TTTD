import { useMemo, useState } from 'react';
import {
  COMPLAINT_CATEGORIES,
  COMPLAINT_STATS,
  INITIAL_COMPLAINTS,
} from '../../lib/complaintsData';

const CATEGORY_STYLES = {
  'General Suggestion': 'text-amber-800 bg-amber-100',
  default: 'text-primary bg-primary/10',
};

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

function ComplaintCard({ complaint }) {
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
            <h3 className="mf-text-card-title">{complaint.subject}</h3>
            <p className="mf-text-meta">
              Submitted {complaint.submittedAt} • Ticket ID: {complaint.id}
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
                  M
                </div>
                <span className="mf-text-label-caps text-on-surface">{complaint.adminReply.author}</span>
              </div>
              <span className="text-[11px] uppercase text-on-surface-variant">{complaint.adminReply.date}</span>
            </div>
            <p className="mf-text-body leading-relaxed">&ldquo;{complaint.adminReply.message}&rdquo;</p>
          </div>
        )}
      </div>
    </article>
  );
}

function generateTicketId() {
  return `MF-${Math.floor(9000 + Math.random() * 999)}`;
}

export default function ComplaintsPage() {
  const [complaints, setComplaints] = useState(INITIAL_COMPLAINTS);
  const [filter, setFilter] = useState('all');
  const [category, setCategory] = useState(COMPLAINT_CATEGORIES[0]);
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [submitState, setSubmitState] = useState('idle');

  const openCount = useMemo(() => complaints.filter((c) => c.status === 'open').length, [complaints]);

  const visibleComplaints = useMemo(() => {
    if (filter === 'open') return complaints.filter((c) => c.status === 'open');
    return complaints;
  }, [complaints, filter]);

  const handleClear = () => {
    setCategory(COMPLAINT_CATEGORIES[0]);
    setSubject('');
    setDescription('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!subject.trim() || !description.trim() || submitState !== 'idle') return;

    setSubmitState('submitting');

    setTimeout(() => {
      setSubmitState('success');

      const newComplaint = {
        id: generateTicketId(),
        category,
        subject: subject.trim(),
        description: description.trim(),
        submittedAt: 'Just now',
        status: 'open',
        awaitingReview: true,
        adminReply: null,
        isSuggestion: category === 'General Suggestion',
      };

      setComplaints((prev) => [newComplaint, ...prev]);

      setTimeout(() => {
        setSubmitState('idle');
        handleClear();
      }, 2000);
    }, 1000);
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
        <h1 className="mf-text-display text-[32px] leading-tight">Complaints & Suggestions</h1>
        <p className="mf-text-body mt-2 text-[16px]">
          Submit feedback or report issues regarding production workflows and studio facilities.
        </p>
      </div>

      <div className="grid grid-cols-12 gap-gutter">
        <section className="col-span-12 mf-card p-6 lg:col-span-5">
          <div className="mb-6 flex items-center gap-2 border-b border-outline-variant pb-4">
            <span className="material-symbols-outlined text-primary">edit_note</span>
            <h2 className="mf-text-label-caps text-primary">Submit a Complaint</h2>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <label htmlFor="complaint-category" className="mf-text-label-caps">
                Category
              </label>
              <select
                id="complaint-category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full rounded border border-outline-variant bg-surface p-3 text-on-surface transition-colors focus:border-primary focus:ring-0"
              >
                {COMPLAINT_CATEGORIES.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label htmlFor="complaint-subject" className="mf-text-label-caps">
                Subject
              </label>
              <input
                id="complaint-subject"
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Brief summary of the issue..."
                className="w-full rounded border border-outline-variant bg-surface p-3 text-on-surface transition-colors focus:border-primary focus:ring-0"
              />
            </div>

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
                disabled={submitState !== 'idle' || !subject.trim() || !description.trim()}
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

        <section className="col-span-12 space-y-6 lg:col-span-7">
          <div className="flex items-center justify-between rounded border border-outline-variant bg-surface-container-highest/30 p-4">
            <h2 className="mf-text-card-title">My Complaints</h2>
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

          {visibleComplaints.length === 0 ? (
            <div className="mf-card p-8 text-center">
              <span className="material-symbols-outlined mb-3 text-[32px] text-on-surface-variant">
                inbox
              </span>
              <p className="mf-text-body">No complaints match this filter.</p>
            </div>
          ) : (
            visibleComplaints.map((complaint) => (
              <ComplaintCard key={complaint.id} complaint={complaint} />
            ))
          )}
        </section>
      </div>

      <footer className="pb-12 pt-10">
        <div className="grid grid-cols-1 gap-gutter text-center md:grid-cols-3">
          {COMPLAINT_STATS.map((stat) => (
            <div key={stat.label} className="mf-card p-4">
              <span className="block text-[32px] font-bold tracking-tight text-primary">{stat.value}</span>
              <span className="mf-text-label-caps">{stat.label}</span>
            </div>
          ))}
        </div>
      </footer>
    </div>
  );
}
