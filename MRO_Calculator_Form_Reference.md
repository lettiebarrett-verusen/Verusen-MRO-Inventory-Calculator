# MRO Inventory Optimization Calculator — Full Form Reference

## Overview
A 3-step lead generation calculator embedded via iframe on WordPress. Users select pain points, enter their operational profile, and receive tailored optimization estimates. Results are blur-gated behind a lead capture form.

---

## Step 1: Pain Point Selection
**Title:** "What's keeping you up at night?"
**Instruction:** Select one or more areas of concern. Multi-select enabled.

| Card | Label | Description |
|------|-------|-------------|
| 1 | Inventory Imbalance | Too many of the wrong parts and not enough of the right ones. No visibility into the inventory you actually have. |
| 2 | Spend Leakage | Maverick, rogue buying. Tail spend and supplier consolidation opportunities. No contract adherence. |
| 3 | Downtime Risk | Critical parts aren't there when needed. Stockouts causing production delays and emergency purchases. |

---

## Step 2: Your Profile
**Title:** "Tell us about your operation"
**Note:** Required fields are marked with a red dot. Defaults are industry benchmarks.

### Core Information (Always Shown)

| Field | Type | Required | Placeholder / Default | Notes |
|-------|------|----------|----------------------|-------|
| Industry | Dropdown | Yes | "Select your industry..." | Options: Power & Energy, Water & Wastewater, Chemicals, Oil & Gas, Mining & Materials, Pulp & Paper, Food & Beverage, Metals & Steel, Cement & Building Materials, Automotive & Manufacturing, Pharmaceuticals, Transportation & Logistics, Other |
| Sites | Number | Yes | e.g. 6 | Number of operational sites |

### Inventory Profile (Shown if "Inventory Imbalance" or "Spend Leakage" selected)

| Field | Type | Required | Placeholder / Default | Notes |
|-------|------|----------|----------------------|-------|
| On-Hand Inventory Value | Currency ($) | Yes | e.g. 40,000,000 | Minimum $1,000 to validate |
| Number of On-Hand SKUs | Number | Yes | e.g. 12,000 | |

#### Inventory Mix (Optional sub-section, must total 100%)

| Field | Type | Required | Default | Notes |
|-------|------|----------|---------|-------|
| Active & Slow | Percentage (%) | No | 67% | |
| Non-Moving / Obsolete | Percentage (%) | No | 23% | |
| Special Items | Percentage (%) | No | 10% | |

If percentages don't total 100%, user is prompted to continue with defaults (67% / 23% / 10%).

### Spend Profile (Shown if "Spend Leakage" selected)

| Field | Type | Required | Placeholder / Default | Notes |
|-------|------|----------|----------------------|-------|
| Annual MRO Replenishment Spend | Currency ($) | Yes | e.g. 14,000,000 | Warning if outside 35–75% of inventory value |
| Average Holding Cost Rate | Percentage (%) | No | 15% | % of inventory value per year |
| Weighted Avg. Cost of Capital (WACC) | Percentage (%) | No | 7% | |

### Downtime Profile (Shown if "Downtime Risk" selected)

| Field | Type | Required | Placeholder / Default | Validation / Hints |
|-------|------|----------|----------------------|-------------------|
| Unplanned Downtime Hours (Avg Per Site) | Number | Yes | e.g. 400 | Suggested range: 300–1,200 hrs/year. Warning if outside range. |
| Downtime Cost/Hr Per Production Unit (Avg Per Site) | Currency ($) | Yes | e.g. 6,000 | Suggested range: $5,600–$22,000/hr. Warning if outside range. |
| Current Service Level — Critical Spares | Percentage (%) | No | 88% | Minimum: 75% |
| Desired Service Level — Critical Spares | Percentage (%) | No | 95% | Maximum: 98% |
| % Downtime Attributed to Stockouts | Percentage (%) | No | 50% | Maximum: 50% |

---

## Lead Capture Form (Blur Gate)
**Title:** "Access Your Full AI MRO Optimization Analysis"
Results are shown blurred behind this form. Completing the form reveals full results.

| Field | Type | Required | Placeholder |
|-------|------|----------|-------------|
| First Name | Text | Yes | First name |
| Last Name | Text | Yes | Last name |
| Business Email | Email | Yes | Business email |
| Company | Text | Yes | Company |
| Function | Dropdown | Yes | Select your function |

**Function Options:**
- Procurement
- Innovation
- IT / IS
- Finance
- Sourcing
- Maintenance
- Manufacturing
- Supply Chain
- Operations
- Other

**Submit Button:** "Get My Full AI Analysis"
**Privacy Note:** "We respect your privacy. No spam."

---

## Results Page Sections
Results are organized by the pain points selected in Step 1:

| Pain Point Selected | Results Section Title |
|--------------------|----------------------|
| Inventory Imbalance | MRO Inventory Optimization |
| Spend Leakage | Spend Reduction / Avoidance |
| Downtime Risk | Downtime Avoidance |

### Chart
A waterfall bar chart showing the inventory reduction journey from "Now" through each optimization step to a "Target" bar (Month 12 optimal on-hand inventory), with a target icon (🎯) above the final bar.

### CTAs
- "Talk to an MRO Expert" → verusen.com/talk-to-an-mro-expert/
- "Explore the AI" → verusen.com/ai-agent-explainability-for-mro-inventory-optimization/
