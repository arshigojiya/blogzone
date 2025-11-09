const express = require('express');
const fs = require('fs');
const path = require('path');
const { auth } = require('../middleware/auth');
const { uploadBlogImage, uploadAvatar, uploadCategoryImage, uploadMultiple } = require('../middleware/upload');

const router = express.Router();

// Serve uploaded files statically
router.use('/blogs', express.static(path.join(__dirname, '../uploads/blogs')));
router.use('/avatars', express.static(path.join(__dirname, '../uploads/avatars')));
router.use('/categories', express.static(path.join(__dirname, '../uploads/categories')));

// Upload blog featured image
router.post('/blog-featured', auth, uploadBlogImage.single('featuredImage'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const fileUrl = `${req.protocol}://${req.get('host')}/api/uploads/blogs/${req.file.filename}`;

    res.json({
      message: 'File uploaded successfully',
      file: {
        filename: req.file.filename,
        originalName: req.file.originalname,
        size: req.file.size,
        url: fileUrl,
        path: req.file.path,
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Upload failed' });
  }
});

// Upload multiple blog images
router.post('/blog-images', auth, uploadMultiple.array('images', 10), (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: 'No files uploaded' });
    }

    const files = req.files.map(file => ({
      filename: file.filename,
      originalName: file.originalname,
      size: file.size,
      url: `${req.protocol}://${req.get('host')}/api/uploads/blogs/${file.filename}`,
      path: file.path,
    }));

    res.json({
      message: 'Files uploaded successfully',
      files: files
    });
  } catch (error) {
    res.status(500).json({ message: 'Upload failed' });
  }
});

// Upload user avatar
router.post('/avatar', auth, uploadAvatar.single('avatar'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const fileUrl = `${req.protocol}://${req.get('host')}/api/uploads/avatars/${req.file.filename}`;

    res.json({
      message: 'Avatar uploaded successfully',
      file: {
        filename: req.file.filename,
        originalName: req.file.originalname,
        size: req.file.size,
        url: fileUrl,
        path: req.file.path,
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Upload failed' });
  }
});

// Upload category image
router.post('/category-image', auth, uploadCategoryImage.single('categoryImage'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const fileUrl = `${req.protocol}://${req.get('host')}/api/uploads/categories/${req.file.filename}`;

    res.json({
      message: 'Category image uploaded successfully',
      file: {
        filename: req.file.filename,
        originalName: req.file.originalname,
        size: req.file.size,
        url: fileUrl,
        path: req.file.path,
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Upload failed' });
  }
});

// Delete uploaded file
router.delete('/:type/:filename', auth, (req, res) => {
  try {
    const { type, filename } = req.params;

    if (!['blogs', 'avatars', 'categories'].includes(type)) {
      return res.status(400).json({ message: 'Invalid file type' });
    }

    const filePath = path.join(__dirname, `../uploads/${type}/${filename}`);

    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      res.json({ message: 'File deleted successfully' });
    } else {
      res.status(404).json({ message: 'File not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Delete failed' });
  }
});

module.exports = router;