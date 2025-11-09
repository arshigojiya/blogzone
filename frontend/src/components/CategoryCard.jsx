import { motion } from 'framer-motion'
import { FiArrowRight } from 'react-icons/fi'
import './CategoryCard.css'

function CategoryCard({ category, isActive, onClick }) {
  return (
    <motion.div
      className={`category-card ${isActive ? 'active' : ''}`}
      onClick={onClick}
      whileHover={{ scale: 1.05, y: -8 }}
      whileTap={{ scale: 0.98 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div
        className="card-background"
        style={{ backgroundImage: `url(${category.image})` }}
      >
        <div className="card-overlay" />
        <div className="card-gradient" style={{ background: `linear-gradient(135deg, ${category.color}80, ${category.color}40)` }} />
      </div>

      <div className="card-content">
        <div className="category-icon">{category.icon}</div>
        <h3 className="category-name">{category.name}</h3>
        <p className="category-description">{category.description}</p>
        <div className="category-footer">
          <span className="category-count">{category.count || category.blogsCount || 0} Posts</span>
          <motion.div
            className="arrow-icon"
            whileHover={{ x: 5 }}
          >
            <FiArrowRight />
          </motion.div>
        </div>
      </div>

      {isActive && (
        <motion.div
          className="active-indicator"
          layoutId="activeCategory"
          initial={false}
          transition={{
            type: "spring",
            stiffness: 500,
            damping: 30
          }}
        />
      )}
    </motion.div>
  )
}

export default CategoryCard

