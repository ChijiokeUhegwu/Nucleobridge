# client-side-is-not-security.md

**The request sent and what the server did**
I sent an HTTP POST request directly to the `/api/auth/signup` endpoint using the command-line tool cURL, completely bypassing the browser and the React frontend. The payload intentionally included a single-character name, a malformed email, a blank password, and a `false` boolean for terms acceptance. My server rejected the request and returned a JSON error: `{"error":"Please enter a valid email address."}`.

**Which of the client-side rules were enforced**
Of all the client-side rules, only the email format check was enforced on this request. The server successfully flagged the malformed email and aborted the process. However, because it failed early, it is not certain if the server would have caught the blank password, the single-character name, or the unchecked terms and conditions. 

**What this proves about client validation and security**
This proves that client-side validation is purely a User Experience (UX) feature, not a security boundary. Because a malicious actor can bypass the frontend entirely using cURL, they can bypass any rule that is only checked in the browser. The only reason the invalid email was blocked is because that specific rule was duplicated on the server. If the password rules or terms acceptance are only on the client, the application is defenseless against malicious payloads.

**What I will do about it in task four**
In task four, I will implement comprehensive server-side validation to ensure *every* rule is enforced. I will run the payload through a strict schema validation library (like Zod) on the backend endpoint to guarantee that name lengths, password complexity, and terms acceptance are strictly verified before any database logic executes, rather than relying on piecemeal checks.