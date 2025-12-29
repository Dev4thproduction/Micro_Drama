const { Types } = require('mongoose');
const Series = require('../models/Series');
const Episode = require('../models/Episode');
const User = require('../models/User');
const Subscription = require('../models/Subscription');
const Season = require('../models/Season'); // Add if missing
const { sendSuccess } = require('../utils/response');
const bcrypt = require('bcrypt');
const { parsePagination, buildMeta } = require('../utils/pagination');

const listPendingSeries = async (req, res, next) => {
  try {
    const { limit, skip, sort, page } = parsePagination(req.query, {
      allowedSortFields: ['createdAt', 'title'],
      defaultSort: { createdAt: -1 }
    });
    const filter = { status: 'pending' };
    const [items, total] = await Promise.all([
      Series.find(filter)
        .sort(sort)
        .skip(skip || 0)
        .limit(limit || 0),
      Series.countDocuments(filter)
    ]);
    return sendSuccess(res, items, buildMeta(total, page, limit));
  } catch (err) {
    return next(err);
  }
};

const listPendingEpisodes = async (req, res, next) => {
  try {
    const { limit, skip, sort, page } = parsePagination(req.query, {
      allowedSortFields: ['createdAt', 'releaseDate', 'order'],
      defaultSort: { createdAt: -1 }
    });
    const filter = { status: 'pending' };
    const [items, total] = await Promise.all([
      Episode.find(filter)
        .sort(sort)
        .skip(skip || 0)
        .limit(limit || 0),
      Episode.countDocuments(filter)
    ]);
    return sendSuccess(res, items, buildMeta(total, page, limit));
  } catch (err) {
    return next(err);
  }
};

const approveEpisode = async (req, res, next) => {
  try {
    const { episodeId } = req.params;
    if (!Types.ObjectId.isValid(episodeId)) {
      return next({ status: 400, message: 'Invalid episodeId' });
    }
    const episode = await Episode.findById(episodeId);
    if (!episode) {
      return next({ status: 404, message: 'Episode not found' });
    }

    if (episode.status !== 'pending') {
      return next({ status: 400, message: 'Episode is not pending' });
    }

    episode.status = 'published';
    await episode.save();

    const series = await Series.findById(episode.series);
    if (series && (series.status === 'pending' || series.status === 'draft')) {
      series.status = 'published';
      await series.save();
    }

    return sendSuccess(res, episode);
  } catch (err) {
    return next(err);
  }
};

const toggleSubscription = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { isSubscribed } = req.body || {};

    if (typeof isSubscribed !== 'boolean') {
      return next({ status: 400, message: 'isSubscribed boolean is required' });
    }

    if (!Types.ObjectId.isValid(userId)) {
      return next({ status: 400, message: 'Invalid userId' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return next({ status: 404, message: 'User not found' });
    }

    let subscription = await Subscription.findOne({ user: userId });
    if (!subscription) {
      subscription = new Subscription({
        user: userId,
        plan: 'basic',
        status: 'trial'
      });
    }

    if (isSubscribed) {
      subscription.status = 'active';
      subscription.startDate = new Date();
      subscription.endDate = null;
      subscription.renewsAt = null;
    } else {
      subscription.status = 'canceled';
      subscription.renewsAt = null;
    }

    await subscription.save();

    return sendSuccess(res, {
      userId,
      isSubscribed,
      subscriptionStatus: subscription.status
    });
  } catch (err) {
    return next(err);
  }
};

// List all series (admin-wide)
const listAllSeries = async (req, res, next) => {
  try {
    const { limit, skip, sort, page } = parsePagination(req.query, {
      allowedSortFields: ['createdAt', 'title', 'status'],
      defaultSort: { createdAt: -1 }
    });
    const filter = {};
    if (req.query.status && typeof req.query.status === 'string') {
      filter.status = req.query.status;
    }
    if (req.query.q && typeof req.query.q === 'string') {
      filter.title = { $regex: req.query.q.trim(), $options: 'i' };
    }
    if (req.query.category && typeof req.query.category === 'string') {
      filter.categories = { $in: [req.query.category] };
    }

    const [items, total] = await Promise.all([
      Series.find(filter).sort(sort).skip(skip || 0).limit(limit || 0),
      Series.countDocuments(filter)
    ]);

    return sendSuccess(res, { items, total }, buildMeta(total, page, limit));
  } catch (err) {
    return next(err);
  }
};

// List episodes for a series (admin-wide)
const listEpisodesBySeries = async (req, res, next) => {
  try {
    const { seriesId } = req.params;
    if (!Types.ObjectId.isValid(seriesId)) {
      return next({ status: 400, message: 'Invalid seriesId' });
    }

    const series = await Series.findById(seriesId);
    if (!series) {
      return next({ status: 404, message: 'Series not found' });
    }

    const { limit, skip, sort, page } = parsePagination(req.query, {
      allowedSortFields: ['order', 'createdAt', 'releaseDate'],
      defaultSort: { order: 1 }
    });

    const filter = { series: seriesId };
    const [items, total] = await Promise.all([
      Episode.find(filter).sort(sort).skip(skip || 0).limit(limit || 0),
      Episode.countDocuments(filter)
    ]);

    return sendSuccess(res, { items, total, series }, buildMeta(total, page, limit));
  } catch (err) {
    return next(err);
  }
};

const getAdminStats = async (req, res, next) => {
  try {
    const Category = require('../models/Category');
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

    // Parallel queries for efficiency
    const [
      totalUsers,
      newUsersThisMonth,
      newUsersLastMonth,
      activeCreators,
      totalViewers,
      pendingEpisodes,
      publishedEpisodes,
      totalEpisodes,
      totalSeries,
      publishedSeries,
      totalCategories,
      activeSubscriptions,
      newSubsThisMonth,
      newSubsLastMonth,
      recentPending,
      topSeries
    ] = await Promise.all([
      User.countDocuments({}),
      User.countDocuments({ createdAt: { $gte: thirtyDaysAgo } }),
      User.countDocuments({ createdAt: { $gte: sixtyDaysAgo, $lt: thirtyDaysAgo } }),
      User.countDocuments({ role: 'creator' }),
      User.countDocuments({ role: 'viewer' }),
      Episode.countDocuments({ status: 'pending' }),
      Episode.countDocuments({ status: 'published' }),
      Episode.countDocuments({}),
      Series.countDocuments({}),
      Series.countDocuments({ status: 'published' }),
      Category.countDocuments({}),
      Subscription.countDocuments({ status: 'active' }),
      Subscription.countDocuments({ createdAt: { $gte: thirtyDaysAgo }, status: 'active' }),
      Subscription.countDocuments({ createdAt: { $gte: sixtyDaysAgo, $lt: thirtyDaysAgo }, status: 'active' }),
      Episode.find({ status: 'pending' })
        .sort({ createdAt: -1 })
        .limit(5)
        .populate('series', 'title'),
      Series.find({ status: 'published' })
        .sort({ createdAt: -1 })
        .limit(5)
        .select('title posterUrl createdAt')
    ]);

    // Calculate growth percentages
    const userGrowth = newUsersLastMonth > 0
      ? Math.round(((newUsersThisMonth - newUsersLastMonth) / newUsersLastMonth) * 100)
      : newUsersThisMonth > 0 ? 100 : 0;

    const subGrowth = newSubsLastMonth > 0
      ? Math.round(((newSubsThisMonth - newSubsLastMonth) / newSubsLastMonth) * 100)
      : newSubsThisMonth > 0 ? 100 : 0;

    // Revenue in INR (₹299/month per subscription)
    const monthlyRevenueINR = activeSubscriptions * 299;
    const estimatedAnnualRevenueINR = monthlyRevenueINR * 12;
    const avgRevenuePerUserINR = totalUsers > 0 ? Math.round(monthlyRevenueINR / totalUsers) : 0;

    const stats = {
      // Core metrics
      totalUsers,
      activeCreators,
      totalViewers,
      pendingEpisodes,

      // Revenue (INR)
      revenue: monthlyRevenueINR,
      estimatedAnnualRevenue: estimatedAnnualRevenueINR,
      avgRevenuePerUser: avgRevenuePerUserINR,
      activeSubscriptions,

      // Content metrics
      totalSeries,
      publishedSeries,
      totalEpisodes,
      publishedEpisodes,
      totalCategories,

      // Growth metrics
      newUsersThisMonth,
      userGrowthPercent: userGrowth,
      newSubsThisMonth,
      subGrowthPercent: subGrowth,

      // Ratios
      userToCreatorRatio: activeCreators > 0 ? Math.round((totalUsers / activeCreators) * 10) / 10 : 0,
      episodesPerSeries: totalSeries > 0 ? Math.round((totalEpisodes / totalSeries) * 10) / 10 : 0
    };

    const urgentItems = recentPending.map((ep) => ({
      _id: ep._id,
      title: ep.title,
      createdAt: ep.createdAt,
      series: ep.series ? { _id: ep.series._id, title: ep.series.title } : null,
      status: ep.status
    }));

    const topContent = topSeries.map((s) => ({
      _id: s._id,
      title: s.title,
      posterUrl: s.posterUrl,
      createdAt: s.createdAt
    }));

    return sendSuccess(res, { stats, urgentItems, topContent });
  } catch (err) {
    return next(err);
  }
};

// List all users with pagination and filtering
const listUsers = async (req, res, next) => {
  try {
    const { limit, skip, sort, page } = parsePagination(req.query, {
      allowedSortFields: ['createdAt', 'email', 'displayName', 'role', 'status'],
      defaultSort: { createdAt: -1 }
    });

    const filter = {};
    if (req.query.role && typeof req.query.role === 'string') {
      filter.role = req.query.role;
    }
    if (req.query.status && typeof req.query.status === 'string') {
      filter.status = req.query.status;
    }
    if (req.query.q && typeof req.query.q === 'string') {
      const searchTerm = req.query.q.trim();
      filter.$or = [
        { email: { $regex: searchTerm, $options: 'i' } },
        { displayName: { $regex: searchTerm, $options: 'i' } }
      ];
    }

    const [items, total] = await Promise.all([
      User.find(filter, { passwordHash: 0 }).sort(sort).skip(skip || 0).limit(limit || 0),
      User.countDocuments(filter)
    ]);

    return sendSuccess(res, { items, total }, buildMeta(total, page, limit));
  } catch (err) {
    return next(err);
  }
};

// Update user status (suspend/activate/delete)
const updateUserStatus = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { status, role } = req.body || {};

    if (!Types.ObjectId.isValid(userId)) {
      return next({ status: 400, message: 'Invalid userId' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return next({ status: 404, message: 'User not found' });
    }

    const allowedStatuses = ['active', 'suspended', 'deleted'];
    const allowedRoles = ['viewer', 'creator', 'admin'];

    if (status && allowedStatuses.includes(status)) {
      user.status = status;
    }
    if (role && allowedRoles.includes(role)) {
      user.role = role;
    }

    await user.save();

    return sendSuccess(res, {
      _id: user._id,
      email: user.email,
      displayName: user.displayName,
      role: user.role,
      status: user.status,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    });
  } catch (err) {
    return next(err);
  }
};

// List all subscriptions with pagination and filtering
const listSubscriptions = async (req, res, next) => {
  try {
    const { limit, skip, sort, page } = parsePagination(req.query, {
      allowedSortFields: ['createdAt', 'status', 'plan', 'startDate', 'endDate'],
      defaultSort: { createdAt: -1 }
    });

    const filter = {};
    if (req.query.status && typeof req.query.status === 'string') {
      filter.status = req.query.status;
    }
    if (req.query.plan && typeof req.query.plan === 'string') {
      filter.plan = req.query.plan;
    }

    const [items, total] = await Promise.all([
      Subscription.find(filter)
        .populate('user', 'email displayName role')
        .sort(sort)
        .skip(skip || 0)
        .limit(limit || 0),
      Subscription.countDocuments(filter)
    ]);

    return sendSuccess(res, { items, total }, buildMeta(total, page, limit));
  } catch (err) {
    return next(err);
  }
};

// Update subscription plan/status
const updateSubscription = async (req, res, next) => {
  try {
    const { subscriptionId } = req.params;
    const { status, plan } = req.body || {};

    if (!Types.ObjectId.isValid(subscriptionId)) {
      return next({ status: 400, message: 'Invalid subscriptionId' });
    }

    const subscription = await Subscription.findById(subscriptionId).populate('user', 'email displayName');
    if (!subscription) {
      return next({ status: 404, message: 'Subscription not found' });
    }

    const allowedStatuses = ['trial', 'active', 'past_due', 'canceled', 'expired'];
    const allowedPlans = ['free', 'basic', 'premium'];

    if (status && allowedStatuses.includes(status)) {
      subscription.status = status;
      if (status === 'active' && !subscription.startDate) {
        subscription.startDate = new Date();
      }
    }
    if (plan && allowedPlans.includes(plan)) {
      subscription.plan = plan;
    }

    await subscription.save();

    return sendSuccess(res, subscription);
  } catch (err) {
    return next(err);
  }
};

// Create episode (admin)
const createAdminEpisode = async (req, res, next) => {
  try {
    const { seriesId } = req.params;
    const {
      title, synopsis, order, releaseDate, status, isFree,
      videoUrl, videoPublicId, thumbnailUrl, duration, seasonId
    } = req.body || {};

    if (!Types.ObjectId.isValid(seriesId)) {
      return next({ status: 400, message: 'Invalid seriesId' });
    }
    if (!title || typeof title !== 'string' || !title.trim()) {
      return next({ status: 400, message: 'Title is required' });
    }
    if (order === undefined || !Number.isInteger(order) || order < 1) {
      return next({ status: 400, message: 'order must be a positive integer' });
    }

    const series = await Series.findById(seriesId);
    if (!series) {
      return next({ status: 404, message: 'Series not found' });
    }

    let normalizedReleaseDate;
    if (releaseDate) {
      const parsed = new Date(releaseDate);
      if (!Number.isNaN(parsed.getTime())) {
        normalizedReleaseDate = parsed;
      }
    }

    const allowedStatuses = ['pending', 'draft', 'scheduled', 'published', 'archived'];
    const safeStatus = allowedStatuses.includes(status) ? status : 'draft';

    const episode = await Episode.create({
      series: seriesId,
      season: seasonId && Types.ObjectId.isValid(seasonId) ? seasonId : undefined,
      title: title.trim(),
      synopsis: synopsis || '',
      order,
      releaseDate: normalizedReleaseDate,
      status: safeStatus,
      isFree: isFree === true, // Explicitly convert to boolean
      videoUrl: videoUrl || '',
      videoPublicId: videoPublicId || '',
      thumbnailUrl: thumbnailUrl || '',
      duration: typeof duration === 'number' ? duration : 0
    });

    res.status(201);
    return sendSuccess(res, episode);
  } catch (err) {
    return next(err);
  }
};

// Update episode (admin)
const updateAdminEpisode = async (req, res, next) => {
  try {
    const { episodeId } = req.params;
    const {
      title, synopsis, order, releaseDate, status, isFree, seasonId,
      videoUrl, videoPublicId, thumbnailUrl, duration
    } = req.body || {};

    if (!Types.ObjectId.isValid(episodeId)) {
      return next({ status: 400, message: 'Invalid episodeId' });
    }

    const episode = await Episode.findById(episodeId);
    if (!episode) {
      return next({ status: 404, message: 'Episode not found' });
    }

    if (title && typeof title === 'string') episode.title = title.trim();
    if (typeof synopsis === 'string') episode.synopsis = synopsis;
    if (Number.isInteger(order) && order >= 1) episode.order = order;
    if (typeof isFree === 'boolean') episode.isFree = isFree;

    // Handle Season update
    if (seasonId !== undefined) {
      if (seasonId === null || seasonId === '') {
        episode.season = undefined;
      } else if (Types.ObjectId.isValid(seasonId)) {
        episode.season = seasonId;
      }
    }

    if (releaseDate) {
      const parsed = new Date(releaseDate);
      if (!Number.isNaN(parsed.getTime())) {
        episode.releaseDate = parsed;
      }
    }

    const allowedStatuses = ['pending', 'draft', 'scheduled', 'published', 'archived'];
    if (status && allowedStatuses.includes(status)) {
      episode.status = status;
    }

    if (typeof videoUrl === 'string') episode.videoUrl = videoUrl;
    if (typeof videoPublicId === 'string') episode.videoPublicId = videoPublicId;
    if (typeof thumbnailUrl === 'string') episode.thumbnailUrl = thumbnailUrl;
    if (typeof duration === 'number') episode.duration = duration;

    await episode.save();
    return sendSuccess(res, episode);
  } catch (err) {
    return next(err);
  }
};

// Delete episode (admin)
const deleteAdminEpisode = async (req, res, next) => {
  try {
    const { episodeId } = req.params;

    if (!Types.ObjectId.isValid(episodeId)) {
      return next({ status: 400, message: 'Invalid episodeId' });
    }

    const episode = await Episode.findById(episodeId);
    if (!episode) {
      return next({ status: 404, message: 'Episode not found' });
    }

    await episode.deleteOne();
    return sendSuccess(res, { deleted: true, id: episodeId });
  } catch (err) {
    return next(err);
  }
};

// Create series (admin)
const createAdminSeries = async (req, res, next) => {
  try {
    const { title, description, categoryId, status, posterUrl, tags } = req.body || {};

    if (!title || typeof title !== 'string' || !title.trim()) {
      return next({ status: 400, message: 'Title is required' });
    }
    if (!categoryId || !Types.ObjectId.isValid(categoryId)) {
      return next({ status: 400, message: 'Valid categoryId is required' });
    }

    const Category = require('../models/Category');
    const category = await Category.findById(categoryId);
    if (!category) {
      return next({ status: 404, message: 'Category not found' });
    }

    const allowedStatuses = ['pending', 'draft', 'published', 'archived'];
    const safeStatus = allowedStatuses.includes(status) ? status : 'draft';
    const safeTags = Array.isArray(tags) ? tags.filter(t => typeof t === 'string') : [];

    const series = await Series.create({
      title: title.trim(),
      description: description || '',
      category: categoryId,
      creator: req.user?.id,
      status: safeStatus,
      posterUrl: posterUrl || '',
      tags: safeTags
    });

    // (No stray line)

    res.status(201);
    return sendSuccess(res, series);
  } catch (err) {
    return next(err);
  }
};

// Update series (admin)
const updateAdminSeries = async (req, res, next) => {
  try {
    const { seriesId } = req.params;
    const { title, description, categoryId, status, posterUrl, tags } = req.body || {};
    console.log('[updateAdminSeries] Body:', req.body); // Log incoming body
    if (!Types.ObjectId.isValid(seriesId)) {
      return next({ status: 400, message: 'Invalid seriesId' });
    }

    const series = await Series.findById(seriesId);
    if (!series) {
      return next({ status: 404, message: 'Series not found' });
    }

    if (title && typeof title === 'string') series.title = title.trim();
    if (typeof description === 'string') series.description = description;

    if (categoryId) {
      if (!Types.ObjectId.isValid(categoryId)) {
        return next({ status: 400, message: 'Invalid categoryId' });
      }
      series.category = categoryId;
    }

    const allowedStatuses = ['pending', 'draft', 'published', 'archived'];
    if (status && allowedStatuses.includes(status)) {
      series.status = status;
    }

    if (typeof posterUrl === 'string') series.posterUrl = posterUrl;

    if (Array.isArray(tags)) {
      series.tags = tags.filter(t => typeof t === 'string');
    }

    await series.save();
    return sendSuccess(res, series);
  } catch (err) {
    return next(err);
  }
};

// Delete series (admin)
const deleteAdminSeries = async (req, res, next) => {
  try {
    const { seriesId } = req.params;
    if (!Types.ObjectId.isValid(seriesId)) {
      return next({ status: 400, message: 'Invalid seriesId' });
    }

    // Optional: Check dependencies (episodes)
    await Series.findByIdAndDelete(seriesId);
    return sendSuccess(res, { deleted: true, id: seriesId });
  } catch (err) {
    return next(err);
  }
};

// Season management


const listSeasonsBySeries = async (req, res, next) => {
  try {
    const { seriesId } = req.params;
    if (!Types.ObjectId.isValid(seriesId)) {
      return next({ status: 400, message: 'Invalid series ID' });
    }

    const seasons = await Season.find({ series: seriesId }).sort({ number: 1 });
    return sendSuccess(res, seasons);
  } catch (err) {
    return next(err);
  }
};

const createSeason = async (req, res, next) => {
  try {
    const { seriesId } = req.params;
    const { number, title, description, status, posterUrl } = req.body || {};

    if (!Types.ObjectId.isValid(seriesId)) {
      return next({ status: 400, message: 'Invalid series ID' });
    }

    const series = await Series.findById(seriesId);
    if (!series) {
      return next({ status: 404, message: 'Series not found' });
    }

    // Auto-generate season number if not provided
    let seasonNumber = number;
    if (!seasonNumber) {
      const lastSeason = await Season.findOne({ series: seriesId }).sort({ number: -1 });
      seasonNumber = (lastSeason?.number || 0) + 1;
    }

    const season = await Season.create({
      series: seriesId,
      number: seasonNumber,
      title: title || `Season ${seasonNumber}`,
      description: description || '',
      status: status || 'draft',
      posterUrl: posterUrl || ''
    });

    res.status(201);
    return sendSuccess(res, season);
  } catch (err) {
    if (err.code === 11000) {
      return next({ status: 409, message: 'Season number already exists for this series' });
    }
    return next(err);
  }
};

const updateSeason = async (req, res, next) => {
  try {
    const { seasonId } = req.params;
    const { number, title, description, status, posterUrl, releaseDate } = req.body || {};

    if (!Types.ObjectId.isValid(seasonId)) {
      return next({ status: 400, message: 'Invalid season ID' });
    }

    const updates = {};
    if (number !== undefined) updates.number = number;
    if (title !== undefined) updates.title = title;
    if (description !== undefined) updates.description = description;
    if (status !== undefined) updates.status = status;
    if (posterUrl !== undefined) updates.posterUrl = posterUrl;
    if (releaseDate !== undefined) updates.releaseDate = releaseDate;

    const season = await Season.findByIdAndUpdate(seasonId, updates, { new: true });
    if (!season) {
      return next({ status: 404, message: 'Season not found' });
    }

    return sendSuccess(res, season);
  } catch (err) {
    if (err.code === 11000) {
      return next({ status: 409, message: 'Season number already exists for this series' });
    }
    return next(err);
  }
};

const deleteSeason = async (req, res, next) => {
  try {
    const { seasonId } = req.params;

    if (!Types.ObjectId.isValid(seasonId)) {
      return next({ status: 400, message: 'Invalid season ID' });
    }

    // Check if there are episodes in this season
    const episodeCount = await Episode.countDocuments({ season: seasonId });
    if (episodeCount > 0) {
      return next({ status: 400, message: `Cannot delete season with ${episodeCount} episodes. Remove or reassign episodes first.` });
    }

    const season = await Season.findByIdAndDelete(seasonId);
    if (!season) {
      return next({ status: 404, message: 'Season not found' });
    }

    return sendSuccess(res, { deleted: true, id: seasonId });
  } catch (err) {
    return next(err);
  }
};



const createAdmin = async (req, res, next) => {
  try {
    const { email, password, displayName } = req.body;

    if (!email || !password || !displayName) {
      return next({ status: 400, message: 'All fields are required' });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return next({ status: 409, message: 'Email already registered' });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const newAdmin = await User.create({
      email,
      passwordHash,
      displayName,
      role: 'admin',
      status: 'active'
    });

    return sendSuccess(res, {
      id: newAdmin._id,
      email: newAdmin.email,
      displayName: newAdmin.displayName,
      role: newAdmin.role
    });
  } catch (err) {
    return next(err);
  }
};

module.exports = {
  listPendingSeries,
  listPendingEpisodes,
  approveEpisode,
  toggleSubscription,
  listAllSeries,
  listEpisodesBySeries,
  getAdminStats,
  listUsers,
  updateUserStatus,
  listSubscriptions,
  updateSubscription,
  createAdminEpisode,
  updateAdminEpisode,
  deleteAdminEpisode,
  createAdminSeries,
  updateAdminSeries,
  deleteAdminSeries,
  listSeasonsBySeries,
  createSeason,
  updateSeason,
  deleteSeason,
  createAdmin
};
