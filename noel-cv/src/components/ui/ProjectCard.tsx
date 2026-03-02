import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { Project } from "../../data/projects";

interface ProjectCardProps {
  project: Project;
  index: number;
}

export function ProjectCard({ project, index }: ProjectCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <motion.article
      className="project-card"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
    >
      <div className="project-card__header">
        <h3 className="project-card__title">{project.title}</h3>
        <p className="project-card__one-liner">{project.oneLiner}</p>
        <div className="project-card__tags">
          {project.technologies.map((tech) => (
            <span key={tech} className="project-card__tag">
              {tech}
            </span>
          ))}
        </div>
      </div>

      <button
        type="button"
        className="project-card__toggle"
        onClick={() => setIsExpanded(!isExpanded)}
        aria-expanded={isExpanded}
      >
        {isExpanded ? "Show less" : "View details"}
      </button>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            className="project-card__details"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="project-card__detail-block">
              <h4>Problem</h4>
              <p>{project.problem}</p>
            </div>
            <div className="project-card__detail-block">
              <h4>Solution</h4>
              <p>{project.solution}</p>
            </div>
            <div className="project-card__detail-block">
              <h4>Results</h4>
              <ul>
                {project.results.map((result, i) => (
                  <li key={i}>{result}</li>
                ))}
              </ul>
            </div>
            {project.links && project.links.length > 0 && (
              <div className="project-card__links">
                {project.links.map((link) => (
                  <a
                    key={link.url}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {link.label}
                  </a>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        .project-card {
          background: var(--color-surface);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-lg);
          padding: var(--space-6);
          transition: border-color var(--transition-base);
        }

        .project-card:hover {
          border-color: var(--color-border-subtle);
        }

        .project-card__header {
          margin-bottom: var(--space-4);
        }

        .project-card__title {
          margin: 0 0 var(--space-2);
          font-size: var(--text-xl);
        }

        .project-card__one-liner {
          margin: 0 0 var(--space-4);
          font-size: var(--text-sm);
          color: var(--color-text-muted);
          line-height: var(--leading-relaxed);
        }

        .project-card__tags {
          display: flex;
          flex-wrap: wrap;
          gap: var(--space-2);
        }

        .project-card__tag {
          padding: var(--space-1) var(--space-2);
          font-size: var(--text-xs);
          background: var(--color-surface-elevated);
          border-radius: var(--radius-sm);
          color: var(--color-text-muted);
        }

        .project-card__toggle {
          padding: var(--space-2) 0;
          font-size: var(--text-sm);
          font-weight: 600;
          color: var(--color-accent);
          background: none;
          border: none;
        }

        .project-card__toggle:hover {
          color: var(--color-accent-hover);
        }

        .project-card__details {
          overflow: hidden;
          margin-top: var(--space-4);
          padding-top: var(--space-4);
          border-top: 1px solid var(--color-border);
        }

        .project-card__detail-block {
          margin-bottom: var(--space-4);
        }

        .project-card__detail-block:last-of-type {
          margin-bottom: 0;
        }

        .project-card__detail-block h4 {
          margin: 0 0 var(--space-2);
          font-size: var(--text-sm);
          font-weight: 600;
          color: var(--color-text-muted);
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .project-card__detail-block p,
        .project-card__detail-block ul {
          margin: 0;
          font-size: var(--text-sm);
          line-height: var(--leading-relaxed);
          color: var(--color-text);
        }

        .project-card__detail-block ul {
          padding-left: var(--space-5);
        }

        .project-card__detail-block li {
          margin-bottom: var(--space-1);
        }

        .project-card__links {
          display: flex;
          gap: var(--space-4);
          margin-top: var(--space-4);
        }
      `}</style>
    </motion.article>
  );
}
