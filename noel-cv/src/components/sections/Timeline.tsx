import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion, useInView, useReducedMotion } from "framer-motion";
import {
  timelineItems,
  type TimelineItem,
  type TimelineVideo as TimelineVideoMeta,
  type TimelineTopic,
} from "../../data/timeline";

interface TimelineRowProps {
  item: TimelineItem;
  isActive: boolean;
  isPinned: boolean;
  isSingleTrack: boolean;
  onAutoActivate: () => void;
  onClick: () => void;
}

function TimelineRow({
  item,
  isActive,
  isPinned,
  isSingleTrack,
  onAutoActivate,
  onClick,
}: TimelineRowProps) {
  const ref = useRef<HTMLDivElement | null>(null);
  const trackRef = useRef<HTMLDivElement | null>(null);
  const isInView = useInView(ref, {
    margin: "-35% 0px -35% 0px",
  });
  const shouldReduceMotion = useReducedMotion();
  const [rangeStyle, setRangeStyle] = useState<{ height: number; offset: number } | null>(null);

  useEffect(() => {
    if (isInView && !isPinned) {
      onAutoActivate();
    }
  }, [isInView, isPinned, onAutoActivate]);

  const hasRange = item.yearEnd !== undefined && item.yearEnd !== item.yearStart;

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    let rafId = 0;
    const scheduleRangeStyle = (next: { height: number; offset: number } | null) => {
      rafId = window.requestAnimationFrame(() => {
        setRangeStyle(next);
      });
    };

    if (!hasRange || !isActive) {
      scheduleRangeStyle(null);

      return () => window.cancelAnimationFrame(rafId);
    }

    const trackEl = trackRef.current;
    if (!trackEl) {
      scheduleRangeStyle(null);
      return () => window.cancelAnimationFrame(rafId);
    }

    const endYear = item.yearEnd ?? item.yearStart;
    const endSeparator = document.querySelector<HTMLElement>(`[data-timeline-year="${endYear}"]`);

    if (!endSeparator) {
      scheduleRangeStyle(null);
      return () => window.cancelAnimationFrame(rafId);
    }

    const trackRect = trackEl.getBoundingClientRect();
    const endRect = endSeparator.getBoundingClientRect();

    const startCenterY = trackRect.top + trackRect.height / 2;
    const rawOffset = endRect.top - startCenterY;

    if (!Number.isFinite(rawOffset)) {
      scheduleRangeStyle(null);
      return () => window.cancelAnimationFrame(rafId);
    }

    const minOffset = 24;
    const maxOffset = 320;
    const offset = Math.max(minOffset, Math.min(rawOffset, maxOffset));
    const height = Math.max(12, offset - 10);

    scheduleRangeStyle({ height, offset });

    return () => window.cancelAnimationFrame(rafId);
  }, [hasRange, isActive, item.yearEnd, item.yearStart]);

  const dotVariants = {
    inactive: { scale: 0.9, opacity: 0.6 },
    active: {
      scale: 1.2,
      opacity: 1,
      boxShadow: "0 0 18px rgba(94, 234, 212, 0.9)",
    },
  };

  return (
    <div
      ref={ref}
      className={`timeline__row ${isActive ? "timeline__row--active" : ""}`}
      tabIndex={0}
      onFocus={onAutoActivate}
      onMouseEnter={onAutoActivate}
      onClick={onClick}
      aria-current={isActive ? "step" : undefined}
    >
      <div className="timeline__row-track" ref={trackRef}>
        <motion.span
          className={`timeline__dot timeline__dot--${item.topic} ${isSingleTrack ? "timeline__dot--single" : ""}`}
          variants={dotVariants}
          initial="inactive"
          animate={isActive ? "active" : "inactive"}
          transition={
            shouldReduceMotion ? { duration: 0 } : { type: "spring", stiffness: 260, damping: 24 }
          }
        />
        {hasRange && isActive && (
          <>
            <motion.span
              className={`timeline__duration timeline__duration--${item.topic} ${
                isSingleTrack ? "timeline__duration--single" : ""
              }`}
              style={rangeStyle ? { height: rangeStyle.height } : undefined}
              initial={{ opacity: 0, scaleY: 0.3 }}
              animate={{ opacity: 0.8, scaleY: 1 }}
              exit={{ opacity: 0, scaleY: 0.3 }}
              transition={
                shouldReduceMotion
                  ? { duration: 0 }
                  : { type: "spring", stiffness: 260, damping: 24 }
              }
            />
            <motion.span
              className={`timeline__dot timeline__dot--secondary timeline__dot--${item.topic} ${
                isSingleTrack ? "timeline__dot--single" : ""
              }`}
              variants={dotVariants}
              initial="inactive"
              animate="active"
              style={rangeStyle ? { y: rangeStyle.offset } : undefined}
              transition={
                shouldReduceMotion
                  ? { duration: 0 }
                  : { type: "spring", stiffness: 260, damping: 24 }
              }
            />
          </>
        )}
      </div>
      <div className="timeline__row-label">
        <p className="timeline__row-title">{item.title}</p>
        <p className="timeline__row-period">{item.period}</p>
      </div>
    </div>
  );
}

interface TimelineVideoProps {
  video?: TimelineVideoMeta | null;
}

function TimelineVideo({ video }: TimelineVideoProps) {
  if (!video) {
    return null;
  }

  const hasUrl = Boolean(video.url);

  return (
    <section className="timeline__video" aria-label="Project video">
      <h3 className="timeline__video-title">Project video</h3>
      {hasUrl ? (
        <div className="timeline__video-frame">
          <iframe
            src={video.url}
            title={video.label}
            loading="lazy"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      ) : (
        <div className="timeline__video-placeholder">
          <div className="timeline__video-icon" aria-hidden="true" />
          <div className="timeline__video-text">
            <p className="timeline__video-label">{video.label}</p>
            <p className="timeline__video-hint">Video coming soon.</p>
          </div>
        </div>
      )}
    </section>
  );
}

export function Timeline() {
  const sortedItems = useMemo(
    () =>
      [...timelineItems].sort((a, b) => {
        if (a.yearStart !== b.yearStart) {
          return a.yearStart - b.yearStart;
        }
        const aEnd = a.yearEnd ?? a.yearStart;
        const bEnd = b.yearEnd ?? b.yearStart;
        if (aEnd !== bEnd) {
          return aEnd - bEnd;
        }
        return a.id.localeCompare(b.id);
      }),
    [],
  );

  type TimelineTopicFilter = TimelineTopic | "all";
  const topicFilters = useMemo(
    () =>
      [
        { id: "all" as const, label: "All" },
        { id: "education" as const, label: "Education" },
        { id: "professional" as const, label: "Professional" },
        { id: "project" as const, label: "Projects" },
        { id: "course" as const, label: "Courses" },
        { id: "sport" as const, label: "Sport" },
      ] satisfies Array<{ id: TimelineTopicFilter; label: string }>,
    [],
  );

  const [topicFilter, setTopicFilter] = useState<TimelineTopicFilter>("all");
  const [activeId, setActiveId] = useState<string | null>(
    sortedItems.length > 0 ? sortedItems[0].id : null,
  );
  const [pinnedId, setPinnedId] = useState<string | null>(null);
  const [pinnedScrollY, setPinnedScrollY] = useState<number | null>(null);
  const shouldReduceMotion = useReducedMotion();
  const itemContainerRefs = useRef<Map<string, HTMLDivElement>>(new Map());

  const [tourStatus, setTourStatus] = useState<"idle" | "playing" | "paused">("idle");
  const [tourIndex, setTourIndex] = useState<number>(0);
  const tourTimerRef = useRef<number | null>(null);
  const tourStatusRef = useRef(tourStatus);

  useEffect(() => {
    tourStatusRef.current = tourStatus;
  }, [tourStatus]);

  const visibleItems = useMemo(() => {
    if (topicFilter === "all") {
      return sortedItems;
    }
    return sortedItems.filter((item) => item.topic === topicFilter);
  }, [sortedItems, topicFilter]);

  const isSingleTrack = topicFilter !== "all";

  const ensureItemIsVisible = (id: string) => {
    const node = itemContainerRefs.current.get(id);
    if (!node || typeof window === "undefined") {
      return;
    }

    node.scrollIntoView({
      behavior: shouldReduceMotion ? "auto" : "smooth",
      block: "center",
      inline: "nearest",
    });

    const row = node.querySelector<HTMLDivElement>(".timeline__row");
    row?.focus({ preventScroll: true });
  };

  const clearTourTimer = () => {
    if (typeof window === "undefined") {
      return;
    }
    if (tourTimerRef.current === null) {
      return;
    }
    window.clearTimeout(tourTimerRef.current);
    tourTimerRef.current = null;
  };

  const countWords = (value: string) => {
    const trimmed = value.trim();
    if (!trimmed) {
      return 0;
    }
    return trimmed.split(/\s+/).length;
  };

  const getTourStepDurationMs = (item: TimelineItem) => {
    const textParts: string[] = [item.title, item.period, item.description, ...item.learnings];
    if (item.links && item.links.length > 0) {
      textParts.push(...item.links.map((link) => link.label));
    }

    const wordCount = countWords(textParts.join(" "));

    const baseMs = 900; // scroll + UI settle time
    const msPerWord = 120; // ~250 WPM reading pace
    const minMs = 1800;
    const maxMs = 15000;

    const estimated = baseMs + wordCount * msPerWord;
    return Math.max(minMs, Math.min(estimated, maxMs));
  };

  const stopTour = () => {
    clearTourTimer();
    setTourStatus("idle");
  };

  const applyTopicFilter = (nextFilter: TimelineTopicFilter) => {
    stopTour();
    setTourIndex(0);
    setPinnedId(null);
    setPinnedScrollY(null);
    const next = topicFilter === nextFilter ? "all" : nextFilter;
    setTopicFilter(next);

    const nextVisibleItems =
      next === "all" ? sortedItems : sortedItems.filter((item) => item.topic === next);
    setActiveId(nextVisibleItems[0]?.id ?? null);
  };

  const runTourStep = (nextIndex: number) => {
    if (typeof window === "undefined") {
      return;
    }

    if (visibleItems.length === 0) {
      stopTour();
      setTourIndex(0);
      return;
    }

    if (nextIndex >= visibleItems.length) {
      stopTour();
      setTourIndex(Math.max(0, visibleItems.length - 1));
      return;
    }

    const item = visibleItems[nextIndex];
    setTourIndex(nextIndex);
    setPinnedId(null);
    setPinnedScrollY(null);
    setActiveId(item.id);
    ensureItemIsVisible(item.id);

    clearTourTimer();
    const stepDurationMs = getTourStepDurationMs(item);
    tourTimerRef.current = window.setTimeout(() => {
      if (tourStatusRef.current !== "playing") {
        return;
      }
      runTourStep(nextIndex + 1);
    }, stepDurationMs);
  };

  useEffect(() => {
    return () => {
      clearTourTimer();
    };
  }, []);

  useEffect(() => {
    if (!pinnedId) {
      return;
    }

    const handleScroll = () => {
      if (pinnedScrollY === null) {
        return;
      }

      const offset = Math.abs(window.scrollY - pinnedScrollY);
      if (offset > 160) {
        setPinnedId(null);
        setPinnedScrollY(null);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [pinnedId, pinnedScrollY]);

  const activeItem = visibleItems.find((item) => item.id === activeId) ?? visibleItems[0] ?? null;
  const tourProgressLabel =
    visibleItems.length > 0
      ? `${Math.min(tourIndex + 1, visibleItems.length)}/${visibleItems.length}`
      : "0/0";

  return (
    <section
      id="timeline"
      className={`section timeline ${isSingleTrack ? "timeline--single-track" : ""}`}
      aria-labelledby="timeline-title"
    >
      <div className="timeline__inner">
        <motion.h2
          id="timeline-title"
          className="section-title"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5 }}
        >
          Journey Timeline
        </motion.h2>

        <motion.p
          className="timeline__intro"
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          A vertical journey through my education, professional experience, projects, courses, and
          sport. Scroll to move through time – each milestone expands as it comes into focus.
        </motion.p>

        <div className="timeline__tour" role="group" aria-label="Timeline guided tour controls">
          <div className="timeline__tour-copy">
            <p className="timeline__tour-title">Guided tour</p>
            <p className="timeline__tour-description">
              Press play to automatically walk through the milestones. You can pause anytime and keep scrolling normally.
            </p>
          </div>

          <div className="timeline__tour-controls">
            <button
              type="button"
              className={`timeline__tour-button timeline__tour-button--primary ${
                tourStatus === "playing" ? "timeline__tour-button--is-active" : ""
              }`}
              onClick={() => {
                if (visibleItems.length === 0) {
                  return;
                }

                if (tourStatus === "playing") {
                  clearTourTimer();
                  setTourStatus("paused");
                  return;
                }

                const activeIndex = activeId ? visibleItems.findIndex((item) => item.id === activeId) : -1;
                setTourStatus("playing");
                tourStatusRef.current = "playing";
                runTourStep(activeIndex >= 0 ? activeIndex : 0);
              }}
              aria-pressed={tourStatus === "playing"}
            >
              <span className="timeline__tour-button-icon" aria-hidden="true">
                {tourStatus === "playing" ? (
                  <svg viewBox="0 0 24 24" width="20" height="20" focusable="false" aria-hidden="true">
                    <path fill="currentColor" d="M7 5h4v14H7zM13 5h4v14h-4z" />
                  </svg>
                ) : (
                  <svg viewBox="0 0 24 24" width="20" height="20" focusable="false" aria-hidden="true">
                    <path fill="currentColor" d="M8 5v14l11-7z" />
                  </svg>
                )}
              </span>
              <span className="timeline__tour-button-label">{tourStatus === "playing" ? "Pause" : "Play"}</span>
              <span className="timeline__tour-progress" aria-hidden="true">
                {tourProgressLabel}
              </span>
            </button>

            <button
              type="button"
              className="timeline__tour-button"
              onClick={() => {
                stopTour();
                setTourIndex(0);
              }}
              disabled={tourStatus === "idle" && tourIndex === 0}
            >
              <span className="timeline__tour-button-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" width="18" height="18" focusable="false" aria-hidden="true">
                  <path fill="currentColor" d="M7 7h10v10H7z" />
                </svg>
              </span>
              <span className="timeline__tour-button-label">Stop</span>
            </button>
          </div>

          <div className="timeline__filters" role="group" aria-label="Filter timeline by track">
            <p className="timeline__filters-label">Filter by track</p>
            <div className="timeline__filter-chips">
              {topicFilters.map((filter) => {
                const isActive = topicFilter === filter.id;
                const isTopicFilter = filter.id !== "all";

                return (
                  <button
                    key={filter.id}
                    type="button"
                    className={`timeline__chip ${isActive ? "timeline__chip--active" : ""} ${
                      isTopicFilter ? `timeline__chip--${filter.id}` : "timeline__chip--all"
                    }`}
                    onClick={() => applyTopicFilter(filter.id)}
                    aria-pressed={isActive}
                  >
                    {filter.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="timeline__layout">
          <div className="timeline__events" aria-label="Timeline of experience">
            <div
              className="timeline__tracks"
              aria-hidden="true"
              style={{
                gridTemplateColumns: isSingleTrack ? "minmax(0, 1fr)" : "repeat(5, minmax(0, 1fr))",
              }}
            >
              {isSingleTrack ? (
                <div className={`timeline__track timeline__track--${topicFilter}`}>
                  <span className="timeline__track-label">
                    {topicFilters.find((filter) => filter.id === topicFilter)?.label ?? "Track"}
                  </span>
                </div>
              ) : (
                <>
                  <div className="timeline__track timeline__track--education">
                    <span className="timeline__track-label">Education</span>
                  </div>
                  <div className="timeline__track timeline__track--professional">
                    <span className="timeline__track-label">Professional</span>
                  </div>
                  <div className="timeline__track timeline__track--project">
                    <span className="timeline__track-label">Projects</span>
                  </div>
                  <div className="timeline__track timeline__track--course">
                    <span className="timeline__track-label">Courses</span>
                  </div>
                  <div className="timeline__track timeline__track--sport">
                    <span className="timeline__track-label">Sport</span>
                  </div>
                </>
              )}
            </div>

            <div className="timeline__rows">
              {visibleItems.map((item, index) => {
                const previous = index > 0 ? visibleItems[index - 1] : null;
                const isNewYear = !previous || previous.yearStart !== item.yearStart;
                const shouldShowYearSeparator = index > 0 && isNewYear;

                return (
                  <div key={item.id}>
                    {shouldShowYearSeparator && (
                      <div
                        className="timeline__year-separator"
                        role="separator"
                        aria-label={String(item.yearStart)}
                        data-timeline-year={item.yearStart}
                      >
                        <span className="timeline__year-separator-label">{item.yearStart}</span>
                      </div>
                    )}
                    <div
                      ref={(node) => {
                        if (node) {
                          itemContainerRefs.current.set(item.id, node);
                          return;
                        }
                        itemContainerRefs.current.delete(item.id);
                      }}
                      data-timeline-item={item.id}
                    >
                      <TimelineRow
                        item={item}
                        isActive={item.id === activeId}
                        isPinned={pinnedId === item.id}
                        isSingleTrack={isSingleTrack}
                        onAutoActivate={() => {
                          if (!pinnedId) {
                            setActiveId(item.id);
                          }
                        }}
                        onClick={() => {
                          stopTour();
                          const currentScrollY = typeof window !== "undefined" ? window.scrollY : 0;
                          setPinnedId(item.id);
                          setPinnedScrollY(currentScrollY);
                          setActiveId(item.id);
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="timeline__detail" aria-live="polite">
            <AnimatePresence mode="wait">
              {activeItem && (
                <motion.article
                  key={activeItem.id}
                  className="timeline__detail-card"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.3 }}
                >
                  <header className="timeline__detail-header">
                    <div>
                      <h3 className="timeline__detail-title">{activeItem.title}</h3>
                      <p className="timeline__detail-period">{activeItem.period}</p>
                    </div>
                    <span
                      className={`timeline__item-topic timeline__item-topic--${activeItem.topic}`}
                    >
                      {activeItem.topic === "education" && "Education"}
                      {activeItem.topic === "project" && "Project"}
                      {activeItem.topic === "professional" && "Professional"}
                      {activeItem.topic === "course" && "Course"}
                      {activeItem.topic === "sport" && "Sport"}
                    </span>
                  </header>

                  {activeItem.links && activeItem.links.length > 0 && (
                    <section className="timeline__detail-links" aria-label="Related links">
                      <h4 className="timeline__detail-subtitle">Links</h4>
                      <ul>
                        {activeItem.links.map((link) => (
                          <li key={link.label}>
                            <a href={link.url} target="_blank" rel="noreferrer">
                              {link.label}
                            </a>
                          </li>
                        ))}
                      </ul>
                    </section>
                  )}

                  <TimelineVideo video={activeItem.video} />

                  <p className="timeline__detail-description">{activeItem.description}</p>

                  {activeItem.learnings.length > 0 && (
                    <section
                      className="timeline__detail-learnings"
                      aria-label="Skills and learnings"
                    >
                      <h4 className="timeline__detail-subtitle">Skills and learnings</h4>
                      <ul>
                        {activeItem.learnings.map((learning, index) => (
                          <li key={index}>{learning}</li>
                        ))}
                      </ul>
                    </section>
                  )}

                  {activeItem.shortSkills && activeItem.shortSkills.length > 0 && (
                    <section
                      className="timeline__detail-short-skills"
                      aria-label="Key skills"
                    >
                      <h4 className="timeline__detail-subtitle">Key skills</h4>
                      <ul className="timeline__short-skills">
                        {activeItem.shortSkills.map((skill, index) => (
                          <li key={`${skill}-${index}`} className="timeline__short-skill">
                            {skill}
                          </li>
                        ))}
                      </ul>
                    </section>
                  )}
                </motion.article>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      <style>{`
        .timeline__inner {
          display: flex;
          flex-direction: column;
          gap: var(--space-6);
        }

        .timeline__intro {
          max-width: 45rem;
          font-size: var(--text-base);
          color: var(--color-text-muted);
        }

        .timeline__tour {
          display: grid;
          gap: var(--space-4);
          padding: clamp(1rem, 2vw, 1.35rem);
          margin-bottom: var(--space-10);
          border-radius: var(--radius-xl);
          border: 1px solid rgba(148, 163, 184, 0.35);
          background: radial-gradient(
              circle at 18% 22%,
              rgba(94, 234, 212, 0.18),
              transparent 55%
            ),
            radial-gradient(circle at 78% 8%, rgba(129, 140, 248, 0.16), transparent 42%),
            rgba(12, 12, 18, 0.92);
          box-shadow:
            0 0 0 1px rgba(15, 23, 42, 0.75),
            0 26px 80px rgba(0, 0, 0, 0.55);
        }

        .timeline__tour-copy {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
          max-width: 54rem;
        }

        .timeline__tour-title {
          margin: 0;
          font-size: var(--text-sm);
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: rgba(248, 250, 252, 0.9);
        }

        .timeline__tour-description {
          margin: 0;
          font-size: var(--text-sm);
          line-height: var(--leading-relaxed);
          color: var(--color-text-muted);
        }

        .timeline__tour-controls {
          display: flex;
          flex-wrap: wrap;
          gap: var(--space-3);
          align-items: center;
        }

        .timeline__filters {
          display: flex;
          flex-direction: column;
          gap: var(--space-3);
        }

        .timeline__filters-label {
          margin: 0;
          font-size: var(--text-xs);
          text-transform: uppercase;
          letter-spacing: 0.14em;
          color: rgba(226, 232, 240, 0.78);
        }

        .timeline__filter-chips {
          display: flex;
          flex-wrap: wrap;
          gap: var(--space-2);
          align-items: center;
        }

        .timeline__chip {
          appearance: none;
          border: 1px solid rgba(148, 163, 184, 0.38);
          background: rgba(2, 6, 23, 0.35);
          color: rgba(226, 232, 240, 0.9);
          border-radius: 999px;
          padding: 0.45rem 0.75rem;
          font-size: var(--text-xs);
          letter-spacing: 0.04em;
          transition:
            transform 160ms ease,
            border-color 160ms ease,
            background-color 160ms ease,
            box-shadow 160ms ease;
          user-select: none;
        }

        .timeline__chip:hover {
          transform: translateY(-1px);
          border-color: rgba(226, 232, 240, 0.6);
          box-shadow: 0 10px 35px rgba(0, 0, 0, 0.35);
        }

        .timeline__chip:focus-visible {
          outline: 2px solid rgba(94, 234, 212, 0.9);
          outline-offset: 3px;
        }

        .timeline__chip--active {
          background: rgba(15, 23, 42, 0.65);
          border-color: rgba(94, 234, 212, 0.6);
          box-shadow:
            0 0 0 1px rgba(94, 234, 212, 0.25),
            0 16px 60px rgba(94, 234, 212, 0.12);
        }

        .timeline__chip--education.timeline__chip--active {
          border-color: rgba(56, 189, 248, 0.75);
          box-shadow: 0 16px 60px rgba(56, 189, 248, 0.15);
        }

        .timeline__chip--professional.timeline__chip--active {
          border-color: rgba(74, 222, 128, 0.75);
          box-shadow: 0 16px 60px rgba(74, 222, 128, 0.15);
        }

        .timeline__chip--project.timeline__chip--active {
          border-color: rgba(244, 114, 182, 0.75);
          box-shadow: 0 16px 60px rgba(244, 114, 182, 0.15);
        }

        .timeline__chip--course.timeline__chip--active {
          border-color: rgba(129, 140, 248, 0.75);
          box-shadow: 0 16px 60px rgba(129, 140, 248, 0.15);
        }

        .timeline__chip--sport.timeline__chip--active {
          border-color: rgba(251, 191, 36, 0.8);
          box-shadow: 0 16px 60px rgba(251, 191, 36, 0.16);
        }

        .timeline__tour-button {
          display: inline-flex;
          align-items: center;
          gap: 0.55rem;
          padding: 0.65rem 0.95rem;
          border-radius: 999px;
          border: 1px solid rgba(148, 163, 184, 0.45);
          background: rgba(15, 23, 42, 0.75);
          color: rgba(226, 232, 240, 0.92);
          font-size: var(--text-sm);
          letter-spacing: 0.01em;
          transition:
            transform 180ms ease,
            border-color 180ms ease,
            background-color 180ms ease,
            box-shadow 180ms ease;
          user-select: none;
        }

        .timeline__tour-button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
          transform: none;
        }

        .timeline__tour-button:not(:disabled):hover {
          transform: translateY(-1px);
          border-color: rgba(94, 234, 212, 0.6);
          box-shadow: 0 16px 45px rgba(0, 0, 0, 0.35);
        }

        .timeline__tour-button:focus-visible {
          outline: 2px solid rgba(94, 234, 212, 0.9);
          outline-offset: 3px;
        }

        .timeline__tour-button--primary {
          border-color: rgba(94, 234, 212, 0.7);
          background: radial-gradient(
              circle at 20% 20%,
              rgba(94, 234, 212, 0.25),
              transparent 55%
            ),
            rgba(15, 23, 42, 0.75);
        }

        .timeline__tour-button--is-active {
          box-shadow:
            0 0 0 1px rgba(94, 234, 212, 0.35),
            0 18px 65px rgba(94, 234, 212, 0.18);
        }

        .timeline__tour-button-icon {
          width: 34px;
          height: 34px;
          border-radius: 999px;
          display: inline-grid;
          place-items: center;
          background: radial-gradient(
              circle at 30% 30%,
              rgba(248, 250, 252, 0.28),
              rgba(94, 234, 212, 0.18)
            ),
            rgba(15, 23, 42, 0.8);
          border: 1px solid rgba(148, 163, 184, 0.38);
        }

        .timeline__tour-button-label {
          font-weight: 600;
        }

        .timeline__tour-progress {
          margin-left: 0.2rem;
          padding: 0.15rem 0.55rem;
          border-radius: 999px;
          font-size: var(--text-xs);
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: rgba(226, 232, 240, 0.8);
          border: 1px solid rgba(148, 163, 184, 0.22);
          background: rgba(2, 6, 23, 0.55);
        }

        .timeline__layout {
          display: grid;
          gap: var(--space-10);
        }

        .timeline__events {
          position: relative;
        }

        .timeline__tracks {
          position: absolute;
          inset: 0 var(--space-4) 0 var(--space-1);
          display: grid;
          grid-template-columns: repeat(5, minmax(0, 1fr));
          pointer-events: none;
          z-index: 0;
        }

        .timeline--single-track .timeline__tracks {
          inset: 0 var(--space-4);
        }

        .timeline__track {
          position: relative;
        }

        .timeline__track::before {
          content: "";
          position: absolute;
          top: 0;
          bottom: 0;
          left: 50%;
          width: 2px;
          transform: translateX(-50%);
          opacity: 0.5;
          background: linear-gradient(
            to bottom,
            rgba(148, 163, 184, 0.1),
            rgba(148, 163, 184, 0.8),
            rgba(148, 163, 184, 0.1)
          );
        }

        .timeline__track-label {
          position: absolute;
          top: -1.75rem;
          left: 50%;
          transform: translateX(-50%);
          font-size: var(--text-xs);
          text-transform: uppercase;
          letter-spacing: 0.08em;
          color: var(--color-text-muted);
          white-space: nowrap;
        }

        .timeline__track--education::before {
          background: linear-gradient(
            to bottom,
            rgba(56, 189, 248, 0.1),
            rgba(56, 189, 248, 0.9),
            rgba(56, 189, 248, 0.1)
          );
        }

        .timeline__track--professional::before {
          background: linear-gradient(
            to bottom,
            rgba(74, 222, 128, 0.1),
            rgba(74, 222, 128, 0.9),
            rgba(74, 222, 128, 0.1)
          );
        }

        .timeline__track--project::before {
          background: linear-gradient(
            to bottom,
            rgba(244, 114, 182, 0.1),
            rgba(244, 114, 182, 0.9),
            rgba(244, 114, 182, 0.1)
          );
        }

        .timeline__track--course::before {
          background: linear-gradient(
            to bottom,
            rgba(129, 140, 248, 0.1),
            rgba(129, 140, 248, 0.9),
            rgba(129, 140, 248, 0.1)
          );
        }

        .timeline__track--sport::before {
          background: linear-gradient(
            to bottom,
            rgba(251, 191, 36, 0.1),
            rgba(251, 191, 36, 0.9),
            rgba(251, 191, 36, 0.1)
          );
        }

        .timeline__rows {
          position: relative;
          z-index: 1;
          display: flex;
          flex-direction: column;
          gap: var(--space-8);
        }

        .timeline__year-separator {
          position: relative;
          margin: var(--space-6) 0 var(--space-3);
          padding: 0 var(--space-4) 0 var(--space-1);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: var(--text-xs);
          text-transform: uppercase;
          letter-spacing: 0.16em;
          color: var(--color-text-muted);
          opacity: 0.9;
        }

        .timeline__year-separator::before,
        .timeline__year-separator::after {
          content: "";
          flex: 1;
          border-bottom: 1px dashed rgba(148, 163, 184, 0.35);
          margin-inline: var(--space-3);
        }

        .timeline__year-separator-label {
          padding: 0.2rem 0.75rem;
          border-radius: 999px;
          border: 1px solid rgba(148, 163, 184, 0.7);
          background: radial-gradient(
              circle at top,
              rgba(56, 189, 248, 0.2),
              transparent 55%
            ),
            rgba(15, 23, 42, 0.96);
          box-shadow:
            0 0 0 1px rgba(15, 23, 42, 0.95),
            0 12px 30px rgba(15, 23, 42, 0.85);
        }

        .timeline__row {
          display: grid;
          grid-template-columns: repeat(5, minmax(0, 1fr));
          align-items: center;
          min-height: 72px;
          padding: 0 var(--space-4) 0 var(--space-1);
          opacity: 0.55;
          transition: opacity 0.25s ease-out;
        }

        .timeline--single-track .timeline__row {
          grid-template-columns: minmax(0, 1fr);
          padding: 0 var(--space-4);
        }

        .timeline__row-track {
          grid-column: 1 / -1;
          position: relative;
          display: grid;
          grid-template-columns: repeat(5, minmax(0, 1fr));
          align-items: center;
          height: 40px;
        }

        .timeline--single-track .timeline__row-track {
          grid-template-columns: minmax(0, 1fr);
        }

        .timeline__dot {
          position: relative;
          width: 14px;
          height: 14px;
          border-radius: 999px;
          border: 2px solid var(--color-surface);
          justify-self: center;
          z-index: 1;
        }

        .timeline__dot--secondary {
          opacity: 0.8;
        }

        .timeline__duration {
          position: relative;
          width: 10px;
          height: 40px;
          transform-origin: center;
          border-radius: 999px;
          justify-self: center;
          z-index: 0;
        }

        .timeline__dot--education {
          grid-column: 1;
          background: rgba(56, 189, 248, 1);
        }

        .timeline__dot--professional {
          grid-column: 2;
          background: rgba(74, 222, 128, 1);
        }

        .timeline__dot--project {
          grid-column: 3;
          background: rgba(244, 114, 182, 1);
        }

        .timeline__dot--course {
          grid-column: 4;
          background: rgba(129, 140, 248, 1);
        }

        .timeline__dot--sport {
          grid-column: 5;
          background: rgba(251, 191, 36, 1);
        }

        .timeline__duration--education {
          grid-column: 1;
          background: linear-gradient(
            to bottom,
            rgba(56, 189, 248, 0.2),
            rgba(56, 189, 248, 0.9)
          );
        }

        .timeline__duration--professional {
          grid-column: 2;
          background: linear-gradient(
            to bottom,
            rgba(74, 222, 128, 0.2),
            rgba(74, 222, 128, 0.9)
          );
        }

        .timeline__duration--project {
          grid-column: 3;
          background: linear-gradient(
            to bottom,
            rgba(244, 114, 182, 0.2),
            rgba(244, 114, 182, 0.9)
          );
        }

        .timeline__duration--course {
          grid-column: 4;
          background: linear-gradient(
            to bottom,
            rgba(129, 140, 248, 0.2),
            rgba(129, 140, 248, 0.9)
          );
        }

        .timeline__duration--sport {
          grid-column: 5;
          background: linear-gradient(
            to bottom,
            rgba(251, 191, 36, 0.2),
            rgba(251, 191, 36, 0.9)
          );
        }

        .timeline__dot--single {
          grid-column: 1;
        }

        .timeline__duration--single {
          grid-column: 1;
        }

        .timeline__row-label {
          grid-column: 1 / -1;
          margin-top: var(--space-4);
          display: flex;
          flex-direction: column;
          gap: 0.1rem;
          padding-left: var(--space-2);
        }

        .timeline__row-title {
          margin: 0;
          font-size: var(--text-sm);
          font-weight: 500;
        }

        .timeline__row-period {
          margin: 0;
          font-size: var(--text-xs);
          color: var(--color-text-muted);
        }

        .timeline__row--active .timeline__row-title {
          color: var(--color-accent);
        }

        .timeline__row--active {
          opacity: 1;
        }

        .timeline__row--active[aria-current="step"] {
          scroll-margin-block: 120px;
        }

        .timeline__row:focus-visible {
          outline: 2px solid var(--color-accent);
          outline-offset: 2px;
        }

        .timeline__detail {
          position: sticky;
          align-self: flex-start;
          top: calc(64px + var(--space-6));
        }

        .timeline__detail-card {
          padding: var(--space-5);
          border-radius: var(--radius-xl);
          background: radial-gradient(
              circle at top left,
              rgba(120, 120, 255, 0.18),
              transparent 55%
            ),
            rgba(12, 12, 18, 0.98);
          border: 1px solid rgba(148, 163, 184, 0.4);
          box-shadow: 0 22px 55px rgba(0, 0, 0, 0.65);
          display: flex;
          flex-direction: column;
          gap: var(--space-4);
        }

        .timeline__detail-header {
          display: flex;
          justify-content: space-between;
          gap: var(--space-4);
          align-items: flex-start;
        }

        .timeline__detail-title {
          margin: 0 0 var(--space-1);
          font-size: var(--text-xl);
        }

        .timeline__detail-period {
          margin: 0;
          font-size: var(--text-sm);
          color: var(--color-text-muted);
        }

        .timeline__item-topic {
          padding: 0.125rem 0.5rem;
          border-radius: 999px;
          font-size: var(--text-xs);
          font-weight: 500;
          border: 1px solid rgba(255, 255, 255, 0.08);
          white-space: nowrap;
        }

        .timeline__item-topic--education {
          background: rgba(56, 189, 248, 0.12);
          color: rgb(125, 211, 252);
        }

        .timeline__item-topic--project {
          background: rgba(244, 114, 182, 0.12);
          color: rgb(251, 207, 232);
        }

        .timeline__item-topic--professional {
          background: rgba(74, 222, 128, 0.12);
          color: rgb(190, 242, 100);
        }

        .timeline__item-topic--course {
          background: rgba(129, 140, 248, 0.12);
          color: rgb(165, 180, 252);
        }

        .timeline__item-topic--sport {
          background: rgba(251, 191, 36, 0.12);
          color: rgb(252, 211, 77);
        }

        .timeline__detail-description {
          margin: 0;
          font-size: var(--text-sm);
          line-height: var(--leading-relaxed);
        }

        .timeline__detail-learnings ul {
          margin: 0;
          padding-left: var(--space-5);
          font-size: var(--text-sm);
          line-height: var(--leading-relaxed);
          display: flex;
          flex-direction: column;
          gap: 0.35rem;
        }

        .timeline__short-skills {
          margin: 0;
          padding: 0;
          list-style: none;
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
        }

        .timeline__short-skill {
          display: inline-flex;
          align-items: center;
          padding: 0.25rem 0.6rem;
          border-radius: 999px;
          border: 1px solid rgba(148, 163, 184, 0.28);
          background: rgba(2, 6, 23, 0.45);
          font-size: var(--text-xs);
          letter-spacing: 0.01em;
          color: rgba(226, 232, 240, 0.88);
        }

        .timeline__detail-subtitle {
          margin: 0 0 var(--space-2);
          font-size: var(--text-sm);
          text-transform: uppercase;
          letter-spacing: 0.08em;
          color: var(--color-text-muted);
        }

        .timeline__detail-links ul {
          margin: 0;
          padding-left: var(--space-5);
          display: flex;
          flex-direction: column;
          gap: 0.3rem;
          font-size: var(--text-sm);
        }

        .timeline__detail-links a {
          color: var(--color-accent);
        }

        .timeline__video {
          margin-top: var(--space-2);
          display: flex;
          flex-direction: column;
          gap: var(--space-2);
        }

        .timeline__video-title {
          margin: 0;
          font-size: var(--text-sm);
          text-transform: uppercase;
          letter-spacing: 0.06em;
          color: var(--color-text-muted);
        }

        .timeline__video-frame {
          position: relative;
          border-radius: var(--radius-lg);
          overflow: hidden;
          background: radial-gradient(
              circle at top left,
              rgba(56, 189, 248, 0.18),
              transparent 55%
            ),
            rgba(15, 23, 42, 1);
        }

        .timeline__video-frame::before {
          content: "";
          display: block;
          padding-bottom: 56.25%;
        }

        .timeline__video-frame iframe {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          border: 0;
        }

        .timeline__video-placeholder {
          display: flex;
          align-items: center;
          gap: var(--space-3);
          padding: var(--space-3);
          border-radius: var(--radius-lg);
          border: 1px dashed rgba(148, 163, 184, 0.6);
          background: rgba(15, 23, 42, 0.9);
        }

        .timeline__video-icon {
          width: 40px;
          height: 40px;
          border-radius: 999px;
          background: radial-gradient(
            circle at 30% 30%,
            rgba(248, 250, 252, 0.3),
            rgba(148, 163, 184, 0.9)
          );
          position: relative;
        }

        .timeline__video-icon::before {
          content: "";
          position: absolute;
          inset: 11px 13px 11px 17px;
          clip-path: polygon(0 0, 100% 50%, 0 100%);
          background: rgba(15, 23, 42, 0.96);
        }

        .timeline__video-text {
          display: flex;
          flex-direction: column;
          gap: 0.15rem;
        }

        .timeline__video-label {
          margin: 0;
          font-size: var(--text-sm);
          font-weight: 500;
        }

        .timeline__video-hint {
          margin: 0;
          font-size: var(--text-xs);
          color: var(--color-text-muted);
        }

        @media (max-width: 959px) {
          .timeline__layout {
            gap: var(--space-8);
          }

          .timeline__rows {
            gap: var(--space-7);
          }
        }

        @media (max-width: 767px) {
          .timeline__layout {
            grid-template-columns: minmax(0, 1fr);
          }

          .timeline__tour {
            gap: var(--space-3);
          }

          .timeline__tracks {
            inset: 0 var(--space-4) 0 0.5rem;
          }

          .timeline__rows {
            gap: var(--space-6);
          }

          .timeline__detail {
            position: static;
          }

          .timeline__detail-card {
            padding: var(--space-4);
          }
        }

        @media (min-width: 960px) {
          .timeline__layout {
            grid-template-columns: minmax(0, 3fr) minmax(0, 4fr);
            align-items: flex-start;
          }

          .timeline__detail-card {
            max-height: calc(100vh - 64px - var(--space-8));
            overflow-y: auto;
          }
        }
      `}</style>
    </section>
  );
}
