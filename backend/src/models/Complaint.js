const mongoose = require('mongoose');

const complaintSchema = new mongoose.Schema(
  {
    ticketId: { type: String, required: true, unique: true },
    category: { type: String, required: true, trim: true },
    subject: { type: String, required: true, trim: true, maxlength: 200 },
    description: { type: String, required: true, trim: true, maxlength: 5000 },
    status: { type: String, enum: ['open', 'resolved'], default: 'open' },
    submitterRole: {
      type: String,
      enum: ['editor', 'photographer'],
      required: true,
    },
    submittedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    adminReply: {
      message: { type: String, trim: true },
      author: { type: String, trim: true },
      repliedAt: { type: Date },
    },
    resolvedAt: { type: Date },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Complaint', complaintSchema);
