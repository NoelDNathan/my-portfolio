import { motion } from "framer-motion";
import type { SkillCategory as SkillCategoryType } from "../../data/skills";

interface SkillCategoryProps {
  category: SkillCategoryType;
  index: number;
}

export function SkillCategory({ category, index }: SkillCategoryProps) {
  return (
    <motion.div
      className="skill-category"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
    >
      <h3 className="skill-category__name">{category.name}</h3>
      <ul className="skill-category__list">
        {category.skills.map((skill) => (
          <li key={skill} className="skill-category__item">
            {skill}
          </li>
        ))}
      </ul>

      <style>{`
        .skill-category {
          background: var(--color-surface);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-lg);
          padding: var(--space-5);
        }

        .skill-category__name {
          margin: 0 0 var(--space-4);
          font-size: var(--text-lg);
          font-weight: 600;
        }

        .skill-category__list {
          list-style: none;
          margin: 0;
          padding: 0;
          display: flex;
          flex-wrap: wrap;
          gap: var(--space-2);
        }

        .skill-category__item {
          padding: var(--space-2) var(--space-3);
          font-size: var(--text-sm);
          background: var(--color-surface-elevated);
          border-radius: var(--radius-md);
          color: var(--color-text);
        }
      `}</style>
    </motion.div>
  );
}
