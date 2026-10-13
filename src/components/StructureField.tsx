"use client";
import { useState } from "react";
import VectorArrow from "./VectorArrow";

const layers = [
  {
    name: "Interface",
    number: "01",
    description:
      "The document carries the content. Semantic HTML, typed React components, and a responsive visual system.",
    label: "Next.js / React / TypeScript",
    className: "interface",
  },
  {
    name: "Motion",
    number: "02",
    description:
      "Each scene owns its choreography. ScrollTrigger and Lenis share a single animation clock.",
    label: "GSAP / ScrollTrigger / Lenis",
    className: "motion",
  },
  {
    name: "Rendering",
    number: "03",
    description:
      "The optical artifact lives on an independent canvas. Frames are requested only when its state changes.",
    label: "Three.js / GLSL / WebGL",
    className: "rendering",
  },
];
export default function StructureField() {
  const [separation, setSeparation] = useState(45);
  const [selected, setSelected] = useState(0);
  return (
    <div
      className="study-visual structure-field"
      style={{ "--separation": separation / 100 } as React.CSSProperties}
    >
      <div className="structure-label">
        <span>Architecture of this website</span>
        <span>Abstract spatial interpretation</span>
      </div>
      <div className="structure-composition">
        <div
          className="layer-stack"
          role="group"
          aria-label="Inspect website layers"
        >
          {layers.map((layer, index) => (
            <button
              key={layer.name}
              className={`system-plane system-plane--${layer.className}`}
              style={{ "--layer": index } as React.CSSProperties}
              aria-pressed={selected === index}
              onClick={() => setSelected(index)}
              aria-label={`Inspect ${layer.name.toLowerCase()} layer`}
              data-cursor="VIEW"
            >
              <span className="plane-number">{layer.number}</span>
              <span className="plane-title">{layer.name}</span>
              <span className="plane-foot">
                {layer.label}
                <VectorArrow direction="up-right" />
              </span>
            </button>
          ))}
        </div>
        <div className="layer-description">
          <div
            className="layer-selector"
            role="group"
            aria-label="Select a layer"
          >
            {layers.map((layer, index) => (
              <button
                key={layer.name}
                aria-pressed={selected === index}
                onClick={() => setSelected(index)}
              >
                {layer.number} / {layer.name}
              </button>
            ))}
          </div>
          <p aria-live="polite">{layers[selected].description}</p>
        </div>
      </div>
      <div className="separation-control">
        <label htmlFor="separation">Separate the layers</label>
        <input
          id="separation"
          type="range"
          min="0"
          max="100"
          value={separation}
          onChange={(event) => setSeparation(Number(event.target.value))}
          aria-valuetext={`${separation} percent separated`}
        />
        <VectorArrow direction="left-right" />
      </div>
    </div>
  );
}
