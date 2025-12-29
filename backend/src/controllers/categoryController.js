const { Types } = require('mongoose');
const Category = require('../models/Category');
const Series = require('../models/Series');
const { sendSuccess } = require('../utils/response');
const { parsePagination, buildMeta } = require('../utils/pagination');

const slugify = (name) =>
    name
        .toString()
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');

// List all categories with series count
const listCategories = async (req, res, next) => {
    try {
        const { limit, skip, sort, page } = parsePagination(req.query, {
            allowedSortFields: ['createdAt', 'name'],
            defaultSort: { name: 1 }
        });

        const filter = {};
        if (req.query.q && typeof req.query.q === 'string') {
            filter.name = { $regex: req.query.q.trim(), $options: 'i' };
        }

        const [categories, total] = await Promise.all([
            Category.find(filter).sort(sort).skip(skip || 0).limit(limit || 0),
            Category.countDocuments(filter)
        ]);

        // Get series count for each category
        const categoryIds = categories.map(c => c._id);
        const seriesCounts = await Series.aggregate([
            { $match: { category: { $in: categoryIds } } },
            { $group: { _id: '$category', count: { $sum: 1 } } }
        ]);

        const countMap = new Map(seriesCounts.map(s => [s._id.toString(), s.count]));

        const items = categories.map(cat => ({
            _id: cat._id,
            name: cat.name,
            slug: cat.slug,
            description: cat.description,
            color: cat.color,
            seriesCount: countMap.get(cat._id.toString()) || 0,
            createdAt: cat.createdAt,
            updatedAt: cat.updatedAt
        }));

        return sendSuccess(res, { items, total }, buildMeta(total, page, limit));
    } catch (err) {
        return next(err);
    }
};

// Create a new category
const createCategory = async (req, res, next) => {
    try {
        const { name, description, color } = req.body || {};

        if (!name || typeof name !== 'string' || !name.trim()) {
            return next({ status: 400, message: 'Name is required' });
        }

        const slug = slugify(name);
        const existing = await Category.findOne({ slug });
        if (existing) {
            return next({ status: 409, message: 'Category with this name already exists' });
        }

        const category = await Category.create({
            name: name.trim(),
            slug,
            description: typeof description === 'string' ? description : '',
            color: typeof color === 'string' && color ? color : '#3B82F6',
            createdBy: req.user?.id
        });

        res.status(201);
        return sendSuccess(res, {
            _id: category._id,
            name: category.name,
            slug: category.slug,
            description: category.description,
            color: category.color,
            seriesCount: 0,
            createdAt: category.createdAt
        });
    } catch (err) {
        return next(err);
    }
};

// Update a category
const updateCategory = async (req, res, next) => {
    try {
        const { categoryId } = req.params;
        const { name, description, color } = req.body || {};

        if (!Types.ObjectId.isValid(categoryId)) {
            return next({ status: 400, message: 'Invalid categoryId' });
        }

        const category = await Category.findById(categoryId);
        if (!category) {
            return next({ status: 404, message: 'Category not found' });
        }

        if (name && typeof name === 'string' && name.trim()) {
            const slug = slugify(name);
            const existing = await Category.findOne({ slug, _id: { $ne: categoryId } });
            if (existing) {
                return next({ status: 409, message: 'Category with this name already exists' });
            }
            category.name = name.trim();
            category.slug = slug;
        }

        if (typeof description === 'string') {
            category.description = description;
        }

        if (typeof color === 'string' && color) {
            category.color = color;
        }

        await category.save();

        // Get series count
        const seriesCount = await Series.countDocuments({ category: categoryId });

        return sendSuccess(res, {
            _id: category._id,
            name: category.name,
            slug: category.slug,
            description: category.description,
            color: category.color,
            seriesCount,
            createdAt: category.createdAt,
            updatedAt: category.updatedAt
        });
    } catch (err) {
        return next(err);
    }
};

// Delete a category
const deleteCategory = async (req, res, next) => {
    try {
        const { categoryId } = req.params;

        if (!Types.ObjectId.isValid(categoryId)) {
            return next({ status: 400, message: 'Invalid categoryId' });
        }

        const category = await Category.findById(categoryId);
        if (!category) {
            return next({ status: 404, message: 'Category not found' });
        }

        // Check if category has series
        const seriesCount = await Series.countDocuments({ category: categoryId });
        if (seriesCount > 0) {
            return next({
                status: 400,
                message: `Cannot delete category with ${seriesCount} series. Move or delete them first.`
            });
        }

        await category.deleteOne();
        return sendSuccess(res, { deleted: true, id: categoryId });
    } catch (err) {
        return next(err);
    }
};

// Get single category with details
const getCategory = async (req, res, next) => {
    try {
        const { categoryId } = req.params;

        if (!Types.ObjectId.isValid(categoryId)) {
            return next({ status: 400, message: 'Invalid categoryId' });
        }

        const category = await Category.findById(categoryId);
        if (!category) {
            return next({ status: 404, message: 'Category not found' });
        }

        const seriesCount = await Series.countDocuments({ category: categoryId });

        return sendSuccess(res, {
            _id: category._id,
            name: category.name,
            slug: category.slug,
            description: category.description,
            color: category.color,
            seriesCount,
            createdAt: category.createdAt,
            updatedAt: category.updatedAt
        });
    } catch (err) {
        return next(err);
    }
};

// List series in a category
const listSeriesByCategory = async (req, res, next) => {
    try {
        const { categoryId } = req.params;

        if (!Types.ObjectId.isValid(categoryId)) {
            return next({ status: 400, message: 'Invalid categoryId' });
        }

        const category = await Category.findById(categoryId);
        if (!category) {
            return next({ status: 404, message: 'Category not found' });
        }

        const { limit, skip, sort, page } = parsePagination(req.query, {
            allowedSortFields: ['createdAt', 'title', 'status'],
            defaultSort: { createdAt: -1 }
        });

        const filter = { category: categoryId };
        if (req.query.status && typeof req.query.status === 'string') {
            filter.status = req.query.status;
        }

        const [items, total] = await Promise.all([
            Series.find(filter)
                .populate('creator', 'email displayName')
                .sort(sort)
                .skip(skip || 0)
                .limit(limit || 0),
            Series.countDocuments(filter)
        ]);

        return sendSuccess(res, {
            category: {
                _id: category._id,
                name: category.name,
                slug: category.slug,
                color: category.color
            },
            items,
            total
        }, buildMeta(total, page, limit));
    } catch (err) {
        return next(err);
    }
};

module.exports = {
    listCategories,
    createCategory,
    updateCategory,
    deleteCategory,
    getCategory,
    listSeriesByCategory
};
