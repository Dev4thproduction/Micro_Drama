const mongoose = require('mongoose');

const subscriptionStatuses = ['trial', 'active', 'past_due', 'canceled', 'expired'];
const planTypes = ['free', 'basic', 'premium'];

const SubscriptionSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    plan: { type: String, enum: planTypes, default: 'free' },
    status: { type: String, enum: subscriptionStatuses, default: 'trial' },
    startDate: { type: Date, default: Date.now },
    endDate: { type: Date },
    renewsAt: { type: Date }
  },
  { timestamps: true }
);

SubscriptionSchema.index({ user: 1, status: 1 });
SubscriptionSchema.index({ user: 1, renewsAt: 1 });

module.exports = mongoose.model('Subscription', SubscriptionSchema);
