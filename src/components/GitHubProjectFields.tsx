"use client";

import { useState, type CSSProperties } from "react";
import VectorArrow from "./VectorArrow";

const schematicLabel = "Interactive Schematic / Architecture Simulator";

function playSwitchAcoustic(switchName: string) {
  if (typeof window === "undefined") return;
  try {
    const AudioContextClass =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext })
        .webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    if (ctx.state === "suspended") {
      void ctx.resume();
    }
    const now = ctx.currentTime;

    if (switchName === "NovelKeys Cream") {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(140, now);
      osc.frequency.exponentialRampToValueAtTime(45, now + 0.08);
      gain.gain.setValueAtTime(0.45, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.09);
    } else if (switchName === "Holy Panda") {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "triangle";
      osc.frequency.setValueAtTime(260, now);
      osc.frequency.exponentialRampToValueAtTime(75, now + 0.06);
      gain.gain.setValueAtTime(0.4, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.07);
    } else if (switchName === "IBM Model M") {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(880, now);
      osc.frequency.exponentialRampToValueAtTime(440, now + 0.11);
      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.11);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.12);
    } else {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "square";
      osc.frequency.setValueAtTime(1400, now);
      osc.frequency.exponentialRampToValueAtTime(600, now + 0.035);
      gain.gain.setValueAtTime(0.18, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.035);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.04);
    }
  } catch {
    // Graceful fallback if audio context is blocked
  }
}

function playMidiAcoustic(noteName: string, octave: number = 4) {
  if (typeof window === "undefined") return;
  try {
    const AudioContextClass =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext })
        .webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    if (ctx.state === "suspended") {
      void ctx.resume();
    }
    const noteFrequencies: Record<string, number> = {
      C: 261.63,
      D: 293.66,
      E: 329.63,
      F: 349.23,
      G: 392.0,
      A: 440.0,
      B: 493.88,
    };
    const baseFreq = noteFrequencies[noteName] || 440;
    const mult = Math.pow(2, octave - 4);
    const freq = baseFreq * mult;
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(freq, now);
    gain.gain.setValueAtTime(0.25, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.24);
  } catch {
    // Graceful fallback
  }
}

function FieldLabel({ name }: { name: string }) {
  return (
    <header className="project-field-label">
      <span className="project-visual-type">{name}</span>
      <span className="project-visual-type">{schematicLabel}</span>
    </header>
  );
}

// 01. KSAC Gatepass Pro Field
const ksacStates = [
  {
    code: "PENDING",
    label: "01 Pass Requested",
    detail:
      "Student submits in-time extension pass with legitimate society ID, event itinerary, and warden notification.",
    gate: "Hostel Outbound",
  },
  {
    code: "APPROVED",
    label: "02 Warden Approval",
    detail:
      "Hostel warden digitally verifies the request, stamping a cryptographic verification token into the record.",
    gate: "Hostel Outbound",
  },
  {
    code: "HOSTEL_EXIT",
    label: "03 Hostel Checkpoint",
    detail:
      "Hostel guard scans student QR pass. Checkpoint records exact exit timestamp and starts transit window countdown.",
    gate: "Hostel Outbound",
  },
  {
    code: "IN_KSAC",
    label: "04 In-Session at KSAC",
    detail:
      "KSAC desk authority validates arrival. Live society attendance registry confirms ongoing workshop or hackathon.",
    gate: "KSAC Inbound",
  },
  {
    code: "KSAC_EXIT",
    label: "05 KSAC Checkpoint Out",
    detail:
      "Session concludes. In-time extension slip timestamped with allowable curfew transit return deadline.",
    gate: "KSAC Inbound",
  },
  {
    code: "RETURNED",
    label: "06 Safe Hostel Return",
    detail:
      "Hostel guard scans return pass. System marks state machine complete and stores tamper-resistant transit audit log.",
    gate: "Hostel Outbound",
  },
] as const;

export function KSACGatepassField() {
  const [target, setTarget] = useState<"Hostel Outbound" | "KSAC Inbound">(
    "Hostel Outbound",
  );
  const [selected, setSelected] = useState(2); // HOSTEL_EXIT by default

  const current = ksacStates[selected];

  return (
    <section
      className="study-visual project-field ksac-gatepass-field"
      aria-label="KIIT KSAC GatePass Pro architecture schematic"
      style={
        {
          "--field-paper": "#bdc4aa",
          "--field-ink": "#242c20",
          "--field-accent": "#435939",
        } as CSSProperties
      }
    >
      <FieldLabel name="KSAC GatePass Pro / State Machine" />
      <div
        className="project-field-controls gatepass-targets"
        role="group"
        aria-label="Filter state machine by checkpoint location"
      >
        {(["Hostel Outbound", "KSAC Inbound"] as const).map((loc) => (
          <button
            type="button"
            key={loc}
            aria-pressed={target === loc}
            onClick={() => setTarget(loc)}
          >
            <span className="project-visual-type">{loc}</span>
          </button>
        ))}
      </div>

      <div className="ksac-status-stage">
        <p className="project-field-kicker project-visual-type">
          State Machine • Phase 0{selected + 1} of 06
        </p>
        <p className="ksac-code-display project-visual-type">
          {current.code}
        </p>
        <p className="project-field-kicker project-visual-type">
          Location: {current.gate} • RBAC Enforcement Active
        </p>
      </div>

      <div
        className="ksac-state-selector project-field-controls"
        role="group"
        aria-label="Inspect 6 transit state machine stages"
      >
        {ksacStates.map((st, index) => (
          <button
            type="button"
            key={st.code}
            aria-pressed={selected === index}
            onClick={() => setSelected(index)}
            className="ksac-state-btn"
          >
            <span className="project-field-kicker project-visual-type">
              0{index + 1}
            </span>
            <span className="project-visual-type">{st.code}</span>
          </button>
        ))}
      </div>

      <p
        className="project-field-context project-visual-type"
        aria-live="polite"
        aria-atomic="true"
      >
        {current.detail}
      </p>

      <footer className="project-field-foot">
        <p className="project-visual-type">
          Next.js 15 • TypeScript • MongoDB Mongoose • JWT httpOnly Cookie
        </p>
        <p className="project-visual-type">
          500 simulated concurrent users stress test • Tamper-proof digital transit log
        </p>
      </footer>
    </section>
  );
}

// 02. AI Review & Construction DPR System Field
const aiModules = [
  {
    name: "DPR Ingestion",
    tagline: "Async FastAPI & MinIO Upload",
    detail:
      "Site supervisors capture daily progress reports and equipment photos via offline Next.js PWA, streaming payloads into S3-compatible MinIO object store.",
    status: "HEALTHY",
  },
  {
    name: "Fuel Telemetry",
    tagline: "Logistics Reconciler",
    detail:
      "Celery background workers correlate heavy machinery run-hours with daily diesel tank dips, flagging variance anomalies exceeding 4.5%.",
    status: "RECONCILED",
  },
  {
    name: "Worker Roster",
    tagline: "Biometric Attendance Matcher",
    detail:
      "Cross-references gate facial-recognition scans against contractor daily manpower timesheets to eliminate duplicate or phantom labor billing.",
    status: "VALIDATED",
  },
  {
    name: "Anomaly Engine",
    tagline: "Automated Executive Briefs",
    detail:
      "Scheduled Celery Beat jobs compute statistical deviations across fuel, materials, and petty cash, dispatching automated audit briefs to management.",
    status: "ACTIVE MONITOR",
  },
] as const;

export function AIReviewField() {
  const [selected, setSelected] = useState(0);
  const [anomalyMode, setAnomalyMode] = useState<"Normal" | "Stress Simulation">("Normal");

  const mod = aiModules[selected];

  return (
    <section
      className="study-visual project-field ai-review-field"
      aria-label="AI Review & Construction DPR Pipeline schematic"
      style={
        {
          "--field-paper": "#ca6149",
          "--field-ink": "#27120a",
          "--field-accent": "#ffd4c7",
        } as CSSProperties
      }
    >
      <FieldLabel name="AI Review & Construction DPR / Operational Pipeline" />
      <div
        className="project-field-controls gatepass-targets"
        role="group"
        aria-label="Toggle telemetry mode"
      >
        {(["Normal", "Stress Simulation"] as const).map((m) => (
          <button
            type="button"
            key={m}
            aria-pressed={anomalyMode === m}
            onClick={() => setAnomalyMode(m)}
          >
            <span className="project-visual-type">{m} Telemetry</span>
          </button>
        ))}
      </div>

      <div className="ai-pipeline-visual">
        <p className="project-field-kicker project-visual-type">
          Pipeline Station 0{selected + 1} / 04 • {mod.tagline}
        </p>
        <h3 className="ai-module-title project-visual-type">{mod.name}</h3>
        <div className="ai-telemetry-badge project-visual-type">
          Status: {anomalyMode === "Stress Simulation" ? "VARIANCE DETECTED (Δ +12.4%)" : mod.status}
        </div>
      </div>

      <div
        className="gatepass-route project-field-controls"
        role="group"
        aria-label="Inspect pipeline architecture modules"
      >
        {aiModules.map((item, index) => (
          <button
            type="button"
            key={item.name}
            aria-pressed={selected === index}
            onClick={() => setSelected(index)}
          >
            <span className="project-field-kicker project-visual-type">
              0{index + 1}
            </span>
            <span className="project-visual-type">{item.name}</span>
          </button>
        ))}
      </div>

      <p
        className="project-field-context project-visual-type"
        aria-live="polite"
        aria-atomic="true"
      >
        {mod.detail}
      </p>

      <footer className="project-field-foot">
        <p className="project-visual-type">
          FastAPI • Async SQLAlchemy • Celery • Redis • Docker Compose • MinIO
        </p>
        <p className="project-visual-type">
          Asynchronous task queue • Automated executive anomaly briefing
        </p>
      </footer>
    </section>
  );
}

// 03. Gesture-MIDI Controller Field
const gestureModes = [
  {
    name: "Index Pinch",
    target: "Root Note (Tonic)",
    octave: "Octave 4 (C4)",
    detail:
      "Thumb-to-index pinch detected with 3-frame debouncing. Triggers fundamental lead voice with zero accidental double-strikes.",
  },
  {
    name: "Middle Pinch",
    target: "Third Note (Modal 3rd)",
    octave: "Octave 4 (E4)",
    detail:
      "Thumb-to-middle pinch triggers harmonized third based on selected musical scale quantization.",
  },
  {
    name: "Ring Pinch",
    target: "Fifth Note (Dominant 5th)",
    octave: "Octave 5 (G5)",
    detail:
      "Thumb-to-ring pinch generates fifth interval. Combined with middle pinch in Chord Mode for full triads.",
  },
  {
    name: "Pinky Pinch",
    target: "Seventh Note (Leading 7th)",
    octave: "Octave 5 (B5)",
    detail:
      "Thumb-to-pinky pinch triggers seventh interval or jazz extension voicings.",
  },
] as const;

export function GestureMidiField() {
  const [hand, setHand] = useState<"Left: Bass (Oct 2-3)" | "Right: Lead (Oct 4-5)">(
    "Right: Lead (Oct 4-5)",
  );
  const [selected, setSelected] = useState(0);
  const [scale, setScale] = useState<"Minor Pentatonic" | "Dorian Mode" | "Harmonic Minor">(
    "Minor Pentatonic",
  );

  const current = gestureModes[selected];

  return (
    <section
      className="study-visual project-field gesture-midi-field"
      aria-label="Gesture-MIDI vision instrument schematic"
      style={
        {
          "--field-paper": "#2c3b4a",
          "--field-ink": "#e8eff5",
          "--field-accent": "#5fa8d3",
        } as CSSProperties
      }
    >
      <FieldLabel name="Gesture-MIDI / Spatial Computer Vision Rig" />
      <div
        className="project-field-controls gatepass-targets"
        role="group"
        aria-label="Select hand performance assignment"
      >
        {(["Left: Bass (Oct 2-3)", "Right: Lead (Oct 4-5)"] as const).map((h) => (
          <button
            type="button"
            key={h}
            aria-pressed={hand === h}
            onClick={() => setHand(h)}
          >
            <span className="project-visual-type">{h}</span>
          </button>
        ))}
      </div>

      <div className="gesture-stage-visual">
        <p className="project-field-kicker project-visual-type">
          Scale: {scale} • Hand Assignment: {hand}
        </p>
        <h3 className="gesture-trigger-display project-visual-type">
          {current.target}
        </h3>
        <div className="gesture-keys-visual" role="group" aria-label="Virtual piano keys">
          {["C", "D", "E", "F", "G", "A", "B"].map((note, idx) => (
            <button
              type="button"
              key={note}
              className={`virtual-key ${idx === selected * 2 ? "virtual-key--active" : ""}`}
              onClick={() =>
                playMidiAcoustic(note, hand.includes("Left") ? 3 : 5)
              }
              aria-label={`Play note ${note}`}
            >
              {note}
            </button>
          ))}
        </div>
      </div>

      <div
        className="gatepass-route project-field-controls"
        role="group"
        aria-label="Inspect finger pinch triggers"
      >
        {gestureModes.map((item, index) => (
          <button
            type="button"
            key={item.name}
            aria-pressed={selected === index}
            onClick={() => {
              setSelected(index);
              const note = (["C", "E", "G", "B"] as const)[index] || "C";
              playMidiAcoustic(note, hand.includes("Left") ? 3 : 5);
            }}
          >
            <span className="project-field-kicker project-visual-type">
              0{index + 1}
            </span>
            <span className="project-visual-type">{item.name}</span>
          </button>
        ))}
      </div>

      <p
        className="project-field-context project-visual-type"
        aria-live="polite"
        aria-atomic="true"
      >
        {current.detail}
      </p>

      <footer className="project-field-foot">
        <p className="project-visual-type">
          Python 3.11 • MediaPipe Tasks HandLandmarker • OpenCV • Mido • Virtual MIDI Port
        </p>
        <p className="project-visual-type">
          21 3D hand landmarks • Continuous CC 7 volume & wrist pitch bend • Sub-15ms latency
        </p>
      </footer>
    </section>
  );
}

// 04. KLICK Mechanical Switch Simulator Field
const klickSwitches = [
  {
    name: "NovelKeys Cream",
    type: "POM Housing Linear",
    sound: "Deep Signature Thock",
    profile: "Linear 55g actuation with velvety POM bottom-out resonance.",
  },
  {
    name: "Holy Panda",
    type: "Tactile PE Foam Mod",
    sound: "Cavernous Wooden Marble Thock",
    profile: "Pronounced rounded tactile bump with explosive wooden clack.",
  },
  {
    name: "IBM Model M",
    type: "Buckling Spring",
    sound: "Metallic Musical Resonance",
    profile: "Coiled spring buckle mechanism creating legendary vintage acoustic ping.",
  },
  {
    name: "Cherry MX Blue",
    type: "Click Leaf Tactile",
    sound: "Sharp Acoustic Reset Snap",
    profile: "Crisp click-jacket snap with sharp tactile release acoustics.",
  },
] as const;

export function KlickField() {
  const [selectedSwitch, setSelectedSwitch] = useState(0);
  const [testCount, setTestCount] = useState(1);
  const current = klickSwitches[selectedSwitch];

  return (
    <section
      className="study-visual project-field klick-field"
      aria-label="KLICK mechanical switch audio schematic"
      style={
        {
          "--field-paper": "#38312c",
          "--field-ink": "#f4ede8",
          "--field-accent": "#d4a373",
        } as CSSProperties
      }
    >
      <FieldLabel name="KLICK / Low-Latency Mechanical Switch Acoustics" />
      <div
        className="project-field-controls gatepass-targets"
        role="group"
        aria-label="Inspect switch acoustics"
      >
        {klickSwitches.map((sw, index) => (
          <button
            type="button"
            key={sw.name}
            aria-pressed={selectedSwitch === index}
            onClick={() => {
              setSelectedSwitch(index);
              playSwitchAcoustic(sw.name);
            }}
          >
            <span className="project-visual-type">{sw.name}</span>
          </button>
        ))}
      </div>

      <div className="klick-acoustic-visual">
        <p className="project-field-kicker project-visual-type">
          Switch: {current.name} • {current.type}
        </p>
        <h3 className="klick-sound-text project-visual-type">
          {current.sound}
        </h3>
        <div className="klick-interactive-bar">
          <button
            type="button"
            className="klick-tap-btn project-visual-type"
            onClick={() => {
              setTestCount((c) => c + 1);
              playSwitchAcoustic(current.name);
            }}
          >
            Simulate Key Strike [Spacebar] (Count: {testCount}){" "}
            <VectorArrow direction="return" />
          </button>
          <span className="project-field-kicker project-visual-type">
            Stereo Pan: Center (Col 6) • Latency: 7.2ms
          </span>
        </div>
      </div>

      <div className="klick-features-row">
        <div className="klick-spec-item">
          <span className="project-field-kicker project-visual-type">Spatial 3D</span>
          <span className="project-visual-type">Q/A/Z Left • Space Center • P/Enter Right</span>
        </div>
        <div className="klick-spec-item">
          <span className="project-field-kicker project-visual-type">Bi-Directional</span>
          <span className="project-visual-type">Bottom-out Downstroke + Release Upstroke</span>
        </div>
        <div className="klick-spec-item">
          <span className="project-field-kicker project-visual-type">Humanizer</span>
          <span className="project-visual-type">±1.5% micro-pitch jitter + ±4% gain variance</span>
        </div>
      </div>

      <p
        className="project-field-context project-visual-type"
        aria-live="polite"
        aria-atomic="true"
      >
        {current.profile}
      </p>

      <footer className="project-field-foot">
        <p className="project-visual-type">
          Python • Windows Low-Level Hook API • PyAudio • NumPy DSP
        </p>
        <p className="project-visual-type">
          Sub-10ms hardware audio latency • 256-sample buffer size • 10 switch profiles
        </p>
      </footer>
    </section>
  );
}

// 05. Online Kafe Canteen Platform Field
const kafeLayers = [
  {
    name: "Customer Cart",
    tech: "React 19 / Redux Persist",
    detail:
      "Real-time cart state with optimistic UI updates and instant checkout payload validation using Zod.",
  },
  {
    name: "Order Lifecycle",
    tech: "State Queue: Pending / Prep / Ready",
    detail:
      "Kitchen Kanban board receives incoming orders in real time, alerting staff and student dashboards synchronously.",
  },
  {
    name: "Admin Control",
    tech: "Executive Inventory Dashboard",
    detail:
      "Canteen managers toggle dish availability instantly and inspect rush-hour revenue trends.",
  },
] as const;

export function OnlineKafeField() {
  const [selected, setSelected] = useState(1);
  const [orderStage, setOrderStage] = useState<"PENDING" | "PREPARING" | "READY FOR PICKUP">(
    "PREPARING",
  );

  const layer = kafeLayers[selected];

  const advanceStage = () => {
    if (orderStage === "PENDING") setOrderStage("PREPARING");
    else if (orderStage === "PREPARING") setOrderStage("READY FOR PICKUP");
    else setOrderStage("PENDING");
  };

  return (
    <section
      className="study-visual project-field online-kafe-field"
      aria-label="Online Kafe canteen ordering schematic"
      style={
        {
          "--field-paper": "#d8c4a4",
          "--field-ink": "#2c2217",
          "--field-accent": "#b0733a",
        } as CSSProperties
      }
    >
      <FieldLabel name="Online Kafe / Canteen Fulfillment Engine" />
      <div
        className="project-field-controls gatepass-targets"
        role="group"
        aria-label="Order lifecycle stages"
      >
        <button type="button" onClick={advanceStage}>
          <span className="project-visual-type">
            Live Ticket #{1042}: {orderStage} (Click to Advance){" "}
            <VectorArrow direction="up-right" />
          </span>
        </button>
      </div>

      <div className="kafe-display-stage">
        <p className="project-field-kicker project-visual-type">
          Architecture Layer 0{selected + 1} • {layer.tech}
        </p>
        <h3 className="kafe-layer-title project-visual-type">{layer.name}</h3>
        <p className="project-field-kicker project-visual-type">
          Next.js 16 App Router • MongoDB via Mongoose • JWT RBAC
        </p>
      </div>

      <div
        className="gatepass-route project-field-controls"
        role="group"
        aria-label="Inspect canteen architecture layers"
      >
        {kafeLayers.map((l, index) => (
          <button
            type="button"
            key={l.name}
            aria-pressed={selected === index}
            onClick={() => setSelected(index)}
          >
            <span className="project-field-kicker project-visual-type">
              0{index + 1}
            </span>
            <span className="project-visual-type">{l.name}</span>
          </button>
        ))}
      </div>

      <p
        className="project-field-context project-visual-type"
        aria-live="polite"
        aria-atomic="true"
      >
        {layer.detail}
      </p>

      <footer className="project-field-foot">
        <p className="project-visual-type">
          Next.js 16 • React 19 • MongoDB • Redux Toolkit • Zod • Bcrypt
        </p>
        <p className="project-visual-type">
          Sub-50ms cart reconciliation • Real-time order state transition queue
        </p>
      </footer>
    </section>
  );
}

// 06. Korridor Student Housing Portal Field
const korridorSteps = [
  {
    name: "Onboarding",
    detail:
      "Paperless resident profile creation with student ID verification, room preferences, and digital rulebook acceptance.",
  },
  {
    name: "Room Allocation",
    detail:
      "Automated hostel block and room allocation algorithm minimizing overcrowding and grouping residents by cohort.",
  },
  {
    name: "Grievance Dispatch",
    detail:
      "Categorized maintenance ticketing system with warden status escalation tracking and resolution timestamps.",
  },
] as const;

export function KorridorField() {
  const [selected, setSelected] = useState(0);

  return (
    <section
      className="study-visual project-field korridor-field"
      aria-label="Korridor student hostel operations schematic"
      style={
        {
          "--field-paper": "#2f3833",
          "--field-ink": "#e2ede6",
          "--field-accent": "#76a287",
        } as CSSProperties
      }
    >
      <FieldLabel name="Korridor / Student Hostel Operations" />
      <div
        className="gatepass-route project-field-controls"
        role="group"
        aria-label="Inspect hostel operations workflows"
      >
        {korridorSteps.map((s, index) => (
          <button
            type="button"
            key={s.name}
            aria-pressed={selected === index}
            onClick={() => setSelected(index)}
          >
            <span className="project-field-kicker project-visual-type">
              0{index + 1}
            </span>
            <span className="project-visual-type">{s.name}</span>
          </button>
        ))}
      </div>

      <div className="hostel-composition">
        <div className="hostel-reading">
          <p className="hostel-index project-visual-type">0{selected + 1}</p>
          <p className="project-field-kicker project-visual-type">
            {korridorSteps[selected].name} / Selected Process
          </p>
          <p
            className="project-field-context project-visual-type"
            aria-live="polite"
            aria-atomic="true"
          >
            {korridorSteps[selected].detail}
          </p>
        </div>
        <div className="hostel-letter" aria-hidden="true">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className={`hostel-plane hostel-plane--${i + 1} project-visual-type`}
              data-selected={selected === i}
              style={{ "--hostel-plane": i } as CSSProperties}
            >
              K
            </span>
          ))}
        </div>
      </div>

      <footer className="project-field-foot">
        <p className="project-visual-type">
          Next.js Server Components • TypeScript • MongoDB Indexing • Tailwind CSS
        </p>
        <p className="project-visual-type">
          Subsecond indexed query speed • Mobile-first student housing portal
        </p>
      </footer>
    </section>
  );
}

// 07. Smory Memory Network Field
const smoryCapsules = [
  {
    name: "Timeline Feed",
    detail:
      "Visual chronological life storytelling cards organized along interactive memory timelines with rich image caching.",
  },
  {
    name: "Tag Matrix",
    detail:
      "Semantic grouping of milestones, travel journals, and campus events across shared participant circles.",
  },
  {
    name: "Privacy Vault",
    detail:
      "Granular permission controls between public memory sharing and encrypted private diary logs.",
  },
] as const;

export function SmoryField() {
  const [selected, setSelected] = useState(0);

  return (
    <section
      className="study-visual project-field smory-field"
      aria-label="Smory digital memory capsule schematic"
      style={
        {
          "--field-paper": "#c3b1be",
          "--field-ink": "#2c1c27",
          "--field-accent": "#8b5278",
        } as CSSProperties
      }
    >
      <FieldLabel name="Smory / Social Memory Capsule Engine" />
      <div
        className="gatepass-route project-field-controls"
        role="group"
        aria-label="Inspect memory capsule features"
      >
        {smoryCapsules.map((c, index) => (
          <button
            type="button"
            key={c.name}
            aria-pressed={selected === index}
            onClick={() => setSelected(index)}
          >
            <span className="project-field-kicker project-visual-type">
              0{index + 1}
            </span>
            <span className="project-visual-type">{c.name}</span>
          </button>
        ))}
      </div>

      <div className="smory-capsule-visual">
        <p className="project-field-kicker project-visual-type">
          Active Capsule Mode: {smoryCapsules[selected].name}
        </p>
        <h3 className="smory-capsule-heading project-visual-type">
          Memory #{248} • Chronological Reel
        </h3>
        <p
          className="project-field-context project-visual-type"
          aria-live="polite"
          aria-atomic="true"
        >
          {smoryCapsules[selected].detail}
        </p>
      </div>

      <footer className="project-field-foot">
        <p className="project-visual-type">
          Next.js App Router • TypeScript • Tailwind CSS • Vercel Edge
        </p>
        <p className="project-visual-type">
          Zero-layout-shift responsive media handling • Social memory platform
        </p>
      </footer>
    </section>
  );
}

// 08. Offline-First Expense Tracker Field
const expenseCategories = [
  { name: "Academic & Tech", pct: 36, amount: "₹4,200" },
  { name: "Campus Dining", pct: 32, amount: "₹3,800" },
  { name: "Hostel Living", pct: 20, amount: "₹2,400" },
  { name: "Transit & Travel", pct: 12, amount: "₹1,400" },
] as const;

export function ExpenseTrackerField() {
  const [selectedCat, setSelectedCat] = useState(0);

  return (
    <section
      className="study-visual project-field expense-tracker-field"
      aria-label="Offline-First PWA Expense Tracker schematic"
      style={
        {
          "--field-paper": "#aebdc0",
          "--field-ink": "#1b282b",
          "--field-accent": "#437078",
        } as CSSProperties
      }
    >
      <FieldLabel name="Expense Tracker / Offline-First PWA Ledger" />
      <div
        className="gatepass-targets project-field-controls"
        role="group"
        aria-label="Inspect spending breakdown"
      >
        {expenseCategories.map((cat, index) => (
          <button
            type="button"
            key={cat.name}
            aria-pressed={selectedCat === index}
            onClick={() => setSelectedCat(index)}
          >
            <span className="project-visual-type">
              {cat.name} ({cat.pct}%)
            </span>
          </button>
        ))}
      </div>

      <div className="expense-meter-visual">
        <p className="project-field-kicker project-visual-type">
          Category Allocation: {expenseCategories[selectedCat].name}
        </p>
        <h3 className="expense-total-display project-visual-type">
          {expenseCategories[selectedCat].amount}
        </h3>
        <div className="expense-progress-bar" aria-hidden="true">
          <div
            className="expense-progress-fill"
            style={{ width: `${expenseCategories[selectedCat].pct}%` }}
          />
        </div>
      </div>

      <p
        className="project-field-context project-visual-type"
        aria-live="polite"
        aria-atomic="true"
      >
        Transactions persist locally in under 5ms via Service Worker caching and IndexedDB,
        functioning completely offline with zero server roundtrips.
      </p>

      <footer className="project-field-foot">
        <p className="project-visual-type">
          JavaScript ES6+ • PWA Service Workers • IndexedDB • CSS3 Flexbox
        </p>
        <p className="project-visual-type">
          100% offline functionality • Zero external framework overhead
        </p>
      </footer>
    </section>
  );
}

// 09. Netflix & Streaming Data Science Field
const dataPipelines = [
  {
    name: "Imputation & Cleansing",
    metric: "8,807 Rows Sanitized",
    detail:
      "Handled null director and casting arrays, parsed release dates into ISO datetime stamps, and partitioned durations into minutes and seasons.",
  },
  {
    name: "Content Archetyping",
    metric: "69.6% Movies / 30.4% TV",
    detail:
      "Calculated feature film vs multi-season TV catalog distribution, tracking international production acceleration post-2016.",
  },
  {
    name: "Clustering & Heatmaps",
    metric: "Country-Genre Correlation",
    detail:
      "Built Seaborn correlation heatmaps identifying regional storytelling preferences across United States, India, and United Kingdom productions.",
  },
] as const;

export function DataAnalysisField() {
  const [selected, setSelected] = useState(0);

  return (
    <section
      className="study-visual project-field data-analysis-field"
      aria-label="Netflix dataset exploratory analysis schematic"
      style={
        {
          "--field-paper": "#3b2b2b",
          "--field-ink": "#f7eded",
          "--field-accent": "#e50914",
        } as CSSProperties
      }
    >
      <FieldLabel name="Streaming Data Science / Exploratory Pipeline" />
      <div
        className="gatepass-route project-field-controls"
        role="group"
        aria-label="Inspect data analysis pipeline"
      >
        {dataPipelines.map((dp, index) => (
          <button
            type="button"
            key={dp.name}
            aria-pressed={selected === index}
            onClick={() => setSelected(index)}
          >
            <span className="project-field-kicker project-visual-type">
              0{index + 1}
            </span>
            <span className="project-visual-type">{dp.name}</span>
          </button>
        ))}
      </div>

      <div className="data-stats-visual">
        <p className="project-field-kicker project-visual-type">
          Pipeline Step 0{selected + 1} • {dataPipelines[selected].name}
        </p>
        <h3 className="data-metric-text project-visual-type">
          {dataPipelines[selected].metric}
        </h3>
        <div className="data-chart-preview" aria-hidden="true">
          <div className="data-bar" style={{ height: "70%" }} />
          <div className="data-bar" style={{ height: "95%" }} />
          <div className="data-bar" style={{ height: "45%" }} />
          <div className="data-bar" style={{ height: "80%" }} />
          <div className="data-bar" style={{ height: "60%" }} />
        </div>
      </div>

      <p
        className="project-field-context project-visual-type"
        aria-live="polite"
        aria-atomic="true"
      >
        {dataPipelines[selected].detail}
      </p>

      <footer className="project-field-foot">
        <p className="project-visual-type">
          Python 3 • Pandas • NumPy • Matplotlib • Seaborn • Jupyter Notebook
        </p>
        <p className="project-visual-type">
          Exploratory statistical modeling • Vectorized Pandas transformations
        </p>
      </footer>
    </section>
  );
}

export const githubFieldComponents: Record<string, React.ComponentType> = {
  "ksac-gatepass": KSACGatepassField,
  "ai-review": AIReviewField,
  "gesture-midi": GestureMidiField,
  klick: KlickField,
  "online-kafe": OnlineKafeField,
  korridor: KorridorField,
  smory: SmoryField,
  "expense-tracker": ExpenseTrackerField,
  "netflix-analysis": DataAnalysisField,
};
