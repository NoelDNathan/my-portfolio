import { motion } from "framer-motion";
import { education } from "../../data/education";

export function Education() {
  return (
    <section
      id="education"
      className="section education"
      aria-labelledby="education-title"
    >
      <motion.h2
        id="education-title"
        className="section-title"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
      >
        Academic Background
      </motion.h2>
      <div className="education__list">
        {education.map((item, index) => (
          <motion.article
            key={item.id}
            className="education__item"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
          >
            <h3 className="education__degree">{item.degree}</h3>
            <p className="education__institution">{item.institution}</p>
            <p className="education__details">{item.details}</p>
            <p className="education__meta">
              {item.location} · {item.period}
            </p>
          </motion.article>
        ))}
      </div>

      <style>{`
        .education__list {
          display: flex;
          flex-direction: column;
          gap: var(--space-8);
        }

        .education__item {
          padding: var(--space-6);
          background: var(--color-surface);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-lg);
        }

        .education__degree {
          margin: 0 0 var(--space-2);
          font-size: var(--text-xl);
        }

        .education__institution {
          margin: 0 0 var(--space-2);
          font-size: var(--text-base);
          color: var(--color-accent);
          font-weight: 500;
        }

        .education__details {
          margin: 0 0 var(--space-2);
          font-size: var(--text-sm);
          color: var(--color-text);
          line-height: var(--leading-relaxed);
        }

        .education__meta {
          margin: 0;
          font-size: var(--text-sm);
          color: var(--color-text-muted);
        }
      `}</style>
    </section>
  );
}
