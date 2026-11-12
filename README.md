# Tip (Terpvate) — One-Tap Private Tip & Gift Card on Zcash

> A one-tap private tip and gift card, built on the Zcash ecosystem.  
> **Shielded (Orchard / Sapling) · Mobile-First PWA · No Accounts · No Custody · No Tracking · HCI-Driven**

---

## 🌟 The Mental Model
> *"The link is a sealed envelope. Whoever opens it first keeps what's inside."*

1. **Pick an amount** (with live NGN/USD equivalent and ZIP 317 fee preview).
2. **Write an optional message** (encrypted client-side into the link).
3. **Fund on-chain** using any Zcash wallet (Zashi, Zingo, YWallet) via ZIP 321.
4. **Share the link** over WhatsApp, Telegram, or SMS.
5. **Receiver claims in 1 tap** directly to their private shielded address (`u1...` or `zs1...`).

---

## 🏗 Repository Structure (PRD §13.9)

```
tip/
├── README.md                  # Project overview, quickstart, and design specs
├── LICENSE                    # MIT
├── SECURITY.md                # Threat model and privacy commitments
├── docs/                      # PRD, HCI matrix, research notes
├── ops/                       # Deployment configs, security headers (CSP, COOP/COEP)
├── public/                    # PWA manifest, service worker, icons
├── src/
│   ├── a11y/                  # Screen reader live announcer, focus management
│   ├── app/                   # Routes: Send, Preview, Pay, Ready, MyGifts, Gift(/g), Help
│   ├── events/                # Typed Event Bus & Finite State Machine
│   ├── i18n/                  # Microcopy bank (en.json, extensible to Nigerian languages)
│   ├── services/              # GiftService, LinkCodec, CryptoService, PriceService, StorageService
│   ├── ui/                    # Design tokens (tokens.css), Button, Keypad, Card, StepBar, etc.
│   ├── viewmodels/            # MVVM ViewModels (SendVM, PayVM, ClaimVM, MyGiftsVM)
│   ├── worker/                # wallet.worker.ts (WASM off-thread execution)
│   └── zcash/                 # ZIP-317 fee rules, ZIP-321 URIs, address validators
└── tests/                     # Unit test suites (state machine, codec, fee, validation)
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js >= 18 (Tested on Node v24)
- npm >= 9

### Install & Run
```bash
npm install
npm run dev
```

### Run Tests
```bash
npm run test
```

### Build for Production
```bash
npm run build
```

---

## 📐 Design & HCI Standards
- **60-30-10 Color Rule**: 60% neutral canvas (`#F8FAFC`), 30% card surface (`#FFFFFF`), 10% gold accent (`#F4B728`) with 2px ink outline (`#0F172A`) for WCAG 2.2 AA non-text contrast.
- **Fitts's Law Ergonomics**: All primary action targets ≥ 48px, positioned in the lower thumb-zone; keypad targets 56px.
- **Honest Feedback**: Real-time confirmation states (0/3 → 3/3, ~4 min) with reassuring microcopy (*"Your money is safe. Nothing has been lost."*).
- **Network Resilience**: Target bundle under 150 KB, lazy-loaded WASM worker, offline-first IndexedDB persistence.
