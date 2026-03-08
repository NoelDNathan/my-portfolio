import { useMemo, useState, type MouseEvent } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { skillsGraph, type SkillNode } from "../../data/skillsGraph";

type SkillGraphNode = SkillNode;

interface SkillGraphProps {
  className?: string;
  selectedSkillId?: string | null;
  onSkillSelect?: (skill: SkillGraphNode | null) => void;
  activeSkillIds?: Set<string> | null;
}

export function SkillGraph({ 
  className, 
  selectedSkillId, 
  onSkillSelect,
  activeSkillIds 
}: SkillGraphProps) {
  const [currentNodeId, setCurrentNodeId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const shouldReduceMotion = useReducedMotion();

  const nodesById = useMemo(() => {
    const map = new Map<string, SkillGraphNode>();
    for (const node of skillsGraph) {
      map.set(node.id, node);
    }
    return map;
  }, []);

  const childrenByParentId = useMemo(() => {
    const map = new Map<string | null, SkillGraphNode[]>();
    for (const node of skillsGraph) {
      const key = node.parentId ?? null;
      const existing = map.get(key);
      if (existing) {
        existing.push(node);
      } else {
        map.set(key, [node]);
      }
    }

    for (const [key, value] of map.entries()) {
      value.sort((a, b) => a.name.localeCompare(b.name));
      map.set(key, value);
    }

    return map;
  }, []);

  const rootChildren = childrenByParentId.get(null) ?? [];

  const pathNodes = useMemo(() => {
    if (!currentNodeId) {
      return [] as SkillGraphNode[];
    }

    const path: SkillGraphNode[] = [];
    let cursor = nodesById.get(currentNodeId) ?? null;

    while (cursor) {
      path.unshift(cursor);
      if (!cursor.parentId) {
        break;
      }
      cursor = nodesById.get(cursor.parentId) ?? null;
    }

    return path;
  }, [currentNodeId, nodesById]);

  const currentChildren = useMemo(() => {
    if (!currentNodeId) {
      return rootChildren;
    }
    return childrenByParentId.get(currentNodeId) ?? [];
  }, [childrenByParentId, currentNodeId, rootChildren]);

  const effectiveActiveIds = useMemo(() => {
    if (!activeSkillIds) return null;
    
    const highlighted = new Set<string>();
    
    // For each active skill, add it and all its ancestors to the highlighted set
    activeSkillIds.forEach(id => {
      let cursor: SkillGraphNode | null = nodesById.get(id) ?? null;
      while (cursor) {
        if (highlighted.has(cursor.id)) break;
        highlighted.add(cursor.id);
        cursor = cursor.parentId ? (nodesById.get(cursor.parentId) ?? null) : null;
      }
    });

    // Also include any children of the current path if they have active descendants
    // This part is actually already covered by the ancestor logic above for all nodes in the graph
    
    return highlighted;
  }, [activeSkillIds, nodesById]);

  const handleBackgroundDoubleClick = (event: MouseEvent<HTMLDivElement>) => {
    // This is attached to the canvas wrapper; node buttons stopPropagation on double-click,
    // so any double-click that reaches here should be treated as a "go up one level" intent.
    event.stopPropagation();

    if (!currentNodeId) {
      return;
    }

    const currentNode = nodesById.get(currentNodeId);
    if (!currentNode || !currentNode.parentId) {
      setCurrentNodeId(null);
      return;
    }

    setCurrentNodeId(currentNode.parentId);
  };

  const goToCrumb = (targetId: string | null) => {
    setCurrentNodeId(targetId);
  };

  const canGoDeeper = (nodeId: string) => {
    const children = childrenByParentId.get(nodeId);
    return Boolean(children && children.length > 0);
  };

  const currentRootLabel =
    pathNodes.length === 0 ? "All skills" : pathNodes[pathNodes.length - 1]?.name;

  const breadcrumbItems: Array<{ id: string | null; label: string }> = [
    { id: null, label: "All skills" },
    ...pathNodes.map((node) => ({ id: node.id, label: node.name })),
  ];

  const graphKey = currentNodeId ?? "root";

  const normalizedSearchQuery = searchQuery.trim().toLowerCase();
  const searchResults = useMemo(() => {
    if (normalizedSearchQuery.length < 2) {
      return [] as SkillGraphNode[];
    }
    return skillsGraph
      .filter((skill) => skill.name.toLowerCase().includes(normalizedSearchQuery))
      .slice(0, 8);
  }, [normalizedSearchQuery]);

  return (
    <section className={`skillgraph ${className ?? ""}`} aria-label="Hierarchical skills graph">
      <div className="skillgraph__header">
        <p className="skillgraph__eyebrow">Skill graph</p>
        <p className="skillgraph__title">{currentRootLabel}</p>
        <p className="skillgraph__hint">
          Double-click a skill to zoom in. Double-click on the empty space to return to the previous
          level.
        </p>
        <div className="skillgraph__search">
          <input
            type="search"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="Search skills…"
            className="skillgraph__search-input"
          />
          {searchResults.length > 0 && (
            <ul className="skillgraph__search-results">
              {searchResults.map((skill) => (
                <li key={skill.id}>
                  <button
                    type="button"
                    className="skillgraph__search-result-button"
                    onClick={() => {
                      setSearchQuery("");
                      setCurrentNodeId(skill.parentId ?? null);
                      if (onSkillSelect) {
                        onSkillSelect(skill);
                      }
                    }}
                  >
                    <span className="skillgraph__search-result-name">{skill.name}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
        <nav className="skillgraph__breadcrumb" aria-label="Skill graph level navigation">
          {breadcrumbItems.map((crumb, index) => {
            const isLast = index === breadcrumbItems.length - 1;
            return (
              <button
                key={`${crumb.id ?? "root"}-${index}`}
                type="button"
                className={`skillgraph__breadcrumb-item ${
                  isLast ? "skillgraph__breadcrumb-item--current" : ""
                }`}
                onClick={() => {
                  if (!isLast) {
                    goToCrumb(crumb.id);
                  }
                }}
                aria-current={isLast ? "page" : undefined}
              >
                {crumb.label}
                {!isLast && (
                  <span className="skillgraph__breadcrumb-separator" aria-hidden="true">
                    /
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      <div className="skillgraph__canvas" onDoubleClick={handleBackgroundDoubleClick}>
        <AnimatePresence mode="wait">
          <motion.div
            key={graphKey}
            className="skillgraph__nodes"
            initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.9, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.95, y: -8 }}
            transition={shouldReduceMotion ? { duration: 0 } : { duration: 0.35, ease: "easeOut" }}
          >
            {currentChildren.map((node) => {
              const levelClass =
                node.level === "basic"
                  ? "skillgraph__node--basic"
                  : node.level === "medium"
                    ? "skillgraph__node--medium"
                    : node.level === "advanced"
                      ? "skillgraph__node--advanced"
                      : "skillgraph__node--undefined";

              const isNavigable = canGoDeeper(node.id);
              const isSelected = selectedSkillId === node.id;
              const isDimmed = effectiveActiveIds !== null && !effectiveActiveIds.has(node.id);

              return (
                <motion.button
                  key={node.id}
                  type="button"
                  className={`skillgraph__node ${levelClass} ${
                    isNavigable ? "skillgraph__node--navigable" : ""
                  } ${isSelected ? "skillgraph__node--selected" : ""} ${
                    isDimmed ? "skillgraph__node--dimmed" : ""
                  }`}
                  layout
                  whileHover={shouldReduceMotion ? undefined : { scale: 1.03, translateY: -2 }}
                  whileTap={shouldReduceMotion ? undefined : { scale: 0.97 }}
                  onClick={(event) => {
                    event.stopPropagation();
                    if (!onSkillSelect) {
                      return;
                    }
                    if (isSelected) {
                      onSkillSelect(null);
                      return;
                    }
                    setSearchQuery("");
                    onSkillSelect(node);
                  }}
                  onDoubleClick={(event) => {
                    event.stopPropagation();
                    if (isNavigable) {
                      setCurrentNodeId(node.id);
                    }
                  }}
                  aria-pressed={isSelected ? true : undefined}
                >
                  {node.level === "basic" && (
                    <svg
                      className="skillgraph__node-shape"
                      viewBox="0 0 100 100"
                      aria-hidden="true"
                      focusable="false"
                    >
                      <rect
                        className="skillgraph__node-shape-basic"
                        x="8"
                        y="10"
                        width="84"
                        height="80"
                        rx="10"
                        ry="10"
                      />
                    </svg>
                  )}
                  {node.level === undefined && (
                    <svg
                      className="skillgraph__node-shape"
                      viewBox="0 0 100 100"
                      aria-hidden="true"
                      focusable="false"
                    >
                      <rect
                        className="skillgraph__node-shape-undefined"
                        x="10"
                        y="14"
                        width="80"
                        height="72"
                        rx="14"
                        ry="14"
                      />
                    </svg>
                  )}
                  {node.level === "medium" && (
                    <svg
                      className="skillgraph__node-shape"
                      viewBox="0 0 100 100"
                      aria-hidden="true"
                      focusable="false"
                    >
                      <polygon
                        className="skillgraph__node-shape-medium"
                        points="50,3 93,25 93,75 50,97 7,75 7,25"
                      />
                    </svg>
                  )}
                  {node.level === "advanced" && (
                    <svg
                      className="skillgraph__node-shape"
                      viewBox="0 0 100 100"
                      aria-hidden="true"
                      focusable="false"
                    >
                      <circle className="skillgraph__node-shape-advanced" cx="50" cy="50" r="44" />
                    </svg>
                  )}
                  <span className="skillgraph__node-label">{node.name}</span>
                  {isNavigable && (
                    <span className="skillgraph__node-subtle-hint" aria-hidden="true">
                      Subskills
                    </span>
                  )}
                </motion.button>
              );
            })}

            {currentChildren.length === 0 && (
              <div className="skillgraph__empty">
                <p className="skillgraph__empty-text">
                  This level has no direct subskills. Double-click on the empty space to return to
                  the previous level.
                </p>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="skillgraph__legend" aria-hidden="true">
        <div className="skillgraph__legend-item">
          <svg className="skillgraph__legend-swatch" viewBox="0 0 16 16">
            <rect
              className="skillgraph__legend-swatch-basic-shape"
              x="2"
              y="2.5"
              width="12"
              height="11"
              rx="2"
              ry="2"
            />
          </svg>
          <span className="skillgraph__legend-label">Basic knowledge</span>
        </div>
        <div className="skillgraph__legend-item">
          <svg className="skillgraph__legend-swatch" viewBox="0 0 16 16">
            <polygon
              className="skillgraph__legend-swatch-medium-shape"
              points="8,1.5 13.5,4.5 13.5,11.5 8,14.5 2.5,11.5 2.5,4.5"
            />
          </svg>
          <span className="skillgraph__legend-label">Intermediate knowledge</span>
        </div>
        <div className="skillgraph__legend-item">
          <svg className="skillgraph__legend-swatch" viewBox="0 0 16 16">
            <circle
              className="skillgraph__legend-swatch-advanced-shape"
              cx="8"
              cy="8"
              r="5.5"
            />
          </svg>
          <span className="skillgraph__legend-label">Advanced knowledge</span>
        </div>
        <div className="skillgraph__legend-item">
          <span className="skillgraph__legend-swatch skillgraph__legend-swatch--undefined" />
          <span className="skillgraph__legend-label">Level Not Defined</span>
        </div>
      </div>

      <style>{`
        .skillgraph {
          display: flex;
          flex-direction: column;
          gap: var(--space-3);
          padding: var(--space-4);
          border-radius: var(--radius-xl);
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
          border: 1px solid rgba(148, 163, 184, 0.4);
          box-shadow:
            0 0 0 1px rgba(15, 23, 42, 0.9),
            0 18px 60px rgba(15, 23, 42, 0.85);
        }

        .skillgraph__header {
          display: flex;
          flex-direction: column;
          gap: 0.35rem;
        }

        .skillgraph__eyebrow {
          margin: 0;
          font-size: var(--text-xs);
          text-transform: uppercase;
          letter-spacing: 0.16em;
          color: rgba(148, 163, 184, 0.95);
        }

        .skillgraph__title {
          margin: 0;
          font-size: var(--text-lg);
          font-weight: 600;
        }

        .skillgraph__hint {
          margin: 0;
          font-size: var(--text-xs);
          color: var(--color-text-muted);
        }

        .skillgraph__search {
          position: relative;
          margin-top: 0.35rem;
          max-width: 260px;
        }

        .skillgraph__search-input {
          width: 100%;
          padding: 0.35rem 0.6rem;
          border-radius: 999px;
          border: 1px solid rgba(148, 163, 184, 0.5);
          background: rgba(15, 23, 42, 0.96);
          color: rgba(226, 232, 240, 0.95);
          font-size: var(--text-xs);
        }

        .skillgraph__search-input:focus {
          outline: none;
          border-color: rgba(94, 234, 212, 0.9);
        }

        .skillgraph__search-input::placeholder {
          color: rgba(148, 163, 184, 0.8);
        }

        .skillgraph__search-results {
          position: absolute;
          z-index: 10;
          margin: 0.4rem 0 0;
          padding: 0.35rem 0;
          list-style: none;
          inset-inline: 0;
          border-radius: 0.75rem;
          border: 1px solid rgba(94, 234, 212, 0.95);
          background: rgba(15, 23, 42, 0.98);
          box-shadow: 0 18px 55px rgba(15, 23, 42, 0.9);
          max-height: 220px;
          overflow-y: auto;
        }

        .skillgraph__search-results li + li {
          margin-top: 0.1rem;
        }

        .skillgraph__search-result-button {
          width: 100%;
          padding: 0.25rem 0.75rem;
          border: 0;
          background: transparent;
          color: rgba(226, 232, 240, 0.95);
          font-size: var(--text-xs);
          text-align: left;
          cursor: pointer;
        }

        .skillgraph__search-result-button:hover {
          background: rgba(30, 64, 175, 0.35);
        }

        .skillgraph__search-result-name {
          white-space: nowrap;
          text-overflow: ellipsis;
          overflow: hidden;
          display: block;
        }

        .skillgraph__breadcrumb {
          margin-top: 0.4rem;
          display: flex;
          flex-wrap: wrap;
          gap: 0.25rem;
        }

        .skillgraph__breadcrumb-item {
          position: relative;
          display: inline-flex;
          align-items: center;
          gap: 0.25rem;
          padding: 0.1rem 0.4rem;
          border-radius: 999px;
          border: 0;
          background: transparent;
          color: rgba(226, 232, 240, 0.78);
          font-size: var(--text-xs);
          cursor: pointer;
          white-space: nowrap;
        }

        .skillgraph__breadcrumb-item--current {
          cursor: default;
          color: rgba(248, 250, 252, 0.96);
          background: rgba(15, 23, 42, 0.85);
          border: 1px solid rgba(94, 234, 212, 0.4);
        }

        .skillgraph__breadcrumb-item:not(.skillgraph__breadcrumb-item--current):hover {
          text-decoration: underline;
        }

        .skillgraph__breadcrumb-separator {
          margin-left: 0.1rem;
          opacity: 0.7;
        }

        .skillgraph__canvas {
          position: relative;
          margin-top: var(--space-2);
          border-radius: var(--radius-lg);
          padding: var(--space-3);
          background: radial-gradient(
              circle at top,
              rgba(15, 23, 42, 0.78),
              rgba(15, 23, 42, 0.96)
            );
          border: 1px dashed rgba(148, 163, 184, 0.45);
          min-height: 220px;
          overflow: hidden;
        }

        .skillgraph__legend {
          margin-top: var(--space-2);
          display: flex;
          flex-wrap: wrap;
          gap: 0.75rem 1.25rem;
          align-items: center;
          font-size: var(--text-xs);
          color: var(--color-text-muted);
        }

        .skillgraph__legend-item {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          opacity: 0.9;
        }

        .skillgraph__legend-swatch {
          width: 16px;
          height: 16px;
          display: block;
        }

        .skillgraph__legend-swatch-basic-shape {
          fill: transparent;
          stroke: rgba(56, 189, 248, 0.9);
          stroke-width: 1.5;
        }

        .skillgraph__legend-swatch-medium-shape {
          fill: transparent;
          stroke: rgba(129, 140, 248, 0.9);
          stroke-width: 1.5;
        }

        .skillgraph__legend-swatch-advanced-shape {
          fill: transparent;
          stroke: rgba(94, 234, 212, 0.95);
          stroke-width: 1.5;
        }

        .skillgraph__legend-swatch--undefined {
          background: transparent;
          border-radius: 2px;
          border: 1px dashed rgba(148, 163, 184, 0.7);
          width: 12px;
          height: 12px;
        }

        .skillgraph__legend-label {
          white-space: nowrap;
        }

        .skillgraph__nodes {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
          gap: var(--space-2);
          align-items: stretch;
          grid-auto-rows: 120px;
        }

        .skillgraph__node {
          position: relative;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          padding: 0.75rem 0.9rem;
          font-size: var(--text-xs);
          line-height: 1.3;
          color: rgba(248, 250, 252, 0.94);
          border-radius: 0.6rem;
          border: 1px solid rgba(148, 163, 184, 0.55);
          background: radial-gradient(
              circle at 20% 10%,
              rgba(248, 250, 252, 0.16),
              transparent 60%
            ),
            rgba(15, 23, 42, 0.98);
          box-shadow: 0 14px 38px rgba(15, 23, 42, 0.7);
          cursor: default;
          overflow: hidden;
          height: 100%;
          transition: opacity var(--transition-base), transform var(--transition-base), box-shadow var(--transition-base);
        }

        .skillgraph__node--dimmed {
          opacity: 0.15;
          pointer-events: none;
        }

        .skillgraph__node--dimmed:hover {
          opacity: 0.3;
          pointer-events: auto;
        }

        .skillgraph__node--navigable {
          cursor: pointer;
        }

        .skillgraph__node-label {
          text-align: center;
          z-index: 1;
          max-width: 80%;
          font-size: calc(var(--text-xs) * 0.95);
          line-height: 1.25;
          white-space: normal;
          word-break: break-word;
          overflow: hidden;
          text-overflow: ellipsis;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
        }

        .skillgraph__node-subtle-hint {
          margin-top: 0.4rem;
          font-size: 0.65rem;
          text-transform: uppercase;
          letter-spacing: 0.13em;
          color: rgba(148, 163, 184, 0.85);
        }

        .skillgraph__node-label,
        .skillgraph__node-subtle-hint {
          position: relative;
          z-index: 1;
        }

        .skillgraph__node--basic,
        .skillgraph__node--medium,
        .skillgraph__node--advanced,
        .skillgraph__node--undefined {
          border: none;
          background: transparent;
          box-shadow: none;
        }

        .skillgraph__node--selected {
          box-shadow:
            0 0 0 1px rgba(94, 234, 212, 0.85),
            0 20px 60px rgba(94, 234, 212, 0.3);
        }

        .skillgraph__node-shape {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
        }

        .skillgraph__node-shape-basic {
          fill: rgba(15, 23, 42, 0.98);
          stroke: rgba(56, 189, 248, 0.9);
          stroke-width: 1.6;
          vector-effect: non-scaling-stroke;
          filter: drop-shadow(0 18px 50px rgba(15, 23, 42, 0.65));
        }

        .skillgraph__node-shape-medium {
          fill: rgba(15, 23, 42, 0.98);
          stroke: rgba(129, 140, 248, 0.9);
          stroke-width: 1.6;
          vector-effect: non-scaling-stroke;
          filter: drop-shadow(0 18px 50px rgba(15, 23, 42, 0.75));
        }

        .skillgraph__node-shape-advanced {
          fill: rgba(15, 23, 42, 0.98);
          stroke: rgba(94, 234, 212, 0.95);
          stroke-width: 1.8;
          vector-effect: non-scaling-stroke;
          // filter: drop-shadow(0 22px 60px rgba(34, 197, 235, 0.45));
        }

        .skillgraph__node-shape-undefined {
          fill: rgba(15, 23, 42, 0.9);
          stroke: rgba(148, 163, 184, 0.7);
          stroke-width: 1.4;
          stroke-dasharray: 5 4;
          vector-effect: non-scaling-stroke;
          filter: drop-shadow(0 16px 45px rgba(15, 23, 42, 0.6));
        }

        .skillgraph__empty {
          grid-column: 1 / -1;
          padding: var(--space-3);
          border-radius: var(--radius-md);
          background: rgba(15, 23, 42, 0.85);
          border: 1px dashed rgba(148, 163, 184, 0.45);
        }

        .skillgraph__empty-text {
          margin: 0;
          font-size: var(--text-xs);
          color: var(--color-text-muted);
        }

        @media (max-width: 767px) {
          .skillgraph {
            padding: var(--space-3);
          }

          .skillgraph__canvas {
            min-height: 200px;
          }
        }
      `}</style>
    </section>
  );
}
