# IPORadar - Real-Time Indian IPO & GMP Intelligence Platform

A modern, high-performance cross-platform application that runs seamlessly on **Web**, **Android**, and **iOS** from a single unified codebase.

Built with **React 19**, **TypeScript**, **Vite**, **Tailwind CSS v4**, and **Capacitor**.

---

## 🌟 Key Features

1. **IPO Hub (Mainboard & SME)**:
   - Categorized by **Mainboard** vs **SME** issues.
   - Status filters: **Live / Current Bidding**, **Upcoming**, and **Listed / Closed**.
   - Interactive cards with logo, sector, price band, lot size, minimum investment, issue size, bidding dates, and live status badges.

2. **Live Grey Market Premium (GMP) Tracker**:
   - Real-time estimated listing price & GMP ₹ profit.
   - Estimated gain percentage (+%) with trend indicators.
   - Kostak rates and Subject to Sauda (SS) tracking.
   - **Interactive Profit Calculator**: Select any IPO, enter number of lots, and instantly calculate your estimated listing day profit and required capital.

3. **Live Subscription Status**:
   - Real-time bidding progress across **QIB** (Qualified Institutional Buyers), **NII / HNI** (Non-Institutional Investors), and **Retail Individual Investors (RII)**.
   - Overall subscription multiplier (e.g. `38.6x`) and animated category progress meters.

4. **Allotment Status Checker**:
   - Multi-registrar support (**Link Intime**, **KFintech**, **Bigshare**, **Cameo**, etc.).
   - Search by **PAN Card Number**, **Application Number**, or **DP / Client ID**.
   - Realistic allotment outcome display showing applied shares, allotted shares, and refund status.
   - Direct links to official registrar portals.

5. **IPO Event Calendar**:
   - Timeline visualization for Issue Opening, Issue Closing, Basis of Allotment, Initiation of Refunds, Demat Credit, and BSE/NSE Listing dates.

6. **Share Buybacks Tracker**:
   - Active and upcoming share buybacks with Tender Offer vs Open Market classifications, Record dates, and premium over current market price.

7. **Prospectus & Details Modal**:
   - In-depth company background, objectives of the issue, and lead managers.
   - 3-year financial statements comparison (Revenue, Expenses, PAT, Net Worth).
   - Key strengths, risk factors, and analyst ratings.

8. **Watchlist & Dark/Light Mode**:
   - Bookmark favorite IPOs with persistent local storage.
   - Theme toggle between modern sleek dark mode and crisp light mode.

9. **Responsive Dual UI Layout**:
   - **Desktop**: Full-width modern dashboard with sticky header, live marquee ticker, and multi-column grid.
   - **Mobile**: Native mobile app shell feel with top header and a bottom navigation bar.

---

## 🚀 Getting Started (Web)

### 1. Install Dependencies
```bash
npm install
```

### 2. Run Development Server
```bash
npm run dev
```
Open [http://localhost:5174](http://localhost:5174) in your browser.

### 3. Build for Production
```bash
npm run build
```
The optimized static bundle will be built in the `dist/` directory.

---

## 📱 Mobile App Workflow (Android & iOS via Capacitor)

This project is pre-configured with **Capacitor** (`capacitor.config.ts`) for zero-friction mobile compilation.

### Step 1: Build the Web App
```bash
npm run build
```

### Step 2: Add Android Platform (First Time)
```bash
npm install @capacitor/android
npx cap add android
```

### Step 3: Open in Android Studio
```bash
npm run cap:android
# or: npx cap open android
```
From Android Studio:
- Test on an Android Emulator or connected physical phone.
- Go to **Build > Generate Signed Bundle / APK** to create your **`.aab`** for the **Google Play Store**.

### Step 4: Add iOS Platform (First Time on macOS)
```bash
npm install @capacitor/ios
npx cap add ios
npm run cap:ios
# or: npx cap open ios
```
From Xcode:
- Test on an iPhone simulator.
- Archive and upload to **App Store Connect** for the **Apple App Store**.

### Updating Mobile Builds
Whenever you make changes to your React code:
```bash
npm run build
npm run cap:sync
```

---

## 📂 Project Structure

```
C:\Projects\IPO\
├── capacitor.config.ts          # Native Capacitor mobile settings
├── vite.config.ts              # Vite configuration with Tailwind CSS v4
├── package.json
├── index.html
├── dist/                       # Production web bundle
└── src/
    ├── main.tsx
    ├── App.tsx                 # Core app state and view routing
    ├── index.css               # Design system & dark/light theme tokens
    ├── types/
    │   └── ipo.ts              # Full TypeScript definitions
    ├── data/
    │   └── mockIpoData.ts      # Indian stock market IPO dataset
    ├── context/
    │   ├── ThemeContext.tsx    # Light / Dark mode provider
    │   └── WatchlistContext.tsx# Saved IPOs state
    └── components/
        ├── common/             # Navbar, MobileHeader, MobileBottomNav, Ticker, Badge
        ├── ipo/                # IpoCard, IpoDetailModal, FilterBar, QuickStatsBar
        ├── gmp/                # GmpTracker & Profit Calculator
        ├── subscription/       # SubscriptionView with progress meters
        ├── allotment/          # AllotmentChecker & Registrar links
        ├── calendar/           # IpoCalendar date schedule
        └── buyback/            # BuybackTracker
```
