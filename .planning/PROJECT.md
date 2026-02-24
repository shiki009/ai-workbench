# Ghost Network

## What This Is

An interactive map dashboard that visualizes urban decline signals across Estonia. Instead of showing where people go, Ghost Network shows where they stopped going — business closures, growing tax debts, declining reviews, emptying neighborhoods. The invisible patterns of retreat, made visible. Built for real estate investors who need leading indicators of area decline before prices reflect it.

## Core Value

Show where neighborhoods are dying before anyone else sees it — giving investors and decision-makers a data advantage that doesn't exist anywhere else.

## Requirements

### Validated

(None yet — ship to validate)

### Active

- [ ] Interactive map of Estonia with area-level decline indicators
- [ ] Business closure tracking from Estonian Business Registry (Ariregister)
- [ ] Tax debt trend tracking from Estonian Tax Board (public data)
- [ ] Google Places review/activity decline detection
- [ ] Click any zone to see detailed decline signals and data
- [ ] Signal dashboard with decline metrics per area
- [ ] Subscription model for detailed data access
- [ ] Historical data accumulation (the moat — data grows over time)
- [ ] Property transaction data integration from Land Board (Maa-amet)

### Out of Scope

- Consumer/renter-facing features — investors first, consumers later
- Municipality/government sales — slow sales cycle, defer to v2
- Prediction engine / ML forecasting — v1 shows signals, not predictions
- Mobile app — web-first
- API product — build the dashboard first, API later
- Areas outside Estonia — Estonia only for v1
- Real-time data — batch processing is fine for v1 (daily/weekly updates)

## Context

Estonia is uniquely suited for this product:
- Business tax debts are **public data** (Maksu- ja Tolliamet)
- Business registry (Ariregister) has detailed opening/closing data with API access
- Land Board (Maa-amet) provides property transaction data
- Small country (1.3M people) means achievable full coverage
- Highly digital society with accessible public data infrastructure
- Real estate market is active with both local and international investors

No existing product tracks the "negative space" of urban activity — where people and businesses are leaving. Current tools (Google Maps, real estate portals) show what IS, not what's disappearing. Ghost Network fills this gap.

The existing codebase has a Vite + vanilla JS setup that can be adapted. The AI/ML worker infrastructure from the previous project is not needed, but the build tooling, event system, and general architecture patterns are reusable.

## Constraints

- **Tech stack**: Web-based (Vite + JS), map visualization library needed (Mapbox/Leaflet/MapLibre)
- **Data access**: Must rely on publicly available Estonian data — no private/paid data sources for v1
- **Geography**: Estonia only — all data sources and business logic scoped to Estonian registries
- **Backend**: Will need a lightweight backend or serverless functions for data aggregation and API calls to Estonian registries
- **Legal**: Public data usage must comply with Estonian data protection (GDPR) — aggregate and anonymize where required

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Estonia-first | Small market = achievable coverage, public data access, local knowledge moat | — Pending |
| Real estate investors as primary customer | High willingness to pay, clear value proposition, B2B pricing | — Pending |
| Subscription monetization | Recurring revenue, data gets more valuable over time, aligns with moat | — Pending |
| Ghost Network as name | Evocative, memorable, captures the "invisible patterns" angle | — Pending |
| Map + dashboard as v1 format | Visual, intuitive, the "holy shit" moment is seeing the map | — Pending |

---
*Last updated: 2026-02-24 after initialization*
