import { motion } from "framer-motion";

interface CTAButtonProps {
  href: string;
  children: React.ReactNode;
  variant?: "primary" | "secondary";
}

export function CTAButton({ href, children, variant = "primary" }: CTAButtonProps) {
  return (
    <motion.a
      href={href}
      className={`cta-button cta-button--${variant}`}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: "spring", stiffness: 400, damping: 17 }}
    >
      {children}

      <style>{`
        .cta-button {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: var(--space-3) var(--space-6);
          font-family: var(--font-display);
          font-weight: 600;
          font-size: var(--text-base);
          border-radius: var(--radius-md);
          transition: all var(--transition-base);
        }

        .cta-button--primary {
          background: var(--color-accent);
          color: var(--color-bg);
        }

        .cta-button--primary:hover {
          background: var(--color-accent-hover);
          color: var(--color-bg);
        }

        .cta-button--secondary {
          background: transparent;
          color: var(--color-text);
          border: 2px solid var(--color-border);
        }

        .cta-button--secondary:hover {
          border-color: var(--color-accent);
          color: var(--color-accent);
        }
      `}</style>
    </motion.a>
  );
}
