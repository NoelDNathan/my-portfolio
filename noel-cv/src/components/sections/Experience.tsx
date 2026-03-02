import { motion } from "framer-motion";
import { experience } from "../../data/experience";

export function Experience() {
  return (
    <section
      id="experience"
      className="section experience"
      aria-labelledby="experience-title"
    >
      <motion.h2
        id="experience-title"
        className="section-title"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
      >
        Professional Experience
      </motion.h2>
      <div className="experience__list">
        {experience.map((item, index) => (
          <motion.article
            key={item.id}
            className="experience__item"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
          >
            <div className="experience__header">
              <div>
                <h3 className="experience__role">{item.role}</h3>
                <p className="experience__company">{item.company}</p>
              </div>
              <div className="experience__meta">
                <span className="experience__location">{item.location}</span>
                <span className="experience__period">{item.period}</span>
              </div>
            </div>
            <ul className="experience__highlights">
              {item.highlights.map((highlight, i) => (
                <li key={i}>{highlight}</li>
              ))}
            </ul>
          </motion.article>
        ))}
      </div>

      <style>{`
        .experience__list {
          display: flex;
          flex-direction: column;
          gap: var(--space-10);
        }

        .experience__item {
          padding-bottom: var(--space-10);
          border-bottom: 1px solid var(--color-border);
        }

        .experience__item:last-child {
          padding-bottom: 0;
          border-bottom: none;
        }

        .experience__header {
          display: flex;
          flex-direction: column;
          gap: var(--space-2);
          margin-bottom: var(--space-4);
        }

        @media (min-width: 768px) {
          .experience__header {
            flex-direction: row;
            justify-content: space-between;
            align-items: flex-start;
          }
        }

        .experience__role {
          margin: 0 0 var(--space-1);
          font-size: var(--text-xl);
        }

        .experience__company {
          margin: 0;
          font-size: var(--text-base);
          color: var(--color-accent);
          font-weight: 500;
        }

        .experience__meta {
          display: flex;
          flex-direction: column;
          gap: var(--space-1);
          font-size: var(--text-sm);
          color: var(--color-text-muted);
        }

        .experience__highlights {
          margin: 0;
          padding-left: var(--space-5);
        }

        .experience__highlights li {
          margin-bottom: var(--space-2);
          line-height: var(--leading-relaxed);
        }
      `}</style>
    </section>
  );
}
