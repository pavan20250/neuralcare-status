import type { Metadata } from "next";
import { JetBrains_Mono, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { publicEnv } from "@/lib/env";

const sans = Plus_Jakarta_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

const mono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://status.neuralcare-ai.com"),
  title: {
    default: `${publicEnv.appName()} · Status`,
    template: `%s · ${publicEnv.appName()} Status`,
  },
  description:
    "Real-time operational status, latency, and deployment health for NeuralCare AI.",
  applicationName: publicEnv.appName(),
  openGraph: {
    type: "website",
    url: "https://status.neuralcare-ai.com",
    title: `${publicEnv.appName()} · Status`,
    description:
      "Real-time operational status, latency, and deployment health for NeuralCare AI.",
    siteName: publicEnv.appName(),
  },
  twitter: {
    card: "summary_large_image",
    title: `${publicEnv.appName()} · Status`,
    description:
      "Real-time operational status, latency, and deployment health for NeuralCare AI.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${sans.variable} ${mono.variable} min-h-screen bg-background font-sans text-foreground antialiased`}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
