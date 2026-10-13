"use client";

import { useState, type CSSProperties } from "react";
import VectorArrow from "./VectorArrow";

const schematicLabel = "Project schematic / Not a product screenshot";

function FieldLabel({ name }: { name: string }) {
  return (
    <header className="project-field-label">
      <span className="project-visual-type">{name}</span>
      <span className="project-visual-type">{schematicLabel}</span>
    </header>
  );
}

const gateStations = [
  {
    name: "Checkpoint",
    detail: "Guard checkpoints monitor hostel and library access.",
  },
  {
    name: "Role policy",
    detail:
      "JWT authentication and role-based access policies protect guard checkpoints.",
  },
  {
    name: "Access record",
    detail:
      "A Node.js, Express, and MongoDB platform monitors transit through hostel and library checkpoints.",
  },
] as const;

export function GatepassField() {
  const [target, setTarget] = useState<"Hostel" | "Library">("Hostel");
  const [selected, setSelected] = useState(0);

  return (
    <section
      className="study-visual project-field gatepass-field"
      aria-label="Gatepass access-management schematic"
    >
      <FieldLabel name="Gatepass / Access architecture" />
      <div
        className="project-field-controls gatepass-targets"
        role="group"
        aria-label="Select checkpoint location"
      >
        {(["Hostel", "Library"] as const).map((location) => (
          <button
            type="button"
            key={location}
            aria-pressed={target === location}
            onClick={() => setTarget(location)}
          >
            <span className="project-visual-type">{location}</span>
          </button>
        ))}
      </div>
      <div className="gatepass-direction">
        <p className="project-field-kicker project-visual-type">
          {target} / Access monitoring
        </p>
        <p className="gatepass-type project-visual-type">
          IN <span>/</span> OUT
        </p>
        <p className="project-field-kicker project-visual-type">
          Node.js / Express / MongoDB / JWT / RBAC
        </p>
      </div>
      <div
        className="gatepass-route project-field-controls"
        role="group"
        aria-label="Inspect access workflow stations"
      >
        {gateStations.map((station, index) => (
          <button
            type="button"
            key={station.name}
            aria-pressed={selected === index}
            onClick={() => setSelected(index)}
          >
            <span className="project-field-kicker project-visual-type">
              0{index + 1}
            </span>
            <span className="project-visual-type">{station.name}</span>
          </button>
        ))}
      </div>
      <p
        className="project-field-context project-visual-type"
        aria-live="polite"
        aria-atomic="true"
      >
        {gateStations[selected].detail}
      </p>
      <footer className="project-field-foot">
        <p className="project-visual-type">
          500 simulated concurrent users / Stress test, not live adoption
        </p>
        <p className="project-visual-type">
          Biometric-device integration / Hardware-ready architecture
        </p>
      </footer>
    </section>
  );
}

const pipelineStages = [
  {
    verb: "Research",
    name: "Topic research",
    detail:
      "Python and n8n orchestrate topic research within an automated AWS pipeline.",
    output: "Topic research / Script generation",
  },
  {
    verb: "Script",
    name: "Script generation",
    detail: "Gemini 2.0 Flash generates video scripts through the Gemini API.",
    output: "Gemini 2.0 Flash / Script generation",
  },
  {
    verb: "Source",
    name: "B-roll sourcing",
    detail: "Dynamic B-roll fetching sources footage through the Pexels API.",
    output: "Pexels API / B-roll",
  },
  {
    verb: "Voice",
    name: "Voice synthesis",
    detail:
      "Voice synthesis is integrated into the automated video-production workflow.",
    output: "Voice synthesis / Publication",
  },
  {
    verb: "Publish",
    name: "YouTube publication",
    detail:
      "YouTube Data API v3, integrated in n8n, automates metadata tagging, scheduling, and publication.",
    output: "YouTube Data API v3 / Metadata / Scheduling / Publication",
  },
] as const;

export function PipelineField() {
  const [selected, setSelected] = useState(0);
  const stage = pipelineStages[selected];

  return (
    <section
      className="study-visual project-field pipeline-field"
      aria-label="Automated AI YouTube Pipeline schematic"
    >
      <FieldLabel name="Automated AI YouTube Pipeline" />
      <p className="project-field-kicker project-visual-type">
        Python / n8n / Gemini API / AWS / Pexels API
      </p>
      <div className="pipeline-stage">
        <p className="pipeline-index project-visual-type">
          0{selected + 1} <span>/ 05</span>
        </p>
        <h3 className="pipeline-verb project-visual-type">{stage.verb}</h3>
        <p className="project-field-kicker project-visual-type">
          {stage.output}
        </p>
      </div>
      <div className="pipeline-navigation project-field-controls">
        <div
          className="pipeline-stages"
          role="group"
          aria-label="Select a pipeline stage"
        >
          {pipelineStages.map((item, index) => (
            <button
              type="button"
              key={item.verb}
              aria-label={`Inspect stage ${index + 1}: ${item.name}`}
              aria-pressed={selected === index}
              onClick={() => setSelected(index)}
            >
              <span className="project-field-kicker project-visual-type">
                0{index + 1}
              </span>
              <span className="project-visual-type">{item.verb}</span>
            </button>
          ))}
        </div>
        <button
          type="button"
          className="pipeline-next"
          onClick={() =>
            setSelected((current) => (current + 1) % pipelineStages.length)
          }
          aria-label={
            selected === 4
              ? "Next stage: return to topic research"
              : `Next stage: ${pipelineStages[selected + 1].name}`
          }
        >
          <span className="project-visual-type">Next stage</span>
          <VectorArrow direction="up-right" />
        </button>
      </div>
      <div
        className="pipeline-explanation"
        aria-live="polite"
        aria-atomic="true"
      >
        <p className="project-field-kicker project-visual-type">
          Selected stage {selected + 1} of 5 / Not run progress
        </p>
        <p className="project-field-context project-visual-type">
          {stage.detail}
        </p>
      </div>
      <footer className="project-field-foot">
        <p className="project-visual-type">
          Workflow interpretation / No pipeline run is triggered here
        </p>
      </footer>
    </section>
  );
}

const orderingLayers = [
  {
    name: "Cart",
    technology: "React / Redux Toolkit",
    detail:
      "React and Redux Toolkit centralize state for persistent carts and high-speed checkouts.",
  },
  {
    name: "Inventory",
    technology: "REST APIs",
    detail:
      "An administrative dashboard and RESTful APIs support real-time inventory management.",
  },
  {
    name: "Kitchen",
    technology: "Fulfillment tracking",
    detail:
      "Kitchen fulfillment tracking connects order workflows to the administrative dashboard.",
  },
] as const;

export function OrderingField() {
  const [selected, setSelected] = useState(0);
  const [separation, setSeparation] = useState(55);

  return (
    <section
      className="study-visual project-field ordering-field"
      aria-label="KIITKafe ordering architecture schematic"
      style={{ "--order-separation": separation / 100 } as CSSProperties}
    >
      <FieldLabel name="KIITKafe / Ordering architecture" />
      <div className="ordering-composition">
        <div className="ordering-stack" aria-hidden="true">
          {orderingLayers.map((layer, index) => (
            <div
              className={`ordering-plane ordering-plane--${index + 1}`}
              data-selected={selected === index}
              key={layer.name}
              style={{ "--order-layer": index } as CSSProperties}
            >
              <span className="project-field-kicker project-visual-type">
                0{index + 1} / {layer.technology}
              </span>
              <span className="ordering-plane-title project-visual-type">
                {layer.name}
              </span>
            </div>
          ))}
        </div>
        <div className="ordering-inspection">
          <div
            className="ordering-selectors project-field-controls"
            role="group"
            aria-label="Inspect ordering architecture layers"
          >
            {orderingLayers.map((layer, index) => (
              <button
                type="button"
                key={layer.name}
                aria-pressed={selected === index}
                onClick={() => setSelected(index)}
              >
                <span className="project-field-kicker project-visual-type">
                  0{index + 1}
                </span>
                <span className="project-visual-type">{layer.name}</span>
              </button>
            ))}
          </div>
          <p
            className="project-field-context project-visual-type"
            aria-live="polite"
            aria-atomic="true"
          >
            {orderingLayers[selected].detail}
          </p>
        </div>
      </div>
      <div className="ordering-separation project-field-controls">
        <label htmlFor="order-separation" className="project-visual-type">
          Separate the architecture layers
        </label>
        <input
          id="order-separation"
          type="range"
          min="0"
          max="100"
          value={separation}
          onChange={(event) => setSeparation(Number(event.target.value))}
          aria-valuetext={`${separation} percent visual separation`}
        />
        <span className="project-field-kicker project-visual-type">
          {separation}% / Visual only
        </span>
      </div>
      <footer className="project-field-foot">
        <p className="project-visual-type">
          React / Redux Toolkit / Node.js / Express / MongoDB
        </p>
        <p className="project-visual-type">
          Architecture interpretation / No cart, inventory or order is changed
        </p>
      </footer>
    </section>
  );
}

const hostelProcesses = [
  {
    verb: "Onboard",
    detail:
      "Korridor is a mobile-first student hostel portal with student onboarding, built with Next.js, TypeScript, MongoDB and Tailwind CSS.",
  },
  {
    verb: "Assign",
    detail:
      "Room assignments are part of the mobile-first student hostel portal.",
  },
  {
    verb: "Resolve",
    detail:
      "Grievance ticketing gives students a portal for raising hostel issues.",
  },
] as const;

export function HostelField() {
  const [selected, setSelected] = useState(0);

  return (
    <section
      className="study-visual project-field hostel-field"
      aria-label="Korridor student hostel portal schematic"
      style={{ "--hostel-selected": selected } as CSSProperties}
    >
      <FieldLabel name="Korridor / Student hostel portal" />
      <div
        className="hostel-processes project-field-controls"
        role="group"
        aria-label="Inspect hostel portal processes"
      >
        {hostelProcesses.map((process, index) => (
          <button
            type="button"
            key={process.verb}
            aria-pressed={selected === index}
            onClick={() => setSelected(index)}
          >
            <span className="project-field-kicker project-visual-type">
              0{index + 1}
            </span>
            <span className="project-visual-type">{process.verb}</span>
          </button>
        ))}
      </div>
      <div className="hostel-composition">
        <div className="hostel-reading">
          <p className="hostel-index project-visual-type">0{selected + 1}</p>
          <p className="project-field-kicker project-visual-type">
            {hostelProcesses[selected].verb} / Selected process
          </p>
          <p
            className="project-field-context project-visual-type"
            aria-live="polite"
            aria-atomic="true"
          >
            {hostelProcesses[selected].detail}
          </p>
        </div>
        <div className="hostel-letter" aria-hidden="true">
          {[0, 1, 2].map((index) => (
            <span
              key={index}
              className={`hostel-plane hostel-plane--${index + 1} project-visual-type`}
              data-selected={selected === index}
              style={{ "--hostel-plane": index } as CSSProperties}
            >
              K
            </span>
          ))}
        </div>
      </div>
      <footer className="project-field-foot">
        <p className="project-visual-type">
          Next.js / TypeScript / MongoDB / Tailwind CSS
        </p>
        <p className="project-visual-type">
          Next.js server components / MongoDB indexing / Subsecond query
          performance (CV-reported)
        </p>
        <p className="project-visual-type">
          Portal interpretation / No onboarding, room assignment or grievance
          action is performed
        </p>
      </footer>
    </section>
  );
}
