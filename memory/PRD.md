# Ai15-main Financial Gaming Platform - PRD

## Product Overview
A financial gaming platform with wallet management, game loading/redeeming, referrals, and admin dashboard capabilities.

## Tech Stack
- **Frontend**: React, Tailwind CSS, Single Axios Instance (`/api/http.js`)
- **Backend**: FastAPI, PostgreSQL (FROZEN - DO NOT MODIFY)
- **Infrastructure**: Docker, Kubernetes, Supervisor

---

## PHASE 5A: CLIENT PAGES MIGRATION - COMPLETE ✅ (Jan 17, 2025)

### Files Modified:
| File | Changes |
|------|---------|
| `/pages/client/ClientWallet.js` | Migrated to http.js, expandable transactions with timeline, void records |
| `/pages/client/TransactionDetail.js` | Migrated to http.js, vertical timeline, error states |
| `/pages/client/AddFunds.js` | Migrated to http.js, multi-step wizard, Telegram approval notice |
| `/pages/client/Withdraw.js` | Migrated to http.js, approval warning, success state |
| `/pages/client/ClientGames.js` | Migrated to http.js, load/redeem modals, error handling |
| `/App.js` | Updated to import ClientReferrals instead of ReferralPage |

### Files Created:
| File | Description |
|------|-------------|
| `/pages/client/ClientReferrals.js` | NEW premium referrals page (no portal dependency) |

### Features Implemented:
1. **ClientWallet.js**
   - Balance card with breakdown (Cash, Play Credits, Bonus)
   - Add Funds / Withdraw buttons
   - Transaction list with expandable details
   - Timeline (created/approved/processed/completed)
   - Rejection reason display
   - Void record display
   - Loading, empty, error states

2. **TransactionDetail.js**
   - Header with status badge and amount
   - Vertical activity timeline
   - Failure/rejection card
   - Void record card
   - Retry button on error

3. **AddFunds.js**
   - Multi-step wizard (Amount → Method → Proof)
   - Quick amount buttons
   - Payment proof upload
   - "Requires Telegram approval" info box
   - Success state with order ID

4. **Withdraw.js**
   - Amount input with balance check
   - Withdrawal method selection
   - Account details form
   - "Approval Required" warning
   - Success state with pending status

5. **ClientGames.js**
   - Games list with account status
   - Create account button
   - Load from wallet modal
   - Redeem to wallet modal
   - Credentials display (show/hide password)
   - Safe error handling

6. **ClientReferrals.js** (NEW)
   - Hero gradient section
   - Copy referral link button with toast
   - Stats cards: Total, Active, Earned, Pending
   - Referral progress timeline per user
   - Earnings history table
   - Rules accordion
   - Share to Telegram/WhatsApp

---

## API USAGE

All client pages now use **ONLY** `/src/api/http.js`:

| Page | Endpoints Used |
|------|---------------|
| ClientWallet | `GET /wallet/balance`, `GET /portal/transactions/enhanced` |
| TransactionDetail | `GET /portal/transactions/{orderId}` |
| AddFunds | `POST /wallet-load/request` |
| Withdraw | `POST /withdrawal/wallet` |
| ClientGames | `GET /public/games`, `GET /game-accounts/my-accounts`, `POST /game-accounts/create`, `POST /game-accounts/load`, `POST /game-accounts/redeem` |
| ClientReferrals | `GET /portal/referrals/details` |

---

## NAVIGATION ORDER

### Mobile Bottom Nav (ClientBottomNav.jsx)
1. Home
2. **Referrals** ⭐ (priority position)
3. Wallet
4. Games
5. Profile

### Desktop Top Nav
1. Home
2. **Referrals** ⭐
3. Wallet
4. Games
5. Profile

---

## VERIFICATION RESULTS ✅

| # | Test | Result |
|---|------|--------|
| 1 | `/login` loads | ✅ PASS |
| 2 | `/client/home` redirects unauthenticated to `/login` | ✅ PASS |
| 3 | `/client/wallet` redirects unauthenticated to `/login` | ✅ PASS |
| 4 | `/p/:token` shows retry + login buttons | ✅ PASS |
| 5 | `/games` public route loads | ✅ PASS |
| 6 | No console React errors | ✅ PASS (only network 520s) |
| 7 | No "Objects are not valid as React child" | ✅ PASS |

---

## ROUTE MAP (FINAL)

### PUBLIC (No auth)
- `/` → `/games`
- `/games`
- `/login`
- `/register`
- `/admin/login`

### CLIENT (ClientGuard)
- `/client/home`
- `/client/referrals` ← NEW page
- `/client/wallet`
- `/client/wallet/add`
- `/client/wallet/withdraw`
- `/client/wallet/transaction/:orderId`
- `/client/games`
- `/client/profile`

### PORTAL COMPAT (Redirects)
- `/p/:token` → Magic link landing
- `/client-login` → `/login`
- `/portal/*` → `/client/*` or `/login`

### ADMIN (AdminGuard)
- `/admin/*` (unchanged)

---

## Test Credentials
- **Client**: `testclient` / `test12345`
- **Admin**: `admin` / `admin123`

## Known Issues
- Backend requires PostgreSQL (unavailable in preview environment)
- Pre-existing ESLint warnings in legacy admin pages

## Important Notes
- **Backend is FROZEN** - Do not modify
- **All client pages migrated** - Use http.js only
- **Portal pages preserved** - For backward compatibility only
