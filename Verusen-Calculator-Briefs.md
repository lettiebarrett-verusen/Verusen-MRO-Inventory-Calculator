# Verusen Interactive Calculator Series — Reference Documentation

---

## 1. Creative / Functional Brief

### Project Name
Verusen Interactive Calculator Series

### Purpose
Lead generation tools designed as embeddable calculators for WordPress landing pages. Each calculator helps prospects at asset-intensive enterprises quickly estimate the value of a specific Verusen solution area, then captures their contact info for sales follow-up.

### Target Audience
Procurement, Operations, Supply Chain, Finance, Maintenance, and Manufacturing leaders at asset-intensive enterprises (energy, utilities, manufacturing, mining, oil & gas).

### Core User Flow
1. User lands on a WordPress page with an embedded iframe calculator
2. User enters high-level business inputs (no login required)
3. User fills out a short lead form (name, email, company, function)
4. User sees personalized results with savings/opportunity estimates
5. User can adjust inputs, download a PDF, or request an expert consultation
6. Lead and calculation data sync to HubSpot CRM automatically

### Key Functional Requirements
- Embeddable via iframe (hosted on Render, embedded on WordPress)
- Responsive design that works within iframe constraints (recommended 1100px height)
- Lead capture form gated before results are shown
- HubSpot Forms API integration for lead tracking (Portal ID: 2886100)
- HubSpot CRM API integration for contact creation and notes
- PDF download of results
- "Start Over" functionality to re-run with different inputs
- Blocked competitor email domains (configurable list)
- Industry dropdown (cosmetic only, not stored)

### Calls to Action
- **"Talk to an Expert"** → links to verusen.com consultation page
- **"Learn Why Customers Choose Verusen"** → links to comparison page
- **"Download Results"** → generates and downloads a branded PDF

### Technology Stack
- **Frontend:** React 18 + TypeScript, Tailwind CSS, shadcn/ui, Recharts, Framer Motion
- **Backend:** Node.js + Express, Drizzle ORM, PostgreSQL
- **Hosting:** Render (auto-deploys from GitHub)
- **CRM:** HubSpot (Forms API + CRM API via Replit connector)

---

## 2. Design Brief

### Brand Colors

| Usage | Color | Hex |
|---|---|---|
| Primary Navy | Dark navy blue | `#003252` |
| Backgrounds | White / light neutral | — |
| Secondary text | Muted foreground | Tailwind `text-muted-foreground` |

### Chart & Category Colors

| Category | Color | Hex |
|---|---|---|
| Starting Inventory | Gray | `#9ca3af` |
| Optimal Inventory | Green | `#22c55e` |
| Active Material Increases | Red | `#ef4444` |
| Active Material Decreases | Blue | `#3b82f6` |
| Network Optimization | Purple | `#8b5cf6` |
| VMI Disposition | Orange | `#f97316` |
| Deduplication | Pink | `#ec4899` |

### Typography
- System font stack via Tailwind defaults
- Headings: Bold/Extrabold weight
- Body: Regular weight, muted foreground color for secondary text

### Input Page Layout
- **No page title** — clean, minimal header
- Subtitle text centered at top: descriptive one-liner about the calculator's purpose
- Input fields arranged in a responsive grid (4 columns on desktop, 2 on tablet, 1 on mobile)
- Number inputs with formatted display (commas for thousands, currency prefix)
- Percentage allocation section with input boxes and a visual percentage bar
- Defaults pre-filled (e.g., 67% / 23% / 10% for MRO calculator)
- Industry dropdown (cosmetic, not stored)
- Single primary CTA button: "Calculate My Savings"

### Lead Form Page
- Clean card layout, centered
- Fields: First Name, Last Name, Email, Company, Function (dropdown)
- Function dropdown values must exactly match HubSpot field options
- Primary CTA: "Reveal My Savings" with arrow icon
- Privacy note with lock icon: "We respect your privacy. No spam."
- Back button to return to inputs

### Results / Output Page
- **Hero metric:** Total Optimization Opportunity, centered, extra-large text (`text-5xl`), primary color
- **Waterfall chart:** Stacked bar chart showing Starting → adjustments → Optimal
  - Gray starting bar, colored adjustment bars, green optimal bar
  - Compact currency labels on top of each bar
- **Breakdown list:** Each category shown as a row with:
  - Color-coded icon (in a tinted background circle)
  - Category name + short description
  - Signed currency value in category color
- **Compact input adjusters:** Below the chart, users can tweak inputs and see results update live
- **CTA section:** "What's Next?" card with expert consultation and comparison links
- **Download button:** Ghost-style button for PDF export
- **Start Over:** Ghost button at bottom

### PDF Design
- Navy header bar with white text
- "MRO Inventory Calculator" title + "Powered by Verusen AI"
- Total opportunity amount in header (right-aligned)
- Input profile summary in a light gray box
- Breakdown items with colored left accent bars
- Waterfall bar visualization (starting gray, optimal green)
- Footer CTA: "Ready to unlock your MRO optimization potential?"
- Disclaimer text at bottom

### Iframe Embedding Specifications

```html
<iframe
    src="https://[app-url]/"
    width="100%"
    height="1100"
    frameborder="0"
    style="border: none; max-width: 1200px; margin: 0 auto; display: block;"
    title="[Calculator Name]"
    allow="clipboard-write"
></iframe>
```

---

## 3. How the Calculations Work

### Inputs Required

| Input | Description | Example |
|---|---|---|
| Number of Sites | Physical locations with MRO inventory | 5 |
| Total Inventory Value | Dollar value of all MRO inventory | $10,000,000 |
| SKU Count | Total number of unique parts/materials | 75,000 |
| Active & Slow % | Percentage of inventory that is active or slow-moving | 67% |
| Non-Moving % | Percentage of inventory that is non-moving/obsolete | 23% |
| Special/Critical % | Percentage of inventory that is special or critical | 10% |

Percentages must total 100%.

### Derived Values

```
Active & Slow Value = Total Inventory Value × (Active % / 100)
Non-Moving Value    = Total Inventory Value × (Non-Moving % / 100)
```

### Optimization Formulas

#### 1. Active Material Value Increases
Represents the cost of increasing critical material stock to reduce risk.

```
Active Material Increases = Active & Slow Value × 6% × -1
```

This is a *negative* optimization (increases spend), displayed as a positive number with a "+" sign.

#### 2. Active Material Value Decreases
Right-sizing overstocked active materials.

```
Active Material Decreases = Active & Slow Value × 22%
```

#### 3. Network Optimization & Transfer Opportunity
Cross-site inventory balancing. Uses a sliding scale based on number of sites:

| Sites | Factor |
|---|---|
| 1 | 0% |
| 2–4 | 4% |
| 5+ | 6% |

```
Network Optimization = (Active & Slow Value + Non-Moving Value) × factor
```

#### 4. VMI Disposition
Vendor-managed inventory opportunities. Uses a sliding scale based on SKU count:

| SKU Count | Factor |
|---|---|
| < 50,000 | 5% |
| 50,000–100,000 | 7% |
| > 100,000 | 9% |

```
VMI Disposition = Active & Slow Value × factor
```

#### 5. Deduplication Savings
Eliminating duplicate safety stock across the network. Uses a sliding scale based on SKU count:

| SKU Count | Factor |
|---|---|
| < 50,000 | 1% |
| 50,000–100,000 | 2.5% |
| > 100,000 | 4% |

```
Deduplication = (Active & Slow Value + Non-Moving Value) × factor
```

### Total Optimization Opportunity

```
Total = Active Material Decreases
      + Network Optimization
      + VMI Disposition
      + Deduplication
      - Active Material Increases (absolute value)
```

### Optimal Inventory

```
Optimal Inventory = Total Inventory Value - Total Optimization Opportunity
```

### Important Notes
- All estimates are directional, based on industry benchmarks
- Active Material Increases is subtracted from the total because it represents additional spend needed
- The waterfall chart visually shows: Starting Value → +Increases → -Decreases → -Network → -VMI → -Dedup → Optimal Value
- Results update in real-time when users adjust inputs on the output page
