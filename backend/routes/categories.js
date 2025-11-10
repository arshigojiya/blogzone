const express = require('express');
const Category = require('../models/Category');
const { auth, adminAuth } = require('../middleware/auth');
const { processCategory, processBlog } = require('../utils/imageUrl');

const router = express.Router();

// Get all categories (public)
router.get('/', async (req, res) => {
  try {
    const categories = await Category.find({}).sort({ name: 1 });
    // Process categories to include full URLs
    const processedCategories = categories.map(cat => processCategory(cat));
    res.json(processedCategories);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get single category
router.get('/:slug', async (req, res) => {
  try {
    const category = await Category.findOne({ slug: req.params.slug });
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }
    // Process category to include full URLs
    const processedCategory = processCategory(category);
    res.json(processedCategory);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Create category (admin only)
router.post('/', auth, adminAuth, async (req, res) => {
  try {
    const { name, description, color, icon, image, parent } = req.body;

    // Generate slug
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    const category = new Category({
      name,
      description,
      slug,
      color,
      icon,
      image,
      parent,
    });

    await category.save();
    // Process category to include full URLs
    const processedCategory = processCategory(category);
    res.status(201).json(processedCategory);
  } catch (error) {
    if (error.code === 11000) {
      res.status(400).json({ message: 'Category with this name already exists' });
    } else {
      res.status(500).json({ message: 'Server error' });
    }
  }
});

// Update category (admin only)
router.put('/:id', auth, adminAuth, async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);

    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    const { name, description, color, icon, image, parent } = req.body;

    category.name = name || category.name;
    category.description = description || category.description;
    category.color = color || category.color;
    category.icon = icon || category.icon;
    category.image = image || category.image;
    category.parent = parent || category.parent;

    await category.save();
    // Process category to include full URLs
    const processedCategory = processCategory(category);
    res.json(processedCategory);
  } catch (error) {
    if (error.code === 11000) {
      res.status(400).json({ message: 'Category with this name already exists' });
    } else {
      res.status(500).json({ message: 'Server error' });
    }
  }
});

// Delete category (admin only)
router.delete('/:id', auth, adminAuth, async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);

    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    await Category.findByIdAndDelete(req.params.id);
    res.json({ message: 'Category deleted' });
  } catch (error) {
    console.error('Delete category error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get blogs by category
router.get('/:slug/blogs', async (req, res) => {
  try {
    const category = await Category.findOne({ slug: req.params.slug });
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    const { page = 1, limit = 10 } = req.query;

    const blogs = await require('../models/Blog').find({
      category: category._id,
      status: 'published'
    })
      .populate('author', 'username profile')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await require('../models/Blog').countDocuments({
      category: category._id,
      status: 'published'
    });

    // Process category and blogs to include full URLs
    const processedCategory = processCategory(category);
    const processedBlogs = blogs.map(blog => processBlog(blog));

    res.json({
      category: processedCategory,
      blogs: processedBlogs,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;