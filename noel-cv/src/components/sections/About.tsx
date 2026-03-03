import { motion } from "framer-motion";
import { profile } from "../../data/profile";

export function About() {
  return (
    <section id="about" className="section about" aria-labelledby="about-title">
      <motion.h2
        id="about-title"
        className="section-title"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
      >
        About Me
      </motion.h2>
      <div className="about__grid">
        <motion.div
        className="about__narrative"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-50px" }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        {profile.careerNarrative.split("\n\n").map((paragraph, index) => (
          <p key={index}>{paragraph}</p>
        ))}
      </motion.div>
    </div>

      <style>{`
        .about {
          padding-top: 0px;
          padding-bottom: 0px;
        }

        #about-title.section-title {
          margin-bottom: 10px;
        }

        .about__grid {
          display: grid;
          gap: var(--space-2);
        }

        @media (min-width: 768px) {
          .about__grid {
            grid-template-columns: 1fr 1fr;
          }

          .about__narrative {
            grid-column: 1 / -1;
          }
        }

        .about__narrative p {
          margin: 0 0 var(--space-3);
          font-size: var(--text-lg);
          line-height: var(--leading-relaxed);
          color: var(--color-text);
        }

        .about__narrative p:last-child {
          margin-bottom: 0;
        }

        .about__details {
          display: flex;
          flex-direction: column;
          gap: var(--space-2);
        }

        .about__block h3 {
          margin: 0 0 var(--space-3);
          font-size: var(--text-sm);
          font-weight: 600;
          color: var(--color-text-muted);
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .about__block ul {
          list-style: none;
          margin: 0;
          padding: 0;
        }

        .about__block li {
          padding: var(--space-1) 0;
          font-size: var(--text-base);
          color: var(--color-text);
        }

        .about__block li::before {
          content: "•";
          color: var(--color-accent);
          margin-right: var(--space-2);
        }
      `}</style>
    </section>
  );
}
