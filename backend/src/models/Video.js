const mongoose = require('mongoose');

const videoSchema = new mongoose.Schema(
  {
    event: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true, index: true },
    title: { type: String, required: true, trim: true, maxlength: 200 },
    slug: { type: String, trim: true },
    type: { type: String, enum: ['Shortform', 'Longform', 'Raw'], required: true },
    videoUrl: { type: String, trim: true, default: '' },
    description: { type: String, trim: true, default: '' },
    platforms: [{ type: String, trim: true }],
    thumbnail: {
      type: String,
      default: '/tea-time-telugu-logo.png',
    },
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Video', videoSchema);
