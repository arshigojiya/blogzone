import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { 
  FiGithub, 
  FiTwitter, 
  FiLinkedin, 
  FiMail, 
  FiGlobe,
  FiHeart,
  FiArrowUp,
  FiHome,
  FiBookOpen,
  FiGrid,
  FiUser,
  FiMail as FiContact
} from 'react-icons/fi'
import './Footer.css'

function Footer() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const footerLinks = {
    blog: [
      { name: 'Home', icon: FiHome, path: '/' },
      { name: 'Blogs', icon: FiBookOpen, path: '/blogs' },
      { name: 'Categories', icon: FiGrid, path: '/categories' },
      { name: 'About', icon: FiUser, path: '/about' },
      { name: 'Contact', icon: FiContact, path: '/contact' }
    ],
    categories: [
      { name: 'Technology', href: '#technology' },
      { name: 'Design', href: '#design' },
      { name: 'Backend', href: '#backend' },
      { name: 'Frontend', href: '#frontend' },
      { name: 'DevOps', href: '#devops' }
    ],
    legal: [
      { name: 'Privacy Policy', href: '#privacy' },
      { name: 'Terms of Service', href: '#terms' },
      { name: 'Cookie Policy', href: '#cookies' }
    ]
  }

  const socialLinks = [
    {
      name: 'GitHub',
      icon: FiGithub,
      url: 'https://github.com/arshigojiya',
      color: '#333'
    },
    {
      name: 'LinkedIn',
      icon: FiLinkedin,
      url: 'https://www.linkedin.com/in/arshi-gojiya-a8564a2b1/',
      color: '#0077B5'
    },
    {
      name: 'Email',
      icon: FiMail,
      url: 'mailto:arshigojiya526@gmail.com',
      color: '#10b981'
    }
  ]

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5
      }
    }
  }

  return (
    <footer className="footer">
      <div className="footer-container">
        <motion.div
          className="footer-content"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          {/* Brand Section */}
          <motion.div className="footer-brand" variants={itemVariants}>
            <div className="brand-logo">
              <span className="logo-icon">⚡</span>
              <span className="logo-text">BlogZone</span>
            </div>
            <p className="brand-description">
              Your go-to destination for the latest tech insights, tutorials, and industry trends. 
              Stay updated with quality content from expert developers.
            </p>
            <div className="social-links">
              {socialLinks.map((social, index) => {
                const Icon = social.icon
                return (
                  <motion.a
                    key={index}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.5rem",
                        textDecoration: "none",
                        padding: "0.6rem 1rem",
                        borderRadius: "8px",
                        background: "#fff",
                        border: "1px solid #e5e7eb",
                        color: social.color,
                        fontWeight: 500,
                        transition: "all 0.2s ease",
                        boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
                      }}
                    whileHover={{ scale: 1.15, y: -5 }}
                    whileTap={{ scale: 0.9 }}
                    aria-label={social.name}
                  >
                    <Icon className="social-icon" />
                  </motion.a>
                )
              })}
            </div>
          </motion.div>

          {/* Quick Links */}
          <motion.div className="footer-column" variants={itemVariants}>
            <h3 className="column-title">Quick Links</h3>
            <ul className="footer-links">
              {footerLinks.blog.map((link, index) => {
                const Icon = link.icon
                return (
                  <li key={index}>
                    <Link to={link.path} className="footer-link">
                      <Icon className="link-icon" />
                      <span>{link.name}</span>
                    </Link>
                  </li>
                )
              })}
            </ul>
          </motion.div>

          {/* Categories */}
          <motion.div className="footer-column" variants={itemVariants}>
            <h3 className="column-title">Categories</h3>
            <ul className="footer-links">
              {footerLinks.categories.map((link, index) => (
                <li key={index}>
                  <a href={link.href} className="footer-link">
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Legal */}
          <motion.div className="footer-column" variants={itemVariants}>
            <h3 className="column-title">Legal</h3>
            <ul className="footer-links">
              {footerLinks.legal.map((link, index) => (
                <li key={index}>
                  <a href={link.href} className="footer-link">
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </motion.div>
        </motion.div>

        {/* Footer Bottom */}
        <motion.div
          className="footer-bottom"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <div className="footer-bottom-content">
            <p className="copyright">
              © {new Date().getFullYear()} BlogZone. Made with{' '}
              <FiHeart className="heart-icon" /> by{' '}
              <span className="author-name">Arshi Gojiya</span>
            </p>
            <motion.button
              onClick={scrollToTop}
              whileHover={{ scale: 1.1, y: -5 }}
              whileTap={{ scale: 0.9 }}
              aria-label="Scroll to top"
            >
              <FiArrowUp className="arrow-icon" />
            </motion.button>
          </div>
        </motion.div>
      </div>
    </footer>
  )
}

export default Footer

