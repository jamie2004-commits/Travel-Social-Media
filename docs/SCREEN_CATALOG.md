# Page and state catalogue

Planning edition · 8 September 2026.

These are the proposed product screens, including launch, operational, and later-phase pages. The HTML renders every screen with illustrative content and clickable navigation. Related modes, dialogs, and errors are listed per screen rather than invented as separate products.

Desktop: persistent navigation, central content, contextual right rail. Mobile: one column and five bottom destinations. Profile and world-map screens prominently feature the globe. Screen routes are proposed application routes, not running pages.

## Welcome

**Route:** `/` · **Stage:** P1 · **Wireframe ID:** `welcome`

Keep the plan. Keep the memories. See the world through your friends.

**Layout and content:**

- Your world, in colour
- Countries • Cities • Memories
- Plan before you go, or add a trip you already took.
- Follow friends and make their routes your own.

**Actions:** Create account; Explore public trips.

**States and rules:** Signed-out browsing; private links request sign-in without exposing trip details.

## Create account

**Route:** `/signup` · **Stage:** P1 · **Wireframe ID:** `signup`

Use one account on the website and your phone.

**Layout and content:**

- Name
- Email
- Password
- Accept terms and privacy policy
- Already registered? Sign in below.

**Actions:** Create account; Sign in.

**States and rules:** Invalid email, weak password, account exists, submitting, and connection failure.

## Verify email

**Route:** `/verify` · **Stage:** P1 · **Wireframe ID:** `verify`

Confirm your email to finish creating your account.

**Layout and content:**

- Verification email sent to a•••@example.com
- Open the link on this device, or continue after verification.
- Correct email address

**Actions:** Continue; Resend email; Change email.

**States and rules:** Expired link, resend cooldown, callback failure, and verified state.

## Sign in

**Route:** `/login` · **Stage:** P1 · **Wireframe ID:** `login`

Your trips are waiting.

**Layout and content:**

- Email
- Password
- Keep me signed in on this device

**Actions:** Sign in; Forgot password; Create account.

**States and rules:** Invalid credentials, offline, expired session, and redirected private-link destination.

## Account recovery

**Route:** `/recovery` · **Stage:** P1 · **Wireframe ID:** `recovery`

Request a reset link, then choose a new password.

**Layout and content:**

- Email
- We will send instructions if an account matches.
- New password (after opening the reset link)

**Actions:** Send reset link; Save password.

**States and rules:** Generic response prevents email enumeration; expired token and retry states.

## Set up profile

**Route:** `/onboarding` · **Stage:** P1 · **Wireframe ID:** `onboarding`

You can add old trips before finding friends.

**Layout and content:**

- Handle
- Display name and bio
- Choose profile photo
- Private profile
- Add visited countries now or skip and return later.

**Actions:** Colour my map; Find people; Skip.

**States and rules:** Handle collision; avatar upload failure; all optional steps can be skipped.

## Following feed

**Route:** `/home` · **Stage:** P2 · **Wireframe ID:** `home`

Following is the default. Explore is always one tap away.

**Layout and content:**

- Following • Friends
- Alex is in Spain now · manually shared · ends 18 Sep
- Alex · 5 days in Barcelona
- Alex added 12 memories · Followers · 24 likes · 6 comments
- Maya completed a Japan trip · Save the route for later

**Actions:** Open Alex’s trip; View Alex; See notifications.

**States and rules:** No follows: import your own trip and find people. Also loading, pagination, unavailable post, and retry.

## Explore and search

**Route:** `/explore` · **Stage:** P3 · **Wireframe ID:** `explore`

Places, routes, and useful answers from travellers.

**Layout and content:**

- Search destinations, people, places, guides
- Friends’ trips • Destinations • Practical guides • People
- Japan · routes saved by people you follow
- Barcelona in five days · city walks and food
- Later: clearly labelled creator collections

**Actions:** Japan; People; Practical guides; Creators.

**States and rules:** No results, spelling suggestions, popular public content, filtered/blocked results, and retry.

## Find people

**Route:** `/people` · **Stage:** P2 · **Wireframe ID:** `people`

Find friends by name or handle.

**Layout and content:**

- Search people
- Alex · @alextravels · 12 countries · Following
- Maya · @maya · 8 countries · Follow
- Sam · Private profile · Request to follow

**Actions:** View Alex; Follow requests.

**States and rules:** No automatic contact upload; empty results, pending request, accepted follow, and blocked account.

## My trips

**Route:** `/trips` · **Stage:** P1 · **Wireframe ID:** `trips`

Plans and memories, together.

**Layout and content:**

- All • Planned • Ongoing • Completed • Archived
- Japan · 12–20 Oct · Planned · Private
- Barcelona · 5 days · Completed · Followers
- Add a past trip even if you do not remember the exact dates.

**Actions:** Open trip; Add a trip; Saved trips.

**States and rules:** Empty shelf, date-unknown trip, sync pending, search/filter empty, and archived trips.

## Add chooser

**Route:** `/add` · **Stage:** P1 · **Wireframe ID:** `add`

Every option creates the same flexible trip journal.

**Layout and content:**

- Plan a future trip · organise your days before departure
- Record a past trip · add stops, notes, and memories
- Start from photos · reconstruct the journey with your review

**Actions:** Plan a trip; Record past trip; Import photos.

**States and rules:** Choose existing trip for imports; cancelling leaves no accidental published draft.

## Create / edit trip

**Route:** `/trips/new` · **Stage:** P1 · **Wireframe ID:** `tripnew`

Future plans and past memories get equal support.

**Layout and content:**

- Trip title · Barcelona with friends
- Destinations · Spain
- Start and end dates · or month/year/unknown
- Future plan • Past trip
- Visibility · Private / Followers / Public
- Choose cover

**Actions:** Save draft; Add itinerary; Add photos.

**States and rules:** Invalid dates, unknown historical dates, saving, stale edit, and unsaved-changes prompt.

## Trip overview

**Route:** `/trips/:id` · **Stage:** P1 · **Wireframe ID:** `trip`

5 days · Spain · Completed · Followers

**Layout and content:**

- Trip cover · caption and accessible description
- Overview • Itinerary • Photos • Map
- 5 days • 14 stops • 36 photos
- Alex · A slow week of food, architecture, and beach walks.
- Day 1 · Gothic Quarter → waterfront

**Actions:** Itinerary; Photos; Trip map; Like / comment; Save a copy; Share; Edit.

**States and rules:** Owner sees editing; visitor sees follow/save. Private, deleted, draft, and partially uploaded states.

## Daily itinerary editor

**Route:** `/trips/:id/itinerary` · **Stage:** P1 · **Wireframe ID:** `itinerary`

Keep the original plan while recording your actual route.

**Layout and content:**

- Day 1 • Day 2 • Day 3 • + Day
- Planned • Actual
- 09:00 · Gothic Quarter · Visited
- 12:30 · Lunch · Planned
- 16:00 · Waterfront · Visited · 6 photos
- Day notes

**Actions:** Add / edit stop; Import suggestions; View route; Trip overview.

**States and rules:** Reorder via drag or buttons, time conflicts, unknown dates, skipped stops, offline draft, and edit conflict.

## Stop editor

**Route:** `/trips/:id/stops/:stopId` · **Stage:** P1 · **Wireframe ID:** `stop`

A place can be planned, visited, or skipped.

**Layout and content:**

- Place search or manual place
- Day and local time (optional)
- Planned • Visited • Skipped
- Public itinerary note
- Private note · only you
- Attach your photos

**Actions:** Save stop; View place.

**States and rules:** Place not found, timezone ambiguity, duplicate warning, private note label, and delete confirmation.

## Trip route map

**Route:** `/trips/:id/map` · **Stage:** P1 · **Wireframe ID:** `tripmap`

Display planned and actual stops separately.

**Layout and content:**

- Barcelona · route with numbered stops
- Planned route • Actual visits
- 1 · Gothic Quarter
- 2 · Waterfront
- Routes illustrate stop order, not turn-by-turn navigation.

**Actions:** Open stop; Back to itinerary.

**States and rules:** Map unavailable uses ordered list; hidden stops excluded; route gaps and unknown locations labelled.

## Photo upload

**Route:** `/trips/:id/upload` · **Stage:** P1 · **Wireframe ID:** `upload`

Select photos or drop a batch on the website.

**Layout and content:**

- Choose photos · JPG / PNG / supported HEIC conversion
- 12 selected · 8 uploaded · 2 processing · 2 queued
- Use photo timestamps and location metadata to suggest stops
- Optional: send selected photos for AI location suggestions
- You will review suggestions before they change your trip.

**Actions:** Review suggestions; View album.

**States and rules:** Per-file retry, cancel, quota limit, denied photo access, duplicates, corrupt files, and offline queue.

## Reconstruction review

**Route:** `/trips/:id/reconstruction` · **Stage:** P3 · **Wireframe ID:** `reconstruct`

Suggestions become trip records only after you approve them.

**Layout and content:**

- All • Needs review • Confirmed
- Photo 08 · possible Sagrada Família
- Evidence: scene suggestion · location unconfirmed
- Day 2 · 10:14 photo timestamp · timezone unknown
- Choose another place or leave unresolved
- Photo 09 · GPS-derived candidate · review location

**Actions:** Confirm selected; Change place; Skip unresolved.

**States and rules:** Queued, processing, partial results, failure/retry, cancel, conflicting manual edits, and no useful candidates.

## Trip photo gallery

**Route:** `/trips/:id/photos` · **Stage:** P1 · **Wireframe ID:** `photos`

Grouped by day, with captions and places.

**Layout and content:**

- All photos • Day 1 • Day 2 • Unsorted
- Day 1 · City walk · 12 photos
- Day 2 · Architecture · 18 photos
- Unsorted · 6 photos

**Actions:** Open photo; Add photos; Trip overview.

**States and rules:** Empty gallery, processing placeholders, hidden private media, failed thumbnail, and selection mode.

## Photo viewer / edit

**Route:** `/photos/:id` · **Stage:** P1 · **Wireframe ID:** `photo`

Owner controls appear beside the memory.

**Layout and content:**

- Large photo placeholder · 8 of 36
- Caption · Morning light in Barcelona
- Date/time · editable, original retained privately
- Place · confirmed by you
- Visible to followers through this trip.

**Actions:** Save edits; Open place; Report.

**States and rules:** Owner edit versus visitor view; delete confirmation; missing original; metadata privacy and alt text.

## Trip reactions and discussion

**Route:** `/trips/:id/comments` · **Stage:** P2 · **Wireframe ID:** `comments`

Ask for the details a photo does not explain.

**Layout and content:**

- 24 likes · View people who liked
- Maya: Did you book the train ahead?
- Alex: Yes — added a note to Day 2.
- Write a comment

**Actions:** Post comment; Back to trip; Report comment.

**States and rules:** Posting/retry, edit/delete own comment, removed comment, and source no longer visible.

## Save itinerary copy

**Route:** `/trips/:id/copy` · **Stage:** P2 · **Wireframe ID:** `copy`

Your copy stays independent of the original.

**Layout and content:**

- New trip title
- New start date (optional)
- Include permitted itinerary notes
- Credit: inspired by Alex’s Barcelona trip. Source photos and private notes are not copied.
- Your copy starts Private

**Actions:** Create my copy; Cancel.

**States and rules:** Source private/deleted, copying disabled if supported, duplicate request protection, and date-shift preview.

## Share trip / showcase

**Route:** `/share/:type/:id` · **Stage:** P2 · **Wireframe ID:** `share`

Preview the audience before sharing a link or card.

**Layout and content:**

- Audience · Private / Followers / Public
- Share preview with permitted cover and stats
- Share link
- People still need access to open a followers-only trip. Downloaded public cards cannot be recalled.

**Actions:** Apply audience; Profile showcase.

**States and rules:** Unavailable source, audience change confirmation, copied-link feedback, and image generation failure.

## My profile showcase

**Route:** `/me` · **Stage:** P1 · **Wireframe ID:** `profile`

Jamie · @jamie · Collect places. Keep the stories.

**Layout and content:**

- Your visited-country collection
- 20 countries • 43 sample cities • 12 sample trips
- Showcase • Trips • Saved • Badges
- Colour a country when you visit. Add a note or connect a trip.
- Featured trip · Barcelona with friends

**Actions:** Edit travel map; Full world map; Edit profile; Country status; Badges; Settings.

**States and rules:** New profile starts with an inviting empty world map; owner-only versus public preview counts clearly separated.

## Other traveller profile

**Route:** `/u/:handle` · **Stage:** P2 · **Wireframe ID:** `friend`

@alextravels · Following · Alex is in Spain now

**Layout and content:**

- Explore Alex’s visible travels
- 20 visible countries • 43 sample cities • 12 sample trips
- Showcase • Trips • Followers
- Travel notes and totals reflect what Alex chose to share.
- Barcelona with friends · View itinerary

**Actions:** Open trip; Country detail; Followers; Report / block.

**States and rules:** Private profile/request pending; blocked; user not found; hidden visits excluded from map and counts.

## Edit profile

**Route:** `/me/edit` · **Stage:** P1 · **Wireframe ID:** `profileedit`

Your travel identity, with clear visibility choices.

**Layout and content:**

- Avatar
- Name / handle / bio
- Profile visibility
- Showcase accent colour
- Show shared country and city totals
- Show badges

**Actions:** Save profile; Edit countries.

**States and rules:** Handle taken, image upload failure, privacy transition preview, and unsaved changes.

## Flat world map

**Route:** `/me/map` · **Stage:** P1 · **Wireframe ID:** `world`

Tick countries on the map or use the searchable country list.

**Layout and content:**

- Visited countries showcase
- World map • Flat map • Country list
- 20 countries • 43 sample cities
- Search country or city
- Visited • Wishlist • All years
- Legend: teal = visited · outline = wishlist · grey = unvisited

**Actions:** Edit visits; Country details; Back to profile.

**States and rules:** Map rendering failure, reduced motion, keyboard/list mode, no visits, small-country picking, and audience preview.

## Mark countries / annotations

**Route:** `/me/map/edit` · **Stage:** P1 · **Wireframe ID:** `mapedit`

Manual backfill counts. Photos are optional.

**Layout and content:**

- Select a country to mark visited
- Country · Spain
- Visited this country
- Cities · Barcelona, Madrid
- When · exact date / month / year / unknown
- Travel note · What made this place memorable?
- Linked trip (optional)
- Showcase audience · Private / Followers / Public

**Actions:** Save visit; Country details.

**States and rules:** Repeated visits, canonical city duplicates, remove-last-visit confirmation, wishlist separation, and private-trip warning.

## Country travel drawer

**Route:** `/countries/:code/showcase` · **Stage:** P1 · **Wireframe ID:** `country`

Showcase annotations and linked memories.

**Layout and content:**

- Spain · Barcelona / Madrid
- 2 cities • 2 visible trips
- First visit: 2024 · self-reported
- Travel note: return for a slower train journey.
- Barcelona with friends

**Actions:** Open linked trip; Explore destination; Edit my visit.

**States and rules:** Owner edit only; no shared notes; private linked trip omitted; repeated visits grouped.

## Country status editor

**Route:** `/me/status` · **Stage:** P2 · **Wireframe ID:** `presence`

Manual country sharing. You control when it ends.

**Layout and content:**

- Share country status · On
- Country · Spain
- Audience · Followers / Everyone
- Ends · 18 September, 23:59
- Preview: Jamie is in Spain now
- Everyone makes this public. No live GPS tracking.

**Actions:** Save status; Turn off.

**States and rules:** Missing expiry, past expiry, timezone display, offline save failure, and public audience confirmation.

## Followers / requests

**Route:** `/me/connections` · **Stage:** P2 · **Wireframe ID:** `followers`

Manage follows and requests in one place.

**Layout and content:**

- Followers • Following • Requests
- Maya · Follow back
- Sam · Follow request · Accept / Decline
- Alex · Following · Remove follower

**Actions:** View traveller; Find people.

**States and rules:** Empty requests, removed follower loses follower access, blocked accounts filtered, and pagination.

## Saved trips and collections

**Route:** `/me/saved` · **Stage:** P2 · **Wireframe ID:** `saved`

Bookmarks stay linked; copied plans belong to you.

**Layout and content:**

- Trips • Places • Guides • Collections
- Japan route · Saved from Maya
- European rail basics · Guide bookmark
- Spain food stops · Place collection

**Actions:** Open saved trip; Copy itinerary; Read guide.

**States and rules:** Source made private/deleted; explain unavailable bookmark without exposing content; empty collection.

## Destination hub

**Route:** `/destinations/:slug` · **Stage:** P3 · **Wireframe ID:** `destination`

Friends’ experiences first, with practical context.

**Layout and content:**

- Destination cover
- Visible trips • Traveller reviews • Practical guides
- Friends • All travellers • Budget • Family
- Maya’s 9-day route · 3 cities
- Before you go: transport and payment setup

**Actions:** View trip; Places; Practical guides; Questions.

**States and rules:** No friend content uses labelled public results; empty reviews; stale editorial information labelled.

## Place details and reviews

**Route:** `/places/:id` · **Stage:** P3 · **Wireframe ID:** `place`

Know who visited, when, and what helped.

**Layout and content:**

- Place location
- Overview • Reviews • Photos
- Traveller review · visited May 2026 · solo trip · linked stop
- Practical tip: allow time to explore the surrounding streets.
- Traveller photos · attributed to their authors

**Actions:** Write review; Save to itinerary; View reviewer.

**States and rules:** No reviews; self-reported visit label; closed/duplicate place report; external sources visibly separate.

## Write / edit review

**Route:** `/places/:id/review` · **Stage:** P3 · **Wireframe ID:** `review`

Add context rather than only a star rating.

**Layout and content:**

- Rating
- Visit month/year
- Link your visited trip stop (optional)
- Solo • Couple • Family • Friends • Budget
- What worked? What should someone know?
- Add your own photos

**Actions:** Publish review.

**States and rules:** Invalid/missing fields, draft recovery, source trip made private, spam review, and save failure.

## Practical guide library

**Route:** `/guides` · **Stage:** P3 · **Wireframe ID:** `guides`

Useful answers for the days before your trip.

**Layout and content:**

- Search country or topic
- Payments • Trains • Driving • Connectivity
- China · Getting started with payment apps
- Europe · Rail tickets and validation
- Germany · Driving preparation

**Actions:** Read guide; Ask the community.

**States and rules:** No guide yet, outdated label, editorial filters, and saved-only empty state.

## Practical guide article

**Route:** `/guides/:slug` · **Stage:** P3 · **Wireframe ID:** `guide`

Illustrative article layout, not travel advice.

**Layout and content:**

- Country / region · Editorial author · Last checked date
- 1 · Before departure
- 2 · At the station
- 3 · If your plans change
- Official source links and corrections history
- Was this useful? Helpful / Suggest a correction

**Actions:** Save guide; Discuss / ask; Report correction.

**States and rules:** Sources unavailable, review overdue, region applicability notice, and version history.

## Practical forum

**Route:** `/community` · **Stage:** P3 · **Wireframe ID:** `forum`

Destination-specific questions with helpful answers.

**Layout and content:**

- Search questions
- Destination • Unanswered • Helpful • Recent
- How do I know whether my ticket needs validation? · 4 answers
- Payment setup before arrival · 7 answers

**Actions:** Open question; Ask a question.

**States and rules:** Empty topic, duplicate suggestions, moderation pending, locked topic, and rate limit.

## Question and answers

**Route:** `/community/questions/:id` · **Stage:** P3 · **Wireframe ID:** `thread`

Destination · Asked by Maya · Updated recently

**Layout and content:**

- Question text with dates and travel context
- Accepted answer · source links where relevant
- Other answer · 12 helpful votes
- Write an answer

**Actions:** Submit answer; Report; Back to forum.

**States and rules:** Deleted answer, moderation pending, locked thread, edited acceptance, and signed-out reply prompt.

## Ask / edit question

**Route:** `/community/new` · **Stage:** P3 · **Wireframe ID:** `question`

Specific questions are easier to answer.

**Layout and content:**

- Question title
- Destination / topic
- Travel dates or period (optional)
- What have you checked? What is unclear?
- Similar questions will appear before publishing.

**Actions:** Publish question.

**States and rules:** Duplicate suggestion, required fields, draft save, spam limit, and moderation review.

## Badges and progress

**Route:** `/me/badges` · **Stage:** P3 · **Wireframe ID:** `badges`

Celebrate memories at your own pace.

**Layout and content:**

- Your coloured-country collection
- 20 countries • 43 sample cities • 3 badges
- First memory · earned
- Five countries · earned
- Next milestone · ten cities with a saved note
- Show achievements on profile

**Actions:** Friend leaderboard; Add a visit.

**States and rules:** Opt-out, recalculated badges after deletion, no daily-travel pressure, and no private-location disclosure.

## Friend leaderboard

**Route:** `/leaderboard` · **Stage:** P3 · **Wireframe ID:** `leaderboard`

Optional rankings. Visits are self-reported.

**Layout and content:**

- Countries • Cities • Logged trips
- 1 · Maya · 9 shared countries
- 2 · Jamie · 6 shared countries
- 3 · Alex · 6 shared countries
- Join leaderboard

**Actions:** View profile; My badges.

**States and rules:** Opt-in required, ties, blocked accounts excluded, and only explicitly shared counts used.

## Activity inbox

**Route:** `/notifications` · **Stage:** P2 · **Wireframe ID:** `notifications`

Choose what deserves your attention.

**Layout and content:**

- All • Follows • Reactions • Trips
- Maya requested to follow you.
- Alex commented on your trip.
- Your photo import is ready for review.

**Actions:** Follow requests; Open comment; Review import; Preferences.

**States and rules:** Read/unread, no activity, stale source access, pagination, and no private lock-screen details.

## Settings

**Route:** `/settings` · **Stage:** P1 · **Wireframe ID:** `settings`

Privacy and data controls should be easy to find.

**Layout and content:**

- Profile and trip privacy defaults
- Notifications · in-app / push / email
- Photo metadata and AI consent
- Blocked accounts
- Language, appearance, accessibility
- Export and delete account

**Actions:** Privacy controls; Data export / deletion; Edit profile; Help.

**States and rules:** Save failure, reauthentication, denied OS push permissions, and account session expiry.

## Privacy and blocked accounts

**Route:** `/settings/privacy` · **Stage:** P1 · **Wireframe ID:** `privacy`

Shared map totals follow the same visibility as shared visits.

**Layout and content:**

- Default trip audience
- Default country-status audience
- Private profile
- Allow profile discovery
- Blocked people · unblock action
- Preview your profile as a visitor

**Actions:** Save settings; Visitor preview.

**States and rules:** Explain existing content changes; confirm narrowing/widening audience; public data remains public when anonymous.

## Export / delete account

**Route:** `/settings/data` · **Stage:** P1 · **Wireframe ID:** `data`

Request a copy or remove your account.

**Layout and content:**

- Export trips, notes, visits, and your photos · status: not requested
- Exports expire and are available only to your account.
- Confirm account identity before deletion
- Deletion removes your media and profile; show retention details before confirmation.

**Actions:** Request export; Review deletion; Back to settings.

**States and rules:** Queued/running/ready/expired export; reauthentication; deletion confirmation and tracked completion.

## Report or block

**Route:** `/report` · **Stage:** P2 · **Wireframe ID:** `report`

Reports are private. Blocking changes your interactions.

**Layout and content:**

- Reason · Spam / Harassment / Privacy / Other
- Additional context
- Also block this account
- You will receive a report acknowledgement.

**Actions:** Submit report; Cancel.

**States and rules:** Rate limit, invalid target, already removed content, and private report receipt.

## Help and support

**Route:** `/help` · **Stage:** P1 · **Wireframe ID:** `help`

Account, uploads, privacy, and community support.

**Layout and content:**

- Search help
- Why is my photo still processing?
- Who can see my map and country status?
- How do I recover my account?
- Support request details

**Actions:** Send support request; Community standards.

**States and rules:** Support receipt, unavailable service, upload diagnostics without private images, and accessibility contact.

## Policies and community standards

**Route:** `/policies` · **Stage:** P1 · **Wireframe ID:** `legal`

Policy layout placeholder; actual policies need drafting before launch.

**Layout and content:**

- Privacy • Terms • Community standards
- Photo and metadata use
- Sharing, copying itineraries, and public content
- Reports, moderation, and appeals
- Retention, deletion, and contact details

**Actions:** Back to help.

**States and rules:** Version/date shown; readable signed out; policy text in this prototype is not a final legal document.

## Moderation dashboard

**Route:** `/admin` · **Stage:** P2 · **Wireframe ID:** `admin`

Restricted moderator workspace, separate from the public app.

**Layout and content:**

- Open reports • Pending reviews • Overdue guides
- Report queue · target / reason / age / assignee
- Content preview with minimum necessary access
- Action reason
- Dismiss • Hide • Escalate • Suspend

**Actions:** Review report; Guide editorial queue.

**States and rules:** Authorisation denied, audit log, appeal/reversal, conflicting moderator actions, and privacy-restricted previews.

## Guide editorial workspace

**Route:** `/admin/guides` · **Stage:** P3 · **Wireframe ID:** `editor`

Draft, review, publish, and check sources.

**Layout and content:**

- Title / slug / destination / topic
- Article body
- Official sources
- Last checked / review due
- Draft • In review • Published
- Corrections and version history

**Actions:** Save draft; Preview guide.

**States and rules:** Moderator/editor roles differ; broken sources, stale version conflict, publication validation, and rollback.

## Creator discovery

**Route:** `/creators` · **Stage:** P5 · **Wireframe ID:** `creators`

Broader discovery grows after the friends experience works.

**Layout and content:**

- Cities • Outdoors • Food • Budget
- Creator collection · a week of city walks
- Creator bio · clear sponsorship labels
- Friends remain in the Following feed.

**Actions:** View creator; Open collection.

**States and rules:** No fake verified badge; sponsored versus organic separation; hidden/blocked creators.

## Traveller groups

**Route:** `/groups` · **Stage:** P5 · **Wireframe ID:** `groups`

Choose where and how you want to connect.

**Layout and content:**

- Country / city / interest
- Public • Private • My groups
- Barcelona weekend walks · public
- Japan autumn travellers · request to join

**Actions:** Open group; Discover activity.

**States and rules:** No groups, membership pending, moderation capacity, and no automatic location inference.

## Group detail

**Route:** `/groups/:id` · **Stage:** P5 · **Wireframe ID:** `group`

Group rules and membership come before meeting details.

**Layout and content:**

- About · organiser · rules · member count
- Discussion • Activities • Members
- Saturday city walk · RSVP available
- Post to group

**Actions:** View activity; Report group.

**States and rules:** Private membership gate, banned member, locked posts, pending join, and organiser permissions.

## Meetup / activity

**Route:** `/activities/:id` · **Stage:** P5 · **Wireframe ID:** `event`

An optional way to meet other travellers.

**Layout and content:**

- Date / time / timezone
- Approximate meeting area
- Exact meeting details visible to permitted participants
- Organiser and group rules
- Going • Interested • Cancel RSVP

**Actions:** RSVP; Open group; Report activity.

**States and rules:** Cancelled/full event, eligibility, private location, changed time notification, and no mandatory GPS.

## Unavailable / offline

**Route:** `/unavailable` · **Stage:** P1 · **Wireframe ID:** `unavailable`

Keep the next step clear without revealing private content.

**Layout and content:**

- This item may be private, removed, or temporarily unavailable.
- Your unsent draft stays on this device until it can sync.
- Offline map fallback: searchable visited-country list.

**Actions:** Try again; My trips; Get help.

**States and rules:** Distinct handling for offline, denied, not found, expired link, quota exhausted, and maintenance.
