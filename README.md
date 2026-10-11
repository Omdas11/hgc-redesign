# Haflong Government College — Concept Redesign (Demo)

A modern concept redesign of the Haflong Government College website
(haflonggovtcollege.ac.in), built as a **showcase demo** — all copy is written
fresh; only public facts (founding date, departments, contact details,
accreditation) are carried over.

## Stack

- **Frontend:** static HTML + CSS + vanilla JS (no build step)
- **Hosting:** Vercel (deploys straight from this repo)
- **Backend:** Supabase (Postgres + Storage, free tier)
  - `hgc_notices` — notice board (public read)
  - `hgc_departments` — 13 departments (public read)
  - `hgc_messages` — contact form inbox (public insert only, via RLS)
  - `hgc-files` — public storage bucket for notice PDFs / images

## Structure

```
site/
  index.html        # hero, notice ticker, announcements, principal, facilities
  about.html        # history, milestones, vision/mission
  departments.html  # live grid from Supabase (filter by stream)
  admissions.html   # process steps, programme table
  notices.html      # filterable notice board from Supabase
  facilities.html   # library, hostels, labs, sports, culture
  iqac.html         # NAAC journey, IQAC, cells & committees
  contact.html      # contact form -> Supabase
  css/style.css     # design system: pine + gold + ivory
  js/config.js      # public Supabase anon config (RLS-protected)
  js/app.js         # nav, ticker, notices, departments, contact form
supabase/
  schema.sql        # tables, RLS policies, seed data
```

## Deploy

Push to `main` — Vercel auto-deploys the `site/` directory as the web root
(configured via `vercel.json`).

## Notes for the college

- This is a **demo**, clearly badged as a concept redesign in the footer.
- To go live officially, the college would point its domain at the Vercel
  project and take over the Supabase project (or a fresh one) for its own data.
