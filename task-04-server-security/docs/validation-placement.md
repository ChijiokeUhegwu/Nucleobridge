# Validation Lifecycle and Placement

## Reason for choosing ZOD

Zod is a TypeScript-first schema declaration library that allows us to infer static TypeScript types directly from the validation schema. This eliminates duplicated code between interfaces and validators. It is synchronous, highly composable, and provides granular, developer-friendly error handling.

## Where Validation Sits
Validation sits at the absolute boundary of the backend application. It is the very first programmatic operation executed inside a route handler or middleware, immediately after parsing the raw HTTP request body into a JSON object. 

## What Runs Before It
1. **Network level protections:** DDoS protection, WAF (Web Application Firewall), and rate limiting.
2. **TLS/SSL Termination:** Decrypting the HTTPS request.
3. **Body Parsing:** Converting the raw HTTP stream into a readable JSON payload (e.g., `request.json()`).

## What Must Never Run Before It
1. **Database Queries:** Never query the database using unvalidated user input. 
2. **Business Logic:** Do not trigger emails, generate tokens, or execute state changes before knowing the payload is perfectly formed.
3. **Cryptography:** Never pass unvalidated input into expensive operations like Argon2 hashing. Attackers can submit aggressively oversized payloads to exhaust CPU resources (Bcrypt/Argon2 DoS attacks).

## Schema Validation vs. Manual Handlers
Validating by hand inside a route handler (`if (!email || !email.includes('@'))`) appears simpler for small endpoints but is architecturally dangerous. 

Manual validation scatters structural rules across multiple files, guaranteeing that constraints will eventually diverge (e.g., the login route allows 50 characters for an email, but the registration route allows 100). Schema validation using a library like Zod decouples the "shape" of the data from the "execution" of the route. It guarantees that if the schema passes, the data is entirely safe to typecast and use, dropping invalid requests before they ever interact with your core business logic.