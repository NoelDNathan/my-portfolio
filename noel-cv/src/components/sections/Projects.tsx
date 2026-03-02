import { motion } from "framer-motion";
import { projects } from "../../data/projects";
import { ProjectCard } from "../ui/ProjectCard";

export function Projects() {
  return (
    <section id="projects" className="section projects" aria-labelledby="projects-title">
      <motion.h2
        id="projects-title"
        className="section-title"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
      >
        Featured Projects
      </motion.h2>
      <div className="projects__grid">
        {projects.map((project, index) => (
          <ProjectCard key={project.id} project={project} index={index} />
        ))}
      </div>

      <style>{`
        .projects__grid {
          display: grid;
          gap: var(--space-8);
        }

        @media (min-width: 768px) {
          .projects__grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (min-width: 1024px) {
          .projects__grid {
            grid-template-columns: repeat(3, 1fr);
          }
        }
      `}</style>
    </section>
  );
}
