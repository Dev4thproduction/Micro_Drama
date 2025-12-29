const Subscription = require('../models/Subscription');
const User = require('../models/User');
const { sendSuccess } = require('../utils/response');

// Get current user's subscription
const getMySubscription = async (req, res, next) => {
  try {
    const subscription = await Subscription.findOne({ user: req.user.id });
    return sendSuccess(res, subscription || null);
  } catch (err) {
    return next(err);
  }
};

// Subscribe (Mock Payment)
const subscribe = async (req, res, next) => {
  try {
    const { plan } = req.body; // 'basic' or 'premium'
    const userId = req.user.id;

    if (!['basic', 'premium'].includes(plan)) {
      return next({ status: 400, message: 'Invalid plan selected' });
    }

    let subscription = await Subscription.findOne({ user: userId });

    // Update existing if active
    if (subscription && subscription.status === 'active') {
        subscription.plan = plan;
        await subscription.save();
        return sendSuccess(res, { message: 'Plan updated', subscription });
    }

    // Create new if none
    if (!subscription) {
      subscription = new Subscription({ user: userId });
    }

    // Activate
    subscription.plan = plan;
    subscription.status = 'active';
    subscription.startDate = new Date();
    // Mock 30-day renewal
    const nextMonth = new Date();
    nextMonth.setDate(nextMonth.getDate() + 30);
    subscription.renewsAt = nextMonth;

    await subscription.save();

    return sendSuccess(res, { message: 'Subscribed successfully', subscription });
  } catch (err) {
    return next(err);
  }
};

// Cancel Subscription
const cancelSubscription = async (req, res, next) => {
  try {
    const subscription = await Subscription.findOne({ user: req.user.id });
    if (!subscription) return next({ status: 404, message: 'No active subscription found' });

    subscription.status = 'canceled';
    await subscription.save();

    return sendSuccess(res, { message: 'Subscription canceled', subscription });
  } catch (err) {
    return next(err);
  }
};

module.exports = {
  getMySubscription,
  subscribe,
  cancelSubscription
};