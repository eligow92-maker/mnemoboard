import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV !== "production";

// Aplikacja nie ładuje niczego spoza własnego serwera. Skrypty i style wstawiane w treść strony
// są dozwolone, bo Next.js i React Flow ich wymagają; tryb dev potrzebuje dodatkowo `eval`
// i połączenia WebSocket do odświeżania modułów.
const CONTENT_SECURITY_POLICY = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob:",
  "font-src 'self'",
  `connect-src 'self'${isDev ? " ws: wss:" : ""}`,
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
].join("; ");

const SECURITY_HEADERS = [
  { key: "Content-Security-Policy", value: CONTENT_SECURITY_POLICY },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "no-referrer" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
];

const nextConfig: NextConfig = {
  output: "standalone",
  // Znacznik trybu dev zasłaniał pasek narzędzi planszy na telefonie.
  devIndicators: false,
  poweredByHeader: false,
  async headers() {
    // Każda odpowiedź: strony, API, pliki statyczne i błędy 404.
    return [{ source: "/:path*", headers: SECURITY_HEADERS }];
  },
};

export default nextConfig;
