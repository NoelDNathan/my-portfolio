import { useMemo, useState, type MouseEvent } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { skillsGraph, type SkillNode } from "../../data/skillsGraph";

type SkillGraphNode = SkillNode;

interface SkillGraphProps {
  className?: string;
}

export function SkillGraph({ className }: SkillGraphProps) {
  const [currentNodeId, setCurrentNodeId] = useState<string | null>(null);

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

  const handleBackgroundDoubleClick = (event: MouseEvent<HTMLDivElement>) => {
    if (event.target !== event.currentTarget) {
      return;
    }

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

  return (
    <section
      className={`skillgraph ${className ?? ""}`}
      aria-label="Hierarchical skills graph"
    >
      <div className="skillgraph__header">
        <p className="skillgraph__eyebrow">Skill graph</p>
        <p className="skillgraph__title">{currentRootLabel}</p>
        <p className="skillgraph__hint">
          Double-click a skill to zoom in. Double-click on the empty space to return to the previous level.
        </p>
        <nav
          className="skillgraph__breadcrumb"
          aria-label="Skill graph level navigation"
        >
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
                  <span
                    className="skillgraph__breadcrumb-separator"
                    aria-hidden="true"
                  >
                    /
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      <div
        className="skillgraph__canvas"
        onDoubleClick={handleBackgroundDoubleClick}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={graphKey}
            className="skillgraph__nodes"
            initial={
              shouldReduceMotion
                ? { opacity: 0 }
                : { opacity: 0, scale: 0.9, y: 8 }
            }
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={
              shouldReduceMotion
                ? { opacity: 0 }
                : { opacity: 0, scale: 0.95, y: -8 }
            }
            transition={
              shouldReduceMotion
                ? { duration: 0 }
                : { duration: 0.35, ease: "easeOut" }
            }
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

              return (
                <motion.button
                  key={node.id}
                  type="button"
                  className={`skillgraph__node ${levelClass} ${
                    isNavigable ? "skillgraph__node--navigable" : ""
                  }`}
                  layout
                  whileHover={
                    shouldReduceMotion
                      ? undefined
                      : { scale: 1.03, translateY: -2 }
                  }
                  whileTap={
                    shouldReduceMotion
                      ? undefined
                      : { scale: 0.97 }
                  }
                  onDoubleClick={(event) => {
                    event.stopPropagation();
                    if (isNavigable) {
                      setCurrentNodeId(node.id);
                    }
                  }}
                >
                  <span className="skillgraph__node-label">{node.name}</span>
                  {isNavigable && (
                    <span
                      className="skillgraph__node-subtle-hint"
                      aria-hidden="true"
                    >
                      Subskills
                    </span>
                  )}
                </motion.button>
              );
            })}

            {currentChildren.length === 0 && (
              <div className="skillgraph__empty">
                <p className="skillgraph__empty-text">
                  This level has no direct subskills. Double-click on the empty space to return to the previous level.
                </p>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
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

        .skillgraph__nodes {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
          gap: var(--space-2);
          align-items: stretch;
        }

        .skillgraph__node {
          position: relative;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          padding: 0.75rem 0.85rem;
          font-size: var(--text-xs);
          line-height: 1.3;
          color: rgba(248, 250, 252, 0.94);
          border-radius: 0.9rem;
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
        }

        .skillgraph__node--navigable {
          cursor: pointer;
        }

        .skillgraph__node-label {
          text-align: center;
          z-index: 1;
        }

        .skillgraph__node-subtle-hint {
          margin-top: 0.4rem;
          font-size: 0.65rem;
          text-transform: uppercase;
          letter-spacing: 0.13em;
          color: rgba(148, 163, 184, 0.85);
        }

        .skillgraph__node--basic {
          border-radius: 0.4rem;
        }

        .skillgraph__node--medium {
          clip-path: polygon(
            30% 0%,
            70% 0%,
            100% 30%,
            100% 70%,
            70% 100%,
            30% 100%,
            0% 70%,
            0% 30%
          );
        }

        .skillgraph__node--advanced {
          border-radius: 999px;
        }

        .skillgraph__node--undefined {
          border-style: dashed;
          border-color: rgba(148, 163, 184, 0.5);
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

