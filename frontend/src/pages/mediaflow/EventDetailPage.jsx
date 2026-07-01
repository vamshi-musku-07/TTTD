import { useState } from 'react';
import { useNavigate, useParams, Navigate } from 'react-router-dom';
import {
  getEventById,
  DEFAULT_VIDEOS,
  VIDEO_TYPES,
  SOCIAL_PLATFORMS,
} from '../../lib/eventsData';

function VideoRow({ video }) {
  return (
    <div className="p-5 md:p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 hover:bg-surface-container-low transition-colors group border-b border-outline-variant last:border-0">
      <div className="flex items-center gap-4 flex-1 min-w-0">
        <div className="relative w-32 aspect-video bg-black rounded-xl overflow-hidden shrink-0 group-hover:ring-2 ring-on-surface ring-offset-2 ring-offset-surface-container-lowest transition-all">
          <img src={video.thumbnail} alt="" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <span className="material-symbols-outlined text-white text-3xl">play_arrow</span>
          </div>
        </div>
        <div className="min-w-0">
          <h3 className="mf-text-card-title truncate">{video.title}</h3>
          <div className="flex flex-wrap items-center gap-3 mt-1.5">
            <span className="mf-text-meta px-2 py-0.5 rounded-md border border-outline-variant">
              {video.type}
            </span>
            <span className="mf-text-meta flex items-center gap-1">
              <span className="material-symbols-outlined text-sm">link</span>
              mediaflow.cloud/v/{video.slug}
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4 md:gap-6 w-full md:w-auto pl-0 md:pl-4">
        <div className="flex -space-x-2">
          {video.platforms.map((p) => (
            <div
              key={p}
              className="w-8 h-8 rounded-full bg-surface-container-lowest border border-outline-variant flex items-center justify-center text-[10px] font-bold text-on-surface shadow-sm"
              title={p}
            >
              {p}
            </div>
          ))}
        </div>

        <div className="flex items-center gap-2 pl-4 border-l border-outline-variant">
          <div className="w-8 h-8 rounded-lg bg-on-surface text-surface-container-lowest flex items-center justify-center text-[10px] font-bold">
            E1
          </div>
          <div className="hidden xl:block">
            <p className="mf-text-meta uppercase tracking-wider">Editor</p>
            <p className="text-sm font-semibold text-on-surface">{video.editor}</p>
          </div>
        </div>

        <div className="flex items-center gap-1 ml-auto md:ml-0">
          <button type="button" className="mf-icon-btn" aria-label="Edit video">
            <span className="material-symbols-outlined">edit</span>
          </button>
          <button type="button" className="mf-icon-btn hover:!bg-error/10 hover:!text-error" aria-label="Delete video">
            <span className="material-symbols-outlined">delete</span>
          </button>
        </div>
      </div>
    </div>
  );
}

function AddVideoForm({ eventSlug }) {
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [platforms, setPlatforms] = useState([]);

  const togglePlatform = (name) => {
    setPlatforms((prev) =>
      prev.includes(name) ? prev.filter((p) => p !== name) : [...prev, name]
    );
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const form = e.currentTarget;
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        form.reset();
        setPlatforms([]);
      }, 2000);
    }, 1200);
  };

  return (
    <div className="mf-card p-6 sticky top-24">
      <div className="flex items-center gap-2 mb-6 pb-4 border-b border-outline-variant">
        <span className="material-symbols-outlined text-on-surface">video_call</span>
        <h2 className="mf-text-card-title">Add Video Content</h2>
      </div>

      <form className="space-y-5" onSubmit={handleSubmit}>
        <div>
          <label className="mf-field-label" htmlFor="video-url">
            Video link (URL)
          </label>
          <input
            id="video-url"
            type="url"
            className="mf-field"
            placeholder={`https://mediaflow.cloud/assets/${eventSlug}/...`}
          />
        </div>

        <div>
          <label className="mf-field-label" htmlFor="video-type">
            Video type
          </label>
          <select id="video-type" className="mf-field mf-field-select" defaultValue={VIDEO_TYPES[0]}>
            {VIDEO_TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>

        <div>
          <span className="mf-field-label">Social platforms</span>
          <div className="grid grid-cols-2 gap-3 mt-2">
            {SOCIAL_PLATFORMS.map((name) => (
              <label key={name} className="flex items-center gap-2 cursor-pointer group">
                <input
                  type="checkbox"
                  className="mf-checkbox"
                  checked={platforms.includes(name)}
                  onChange={() => togglePlatform(name)}
                />
                <span className="text-sm text-on-surface group-hover:opacity-80">{name}</span>
              </label>
            ))}
          </div>
        </div>

        <div>
          <label className="mf-field-label" htmlFor="video-desc">
            Description (optional)
          </label>
          <textarea
            id="video-desc"
            className="mf-field mf-field-textarea"
            rows={3}
            placeholder="Key highlights or SEO tags..."
          />
        </div>

        <button
          type="submit"
          disabled={submitting || success}
          className={`w-full py-3 rounded-xl text-sm font-semibold transition-all active:scale-[0.98] ${
            success
              ? 'bg-green-600 text-white'
              : 'bg-on-surface text-surface-container-lowest hover:opacity-90'
          }`}
        >
          {submitting ? 'Uploading…' : success ? 'Added!' : 'Add Video to Event'}
        </button>
      </form>
    </div>
  );
}

export default function EventDetailPage() {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const event = getEventById(eventId);

  if (!event) {
    return <Navigate to="/app/events" replace />;
  }

  const videos = DEFAULT_VIDEOS;

  return (
    <div>
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
        <div className="flex items-start gap-4 min-w-0">
          <button
            type="button"
            onClick={() => navigate('/app/events')}
            className="mf-icon-btn !w-10 !h-10 !rounded-full border border-outline-variant shrink-0 mt-0.5"
            aria-label="Back to events"
          >
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
          <div className="min-w-0">
            <h1 className="mf-text-section truncate">{event.title}</h1>
            <div className="flex flex-wrap items-center gap-2 mt-2">
              <span className="mf-text-meta bg-surface-container text-on-surface px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wide">
                {event.badge}
              </span>
              <span className="mf-text-meta flex items-center gap-1">
                <span className="material-symbols-outlined text-sm">location_on</span>
                {event.location}
              </span>
            </div>
          </div>
        </div>
        <div className="flex gap-3 shrink-0">
          <button type="button" className="mf-btn-secondary">
            Export Report
          </button>
          <button type="button" className="mf-btn-primary">
            Publish Event
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        <div className="lg:col-span-4 xl:col-span-3">
          <AddVideoForm eventSlug={event.slug} />
        </div>

        <div className="lg:col-span-8 xl:col-span-9">
          <div className="mf-card overflow-hidden">
            <div className="px-6 py-4 bg-surface-container-low border-b border-outline-variant flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-on-surface">cloud_done</span>
                <h2 className="mf-text-card-title">Uploaded Videos</h2>
              </div>
              <div className="flex items-center gap-4">
                <div className="mf-search !max-w-none w-48 focus-within:w-56 transition-all">
                  <span className="material-symbols-outlined mf-search__icon">search</span>
                  <input type="text" placeholder="Search entries..." />
                </div>
                <span className="mf-text-meta whitespace-nowrap">{videos.length} Videos</span>
              </div>
            </div>

            <div>
              {videos.map((video) => (
                <VideoRow key={video.id} video={video} />
              ))}
            </div>

            <div className="px-6 py-4 border-t border-outline-variant flex items-center justify-between bg-surface-container-lowest">
              <span className="mf-text-meta">Showing {videos.length} of 24 assets</span>
              <div className="flex gap-2">
                <button type="button" className="mf-btn-secondary !h-9 !px-4 !text-sm opacity-50" disabled>
                  Previous
                </button>
                <button type="button" className="mf-btn-secondary !h-9 !px-4 !text-sm">
                  Next
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
