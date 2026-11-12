# Security & Privacy Policy: Tip (Terpvate)

## Zero-Knowledge Custody Model
1. **Client-Side Key Generation**: Throw-away shielded wallet secrets are created exclusively within the user's browser using `crypto.getRandomValues`.
2. **URL Fragment Isolation**: Keys are placed only in the URL hash fragment (`#1.<secret>.<birthday>.<flags>.<encrypted-message>`). Per RFC 3986, browser user agents never send fragments to any HTTP/HTTPS server.
3. **No Database & No Analytics**: Tip operates without backend accounts, databases, cookies, or remote tracking telemetry.
4. **Shielded Enforcement**: Tip rejects transparent (`t1...`) addresses by default to prevent amounts and user links from being publicly exposed on the Zcash transparent ledger.

## Threat Model & Mitigations
* **Chat Leaks / Eavesdropping**: Passcode encryption (Argon2 / PBKDF2) wraps link secrets when chosen. Unclaimed gifts can be reclaimed by the sender via "Take It Back".
* **Fake Amount Exploits**: Claim screens show amounts as `"checking..."` until the on-chain shielded note is cryptographically verified by the light-client engine.
* **Malicious Third-Party Scripts**: `Content-Security-Policy` and `Referrer-Policy: no-referrer` are enforced. No external advertising, metrics, or untrusted CDNs are loaded.
* **Double Spend Races**: When a claim and cancel race occurs, the on-chain consensus determines the valid spend. Both UIs reflect the truthful outcome.

## Reporting a Vulnerability
To report security concerns, please create a confidential security advisory or reach out directly to the security team.

