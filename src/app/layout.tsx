import type { Metadata, Viewport } from "next";
import "@fontsource-variable/manrope";
import "./globals.css";
import { identity } from "@/data/portfolio";

export const metadata: Metadata = {
  metadataBase: new URL(identity.canonicalUrl || "http://localhost:3000"),
  ...(identity.canonicalUrl ? { alternates: { canonical: "/" } } : {}),
  title: "Sujal Agarwal — Full-stack, AI & automation",
  description:
    "Sujal Agarwal’s portfolio: full-stack campus products, AI workflow automation, Government of Sikkim experience, and computer science at KIIT.",
  openGraph: {
    title: "Sujal Agarwal",
    description:
      "Full-stack development, AI automation, and secure systems. Selected projects and experience from Sujal Agarwal.",
    type: "website",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "Sujal Agarwal — Full-stack, AI & automation",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Sujal Agarwal",
    images: ["/opengraph-image"],
  },
};
export const viewport: Viewport = {
  themeColor: "#e9e5dc",
  width: "device-width",
  initialScale: 1,
};
export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
