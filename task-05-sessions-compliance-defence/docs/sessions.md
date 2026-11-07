# docs/sessions.md

## 1. What Session Hijacking Is
Session hijacking (sometimes called cookie sidejacking or session fixation) is an attack where an unauthorized adversary obtains a legitimate user's active session identifier and uses it to masquerade as that user on the platform. Because HTTP is inherently stateless, modern web applications rely on session tokens—stored in browser cookies and transmitted on every request—to prove identity after authentication. If an attacker acquires this token, they inherit the victim's authenticated state without needing their email, password, or one-time verification code.

In a modern web architecture, an attacker can steal a session identifier through multiple primary vectors:
* **Cross-Site Scripting (XSS):** If an application allows untrusted user input or compromised third-party dependencies to execute JavaScript in the victim's DOM, and if session cookies are accessible to client scripts, malicious JavaScript (`document.cookie`) can read the session string and exfiltrate it to an attacker-controlled endpoint.
* **Man-in-the-Middle (MitM) Packet Sniffing:** If the application or any intermediate redirect transmits cookies over unencrypted HTTP (or if an attacker performs SSL stripping on insecure networks such as public Wi-Fi), passive packet inspection tools can capture the plaintext `Cookie` header.
* **Cross-Site Request Forgery (CSRF) & Cross-Origin Leakage:** If cookie policies do not restrict cross-origin request inclusion, malicious websites visited by the victim can forge state-changing HTTP requests that automatically carry the victim's ambient browser cookies.
* **Session Fixation:** An attacker pre-allocates an active session identifier, forces or tricks the victim into logging in with that predefined identifier, and then accesses the account using the same known token.
* **Database / Server-Side Leaks:** If the backend persists plaintext session identifiers in relational tables and experiences an SQL injection vulnerability or an unencrypted database backup breach, all active sessions are instantly compromised.

---

## 2. How a Stolen Identifier Is Used
Once an attacker possesses a victim's raw session token, exploitation is trivial and requires no specialized cracking tools:
1. **Header Injection:** The attacker launches a standard web browser or scriptable HTTP client (such as cURL, Postman, or Python `requests`).
2. **Cookie Manipulation:** The attacker injects the stolen token into their client's cookie store under the application's session key (e.g., `nb_session=<stolen_token>`).
3. **Impersonation & Exploitation:** When the attacker navigates to the application, the client sends `Cookie: nb_session=<stolen_token>` in the HTTP request headers. The server inspects the incoming cookie, locates the corresponding session record in the database, maps it to the victim's `User` record, and returns the victim's private dashboard.

**Impact on NucleoBridge:**
A successful session hijacking attack allows the adversary to:
* Access protected bioinformatics step workspaces and authored case study content (PRD FR-A.1, FR-A.3).
* View and tamper with the learner's live code snapshots, editor state, and terminal command logs (`WorkspaceSnapshot`).
* Read private mentor conversation history and exhaust the learner's daily AI mentor token quotas (`MentorMessage`, `HintQuota`).
* Illegitimately utilize paid PRO features funded by the learner's subscription (`Entitlement`).
* Trigger destructive account actions, such as initiating the "Delete my data" flow (`DELETE /api/me`).

---

## 3. What Logging Out Does to the Identifier
Session termination must operate as a synchronized, two-tier invalidation process spanning both the client and the server. Simply deleting the cookie from the browser is dangerously inadequate: if an attacker has already copied the token to their own machine, deleting the victim's local cookie leaves the server-side session valid, allowing the attacker to maintain persistent access.

### Client-Side Invalidation
When the learner clicks "Sign Out", the application dispatches a `POST /api/auth/signout` request. The server responds with a `Set-Cookie` header configured to wipe the client cookie immediately:
```http
Set-Cookie: nb_session=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; Max-Age=0; HttpOnly; SameSite=Lax
```
This instructs the learner's browser to purge the cookie from local storage and discontinue attaching it to future requests.

### Server-Side Invalidation (The Security Barrier)
Crucially, NucleoBridge executes an atomic database revocation inside the sign-out handler:
1. The server extracts the raw session token from the incoming cookie.
2. It computes the SHA-256 hash: `tokenHash = hashToken(rawToken)`.
3. It deletes the record from the database:
   ```typescript
   await prisma.session.deleteMany({
     where: { tokenHash },
   });
   ```

**Result:**
The server-side session record is permanently eradicated from the `Session` table. Even if an adversary stole the raw token 5 seconds prior and continues sending it from another country, every subsequent request from the attacker fails the database lookup (`prisma.session.findUnique`). The server returns `HTTP 401 Unauthorized`, neutralizing the stolen token instantly.

---

## 4. What NucleoBridge Does to Limit Damage If a Token Is Stolen
To protect learners and contain the blast radius of any potential token compromise, NucleoBridge implements a defense-in-depth architecture across the entire session lifecycle:

### A. One-Way Token Hashing in the Database (SHA-256)
* **Design:** NucleoBridge never stores plaintext session tokens in the database. When a session is generated, only the cryptographic SHA-256 hash (`tokenHash`) is written to the `Session` table. The raw token is sent exclusively to the user's browser in the `Set-Cookie` header.
* **Blast-Radius Mitigation:** If the database is compromised via SQL injection, unauthorized dump, or leaked backup file, the attacker obtains only one-way SHA-256 digests. Because SHA-256 is computationally infeasible to invert, the attacker cannot convert `tokenHash` back into the plaintext `rawToken` needed to populate the browser's cookie. The stolen database records are completely useless for authentication.

### B. High-Entropy Cryptographic Token Generation (CSPRNG)
* **Design:** Session tokens are minted using Node.js's native cryptographically secure pseudorandom number generator:
  ```typescript
  const rawToken = crypto.randomBytes(32).toString('hex');
  ```
* **Blast-Radius Mitigation:** A 32-byte hex string provides 256 bits of cryptographic entropy ($2^{256}$ possible combinations). It is impossible for an attacker to predict, sequence, or brute-force valid session identifiers, eliminating pseudo-random sequence prediction vulnerabilities.

### C. Fresh Token on Every Sign-In (Anti-Fixation)
* **Design:** Every authentication event (email OTP verification, password login, or initial account creation) generates a completely new, unique session token. Previous sessions for that login are never recycled or inherited.
* **Blast-Radius Mitigation:** This prevents session fixation attacks. An attacker cannot pre-set an identifier and expect it to remain valid across authentication boundary transitions.

### D. Strict Defensive Cookie Flags
NucleoBridge issues all session cookies with rigid security attributes:
| Cookie Flag | Configuration | Threat Prevented |
|---|---|---|
| `HttpOnly` | `true` | **Cross-Site Scripting (XSS) Token Theft:** Strictly blocks client-side JavaScript (`document.cookie`) from accessing or reading the session cookie. Malicious scripts injected via XSS cannot exfiltrate the token. |
| `Secure` | `process.env.NODE_ENV === 'production'` | **Man-in-the-Middle (MitM) Eavesdropping:** Forces browsers to transmit the cookie exclusively over encrypted TLS/HTTPS connections, preventing cleartext interception on unencrypted Wi-Fi networks. |
| `SameSite` | `'lax'` | **Cross-Site Request Forgery (CSRF):** Prevents the browser from sending the cookie on third-party cross-site subrequests (e.g., cross-origin `POST`, images, or iframe calls), while allowing seamless top-level link navigations. |
| `Path` | `'/'` | **Scope Isolation:** Scopes session validity consistently across the entire application domain while avoiding path-traversal credential leaks. |
| `Max-Age` | `2,592,000` (30 days) | **Perpetual Exposure Window:** Imposes an absolute 30-day time-to-live (TTL) per PRD FR-A.3. Dormant or abandoned tokens automatically expire and are rejected by the server. |

### E. Mandatory User Existence and Active Cascade Verification (PRD FR-A.6)
* **Design:** NucleoBridge never relies on self-contained, stateless tokens that blind the server to user lifecycle changes. Every incoming request validated via `getSessionUser()` performs an active database lookup joining `Session` and `User`.
* **Blast-Radius Mitigation:** If a user account is suspended or deleted via the "Delete my data" flow (`DELETE /api/me`), foreign key cascade (`onDelete: Cascade`) immediately deletes all linked `Session` rows. Any stolen session token tied to that account is instantly rendered inactive without waiting for cookie expiration.

### F. Separation of Sensitive Operations & Non-Retention of Financial Credentials
* **Design:** In accordance with `payments.md` and `security-privacy.md`, NucleoBridge never stores credit card, debit card, or bank account credentials on its servers. All payments are hosted externally via Flutterwave redirect.
* **Blast-Radius Mitigation:** Even if an attacker hijacks a learner's active session, they cannot view, export, or steal payment card information, because the application never retains sensitive financial records in its database or session context.

