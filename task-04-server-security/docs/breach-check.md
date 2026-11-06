# docs/breach-check.md
Task: Then explain the mechanism, which is the actual interview question: you do not send the password. You send a short prefix of its hash and receive back a range of matches, then check locally. Write how that works in your own words, in docs/breach-check.md, and say why the naive version would be an
unacceptable thing to build

## The Unacceptable Naive Version
The naive approach to checking if a password is breached is sending the plain-text password directly to a third-party API (like Have I Been Pwned) and asking, "Is this in your database?" This is an unacceptable, catastrophic security failure. By transmitting the raw password over the network to an external service, you are essentially creating a deliberate data leak. Even over HTTPS, the third-party server could log the requests, suffer a breach itself, or be compromised by a malicious insider, instantly exposing the credentials of every user attempting to register on Nucleobridge.

## The Secure Mechanism (k-Anonymity)
To perform this check securely, we utilize a cryptographic concept called k-Anonymity. Instead of sending the password, the process works like this:

1. **Local Hashing:** When the user types their password, the NucleoBridge backend immediately hashes it using the SHA-1 algorithm. 
2. **The Prefix Request:** The server takes only the first five characters of that hash (the prefix) and sends those five characters to the HIBP API.
3. **The Response:** Because a 5-character prefix is highly ambiguous, the HIBP API responds with a massive list of hundreds or thousands of breached password hashes (specifically, their remaining suffixes) that happen to start with those same five characters. 
4. **Local Verification:** The NucleoBridge server receives this massive list and checks it locally against the user's remaining hash suffix. 

If there is a match, the registration is blocked. Through this mechanism, the external API never receives the user's password, and it never even receives the complete hash. The third party has absolutely no way to know which of the hundreds of returned passwords the user actually typed, preserving absolute privacy while guaranteeing security.