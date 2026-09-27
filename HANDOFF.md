# Collaborator quick start

1. Clone this repository and check out `main`.
2. Install Node.js 22 or later. There are no npm dependencies to install.
3. Run `npm start`, then open http://localhost:8001/login.
4. Sign in with prototype username `user123` and password `password`.
5. Run `npm test` for the server-authentication and prototype regression checks.

On Windows, `Start Roam.cmd` starts laptop testing. `Start Roam Phone.cmd` starts phone testing on port 8002 and prints the laptop's current network address. Connect both devices to the same trusted Wi-Fi. Do not reuse another developer's LAN address from historical notes.

## Current implementation

- `server.cjs`, `login.*`, `auth-client.js`: standalone Node server, prototype login, protected app files, and logout.
- `prototype.js`, `prototype-itinerary.js`, `prototype-social.js`, `prototype-travel.js`: navigation, trip editing, example friend feed, journal, and expenses.
- `prototype-photos.js`, `prototype-backup.js`: browser-local photo storage and backup/restore. There is no cloud data sync or real multi-user social backend.
- `prototype-trip.js`: sanitized Hangzhou/Shanghai itinerary seed. The private original booking HTML is deliberately not committed. You do not need it to run or test the app; only to regenerate this seed using `scripts/import-itinerary.py`.
- `prototype-map.js`: embedded country map data; source attribution is in `docs/assets/ATTRIBUTION.md`.

An internet connection is required to sign in or reopen the authenticated version. Existing app-shell caching was retired to avoid bypassing logout. See `DEPLOYMENT.md` for current behavior; older README sections describe earlier versions.

## Outstanding deployment work

Independent hosting is prepared but not deployed. `render.yaml` describes a Node web service. `python scripts/package-independent.py` builds a deployment package from an explicit file list. A connected hosting account and source repository setup are still needed.

The previous ChatGPT Sites publication is an older prototype. `.openai/` retains its non-secret deployment metadata for continuity; do not use the legacy static Sites build/push helpers for the authenticated app.

## Browser testing

Run `node scripts/check-browser.cjs` with `CHROME_PATH` set to your Chromium/Chrome executable. It creates an isolated test profile and checks login, logout, friend-trip copying, photo persistence, backup/restore, journal/spending, and mobile layouts. Set `ROAM_TEST_HOST` to your laptop's current LAN address to test plain HTTP phone behavior. This does not replace testing on an actual iPhone/Android device.
