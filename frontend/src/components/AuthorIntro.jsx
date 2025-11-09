import { motion } from 'framer-motion'
import { 
  FiGithub, 
  FiTwitter, 
  FiLinkedin, 
  FiMail, 
  FiGlobe,
  FiCode,
  FiBook,
  FiHeart
} from 'react-icons/fi'
import './AuthorIntro.css'

function AuthorIntro() {
  const socialLinks = [
    {
      name: 'GitHub',
      icon: FiGithub,
      url: 'https://github.com',
      color: '#333'
    },
    {
      name: 'Twitter',
      icon: FiTwitter,
      url: 'https://twitter.com',
      color: '#1DA1F2'
    },
    {
      name: 'LinkedIn',
      icon: FiLinkedin,
      url: 'https://linkedin.com',
      color: '#0077B5'
    },
    {
      name: 'Email',
      icon: FiMail,
      url: 'mailto:author@blogzone.com',
      color: '#10b981'
    },
    {
      name: 'Website',
      icon: FiGlobe,
      url: 'https://blogzone.com',
      color: '#6366f1'
    }
  ]

  const interests = [
    { icon: FiCode, text: 'Web Development' },
    { icon: FiBook, text: 'Tech Writing' },
    { icon: FiHeart, text: 'Open Source' }
  ]

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
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
    <section className="author-section">
      <div className="author-container">
        <motion.div
          className="section-header"
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <div className="section-badge">
            <span className="badge-icon">👋</span>
            <span>About the Author</span>
          </div>
          <h2 className="section-title">Meet the Writer</h2>
          <p className="section-subtitle">
            Get to know the person behind the articles
          </p>
        </motion.div>

        <motion.div
          className="author-content"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          <motion.div
            className="author-image-wrapper"
            variants={itemVariants}
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <div className="image-border">
              <img
                src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=faces"
                alt="Author"
                className="author-image"
              />
              <div className="image-glow" />
            </div>
            <motion.div
              className="status-badge"
              animate={{
                scale: [1, 1.1, 1],
                opacity: [1, 0.8, 1]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              <span className="status-dot" />
              <span>Active Writer</span>
            </motion.div>
          </motion.div>

          <motion.div
            className="author-info"
            variants={itemVariants}
          >
            <h3 className="author-name">Alex Thompson</h3>
            <p className="author-title">Full Stack Developer & Tech Writer</p>
            
            <div className="author-bio">
              <p>
                Welcome to BlogZone! I'm a passionate full-stack developer with over 8 years of experience 
                in building modern web applications. I love sharing my knowledge about web development, 
                design patterns, and the latest technologies.
              </p>
              <p>
                Through this blog, I aim to help fellow developers learn, grow, and stay updated with 
                the ever-evolving world of technology. Whether you're a beginner or an experienced developer, 
                you'll find valuable insights, tutorials, and best practices here.
              </p>
            </div>

            <div className="author-interests">
              <h4 className="interests-title">My Interests</h4>
              <div className="interests-list">
                {interests.map((interest, index) => {
                  const Icon = interest.icon
                  return (
                    <motion.div
                      key={index}
                      className="interest-item"
                      whileHover={{ scale: 1.1, y: -5 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Icon className="interest-icon" />
                      <span>{interest.text}</span>
                    </motion.div>
                  )
                })}
              </div>
            </div>

            <div className="author-social">
              <h4 className="social-title">Connect With Me</h4>
              <div className="social-links">
                {socialLinks.map((social, index) => {
                  const Icon = social.icon
                  return (
                    <motion.a
                      key={index}
                      href={social.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="social-link"
                      whileHover={{ scale: 1.15, y: -5 }}
                      whileTap={{ scale: 0.9 }}
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.3 + index * 0.1 }}
                      style={{ '--social-color': social.color }}
                    >
                      <Icon className="social-icon" />
                      <span className="social-name">{social.name}</span>
                    </motion.a>
                  )
                })}
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}

export default AuthorIntro

