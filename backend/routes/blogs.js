const express = require('express');
const jwt = require('jsonwebtoken');
const Blog = require('../models/Blog');
const Category = require('../models/Category');
const User = require('../models/User');
const { auth, adminAuth } = require('../middleware/auth');
const { processBlog } = require('../utils/imageUrl');

const router = express.Router();

// Get all blogs (public, or all for admin)
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 10, category, status } = req.query;
    
    // Check if user is authenticated and is admin
    let isAdmin = false;
    try {
      const token = req.header('Authorization')?.replace('Bearer ', '');
      if (token) {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
        const user = await User.findById(decoded.id);
        if (user && user.role === 'admin') {
          isAdmin = true;
        }
      }
    } catch (err) {
      // Not authenticated or invalid token, continue as public user
    }

    const query = {};
    
    // If not admin, only show published blogs. If admin, show all unless status is specified
    if (!isAdmin) {
      query.status = 'published';
    } else if (status) {
      query.status = status;
    }

    if (category) {
      query.category = category;
    }

    const blogs = await Blog.find(query)
      .populate('author', 'username profile')
      .populate('category', 'name slug')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Blog.countDocuments(query);

    // Process blogs to include full URLs
    const processedBlogs = blogs.map(blog => processBlog(blog));

    res.json({
      blogs: processedBlogs,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total,
    });
  } catch (error) {
    console.error('Get blogs error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get single blog
router.get('/:slug', async (req, res) => {
  try {
    const blog = await Blog.findOne({ slug: req.params.slug, status: 'published' })
      .populate('author', 'username profile')
      .populate('category', 'name slug')
      .populate('comments.user', 'username profile');

    if (!blog) {
      return res.status(404).json({ message: 'Blog not found' });
    }

    // Increment views
    blog.views += 1;
    await blog.save();

    // Process blog to include full URLs
    const processedBlog = processBlog(blog);

    res.json(processedBlog);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Create blog (authenticated users)
router.post('/', auth, async (req, res) => {
  try {
    const { title, content, excerpt, category, tags, featuredImage, images, status } = req.body;

    // Generate slug
    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    const blog = new Blog({
      title,
      content,
      excerpt,
      author: req.user._id,
      category,
      tags: tags || [],
      featuredImage,
      images: images || [],
      slug,
      status: status || 'draft',
    });

    await blog.save();
    await blog.populate('author', 'username profile');
    await blog.populate('category', 'name slug');

    // Process blog to include full URLs
    const processedBlog = processBlog(blog);

    res.status(201).json(processedBlog);
  } catch (error) {
    if (error.code === 11000) {
      res.status(400).json({ message: 'Blog with this title already exists' });
    } else {
      res.status(500).json({ message: 'Server error' });
    }
  }
});

// Update blog (author or admin)
router.put('/:id', auth, async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);

    if (!blog) {
      return res.status(404).json({ message: 'Blog not found' });
    }

    if (blog.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const { title, content, excerpt, category, tags, featuredImage, images, status } = req.body;

    blog.title = title || blog.title;
    blog.content = content || blog.content;
    blog.excerpt = excerpt || blog.excerpt;
    blog.category = category || blog.category;
    blog.tags = tags || blog.tags;
    blog.featuredImage = featuredImage || blog.featuredImage;
    blog.images = images || blog.images;
    blog.status = status || blog.status;

    await blog.save();
    await blog.populate('author', 'username profile');
    await blog.populate('category', 'name slug');

    // Process blog to include full URLs
    const processedBlog = processBlog(blog);

    res.json(processedBlog);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete blog (author or admin)
router.delete('/:id', auth, async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);

    if (!blog) {
      return res.status(404).json({ message: 'Blog not found' });
    }

    if (blog.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    await Blog.findByIdAndDelete(req.params.id);
    res.json({ message: 'Blog deleted' });
  } catch (error) {
    console.error('Delete blog error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Like/Unlike blog
router.post('/:id/like', auth, async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);

    if (!blog) {
      return res.status(404).json({ message: 'Blog not found' });
    }

    const likeIndex = blog.likes.indexOf(req.user._id);

    if (likeIndex > -1) {
      blog.likes.splice(likeIndex, 1);
    } else {
      blog.likes.push(req.user._id);
    }

    await blog.save();
    res.json({ likes: blog.likes.length });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Add comment
router.post('/:id/comments', auth, async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);

    if (!blog) {
      return res.status(404).json({ message: 'Blog not found' });
    }

    const comment = {
      user: req.user._id,
      content: req.body.content,
    };

    blog.comments.push(comment);
    await blog.save();
    await blog.populate('comments.user', 'username profile');

    res.status(201).json(blog.comments[blog.comments.length - 1]);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user's blogs
router.get('/user/:userId', auth, async (req, res) => {
  try {
    const blogs = await Blog.find({ author: req.params.userId })
      .populate('category', 'name slug')
      .sort({ createdAt: -1 });

    // Process blogs to include full URLs
    const processedBlogs = blogs.map(blog => processBlog(blog));

    res.json(processedBlogs);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;