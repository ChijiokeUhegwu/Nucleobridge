# docs/spa-rationale.md

**Why instant form switching matters:**
Instant form switching preserves user momentum during the most critical phase of acquisition: authentication. By conditionally rendering forms on the client side, we eliminate network latency and visual jarring. The user stays in a continuous, frictionless flow, which directly prevents cognitive fatigue and reduces drop-off rates.

**What the user experience was before:**
Previously, transitioning between "Sign Up", "Login", and "Password Reset" required a full server round-trip. The browser had to request a new HTML document, wait for the Next.js server to respond, and completely repaint the screen. This resulted in a sluggish, disconnected experience characterized by brief flashes of blank screens between navigations and unnecessary network overhead.

**When separate pages would be the better choice:**
Single-page architecture is not universally optimal. Separate pages are the better choice when the routes require entirely different SEO strategies, structural layouts, or marketing intent. For example, a `/signup` page often requires heavy marketing copy, social proof components, and specific Open Graph tags tailored for acquisition campaigns. Conversely, a `/login` page should be a minimalist, distraction-free utility screen. Forcing distinct marketing and utility contexts into a single unified layout heavily complicates the code and dilutes search engine indexability.