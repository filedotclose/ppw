"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useState } from "react";
import Navigation from "./Navigation";
import Cursor from "./Cursor";
import MotionSystem from "./MotionSystem";
import ProjectDetail from "./ProjectDetail";
import { identity, projects } from "@/data/portfolio";
import {
  GatepassField,
  PipelineField,
  OrderingField,
  HostelField,
} from "./ProjectFields";
import SceneBridge from "./SceneBridge";
import Profile from "./Profile";
import BuildIndex from "./BuildIndex";
import Contact from "./Contact";
import ScrollFeatures from "./ScrollFeatures";
import VectorArrow from "./VectorArrow";

const OpticalLens = dynamic(() => import("./OpticalLens"), { ssr: false });
const fields = [GatepassField, PipelineField, OrderingField, HostelField];
const projectAnchors = ["work", "signal", "structure", "korridor"];

export default function Portfolio() {
  const [detail, setDetail] = useState<number | null>(null);
  return (
    <>
      <a className="skip-link" href="#work">
        Skip to the work
      </a>
      <Navigation />
      <Cursor />
      <MotionSystem />
      <div className="optical-fallback" aria-hidden="true">
        <div className="fallback-type">Aa</div>
      </div>
      <OpticalLens />
      <main>
        <section
          id="top"
          className="hero"
          data-scene="hero"
          data-context="Sujal Agarwal / Portfolio"
          tabIndex={-1}
          aria-labelledby="hero-title"
        >
          <div className="hero-stage">
            <div className="hero-kicker">
              <span>Full-stack. AI. Automation.</span>
            </div>
            <h1
              id="hero-title"
              className="hero-title"
              aria-label="Sujal Agarwal"
            >
              <span className="hero-word hero-word--first" aria-hidden="true">
                <span>SUJAL</span>
              </span>
              <span className="hero-word hero-word--second" aria-hidden="true">
                <span>
                  AGARWAL<span className="hero-period">.</span>
                </span>
              </span>
            </h1>
            <div className="hero-caption">
              <span className="caption-rule" />
              <p>
                B.Tech · Computer Science at KIIT.
                <br />
                2024–2028 · CGPA 9.95.
              </p>
            </div>
            <div className="hero-foot">
              <span>Selected work & experience.</span>
              <a href="#work">
                Scroll to look closer <VectorArrow direction="down" />
              </a>
              <span className="hero-foot-right">{identity.location}</span>
            </div>
            <div className="hero-reveal" aria-hidden="true">
              <span>LOOK</span>
              <span>CLOSER.</span>
              <p>From secure systems to automated workflows.</p>
            </div>
          </div>
        </section>
        <section
          className="intro"
          data-scene="intro"
          data-context="Full-stack / AI / Secure systems"
          aria-labelledby="intro-title"
        >
          <div className="section-label">
            <span>01 / A closer look</span>
            <span>Software & systems</span>
          </div>
          <h2 id="intro-title">
            <span className="intro-line intro-line--one">Full-stack.</span>
            <span className="intro-line intro-line--two">AI workflows.</span>
            <span className="intro-line intro-line--three">
              Secure systems<span className="accent">.</span>
            </span>
          </h2>
          <div className="intro-bottom">
            <p>
              I’m Sujal, a Computer Science and Engineering student at KIIT,
              2024–2028, with a 9.95 CGPA. I build full-stack campus products,
              secure government appraisal workflows and automated AI video
              pipelines.
            </p>
            <a className="text-action" href="#profile">
              View my experience <VectorArrow direction="down-right" />
            </a>
          </div>
        </section>
        {projects.map((project, index) => {
          const Field = fields[index];
          return (
            <div key={project.id}>
              {index === 1 && (
                <SceneBridge from="Access" to="Automation" variant="signal" />
              )}
              {index === 2 && (
                <SceneBridge
                  from="Automation"
                  to="Ordering"
                  variant="structure"
                />
              )}
              <section
                id={projectAnchors[index]}
                className={`study study--${project.scene}`}
                data-scene={project.scene}
                data-context={`${project.number} / ${project.shortTitle}`}
                tabIndex={-1}
                aria-labelledby={`${project.id}-title`}
              >
                <div className="study-topline">
                  <span>
                    {project.number} / {project.shortTitle}
                  </span>
                  <span>{project.discipline}</span>
                  <span>Selected project</span>
                </div>
                <div className="study-heading">
                  <h2
                    className="study-title"
                    id={`${project.id}-title`}
                    aria-label={project.title}
                  >
                    {project.titleLines[0]}
                    <br />
                    <em>{project.titleLines[1]}</em>
                  </h2>
                  <button
                    className="study-open"
                    onClick={() => setDetail(index)}
                    aria-label={`Read about ${project.title}`}
                    data-cursor="VIEW"
                  >
                    <VectorArrow direction="up-right" strokeWidth={1.5} />
                  </button>
                </div>
                <Field />
                <div className="study-bottom">
                  <p>{project.description}</p>
                  <div>
                    <span className="eyebrow">{project.tools.join(" / ")}</span>
                    <button
                      className="text-action"
                      onClick={() => setDetail(index)}
                      data-cursor="VIEW"
                    >
                      Explore the project <VectorArrow direction="up-right" />
                    </button>
                  </div>
                </div>
              </section>
            </div>
          );
        })}
        {/* Open Source & GitHub Projects Showcase Callout */}
        <section
          className="projects-archive-callout"
          style={{
            padding: "clamp(48px, 7vw, 84px) clamp(20px, 4.5vw, 64px)",
            borderTop: "1px solid var(--line)",
            borderBottom: "1px solid var(--line)",
            background: "rgba(37, 40, 34, 0.03)",
            display: "flex",
            flexDirection: "column",
            gap: "20px",
            alignItems: "flex-start",
          }}
          aria-labelledby="archive-callout-heading"
        >
          <div className="section-label">
            <span>02 / Open Source & Engineering</span>
            <span>All GitHub Projects</span>
          </div>
          <h2
            id="archive-callout-heading"
            style={{
              fontSize: "clamp(30px, 4.4vw, 56px)",
              fontWeight: 500,
              lineHeight: 1.1,
              letterSpacing: "-0.035em",
              maxWidth: "24ch",
            }}
          >
            Explore all 9 GitHub projects with interactive schematics
            <span className="accent">.</span>
          </h2>
          <p
            style={{
              maxWidth: "64ch",
              fontSize: "clamp(15px, 1.15vw, 17px)",
              lineHeight: 1.6,
              color: "var(--muted)",
            }}
          >
            Access the complete GitHub repository archive — including KIIT KSAC
            GatePass Pro, AI Review & Construction DPR System, Gesture-MIDI computer
            vision instrument, KLICK mechanical switch audio emulator, Online Kafe,
            and more.
          </p>
          <Link
            href="/projects"
            style={{
              fontSize: "13px",
              fontWeight: 650,
              letterSpacing: "0.05em",
              textTransform: "uppercase",
              padding: "14px 24px",
              background: "var(--ink)",
              color: "var(--paper)",
              border: "1px solid var(--ink)",
              borderRadius: "4px",
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              marginTop: "8px",
            }}
            data-cursor="PROJECTS"
          >
            Explore All 9 Projects (GSAP Horizontal Showcase){" "}
            <VectorArrow direction="right" />
          </Link>
        </section>

        <Profile />
        <BuildIndex />
        <Contact />
      </main>
      <ScrollFeatures />
      <ProjectDetail
        project={detail === null ? null : projects[detail]}
        onClose={() => setDetail(null)}
        onNext={() => setDetail(((detail ?? 0) + 1) % projects.length)}
      />
    </>
  );
}
