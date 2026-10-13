"use client";

import { useEffect, useRef, useState, useMemo, useCallback } from "react";
import Link from "next/link";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { githubProjects, type GitHubProject } from "@/data/github-projects";
import { githubFieldComponents } from "./GitHubProjectFields";
import Cursor from "./Cursor";
import VectorArrow from "./VectorArrow";

export default function GitHubProjectsShowcase() {
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"horizontal" | "grid">("horizontal");
  const [activeProjectIndex, setActiveProjectIndex] = useState(0);
  const [selectedModalProject, setSelectedModalProject] =
    useState<GitHubProject | null>(null);
  const [scrollPct, setScrollPct] = useState(0);

  const viewportRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const scrollTriggerRef = useRef<ScrollTrigger | null>(null);

  // Filter projects by active category
  const filteredProjects = useMemo(() => {
    if (activeCategory === "all") return githubProjects;
    return githubProjects.filter((p) => p.category === activeCategory);
  }, [activeCategory]);

  // Handle Detail Modal lifecycle & animations
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (selectedModalProject) {
      dialog.showModal();
      document.body.style.overflow = "hidden";
      if (!matchMedia("(prefers-reduced-motion: reduce)").matches) {
        gsap.fromTo(
          dialog,
          { clipPath: "inset(20% 10% 20% 10%)", scale: 0.96, opacity: 0 },
          {
            clipPath: "inset(0% 0% 0% 0%)",
            scale: 1,
            opacity: 1,
            duration: 0.5,
            ease: "power3.out",
          },
        );
      }
    } else {
      dialog.close();
      document.body.style.overflow = "";
    }
  }, [selectedModalProject]);

  const closeModal = useCallback(() => {
    const dialog = dialogRef.current;
    if (!dialog) {
      setSelectedModalProject(null);
      return;
    }
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setSelectedModalProject(null);
    } else {
      gsap.to(dialog, {
        clipPath: "inset(0% 0% 100% 0%)",
        opacity: 0,
        duration: 0.35,
        ease: "power3.in",
        onComplete: () => setSelectedModalProject(null),
      });
    }
  }, []);

  // GSAP Horizontal Scroll Setup with ScrollTrigger pinning
  useEffect(() => {
    if (viewMode !== "horizontal") {
      scrollTriggerRef.current = null;
      return;
    }

    gsap.registerPlugin(ScrollTrigger);
    const media = gsap.matchMedia();

    media.add("(prefers-reduced-motion: no-preference)", () => {
      const track = trackRef.current;
      const viewport = viewportRef.current;
      if (!track || !viewport) return;

      const getScrollDistance = () => {
        const trackWidth = track.scrollWidth;
        const windowWidth = window.innerWidth;
        return Math.max(0, trackWidth - windowWidth);
      };

      const tween = gsap.to(track, {
        x: () => -getScrollDistance(),
        ease: "none",
        scrollTrigger: {
          id: "horizontal-track-trigger",
          trigger: viewport,
          pin: true,
          scrub: 0.6,
          start: "top top",
          end: () => `+=${getScrollDistance()}`,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            setScrollPct(Math.round(self.progress * 100));
            const count = filteredProjects.length;
            const newIndex = Math.min(
              count - 1,
              Math.max(0, Math.floor(self.progress * count)),
            );
            setActiveProjectIndex(newIndex);
          },
        },
      });

      scrollTriggerRef.current = tween.scrollTrigger ?? null;

      // Trackpad horizontal swipe listener (maps deltaX to page vertical scroll)
      const onWheel = (e: WheelEvent) => {
        if (Math.abs(e.deltaX) > Math.abs(e.deltaY) && Math.abs(e.deltaX) > 2) {
          e.preventDefault();
          window.scrollBy({ top: e.deltaX * 0.9, behavior: "auto" });
        }
      };

      window.addEventListener("wheel", onWheel, { passive: false });

      return () => {
        window.removeEventListener("wheel", onWheel);
        tween.scrollTrigger?.kill();
        tween.kill();
        scrollTriggerRef.current = null;
      };
    });

    return () => {
      media.revert();
    };
  }, [filteredProjects, viewMode]);

  // Navigate directly to a project
  const navigateToProject = (targetIndex: number) => {
    const clampedIndex = Math.max(0, Math.min(filteredProjects.length - 1, targetIndex));
    setActiveProjectIndex(clampedIndex);

    if (viewMode === "grid") {
      const el = document.getElementById(
        `project-${filteredProjects[clampedIndex]?.id}`,
      );
      if (el) {
        const headerOffset = 130;
        const bodyRect = document.body.getBoundingClientRect().top;
        const elementRect = el.getBoundingClientRect().top;
        const elementPosition = elementRect - bodyRect;
        const offsetPosition = elementPosition - headerOffset;
        window.scrollTo({ top: offsetPosition, behavior: "smooth" });
      }
      return;
    }

    const st = scrollTriggerRef.current;
    if (!st) return;

    const count = filteredProjects.length;
    const targetProgress = count > 1 ? clampedIndex / (count - 1) : 0;
    const targetScrollY = st.start + targetProgress * (st.end - st.start);

    window.scrollTo({ top: targetScrollY, behavior: "smooth" });
  };

  // Keyboard navigation for Left / Right arrows & Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (selectedModalProject) {
        if (e.key === "Escape") closeModal();
        return;
      }

      if (e.key === "ArrowRight") {
        navigateToProject(activeProjectIndex + 1);
      } else if (e.key === "ArrowLeft") {
        navigateToProject(activeProjectIndex - 1);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeProjectIndex, filteredProjects.length, selectedModalProject, closeModal]);

  const selectCategory = (catId: string) => {
    setActiveCategory(catId);
    setActiveProjectIndex(0);
    window.scrollTo({ top: 0, behavior: "instant" });
    setTimeout(() => {
      ScrollTrigger.refresh();
    }, 60);
  };

  const categories = [
    { id: "all", label: `All Projects (${githubProjects.length})` },
    { id: "fullstack", label: "Full-Stack (4)" },
    { id: "ai-systems", label: "AI & Systems (2)" },
    { id: "creative-audio", label: "Creative & Audio (2)" },
    { id: "data-science", label: "Data Science (1)" },
  ];

  const currentProject = filteredProjects[activeProjectIndex] || filteredProjects[0];

  return (
    <div className="projects-page">
      <Cursor />

      {/* Unified Fixed Chrome Header */}
      <header className="projects-chrome">
        <div className="projects-header-inner">
          <Link href="/" className="projects-back-link" data-cursor="BACK">
            <VectorArrow direction="left" /> Back to Portfolio
          </Link>

          <div className="projects-header-center">
            <div className="projects-counter-badge">
              Project <span>{currentProject?.number || "01"}</span> of 0
              {filteredProjects.length} •{" "}
              <strong>{currentProject?.shortTitle.toUpperCase()}</strong>
            </div>
          </div>

          <div className="projects-header-actions">
            <button
              type="button"
              className="view-toggle-btn"
              onClick={() =>
                setViewMode((v) => (v === "horizontal" ? "grid" : "horizontal"))
              }
              aria-label="Switch between GSAP horizontal scroll and vertical grid layout"
              data-cursor="TOGGLE"
            >
              Mode: {viewMode === "horizontal" ? "GSAP Scroll" : "Grid View"}
            </button>

            <a
              href="https://github.com/filedotclose"
              target="_blank"
              rel="noopener noreferrer"
              className="projects-github-link"
              data-cursor="GITHUB"
            >
              GitHub / filedotclose <VectorArrow direction="up-right" />
            </a>
          </div>
        </div>

        {/* Category Filter and Project Stepper */}
        <nav
          className="projects-filter-bar"
          aria-label="Filter projects by discipline"
        >
          <div
            className="projects-filter-chips"
            role="group"
            aria-label="Project categories"
          >
            {categories.map((cat) => (
              <button
                key={cat.id}
                type="button"
                className="filter-chip"
                aria-pressed={activeCategory === cat.id}
                onClick={() => selectCategory(cat.id)}
                data-cursor="FILTER"
              >
                {cat.label}
              </button>
            ))}
          </div>

          <div
            className="projects-nav-arrows"
            role="group"
            aria-label="Previous and Next project navigation"
          >
            <button
              type="button"
              className="nav-arrow-btn"
              disabled={activeProjectIndex === 0}
              onClick={() => navigateToProject(activeProjectIndex - 1)}
              aria-label="Previous project"
              data-cursor="PREV"
            >
              <VectorArrow direction="left" />
            </button>
            <span className="nav-stepper-count" aria-live="polite">
              0{activeProjectIndex + 1} / 0{filteredProjects.length}
            </span>
            <button
              type="button"
              className="nav-arrow-btn"
              disabled={activeProjectIndex === filteredProjects.length - 1}
              onClick={() => navigateToProject(activeProjectIndex + 1)}
              aria-label="Next project"
              data-cursor="NEXT"
            >
              <VectorArrow direction="right" />
            </button>
          </div>
        </nav>

        {/* Hairline Progress Indicator */}
        <div className="projects-scroll-progress" aria-hidden="true">
          <div
            className="projects-scroll-progress-fill"
            style={{ width: `${scrollPct}%` }}
          />
        </div>
      </header>

      {/* Main Viewport Content: Horizontal GSAP Track OR Vertical Grid */}
      <main>
        {viewMode === "horizontal" ? (
          <div ref={viewportRef} className="projects-viewport">
            <div ref={trackRef} className="projects-horizontal-track">
              {filteredProjects.map((project) => {
                const FieldComponent = githubFieldComponents[project.id];
                return (
                  <article
                    key={project.id}
                    id={`project-${project.id}`}
                    className="project-study-panel"
                    style={
                      {
                        "--card-paper": project.palette.paper,
                        "--card-ink": project.palette.ink,
                        "--card-accent": project.palette.accent,
                      } as React.CSSProperties
                    }
                    tabIndex={0}
                    aria-labelledby={`title-${project.id}`}
                  >
                    {/* Topline: Number, Discipline, Category Tag */}
                    <div className="panel-topline">
                      <span>
                        {project.number} / 0{filteredProjects.length} •{" "}
                        {project.shortTitle}
                      </span>
                      <span>{project.discipline}</span>
                      <span className="panel-cat-badge">
                        {project.categoryLabel}
                      </span>
                    </div>

                    {/* Majestic Heading: Two-line editorial title + Open button */}
                    <div className="panel-heading">
                      <h2 className="panel-title" id={`title-${project.id}`}>
                        <span>{project.titleLines[0]}</span>
                        <br />
                        <em>{project.titleLines[1]}</em>
                      </h2>
                      <button
                        type="button"
                        className="panel-open-btn"
                        onClick={() => setSelectedModalProject(project)}
                        aria-label={`Inspect ${project.title} architecture`}
                        data-cursor="VIEW"
                      >
                        <VectorArrow direction="up-right" strokeWidth={1.5} />
                      </button>
                    </div>

                    {/* Interactive Architectural Schematic Component */}
                    <div className="panel-schematic">
                      {FieldComponent && <FieldComponent />}
                    </div>

                    {/* Panel Bottom: Description, Tools, Links */}
                    <div className="panel-bottom">
                      <p className="panel-desc">{project.description}</p>
                      <div className="panel-footer-actions">
                        <span className="eyebrow">
                          {project.tools.slice(0, 4).join(" / ")}
                        </span>
                        <div className="panel-buttons">
                          <button
                            type="button"
                            className="text-action"
                            onClick={() => setSelectedModalProject(project)}
                            data-cursor="VIEW"
                          >
                            Explore Architecture{" "}
                            <VectorArrow direction="up-right" />
                          </button>
                          <a
                            href={project.githubUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="panel-ext-pill"
                            data-cursor="REPO"
                          >
                            GitHub Repo <VectorArrow direction="up-right" />
                          </a>
                          {project.liveUrl && (
                            <a
                              href={project.liveUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="panel-ext-pill panel-ext-pill--live"
                              data-cursor="LIVE"
                            >
                              Live App <VectorArrow direction="up-right" />
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="projects-grid-container">
            {filteredProjects.map((project) => {
              const FieldComponent = githubFieldComponents[project.id];
              return (
                <article
                  key={project.id}
                  id={`project-${project.id}`}
                  className="project-study-panel project-study-panel--grid"
                  style={
                    {
                      "--card-paper": project.palette.paper,
                      "--card-ink": project.palette.ink,
                      "--card-accent": project.palette.accent,
                    } as React.CSSProperties
                  }
                  tabIndex={0}
                  aria-labelledby={`grid-title-${project.id}`}
                >
                  <div className="panel-topline">
                    <span>
                      {project.number} / 0{filteredProjects.length} •{" "}
                      {project.shortTitle}
                    </span>
                    <span>{project.discipline}</span>
                    <span className="panel-cat-badge">
                      {project.categoryLabel}
                    </span>
                  </div>

                  <div className="panel-heading">
                    <h2
                      className="panel-title"
                      id={`grid-title-${project.id}`}
                    >
                      <span>{project.titleLines[0]}</span>
                      <br />
                      <em>{project.titleLines[1]}</em>
                    </h2>
                    <button
                      type="button"
                      className="panel-open-btn"
                      onClick={() => setSelectedModalProject(project)}
                      aria-label={`Inspect ${project.title} architecture`}
                      data-cursor="VIEW"
                    >
                      <VectorArrow direction="up-right" strokeWidth={1.5} />
                    </button>
                  </div>

                  <div className="panel-schematic">
                    {FieldComponent && <FieldComponent />}
                  </div>

                  <div className="panel-bottom">
                    <p className="panel-desc">{project.description}</p>
                    <div className="panel-footer-actions">
                      <span className="eyebrow">{project.tools.join(" / ")}</span>
                      <div className="panel-buttons">
                        <button
                          type="button"
                          className="text-action"
                          onClick={() => setSelectedModalProject(project)}
                          data-cursor="VIEW"
                        >
                          Explore Architecture <VectorArrow direction="up-right" />
                        </button>
                        <a
                          href={project.githubUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="panel-ext-pill"
                          data-cursor="REPO"
                        >
                          GitHub Repo <VectorArrow direction="up-right" />
                        </a>
                        {project.liveUrl && (
                          <a
                            href={project.liveUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="panel-ext-pill panel-ext-pill--live"
                            data-cursor="LIVE"
                          >
                            Live App <VectorArrow direction="up-right" />
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </main>

      {/* Architectural Detail Dialog Modal */}
      <dialog
        ref={dialogRef}
        className="projects-detail-dialog"
        aria-labelledby="modal-project-title"
        onCancel={(e) => {
          e.preventDefault();
          closeModal();
        }}
        data-lenis-prevent
      >
        {selectedModalProject && (
          <>
            <div className="modal-header">
              <span className="eyebrow">
                Project {selectedModalProject.number} •{" "}
                {selectedModalProject.discipline}
              </span>
              <button
                type="button"
                className="text-action"
                onClick={closeModal}
                autoFocus
                data-cursor="CLOSE"
              >
                Close <span aria-hidden="true">×</span>
              </button>
            </div>

            <div className="modal-body">
              <div className="modal-title-section">
                <span className="eyebrow">
                  GitHub Repository / Sujal Agarwal (@filedotclose)
                </span>
                <h3 id="modal-project-title" className="modal-title">
                  {selectedModalProject.title}
                </h3>
                <p className="modal-lead">{selectedModalProject.description}</p>
              </div>

              {/* Concrete Engineering Metrics */}
              <div className="modal-metrics-grid">
                {selectedModalProject.metrics.map((m) => (
                  <div key={m.label} className="modal-metric-card">
                    <span className="metric-label">{m.label}</span>
                    <span className="metric-value">{m.value}</span>
                  </div>
                ))}
              </div>

              {/* Architectural Pillars */}
              <div className="modal-pillars-grid">
                <section className="modal-pillar">
                  <h4>01 / Problem & Context</h4>
                  <p>{selectedModalProject.context}</p>
                </section>
                <section className="modal-pillar">
                  <h4>02 / My Implementation</h4>
                  <p>{selectedModalProject.implementation}</p>
                </section>
                <section className="modal-pillar">
                  <h4>03 / Technical Specifications</h4>
                  <p>{selectedModalProject.detail}</p>
                </section>
              </div>

              <div className="modal-footer">
                <div className="project-tools-list">
                  {selectedModalProject.tools.map((tool) => (
                    <span key={tool} className="tool-tag">
                      {tool}
                    </span>
                  ))}
                </div>

                <div className="modal-footer-links">
                  <a
                    href={selectedModalProject.githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="modal-ext-btn modal-ext-btn--primary"
                    data-cursor="REPO"
                  >
                    View Source Code on GitHub <VectorArrow direction="up-right" />
                  </a>
                  {selectedModalProject.liveUrl && (
                    <a
                      href={selectedModalProject.liveUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="modal-ext-btn modal-ext-btn--secondary"
                      data-cursor="LIVE"
                    >
                      Open Live Deployment <VectorArrow direction="up-right" />
                    </a>
                  )}
                </div>
              </div>
            </div>
          </>
        )}
      </dialog>
    </div>
  );
}
