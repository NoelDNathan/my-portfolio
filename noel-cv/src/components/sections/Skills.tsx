import { motion } from "framer-motion";
import { skills } from "../../data/skills";
import { SkillCategory } from "../ui/SkillCategory";

export function Skills() {
  return (
    <section id="skills" className="section skills" aria-labelledby="skills-title">
      <motion.h2
        id="skills-title"
        className="section-title"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
      >
        Technical Skills
      </motion.h2>
      <div className="skills__grid">
        {skills.map((category, index) => (
          <SkillCategory key={category.name} category={category} index={index} />
        ))}
      </div>

      <style>{`
        .skills__grid {
          display: grid;
          gap: var(--space-6);
        }

        @media (min-width: 640px) {
          .skills__grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (min-width: 1024px) {
          .skills__grid {
            grid-template-columns: repeat(3, 1fr);
          }
        }
      `}</style>
    </section>
  );
}
