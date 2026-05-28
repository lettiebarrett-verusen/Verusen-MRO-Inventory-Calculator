# MRO Inventory Optimization Calculator

## Overview

This is a lead generation web application for Verusen that helps organizations estimate potential savings from MRO (Maintenance, Repair, and Operations) inventory optimization. Users input their inventory profile data, and the calculator estimates working capital that could be recovered from excess, duplicate, and non-moving inventory. The application captures leads through a gated results flow.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter (lightweight React router)
- **State Management**: TanStack React Query for server state
- **Styling**: Tailwind CSS v4 with shadcn/ui component library (New York style)
- **Forms**: React Hook Form with Zod validation
- **Animations**: Framer Motion
- **Charts**: Recharts for data visualization
- **Build Tool**: Vite

The frontend follows a component-based architecture with:
- Pages in `client/src/pages/`
- Reusable UI components in `client/src/components/ui/`
- Feature-specific components in `client/src/components/` subdirectories
- Business logic and validation schemas in `client/src/lib/`

### Backend Architecture
- **Runtime**: Node.js with Express
- **Language**: TypeScript (ESM modules)
- **API Pattern**: RESTful JSON API under `/api` prefix
- **Development**: tsx for TypeScript execution, Vite dev server for HMR

The server handles:
- Lead submission and storage (`POST /api/leads`)
- Static file serving in production
- Vite middleware integration in development

### Data Storage
- **Database**: PostgreSQL via Drizzle ORM
- **Schema Location**: `shared/schema.ts`
- **Migrations**: Drizzle Kit with `drizzle-kit push` command

Database tables:
- `users`: Basic user authentication (id, username, password)
- `leads`: Lead capture data (name, email, company, role, HubSpot sync status)
- `calculations`: Saved calculator results linked to leads

### Shared Code
The `shared/` directory contains code used by both frontend and backend:
- Database schema definitions
- Zod validation schemas for type-safe API contracts
- TypeScript types inferred from Drizzle schemas

## External Dependencies

### Database
- PostgreSQL database (connection via `DATABASE_URL` environment variable)
- Drizzle ORM for type-safe database queries
- drizzle-zod for automatic Zod schema generation from database schema

### UI Component Library
- shadcn/ui components built on Radix UI primitives
- Full suite of accessible, customizable components
- Tailwind CSS for styling with CSS variables for theming

### Third-Party Integrations (Configured but may need API keys)
- HubSpot CRM integration for lead syncing (status tracked in database)
- OpenGraph meta tags for social sharing

#### HubSpot Notes & PDF Attachments on Contacts
When a lead is captured, the backend creates a HubSpot Contact and attaches a Note with the full text of the calculator report (all selected pain points, all inputs, every bucket breakdown, and the grand total). The branded PDF report is also uploaded via the HubSpot Files API and attached to the contact as a second Note with `hs_attachment_ids` set, so reps can open the same one-pager the prospect downloaded.

The text-note step uses the standard `crm.objects.contacts.write` and `crm.objects.notes` scopes already granted via the Replit HubSpot connector.

The PDF upload step requires the **`files`** scope, which is **not** included in the default Replit OAuth grant. To enable PDF attachments, create a HubSpot Private App with `files` + `crm.objects.contacts.read/write` + `crm.objects.notes` scopes and set `HUBSPOT_ACCESS_TOKEN` in the environment. Without that token, PDF upload fails silently (logged server-side as `Files API 403`) while the rest of the flow continues to work.

### URL Parameters (for ABM Campaigns)
The calculator supports URL query parameters for embedding on industry-specific landing pages:
- `?industry=<slug>` — pre-selects industry on Step 1 (slugs include: `food-beverage`, `oil-gas`, `pharma`, `manufacturing`, `mining`, `aerospace`, `chemicals`, `construction`, `energy`, `industrial`, `transportation`)
- `?campaign=<name>` — tags lead in HubSpot with `lead_source_campaign` property for campaign attribution

Example: `https://verusenai-mro-inventory-calculator.onrender.com/?industry=food-beverage&campaign=fb-q2-2026`

To add new campaign attribution, create a custom HubSpot property `lead_source_campaign` (single-line text). The integration silently falls back if the property doesn't exist.

### Development Tools
- Replit-specific Vite plugins for development experience
- Custom meta images plugin for deployment URL handling