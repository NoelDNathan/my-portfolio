import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const navItems = [
  { id: "home", label: "Home", href: "#home" },
  { id: "about", label: "About", href: "#about" },
  { id: "projects", label: "Projects", href: "#projects" },
  { id: "skills", label: "Skills", href: "#skills" },
  { id: "experience", label: "Experience", href: "#experience" },
  { id: "education", label: "Education", href: "#education" },
  { id: "sancho-demo", label: "Sancho", href: "#sancho-demo" },
  { id: "contact", label: "Contact", href: "#contact" },
];

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleNavClick = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <motion.header
      className="header"
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      <div className={`header__inner ${isScrolled ? "header__inner--scrolled" : ""}`}>
        <a href="#home" className="header__logo" onClick={handleNavClick}>
          Noel Nathan
        </a>

        <nav className="header__nav" aria-label="Main navigation">
          <ul className="header__nav-list">
            {navItems.slice(1).map((item) => (
              <li key={item.id}>
                <a
                  href={item.href}
                  className="header__nav-link"
                  onClick={handleNavClick}
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <button
          type="button"
          className="header__menu-btn"
          aria-expanded={isMobileMenuOpen}
          aria-controls="mobile-menu"
          aria-label="Toggle menu"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          <span className="header__menu-icon" />
          <span className="header__menu-icon" />
          <span className="header__menu-icon" />
        </button>
      </div>

      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            id="mobile-menu"
            className="header__mobile-menu"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
          >
            <ul className="header__mobile-list">
              {navItems.map((item) => (
                <li key={item.id}>
                  <a
                    href={item.href}
                    className="header__mobile-link"
                    onClick={handleNavClick}
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        .header {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          z-index: 100;
        }

        .header__inner {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: var(--space-4) var(--space-6);
          background: transparent;
          transition: background var(--transition-base);
        }

        .header__inner--scrolled {
          background: rgba(15, 15, 18, 0.9);
          backdrop-filter: blur(12px);
          border-bottom: 1px solid var(--color-border-subtle);
        }

        .header__logo {
          font-family: var(--font-display);
          font-weight: 600;
          font-size: var(--text-lg);
          color: var(--color-text);
        }

        .header__logo:hover {
          color: var(--color-accent);
        }

        .header__nav {
          display: none;
        }

        .header__nav-list {
          display: flex;
          gap: var(--space-6);
          list-style: none;
          margin: 0;
          padding: 0;
        }

        .header__nav-link {
          font-size: var(--text-sm);
          font-weight: 500;
          color: var(--color-text-muted);
        }

        .header__nav-link:hover {
          color: var(--color-text);
        }

        .header__menu-btn {
          display: flex;
          flex-direction: column;
          gap: 5px;
          padding: var(--space-2);
          background: none;
          border: none;
        }

        .header__menu-icon {
          width: 24px;
          height: 2px;
          background: var(--color-text);
        }

        .header__mobile-menu {
          background: var(--color-surface);
          border-bottom: 1px solid var(--color-border);
          overflow: hidden;
        }

        .header__mobile-list {
          list-style: none;
          margin: 0;
          padding: var(--space-4);
          display: flex;
          flex-direction: column;
          gap: var(--space-2);
        }

        .header__mobile-link {
          display: block;
          padding: var(--space-2);
          color: var(--color-text);
          font-weight: 500;
        }

        .header__mobile-link:hover {
          color: var(--color-accent);
        }

        @media (min-width: 768px) {
          .header__nav {
            display: block;
          }

          .header__menu-btn {
            display: none;
          }

          .header__mobile-menu {
            display: none !important;
          }
        }
      `}</style>
    </motion.header>
  );
}
