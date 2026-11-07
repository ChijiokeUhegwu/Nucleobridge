# docs/security-controls.md

# Deferred Security Controls: Analysis and Rationale

At this stage of NucleoBridge (Milestone 1, pre-launch prototype for early learner feedback), building a resilient authentication perimeter requires balancing technical security with development velocity, user onboarding friction, and hardware constraints. 

Below are four security controls that were evaluated during the design of Task 04 and deliberately **not implemented** at this stage. For each control, this document details what it is, why it was deemed not worth the cost or complexity for our business right now, and the exact technical or commercial triggers required to adopt it.

---

## 1. Multi-Factor Authentication (MFA / 2FA via TOTP or WebAuthn)

### What It Is
Multi-factor authentication requires learners to present two or more independent credentials before gaining access to an account. In practice, this means requiring a time-based one-time password (TOTP via RFC 6238, such as Google Authenticator) or a WebAuthn/FIDO2 hardware passkey in addition to the learner's password during sign-in.

### Why It Was Not Worth It at This Stage
1. **Severe Onboarding Drop-Off for Self-Directed Learners:** NucleoBridge serves learners on low-resource hardware who are trying to practice bioinformatics workflows with minimal friction. Forcing mandatory or even optional TOTP setup introduces significant cognitive load, requiring QR code scanning, authenticator app downloads, and recovery key management.
2. **Low Asset Value in Milestone 1:** NucleoBridge does not process or store sensitive patient health records, banking information, or confidential proprietary research. The highest value asset on an account is the learner's progress map and potential future PRO entitlement.
3. **Existing Alternate Flow Already Provides Out-of-Band Verification:** We already support an OTP sign-in path where a 6-digit code is delivered directly to the learner's email. Requiring an additional authenticator app would create redundant complexity without measurable benefit.

### What Would Have to Change to Add It
* **Institutional / B2B Licensing:** When NucleoBridge sells team or classroom licenses to universities, research institutes, or enterprise biotech labs that mandate MFA compliance for student single sign-on (SSO).
* **High-Stakes Credentials or Certifications:** If NucleoBridge introduces verified certificates of completion or accredited exams where identity verification and anti-account-sharing are legally or academically required.
* **Learner Demand:** When self-service security settings are added in an account settings screen, TOTP can be introduced as an opt-in toggle rather than a mandatory gate.

---

## 2. Distributed Persistent Rate Limiting (Redis / Upstash Sliding Window)

### What It Is
A distributed rate-limiting architecture that persists request counters, timestamps, and lockout states in an external, high-speed, in-memory datastore (such as Redis or Upstash). It tracks sliding windows across multiple server instances and keys across composite fingerprints (IP address, targeted email, user-agent, and TLS characteristics).

### Why It Was Not Worth It at This Stage
1. **Infrastructure and Operational Overhead:** Setting up and managing a Redis cluster or paying for a third-party serverless Redis provider introduces ongoing costs, extra environment variables, and network latency on every API boundary. In Milestone 1, our Next.js application runs as a single server instance in local and staging environments, where an in-process JavaScript `Map` operates in microseconds with zero configuration.
2. **Network Dependency on the Critical Path:** Querying a remote cache for every incoming HTTP request creates a single point of failure. If the cache provider experiences downtime or network jitter, authentication endpoints fail open (defeating security) or fail closed (locking out legitimate learners).
3. **Premature Optimization for Low Traffic:** Version one is focused on gathering qualitative feedback from small learner batches (PRD section 12). The volume of traffic does not warrant multi-node distributed coordination.

### What Would Have to Change to Add It
* **Multi-Instance Serverless Deployment:** When the Next.js API is deployed across horizontally autoscaled containers or serverless edge functions (e.g., Vercel, AWS Lambda), where server memory is not shared and in-memory Maps are wiped on container shutdown.
* **Coordinated Distributed Brute-Force Attacks:** If production telemetry detects distributed credential-stuffing attacks rotating across hundreds of residential proxy IPs targeting the same user accounts, necessitating centralized email-based and subnet-based rate tracking.

---

## 3. Interactive CAPTCHA / Proof-of-Work Bot Defenses (Cloudflare Turnstile / hCaptcha)

### What It Is
An automated challenge mechanism embedded into the registration and login forms that evaluates browser signals or requires the client to solve a computational puzzle to prove the request is initiated by a human rather than a headless script.

### Why It Was Not Worth It at This Stage
1. **Device and Accessibility Penalties on Target Hardware:** NucleoBridge's design mandate is accessibility on modest 4 GB laptops and mobile connections across emerging markets. Third-party CAPTCHAs add heavy JavaScript bundles, execute CPU-intensive background heuristics, and often fail or hang on slow, jittery 3G/4G connections.
2. **Strict Guidelines and Friction:** Project guidelines strictly forbid mechanisms that degrade developer workflows or trap legitimate users in unsolvable image challenges. 
3. **Existing Defenses Already Eliminate Automated Spam:** Our current server pipeline already neutralizes automated spam:
   * **Zod schema validation** rejects malformed payloads instantly.
   * **Sliding-window IP rate limiting** throttles rapid-fire requests.
   * **HIBP k-anonymity check** blocks breached dictionary passwords.
   * **Email OTP verification** ensures no account can be verified without access to a real inbox, preventing phantom account creation.

### What Would Have to Change to Add It
* **SMTP Quota Exhaustion from Bot Registrations:** If automated bots flood the signup endpoint with valid-looking unique email addresses, exhausting our transactional email quotas or damaging our domain sending reputation.
* **Database Table Bloat:** If unverified bot records accumulate faster than our scheduled cleanup routines can purge them.
* **Adoption of Native, Non-Intrusive Proof-of-Work:** Availability of a lightweight, cookie-free, fully accessible proof-of-work mechanism that executes natively in WebAssembly without third-party tracking scripts.

---

## 4. Web Application Firewall (WAF) with Threat-Intelligence Geoblocking

### What It Is
An edge security perimeter (such as Cloudflare WAF, AWS WAF, or Fastly) that inspects HTTP/S requests before they reach the Node.js application, filtering known attack signatures (SQL injection, XSS, directory traversal) and blocking IP addresses originating from high-risk Autonomous System Numbers (ASNs), VPNs, Tor exit nodes, or specific geographic regions.

### Why It Was Not Worth It at This Stage
1. **High Risk of False-Positive Lockouts for Core Personas:** NucleoBridge's core learner base includes Nigerian and African bioinformatics students who frequently connect through mobile carrier networks (MTN, Airtel) utilizing Carrier-Grade NAT (CGNAT) or low-cost commercial VPNs. Commercial WAF reputation lists routinely classify shared CGNAT IP ranges as "suspicious," which would block legitimate learners from accessing their coursework.
2. **Defense Built Directly Into Application Architecture:** Our application layer does not rely on perimeter filtering to stay secure:
   * **SQL Injection** is mathematically prevented by Prisma's parameterized queries and prepared statements.
   * **XSS** is prevented by React's automatic JSX output escaping, strict Markdown sanitization rules, and avoidance of `dangerouslySetInnerHTML`.
   * **Denial of Service** on password hashing is prevented by payload length caps in Zod before Argon2id executes.
3. **DNS and Custom Domain Prerequisite:** A WAF sits at the DNS routing layer. In local development and early testing milestones, the application runs on direct ports and staging URLs where an edge proxy is not yet provisioned.

### What Would Have to Change to Add It
* **Production Domain Cutover with Custom SSL:** When the platform launches to the public on its production apex domain (`nucleobridge.org`) behind Cloudflare DNS.
* **Sustained Layer 7 Volumetric Floods:** If malicious actors target the Next.js SSR pipeline with volumetric HTTP request floods designed to exhaust server CPU or PostgreSQL connection pools.
* **Payment Gateway Compliance:** If our payment partner (Flutterwave) or merchant processor mandates specific PCI-DSS perimeter controls as a prerequisite for processing live credit card transactions.

