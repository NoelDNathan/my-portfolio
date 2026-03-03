import { motion } from "framer-motion";
import { profile } from "../../data/profile";
import { CTAButton } from "../ui/CTAButton";

export function Hero() {
  return (
    <section id="home" className="hero" aria-label="Introduction">
      <div className="hero__inner">
        <div className="hero__content">
          <motion.h1
            className="hero__title"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {profile.name}
          </motion.h1>
          <motion.p
            className="hero__headline"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            {profile.headline}
          </motion.p>
          <motion.p
            className="hero__value-prop"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            {profile.valueProposition}
          </motion.p>
          <motion.div
            className="hero__ctas"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <CTAButton href="#timeline">View My Work</CTAButton>
            <CTAButton href="#contact" variant="secondary">
              Get in Touch
            </CTAButton>
          </motion.div>
        </div>

        <motion.figure
          className="hero__media"
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.25 }}
        >
          <img src="/perfil.jpg" alt="Portrait of Noel Nathan" className="hero__photo" />
        </motion.figure>
      </div>

      <style>{`
        .hero {
          min-height: 100vh;
          display: flex;
          align-items: center;
          padding: 0px;
        }

        .hero__inner {
          display: flex;
          flex-direction: column-reverse;
          align-items: center;
          gap: var(--space-12);
          max-width: 1120px;
          width: 100%;
          margin: 0 auto;
        }

        .hero__content {
          max-width: 640px;
          text-align: center;
        }

        .hero__media {
          flex-shrink: 0;
        }

        .hero__photo {
          width: 260px;
          height: auto;
          border-radius: 24px;
          box-shadow: 0 32px 80px rgba(15, 23, 42, 0.55);
          border: 3px solid rgba(148, 163, 184, 0.7);
        }

        .hero__title {
          margin: 0 0 var(--space-4);
          font-size: clamp(2.25rem, 6vw, 3.5rem);
          font-weight: 700;
          letter-spacing: -0.02em;
        }

        .hero__headline {
          margin: 0 0 var(--space-4);
          font-size: var(--text-xl);
          color: var(--color-text-muted);
          font-weight: 500;
        }

        .hero__value-prop {
          margin: 0 0 var(--space-10);
          font-size: var(--text-lg);
          line-height: var(--leading-relaxed);
          color: var(--color-text);
        }

        .hero__ctas {
          display: flex;
          flex-wrap: wrap;
          gap: var(--space-4);
          justify-content: center;
        }

        @media (min-width: 768px) {
          .hero__inner {
            flex-direction: row;
            justify-content: space-between;
          }

          .hero__content {
            text-align: left;
          }

          .hero__ctas {
            justify-content: flex-start;
          }
        }
      `}</style>
    </section>
  );
}
