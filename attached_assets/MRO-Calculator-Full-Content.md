# Verusen MRO Inventory Optimization Calculator — Full Content & Flow

## Purpose & Context

A **lead-generation tool** embedded as an iframe on Verusen's WordPress site. Prospects (typically maintenance, procurement, supply-chain, or operations leaders at industrial companies) input data about their MRO (Maintenance, Repair, Operations) inventory and receive an estimated dollar value of savings Verusen could unlock for them. Full results are gated behind a lead-capture form. Leads sync to HubSpot.

**Live URL pattern:** `https://verusenai-mro-inventory-calculator.onrender.com/?industry=<slug>&campaign=<name>`

**Currently being embedded on industry-specific ABM landing pages** (Food & Beverage launching first, then Oil & Gas, Pharma, Mining, etc.) with URL parameters that pre-select the industry and tag the lead with a campaign attribution in HubSpot.

**Brand colors:** Verusen navy `#003252`, blue `#0075c9`, green `#3ec26d`, orange `#ed9b29`.

---

## User Flow Overview

3-step wizard with a progress tab bar at the top:

1. **Your Priorities** — Industry dropdown + pain-point selection
2. **Your Profile** — Conditional input form based on selected pains
3. **Your Savings** — Blurred results preview → lead form → unlocked full results + downloadable PDF

---

## STEP 1 — Your Priorities

### Industry Dropdown (top of page, required)

**Label:** "What industry are you in? *"

**Placeholder:** "Select your industry..."

**Options:**
- Aerospace & Defense
- Chemicals & Process Industries
- Construction & Infrastructure
- Energy & Utilities
- Food & Beverage
- Industrial & Environmental Services
- Manufacturing
- Mining & Materials
- Oil & Gas
- Pharmaceuticals & Life Sciences
- Transportation & Logistics
- Other

**Validation error:** "Please select your industry"

### Pain Point Selection

**Headline:** "What's your biggest MRO pain right now?"

**Subhead:** "Select one or more areas. We'll tailor your results to lead with what matters most to you."

**Three selectable cards (multi-select):**

| Card | Icon | Title | Description |
|---|---|---|---|
| 1 | 📦 Package | **Inventory Imbalance** | Too many of the wrong parts and not enough of the right ones. No visibility into the inventory you actually have. |
| 2 | 💲 Dollar | **Spend Leakage** | Maverick, rogue buying. Tail spend and supplier consolidation opportunities. No contract adherence. |
| 3 | ⚠️ Alert | **Downtime Risk** | Critical parts aren't there when needed. Stockouts causing production delays and emergency purchases. |

**Validation:** At least one card must be selected before continuing. If none, alert: "Please select at least one area to continue."

**Footer CTA button:** "Continue →"

---

## STEP 2 — Your Profile

**Headline:** "Tell us about your operation"

**Subhead:** "Required fields are marked with a red dot. Defaults are industry benchmarks."

### Core Information (always shown)

- **Number of Locations** *required* — placeholder "e.g. 6"

### Inventory Profile (shown if Inventory Imbalance OR Spend Leakage was selected)

- **On-Hand Inventory Value** *required* — placeholder "e.g. $40,000,000"
- **Number of On-Hand SKUs** *required* — placeholder "e.g. 12,000"

**Collapsible: "Adjust Inventory Mix"** (optional)
- Subtext: "Must total 100%. Defaults are industry benchmarks."
- Active & Slow: default 67%
- Non-Moving / Obsolete: default 23%
- Special Items: default 10%
- Validation warning if total ≠ 100% with confirmation to fall back to defaults

### Spend Profile (shown if Spend Leakage was selected)

- **Annual MRO Replenishment Spend** *required* — placeholder "e.g. $14,000,000"
  - Warning if value is <35% or >75% of inventory value: "Typical range is 35–75% of on-hand inventory value."

**Collapsible: "Adjust Spend Assumptions"** (optional)
- Average Holding Cost Rate — default 15% (hint: "Default: 15% of inventory value per year")
- Weighted Avg. Cost of Capital (WACC) — default 7% (hint: "Default: 7%")

### Downtime Profile (shown if Downtime Risk was selected)

- **Unplanned Downtime Hours (Avg Per Site)** *required* — hint "Suggested range: 300–1,200 hrs/year" — placeholder "e.g. 400"
- **Downtime Cost/Hr Per Production Unit (Avg Per Site)** *required* — hint "Suggested range: $5,600–$22,000/hr" — placeholder "e.g. $6,000"

**Collapsible: "Adjust Service Level Assumptions"** (optional)
- Current Service Level — Critical Spares — default 88% (min 75%)
- Desired Service Level — Critical Spares — default 95% (max 98%)
- % Downtime Attributed to Stockouts — default 50% (max 50%)

**Footer CTA button:** "Calculate My Savings →"

---

## STEP 3 — Your Savings (Gated)

The user immediately sees the BIG headline number — a hero "Total MRO Optimization Opportunity" $X total — but the detailed breakdown below is **blurred** with a lead-capture form floating on top.

### Hero Block (visible immediately, not blurred)

**Label (small caps, dim):** "Total MRO Optimization Opportunity"

**Headline:** Large dollar total (e.g. "$5,250,000")

**Tagline below total:** "Powered by your data, Verusen's advanced AI modeling, and industry benchmarks, this analysis reveals hidden stockout risks and untapped savings opportunities across your MRO inventory."

### Blurred Preview (visible but unreadable behind the form)

Includes section cards for whichever pain points were selected — Inventory Optimization breakdown, Spend Reduction breakdown, Downtime Cost Avoidance, plus a small "Your Optimization Journey" chart.

### Lead Form Card (floating overlay, white card with blue border)

**Headline:** "Access Your Full AI MRO Optimization Analysis"

**Subhead:** "Get the complete breakdown, optimization timeline, and downloadable PDF."

**Fields:**
- First name *
- Last name *
- Business email * (rejects personal email domains like gmail/yahoo/hotmail and competitor domains)
- Company *
- Function * (select dropdown)
  - Options: Procurement, Innovation, IT / IS, Finance, Sourcing, Maintenance, Manufacturing, Supply Chain, Operations, Other

**Submit button:** "Get My Full AI Analysis →"

**Trust footer:** 🔒 "We respect your privacy. No spam."

**Validation errors:**
- "First name is required" / "Last name is required" / "Invalid email address" / "Please use your business email address" / "This email domain is not allowed" / "Company name is required" / "Please select your function"

---

## STEP 3 — Unlocked Full Results

After lead submission, the blur is removed and the user sees:

### Hero (same as gated, plus bucket strip)

Below the total, a row of colored sub-totals showing each savings bucket:
- "Active Material Increases" (gray) — investment needed
- "Inventory Reduction" (green)
- "Spend Reduction/Avoidance" (blue)
- "Downtime Reduction" (orange)

Plus a small button: "← Adjust my inputs"

### Section: MRO Inventory Optimization (📦, green)

**Optimization Journey chart** — visualizes inventory trajectory over time.

**Total Inventory Value Reduction Opportunity** — big $ value
"One-time reduction in on-hand inventory value through right-sizing initiatives"

**⚠ Active Materials Increase** (shown as risk/cost row)
"Active material investment to cover critical stockout gaps"

**Breakdown table** — "Components of the $X inventory reduction":

| Initiative | Description |
|---|---|
| Active Material Reduction | Excess active & slow-moving stock removed from balance sheet |
| Deduplication | Cross-site SKU rationalization eliminates duplicate stock holdings |
| Parts Pooling & Network Sharing | Consolidated cross-site inventory reduces per-site overstocking |
| VMI Disposition | Vendor-managed inventory transfers stock ownership off your books |

### Section: Spend Reduction/Avoidance (💸, blue)

**Total Annual Spend Reduction & Avoidance**
"Ongoing annual savings from eliminating leakage across your MRO spend categories"

**Breakdown table:**

| Initiative | Description |
|---|---|
| Carrying / Holding Cost Savings | Annual cost of carrying inventory eliminated as on-hand value drops |
| WACC Savings | Capital cost freed as inventory reduction releases working capital |
| PPV & Tailspend Savings | Price variance and tail spend consolidation through supplier rationalization |
| Replenishment Suppression | Reduced reorder activity as optimized inventory eliminates unnecessary restocking |
| Additional Repairable Materials | Parts identified as repairable rather than replaced, reducing new spend |
| Expediting Cost Reduction | Emergency and rush order costs avoided through better stock positioning |

### Section: Downtime Avoidance (⚠️, orange)

**Total Estimated Downtime Cost Avoidance**
"Annual savings from reducing stockout-driven unplanned downtime"

**Current vs. Optimized State table:**

| Metric | Current State | Optimized State |
|---|---|---|
| Org-Wide Unplanned Downtime Hours | X hrs | Y hrs |
| Total Unplanned Downtime Cost | $X | $Y |
| Critical Spares Stockout Rate | X% | Y% |

**Bottom row:** Avoidable Downtime Cost (stockout-attributed portion) — $ value

### Methodology Note (at bottom)

**Headline:** "How we calculated this."

**Body:** "Estimates are based on your inputs and proven benchmarks, where customers have achieved 20% lower working capital and a 2.8% increase in asset uptime within months. Results may vary."

### Final CTA Block (dark navy)

**Headline:** "Ready to unlock your MRO optimization potential?"

**Subhead:** "Schedule a deeper conversation with our team by visiting"

**Link:** https://verusen.com/talk-to-an-mro-expert/

### Action buttons

- Download PDF (branded Verusen report with all sections)
- Schedule a call
- Start over

---

## Calculation Logic Summary

Plain-English description of what the calculator computes. Inputs are the numbers the user enters in Step 2. Defaults shown in parentheses.

### Tiered factors (vary by company size/scale)

- **Parts pooling factor:** 0% (1 site) | 4% (2–5 sites) | 6% (6+ sites)
- **VMI factor:** 5% (<50k SKUs) | 7% (50k–100k) | 9% (>100k)
- **Deduplication factor:** 1% (<50k SKUs) | 2.5% (50k–100k) | 4% (>100k)
- **PPV factor:** 5% (<$50M spend) | 7% ($50M–$100M) | 9% (>$100M)

### Inventory bucket (one-time working capital release)

- Active Value = total inventory × active % (default 67%)
- Non-Moving Value = total inventory × obsolete % (default 23%)
- **Active Material Increase** (investment, shown as ⚠): 4% of active value
- **Active Material Reduction:** 15% of active value
- **Parts Pooling & Network Sharing:** (active + non-moving) × pooling factor
- **VMI Disposition:** active value × VMI factor
- **Deduplication:** (active + non-moving) × dedup factor
- **Total Inventory Reduction** = sum of reduction + pooling + VMI + dedup

### Spend bucket (annual recurring savings)

- **Holding cost savings:** total inventory reduction × holding rate (default 15%)
- **WACC savings:** total inventory reduction × WACC (default 7%)
- **PPV & tailspend savings:** annual spend × PPV factor
- **Replenishment suppression:** total inventory reduction × 45%
- **Repairable materials:** active value × 2.75%
- **Expediting cost reduction:** annual spend × 1.5%
- **Total Spend Savings** = sum of all six

### Downtime bucket (annual recurring savings)

- Org downtime hours = sites × hours per site
- Unplanned cost = hours × cost per hour
- Current stockout rate = 1 − current service level (default 88%)
- Target stockout rate = 1 − target service level (default 95%)
- Optimized downtime hours = (target stockout / current stockout) × current hours
- Avoidable downtime cost = unplanned cost − optimized cost
- **Downtime Savings** = avoidable cost × % attributed to stockouts (default 50%)

### Grand Total

Sum of whichever buckets the user selected on Step 1.

---

## Lead Capture / HubSpot Integration

Upon form submission:

1. Lead saved to PostgreSQL DB
2. Synced to HubSpot via:
   - **Forms API** (form GUID `b34a5604-13b5-4746-b578-b469c5320b76`, portal 2886100) — populates: email, firstname, lastname, company, function, industry, lead_source_campaign
   - **CRM Contacts API** — same fields written as contact properties
   - **Notes API** — attaches a full plain-text note to the contact summarizing: industry, campaign source, inputs (sites, inventory value, SKU count, mix), and calculated savings breakdown
3. Calculator results stored in DB linked to lead
4. PDF available for download

### URL Parameter Support (for ABM campaigns)

- `?industry=<slug>` — pre-selects the industry dropdown on Step 1
- `?campaign=<name>` — written to HubSpot `lead_source_campaign` property for attribution
- Both are optional; calculator works without them
- Supported slugs: `food-beverage`, `oil-gas`, `pharma`, `manufacturing`, `mining`, `aerospace`, `chemicals`, `construction`, `energy`, `industrial`, `transportation` (and aliases)

---

## Stepper / Progress UI

Three tabs across the top of the calculator, always visible:

1. **Your Priorities** (blue when active, green check when complete)
2. **Your Profile**
3. **Your Savings** (green when active — denotes the "win" state)

Users can click back to any completed step. Forward navigation requires validation passing.

---

## Trust & Conversion Elements Currently in Place

- Industry-benchmark defaults (so user can submit without knowing every number)
- Soft warnings when values are outside typical ranges (educates, doesn't block)
- Multi-select pain cards (allows tailoring without forcing one path)
- "Powered by your data, Verusen's advanced AI modeling, and industry benchmarks" trust copy
- Blurred preview shows the structure of what's behind the gate (curiosity gap)
- Business-email enforcement (filters tire-kickers and personal accounts)
- Branded downloadable PDF (post-gate value delivery)
- Methodology note acknowledging "Results may vary"
- Direct link to schedule a call with an expert
- Mobile-responsive throughout

---

## What's Worth Brainstorming for Conversion Lift

Some areas where conversion optimization ideas could meaningfully help:

- **Step 1 → Step 2 drop-off** (pain selection completion)
- **Step 2 → Step 3 drop-off** (input form abandonment — currently has several required numeric fields)
- **Gate conversion** (% of people who see the blurred results and fill out the lead form)
- **Hero number believability** — is the displayed total persuasive or does it feel inflated/under-stated?
- **Form friction** — 5 fields including function dropdown; could/should anything be removed or progressively profiled?
- **Trust signals** — currently minimal social proof, no logos, no testimonials, no customer quotes
- **Post-conversion experience** — what happens *after* they unlock results to keep them engaged toward a meeting booking?
- **Industry personalization** — beyond pre-selecting the dropdown, the experience is identical for Food & Beverage vs. Oil & Gas; could industry-specific copy, examples, or benchmarks lift conversion?
- **Mobile experience** — currently functional but inputs are dense; many B2B buyers research on desktop but could land on mobile from email campaigns
