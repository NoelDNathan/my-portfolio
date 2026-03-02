import { profile } from "../../data/profile";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer" role="contentinfo">
      <div className="footer__inner">
        <p className="footer__copyright">
          © {currentYear} {profile.name}. All rights reserved.
        </p>
        <div className="footer__links">
          <a href={profile.contact.linkedin} target="_blank" rel="noopener noreferrer">
            LinkedIn
          </a>
          <a href={`mailto:${profile.contact.email}`}>Email</a>
        </div>
      </div>

      <style>{`
        .footer {
          padding: var(--space-8) var(--space-6);
          border-top: 1px solid var(--color-border);
          background: var(--color-surface);
        }

        .footer__inner {
          max-width: var(--max-width);
          margin: 0 auto;
          display: flex;
          flex-direction: column;
          gap: var(--space-4);
          align-items: center;
          text-align: center;
        }

        .footer__copyright {
          margin: 0;
          font-size: var(--text-sm);
          color: var(--color-text-muted);
        }

        .footer__links {
          display: flex;
          gap: var(--space-6);
        }

        .footer__links a {
          font-size: var(--text-sm);
        }

        @media (min-width: 640px) {
          .footer__inner {
            flex-direction: row;
            justify-content: space-between;
          }
        }
      `}</style>
    </footer>
  );
}
