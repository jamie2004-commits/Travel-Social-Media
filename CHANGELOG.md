# Change and push log

## HANDOFF-001 — Publish working prototype for collaboration

- Date: 28 September 2026.
- Destination: `origin/main` at `jamie2004-commits/Travel-Social-Media`.
- Includes all prototype implementation, authentication, photo/backup flows, phone launcher, tests, deployment configuration, preview images, and collaborator instructions accumulated since the last GitHub commit.
- Added `HANDOFF.md` with setup, test commands, current limitations, and outstanding independent-hosting work.
- Excludes generated deployment copies/archives, private booking source HTML, browser backup files, and local environment secrets. The sanitized itinerary seed is included, so a fresh clone runs without the private source file.
- Validation: authentication and prototype regression suites passed; GitHub main fetched before staging; staged files and whitespace checked before commit.
- Push status: prepared; the final push will be verified against the remote main SHA.

## PROTO-006 — Phone testing over Wi-Fi

- Date: 27 September 2026.
- Added `Start Roam Phone.cmd` and a LAN launcher on port 8002 that prints reachable IPv4 addresses. Existing laptop-only launcher remains available.
- Added a cryptographically random UUID fallback for ordinary HTTP contexts, enabling copying/creating trips, saving photos, and restoring backups over local Wi-Fi.
- Verified the real browser login, photo/caption/restore, itinerary editing, and mobile layout checks over the laptop's LAN address, explicitly checking non-secure-context behavior. HTTP access tests and prototype regressions also passed. Physical phone access still needs the phone on the same Wi-Fi and inbound access through Windows Firewall.
- Independent internet hosting remains pending; this is a local phone-testing option.

## PROTO-005 — Independent prototype sign-in

- Date: 25 September 2026.
- Added a standalone Node server and sign-in screen using the requested `user123` / `password` credentials, with server-side checks, HttpOnly session cookies, production Secure cookies, sign-out invalidation, throttling, and origin checks.
- App/itinerary files require authentication; original booking documents and internal source/config files are not served. Retired offline app-shell caching to prevent cached pages bypassing logout. Existing local trips, photos, notes, expenses, and backup flows remain.
- Prepared Render web-service configuration and a validated independent deployment package. Independent deployment is waiting for a Render connection; the previous Sites deployment is unchanged. No replacement live URL has been claimed.
- Validation: HTTP auth/access tests, prototype regression checks, and real Chromium tests for login failures/success, reload, logout, trip/photo/backup flows, and desktop/mobile rendering.

## PROTO-004 — Offline trip companion

- Added day filtering/Today in China time, editing stops and notes, a saved journal, spending entry/removal with a manual exchange rate, and personal trip/photo backup and restore as independent copies.
- Added a service worker and manifest, offline status, setup guidance, and a double-click localhost launcher. Restoring validates metadata and photo images, writes photos transactionally, and rolls back new photo records if metadata storage fails.
- Tested in Chromium: actual offline reload with saved photos, stop edits and journal persistence, CNY-to-SGD expense entry, backup/restore with captions, rejection of invalid backups, existing friend/photo flows, and desktop/mobile widths.
- Prepared a private Sites deployment using only app assets in an isolated source checkout. Original booking document and credentials are excluded. Source commit: `60423618b99c5a549bcc97c10b227e449a594124`.
- Deployment confirmed successful: version 1, deployment `appgdep_6aaaa727a89481918df6d3e923ba7332`, at https://roam-hangzhou-shanghai-trip.aioiteam.chatgpt.site. Original GitHub origin was not pushed.
- Phone/Safari testing and automatic device sync are outside this validation. User photos and edits remain local to each device/address; backup files provide manual transfer.

## PROTO-003 — Clickable friend itineraries and local photo albums

- Friend-trip covers, titles, and explicit View itinerary links open their detail pages. Sophie's Kyoto example now has five days, ten stops, notes, an illustrative photo, and independent itinerary copying.
- Added Photos tabs and Upload photos shortcuts to personal trips, including Hangzhou / Shanghai. Multiple JPEG/PNG/WebP files are resized and saved locally in IndexedDB with captions and removal; unsupported/oversized files and storage failures surface errors. Friends' galleries remain read-only.
- Existing personal trips, imported itinerary edits, and saved/liked selections are preserved. Real photos are not published or sent to a server.
- Verification: Node regression checks plus actual headless Chromium navigation, copying, upload, caption, reload persistence, removal, invalid-file handling, and desktop/mobile overflow checks. Inspected desktop itinerary and mobile Photos screenshots.
- Push status: local changes only; not committed or published.

## PROTO-002 — Hangzhou / Shanghai personal trip

- Date: 16 September 2026.
- Imported the supplied itinerary for 17–24 September: eight dated sections including departure night, 30 stops, three flight/train legs, four hotels, and seven expense entries totalling S$1,532.68.
- Added a home shortcut, personal trip card, daily itinerary, transport/stays/spending tabs, completion tracking, and adding stops with a day and optional time. Existing browser data and subsequent trip edits survive the one-time import.
- Preserved source uncertainty and untimed stops; booking credentials are excluded from generated data. The original source remains unchanged. The real trip is excluded from sample discovery.
- Checks: source import assertions, JavaScript syntax, four trip tabs, spending totals, dated stop creation, completion, existing-data migration, duplicate prevention, and persistence after reload. Visual browser testing remains outstanding.
- Push status: local changes only; not committed or published.

## PROTO-001 — Interactive travel social prototype

- Date: 13 September 2026.
- Purpose: create a usable browser prototype from the travel social product plan, with Roam as a working name.
- Files: `index.html`, `prototype.css`, `prototype.js`, `prototype-map.js`, `scripts/check-prototype.cjs`, `README.md`, and this log.
- Features: responsive friends feed, destination search, saved trips and likes, personal trip creation, independent itinerary copying, stop editing/completion, lifecycle selection, and a searchable visited-country map. State persists locally when browser storage is available.
- Verification: JavaScript syntax check; Node rendering checks for seven routes, saved filtering, search empty state, map geometry including point features, and independent itinerary copies. Browser visual testing remains outstanding.
- Limitations: sample data, browser-local storage, externally hosted photos/fonts, no authentication/backend or real social actions.
- Push status: local changes prepared; not committed or pushed.

Each meaningful change set receives an entry and a matching commit label. A successful push is confirmed by comparing local HEAD with the remote branch. Confirmation receipts may reference the preceding content commit; remote history is the authoritative record for the receipt commit itself.

## PLAN-001 — Full product plan and wireframe atlas

- Date: 8 September 2026.
- Destination: `origin/main` — `jamie2004-commits/Travel-Social-Media`.
- Purpose: document the founder's complete travel-social concept without implementing the application.
- Files: `README.md`, `IMPLEMENTATION_PLAN.md`, `docs/SCREEN_CATALOG.md`, `docs/project-blueprint.html`, `docs/build_blueprint.py`, and this log.
- Product coverage: all-traveller audience; equal planning and retrospective logging; photos; friends-first social features; manual public/follower country presence; reviews; guides/forums; AI reconstruction; gamification; later creators/groups/meetups.
- Latest founder addition: a prominent rotatable profile globe, coloured visited countries, country/city totals, visit annotations, and a collection/showcase experience.
- Technical coverage: proposed Next.js/Expo/Supabase architecture, deployment services and connections, schema, access rules, background jobs, operations, costs, phased implementation, and release gates.
- HTML coverage: both full documents plus page navigation, desktop/mobile previews, a schematic draggable globe, sample-country controls, and print view. Wireframes are illustrative; no app behaviour or real map boundaries are implemented.
- Verification: regenerated both HTML and screen catalogue; checked 56 unique screen IDs and all action targets; verified local document links and unique HTML IDs; passed embedded JavaScript syntax check; corrected print visibility after hiding the screen atlas. Three parallel reviewers checked scope, HTML, and implementation/privacy consistency. A staged whitespace check identified one trailing space in the documentation generator, corrected in LOG-001 below.
- Push status: prepared; see the subsequent receipt and GitHub history for confirmation.

## LOG-001 — Confirm PLAN-001 delivery and browser checks

- Date: 8 September 2026.
- Confirmed content commit: [`f40c2944495489f247c3eb560a61569d38f76f51`](https://github.com/jamie2004-commits/Travel-Social-Media/commit/f40c2944495489f247c3eb560a61569d38f76f51).
- Push result: PLAN-001 successfully pushed to `origin/main`; local HEAD and remote `refs/heads/main` both matched the hash above.
- Browser verification: headless Chrome rendered all 56 screens; desktop/mobile switching, filtering, full catalogue, country toggle, and globe rotation passed. Reviewer inspected the initial screenshot for readable layout and correct text encoding. Browser harness and screenshots stayed in system temporary storage.
- Files changed in this receipt: `CHANGELOG.md` and one trailing-space correction in `docs/build_blueprint.py`; generated content is unaffected.
- Commit attribution: Codex (`codex@localhost`) used only for these commits because no user author identity was configured; no global Git identity was changed.
- Receipt destination: `origin/main`. This receipt's own push is verified through the remote commit history and the final delivery message; it cannot pre-record its own successful push.

## DESIGN-002 — Redesigned layouts and interactive flat profile map

- Date: 8 September 2026.
- Request: improve the wireframes' appearance and replace the 3D globe with a flat world map where a person can tick visited countries.
- Design: softer green palette, serif headings, more space, compact app navigation, redesigned profile identity/statistics, travel journal cards, and a clear visited-country collection. All 56 screen layouts inherit the new visual system; the complete overview and build guide remain embedded in the HTML.
- Map: actual embedded country/territory outlines from public-domain Natural Earth, coloured visited fills, map-click toggles, searchable checklist, zoom/reset controls, travel notes, browser-local persistence, and live country/sample-city totals. Singapore uses a labelled small-country marker because it is absent from the low-resolution boundary source.
- Example: 20 countries and 43 sample city records — United States; United Kingdom, France, Spain, Portugal, Italy, Germany, Netherlands, Switzerland; Singapore, Malaysia, Thailand, Indonesia, Vietnam, Philippines, Cambodia, Laos; Japan, South Korea, China. Sample data does not assert the founder's actual travels.
- Access behaviour: owner sample profiles can edit; another traveller's sample profile remains read-only and independent of owner selections. This is an interactive design prototype, not a deployed app/account backend.
- Sources: introduced `docs/blueprint-template.html`, `docs/blueprint.css`, `docs/blueprint.js`, geographic data and attribution under `docs/assets/`; updated the generator, HTML, screen catalogue, README and implementation guide to match the flat-map direction.
- Preview images: `docs/previews/profile-desktop.png` and `docs/previews/profile-mobile.png`, captured from the actual HTML with the 20-country example reset.
- Verification: 56 navigation targets and all local document links resolve; all 20 example countries are in the map dataset; JavaScript syntax passes. Headless Chrome verified 20/43 initial totals, US removal, Canada search/add and map click, reset, selection/note persistence after reload, read-only friend profile, all 56 screen renders, zero duplicate generated IDs, and no browser errors. Mobile at 390px had no horizontal overflow. Print retained all screens after hiding the atlas and expanded both full documents. Desktop/mobile screenshots visually reviewed.
- Delivery: prepared for `origin/main`; the following receipt records the confirmed content push.

## LOG-002 — Confirm redesigned map delivery

- Date: 8 September 2026.
- Confirmed content commit: [`2e5f216318651d1705a97ee8d6cc5dd96305f831`](https://github.com/jamie2004-commits/Travel-Social-Media/commit/2e5f216318651d1705a97ee8d6cc5dd96305f831).
- Result: DESIGN-002 pushed successfully to `origin/main`; local and remote HEAD matched the hash above.
- Files in this receipt: `CHANGELOG.md` only. Records the confirmed redesign/map push and its preview images; no additional product changes.
- Receipt destination: `origin/main`; this receipt's own delivery is verified by remote history and the final response.
