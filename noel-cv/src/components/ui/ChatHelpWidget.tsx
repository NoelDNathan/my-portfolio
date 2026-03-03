import { useState, useRef, useEffect, FormEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";

const CHAT_API_URL =
  import.meta.env.VITE_CHAT_API_URL ?? "http://localhost:8787/api/chat";

console.log(CHAT_API_URL);
interface ChatMessage {
  id: number;
  role: "user" | "assistant";
  content: string;
}

const QUICK_QUESTIONS = [
  "What are your main skills?",
  "Tell me about your experience.",
  "Which projects should I look at first?",
];

export function ChatHelpWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 1,
      role: "assistant",
      content: "Hi! How can I help you explore this portfolio?",
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const autoCloseTimeoutRef = useRef<number | null>(null);
  const [idCounter, setIdCounter] = useState(2);
  const [isLoading, setIsLoading] = useState(false);
  const hasUserMessages = messages.some((message) => message.role === "user");
  const [hasAutoOpenedOnAbout, setHasAutoOpenedOnAbout] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth", block: "end" });
    }
  }, [messages, isOpen]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    if (hasAutoOpenedOnAbout) {
      return;
    }

    const aboutSection = document.querySelector<HTMLElement>("#about");
    if (!aboutSection) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setIsOpen(true);
            setHasAutoOpenedOnAbout(true);

            autoCloseTimeoutRef.current = window.setTimeout(() => {
              setIsOpen(false);
            }, 5000);

            observer.disconnect();
            break;
          }
        }
      },
      {
        threshold: 0.3,
      },
    );

    observer.observe(aboutSection);

    return () => {
      observer.disconnect();
      if (autoCloseTimeoutRef.current !== null) {
        clearTimeout(autoCloseTimeoutRef.current);
        autoCloseTimeoutRef.current = null;
      }
    };
  }, [hasAutoOpenedOnAbout]);

  const handleToggle = () => {
    if (autoCloseTimeoutRef.current !== null) {
      clearTimeout(autoCloseTimeoutRef.current);
      autoCloseTimeoutRef.current = null;
    }
    setIsOpen((prev) => !prev);
  };

  const sendMessage = async (content: string) => {
    if (!content.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: idCounter,
      role: "user",
      content,
    };

    setMessages((prev) => [...prev, userMessage]);
    setIdCounter((prev) => prev + 1);
    setIsLoading(true);

    try {
      const response = await fetch(CHAT_API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: [...messages, userMessage].map((message) => ({
            role: message.role,
            content: message.content,
          })),
        }),
      });

      if (!response.ok) {
        throw new Error("Chat API request failed");
      }

      const data: { reply?: string } = await response.json();

      const assistantMessage: ChatMessage = {
        id: idCounter + 1,
        role: "assistant",
        content:
          data.reply ??
          "Sorry, something went wrong while contacting the assistant. Please try again.",
      };

      setMessages((prev) => [...prev, assistantMessage]);
      setIdCounter((prev) => prev + 1);
    } catch (error) {
      const assistantMessage: ChatMessage = {
        id: idCounter + 1,
        role: "assistant",
        content:
          "Sorry, I could not reach the help service right now. Please try again in a moment.",
      };

      setMessages((prev) => [...prev, assistantMessage]);
      setIdCounter((prev) => prev + 1);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    const trimmed = inputValue.trim();
    if (!trimmed) return;
    setInputValue("");
    await sendMessage(trimmed);
  };

  return (
    <>
      <div className="chat-help-widget" aria-live="polite">
        <AnimatePresence>
          {isOpen && (
            <motion.div
              key="chat-panel"
              className="chat-help-widget__panel"
              initial={{ opacity: 0, y: 20, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 12, scale: 0.96 }}
              transition={{ type: "spring", stiffness: 260, damping: 22 }}
            >
              <header className="chat-help-widget__header">
                <div className="chat-help-widget__avatar">
                  <span className="chat-help-widget__avatar-initials">AI</span>
                </div>
                <div className="chat-help-widget__header-text">
                  <h2 className="chat-help-widget__title">Need a hand?</h2>
                  <p className="chat-help-widget__subtitle">
                    Ask anything about this portfolio, experience, or projects.
                  </p>
                </div>
              </header>
              <div className="chat-help-widget__messages" role="log">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`chat-help-widget__message chat-help-widget__message--${message.role}`}
                  >
                    <div className="chat-help-widget__bubble">{message.content}</div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
              {!hasUserMessages && (
                <div className="chat-help-widget__quick-questions" aria-label="Quick questions">
                  {QUICK_QUESTIONS.map((question) => (
                    <button
                      key={question}
                      type="button"
                      className="chat-help-widget__quick-question"
                      onClick={() => void sendMessage(question)}
                      disabled={isLoading}
                    >
                      {question}
                    </button>
                  ))}
                </div>
              )}
              <form className="chat-help-widget__input-row" onSubmit={handleSubmit}>
                <input
                  type="text"
                  className="chat-help-widget__input"
                  placeholder="Type your question…"
                  value={inputValue}
                  onChange={(event) => setInputValue(event.target.value)}
                  aria-label="Ask a question about this portfolio"
                  disabled={isLoading}
                />
                <button
                  type="submit"
                  className="chat-help-widget__send-button"
                  aria-label="Send message"
                  disabled={isLoading}
                >
                  <span className="chat-help-widget__send-icon" aria-hidden="true" />
                </button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.button
          type="button"
          className="chat-help-widget__launcher"
          onClick={handleToggle}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.96 }}
          aria-label={isOpen ? "Close help chat" : "Open help chat"}
        >
          <span className="chat-help-widget__launcher-icon" aria-hidden="true" />
          <span className="chat-help-widget__launcher-label">{isOpen ? "Close" : "Help"}</span>
        </motion.button>
      </div>

      <style>{`
        .chat-help-widget {
          position: fixed;
          inset-block-end: 1.75rem;
          inset-inline-end: 1.5rem;
          z-index: 40;
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 0.75rem;
        }

        .chat-help-widget__panel {
          width: min(340px, 100vw - 2.5rem);
          max-height: min(480px, 80vh);
          display: flex;
          flex-direction: column;
          border-radius: 0.9rem;
          background: var(--color-surface, #1a1a1f);
          border: 1px solid var(--color-border);
          box-shadow: 0 12px 32px rgba(0, 0, 0, 0.6);
          overflow: hidden;
        }

        .chat-help-widget__header {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.75rem 0.9rem;
          border-bottom: 1px solid var(--color-border-subtle);
          background: radial-gradient(circle at 0 0, rgba(0, 212, 170, 0.16), transparent 60%),
            #111118;
        }

        .chat-help-widget__avatar {
          position: relative;
          width: 30px;
          height: 30px;
          border-radius: 999px;
          background: #111118;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 0 0 1px var(--color-border);
          overflow: hidden;
        }

        .chat-help-widget__avatar-initials {
          font-size: 0.68rem;
          font-weight: 700;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: var(--color-text);
        }

        .chat-help-widget__status-dot {
          position: absolute;
          inset-block-end: 1px;
          inset-inline-end: 1px;
          width: 8px;
          height: 8px;
          border-radius: 999px;
          background: var(--color-accent);
          box-shadow: 0 0 0 1px #020617;
        }

        .chat-help-widget__header-text {
          display: flex;
          flex-direction: column;
          gap: 0.15rem;
          min-width: 0;
        }

        .chat-help-widget__title {
          margin: 0;
          font-size: 0.8rem;
          font-weight: 600;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: var(--color-text);
        }

        .chat-help-widget__subtitle {
          margin: 0;
          font-size: 0.74rem;
          color: var(--color-text-muted);
        }

        .chat-help-widget__messages {
          flex: 1;
          padding: 0.8rem 0.8rem 0.7rem;
          overflow: auto;
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          scrollbar-width: thin;
        }

        .chat-help-widget__quick-questions {
          display: flex;
          flex-wrap: wrap;
          gap: 0.4rem;
          padding: 0 0.8rem 0.4rem;
          justify-content: flex-end;
          width: 100%;
        }

        .chat-help-widget__quick-question {
          border-radius: 999px;
          border: 1px solid var(--color-border-subtle);
          background: rgba(15, 23, 42, 0.9);
          color: var(--color-text);
          font-size: 0.7rem;
          padding: 0.25rem 0.6rem;
          cursor: pointer;
          transition:
            background 120ms ease,
            border-color 120ms ease,
            color 120ms ease,
            transform 100ms ease;
        }

        .chat-help-widget__quick-question:hover:enabled {
          background: rgba(15, 23, 42, 1);
          border-color: var(--color-accent);
          color: var(--color-accent-hover);
          transform: translateY(-1px);
        }

        .chat-help-widget__quick-question:disabled {
          opacity: 0.6;
          cursor: default;
        }

        .chat-help-widget__messages::-webkit-scrollbar {
          width: 6px;
        }

        .chat-help-widget__messages::-webkit-scrollbar-track {
          background: transparent;
        }

        .chat-help-widget__messages::-webkit-scrollbar-thumb {
          background: rgba(148, 163, 184, 0.7);
          border-radius: 999px;
        }

        .chat-help-widget__message {
          display: flex;
        }

        .chat-help-widget__message--assistant {
          justify-content: flex-start;
        }

        .chat-help-widget__message--user {
          justify-content: flex-end;
        }

        .chat-help-widget__bubble {
          max-width: 80%;
          padding: 0.55rem 0.75rem;
          border-radius: 1rem;
          font-size: 0.76rem;
          line-height: 1.35;
          letter-spacing: 0.01em;
          color: #e5e7eb;
        }

        .chat-help-widget__message--assistant .chat-help-widget__bubble {
          border-bottom-left-radius: 0.25rem;
          background: #111118;
          border: 1px solid var(--color-border);
        }

        .chat-help-widget__message--user .chat-help-widget__bubble {
          border-bottom-right-radius: 0.25rem;
          background: #111118;
          border: 1px solid var(--color-accent);
          color: var(--color-accent-hover);
        }

        .chat-help-widget__input-row {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          padding: 0.6rem 0.75rem 0.7rem;
          border-top: 1px solid var(--color-border-subtle);
          background: #111118;
        }

        .chat-help-widget__input {
          flex: 1;
          padding: 0.45rem 0.7rem;
          border-radius: 999px;
          border: 1px solid var(--color-border);
          background: #111118;
          color: var(--color-text);
          font-size: 0.78rem;
          outline: none;
          transition:
            border-color 150ms ease,
            box-shadow 150ms ease,
            background 150ms ease;
        }

        .chat-help-widget__input::placeholder {
          color: #6b7280;
        }

        .chat-help-widget__input:focus {
          border-color: var(--color-accent);
          box-shadow: 0 0 0 1px rgba(0, 212, 170, 0.55);
          background: #111118;
        }

        .chat-help-widget__send-button {
          width: 32px;
          height: 32px;
          border-radius: 999px;
          border: none;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          background: var(--color-accent);
          cursor: pointer;
          box-shadow: 0 8px 18px rgba(0, 0, 0, 0.7);
          transition:
            transform 120ms ease,
            box-shadow 150ms ease,
            filter 120ms ease;
        }

        .chat-help-widget__send-button:hover {
          filter: brightness(1.03);
          box-shadow: 0 10px 22px rgba(0, 0, 0, 0.8);
        }

        .chat-help-widget__send-button:active {
          transform: translateY(1px) scale(0.97);
          box-shadow: 0 4px 10px rgba(0, 0, 0, 0.7);
        }

        .chat-help-widget__send-icon {
          width: 14px;
          height: 14px;
          background: currentColor;
          clip-path: polygon(0 50%, 100% 0, 60% 50%, 100% 100%);
        }

        .chat-help-widget__launcher {
          display: inline-flex;
          align-items: center;
          gap: 0.45rem;
          padding: 0.5rem 0.9rem;
          border-radius: 999px;
          border: 1px solid var(--color-border);
          background: rgba(17, 17, 24, 0.96);
          color: var(--color-text);
          font-size: 0.78rem;
          font-weight: 500;
          cursor: pointer;
          box-shadow: 0 10px 24px rgba(0, 0, 0, 0.8);
        }

        .chat-help-widget__launcher-icon {
          width: 18px;
          height: 18px;
          border-radius: 999px;
          background: linear-gradient(135deg, var(--color-accent), var(--color-accent-hover));
          box-shadow: 0 0 0 1px rgba(15, 23, 42, 0.95);
        }

        .chat-help-widget__launcher-label {
          letter-spacing: 0.09em;
          text-transform: uppercase;
        }

        @media (max-width: 640px) {
          .chat-help-widget {
            inset-inline-end: 1rem;
            inset-block-end: 1.1rem;
          }

          .chat-help-widget__panel {
            width: min(100vw - 2rem, 380px);
          }

          .chat-help-widget__launcher-label {
            display: none;
          }
        }
      `}</style>
    </>
  );
}
