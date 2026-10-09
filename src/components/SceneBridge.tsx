export default function SceneBridge({
  from,
  to,
  variant,
}: {
  from: string;
  to: string;
  variant: "signal" | "structure";
}) {
  return (
    <div
      className={`scene-bridge scene-bridge--${variant}`}
      data-scene={variant}
      data-context={`Transition / ${to}`}
      aria-hidden="true"
    >
      <div className="bridge-stage">
        <div className="bridge-before">
          <span>{from}</span>
        </div>
        <div className="bridge-after">
          <span>{to}</span>
        </div>
        <span className="bridge-direction">↘</span>
      </div>
    </div>
  );
}
