import type { Config } from "@react-router/dev/config";

export default {
  // Config options...
  // Server-side render by default, to enable SPA mode set this to `false`
  future: {
    unstable_middleware: true
  },
  ssr: true, // Enabled for Node.js server deployment
} satisfies Config;
