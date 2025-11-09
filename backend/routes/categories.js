const express = require('express');
const Category = require('../models/Category');
const { auth, adminAuth } = require('../middleware/auth');

const router = express.Router();

// Get all categories (public)
router.get('/', async (req, res) => {
  try {
    const categories = await Category.find({}).sort({ name: 1 });
    res.json(categories);
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
    res.json(category);
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
    res.status(201).json(category);
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
    res.json(category);
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

    await category.remove();
    res.json({ message: 'Category deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
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

    res.json({
      category,
      blogs,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;