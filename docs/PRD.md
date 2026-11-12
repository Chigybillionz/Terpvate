# PRODUCT REQUIREMENTS DOCUMENT · PRODUCT STRUCTURE · HCI DESIGN SPEC

# Terpvate (formerly working title "Tip")
**A one-tap private tip and gift card, built on the Zcash ecosystem**  
*Zcash shielded (Orchard / Sapling) · Mobile-first PWA · No accounts · No custody · No tracking · HCI-driven (COS 432 Groups 1–20)*

| | |
|---|---|
| **Version** | 1.0 (first full draft) |
| **Date** | 12 November 2026 |
| **Author** | Chidera Agbo |
| **Status** | Ready for technical spike + usability research |
| **Design basis** | HCI study material, Groups 1–20, applied in order (see Appendix A) |

Working title "Tip" is kept from the original brief and evolved to "Terpvate". Technical claims about Zcash were checked against ZIP 317, ZIP 321 and the WebZjs README (Appendix C); items still to be verified at build time are flagged **[VERIFY]**.

---

# 0 · The Product at a Glance

**One-line pitch:** Pick an amount of ZEC, write a short message, get one private link. Whoever opens that link can claim the gift in one or two taps. Nothing is stored on our servers, and the money moves through Zcash's shielded pool.

**The mental model we are designing for (conceptual model, Group 4):** *"The link is a sealed envelope. Whoever opens it first keeps what's inside."* Every screen, word and warning reinforces this one idea.

## Ten decisions that shape everything

| # | Decision | Why (short) |
|---|---|---|
| 1 | **Gift = a fresh, throw-away shielded wallet** created in the sender's browser. The link carries its key in the URL fragment (`#…`), which browsers never send to servers. | No custody, no database, nothing to leak. |
| 2 | **Added a "Fund your gift" step** between Preview and Success. The gift only exists once ZEC is on-chain. | Your original flow skipped it; without it the "ready" message would be a lie. |
| 3 | **Honest timing:** Zcash blocks come about every 75 s; we wait **3 confirmations (~4 min)** before "Ready". | Feedback must be truthful (Heuristic 1). |
| 4 | **Receiver claims in 1 tap if an address is remembered, otherwise 2** (paste/scan address + confirm). No in-app seed creation in the MVP. | Unaudited browser wallet code + new users = safety risk. |
| 5 | **Shielded destinations only.** Transparent addresses are blocked by default. | Paying out to a transparent address exposes the amount. |
| 6 | **Message is encrypted inside the link** (readable instantly, works with any payer wallet). On-chain memo stays an option for v1.1. | Robust and fast; see §13.2. |
| 7 | **Sender can cancel and take the money back** while the gift is unclaimed. Optional expiry reminder (30 days). | User control and error recovery. |
| 8 | **Optional passcode** on any gift, strongly suggested above a threshold. | A link is a bearer secret; chat apps can leak it. |
| 9 | **Amount shown as "checking…" until the blockchain confirms it.** | Stops fake-amount links (anti-scam). |
| 10 | **Nigeria-ready from day one:** NGN equivalent, light first page, WhatsApp share first, plain words, USSD-style "one action per screen". | Your real users and networks. |

> **What I adjusted in your original idea (full table in §2)**  
> Funding step added · "one or two taps" made realistic · "private from everyone" made precise (private on-chain, but the link itself must be kept private) · cancel/refund and expiry added · transparent addresses blocked · fee shown up front · wallet-creation step replaced by a safer guided choice.

---

# 1 · Product Overview & HCI Foundations (Group 1)

## 1.1 Problem and vision

**Problem.** Sending someone a small amount of private money today usually means: they must already have a wallet, you must get their long address right, and anything you write is public or lost. Gift cards and mobile transfers are easy but not private. Zcash gives real privacy, but its tools are built for people who already understand wallets.

**Vision.** Make private giving feel as easy as sending a WhatsApp message: *amount → message → link → claimed*.

## 1.2 The HCI triad applied to Tip

| Part | In Tip | Key limits we design around |
|---|---|---|
| **Human** | Sender (comfortable with chat apps, maybe new to crypto); receiver (may have never held crypto); privacy-minded tipper. | Limited attention and memory; low crypto literacy; low-end Android; shared or public screens; stress when money is involved. |
| **Computer** | Mobile-first web app (PWA) with an in-browser Zcash light client and a Zcash light-wallet server. | Slow or patchy networks, data cost, WASM/memory limits on cheap phones, block times. |
| **Interaction** | Tap, type, paste, scan QR, share. Two-way: every action gets visible feedback. | Waiting for confirmations; wallet hand-offs; clipboard and permission prompts. |

## 1.3 Key terms for this product (one-line definitions)

| Term | Definition applied to Tip |
|---|---|
| **UI** | The buttons, fields, cards and messages on each screen. |
| **UX** | How safe, clear and calm giving or claiming a gift feels, before, during and after. |
| **Usability (ISO 9241-11)** | Specified users reach their goal with **effectiveness** (gift claimed correctly), **efficiency** (few taps, little time) and **satisfaction** (they feel safe and in control) in their context (phone, patchy network). |
| **Nielsen's 5 attributes** | Learnability (first-timer succeeds unaided) · Efficiency · Memorability (returning sender needs no re-learning) · Low errors and easy recovery · Satisfaction. |
| **Interaction design** | How Tip behaves when you tap: preview updates, status changes, errors recover. |

## 1.4 Scope, characteristics, challenges

- **In scope (HCI scope list):** interface layout, usability engineering, accessibility, user research, error handling, multimodal input (tap, paste, QR scan, share sheet).
- **Characteristics we commit to:** human-centred · iterative · context-aware (phone, daylight, weak network) · goal-oriented (one goal per screen) · multidisciplinary (§4.3).
- **Challenges (from the course) and our answer:** *security vs usability* → passcode is optional but nudged; no forced steps. *Low literacy* → icon + label, plain words, one action per screen. *Unstable networks* → light first page, resumable progress, "My gifts" recovery.

## 1.5 Lessons borrowed from Nigerian cases (Group 1)

| Case from the course | What Tip copies |
|---|---|
| OPay / PalmPay instant checkmark and "Transfer Successful" | A big, unmistakable success state for sender and receiver. |
| Kuda's consistent thumb-zone icons vs buried menus | Primary action always at the bottom, same place every time. |
| CBT / registration portals without auto-save or timeout warning | Gift progress is saved automatically; recoverable from "My gifts"; countdown warnings before any timeout. |
| AfriCHI 2023: functional illiterates prefer USSD (one numbered text action per screen) | One question per screen, plain words, no dense layouts; text-first fallback. |
| POS "Network Error" after a debit alert (Group 4) | Never show vague failures. Always say *what happened to the money*. |

---

# 2 · Adjustments to the Original Idea

| # | Original | Issue found | Adjustment |
|---|---|---|---|
| A1 | Step 4 "Create Gift Link" then Step 5 preview then Step 7 "gift is ready" | Nothing has been paid yet. A link that looks ready but is empty breaks trust (Gulf of Evaluation). | Add **Fund** step. Success ("ready") appears only after the funds are seen on-chain and confirmed. |
| A2 | "Claim in one or two taps" | The receiver needs somewhere to receive. Confirmations take time. | 1 tap with a remembered address; 2 otherwise. The receiver sees status, not silence. |
| A3 | "Amount and message stay private from everyone else" | Over-promise: shielded Zcash hides amount, sender, receiver and memo *on-chain*, but anyone holding the link can claim, and some chat apps can read links. | Precise copy: "Private on the blockchain. Keep the link between you two." Optional passcode. |
| A4 | "Connect or create a simple wallet" | In-browser key creation uses young, unaudited code (WebZjs says so in its README) and first-time users rarely back up seed phrases. | Receiver chooses: paste/scan address, open in wallet app, or follow a 3-step guide to get a wallet. Gift waits safely meanwhile. |
| A5 | No cancel or refund | Wrong amount, wrong person, or link sent to the wrong chat has no recovery (Heuristic 3 and 9). | "Take it back" for unclaimed gifts; optional 30-day reminder. |
| A6 | Any address accepted | A transparent address makes the claim amount publicly visible. | Shielded or Unified addresses only by default; plain explanation if rejected. |
| A7 | Fees not mentioned | Surprise costs destroy trust. ZIP 317 sets a minimum 0.0001 ZEC for a simple shielded transaction. | Show "Gift 0.05 + network fee 0.0001" before paying. Receiver gets exactly the stated gift. |
| A8 | ZEC amount only | New users cannot judge "0.05 ZEC". | Show an approximate NGN/USD equivalent, labelled "about", with the rate time. |
| A9 | No place to find past gifts | Without accounts, closing the tab loses the link. | "My gifts" list kept only on the device, encrypted, with copy-again and cancel. |
| A10 | Not mentioned | Wallet engine (WASM) is megabytes; Nigerian data costs and phones matter. | Light first page (< 150 KB); wallet engine loads only when needed and is cached. |
| A11 | Amount shown on the claim page | A crafted link could display a fake large amount to scam someone. | Amount reads "checking…" until verified on-chain. |

---

# 3 · Goals, Non-Goals and Success Metrics

## 3.1 Goals
1. **Effortless:** a first-time sender creates a gift without help.
2. **Safe by default:** no loss of funds from a confusing screen; mistakes are preventable or recoverable.
3. **Genuinely private:** no accounts, no analytics, no server that can see a gift.
4. **Inclusive:** usable on low-end phones, weak networks, by low-literacy users, with assistive tech.
5. **Showcase Zcash:** shielded transactions, Unified Addresses, ZIP 321 payment requests, ZIP 317 fees.

## 3.2 Non-goals (MVP)
Holding user funds (custody) · fiat on/off-ramps · user accounts or KYC · group gifts, recurring tips, tip jars · in-app seed generation · transparent-address payouts · other tokens or bridges · AI features · chat or social features.

## 3.3 Success metrics (targets set before testing)

| Metric (ISO 9241-11) | Target | How measured |
|---|---|---|
| Effectiveness: sender completes Create → Ready | ≥ 95% (n=8 test users) | Moderated usability test |
| Effectiveness: receiver claims successfully (wallet ready) | ≥ 90% | Usability test + testnet dry runs |
| Efficiency: sender time, excluding wallet payment & confirmations | ≤ 45 s | Time-on-task |
| Efficiency: receiver time with a saved address | ≤ 30 s | Time-on-task |
| Error rate (wrong address, wrong amount, abandoned) | < 5% of tasks | Observed errors per task |
| Satisfaction: System Usability Scale (SUS) | ≥ 80 (average benchmark is 68; JKN Mobile reached 80.55) | 10-item SUS after test |
| Heuristic evaluation | 0 severity-4 and 0 severity-3 problems open at launch | 3 expert evaluators, Nielsen's 0–4 scale |
| Accessibility | WCAG 2.2 AA pass | Automated + manual audit + screen reader test |
| Privacy | 0 third-party requests on gift pages; 0 analytics identifiers | Network inspection test |
| Weight | Gift landing < 150 KB; wallet engine lazy-loaded and cached | Lighthouse / DevTools on throttled 3G |

---

# 4 · Users, Context and Research (Groups 1, 5, 8)

## 4.1 Personas (research-based starting points, to be validated)

| Persona | Profile | Goal | Pain today |
|---|---|---|---|
| **Ada, 27**<br>Sender · Lagos | Content creator and fintech app user. Has used crypto once or twice. Shares everything on WhatsApp. | Send a birthday gift and tip a friend privately, quickly. | Long addresses, fear of typing one character wrong, no way to attach a message. |
| **Emeka, 34**<br>Receiver · Enugu | Small-business owner, never held crypto, mid-range Android, patchy data. | Receive the gift without learning crypto. | Jargon, being asked for "seed phrases", unclear if the money is real. |
| **Zee, 31**<br>Privacy-minded tipper | Comfortable with Zashi/Zingo, tips writers and developers. | Tip privately, verify everything, keep control. | Hidden tracking, closed-source tools, no way to verify. |

## 4.2 Context of use (stated in the product, per UCD)
- **Devices:** mostly mid/low-end Android phones, Chrome, sometimes iPhone Safari. Desktop secondary.
- **Network:** intermittent; data is expensive; background tabs get killed.
- **Environment:** bright daylight (light mode needs strong contrast), crowded places (shoulder-surfing), one-handed thumb use.
- **Sharing channels:** WhatsApp first, then Telegram, SMS, email.
- **Language:** English first; plain wording; Pidgin, Yoruba, Igbo, Hausa on the roadmap.

## 4.3 The interdisciplinary team lens (Group 5)

| Discipline | What it contributes to Tip |
|---|---|
| **Computer Science** | Event-driven UI, web workers so the interface never freezes, light-client sync, shielded transaction building, state machine, encryption. |
| **Cognitive Psychology** | One goal per screen (attention), chunked amounts and links (Miller 7±2, Cowan 4), recognition over recall, progressive disclosure of Zcash terms. |
| **Design** | Hierarchy, contrast, consistent components, feedback states, a calm trustworthy look. |
| **Ergonomics / Human Factors** | 48 px targets, bottom thumb-zone actions, large keypad, no precise taps near edges. |
| **Sociology / Anthropology** | How gifts are really given (WhatsApp, occasions, trust between people), cultural meaning of colour and gifting, ethnographic observation of sharing. |
| **Linguistics** | Plain, polite, actionable microcopy; error messages that say what happened, why, and what to do; later localisation. |

## 4.4 Research plan (generative then evaluative)

| Phase | Method | Output |
|---|---|---|
| Generative (early) | 6 interviews (senders and receivers) · observation of how people actually share links and gifts, to avoid self-report bias · short survey (~30 people) · contextual inquiry on how they use mobile-money apps | Validated personas, top fears, preferred sharing channels |
| Design | Open card sort of labels (10 people) · low-fi paper prototype test · heuristic evaluation by 3 experts | Final labels, flow fixes |
| Evaluative (later) | Moderated usability tests on a testnet build (8 people, think-aloud) · SUS · accessibility audit · a "link-in-a-chat" test with real messengers | Metrics in §3.3, severity-rated issue list |

## 4.5 Ethics commitments (Group 8)
No dark patterns: no fake urgency, no pre-ticked options, no hidden fees. No tracking. Honest privacy language. The user's choices (wallet, passcode, refund address) are always theirs. No nudge to send more than they intend.

---

# 5 · Product Requirements

## 5.1 Functional requirements
[MUST] required for MVP · [SHOULD] strongly wanted · [COULD] if time allows · [LATER] after MVP

| ID | Requirement | Priority | Acceptance criteria |
|---|---|---|---|
| F1 | Enter a gift amount in ZEC with a large keypad, preset chips and an approximate local-currency line. | [MUST] | Valid range enforced; decimal limits (max 8 places); live preview updates within 100 ms. |
| F2 | Optional private message with quick templates and a live length counter. | [MUST] | Counter in characters; hard stop at the byte limit; emoji counted correctly. |
| F3 | Receiver-view preview before paying. | [MUST] | Preview matches the real claim page; Edit returns without losing input. |
| F4 | Fund step: total shown (gift + claim fee), pay by wallet deep link (`zcash:` URI) or QR. | [MUST] | URI follows ZIP 321; works with at least two mainstream Zcash wallets (test matrix) **[VERIFY]**. |
| F5 | Detect payment, show live confirmation progress (0/3 → 3/3), then "Ready". | [MUST] | Status updates without refresh; recoverable if tab is closed; wrong amount flagged. |
| F6 | Copy link, Share (system share sheet), QR of link, with "keep this private" notice. | [MUST] | Copy gives visible confirmation; share sheet opens in ≤ 1 tap. |
| F7 | Receiver landing: "You received a private gift", message, amount (checking → verified), single Claim button. | [MUST] | Loads under 3 s on throttled 3G; no secret leaves the browser. |
| F8 | Claim: paste or scan shielded address, validate, show fee, one-tap confirm. | [MUST] | Rejects transparent/wrong-network addresses with plain explanation; double-tap protected. |
| F9 | Claim result: broadcast, mined status, clear success. | [MUST] | Success wording matches true state (see §9 microcopy). |
| F10 | Sender "Take it back" (cancel and refund) while unclaimed. | [MUST] | Needs confirmation; handles claim-vs-cancel race with clear outcome. |
| F11 | "My gifts": local, encrypted list with status, copy link, cancel. | [SHOULD] | No server copy; clearing it never moves funds. |
| F12 | Optional passcode on a gift. | [SHOULD] | Link alone cannot claim; wrong passcode errors are helpful and rate-limited locally. |
| F13 | Guided "I need a wallet" path with 3 steps. | [SHOULD] | Returns to the same gift after the wallet is ready. |
| F14 | Light and dark mode; reduced motion; text zoom to 200%. | [SHOULD] | All contrast ratios in §10 met in both themes. |
| F15 | Shareable gift-card image generated on the device. | [COULD] | No upload to any server. |
| F16 | Remember the receiver's address on that device (opt-in). | [COULD] | Enables the 1-tap claim; easy to forget. |
| F17 | Write the message into the on-chain memo too (v1.1). | [LATER] | Appears in wallet history. |
| F18 | Localisation: Pidgin, Yoruba, Igbo, Hausa. | [LATER] | Reviewed by native speakers. |

## 5.2 Non-functional requirements

| Area | Requirement |
|---|---|
| **Privacy** | No accounts. No analytics. No third-party scripts, fonts or images on gift pages. `Referrer-Policy: no-referrer`. Strict Content-Security-Policy. Secrets only in the URL fragment and in memory; stored secrets encrypted. |
| **Security** | Key material never sent over the network. Constant-time and audited crypto primitives from standard libraries. Dependency pinning, subresource integrity, reproducible build. |
| **Performance** | Interactive in < 3 s on throttled 3G for the landing; UI response < 100 ms; wallet sync and proof work in a Web Worker so the main thread never blocks. |
| **Reliability** | Resume after tab kill or offline; idempotent claim; clear states for every failure. |
| **Compatibility** | Current Chrome and Safari on Android and iOS, desktop Chrome/Firefox/Edge. WASM threading needs cross-origin isolation headers on the host **[VERIFY]**; provide a single-thread fallback. |
| **Accessibility** | WCAG 2.2 AA; POUR principles; keyboard and screen-reader support. |
| **Maintainability** | MVVM layers, typed event bus, unit-tested logic before screens (§13). |

---

# 6 · Information Architecture (Groups 6–10)

## 6.1 The four IA systems
- **Organisation:** Two journeys (Send, Receive) plus four support pages. Task-based scheme (Group 7.3): people come to *do* something.
- **Labelling:** Everyday words: "Send a gift", "My gifts", "How it works", "Help". Never "Generate shielded bearer note".
- **Navigation:** Sender: a step bar (1 Amount · 2 Preview · 3 Pay · 4 Share). Receiver: no menu at all; one path. Support pages: a tiny footer.
- **Search:** None needed (five pages). Help page has a short FAQ list.

## 6.2 Structure type (hybrid, Group 6.4)
**Sequential** for both journeys (fixed order, like checkout) · **Flat** for support pages (all one level) · **Database-driven:** none (no server data). Depth never exceeds 2.

## 6.3 Site map
- **terpvate.app** (front door for senders)
- **/** Send a gift (1 Amount & message → 2 Preview → 3 Pay → 4 Ready & Share)
- **/gifts** My gifts (local list: status · copy link · take back)
- **/g#…** Gift link (front door for receivers: A Landing → B Where to send → C Confirm → D Claimed)
- **/how** How it works
- **/privacy** What is private
- **/wallets** Get a wallet (3 steps)
- **/help** Help & FAQ

---

# 10 · Visual Design System (Groups 11–14)

## 10.1 Elements and principles
- **Palette (60-30-10 rule):** 60% neutral canvas (`#F8FAFC`), 30% card surface (`#FFFFFF`), 10% gold accent (`#F4B728`) on the primary action with a 2 px ink outline (`#0F172A`) guaranteeing 17.85:1 contrast against white cards.
- **Ergonomics (Fitts's Law):** Touch targets ≥ 48px, keypad buttons 56px, all primary actions mapped to the bottom thumb zone.

---

# 13 · Technical Architecture on Zcash

## 13.1 Zcash Building Blocks
- **Shielded Pools:** Orchard & Sapling encrypted transfers.
- **Unified Addresses:** ZIP 316.
- **Payment Requests:** ZIP 321 (`zcash:<address>?amount=...`).
- **Fees:** ZIP 317 conventional fee = 10,000 zatoshis (0.0001 ZEC).
- **Units:** 1 ZEC = 100,000,000 zatoshis. Block target ≈ 75 seconds.

## 13.2 Core Gift Protocol
1. **Create:** Generate 32-byte secret in browser, derive throwaway shielded address + viewing key.
2. **Link:** `#1.<secret>.<birthday>.<flags>.<encrypted-message>`. Fragment is never transmitted to servers.
3. **Fund:** Sender pays gift + 0.0001 ZEC claim fee via ZIP 321.
4. **Detect:** Light-client syncs from birthday, reaches READY after 3 confirmations.
5. **Claim:** Receiver sweeps funds to shielded address in 1–2 taps.
6. **Take Back:** Sender can cancel and refund before claim.
7. **Soft Expiry:** 30-day reminder.

---

# Appendix A · HCI Traceability Matrix (Groups 1–20)
*See docs/HCI_MATRIX.md for the complete matrix mapping.*

