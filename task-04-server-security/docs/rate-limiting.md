# docs/rate-limiting.md
Task: Why IP alone is insufficient, what else serious applications key on, including the email address and hardware identifiers, where your counters are stored and the trade-off
of that choice, and what your limit does to a legitimate user on a shared office or campus connection.

## Threshold and Window Justification
I set the rate limit to 5 attempts per 15-minute window for the authentication endpoints. Five attempts provide enough leniency for a legitimate user to misspell their password, struggle with capslock, or mistype their email a few times without immediate punishment. A 15-minute lockout window is long enough to cripple automated brute-force or credential-stuffing scripts (which rely on thousands of rapid requests) but short enough that a genuinely locked-out user can step away, grab a coffee, and try again without needing to contact customer support.

## Why IP Alone is Insufficient
Relying solely on IP addresses for rate limiting provides a fragile illusion of security. As demonstrated in my bypass test, attackers can easily spoof the `x-forwarded-for` header to trick basic implementations. Even with strict header validation, attackers route traffic through massive proxy networks, botnets, or VPN services, changing their IP address on every single request. An IP limit blocks the individual node, but it does absolutely nothing to stop a distributed attack. 

## What Serious Applications Key On
To effectively halt attacks, serious platforms rate limit across multiple dimensions simultaneously. Beyond the IP address, they key on the target `email` address (preventing an attacker from trying 1,000 passwords on one account from 1,000 different IPs). They utilize hardware identifiers, device fingerprinting (canvas fingerprinting, user-agent analysis), and cryptographic session tokens. Advanced systems also analyze behavioral biometrics, such as typing speed and mouse movement, to differentiate a human from a script.

## Counter Storage and Trade-offs
My counters are currently stored in-memory (using a JavaScript `Map`) within the Node.js server. The primary advantage is speed and simplicity; it requires no external infrastructure. However, the trade-off is massive: the counters are instantly wiped if the server restarts. Furthermore, in modern serverless environments (like Vercel), each incoming request might spin up a brand new, isolated server instance with an empty Map, rendering the rate limit entirely useless. A production system must store counters in an external, persistent, high-speed cache like Redis, allowing all server instances to share a single source of truth.

## The Impact on Shared Connections
Strict IP-based rate limiting creates a severe "friendly fire" problem for shared connections. Corporate offices, university campuses, and public coffee shops often route hundreds of users through a single Network Address Translation (NAT) router, meaning they all share one public IP address. If a single malicious actor on a university campus runs a brute-force script against my platform, the IP rate limit will trigger, unintentionally locking out every other legitimate student on that campus from accessing their accounts.