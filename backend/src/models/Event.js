const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 200 },
    slug: { type: String, required: true, unique: true, trim: true },
    subtitle: { type: String, trim: true, default: '' },
    image: {
      type: String,
      default: '/tea-time-telugu-logo.png',
    },
    scheduleDate: { type: Date, required: true },
    time: { type: String, trim: true, default: 'TBD' },
    location: { type: String, trim: true, maxlength: 200, default: '' },
    type: { type: String, required: true, trim: true },
    cameraman: { type: String, trim: true, default: 'Unassigned' },
    live: { type: Boolean, default: false },
    badge: { type: String, trim: true, default: 'New Event' },
    editorStatus: {
      type: String,
      enum: ['event-scheduled', 'editing-ongoing', 'footage-received', 'event-done'],
      default: 'event-scheduled',
    },
    cameramanStatus: {
      type: String,
      enum: ['cancelled', 'scheduled', 'started', 'footage-covered', 'delivered'],
      default: 'scheduled',
    },
    highlightAsNew: { type: Boolean, default: false },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

eventSchema.index({ title: 1 });
eventSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Event', eventSchema);
