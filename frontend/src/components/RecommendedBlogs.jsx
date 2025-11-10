import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { FiArrowRight, FiClock, FiEye, FiHeart, FiStar } from 'react-icons/fi'
import { apiService } from '../services/api'
import './RecommendedBlogs.css'

function RecommendedBlogs({ selectedCategory = null }) {
  const [blogs, setBlogs] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)

  // Load data on component mount
  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const [blogsResponse, categoriesData] = await Promise.all([
        apiService.getBlogs(),
        apiService.getCategories()
      ])
      // Backend returns { blogs, total, ... } structure
      const blogsArray = blogsResponse?.blogs || blogsResponse || []
      setBlogs(Array.isArray(blogsArray) ? blogsArray : [])
      setCategories(Array.isArray(categoriesData) ? categoriesData : [])
    } catch (error) {
      console.error('Failed to load data:', error)
      setBlogs([])
      setCategories([])
    } finally {
      setLoading(false)
    }
  }

  // Get recent posts (excluding the top 5 featured in hero)
  let recentPosts = Array.isArray(blogs) && blogs.length > 5 ? blogs.slice(5).reverse() : blogs.reverse() // Most recent first

  // Get category name for display
  const selectedCategoryData = selectedCategory
    ? categories.find(cat => cat.slug === selectedCategory)
    : null

  // Filter by category if selected
  if (selectedCategory && selectedCategoryData) {
    recentPosts = recentPosts.filter(blog =>
      blog.category?.name?.toLowerCase() === selectedCategoryData.name.toLowerCase()
    )
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  }

  const cardVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: "easeOut"
      }
    }
  }

  return (
    <section className="recommended-blogs">
      <div className="recommended-container">
        <motion.div
          className="section-header"
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <div className="section-badge">
            <FiStar className="badge-icon" />
            <span>Recommended</span>
          </div>
          <h2 className="section-title">
            {selectedCategoryData ? `Posts in ${selectedCategoryData.name}` : 'Recent Blog Posts'}
          </h2>
          <p className="section-subtitle">
            {selectedCategoryData 
              ? selectedCategoryData.description
              : "Discover our latest articles and stay updated with the newest trends"
            }
          </p>
        </motion.div>

        <motion.div
          className="blogs-grid"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          key={selectedCategory || 'all'}
        >
          {loading ? (
            <div className="loading">Loading blogs...</div>
          ) : recentPosts.length > 0 ? recentPosts.map((blog) => (
            <motion.article
              key={blog._id}
              className="blog-card"
              variants={cardVariants}
              whileHover={{ y: -8, transition: { duration: 0.3 } }}
            >
              {blog.featured && (
                <div className="featured-badge">
                  <FiStar className="featured-icon" />
                  <span>Featured</span>
                </div>
              )}

              <div className="card-image-container">
                <img
                  src={
                    blog.featuredImage || 
                    (blog.images && blog.images.length > 0 && blog.images[0]?.url) ||
                    '/placeholder.jpg'
                  }
                  alt={blog.title}
                  className="card-image"
                  loading="lazy"
                  onError={(e) => {
                    e.target.src = '/placeholder.jpg'
                  }}
                />
                <div className="image-overlay" />
                <div className="category-tag">{blog.category?.name}</div>
              </div>

              <div className="card-content">
                <div className="card-meta">
                  <span className="read-time">
                    <FiClock className="meta-icon" />
                    {blog.readTime || '5 min read'}
                  </span>
                  <div className="card-stats">
                    <span className="stat-item" style={{
                      fontSize: 20
                    }}>
                       <FiEye  size={25} />
                      {blog.views?.toLocaleString() || '0'}
                    </span>
                    <span className="stat-item" style={{
                      fontSize: 20
                    }}>
                     <FiHeart size={25} />
                      {blog.likes?.toLocaleString() || '0'}
                    </span>
                  </div>
                </div>

                <h3 className="card-title">{blog.title}</h3>
                <p className="card-summary">{blog.excerpt}</p>

                <motion.button
                  className="read-more-btn"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Read More
                  <FiArrowRight className="btn-icon" />
                </motion.button>
              </div>
            </motion.article>
          )) : (
            <div className="no-posts-message">
              <p>No posts found in this category. Try selecting a different category.</p>
            </div>
          )}
        </motion.div>
      </div>
    </section>
  )
}

export default RecommendedBlogs

