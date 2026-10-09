"use client";
import { useMemo, useState } from "react";

type Rule = "Uppercase" | "Words" | "Reverse";
const rules: Rule[] = ["Uppercase", "Words", "Reverse"];
export default function SignalField() {
  const [input, setInput] = useState("A thought becomes a structure.");
  const [rule, setRule] = useState<Rule>("Words");
  const result = useMemo(() => {
    if (rule === "Uppercase") return input.toLocaleUpperCase();
    if (rule === "Reverse") return Array.from(input).reverse().join("");
    return input.trim().split(/\s+/u).filter(Boolean);
  }, [input, rule]);
  return (
    <div className="study-visual signal-field">
      <div className="signal-field-label">
        <span>Live text experiment</span>
        <span>Processed in your browser</span>
      </div>
      <div className="signal-composition">
        <div className="signal-source" aria-hidden="true">
          <span>in</span>
          <span>
            out<span className="signal-stop">.</span>
          </span>
        </div>
        <div className="signal-result">
          <span className="eyebrow">Result / {rule}</span>
          <div
            id="signal-output"
            className={
              Array.isArray(result) ? "signal-tokens" : "signal-string"
            }
            aria-live="polite"
            aria-atomic="true"
          >
            {Array.isArray(result)
              ? result.map((word, index) => (
                  <span
                    key={`${index}-${word}`}
                    style={{ "--token": index } as React.CSSProperties}
                  >
                    {word}
                  </span>
                ))
              : result || (
                  <span className="signal-empty">Your words appear here.</span>
                )}
          </div>
        </div>
      </div>
      <div className="signal-controls">
        <div className="signal-input-wrap">
          <label htmlFor="signal-input">Change the input</label>
          <input
            id="signal-input"
            value={input}
            maxLength={100}
            onChange={(event) => setInput(event.target.value)}
            autoComplete="off"
            spellCheck={false}
          />
        </div>
        <div
          className="signal-rules"
          role="group"
          aria-label="Transformation rule"
        >
          {rules.map((option) => (
            <button
              key={option}
              aria-pressed={rule === option}
              onClick={() => setRule(option)}
            >
              {option}
              <span aria-hidden="true">{rule === option ? "↗" : "+"}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
