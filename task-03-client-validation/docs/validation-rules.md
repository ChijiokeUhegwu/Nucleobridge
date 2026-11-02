# validation-rules.md

**Rule: Email must follow a valid format (e.g., contains '@' and a domain)**
*   **What breaks without it:** The SMTP service will attempt to dispatch OTPs and reset emails to malformed strings, resulting in server-side crashes, bounced email penalties, and 500 Internal Server errors.
*   **Who it wrongly blocks:** Users with valid but highly unconventional top-level domains (e.g., `.engineering`, `.museum`) or users utilizing plus-addressing (e.g., `learner+test@gmail.com`) if the validation regex is overly restrictive.

**Rule: Password must be a minimum of 8 characters**
*   **What breaks without it:** The application becomes trivially vulnerable to brute-force and dictionary attacks, compromising the security of the user's data and the integrity of the platform.
*   **Who it wrongly blocks:** Users who rely on shorter, but highly entropic and mathematically secure passwords (e.g., `^Y7#qW`).

**Rule: First Name and Last Name must not be empty**
*   **What breaks without it:** Automated email templates will fail or render awkward broken strings, such as "Hello null".
*   **Who it wrongly blocks:** Mononymous individuals (people who legally have only one name) who cannot fill out a mandatory "Last Name" field.

**Rule: Terms and Conditions checkbox must be checked (True)**
*   **What breaks without it:** The business will process personal identifiable information (PII) without explicit legal consent, exposing the platform to severe GDPR/CCPA compliance violations and liability.
*   **Who it wrongly blocks:** Legitimate users who simply suffered from banner blindness and missed the checkbox visually before hitting submit.