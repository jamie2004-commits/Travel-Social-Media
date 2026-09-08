# Travel Social Media — implementation guide

Implementation roadmap · 8 September 2026. Current implementation is limited to a browser prototype of the interactive flat world map within the planning/wireframe documents. Commands below describe future full-application work; they have not been run to scaffold or deploy that application. Provider interfaces and versions can change; use the linked official documentation when executing each stage.

## 1. Architecture in plain language

The website and phone app are two interfaces to the same account and database. Supabase Auth identifies the person. PostgreSQL stores trips, stops, relationships, and photo metadata. Supabase Storage holds photo files. Database and storage policies decide what that person can access. Trusted server operations handle copying itineraries, moderation, and expensive tasks. A background worker processes photo batches and AI suggestions so uploads do not depend on a long browser request.

```text
Browser: Next.js on Vercel          iOS / Android: Expo via EAS
             |                               |
             +------ Supabase Auth ----------+
             +------ scoped data API --------+
                            |
                PostgreSQL + row policies
                Private Storage + policies
                            |
          trusted commands / queue / job records
                            |
       media processing worker -> optional vision provider
                            |
        reviewed suggestions -> confirmed trip updates
```

Use shared TypeScript schemas and business rules, not a forced shared UI for every screen. Public pages can be rendered on the server for sharing and discovery; private requests must be scoped to the current authenticated user and excluded from shared caches.

## 2. Services to use and how they connect

| Need | Proposed tool | Connection and responsibility |
| --- | --- | --- |
| Source control | Existing GitHub repository | Version documents, migrations, app code, and release records |
| Website | Next.js + TypeScript | Vercel builds `apps/web`; website connects to Supabase using URL and publishable key |
| Native apps | Expo + React Native + Expo Router | `apps/mobile` uses the same Supabase project; EAS creates store binaries |
| Database/auth/storage | Supabase | One shared backend per environment; separate development and production projects |
| Web hosting | Vercel | Import GitHub repository, choose web root, set environment variables, configure domain |
| Background work | Trigger.dev, introduced with photo processing | Server submits authorised job IDs; worker reads private source files and writes results |
| Profile world map | Flat country-boundary graphic with interactive country selection | Match stable country IDs to visited records; colour selected countries and offer equivalent searchable checkboxes |
| Detailed trip maps | MapLibre GL JS / MapLibre React Native | Separate client renderers use a compatible licensed map style and tile provider |
| Tiles/geocoding | MapTiler candidate | Restricted client token for map display; server credentials where required; check quotas and data storage rights |
| Transactional email | SMTP provider selected before beta | Configure Supabase SMTP and verified sending domain; monitor delivery |
| AI scene recognition | Provider selected after benchmark | Server-only integration; send approved images, validate candidate output, apply quota |
| Notifications | In-app database inbox first | Add native push via Expo after device and permission tests |
| Monitoring | Structured logs initially | Add error reporting/metrics when deploying; redact tokens, private text, and photo metadata |

Next.js can be deployed to Vercel; Expo EAS supports native build/distribution workflows. See [Vercel Next.js](https://vercel.com/docs/frameworks/full-stack/nextjs), [Expo distribution](https://docs.expo.dev/distribution/introduction/), and [Expo Supabase setup](https://docs.expo.dev/guides/using-supabase/).

MapLibre supplies rendering, not a free production tile/geocoding service. Native integration needs a compatible Expo development build and library versions. See [web renderer](https://maplibre.org/maplibre-gl-js/docs/), [native setup](https://maplibre.org/maplibre-react-native/docs/setup/getting-started/), and [MapTiler offerings](https://www.maptiler.com/cloud/pricing/).

## 3. Prepare accounts and the development machine

1. Keep the existing repository; do not initialise or clone over it again. Agree a Git author identity and use repository-local configuration if needed.
2. Install a supported Node.js LTS release, Git, an editor, and a package manager. Check the current Next.js and Expo requirements before choosing exact versions. Commit the lockfile.
3. Create Supabase, Vercel, and Expo accounts under project ownership. Use individual team access rather than shared passwords. Add Apple/Google developer accounts when native distribution is ready.
4. Install Docker if using the Supabase local stack. On Windows, use Android tooling or a physical Android device; iOS device testing and EAS cloud builds can be used without a local iOS simulator.
5. Create a development backend first. Use separate production credentials and non-production data in previews. Select a region based on initial users; the founder is in Singapore but the product audience is international.
6. Record account owners, recovery contacts, billing notifications, and monthly budget. No paid plan or new account is created by this planning deliverable.

## 4. Future repository layout

```text
apps/web/                 Next.js pages and server routes
apps/mobile/              Expo screens and device integrations
packages/domain/          shared models, validation, permissions contracts
packages/api-client/      typed API calls and query keys
packages/design-tokens/   colour, spacing, typography constants
supabase/migrations/      versioned tables, indexes, policies, functions
supabase/tests/           cross-user access tests
workers/                  resumable media and AI jobs
docs/                     product, wireframes, architecture decisions
.github/workflows/        checks and controlled deployment workflows
```

Start with package-manager workspaces; a build orchestrator is optional. Use native platform components where photo permissions, maps, keyboard handling, or navigation need different behaviour.

Example scaffold sequence, to execute only in the implementation phase:

```powershell
# From the existing repository root; choose options compatible with workspaces.
npx create-next-app@latest apps/web --typescript --eslint --app
npx create-expo-app@latest apps/mobile
npx supabase init
# Requires a supported local container runtime.
npx supabase start
```

Then configure a private root workspace manifest, shared package imports, project scripts, and per-app environment examples. Install Supabase packages in the correct app workspace following its official guide. Confirm each scaffold runs before combining dependencies. Do not assume these commands alone create the shared architecture. [Next.js installation](https://nextjs.org/docs/app/getting-started/installation).

## 5. Connect Supabase, step by step

1. Create a development project in the dashboard; retain its database password in a password manager. Copy the project URL and publishable key from the project connection settings.
2. Add the browser-safe variables below to the web local environment file and corresponding mobile environment. Put names and placeholders in `.env.example`; ignore actual local environment files in Git.
3. Add `@supabase/supabase-js` to both clients. For Next.js server rendering, follow the current `@supabase/ssr` cookie/session pattern; do not reuse one user's server client across requests. For Expo, use the documented persistent-session adapter and app-state refresh behaviour.
4. Configure permitted web redirects for localhost and production, plus mobile deep links for email callbacks. Avoid broad production wildcard redirects. Treat preview authentication as a development-environment concern.
5. Create the schema through migrations; enable row-level security and least-privilege grants before adding user data. Exposed tables need policies for every intended operation.
6. Create private original-photo and derivative buckets with file-size/type restrictions. Relate object keys to photo records so access follows the parent trip.
7. Test sign-up, verification, sign-in, sign-out, recovery, session refresh, and callback failure using two unrelated accounts.
8. Generate database types after migrations and use them in shared packages. Keep development and production migrations in the same ordered history.

```dotenv
# Website: values intentionally available to the browser
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=YOUR_PUBLISHABLE_KEY

# Expo: values intentionally embedded in the installed app
EXPO_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY=YOUR_PUBLISHABLE_KEY

# Trusted runtime only: never NEXT_PUBLIC_* or EXPO_PUBLIC_*
SUPABASE_SERVICE_ROLE_KEY=SERVER_ONLY_IF_REQUIRED
VISION_API_KEY=SERVER_ONLY_IF_ENABLED
```

The variable names are this project's proposed convention. Public keys identify the project; they are safe only with correct access rules. Administrative/service credentials bypass normal policies and must stay on trusted servers. See [Supabase Next.js guide](https://supabase.com/nextjs), [Expo quickstart](https://supabase.com/docs/guides/getting-started/quickstarts/expo-react-native), and [row-level security](https://supabase.com/docs/guides/database/postgres/row-level-security).

## 6. Database blueprint

Use UUID primary keys, timestamps, foreign keys, explicit deletion rules, and constrained enums/status values. This is a logical design, not executable migration SQL.

| Table | Important fields / relationships | Rules |
| --- | --- | --- |
| profiles | user_id → auth.users, handle, display_name, bio, avatar_key, is_private | Unique normalised handle; exclude private account settings from public profile reads |
| user_settings | user_id, defaults, notification preferences | Owner only |
| follows | follower_id, followed_id, state, created_at | Unique pair; no self-follow; private follows need acceptance |
| blocks | blocker_id, blocked_id | Unique pair; enforce both directions in social reads |
| trips | owner_id, title, cover_photo_id, lifecycle, visibility, start/end, date_precision | Owner edits; visibility separate from lifecycle; validate date order |
| trip_destinations | trip_id, country_code, city_id, position | Multiple countries per trip |
| trip_days | trip_id, position, local_date, timezone | Unknown dates allowed; stable ordering |
| trip_stops | day_id, place_id, planned_time, actual_time, state, notes, position | Planned/visited/skipped separated; private notes stored separately if sharing differs |
| places | internal_id, source, source_id, name, coordinates, country_code, category | Canonical IDs; provider terms govern persisted fields |
| visits | owner_id, trip_id optional, place_id optional, country_code, precision, provenance | Manual backfill supported; deduplicate aggregates rather than all visits |
| photos | trip_id, owner_id, object_key, capture_time, timezone, place_id, caption, state, checksum | Ownership plus parent access; upload state machine; no public raw EXIF |
| photo_metadata | photo_id, raw_exif_reference, original coordinates/time | Owner/worker only; never expose via public photo query |
| reconstruction_jobs | owner_id, trip_id, status, stage, progress, idempotency_key | Owner observes; worker performs state transitions |
| location_suggestions | photo_id, job_id, candidate_place_id, evidence, confidence, decision | Confirm/change/reject; version guards protect manual edits |
| presence | user_id, country_code, audience, starts_at, expires_at, updated_at | At most one active status; expiry enforced in every query |
| feed_events | actor_id, trip_id, kind, created_at | Reference source objects; recheck current visibility when reading |
| trip_likes / trip_comments | user_id, trip_id, text for comments | Unique likes; comments inherit trip audience |
| saved_trips | user_id, source_trip_id | Bookmark access still follows source visibility |
| trip_copies | new_trip_id, source_trip_id nullable, source_version, attribution | New independent itinerary; no copied source photo ownership |
| reviews | author_id, place_id, trip_stop_id optional, visit_period, rating, text, context | Author edits; one active review per chosen author/place/visit rule |
| review_votes | review_id, user_id | Unique helpful vote per person |
| guides | slug, country_code, topic, body, sources, last_checked_at, state | Draft/review/published; editorial history |
| questions / answers | author_id, destination/topic, body, state | Moderate user content; references for factual claims |
| guide_saves / answer_votes | user_id, target_id | Unique pair |
| badges / user_badges | rule_key, version, user_id, awarded_at | Awards recalculable; unique user/badge/rule version |
| notifications / device_tokens | recipient_id, source_ref, read_at / token, platform | Recipient only; invalidate revoked devices |
| reports / moderation_actions | reporter, typed target, reason / moderator, action | Reports private; trusted role for moderation; audit trail |
| exports / deletion_requests | user_id, state, expiry, object_key optional | Owner requests; background execution and retention policy |
| groups / memberships / events / event_rsvps | owner, group, member roles, meeting data | P5; private membership and event visibility |

Prefer concrete foreign-key tables over unconstrained generic target IDs. Where typed references are needed, constrain exactly one target or validate through a trusted command. Plan indexes for `(owner_id, updated_at)`, `(trip_id, position)`, `(followed_id, state)`, feed time/cursor, place/country, and job status. Introduce spatial indexes only when geographic queries require them.

## 7. Access model: implement before social features

| Resource | Owner | Accepted follower | Stranger | Blocked account |
| --- | --- | --- | --- | --- |
| Private trip and media | Read/write | No | No | No |
| Followers trip and media | Read/write | Read | No | No |
| Public trip and media | Read/write | Read | Read | Denied when identified |
| Raw photo metadata/private notes | Read/write | No | No | No |
| Presence | Edit | Read if audience allows and active | Read only if public and active | Denied when identified |
| Notifications/export | Read own | No | No | No |
| Reports/admin queue | Own submission acknowledgement | No | No | No |

Public data can still be viewed anonymously; blocking cannot guarantee secrecy for content intentionally made public. Private-account profiles default new content to followers/private. If a user makes the account private, narrow visibility of existing public content in a defined transaction and invalidate caches; do not leave this ambiguous.

Share the access predicate across database reads, object downloads, feeds, search, badges, exports, and notification previews. A service-key server route must independently authorise the requesting user. Use restrictive helper functions carefully to avoid recursive follow policies. Test INSERT and UPDATE checks, not only SELECT. Authorise photo access from the parent trip; storage path ownership alone does not enable followers to view shared photos. [Storage access control](https://supabase.com/docs/guides/storage/security/access-control).

Original photo objects are owner/worker-only, even when a trip is public. Shared viewers receive sanitised derivatives with hidden EXIF removed; derivative access follows the parent trip. Keep originals and derivatives in separately governed buckets to make this boundary explicit. Use authenticated downloads for sensitive originals. Short-lived signed URLs can improve derivative delivery but remain usable until expiry, so choose a small lifetime and document that privacy changes do not retract downloaded files or instantly revoke existing URLs. [Private buckets](https://supabase.com/docs/guides/storage/buckets/fundamentals), [signed URL behaviour](https://supabase.com/docs/guides/storage/serving/downloads).

## 8. Implement the core trip journey

1. Build the shell, auth, empty states, and profile creation with the shared design tokens.
2. Implement trip creation with “Plan a trip” and “Record a past trip”; both write the same model. Allow missing historical dates.
3. Build daily itinerary CRUD, ordered stops, notes, and planned/actual status. Use stable IDs so dragging a stop does not lose attached photos.
4. Build trip detail tabs and visibility editing. Confirm unsaved edits on navigation. Use optimistic updates only with rollback and a visible error.
5. Build the media upload pipeline below; add manual photo date/location correction.
6. Build country/city backfill and map-to-trip navigation. Count visited destinations from confirmed visit records, not future itineraries.
7. Verify a new account can get personal value with no followers and no AI.

### 8.1 Flat profile map and coloured-country showcase

Treat the flat world map as a core deliverable in P1. The current browser prototype should demonstrate an attractive profile showcase with country fills and interactive ticking; it does not require authentication, Supabase, paid map services, or deployment of the full app. Use a flat country-boundary graphic with stable identifiers and responsive sizing. A searchable checkbox list must offer the same selection actions as clicking countries on the map. Native implementation should reproduce this experience with an appropriate vector renderer; use MapLibre separately where detailed trip maps need pan, zoom, tiles, and place layers. The latest flat-map requirement replaces the earlier globe direction.

Acquire a documented licensed country-boundary dataset with stable country/territory identifiers; record attribution, version, and geopolitical display policy. Render the base geometry once and apply per-user visited fills by ID. Restrict map payload to visible country IDs/counts; load permitted trip summaries when a country is selected. Never load private trips into the client and merely hide their pins.

Prototype acceptance: initialise exactly 20 illustrative visited countries—United States; United Kingdom, France, Spain, Portugal, Italy, Germany, Netherlands, Switzerland; Singapore, Malaysia, Thailand, Indonesia, Vietnam, Philippines, Cambodia, Laos; Japan, South Korea, China. Clicking or ticking a country toggles its visited state and updates the colour, checkbox, and distinct-country total together. Unticking restores the unvisited styling. Provide clear visited/unvisited labels and a way to return to the sample selection. Embed actual country boundaries so the map works offline; persist the owner's sample choices in browser-local storage and keep other sample profiles read-only. Derive the clearly labelled sample city total from example city records associated with selected countries; actual product city totals must use separately confirmed city visit records. The prototype's state is a demonstration, while real account persistence and access policies belong to P1.

Extend visits with `visibility`, `note`, `visit_period`, and `source`; use an explicit showcase visibility choice when a private trip produces a country visit. Extend profile settings with showcase colour/theme and optional public-stat controls. Store canonical city IDs to avoid counting alternate spellings twice. Country annotation is one or more visit records/notes, not an irreversible map paint operation. Deleting one of several visits must not clear the country until the last visible visit is removed.

Owner journey: Profile → Edit travel map → select/search country → tick visited → optionally add cities, dates, note, linked trip → preview audience → save → colour and counts update. Visitor journey: Profile → inspect flat world map → select coloured country → view accessible notes/trips → save an itinerary. Share cards render only the selected audience's permitted showcase; they must not reuse owner-only totals.

Add map/list controls, explicit visited/planned legend, keyboard country selection, text statistics, reduced motion, and a readable list if map rendering fails. Test dateline polygons, small countries, disputed boundaries, repeated visits, private-to-public changes, deletion, and mobile touch targets. Use restrained fill animations on user confirmation. Detailed trip-map rendering references: [MapLibre GL JS](https://maplibre.org/maplibre-gl-js/docs/), [native capabilities/setup](https://maplibre.org/maplibre-react-native/docs/setup/getting-started/).

## 9. Media and reconstruction pipeline

Upload sequence: authorise parent trip → reserve a unique photo record → upload to a private object key → verify file existence/type/size → enqueue processing → generate thumbnail/display derivative → mark ready. Use client-generated upload IDs and server uniqueness so retries cannot create duplicate memories. Periodically reconcile abandoned records and orphan objects.

Read EXIF before stripping it from public-facing derivatives. Handle missing metadata, timezone offsets, device clock errors, screenshots, rotated images, unsupported/corrupt files, and HEIC conversion. Local capture time and UTC are not interchangeable. Store uncertainty if the original timezone is unknown. Bound image dimensions and batch concurrency.

Reconstruction sequence: group likely days using metadata → resolve candidate places from GPS where permitted → ask consent for optional image inference → suggest a day/route → show evidence and unresolved items → user confirms → transactionally create/update actual stops. A job can succeed partially. Cancellation should prevent future writes; repeated requests must reuse the same job where appropriate.

AI provider selection is deferred until a small consented benchmark measures location accuracy, abstention on ambiguous images, latency, and cost. Request structured candidate output; reject invalid coordinates/place IDs; treat photo text and metadata as untrusted input. Never infer identity or require face recognition. A proposed confidence score is not calibrated probability unless measured as such.

Use Trigger.dev for resumable tasks when the pipeline needs it. Keep job records in the project database, configure bounded retries, and make every side effect idempotent even if the queue also deduplicates. [Task execution](https://trigger.dev/docs/tasks/overview), [idempotency](https://trigger.dev/docs/idempotency).

## 10. Implement the social loop

1. Add follow requests and a people search that respects blocking and private profile discovery choices.
2. Start the Following feed as a chronological query with cursor pagination. Keep one feed event per meaningful trip update, not one per uploaded image.
3. Add likes/comments with permission checks and rate limits; expose edit/delete/report actions.
4. Add bookmarks and a transactional copy-itinerary command. Copy permitted itinerary fields, shift dates if requested, record attribution, default new trip to private, and never duplicate source media ownership.
5. Add country status with manual selection, audience preview, explicit expiry, and off control. Query by `expires_at > now()` so a delayed cleanup job cannot leave stale presence visible. Do not infer presence from trip dates.
6. Add in-app notifications; push/email are opt-in channels. Recheck source access when opening a notification and omit private details from lock-screen payloads.
7. Add Explore and destination ranking later using visible, moderated content, with Following kept independent of recommendation ranking.

## 11. Reviews, guides, forums, and gamification

Reviews: create canonical places, connect reviews to optional visited stops, add travel-context filters, helpful voting, editing, report controls, and aggregate ratings excluding removed reviews. A public review never grants access to a linked private trip: check source permissions before showing its title, stops, or photos. Publishing review-specific photos requires a separate explicit audience decision and sanitised media copy/reference governed by that review. Keep user-entered reviews distinct from external sources. Google content is not to be scraped or bulk persisted as seed data; an approved integration must satisfy storage, attribution, and map display conditions. A MapLibre map must not silently display Google Places content when Google's terms require a Google map. [Google Places policy](https://developers.google.com/maps/documentation/places/web-service/policies).

Guides: create an editorial template with country, topic, audience, steps, official sources, last checked date, and corrections. Build public readable destination/topic URLs, structured headings, and search. Seed actual useful content through authored research, not fake traveller activity. Forums add questions, answers, votes, accepted answers, reports, anti-spam controls, and moderator tools. Community answers are separate from editorially checked guide content.

Gamification: implement versioned badge rules from visit/trip events; deduplicate awards; recalculate when trips are corrected/deleted. Friend leaderboards require opt-in, block filtering, and stated self-reported totals. Choose a forgiving periodic journal goal rather than a daily travel streak. P5 adds groups, membership approvals, event posts, RSVPs, and group moderation; precise meeting details should follow event visibility.

## 12. Build the native app

1. Reuse domain validation, generated database types, API contracts, and design tokens from the web work.
2. Implement the same five navigation destinations with Expo Router. Port account, trip editing, photos, map, feed, and settings before adding native-only polish.
3. Configure app identity, bundle/package identifiers, URL scheme, icons, splash screen, and environment-specific builds.
4. Request photo access at the point of upload. Explain the benefit and support denied/limited permission. Country presence does not require location permission.
5. Use a development build for native dependencies such as the selected map integration; do not assume Expo Go supports every package.
6. Store sessions with the current documented adapter. Keep server credentials out of the bundle, including build-time configuration.
7. Implement a durable local draft/upload queue, visible pending states, retries, and version-aware conflict handling. Clear private local caches on logout. Offline edits should not overwrite newer server edits silently.
8. Test on physical Android and iOS devices: deep links, email auth, camera roll permissions, background/resume, slow uploads, keyboard, map gestures, and accessibility.

Native offline draft support is a distinct milestone; full offline maps are not assumed and depend on tile licensing and storage cost.

## 13. Deploy the website

1. Create separate Supabase production resources after development migrations and access tests pass.
2. Connect Vercel to the GitHub repository and select `apps/web` as the application root. Configure workspace dependency access, build command, and chosen Node version.
3. Set development/preview variables to non-production backend values. Set production variables to production Supabase values. Put server-only secrets only in trusted runtimes.
4. Run type checks, lint, tests, and a production build in GitHub checks. Do not rely on a framework build to run all checks; current Next.js installation notes specifically separate linting from builds. [Next.js installation](https://nextjs.org/docs/app/getting-started/installation).
5. Apply additive database migrations using a controlled job before releasing code that depends on them. Verify against staging first; never let an arbitrary preview apply production migrations.
6. Deploy a preview; smoke-test two accounts and a private photo. Configure the custom domain and HTTPS when ready.
7. Add the production URL to auth redirects and email templates. Test verification/recovery from the actual deployed site.
8. Publish the approved release, check logs, verify access boundaries, and record the deployed commit. Git pushes and production deployments are separate events; a documentation push does not deploy this app.

Vercel supports Next.js deployment and Git-based workflows; check account suitability before enabling commercial use. [Vercel framework guide](https://vercel.com/docs/frameworks/full-stack/nextjs), [plans](https://vercel.com/docs/plans).

## 14. Build and release mobile apps

1. Link the Expo app to an EAS project and configure development, preview, and production profiles. Set identifiers before store registration.
2. Configure signing credentials through project-owned Apple/Google accounts. Store secrets in EAS/trusted CI, not Git.
3. Build internal preview binaries and test them against staging. Native behaviour must be verified in actual binaries.
4. Prepare store listing text, screenshots, support/privacy links, content reporting, account deletion, data-use disclosures, and reviewer access where required. Verify current store policies at execution time.
5. Build production binaries and submit through EAS Submit or store tooling. Submission does not equal approval or release; complete store review and release controls.
6. Use a staged rollout and monitor auth, uploads, crashes, and API compatibility. Keep older installed app versions working across backend changes.
7. Use EAS Update only for changes compatible with the installed native runtime and applicable store rules. Native dependency changes require a new binary.

Illustrative commands from the mobile project directory after EAS configuration:

```powershell
npx eas-cli@latest login
npx eas-cli@latest build:configure
npx eas-cli@latest build --platform android --profile preview
npx eas-cli@latest build --platform all --profile production
npx eas-cli@latest submit --platform ios
npx eas-cli@latest submit --platform android
```

Review [EAS tutorial](https://docs.expo.dev/tutorial/eas/introduction/), [distribution overview](https://docs.expo.dev/distribution/introduction/), and [CLI reference](https://docs.expo.dev/eas/cli/) when implementing. Build quotas and usage charges depend on the chosen plan. [Expo billing](https://docs.expo.dev/billing/plans/).

## 15. APIs and shared business operations

Ordinary reads/writes may use the Supabase SDK under row policies. Complex actions need a transaction or trusted endpoint with explicit actor validation. Proposed commands:

| Command | Validations | Result |
| --- | --- | --- |
| createTrip | Signed in; valid dates/precision | Private draft with stable ID |
| reservePhotoUpload / completeUpload | Own trip; quota; object checks | Retriable photo record + processing state |
| startReconstruction | Own photos; consent; quota; dedup key | Observable background job |
| applySuggestions | Owner; accepted candidates; expected trip version | Actual stops and photo associations in transaction |
| copyItinerary | Source visible and reusable; target owned | Independent private trip with attribution |
| setPresence / endPresence | Own status; country; audience; future expiry | Active or ended status |
| publishTrip | Owner; content ready; explicit audience | Visible trip + deduplicated feed event |
| reportContent | Signed in; valid target; rate limit | Private report receipt |
| requestExport / deleteAccount | Reauthentication where appropriate | Tracked asynchronous request |

Use stable machine-readable errors for unauthorised, quota exceeded, stale version, missing source, and retryable failure. Mobile and web should display equivalent explanations.

## 16. Quality gates and acceptance tests

| Area | Evidence required |
| --- | --- |
| Trips | Future and historical trip journeys work; unknown dates survive editing; plans do not increment visit totals |
| Access | Owner/follower/stranger/blocked tests for tables, media, search, feed, share links, and status |
| Uploads | Interrupted, duplicate, oversized, corrupt, missing EXIF, HEIC, and retry cases preserve consistent state |
| AI | Ambiguous photo stays unresolved; suggestions require acceptance; retry does not duplicate stops |
| Social | Private follow requests, source privacy changes, independent copies, and notification access work |
| Presence | Public/follower audiences behave correctly; expiry is enforced even if cleanup is stopped |
| Maps | Manual backfill works without GPS/photos; repeated country visits count once; accessible list alternative |
| Community | Reports reach moderators; removed content leaves rankings/search; blocked users cannot interact |
| Native | Physical device permission, deep-link, slow-network, resume, and cache-clearing tests |
| Accessibility | Keyboard navigation, visible focus, screen-reader labels, contrast, touch targets, reduced motion |
| Operations | Restore database and photos into an isolated environment; verify export/deletion; rehearse rollback |

Use unit tests for date/visit/copy rules; database integration tests for policies; browser end-to-end tests for critical journeys; device tests for native integrations. Use synthetic media and consented AI evaluation images. Establish performance budgets with measured beta devices: paginate feeds, lazy-load images/maps, avoid full-resolution feed photos, and measure upload completion rates.

## 17. Delivery backlog and dependencies

| Milestone | Build sequence | Depends on | Definition of done |
| --- | --- | --- | --- |
| P0 | Review overview, defaults, page catalogue, implementation decisions | Founder brief | Planning documents accepted for future execution |
| P1a | Workspace, auth, profiles, policies, deployment preview | P0 | Two-account access checks pass |
| P1b | Trips, days, stops, photos, manual map/backfill | P1a | Plan and record journeys both complete |
| P2a | Follows, feed, interactions, copy/save, status | P1b | Friends can discover and reuse a trip |
| P2b | Notifications, moderation, mobile core | P2a | Abuse/report and native sharing journeys work |
| P3a | Metadata reconstruction, optional vision review | Stable uploads/jobs | Recovery, consent, and evaluation gates pass |
| P3b | Place reviews, practical guides, forum threads | Places + moderation | Helpful destination journey exists without fake content |
| P3c | Badges, opt-in leaderboard, richer discovery | Visit rules + social graph | Correct totals after edits/deletions |
| P4 | Native parity, full release tests, operations, stores | P1–P3 | Website and phone apps ready for public use |
| P5 | Creator collections, groups, meetups, broad Q&A | Usage evidence + moderation capacity | Each feature has demand and an operating owner |

Work one vertical journey at a time. Estimate calendar time after two implementation milestones reveal actual weekly capacity. A two-client social product with uploads and moderation should not be represented as a weekend build.

## 18. Costs, recovery, and scaling

Keep a monthly cost sheet: backend base + database size + original/derivative GB + image egress GB + map/geocoding calls + worker compute + AI photos/tokens + email + native build/store costs. For example, 1,000 users × 200 photos × 2 MB is approximately 400 GB of originals before derivatives/backups; this is a sizing example, not a usage forecast or provider quote. Select initial quotas from an approved budget and measured compression quality.

Set usage alerts and app-side quotas for photo batches and AI jobs. Introduce optional paid capacity only after pricing and demand are understood. Check live [Vercel pricing](https://vercel.com/pricing), [Supabase pricing](https://supabase.com/pricing), [Expo billing](https://docs.expo.dev/billing/plans/), and [MapTiler pricing](https://www.maptiler.com/cloud/pricing/) before provisioning.

Back up database records and photo objects separately. Supabase database backups do not include stored photo objects. Test restoring both, including ownership links; document recovery time and acceptable data-loss targets before public release. [Supabase backups](https://supabase.com/docs/guides/platform/backups).

Prefer additive migrations and feature flags. Roll back website code to a known deployment while preserving compatible database schema; do not blindly reverse destructive migrations. A leaked credential needs rotation, access review, and incident logging. An AI outage should leave manual trip logging available. A map outage should leave a readable destination list. On account deletion, remove media, relationships, tokens, and derived indexes through a tracked job; disclose backup retention and remove expired exports.

Scale after measurement: indexes and pagination first, then precomputed visible feed references, worker concurrency controls, image delivery optimisation, and search infrastructure when PostgreSQL queries no longer meet requirements. Keep authorisation on every materialised/cached read path. No microservice split is required at the start.

## 19. Continuous GitHub change log

For each meaningful completed change set:

1. Check status and avoid including unrelated user work or secrets.
2. Update `CHANGELOG.md` with a unique push label, files, purpose, checks, and destination branch; record the operation as prepared until the push is confirmed.
3. Stage only the intended files and commit with the push label in the subject.
4. Push to the existing origin. If the remote advanced, inspect the differences and integrate without force-pushing away others' work.
5. Compare `git rev-parse HEAD` with `git ls-remote origin refs/heads/main` and report the commit link after they match.
6. Add a confirmation receipt to the next log update, or make an immediate receipt commit referencing the already-confirmed content commit. A receipt commit cannot truthfully pre-record its own successful push; its status is independently verifiable in remote history.

The change-log label links to Git history; do not invent a self-referential commit hash. If authentication or branch protection blocks a push, retain local work, record/report the actual blocker, and request the specific missing action.

## 20. What still needs a founder decision

Final brand; team hours and budget; whether first public release waits for all P3 features; public versus followers status default; free storage/AI quotas; social login providers; age eligibility and initial supported languages; copying permissions; video support; co-editing; eventual monetisation; and whether meetups need direct messages. The defaults in the overview allow detailed planning to proceed without treating these proposals as approved product decisions.
