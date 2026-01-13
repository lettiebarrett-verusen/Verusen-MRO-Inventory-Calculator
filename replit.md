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

### Development Tools
- Replit-specific Vite plugins for development experience
- Custom meta images plugin for deployment URL handling