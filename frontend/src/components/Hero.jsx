import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import {
  FiArrowLeft,
  FiArrowRight,
  FiClock,
  FiEye,
  FiHeart,
  FiUser,
  FiCalendar
} from 'react-icons/fi'
import { apiService } from '../services/api'
import './Hero.css'

function Hero() {
  const navigate = useNavigate()
  const [currentIndex, setCurrentIndex] = useState(0)
  const [direction, setDirection] = useState(0)
  const [top5Blogs, setTop5Blogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Fetch top 5 recent blogs from API
  useEffect(() => {
    const fetchTopBlogs = async () => {
      try {
        setLoading(true)
        setError(null)
        const response = await apiService.getBlogs({ limit: 5, page: 1 })
        const blogsArray = response?.blogs || response || []

        // Map API response to component format
        const mappedBlogs = blogsArray.map(blog => {
          // Get image URL - try featuredImage first, then first image from images array
          let imageUrl = blog.featuredImage
          if (!imageUrl && blog.images && blog.images.length > 0) {
            const firstImage = blog.images[0]
            imageUrl = typeof firstImage === 'string'
              ? firstImage
              : (firstImage?.url || firstImage?.filename)
          }

          return {
            _id: blog._id,
            title: blog.title,
            excerpt: blog.excerpt || (blog.content ? blog.content.substring(0, 150) + '...' : 'No excerpt available'),
            image: imageUrl || '/placeholder.jpg',
            category: blog.category?.name || 'Uncategorized',
            author: blog.author?.username || 'Unknown',
            date: blog.createdAt || new Date(),
            readTime: `${Math.ceil((blog.content?.length || 0) / 500) || 1} min read`,
            views: blog.views || 0,
            likes: blog.likes?.length || 0,
            slug: blog.slug
          }
        })

        setTop5Blogs(mappedBlogs)
      } catch (err) {
        console.error('Failed to fetch top blogs:', err)
        setError('Failed to load trending stories')
        setTop5Blogs([])
      } finally {
        setLoading(false)
      }
    }

    fetchTopBlogs()
  }, [])

  useEffect(() => {
    if (top5Blogs.length === 0) return

    const timer = setInterval(() => {
      setDirection(1)
      setCurrentIndex((prevIndex) => (prevIndex + 1) % top5Blogs.length)
    }, 5000) // Auto-slide every 5 seconds

    return () => clearInterval(timer)
  }, [top5Blogs.length])

  const slideVariants = {
    enter: (direction) => ({
      x: direction > 0 ? 1000 : -1000,
      opacity: 0,
      scale: 0.8
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1,
      scale: 1
    },
    exit: (direction) => ({
      zIndex: 0,
      x: direction < 0 ? 1000 : -1000,
      opacity: 0,
      scale: 0.8
    })
  }

  const swipeConfidenceThreshold = 10000
  const swipePower = (offset, velocity) => {
    return Math.abs(offset) * velocity
  }

  const paginate = (newDirection) => {
    setDirection(newDirection)
    if (newDirection === 1) {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % top5Blogs.length)
    } else {
      setCurrentIndex((prevIndex) => (prevIndex - 1 + top5Blogs.length) % top5Blogs.length)
    }
  }

  const goToSlide = (index) => {
    setDirection(index > currentIndex ? 1 : -1)
    setCurrentIndex(index)
  }

  if (loading) {
    return (
      <section className="hero-section">
        <div className="hero-container">
          <div className="hero-header">
            <motion.div
              className="hero-badge"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <span className="badge-icon">✨</span>
              <span>Latest Top 5 Blogs</span>
            </motion.div>
            <motion.h1
              className="hero-title"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              Discover Trending Stories
            </motion.h1>
            <motion.p
              className="hero-subtitle"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              Explore our most popular and engaging blog posts
            </motion.p>
          </div>
          <div className="hero-slider">
            <div className="loading-state">
              <p>Loading trending stories...</p>
            </div>
          </div>
        </div>
      </section>
    )
  }

  if (error || top5Blogs.length === 0) {
    return (
      <section className="hero-section">
        <div className="hero-container">
          <div className="hero-header">
            <motion.div
              className="hero-badge"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <span className="badge-icon">✨</span>
              <span>Latest Top 5 Blogs</span>
            </motion.div>
            <motion.h1
              className="hero-title"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              Discover Trending Stories
            </motion.h1>
            <motion.p
              className="hero-subtitle"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              {error || 'No trending stories available at the moment'}
            </motion.p>
          </div>
        </div>
      </section>
    )
  }

  const currentBlog = top5Blogs[currentIndex]

  const handleReadMore = () => {
    if (currentBlog?.slug) {
      navigate(`/blogs/${currentBlog.slug}`)
    }
  }

  return (
    <section className="hero-section">
      <div className="hero-container">
        <div className="hero-header">
          <motion.div
            className="hero-badge"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <span className="badge-icon">✨</span>
            <span>Latest Top 5 Blogs</span>
          </motion.div>
          <motion.h1
            className="hero-title"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            Discover Trending Stories
          </motion.h1>
          <motion.p
            className="hero-subtitle"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            Explore our most popular and engaging blog posts
          </motion.p>
        </div>

        <div className="hero-slider">
          <div className="slider-wrapper">
            <AnimatePresence initial={false} custom={direction}>
              <motion.div
                key={currentIndex}
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{
                  x: { type: "spring", stiffness: 300, damping: 30 },
                  opacity: { duration: 0.3 },
                  scale: { duration: 0.3 }
                }}
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={1}
                onDragEnd={(e, { offset, velocity }) => {
                  const swipe = swipePower(offset.x, velocity.x)

                  if (swipe < -swipeConfidenceThreshold) {
                    paginate(1)
                  } else if (swipe > swipeConfidenceThreshold) {
                    paginate(-1)
                  }
                }}
                className="slide-card"
              >
                <div className="slide-image-container">
                  <img
                    src={currentBlog.image}
                    alt={currentBlog.title}
                    className="slide-image"
                    loading="lazy"
                    onError={(e) => {
                      e.target.src = '/placeholder.jpg'
                    }}
                  />
                  <div className="image-overlay" />
                  <div className="slide-badge">{currentBlog.category}</div>
                </div>

                <div className="slide-content">
                  <motion.h2
                    className="slide-title"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    {currentBlog.title}
                  </motion.h2>

                  <motion.p
                    className="slide-excerpt"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    {currentBlog.excerpt}
                  </motion.p>

                  <motion.div
                    className="slide-meta"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                  >
                    <div className="meta-item">
                      <FiUser className="meta-icon" />
                      <span>{currentBlog.author}</span>
                    </div>
                    <div className="meta-item">
                      <FiCalendar className="meta-icon" />
                      <span>{new Date(currentBlog.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                    </div>
                    <div className="meta-item">
                      <FiClock className="meta-icon" />
                      <span>{currentBlog.readTime}</span>
                    </div>
                  </motion.div>

                  <motion.div
                    className="slide-stats"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                  >
                    <div className="stat-item">
                      <FiEye  size={25} />
                      <span style={{ fontSize: 20}}>{currentBlog.views.toLocaleString()}</span>
                    </div>
                    <div className="stat-item">
                      <FiHeart size={25} />
                      <span style={{ fontSize: 20}}>{currentBlog.likes.toLocaleString()}</span>
                    </div>
                  </motion.div>

                  <motion.button
                    className="slide-button"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleReadMore}
                  >
                    Read More
                    <FiArrowRight className="button-icon" />
                  </motion.button>
                </div>
              </motion.div>
            </AnimatePresence>

            <div
              className="slider-button prev"
              onClick={() => paginate(-1)}
              aria-label="Previous slide"
            >
              <FiArrowLeft size={30} />
            </div>
            <div
              className="slider-button next"
              onClick={() => paginate(1)}
              aria-label="Next slide"
            >
              <FiArrowRight />
            </div>
          </div>

          <div className="slider-dots">
            {top5Blogs.map((_, index) => (
              <button
                key={index}
                className={`dot ${index === currentIndex ? 'active' : ''}`}
                onClick={() => goToSlide(index)}
                aria-label={`Go to slide ${index + 1}`}
              >
                <motion.div
                  className="dot-fill"
                  animate={{
                    scale: index === currentIndex ? 1.2 : 1,
                    opacity: index === currentIndex ? 1 : 0.5
                  }}
                  transition={{ duration: 0.2 }}
                />
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

export default Hero

