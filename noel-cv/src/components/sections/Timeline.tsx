import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion, useInView, useReducedMotion } from "framer-motion";
import {
  timelineItems,
  type TimelineItem,
  type TimelineVideo as TimelineVideoMeta,
  type TimelineTopic,
} from "../../data/timeline";
import { skillsGraph, type SkillNode as SkillGraphNode } from "../../data/skillsGraph";
import { SanchoDemo } from "./SanchoDemo";
import { SkillGraph } from "../skills/SkillGraph";

type TimelineNodeKind = "start" | "end";

interface TimelineNode {
  item: TimelineItem;
  kind: TimelineNodeKind;
}

function hasItemRange(item: TimelineItem): boolean {
  return (
    item.yearEnd !== undefined &&
    (item.yearEnd !== item.yearStart || item.monthEnd !== item.monthStart)
  );
}

function nodeDateYear(node: TimelineNode): number {
  return node.kind === "start" ? node.item.yearStart : node.item.yearEnd ?? node.item.yearStart;
}

function nodeDateMonth(node: TimelineNode): number {
  return node.kind === "start" ? node.item.monthStart : node.item.monthEnd ?? node.item.monthStart;
}

interface TimelineRowProps {
  item: TimelineItem;
  nodeKind: TimelineNodeKind;
  isActive: boolean;
  isPinned: boolean;
  onAutoActivate: () => void;
  onClick: () => void;
  onDotRef?: (el: HTMLSpanElement | null) => void;
}

function TimelineRow({
  item,
  nodeKind,
  isActive,
  isPinned,
  onAutoActivate,
  onClick,
  onDotRef,
}: TimelineRowProps) {
  const ref = useRef<HTMLDivElement | null>(null);
  const isInView = useInView(ref, {
    margin: "-35% 0px -35% 0px",
  });
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    if (nodeKind === "start" && isInView && !isPinned) {
      onAutoActivate();
    }
  }, [nodeKind, isInView, isPinned, onAutoActivate]);

  const dotVariants = {
    inactive: { scale: 0.9, opacity: 0.6 },
    active: {
      scale: 1.2,
      opacity: 1,
      boxShadow: "0 0 18px rgba(94, 234, 212, 0.9)",
    },
  };

  const setRef = useCallback(
    (el: HTMLSpanElement | null) => {
      onDotRef?.(el);
    },
    [onDotRef],
  );

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
      <div className="timeline__row-track">
      {!(nodeKind === "end" && !isActive) && (
        <motion.span
          ref={setRef}
          className={`timeline__dot timeline__dot--${item.topic} ${
            nodeKind === "end" ? "timeline__dot--secondary" : ""
          }`}
          variants={dotVariants}
          initial="inactive"
          animate={isActive ? "active" : "inactive"}
          transition={
            shouldReduceMotion
              ? { duration: 0 }
              : { type: "spring", stiffness: 260, damping: 24 }
          }
        />
      )}
      </div>
      <div className="timeline__row-label">
      {!(nodeKind === "end") && (
        <>
          <p className="timeline__row-title">{item.title}</p>
          <p className="timeline__row-period">{item.period}</p>
        </>
      )}
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
        // 1. Year start
        if (a.yearStart !== b.yearStart) {
          return a.yearStart - b.yearStart;
        }
  
        // 2. Month start
        if (a.monthStart !== b.monthStart) {
          return a.monthStart - b.monthStart;
        }
  
        // 3. Year end (fallback al yearStart)
        const aYearEnd = a.yearEnd ?? a.yearStart;
        const bYearEnd = b.yearEnd ?? b.yearStart;
  
        if (aYearEnd !== bYearEnd) {
          return aYearEnd - bYearEnd;
        }
  
        // 4. Month end (fallback al monthStart)
        const aMonthEnd = a.monthEnd ?? a.monthStart;
        const bMonthEnd = b.monthEnd ?? b.monthStart;
  
        if (aMonthEnd !== bMonthEnd) {
          return aMonthEnd - b.monthEnd!;
        }
  
        // 5. Id como último criterio
        return a.id.localeCompare(b.id);
      }),
    [timelineItems],
  );

  const allTopics = useMemo(
    () => ["education", "professional", "project", "course", "sport"] as const satisfies readonly TimelineTopic[],
    [],
  );

  const topicLabelById = useMemo(
    () =>
      ({
        education: "Education",
        professional: "Professional",
        project: "Projects",
        course: "Courses",
        sport: "Sport",
      }) satisfies Record<TimelineTopic, string>,
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

  const [selectedTopics, setSelectedTopics] = useState<TimelineTopic[]>([]);
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

  type SkillFilterState = {
    id: string;
    name: string;
    relatedItems?: string[];
  };

  const [selectedSkillFilter, setSelectedSkillFilter] = useState<SkillFilterState | null>(null);

  const skillChildrenByParentId = useMemo(() => {
    const map = new Map<string | null, SkillGraphNode[]>();
    for (const skill of skillsGraph) {
      const key = skill.parentId ?? null;
      const existing = map.get(key);
      if (existing) {
        existing.push(skill);
      } else {
        map.set(key, [skill]);
      }
    }
    return map;
  }, []);

  const skillById = useMemo(() => {
    const map = new Map<string, SkillGraphNode>();
    for (const skill of skillsGraph) {
      map.set(skill.id, skill);
    }
    return map;
  }, []);

  useEffect(() => {
    tourStatusRef.current = tourStatus;
  }, [tourStatus]);

  const selectedTopicsSet = useMemo(() => new Set(selectedTopics), [selectedTopics]);
  const visibleItems = useMemo(() => {
    let items =
      selectedTopics.length === 0
        ? sortedItems
        : sortedItems.filter((item) => selectedTopicsSet.has(item.topic));

    if (selectedSkillFilter && selectedSkillFilter.relatedItems && selectedSkillFilter.relatedItems.length > 0) {
      const allowedIds = new Set(selectedSkillFilter.relatedItems);
      items = items.filter((item) => allowedIds.has(item.id));
    }

    return items;
  }, [sortedItems, selectedTopics, selectedTopicsSet, selectedSkillFilter]);

  const visibleNodes = useMemo(() => {
    const nodes: TimelineNode[] = [];
    for (const item of visibleItems) {
      nodes.push({ item, kind: "start" });
      if (hasItemRange(item)) {
        nodes.push({ item, kind: "end" });
      }
    }
    return nodes.sort((a, b) => {
      const ya = nodeDateYear(a);
      const yb = nodeDateYear(b);
      if (ya !== yb) return ya - yb;
      const ma = nodeDateMonth(a);
      const mb = nodeDateMonth(b);
      if (ma !== mb) return ma - mb;
      if (a.kind !== b.kind) return a.kind === "start" ? -1 : 1;
      return a.item.id.localeCompare(b.item.id);
    });
  }, [visibleItems]);

  const activeSkillIds = useMemo(() => {
    if (selectedTopics.length === 0) return null;
    
    const skillIds = new Set<string>();
    for (const skill of skillsGraph) {
      if (!skill.relatedItems) continue;
      const belongsToVisibleItem = skill.relatedItems.some(itemId => 
        visibleItems.some(item => item.id === itemId)
      );
      if (belongsToVisibleItem) {
        skillIds.add(skill.id);
      }
    }
    return skillIds.size > 0 ? skillIds : null;
  }, [selectedTopics, visibleItems]);

  const rowsContainerRef = useRef<HTMLDivElement | null>(null);
  const dotRefs = useRef<Map<string, HTMLSpanElement>>(new Map());
  const [rangeBarStyle, setRangeBarStyle] = useState<{
    itemId: string;
    top: number;
    height: number;
    left: number;
    width: number;
    topic: TimelineTopic;
  } | null>(null);

  useEffect(() => {
    const active = activeId ? visibleItems.find((i) => i.id === activeId) : null;
    if (!active || !hasItemRange(active)) {
      const raf = requestAnimationFrame(() => setRangeBarStyle(null));
      return () => cancelAnimationFrame(raf);
    }
    const startKey = `${active.id}-start`;
    const endKey = `${active.id}-end`;
    const startEl = dotRefs.current.get(startKey);
    const endEl = dotRefs.current.get(endKey);
    const rowsEl = rowsContainerRef.current;
    if (!startEl || !endEl || !rowsEl) {
      const raf = requestAnimationFrame(() => setRangeBarStyle(null));
      return () => cancelAnimationFrame(raf);
    }
    const update = () => {
      requestAnimationFrame(() => {
        const startRect = startEl.getBoundingClientRect();
        const endRect = endEl.getBoundingClientRect();
        const rowsRect = rowsEl.getBoundingClientRect();
        const top = startRect.top - rowsRect.top + startRect.height / 2;
        const height = endRect.top - startRect.top + endRect.height / 2 - startRect.height / 2;
        if (height <= 0) {
          setRangeBarStyle(null);
          return;
        }
        setRangeBarStyle({
          itemId: active.id,
          top,
          height,
          left: startRect.left - rowsRect.left + startRect.width / 2 - 5,
          width: 10,
          topic: active.topic,
        });
      });
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(rowsEl);
    window.addEventListener("scroll", update, true);
    return () => {
      ro.disconnect();
      window.removeEventListener("scroll", update, true);
    };
  }, [activeId, visibleItems]);

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
    const msPerWord = 30; // ~250 WPM reading pace
    const minMs = 1800;
    const maxMs = 10000;

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

    if (nextFilter === "all") {
      setSelectedTopics([]);
      setActiveId(sortedItems[0]?.id ?? null);
      return;
    }

    if (selectedTopics.length === 0) {
      setSelectedTopics([nextFilter]);
      setActiveId(sortedItems.find((item) => item.topic === nextFilter)?.id ?? null);
      return;
    }

    const nextSet = new Set<TimelineTopic>(selectedTopics);
    if (nextSet.has(nextFilter)) {
      nextSet.delete(nextFilter);
    } else {
      nextSet.add(nextFilter);
    }

    const nextSelected = allTopics.filter((topic) => nextSet.has(topic));
    setSelectedTopics(nextSelected);

    const nextVisibleItems =
      nextSelected.length === 0
        ? sortedItems
        : sortedItems.filter((item) => nextSet.has(item.topic));

    if (activeId && nextVisibleItems.some((item) => item.id === activeId)) {
      return;
    }

    setActiveId(nextVisibleItems[0]?.id ?? null);
  };

  const getSkillSubtreeRelatedItems = useCallback(
    (rootId: string): string[] => {
      const visitedSkillIds = new Set<string>();
      const collectedIds = new Set<string>();
      const stack: string[] = [rootId];

      while (stack.length > 0) {
        const currentId = stack.pop() as string;
        if (visitedSkillIds.has(currentId)) {
          continue;
        }
        visitedSkillIds.add(currentId);

        const skill = skillById.get(currentId);
        if (!skill) {
          continue;
        }

        if (skill.relatedItems) {
          for (const timelineId of skill.relatedItems) {
            collectedIds.add(timelineId);
          }
        }

        const children = skillChildrenByParentId.get(currentId) ?? [];
        for (const child of children) {
          stack.push(child.id);
        }
      }

      return Array.from(collectedIds);
    },
    [skillById, skillChildrenByParentId],
  );

  const applySkillFilter = (nextSkill: SkillGraphNode | null) => {
    stopTour();
    setTourIndex(0);
    setPinnedId(null);
    setPinnedScrollY(null);

    if (!nextSkill) {
      setSelectedSkillFilter(null);

      const baseItems =
        selectedTopics.length === 0
          ? sortedItems
          : sortedItems.filter((item) => selectedTopicsSet.has(item.topic));

      setActiveId(baseItems[0]?.id ?? null);
      return;
    }

    const aggregatedRelatedItems = getSkillSubtreeRelatedItems(nextSkill.id);

    const nextFilterState: SkillFilterState = {
      id: nextSkill.id,
      name: nextSkill.name,
      relatedItems: aggregatedRelatedItems,
    };

    setSelectedSkillFilter(nextFilterState);

    const baseItems =
      selectedTopics.length === 0
        ? sortedItems
        : sortedItems.filter((item) => selectedTopicsSet.has(item.topic));

    const visibleWithSkill =
      aggregatedRelatedItems.length > 0
        ? baseItems.filter((item) => aggregatedRelatedItems.includes(item.id))
        : baseItems;

    if (visibleWithSkill.length > 0) {
      setActiveId(visibleWithSkill[0].id);
    } else {
      setActiveId(baseItems[0]?.id ?? null);
    }
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
      className="section timeline"
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
          Learning Journey
        </motion.h2>

        <motion.p
          className="timeline__intro"
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          A vertical journey through my education, professional experience, projects, courses, and
          sport. Scroll to move through time: each milestone expands as it comes into focus.
        </motion.p>

        <div className="timeline__tour" role="group" aria-label="Interactive skills map and track filters">
          <div className="timeline__tour-sidebar">
            <header className="timeline__tour-header">
              <h3 className="timeline__tour-title">Experience Navigator</h3>
              <p className="timeline__tour-subtitle">
                {selectedSkillFilter 
                  ? "Explore milestones that forged this expertise." 
                  : "Filter my journey by track or select a skill on the map."}
              </p>
            </header>

            <div className="timeline__filters" role="group" aria-label="Filter timeline by track">
              <div className="timeline__filter-chips">
                {topicFilters.map((filter) => {
                  const isActive =
                    filter.id === "all" ? selectedTopics.length === 0 : selectedTopicsSet.has(filter.id);
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
                      <span className="timeline__chip-dot" aria-hidden="true" />
                      {filter.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="timeline__tour-status">
              <AnimatePresence mode="wait">
                {selectedSkillFilter && (
                  <motion.div 
                    className="timeline__tour-badge"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                  >
                    <span className="timeline__tour-badge-label">Active focus:</span>
                    <span className="timeline__tour-badge-value">{selectedSkillFilter.name}</span>
                    <button
                      type="button"
                      className="timeline__tour-badge-clear"
                      onClick={() => applySkillFilter(null)}
                      aria-label={`Clear filter for ${selectedSkillFilter.name}`}
                    >
                      ×
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          <div className="timeline__tour-graph-container" id="skills-graph">
            <SkillGraph
              className="skillgraph--embedded"
              selectedSkillId={selectedSkillFilter?.id ?? null}
              onSkillSelect={applySkillFilter}
              activeSkillIds={activeSkillIds}
            />
          </div>
        </div>

        <div className="timeline__layout" id="timeline-layout">
          <div className="timeline__events" aria-label="Timeline of experience">
            <div
              className="timeline__tracks"
              role="group"
              aria-label="Timeline tracks"
            >
              {allTopics.map((topic) => {
                const isActive = selectedTopics.length > 0 && selectedTopicsSet.has(topic);
                return (
                  <button
                    key={topic}
                    type="button"
                    className={`timeline__track timeline__track--${topic} ${
                      isActive ? "timeline__track--is-active" : ""
                    }`}
                    onClick={() => applyTopicFilter(topic)}
                    aria-pressed={isActive}
                  >
                    <span className="timeline__track-label">{topicLabelById[topic]}</span>
                  </button>
                );
              })}
            </div>

            <div className="timeline__rows" ref={rowsContainerRef}>
              {rangeBarStyle && rangeBarStyle.itemId === activeId && (
                <div
                  className={`timeline__range-bar timeline__range-bar--${rangeBarStyle.topic}`}
                  style={{
                    position: "absolute",
                    left: rangeBarStyle.left,
                    top: rangeBarStyle.top,
                    width: rangeBarStyle.width,
                    height: rangeBarStyle.height,
                    pointerEvents: "none",
                  }}
                  aria-hidden="true"
                />
              )}
              {visibleNodes.map((node, index) => {
                const previous = index > 0 ? visibleNodes[index - 1] : null;
                const year = nodeDateYear(node);
                const isNewYear = !previous || nodeDateYear(previous) !== year;
                const shouldShowYearSeparator = index > 0 && isNewYear;
                const rowKey = node.kind === "start" ? node.item.id : `${node.item.id}-end`;

                return (
                  <div key={rowKey}>
                    {shouldShowYearSeparator && (
                      <div
                        className="timeline__year-separator"
                        role="separator"
                        aria-label={String(year)}
                        data-timeline-year={year}
                      >
                        <span className="timeline__year-separator-label">{year}</span>
                      </div>
                    )}
                    <div
                      ref={
                        node.kind === "start"
                          ? (el) => {
                              if (el) itemContainerRefs.current.set(node.item.id, el);
                              else itemContainerRefs.current.delete(node.item.id);
                            }
                          : undefined
                      }
                      data-timeline-item={node.item.id}
                    >
                      <TimelineRow
                        item={node.item}
                        nodeKind={node.kind}
                        isActive={node.item.id === activeId}
                        isPinned={pinnedId === node.item.id}
                        onAutoActivate={() => {
                          if (!pinnedId) setActiveId(node.item.id);
                        }}
                        onClick={() => {
                          stopTour();
                          const currentScrollY = typeof window !== "undefined" ? window.scrollY : 0;
                          setPinnedId(node.item.id);
                          setPinnedScrollY(currentScrollY);
                          setActiveId(node.item.id);
                        }}
                        onDotRef={(el) => {
                          const key = `${node.item.id}-${node.kind}`;
                          if (el) dotRefs.current.set(key, el);
                          else dotRefs.current.delete(key);
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

                  {activeItem.id === "sancho-mini" && (
                    <div className="timeline__embedded-demo">
                      <SanchoDemo />
                    </div>
                  )}

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
        #timeline-title {
          margin-bottom: 0;
        }

        .timeline__inner {
          display: flex;
          flex-direction: column;
          gap: var(--space-2);
        }

        .timeline__intro {
          margin-top: 0px;
          max-width: 45rem;
          font-size: var(--text-base);
          color: rgba(255, 255, 255, 0.85);
        }

        .timeline__tour {
          display: grid;
          grid-template-columns: minmax(0, 320px) minmax(0, 1fr);
          gap: var(--space-6);
          padding: var(--space-6);
          margin-bottom: var(--space-12);
          border-radius: var(--radius-xl);
          border: 1px solid rgba(148, 163, 184, 0.35);
          background: radial-gradient(
              circle at 18% 22%,
              rgba(94, 234, 212, 0.18),
              transparent 55%
            ),
            radial-gradient(circle at 78% 8%, rgba(129, 140, 248, 0.16), transparent 42%),
            rgba(12, 12, 18, 0.92);
          backdrop-filter: blur(12px);
          box-shadow:
            0 0 0 1px rgba(15, 23, 42, 0.75),
            0 26px 80px rgba(0, 0, 0, 0.55);
          overflow: hidden;
          position: relative;
        }

        .timeline__tour::before {
          content: "";
          position: absolute;
          inset: 0;
          background: radial-gradient(
            circle at 20% 20%,
            rgba(94, 234, 212, 0.08),
            transparent 50%
          );
          pointer-events: none;
        }

        .timeline__tour-sidebar {
          display: flex;
          flex-direction: column;
          gap: var(--space-6);
          position: relative;
          z-index: 1;
        }

        .timeline__tour-header {
          display: flex;
          flex-direction: column;
          gap: var(--space-2);
        }

        .timeline__tour-title {
          margin: 0;
          font-size: var(--text-base);
          font-weight: 600;
          letter-spacing: 0.05em;
          text-transform: uppercase;
          color: var(--color-accent);
        }

        .timeline__tour-subtitle {
          margin: 0;
          font-size: var(--text-xs);
          line-height: var(--leading-relaxed);
          color: rgba(255, 255, 255, 0.6);
        }

        .timeline__filters {
          display: flex;
          flex-direction: column;
          gap: var(--space-4);
        }

        .timeline__filter-chips {
          display: flex;
          flex-direction: column;
          gap: var(--space-2);
        }

        .timeline__chip {
          appearance: none;
          display: flex;
          align-items: center;
          gap: var(--space-3);
          padding: var(--space-2) var(--space-4);
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.05);
          border-radius: var(--radius-md);
          color: rgba(255, 255, 255, 0.7);
          font-size: var(--text-xs);
          font-weight: 500;
          text-align: left;
          transition: all var(--transition-base);
          cursor: pointer;
        }

        .timeline__chip:hover {
          background: rgba(255, 255, 255, 0.06);
          border-color: rgba(255, 255, 255, 0.1);
          color: #fff;
          transform: translateX(4px);
        }

        .timeline__chip-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: currentColor;
          opacity: 0.4;
          transition: all var(--transition-base);
        }

        .timeline__chip--active {
          background: rgba(0, 212, 170, 0.1);
          border-color: rgba(0, 212, 170, 0.3);
          color: var(--color-accent);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
        }

        .timeline__chip--active .timeline__chip-dot {
          opacity: 1;
          box-shadow: 0 0 8px currentColor;
          transform: scale(1.2);
        }

        /* Topic-specific active states for intensity */
        .timeline__chip--education.timeline__chip--active { color: #38bdf8; background: rgba(56, 189, 248, 0.1); border-color: rgba(56, 189, 248, 0.3); }
        .timeline__chip--professional.timeline__chip--active { color: #4ade80; background: rgba(74, 222, 128, 0.1); border-color: rgba(74, 222, 128, 0.3); }
        .timeline__chip--project.timeline__chip--active { color: #f472b6; background: rgba(244, 114, 182, 0.1); border-color: rgba(244, 114, 182, 0.3); }
        .timeline__chip--course.timeline__chip--active { color: #818cf8; background: rgba(129, 140, 248, 0.1); border-color: rgba(129, 140, 248, 0.3); }
        .timeline__chip--sport.timeline__chip--active { color: #fbbf24; background: rgba(251, 191, 36, 0.1); border-color: rgba(251, 191, 36, 0.3); }

        .timeline__tour-status {
          margin-top: auto;
          min-height: 44px;
        }

        .timeline__tour-badge {
          display: inline-flex;
          align-items: center;
          gap: var(--space-2);
          padding: var(--space-2) var(--space-3);
          background: var(--color-accent);
          color: var(--color-bg);
          border-radius: var(--radius-md);
          font-size: var(--text-xs);
          font-weight: 600;
          box-shadow: 0 8px 24px rgba(0, 212, 170, 0.25);
        }

        .timeline__tour-badge-label {
          opacity: 0.8;
          font-weight: 400;
        }

        .timeline__tour-badge-clear {
          appearance: none;
          border: 0;
          background: rgba(0, 0, 0, 0.2);
          color: inherit;
          width: 18px;
          height: 18px;
          border-radius: 50%;
          display: grid;
          place-items: center;
          cursor: pointer;
          font-size: 14px;
          margin-left: 4px;
          transition: background 0.2s;
        }

        .timeline__tour-badge-clear:hover {
          background: rgba(0, 0, 0, 0.4);
        }

        .timeline__tour-graph-container {
          position: relative;
          background: radial-gradient(
              circle at 10% 0%,
              rgba(56, 189, 248, 0.18),
              transparent 55%
            ),
            radial-gradient(
              circle at 95% 90%,
              rgba(129, 140, 248, 0.22),
              transparent 52%
            ),
            rgba(7, 12, 24, 0.98);
          border-radius: var(--radius-lg);
          border: 1px solid rgba(148, 163, 184, 0.4);
          box-shadow:
            0 0 0 1px rgba(15, 23, 42, 0.9),
            0 18px 60px rgba(15, 23, 42, 0.85);
          min-height: 400px;
        }

        /* SkillGraph overrides when embedded */
        .skillgraph--embedded {
          background: transparent !important;
          border: none !important;
          box-shadow: none !important;
          padding: var(--space-4) !important;
          height: 100%;
        }

        .skillgraph--embedded .skillgraph__header {
          padding-bottom: var(--space-4);
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
        }

        .skillgraph--embedded .skillgraph__eyebrow,
        .skillgraph--embedded .skillgraph__title {
          display: none;
        }

        .skillgraph--embedded .skillgraph__hint {
          display: flex;
          align-items: center;
          gap: var(--space-2);
          padding: var(--space-2) var(--space-3);
          background: rgba(94, 234, 212, 0.08);
          border: 1px solid rgba(94, 234, 212, 0.2);
          border-radius: var(--radius-md);
          color: rgba(94, 234, 212, 0.9);
          font-size: 11px;
          line-height: 1.4;
          margin-top: var(--space-1);
        }

        .skillgraph--embedded .skillgraph__hint::before {
          content: "i";
          display: grid;
          place-items: center;
          width: 16px;
          height: 16px;
          border-radius: 50%;
          border: 1px solid currentColor;
          font-family: serif;
          font-style: italic;
          font-weight: bold;
          flex-shrink: 0;
          font-size: 10px;
        }

        .skillgraph--embedded .skillgraph__canvas {
          background: transparent !important;
          border: none !important;
          padding: var(--space-2) !important;
          overflow: visible !important;
        }

        .skillgraph--embedded .skillgraph__node {
          background: transparent !important;
          backdrop-filter: none !important;
          box-shadow: none !important;
          border-color: transparent !important;
        }

        .skillgraph--embedded .skillgraph__node--selected {
          background: rgba(15, 23, 42, 0.9) !important;
          backdrop-filter: blur(12px) !important;
          border-radius: var(--radius-md);
          box-shadow: 
            0 0 0 2px rgba(94, 234, 212, 0.6),
            0 0 35px rgba(94, 234, 212, 0.45) !important;
        }

        .skillgraph--embedded .skillgraph__node:hover:not(.skillgraph__node--selected) {
          background: rgba(255, 255, 255, 0.05) !important;
          border-radius: var(--radius-md);
        }

        .skillgraph--embedded .skillgraph__legend {
          margin-top: var(--space-6);
          padding: var(--space-3) var(--space-4);
          background: rgba(15, 23, 42, 0.4);
          border: 1px solid rgba(148, 163, 184, 0.15);
          border-radius: var(--radius-lg);
          backdrop-filter: blur(8px);
          display: flex;
          justify-content: center;
          gap: var(--space-4) var(--space-6);
        }

        .skillgraph--embedded .skillgraph__legend-item {
          opacity: 1;
          color: rgba(255, 255, 255, 0.8);
        }

        @media (max-width: 960px) {
          .timeline__tour {
            grid-template-columns: 1fr;
          }
          
          .timeline__filter-chips {
            flex-direction: row;
            flex-wrap: wrap;
          }
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
          pointer-events: auto;
          z-index: 0;
        }

        .timeline__track {
          position: relative;
          appearance: none;
          border: 0;
          padding: 0;
          background: transparent;
          cursor: pointer;
          color: inherit;
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

        .timeline__track:hover::before {
          opacity: 0.75;
        }

        .timeline__track:hover .timeline__track-label {
          color: rgba(248, 250, 252, 0.85);
        }

        .timeline__track:focus-visible {
          outline: 2px solid rgba(94, 234, 212, 0.9);
          outline-offset: 6px;
          border-radius: 16px;
        }

        .timeline__track--is-active::before {
          opacity: 0.95;
          filter: drop-shadow(0 0 18px rgba(94, 234, 212, 0.12));
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
          pointer-events: none;
        }

        .timeline__rows > div {
          pointer-events: none;
        }

        .timeline__year-separator,
        .timeline__rows [data-timeline-item] {
          pointer-events: auto;
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

        .timeline__row-track {
          grid-column: 1 / -1;
          position: relative;
          display: grid;
          grid-template-columns: repeat(5, minmax(0, 1fr));
          align-items: center;
          height: 40px;
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

        .timeline__range-bar {
          border-radius: 999px;
          z-index: 0;
        }

        .timeline__range-bar--education {
          background: linear-gradient(
            to bottom,
            rgba(56, 189, 248, 0.2),
            rgba(56, 189, 248, 0.9)
          );
        }

        .timeline__range-bar--professional {
          background: linear-gradient(
            to bottom,
            rgba(74, 222, 128, 0.2),
            rgba(74, 222, 128, 0.9)
          );
        }

        .timeline__range-bar--project {
          background: linear-gradient(
            to bottom,
            rgba(244, 114, 182, 0.2),
            rgba(244, 114, 182, 0.9)
          );
        }

        .timeline__range-bar--course {
          background: linear-gradient(
            to bottom,
            rgba(129, 140, 248, 0.2),
            rgba(129, 140, 248, 0.9)
          );
        }

        .timeline__range-bar--sport {
          background: linear-gradient(
            to bottom,
            rgba(251, 191, 36, 0.2),
            rgba(251, 191, 36, 0.9)
          );
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
          .timeline__tour {
            grid-template-columns: minmax(0, 1fr);
          }

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
