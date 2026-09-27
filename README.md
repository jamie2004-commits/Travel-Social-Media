# Travel Social Media — project overview

## Current version: independent username/password login

**Test on your phone:** double-click `Start Roam Phone.cmd`, connect both devices to the same trusted Wi-Fi, and open the address printed in its window. Sign in with `user123` / `password`. Keep the laptop awake and the server running. If Windows prompts for network access, allow your private network. The current Wi-Fi address is `http://192.168.1.20:8002/login`; it can change when the laptop reconnects. This tests the phone browser interface, not a native installed app. The phone has separate local storage; use backup/restore to transfer laptop data.

The new version runs independently of ChatGPT. Start it with **Start Roam.cmd** and open **http://localhost:8001/login**. Username: **user123**. Password: **password**.

Server authentication, sign-out, protected itinerary files, and existing trip/photo flows have passed HTTP and real-browser checks. An independent hosting package is ready; publishing the replacement live URL is waiting for the Render connection. The previous ChatGPT Sites URL below still serves the old version.

See [DEPLOYMENT.md](DEPLOYMENT.md) for deployment, local-data transfer, and test instructions. This authenticated version needs a connection when signing in or reopening; the previous offline reload behavior is retired to prevent cached app pages bypassing logout. Local photos, notes, spending, and backup/restore are retained.

The sections below document earlier prototype versions, including the old Sites deployment and offline behavior.

## Working app prototype

**Private live app:** [Open Roam](https://roam-hangzhou-shanghai-trip.aioiteam.chatgpt.site/index.html#trip/hangzhou-shanghai-2026). Sign in with the account that owns this site. Version 1 successfully deployed from source commit `60423618b99c5a549bcc97c10b227e449a594124`.

The trip companion now has offline app caching, day filters and Today, editable stops and notes, a trip journal, expense entry with a manually entered exchange rate, and backup/restore including locally saved photo copies.

For this laptop, double-click **Start Roam.cmd**, keep the window open, and visit `http://localhost:8000/index.html#trip/hangzhou-shanghai-2026`. The local server serves only app files, not your original booking document. Use a hosted HTTPS link for a phone away from the laptop. Wait for **Ready offline**, then test an airplane-mode reload on the actual phone before relying on it. External sample photos may require internet; the actual itinerary and saved photos work offline after setup.

Use **Offline & backups → Download backup** after each day. Restore imports personal trips as new copies so existing trips are preserved, adds backed-up visited countries, and restores photo copies. Browser storage is per-device and per-address: moving from the local HTML file or laptop URL to the hosted link requires exporting from the old address and restoring on the new one. There is no automatic cross-device sync. Keep original camera photos separately.

Hosting configuration is in `.openai/hosting.json`. `python scripts/build-site.py` stages only deployable app assets in the isolated `site-source` checkout; original booking documents are excluded. Headless Chromium checks cover offline reload, journal/stop persistence, expense conversion, and backup/restore with photos. Phone hardware and Safari have not been tested.

**Try a friend's trip:** open Friends feed, then select Sophie's Kyoto cover, title, or **View itinerary**. The example has five days, ten stops, a Photos tab, and **Copy itinerary** to make an editable personal version. Friend itineraries are read-only until copied.

**Add your photos:** open My Trips → your trip → **Photos → Upload photos** (also available via the trip's Upload photos shortcut). Choose multiple JPEG, PNG, or WebP files, up to 15 MB each. The prototype saves JPEG copies resized to a maximum 1,600-pixel long edge in this browser's IndexedDB. Add/save captions or remove photos in the gallery. Photos are local only, not uploaded to a service or backed up; clearing browser/site data removes them. HEIC needs exporting to JPEG first. Copied itineraries begin with an empty personal album.

Browser checks: `node scripts/check-browser.cjs` uses an installed Chromium (set `CHROME_PATH` if needed) to test friend navigation, copying, photo upload/caption/reload/removal, invalid files, and desktop/mobile layouts. It creates an isolated temporary browser profile and synthetic test image. Preview screenshots are in `docs/previews/`.

Your **Hangzhou / Shanghai trip (17–24 September 2026)** is now available from the home screen and My Trips. It includes the departure night and seven dated days, all 30 source stops, flights/train, four hotels, and seven recorded expenses totalling **S$1,532.68**. Daily plans preserve original times, Chinese names, notes, and untimed activities. You can complete/remove stops, add a stop to a chosen day with an optional time, and update trip status.

The trip is imported once into existing browser storage without replacing your other trips or later edits. It appears in personal views; Explore continues to show sample inspiration. This is a local prototype, not an authenticated private account. Booking references, PINs, and e-ticket numbers are excluded from the imported data; they remain in your original HTML. No trip has been published. All travel details and spending are taken from your supplied itinerary, not independently verified.

The source is `杭州-上海 (10).html`. Run `python scripts/import-itinerary.py` to regenerate `prototype-trip.js`; regenerating the seed does not overwrite an already imported browser trip. The dated-trip UI lives in `prototype-itinerary.js`. Run `node scripts/check-prototype.cjs` for rendering, copying, import, and persistence checks.

Open [index.html](index.html) in a browser to try **Roam**, the interactive travel social app prototype. No npm installation or build step is needed. Alternatively run `python -m http.server 8000` from this directory and visit `http://localhost:8000`.

Explore the friends feed, search destinations, save and like trips, create a personal trip, copy a friend's itinerary, add/remove itinerary stops, mark stops visited, change trip status, and edit your visited-country map. Changes persist in this browser using local storage. Layouts adapt to desktop and phone widths.

The friends' trips and original Bali trip are samples; Hangzhou / Shanghai uses your supplied itinerary. There is no live account, backend, upload service, or real social interaction. Photos load from Unsplash and fonts from Google Fonts, requiring an internet connection; the map and app logic are local. Country visits are manually recorded separately from itinerary stops. The prototype's working name is not final branding.

Implementation: `index.html`, `prototype.css`, `prototype.js`, and `prototype-map.js`. The map embeds the existing Natural Earth dataset from `docs/assets/world-countries.geojson`; see its attribution file. The detailed planning document below remains available separately.

Planning edition · 8 September 2026 · Working name, not final branding.

**A website and mobile app for planning trips, keeping photos and memories together, and discovering what to do overseas through people you follow.**

This repository contains planning documents, illustrative screen wireframes, and a browser prototype of the profile's interactive flat world map. Prototype selections demonstrate the experience; they are not connected to a real account or database. The full application and production services remain future work.

## Read the plan

- [Implementation guide](IMPLEMENTATION_PLAN.md): architecture, services, database design, setup, delivery sequence, testing, deployment, and operations.
- [Interactive planning document and screen wireframes](docs/project-blueprint.html): download/open this HTML file in a browser; GitHub's file view does not render the interactive document.
- [Screen catalogue](docs/SCREEN_CATALOG.md): routes, page responsibilities, interactions, and states.
- [Change and push log](CHANGELOG.md): one entry for each meaningful pushed change set.

The current design uses a flat, interactive world map. Open the HTML file directly in a browser to try the 20-country example, tick/untick visits, search countries, and save a travel note. Choices remain local to that browser. The sample covers the United States, Europe, Southeast Asia, Japan, South Korea, and China.

To regenerate the self-contained HTML after editing the documents or design sources, run `python docs/build_blueprint.py`. Its layout, styles, and interactions live in `docs/blueprint-template.html`, `docs/blueprint.css`, and `docs/blueprint.js`; the geographic source and licence are in `docs/assets/`. The output needs no server or external JavaScript downloads.

## 1. Decisions from the founder

| Topic | Confirmed direction |
| --- | --- |
| Audience | Everyone who travels; no university or exchange-student restriction. |
| Primary attraction | Logging trips and photos, following one another, and learning where to go and what to do from friends. |
| Discovery | Friends first; broader traveller and influencer discovery eventually. |
| Trip creation | Equally support detailed plans before departure and recording/reconstructing trips afterward. |
| Current location | A manual country-presence toggle such as “Alex is in Spain now”; no continuous GPS tracking. |
| Scope | All features in the concept remain in the product roadmap. |
| Resources | Side project with long-term ambition; team capacity, budget, and launch date are not fixed. |
| Current task | Document the full product and implementation plan; create screen wireframes and an interactive flat-map profile prototype. Full application implementation remains future work. |
| Profile showcase | A flat world map with countries users can tick as visited, coloured country fills, and country/city statistics. |
| Repository workflow | Commit and push completed changes to GitHub and keep a continuous log. |

Recommendations below are proposals, not additional decisions attributed to the founder. Sequencing makes the work manageable; it does not remove features from the agreed vision.

## 2. Problem and product promise

Travel memories are spread across camera rolls, chats, maps, notes, and documents. Plans often live somewhere different from the photos of what actually happened. Social posts make a trip look attractive but rarely make the route easy to reuse.

The product connects three jobs: “keep my travels,” “see my friends' travels,” and “use those experiences to plan mine.” The original before-departure wedge remains through saved itineraries, destination pages, and practical guides. The immediate personal value is a useful trip journal even before friends join.

The initial concept's claims about competitors and unmet demand are hypotheses to validate, not established market research. Interview a mix of occasional travellers, frequent travellers, families, solo travellers, and exchange students. Watch them import an old trip and try to reuse a friend's plan.

## 3. End-to-end experience

### Before a trip

Find a friend's Japan trip, inspect its daily itinerary and photos, save a copy, shift the dates, add your own stops, and bookmark practical transport guidance. A planned stop is visibly different from a place actually visited.

### During a trip

Open today's itinerary, add photos or notes, mark stops visited, and optionally enable a country status with an end date and a chosen audience. Uploads should survive weak connectivity; a queued upload must never appear as successfully backed up.

### After a trip

Upload photos, group them by day, review suggested locations, fill gaps, publish selected memories, and update the visited map. People who never planned ahead can begin here and receive the same trip tools.

### Between trips

See friends' new trips, revisit memories, discover destination ideas, answer practical questions, and save routes for later. Followers should gain usable context rather than only an attractive image.

## 4. Feature requirements

### Accounts and identity

One account across the website, iOS, and Android. Email sign-in first, with social sign-in evaluated during implementation. Profiles contain a handle, name, bio, avatar, travel map, visible trips, followers, following, and optional country status. Public/private profile controls, follow requests, blocking, reporting, export, and deletion belong in the foundation.

### Trips: the central object

A trip has a title, cover, destinations, optional dates, timezone information, lifecycle state, visibility, itinerary, notes, and photos. Lifecycle: draft → planned → ongoing → completed → archived. Visibility is separate: private, followers, or public. Dates may be unknown for historical trips; users can enter only a month or year without inventing a day.

The same detail page offers Overview, Itinerary, Photos, and Map. Editing a plan must not erase the actual record. Use planned and actual stop fields/statuses, preserving departures from the original route. No booking engine is required by the current concept.

### Photos and memories

Batch upload, progress, retry, duplicate detection, captions, date/location edits, cover selection, day grouping, and accessible photo descriptions. Store originals privately and deliver appropriate image sizes. Explain metadata use at upload. Preserve original EXIF separately from user corrections; shared derivatives should not expose hidden GPS metadata. Videos are a possible expansion, not an assumed launch requirement.

### Flat world map and profile showcase

Every profile has a prominent travel showcase: an attractive **flat world map**, countries filled with colour when visited, and country/city totals immediately below. The owner can click a country or tick it in a searchable list to mark it visited, annotate it with a note or visit period, and link trips/photos. Visitors can select coloured countries and open the travel memories they are allowed to see. Country controls should remain usable on small screens, including countries too small to select comfortably on the map. The latest flat-map direction replaces the earlier globe proposal.

The prototype starts with an explicitly illustrative **20-country showcase**: United States; United Kingdom, France, Spain, Portugal, Italy, Germany, Netherlands, Switzerland; Singapore, Malaysia, Thailand, Indonesia, Vietnam, Philippines, Cambodia, Laos; Japan, South Korea, and China. These are sample visits, not claims about the founder's travel history. Ticking or unticking a country updates its fill and the distinct-country total immediately; the prototype also derives a clearly labelled sample city total from the selected countries' example city records. The full app must count actual confirmed city visits separately. Country boundaries are embedded for offline viewing, and browser-local persistence remembers the owner's sample selection. Other people's sample profiles remain read-only.

The desired feeling is “this is my travel collection, and I want to fill in more of the map.” Use a consistent visited colour, subdued unvisited countries, a distinct wishlist treatment, optional regional progress, milestone celebrations, and a shareable showcase card. Do not colour an entire country just because it appears in a planned itinerary. Never make colour the only signal: add a legend, labels, and visited indicators.

Country and city counts must come from distinct confirmed visit records, including manual backfill. Public/follower profile maps and statistics must be computed from the same permitted showcase records: a private trip must not leak its country through an aggregate. Owners may explicitly share a country-level visit while keeping its underlying trip private. Explain that choice in the map editor. The flat map is a core profile feature, not a later creator-only extra.

Mark countries and cities visited, connect them to trips, filter by year, and open memories from a map selection. Support manual backfill without photos or exact dates. Keep wishlist/planned destinations separate from visited destinations. Country totals count distinct country codes; document how territories and disputed borders are represented. Manual records count as self-reported visits, not verified travel. Avoid a universal “X of 195” promise until the country/territory catalogue is chosen and documented.

### Backwards planning and AI

Metadata parsing comes first: timestamps and GPS can suggest days and places without paid image inference. With user consent, scene recognition can suggest candidates for photos without GPS. Generic beaches, hotel rooms, and landmarks with lookalikes can remain unresolved. Show why a suggestion was made and allow confirm, change, skip, and undo. Never silently publish an inferred location or overwrite an existing itinerary. Distinguish metadata-derived, user-entered, and AI-suggested information.

### Friends and social discovery

Follow/unfollow, follow requests for private profiles, a chronological Following feed, likes, comments, share links, saved trips, and notifications. Mutual follows may receive a “Friends” label; define that consistently. Explore is a separate destination for wider discovery, so influencer recommendations do not displace friends. Public sharing previews must honour visibility.

Offer two distinct actions: **Bookmark** keeps a link to the original trip and continues to obey its visibility; **Copy itinerary** creates an independently editable plan with source attribution and a new private default. Do not copy the author's private notes or photo files. Source edits do not unexpectedly change the copied plan. If the source later becomes private, keep the user's permitted copied plan while restricting access to the original; explain this when enabling itinerary reuse.

### “In this country now” status

The user selects a country, turns sharing on, selects an audience, and sets an expiry. The editor prominently supports **Everyone** to match the desired broadcast behaviour; the recommended initial default is followers, with explicit confirmation when choosing Everyone. Public status can appear in broader discovery later; it does not imply a push notification to every app user. Show “manually shared” and last-updated time. Expire automatically, support ending early, and never infer presence from an old photo or scheduled trip. Blocking applies immediately to subsequent status reads.

### Traveller-curated reviews

Reviews attach to a place and can reference an actual trip stop, visit month/year, traveller context (solo, family, budget, accessibility needs), original photos, practical tips, and helpful votes. Filters answer “is this useful for a traveller like me?” A trip-linked review is still self-reported; do not label it independently verified. Locals can contribute if relevant—“traveller-curated” describes useful context, not nationality or residence.

Google reviews are an optional external integration, not a database seed to copy freely. First-party reviews and licensed place data should form the base. Google imposes storage, display, and attribution constraints, including requirements for displaying Places content on maps. [Google Places policies](https://developers.google.com/maps/documentation/places/web-service/policies).

### Practical guides and forums

Destination/topic landing pages, maintained guides, question threads, answers, bookmarks, helpful votes, reports, and moderation. Initial subjects include payment setup, trains, fare validation, driving, connectivity, and arrival logistics. The examples Alipay, European rail, and Autobahn driving are editorial topics, not advice supplied by this plan. Each guide needs official sources, last-checked date, applicable country, and corrections history. Publish a small set of useful guides before opening a large empty forum. Broader Q&A expands later.

### Gamification

Country/city badges, trip-completion milestones, optional friend leaderboards, and forgiving logging streaks. No reward should require disclosing location publicly or buying travel. Backfilled visits remain useful; label counts self-reported. Users can hide achievements and opt out of rankings. Avoid making streaks punish people who travel infrequently.

### Later social expansion

Public creator profiles and collections; traveller groups with membership controls; activity posts and event details; optional meeting discovery using country/city chosen by the user; broader Q&A. Messaging is a separate future decision because it adds inbox, abuse, and notification work. Groups and event discussion can work without direct messages.

## 5. Navigation and visual direction

Mobile bottom navigation: **Home · Explore · Add · My trips · Profile**. A top-level notification icon opens activity. Explore exposes destination search, places, practical guides, and community. Profile opens the personal map, saved collection, badges, and settings. Add opens a choice of future trip, past trip, or photo import.

Desktop uses a persistent sidebar, wider trip editing, and optional context panels. Core actions must also work on small screens. Wireframes use neutral surfaces, teal actions, photo placeholders, clearly labelled controls, and plain travel language. They illustrate layouts and navigation, not final branding or completed functionality.

## 6. Delivery stages: all features retained

| Stage | Scope | Exit evidence |
| --- | --- | --- |
| P0 — planning | Confirm requirements, screen coverage, assumptions, architecture | Founder can review all documents and primary journeys |
| P1 — private foundation | Authentication, profiles, trip planning/logging, photos, visited map, historical backfill | A user creates both future and past trips; another account cannot access private data |
| P2 — friends beta | Following feed, profiles, comments/likes, itinerary reuse, presence, notifications, moderation | Two friends can complete a sharing-to-planning journey; privacy changes work |
| P3 — full concept beta | Metadata and AI reconstruction, traveller reviews, guides/forums, badges and leaderboards | Every original feature family has a usable tested version |
| P4 — public release | Website and native parity, accessibility, reliability, store distribution, support | Release and recovery checks pass; operating costs are measured |
| P5 — expansion | Influencers, collections, meetups/groups, broader Q&A | Demand and moderation capacity justify each addition |

P1 and P2 are development milestones, not a proposal to delete the rest. If every feature must be in the first public release, keep development private through P3 and release after P4 checks. No dates are promised until weekly capacity and prototype results are known.

## 7. Platform recommendation

Use a mobile-friendly **Next.js website**, an **Expo / React Native mobile app**, and **Supabase** for shared PostgreSQL data, authentication, and photo storage. Host the website on **Vercel** and build/distribute the mobile apps using **Expo EAS**. Validate the shared trip model on web first, then bring the native client forward during P2/P3; public launch should meet the agreed app-and-website scope.

This two-client design costs more UI work than an Expo-only universal app, but suits public destination/guide pages and a native photo-heavy experience. Reassess after one complete trip journey: if two clients exceed available capacity, Expo web is the explicit simplification option. Framework compatibility is documented in [Next.js deployment](https://nextjs.org/docs/app/getting-started/deploying), [Supabase Expo integration](https://supabase.com/docs/guides/getting-started/quickstarts/expo-react-native), and [Expo EAS introduction](https://docs.expo.dev/tutorial/eas/introduction/). This is a project recommendation, not a vendor requirement.

## 8. Operating model and monetisation

Keep the basic visited map, manual trip records, and social following free in the product proposal. Free photo storage cannot honestly be promised as unlimited without funding. Define a generous measurable storage allowance after usage tests. Possible paid extras: more original-photo storage, larger AI import allowance, advanced exports, printed albums, and optional creator tools. Later affiliate links or sponsorships must be clearly labelled and must not alter ordinary review ratings. Monetisation is unconfirmed; there is no payment implementation in this phase.

Measure compressed-photo storage, image delivery, map usage, database load, email, background jobs, and AI cost per active traveller. Use provider quotas and app-level limits. Vercel's Hobby offering is for personal non-commercial use; reassess the plan before commercial operation. [Vercel plan conditions](https://vercel.com/docs/plans/hobby).

## 9. Success criteria and learning

Proposed activation event: create/import a trip with at least three photos or three itinerary stops. Track this separately from following someone so the app's personal value is measurable. Social activation: follow a person and view one of their visible trips. Track returning travellers, completed uploads, itinerary saves that become edited trips, AI corrections, guide helpfulness, and report resolution.

Compare retention around travel periods rather than demanding daily usage. Initial research targets are usability goals, not growth forecasts: users understand plan versus actual, know who can see a trip/status, and can recover from interrupted uploads. Establish numerical growth targets after a real beta baseline. Analytics must exclude raw photo content, private notes, and precise GPS.

## 10. Proposed defaults and open decisions

- Working name: Travel Social Media; branding remains open.
- English-first interface with localisation-ready strings, international dates, timezones, and currencies; more languages need a later content plan.
- New trips private by default; explicit sharing action. Country-status audience defaults to followers, with Everyone clearly available.
- Email sign-in first; social providers, age eligibility, and geographic launch requirements need confirmation before public release.
- All travellers can join; start recruitment with people the team can reach, without eligibility restrictions.
- Photo-first launch; videos, collaborative editing, booking integrations, payments, and direct messaging are undecided additions.
- Budget, weekly working hours, free storage limit, AI quota, and exact public-release feature depth remain open.
- Decide whether public itinerary authors can disable copying, and whether status should appear on all public profiles or only explicitly selected surfaces.

## 11. Repository agreement

Every completed meaningful change set should include its log entry, be committed, and be pushed to the configured GitHub remote. Tiny local edits and validation fixes can be grouped into that change set. Log the purpose, affected files, verification, destination branch, and a unique push label. GitHub commit history supplies immutable commit hashes; a commit cannot contain its own final hash. Verify remote HEAD after each push and report failure honestly rather than marking an unconfirmed push complete.

Planning documents, wireframes, and the interactive flat-map prototype are the current deliverable. Future infrastructure setup and full application implementation start only when requested.
