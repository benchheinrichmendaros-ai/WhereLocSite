# WhereLoc — setup guide

Plain HTML/CSS/JS, no build step. Backend is Supabase (Postgres + Auth +
Storage + one Edge Function). Map picker is Leaflet + OpenStreetMap (free,
no API key).

## 1. Create your Supabase project

1. Go to supabase.com → New project (free tier is enough to start).
2. Wait for it to finish provisioning (~2 minutes).
3. Project Settings → API → copy the **Project URL** and **anon public** key.

## 2. Set up the database

In the Supabase dashboard, open **SQL Editor → New query**, and run these
three files **in this exact order** (each one depends on the last):

1. `supabase/schema.sql` — creates the 6 tables
2. `supabase/rls_policies.sql` — locks down who can read/write what
3. `supabase/storage.sql` — creates the photo/avatar storage bucket

Paste each file's contents in, click Run, then move to the next file.

## 3. Plug in your keys

Open `config.js` and replace the two placeholders:

```js
export const SUPABASE_URL = "https://YOUR-PROJECT-REF.supabase.co";
export const SUPABASE_ANON_KEY = "YOUR-ANON-PUBLIC-KEY";
```

That's the only file with environment-specific values.

## 4. Deploy the rate-limit Edge Function

This needs the [Supabase CLI](https://supabase.com/docs/guides/cli):

```bash
npm install -g supabase
supabase login
cd whereloc                       # this project's root folder
supabase link --project-ref YOUR-PROJECT-REF
supabase functions deploy rate-limit
```

No secrets to set manually — `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`
are injected automatically into every deployed Edge Function. The function
URL will be:

```
https://YOUR-PROJECT-REF.supabase.co/functions/v1/rate-limit
```

`config.js` builds this URL from `SUPABASE_URL` automatically — you don't
need to paste it in separately.

## 5. Run it locally

Browsers block ES module imports from `file://` URLs, so use a local
server instead of double-clicking index.html:

```bash
cd whereloc
python3 -m http.server 8000
# open http://localhost:8000
```

## 6. Deploy to GitHub Pages

1. Push this folder to a GitHub repo.
2. Repo → Settings → Pages → Source: deploy from branch → `main`, folder `/ (root)`.
3. Your site will be live at `https://your-username.github.io/your-repo/`.

## 7. (Optional) Seed a few Staff Pick spots

So the app isn't empty on day one:

1. Sign up through the deployed app once, finish username setup.
2. In SQL Editor: `select id, username from public.users;` — copy your id.
3. Open `supabase/seed.sql`, replace `YOUR-USER-ID-HERE`, adjust the
   coordinates to your campus, and run it.

## Moderating reports

Reports are intentionally **not readable** through the app's anon key —
there's no select policy for them at all (see `rls_policies.sql`). To
review them: Supabase dashboard → Table Editor → `reports` table. The
dashboard uses your login, not the anon key, so RLS doesn't apply there.

## Where to edit things

| Want to change...              | Edit this file                       |
|---------------------------------|---------------------------------------|
| Colors, fonts, spacing          | `theme.css`                          |
| Categories, age tags, limits    | `config.js`                          |
| Profanity blocklist             | `js/utils/profanity.js`              |
| Rate limits (how many/how often)| `supabase/edge-functions/rate-limit/index.ts`, then redeploy |
| Page layout/copy                | the individual `.html` file          |
| Shared UI piece (card, navbar)  | the matching file in `/components`   |

## Known limitations (MVP tradeoffs, worth knowing about)

- **Profanity filter** is a small client-side blocklist — easy to get
  around on purpose. It's a light first line of defense, not real
  moderation. The report button + Table Editor review is the real backstop.
- **Email confirmation**: whether signup requires clicking a confirmation
  link depends on your Supabase project's Auth settings (Authentication →
  Providers → Email). The signup page handles both cases, but you may
  want to customize the confirmation email template (Authentication →
  Email Templates) to match WhereLoc's branding.
- **Admin role**: there's no in-app admin panel. Moderation happens via
  the Supabase dashboard directly. If this grows, the cleanest next step
  is a `role` column on `users` plus an admin-only page gated on it.
- **EXIF stripping** happens by re-encoding through `<canvas>`, which also
  recompresses the image — a deliberate tradeoff (smaller uploads, no
  dependency on a metadata-parsing library), but it means re-uploaded
  photos won't be byte-identical to the originals.
