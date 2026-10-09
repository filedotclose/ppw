import Link from "next/link";
export default function NotFound() {
  return (
    <main className="not-found">
      <span className="eyebrow">Sujal Agarwal / 404</span>
      <h1>
        Out of
        <br />
        view<span className="accent">.</span>
      </h1>
      <p>That page isn’t here.</p>
      <Link href="/" className="text-action">
        Return to the beginning <span aria-hidden="true">↗</span>
      </Link>
    </main>
  );
}
