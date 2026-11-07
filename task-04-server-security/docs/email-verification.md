# docs/email-verification.md

## Generation and Attack Surface
I implemented OTP generation using Node's cryptographically secure `crypto.randomInt` function. If I had used an ordinary pseudorandom number generator (PRNG) like `Math.random()`, the outputs would be predictable. Because PRNGs rely on a deterministic algorithm and a server seed (often the current timestamp), an attacker observing one generated code could mathematically calculate the sequence of future codes. Even with a 5-attempt-per-15-minute rate limit and a 10-minute expiry window, if the attacker knows the exact seed, they don't need to guess randomly; they can instantly generate the exact valid code for the victim's account on their first or second try.

## Expiry Window Justification
I set the expiry window to 10 minutes. A 2-minute window is unrealistically short; legitimate users often experience SMTP relay delays, or they need time to find their phone, open their mail app, wait for the inbox to refresh, and type the code. Ten minutes provides a frictionless user experience. The cost of this larger window to the attack surface is negligible. Because the endpoint is strictly rate-limited to 5 guesses per 15 minutes, an attacker only gets a maximum of 5 attempts to guess a 1-in-a-million 6-digit code before the 10-minute window closes and the code expires entirely.

## SMTP Delivery and The Google Password Failure
* **Host:** `smtp.gmail.com`
* **Port:** `465` (SSL/TLS)

During initial configuration, the first SMTP dispatch failed. I received a `535-5.7.8 Username and Password not accepted` error. This occurred because I placed my standard Google account password into the `.env` file. Google blocks basic authentication from unknown applications by default to prevent credential theft. To fix this, I enabled 2-Step Verification on the Google account and generated a dedicated, 16-character "App Password," which bypasses the block and securely authenticates the NodeMailer transporter.

## Background Processing Performance
Sending the email inline during the registration request creates a massive bottleneck, tying my API's response time to the latency of Google's SMTP servers. 
* **Response time with inline email:** `[Paste synchronous ms time here]` ms.
* **Response time with background job:** `[Paste asynchronous ms time here]` ms.

Moving the email dispatch to a background job drastically reduces the latency, ensuring the database commits instantly and the user is advanced to the next screen without staring at a loading spinner.

## Flow Defect: The "Used Twice" Vulnerability
*(Note: Edit this section based on how your code actually behaved in step 3.5)*
During testing, I deliberately submitted the same valid code twice after a successful verification. My application properly rejected the second attempt, stating the account was already verified. If the system had processed it a second time without checking the user's current status (a common defect where verification is not retry-safe), it would execute redundant database writes, overwrite existing session states, and potentially trigger duplicate welcome emails. Nullifying the OTP upon successful entry prevents this state corruption.