# field-justification.md

**First Name & Last Name**
*   **Why it is needed:** To identify the user and personalize the interface.
*   **What the business does with it:** Uses it to populate dashboard greetings and structure automated support emails.
*   **What happens if the user gets it wrong:** The user receives emails with incorrect names or addressed wrongly on the dashboard, but core authentication remains functional.

**Email Address**
*   **Why it is needed:** Acts as the primary, unique account identifier.
*   **What the business does with it:** Uses it for database lookups during login, sending SMTP-based OTP codes, and delivering password reset links.
*   **What happens if the user gets it wrong:** The user cannot receive their OTP, cannot reset their password, and will permanently lose access to the account if they forget their credentials.

**Password**
*   **Why it is needed:** Secures the account against unauthorized access.
*   **What the business does with it:** Hashes it via bcrypt or Argon2 and stores the hash in the PostgreSQL database for future cryptographic comparison.
*   **What happens if the user gets it wrong:** The user cannot pass the authentication check and is denied entry.

*(Note: The "Confirm Password" field was removed from this form to reduce input friction, replaced instead by a "Show Password" visibility toggle on the primary password field.)*