# Meridian School of Business — MBA University Website

A React 19 + TypeScript university site with a WebGL hero, a fully data-driven
front end, an admissions chatbot, and an admin panel that can create, edit and
delete every piece of content without anyone touching code.

```bash
npm install
npm run dev          # http://localhost:5173
```

It runs immediately on bundled seed content. Connect Supabase (five minutes,
below) to turn the admin panel from read-only into a working CMS.

---

## What is here

| Route | Page |
|---|---|
| `/` | 3D hero, stat strip, programme grid, why-us, placements teaser, alumni carousel, latest news, CTA |
| `/programs` | All specialisations with live search and department filter |
| `/programs/:slug` | Overview, semester curriculum, fees, eligibility, careers, teaching faculty |
| `/admissions` | Six-step process, eligibility, dates, fee table, scholarships, application form, FAQ |
| `/faculty`, `/faculty/:slug` | Filterable directory and profile pages |
| `/placements` | Animated stats, six-year SVG chart, sector split, recruiter marquee |
| `/campus` | Facilities, mosaic gallery with keyboard-navigable lightbox, student life |
| `/news`, `/news/:slug` | Category-filtered newsroom with reading-progress bar |
| `/about`, `/contact` | Story, milestones, leadership, alumni; contact form and map |
| `/admin/**` | The CMS — see below |

---

## Architecture, in one paragraph

Nothing user-facing is hardcoded in JSX. Every page reads from a
`ContentSnapshot` provided by [`src/context/ContentProvider.tsx`](src/context/ContentProvider.tsx),
which gets its data from [`src/lib/repository/`](src/lib/repository/). The
repository has two modes: without Supabase credentials it serves the bundled
content in [`src/data/`](src/data/); with them it reads and writes Postgres. No
page or component knows which mode it is in. That is why adding a programme in
the admin panel makes it appear on the home grid, in the navbar dropdown, on
`/programs`, at its own `/programs/<slug>` URL, and in the chatbot's answers —
all without a code change.

Every content table is `(id, sort_order, updated_at, data jsonb)`. Keeping the
record in a single `jsonb` column is deliberate: adding or renaming a field on a
programme needs no migration.

---

## Supabase setup (five minutes)

Without this the site works but nothing can be saved.

**1. Create a project** at [supabase.com](https://supabase.com) — the free tier
is sufficient.

**2. Run the schema.** Dashboard → SQL Editor → New query → paste all of
[`supabase/schema.sql`](supabase/schema.sql) → Run. This creates the twelve
tables, their indexes, row-level security policies, and the public `media`
storage bucket. It is idempotent — running it twice is harmless, so an existing
install should re-run it to pick up the `submissions` table.

**3. Add your credentials.** Dashboard → Settings → API, then:

```bash
cp .env.example .env.local
```

```env
VITE_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOi...
```

Restart the dev server — Vite only reads env files at startup.

> The anon key is safe in a browser bundle. Row-level security in `schema.sql`
> is what actually gates writes: anyone may read, only an authenticated user may
> write. `submissions` is the one exception and runs the other way round —
> anyone may insert a form response, only an authenticated user may read one.

**4. Create your administrator.** Dashboard → Authentication → Users → **Add
user**. Set an email and password.

Then, importantly: Authentication → Providers → Email → turn **off** "Enable
sign-ups". There is no sign-up form in this app, but leaving self-registration
enabled at the Supabase level would let anyone create an account that can edit
the site.

**5. Load the starting content.** Sign in at `/admin` and press **Seed
database** on the dashboard. It copies the bundled content into any table that
is currently empty, and never overwrites existing rows.

---

## The admin panel

Sign in at [`/admin`](http://localhost:5173/admin).

- **Dashboard** — item counts per collection, quick actions, database seeding,
  and a banner when submissions are waiting.
- **Enquiries & applications** — everything sent through the two public forms.
  See below.
- **Ten content collections** — programmes, faculty, news, testimonials,
  recruiters, placement trend, facilities, gallery, FAQs, leadership. Each has
  create, edit, delete, search, and move-up/move-down ordering that controls the
  order shown publicly.
- **Site settings** — institution name, tagline, description, accreditations,
  full contact details. These feed the navbar, footer, contact page, document
  titles and the chatbot.
- **Media library** — drag-and-drop image upload to Supabase Storage, with
  copy-URL and delete. Any image field in the editor also has an inline upload
  button.

Delete is always two-step. Slugs are validated for format and uniqueness before
saving, because a duplicate would make one of the two pages unreachable.

### Enquiries and applications

The application form on `/admissions` and the contact form on `/contact` both
write to a `submissions` table, readable at
[`/admin/submissions`](http://localhost:5173/admin/submissions).

The inbox filters by status (new / read / archived) and type, searches across
every field, and exports the current filtered view to CSV. Opening a submission
marks it read, the way a mail client would. There is no editor: a submission is
a record of what somebody actually typed, so it can be triaged and deleted but
not rewritten.

Two things about this table differ from the content collections, both
deliberate:

- **The security policy is inverted.** Content is world-readable and
  admin-writable; a submission is the reverse — `anon` may `INSERT` and nothing
  else, and only an authenticated administrator may `SELECT`, `UPDATE` or
  `DELETE`. A public read policy here would expose the contact details of every
  applicant. It is also why the insert in
  [`src/lib/forms.ts`](src/lib/forms.ts) does not chain `.select()`: asking for
  the row back would be rejected by the very policy that protects it.
- **It is not part of the content snapshot.** `ContentProvider` loads on every
  visitor's first paint, and applicant data has no business being in that
  payload. The inbox loads separately, from inside the admin session, via
  [`src/hooks/useSubmissions.ts`](src/hooks/useSubmissions.ts).

Because `anon` can insert, the table is a spam target. `schema.sql` applies
cheap structural guards — reference format, payload must be a JSON object, must
carry an `email` key, 8 KB ceiling — which stop junk rows but are not rate
limiting. For a site taking real traffic, add Supabase's abuse protection or put
a CAPTCHA in front of the forms.

Without Supabase configured both forms keep their previous behaviour: they
validate, simulate the round-trip and log the payload to the console, so the
demo deploy still works end to end. The inbox says so explicitly rather than
showing an empty list and implying nobody has applied.

### Adding a field to a collection

Add one entry to the relevant schema in
[`src/lib/admin/schemas.ts`](src/lib/admin/schemas.ts):

```ts
{ key: 'brochureUrl', label: 'Brochure PDF', type: 'url', half: true }
```

The form control appears, saving works, and no migration is needed. Field types
available: `text`, `textarea`, `number`, `email`, `url`, `date`, `select`,
`image`, `list` (one per line), `paragraphs` (blank-line separated) and
`semesters` (nested repeater).

---

## The chatbot

The floating assistant answers from the same live `ContentSnapshot` the pages
render from. There is **no API key and no network call** — which also means it
cannot invent a fee or a deadline that is not on the site.

Two stages, in [`src/lib/chatbot/engine.ts`](src/lib/chatbot/engine.ts):

1. **~25 hand-written intents** for the questions visitors actually ask —
   programmes, fees, eligibility, entrance exams, deadlines, the application
   process, scholarships, loans, placements, recruiters, individual faculty by
   name, hostels, campus, news, contact, rankings, alumni, seat counts,
   international applicants, and "which programme should I choose".
2. **Scored retrieval** across every programme, faculty profile, news article,
   FAQ, facility and testimonial when no intent fires.

If neither produces a confident match it says so and points at admissions,
rather than guessing. Off-topic questions are declined by design.

### English and Hinglish

"Fees kitni hai", "admission kaise le", "hostel milega kya" and "kaunsa
programme lena chahiye" all work, and are answered in Hinglish.
[`src/lib/chatbot/hinglish.ts`](src/lib/chatbot/hinglish.ts) does this in two
separable halves:

- **Understanding** — a Hinglish lexicon rewrites the query into English
  *additively* before intent matching, because real questions are usually half
  English already ("MBA ki fees kya hai"). Intent triggers therefore only ever
  have to be written in English.
- **Answering** — the matched intent's prose is re-rendered in Hinglish, while
  figures, dates, programme titles and people's names are left exactly as they
  are. Intents without a Hinglish rendering keep their English body and gain a
  Hinglish opening line; an honest partial beats a mangled fee table.

Language detection deliberately ignores words that are common in both languages
("me", "the", "to", "par"), so a plain English question is never answered in
Hinglish.

```bash
npm run check:chatbot     # 53 assertions: 30 English, 19 Hinglish, 4 scope-guard
```

Extend it by adding an intent to the `intents` array, an optional Hinglish
renderer keyed by that intent's id, and a case to
[`scripts/chatbot-check.ts`](scripts/chatbot-check.ts). The trigger matching is
subtle enough — see the comment on `hasAny` in
[`src/lib/chatbot/text.ts`](src/lib/chatbot/text.ts) — that a change fixing one
question routinely breaks another, so run the check.

---

## 3D and performance

The hero is a React Three Fiber scene: a wireframe icosahedron, a mortarboard
built from primitives (no GLTF asset to load), a 900-point particle shell and
pointer-tracked camera parallax.

It is skipped entirely — no WebGL context, and the 945 kB `three` chunk never
downloads — when any of these is true:

- the viewport is 768 px or narrower,
- the device has no fine pointer (`hover: none`),
- the visitor has "reduce motion" enabled.

Those visitors get [`HeroFallback`](src/components/three/HeroFallback.tsx), a
pure CSS/SVG rendition of the same composition. Everywhere below the hero, depth
comes from pointer-tracked CSS tilt and scroll reveals rather than WebGL.

Reduced motion is honoured twice over: globally in CSS, and in JS so components
skip animation setup rather than running it instantly.

---

## Commands

```bash
npm run dev             # dev server
npm run build           # typecheck + production build
npm run preview         # serve the production build
npm run typecheck       # types only
npm run lint            # oxlint
npm run check:chatbot   # chatbot regression suite
npm run check:rls       # row-level security regression suite (needs credentials)
npm run seed            # copy bundled content into an empty database
```

`check:rls` and `seed` talk to the live Supabase project, so they need an
administrator session. Credentials come from the environment, never from a file:

```bash
SUPABASE_ADMIN_EMAIL=you@example.com \
SUPABASE_ADMIN_PASSWORD='…' \
npm run check:rls
```

`check:rls` is worth running after any edit to `supabase/schema.sql`. It proves
against the real database that anonymous visitors can read published content but
not modify it, and can submit a form but not read anybody else's — the failure
mode it guards against is silent, because a policy that is too permissive looks
exactly like one that is correct. Every row it creates is deleted before it
exits.

---

## Deploying

### GitHub Pages (configured)

[`.github/workflows/deploy.yml`](.github/workflows/deploy.yml) builds and
publishes on every push to `main`. Enable it once, under **Settings → Pages →
Source → GitHub Actions**. The site then lives at
`https://<user>.github.io/mba-university/`.

Two pieces make a client-side router survive a static host:

- `base` in [`vite.config.ts`](vite.config.ts) prefixes built asset URLs with
  `/mba-university/`, and `BrowserRouter basename={import.meta.env.BASE_URL}`
  keeps the routes in step — so the same source builds for a sub-path or a
  domain root with no route changes.
- [`scripts/spa-fallback.mjs`](scripts/spa-fallback.mjs) copies `index.html` to
  `404.html` after each build. Pages serves that for any path not on disk, which
  is every deep link here, so `/programs/finance` resolves instead of 404ing.

Supabase credentials are optional in CI — without them the deployed site runs on
bundled seed content and the admin panel is read-only. To connect it, add
`VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` under **Settings → Secrets and
variables → Actions**, then re-run the workflow (a secret change alone does not
trigger a build).

### Anywhere else

Any static host works. Build with `BASE_PATH=/ npm run build` when the site is
served from a domain root, set the two Supabase variables in the host's
environment, and add an SPA rewrite:

```
/*    /index.html   200
```

---

## Known items

- **`react-router` advisory GHSA-qwww-vcr4-c8h2** shows in `npm audit`. It
  concerns RSC mode's CSRF handling; this app is a client-side SPA using
  `BrowserRouter` and does not use RSC mode, so it is not exploitable here. The
  suggested `npm audit fix --force` downgrades to 7.11.0 — take it if your audit
  policy requires a clean report.
- **Forms need a database to be useful.** `submitApplication` and
  `submitContact` in [`src/lib/forms.ts`](src/lib/forms.ts) write to the
  `submissions` table and show up at `/admin/submissions`. Without credentials
  they fall back to simulating the round-trip and logging the payload — which is
  what the public demo deploy does, so the form succeeds but nothing is stored.
- **Nobody is notified of a new submission.** They accumulate in the inbox until
  someone opens it. Email or Slack alerts would need a Supabase Database Webhook
  or an Edge Function firing on insert; there is no server in this build to send
  from.
- **Gallery tiles are CSS gradients**, not photographs. Upload real images in
  the media library and swap the `<span>` for an `<img>` in
  [`src/pages/Campus.tsx`](src/pages/Campus.tsx) — the aspect ratio is already
  reserved, so nothing will shift.
- **Content is illustrative.** Meridian School of Business is fictional; every
  name, figure and quotation is placeholder copy, meant to be replaced through
  the admin panel.
