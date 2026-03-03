import { motion } from "framer-motion";
import { profile } from "../../data/profile";
import { Linkedin, Mail, Phone } from "lucide-react";


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
          Open to opportunities in AI and Machine Learning. I'd love to
          hear about your project or team.
        </p>
        <div className="contact__channels">
        <a
          href={profile.contact.linkedin}
          target="_blank"
          rel="noopener noreferrer"
          className="contact__link"
        >
          <Linkedin size={18} />
          LinkedIn
        </a>

        <a
          href={`mailto:${profile.contact.email}`}
          className="contact__link"
        >
          <Mail size={18} />
          {profile.contact.email}
        </a>

        <a
          href={`tel:${profile.contact.phone.replace(/\s/g, "")}`}
          className="contact__link"
        >
          <Phone size={18} />
          {profile.contact.phone}
        </a>
      </div>
      </motion.div>

      <style>{`
        .section-title {
          margin-bottom: 10px;
        }
        .contact__content {
          text-align: left;
          margin-top: 0px;
          margin-bottom: 0px;
        }

        .contact__message {
          margin: 0 0 var(--space-8);
          font-size: var(--text-lg);
          line-height: var(--leading-relaxed);
          color: var(--color-text);
        }

        .contact__channels {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: var(--space-6);
          margin-bottom: var(--space-8);
          flex-wrap: wrap;
        }

        .contact__link {
          font-size: var(--text-base);
          font-weight: 500;
          display: inline-flex;
          align-items: center;
          gap: 8px;
        }
      `}</style>
    </section>
  );
}
