import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams, Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { VIDEO_TYPES, SOCIAL_PLATFORMS } from '../../lib/eventsData';
import { api, ApiError, isSessionExpiredError } from '../../lib/api';
import { SocialPlatformIcons } from '../../components/mediaflow/SocialPlatformIcon';

function VideoRow({ video, onEdit, onDelete }) {
  return (
    <div className="p-5 md:p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 hover:bg-surface-container-low transition-colors group border-b border-outline-variant last:border-0">
      <div className="flex items-center gap-4 flex-1 min-w-0">
        <div className="relative w-32 aspect-video bg-black rounded-xl overflow-hidden shrink-0 group-hover:ring-2 ring-on-surface ring-offset-2 ring-offset-surface-container-lowest transition-all">
          <img src={video.thumbnail} alt="" className="w-full h-full object-cover" />
          {video.videoUrl && (
            <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <span className="material-symbols-outlined text-white text-3xl">play_arrow</span>
            </div>
          )}
        </div>
        <div className="min-w-0">
          <h3 className="mf-text-card-title truncate">{video.title}</h3>
          <div className="flex flex-wrap items-center gap-3 mt-1.5">
            <span className="mf-text-meta px-2 py-0.5 rounded-md border border-outline-variant">
              {video.type}
            </span>
            {video.videoUrl && (
              <a
                href={video.videoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mf-text-meta flex items-center gap-1 hover:text-primary"
                onClick={(e) => e.stopPropagation()}
              >
                <span className="material-symbols-outlined text-sm">link</span>
                View link
              </a>
            )}
          </div>
          {video.description && (
            <p className="mf-text-meta mt-2 line-clamp-2">{video.description}</p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-4 md:gap-6 w-full md:w-auto pl-0 md:pl-4">
        <SocialPlatformIcons platforms={video.platforms} />

        <div className="flex items-center gap-2 pl-4 border-l border-outline-variant">
          <div className="w-8 h-8 rounded-lg bg-on-surface text-surface-container-lowest flex items-center justify-center text-[10px] font-bold">
            {video.uploadedByName?.slice(0, 2).toUpperCase() || 'U'}
          </div>
          <div className="hidden xl:block">
            <p className="mf-text-meta uppercase tracking-wider">Uploaded by</p>
            <p className="text-sm font-semibold text-on-surface">{video.uploadedByName}</p>
          </div>
        </div>

        {video.canEdit && (
          <div className="flex items-center gap-1 ml-auto md:ml-0">
            <button
              type="button"
              onClick={() => onEdit(video)}
              className="mf-icon-btn"
              aria-label="Edit video"
            >
              <span className="material-symbols-outlined">edit</span>
            </button>
            <button
              type="button"
              onClick={() => onDelete(video)}
              className="mf-icon-btn hover:!bg-error/10 hover:!text-error"
              aria-label="Delete video"
            >
              <span className="material-symbols-outlined">delete</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function VideoFormModal({ open, video, onClose, onSave, saving }) {
  const [title, setTitle] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [type, setType] = useState(VIDEO_TYPES[0]);
  const [description, setDescription] = useState('');
  const [platforms, setPlatforms] = useState([]);

  useEffect(() => {
    if (!open) return;
    if (video) {
      setTitle(video.title);
      setVideoUrl(video.videoUrl || '');
      setType(video.type);
      setDescription(video.description || '');
      setPlatforms(video.platforms || []);
    } else {
      setTitle('');
      setVideoUrl('');
      setType(VIDEO_TYPES[0]);
      setDescription('');
      setPlatforms([]);
    }
  }, [open, video]);

  if (!open) return null;

  const togglePlatform = (name) => {
    setPlatforms((prev) =>
      prev.includes(name) ? prev.filter((p) => p !== name) : [...prev, name]
    );
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({ title: title.trim(), videoUrl: videoUrl.trim(), type, description: description.trim(), platforms });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button type="button" className="absolute inset-0 bg-black/40" onClick={onClose} aria-label="Close" />
      <div className="relative z-10 w-full max-w-lg mf-card p-6 max-h-[90vh] overflow-y-auto">
        <div className="mb-4 flex items-center justify-between border-b border-outline-variant pb-4">
          <h2 className="mf-text-card-title">{video ? 'Edit Video' : 'Add Video Content'}</h2>
          <button type="button" className="mf-icon-btn" onClick={onClose}>
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="mf-field-label" htmlFor="edit-video-title">Video name</label>
            <input
              id="edit-video-title"
              type="text"
              className="mf-field"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="mf-field-label" htmlFor="edit-video-url">Video link (URL)</label>
            <input
              id="edit-video-url"
              type="url"
              className="mf-field"
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
              placeholder="https://..."
            />
          </div>
          <div>
            <label className="mf-field-label" htmlFor="edit-video-type">Video type</label>
            <select
              id="edit-video-type"
              className="mf-field mf-field-select"
              value={type}
              onChange={(e) => setType(e.target.value)}
            >
              {VIDEO_TYPES.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
          <div>
            <span className="mf-field-label">Social platforms</span>
            <div className="grid grid-cols-2 gap-3 mt-2">
              {SOCIAL_PLATFORMS.map((name) => (
                <label key={name} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    className="mf-checkbox"
                    checked={platforms.includes(name)}
                    onChange={() => togglePlatform(name)}
                  />
                  <span className="text-sm text-on-surface">{name}</span>
                </label>
              ))}
            </div>
          </div>
          <div>
            <label className="mf-field-label" htmlFor="edit-video-desc">Description</label>
            <textarea
              id="edit-video-desc"
              className="mf-field mf-field-textarea"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          <div className="flex justify-end gap-3">
            <button type="button" className="mf-btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" disabled={saving} className="mf-btn-primary">
              {saving ? 'Saving...' : video ? 'Save Changes' : 'Add Video'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function AddVideoForm({ onAdd }) {
  const [platforms, setPlatforms] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const togglePlatform = (name) => {
    setPlatforms((prev) =>
      prev.includes(name) ? prev.filter((p) => p !== name) : [...prev, name]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    const title = formData.get('title')?.toString().trim();
    if (!title) return;

    setSubmitting(true);
    setError('');
    try {
      await onAdd({
        title,
        videoUrl: formData.get('videoUrl')?.toString().trim() || '',
        type: formData.get('type')?.toString() || VIDEO_TYPES[0],
        description: formData.get('description')?.toString().trim() || '',
        platforms,
      });
      setSuccess(true);
      form.reset();
      setPlatforms([]);
      setTimeout(() => setSuccess(false), 2000);
    } catch (err) {
      if (isSessionExpiredError(err)) return;
      setError(err instanceof ApiError ? err.message : 'Failed to add video');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mf-card p-6 sticky top-24">
      <div className="flex items-center gap-2 mb-6 pb-4 border-b border-outline-variant">
        <span className="material-symbols-outlined text-on-surface">video_call</span>
        <h2 className="mf-text-card-title">Add Video Content</h2>
      </div>

      {error && (
        <div className="mb-4 rounded-xl border border-error/30 bg-error/5 px-3 py-2 text-sm text-error">
          {error}
        </div>
      )}

      <form className="space-y-5" onSubmit={handleSubmit}>
        <div>
          <label className="mf-field-label" htmlFor="video-title">Video name</label>
          <input id="video-title" name="title" type="text" className="mf-field" placeholder="e.g. Keynote Highlights" required />
        </div>
        <div>
          <label className="mf-field-label" htmlFor="video-url">Video link (URL)</label>
          <input id="video-url" name="videoUrl" type="url" className="mf-field" placeholder="https://..." />
        </div>
        <div>
          <label className="mf-field-label" htmlFor="video-type">Video type</label>
          <select id="video-type" name="type" className="mf-field mf-field-select" defaultValue={VIDEO_TYPES[0]}>
            {VIDEO_TYPES.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>
        <div>
          <span className="mf-field-label">Social platforms</span>
          <div className="grid grid-cols-2 gap-3 mt-2">
            {SOCIAL_PLATFORMS.map((name) => (
              <label key={name} className="flex items-center gap-2 cursor-pointer group">
                <input type="checkbox" className="mf-checkbox" checked={platforms.includes(name)} onChange={() => togglePlatform(name)} />
                <span className="text-sm text-on-surface">{name}</span>
              </label>
            ))}
          </div>
        </div>
        <div>
          <label className="mf-field-label" htmlFor="video-desc">Description (optional)</label>
          <textarea id="video-desc" name="description" className="mf-field mf-field-textarea" rows={3} placeholder="Key highlights or SEO tags..." />
        </div>
        <button
          type="submit"
          disabled={submitting || success}
          className={`w-full py-3 rounded-xl text-sm font-semibold transition-all active:scale-[0.98] ${
            success ? 'bg-green-600 text-white' : 'bg-on-surface text-surface-container-lowest hover:opacity-90'
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
  const { accessToken } = useAuth();
  const [event, setEvent] = useState(null);
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingVideo, setEditingVideo] = useState(null);
  const [deletingVideo, setDeletingVideo] = useState(null);
  const [saving, setSaving] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [eventData, videosData] = await Promise.all([
        api.getEvent(eventId, accessToken),
        api.getEventVideos(eventId, accessToken),
      ]);
      setEvent(eventData.event);
      setVideos(videosData.videos);
    } catch (err) {
      if (isSessionExpiredError(err)) return;
      setError(err instanceof ApiError ? err.message : 'Failed to load event');
    } finally {
      setLoading(false);
    }
  }, [eventId, accessToken]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleAddVideo = async (payload) => {
    const data = await api.createVideo(eventId, payload, accessToken);
    setVideos((prev) => [data.video, ...prev]);
  };

  const handleSaveEdit = async (payload) => {
    if (!editingVideo) return;
    setSaving(true);
    try {
      const data = await api.updateVideo(editingVideo.id, payload, accessToken);
      setVideos((prev) => prev.map((v) => (v.id === editingVideo.id ? data.video : v)));
      setEditingVideo(null);
    } finally {
      setSaving(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingVideo) return;
    setSaving(true);
    try {
      await api.deleteVideo(deletingVideo.id, accessToken);
      setVideos((prev) => prev.filter((v) => v.id !== deletingVideo.id));
      setDeletingVideo(null);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="mf-text-body py-12 text-center">Loading event...</div>;
  }

  if (error || !event) {
    return <Navigate to="/app/events" replace />;
  }

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
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="mf-text-section truncate">{event.title}</h1>
              {event.isNew && (
                <span className="inline-flex items-center gap-1 rounded-full bg-primary px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-on-primary">
                  New
                </span>
              )}
            </div>
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
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        <div className="lg:col-span-4 xl:col-span-3">
          <AddVideoForm onAdd={handleAddVideo} />
        </div>

        <div className="lg:col-span-8 xl:col-span-9">
          <div className="mf-card overflow-hidden">
            <div className="px-6 py-4 bg-surface-container-low border-b border-outline-variant flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-on-surface">cloud_done</span>
                <h2 className="mf-text-card-title">Uploaded Videos</h2>
              </div>
              <span className="mf-text-meta whitespace-nowrap">{videos.length} Videos</span>
            </div>

            {videos.length === 0 ? (
              <div className="px-6 py-12 text-center mf-text-body">
                No videos uploaded yet. Add the first video using the form.
              </div>
            ) : (
              <div>
                {videos.map((video) => (
                  <VideoRow
                    key={video.id}
                    video={video}
                    onEdit={setEditingVideo}
                    onDelete={setDeletingVideo}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <VideoFormModal
        open={Boolean(editingVideo)}
        video={editingVideo}
        onClose={() => setEditingVideo(null)}
        onSave={handleSaveEdit}
        saving={saving}
      />

      {deletingVideo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <button type="button" className="absolute inset-0 bg-black/40" onClick={() => setDeletingVideo(null)} aria-label="Close" />
          <div className="relative z-10 w-full max-w-md mf-card p-6">
            <h2 className="mf-text-card-title mb-2">Delete video?</h2>
            <p className="mf-text-body">
              Remove <span className="font-semibold">{deletingVideo.title}</span>? This cannot be undone.
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <button type="button" className="mf-btn-secondary" onClick={() => setDeletingVideo(null)}>Cancel</button>
              <button type="button" className="mf-btn-primary !bg-error" disabled={saving} onClick={handleConfirmDelete}>
                {saving ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
