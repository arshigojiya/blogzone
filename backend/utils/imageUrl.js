/**
 * Utility function to generate full image URLs
 * Uses BASE_URL from environment variables
 */

const getBaseUrl = () => {
  return process.env.BASE_URL || `http://localhost:${process.env.PORT || 5000}`;
};

/**
 * Generate full URL for blog image
 */
const getBlogImageUrl = (filename) => {
  if (!filename) return null;
  
  // If already a full URL, return as is
  if (filename.startsWith('http://') || filename.startsWith('https://')) {
    return filename;
  }
  
  return `${getBaseUrl()}/api/uploads/blogs/${filename}`;
};

/**
 * Generate full URL for avatar image
 */
const getAvatarUrl = (filename) => {
  if (!filename) return null;
  
  // If already a full URL, return as is
  if (filename.startsWith('http://') || filename.startsWith('https://')) {
    return filename;
  }
  
  return `${getBaseUrl()}/api/uploads/avatars/${filename}`;
};

/**
 * Generate full URL for category image
 */
const getCategoryImageUrl = (filename) => {
  if (!filename) return null;
  
  // If already a full URL, return as is
  if (filename.startsWith('http://') || filename.startsWith('https://')) {
    return filename;
  }
  
  return `${getBaseUrl()}/api/uploads/categories/${filename}`;
};

/**
 * Process blog images array to include full URLs
 */
const processBlogImages = (images) => {
  if (!images || !Array.isArray(images)) return [];
  
  return images.map(image => {
    if (typeof image === 'string') {
      return {
        filename: image,
        url: getBlogImageUrl(image),
        path: `/api/uploads/blogs/${image}`
      };
    }
    
    // If image is an object
    const processed = { ...image };
    
    // Generate URL if not present
    if (image.filename && !image.url) {
      processed.url = getBlogImageUrl(image.filename);
    }
    
    // Ensure path is set
    if (image.filename && !image.path) {
      processed.path = `/api/uploads/blogs/${image.filename}`;
    }
    
    return processed;
  });
};

/**
 * Process blog to include full URLs for featuredImage and images
 */
const processBlog = (blog) => {
  if (!blog) return blog;
  
  const processed = blog.toObject ? blog.toObject() : { ...blog };
  
  // Process featured image
  if (processed.featuredImage) {
    if (!processed.featuredImage.startsWith('http://') && !processed.featuredImage.startsWith('https://')) {
      // Extract filename if it's a path
      const filename = processed.featuredImage.includes('/') 
        ? processed.featuredImage.split('/').pop() 
        : processed.featuredImage;
      processed.featuredImage = getBlogImageUrl(filename);
    }
  }
  
  // Process images array
  if (processed.images) {
    processed.images = processBlogImages(processed.images);
  }
  
  return processed;
};

/**
 * Process category to include full URL for image
 */
const processCategory = (category) => {
  if (!category) return category;
  
  const processed = category.toObject ? category.toObject() : { ...category };
  
  if (processed.image) {
    if (!processed.image.startsWith('http://') && !processed.image.startsWith('https://')) {
      const filename = processed.image.includes('/') 
        ? processed.image.split('/').pop() 
        : processed.image;
      processed.image = getCategoryImageUrl(filename);
    }
  }
  
  return processed;
};

/**
 * Process user profile to include full URL for avatar
 */
const processUserProfile = (user) => {
  if (!user) return user;
  
  const processed = user.toObject ? user.toObject() : { ...user };
  
  if (processed.profile && processed.profile.avatar) {
    const avatar = processed.profile.avatar;
    
    if (avatar.filename && !avatar.url) {
      avatar.url = getAvatarUrl(avatar.filename);
    }
    
    if (avatar.filename && !avatar.path) {
      avatar.path = `/api/uploads/avatars/${avatar.filename}`;
    }
  }
  
  return processed;
};

module.exports = {
  getBaseUrl,
  getBlogImageUrl,
  getAvatarUrl,
  getCategoryImageUrl,
  processBlogImages,
  processBlog,
  processCategory,
  processUserProfile,
};

