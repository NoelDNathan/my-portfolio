import { motion } from "framer-motion";
import { profile } from "../../data/profile";
import { CTAButton } from "../ui/CTAButton";

export function Contact() {
  return (
    <section id="contact" className="section contact" aria-labelledby="contact-title">
      <motion.h2
        id="contact-title"
        className="section-title"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
      >
        Let's Talk
      </motion.h2>
      <motion.div
        className="contact__content"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <p className="contact__message">
          Open to opportunities in AI, computer vision, and optimization. I'd love to
          hear about your project or team.
        </p>
        <div className="contact__channels">
          <a
            href={profile.contact.linkedin}
            target="_blank"
            rel="noopener noreferrer"
            className="contact__link"
          >
            LinkedIn
          </a>
          <a href={`mailto:${profile.contact.email}`} className="contact__link">
            {profile.contact.email}
          </a>
          <a href={`tel:${profile.contact.phone.replace(/\s/g, "")}`} className="contact__link">
            {profile.contact.phone}
          </a>
        </div>
        <CTAButton href={`mailto:${profile.contact.email}`}>
          Get in Touch
        </CTAButton>
      </motion.div>

      <style>{`
        .contact__content {
          max-width: 560px;
          text-align: center;
        }

        .contact__message {
          margin: 0 0 var(--space-8);
          font-size: var(--text-lg);
          line-height: var(--leading-relaxed);
          color: var(--color-text);
        }

        .contact__channels {
          display: flex;
          flex-direction: column;
          gap: var(--space-3);
          margin-bottom: var(--space-8);
        }

        .contact__link {
          font-size: var(--text-base);
          font-weight: 500;
        }
      `}</style>
    </section>
  );
}
