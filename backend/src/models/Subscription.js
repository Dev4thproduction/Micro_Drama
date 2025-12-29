const mongoose = require('mongoose');

const subscriptionSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  plan: { type: String, enum: ['free', 'basic', 'premium'], required: true },
  status: {
    type: String,
    enum: ['active', 'canceled', 'trial', 'expired', 'past_due'],
    default: 'active'
  },
  startDate: { type: Date, default: Date.now },
  renewsAt: { type: Date },
  // Optional fields for future payment integration
  stripeSubscriptionId: { type: String },
  stripeCustomerId: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Subscription', subscriptionSchema);