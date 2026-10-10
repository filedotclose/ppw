"use client";

export default function ScrollFeatures() {
  const scrollToTop = () => {
    const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
    document.dispatchEvent(
      new CustomEvent("portfolio:scroll", {
        detail: { top: 0, immediate: reduced },
      }),
    );
  };

  return (
    <>
      <div className="scroll-progress-bar" aria-hidden="true" />
      <button
        type="button"
        className="back-to-top"
        aria-label="Scroll back to top"
        onClick={scrollToTop}
        data-cursor="TOP"
      >
        <span className="back-to-top-arrow" aria-hidden="true">
          ↑
        </span>
        <span className="back-to-top-label">TOP</span>
      </button>
    </>
  );
}
