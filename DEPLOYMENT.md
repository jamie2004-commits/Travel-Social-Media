# Independent prototype hosting

The current code is a standalone Node web app. It has no ChatGPT sign-in dependency.

Prototype username: `user123`
Prototype password: `password`

Run `npm start` or double-click `Start Roam.cmd`, then open http://localhost:8001/login. Node 22 or later is required; there are no npm dependencies to install. The username/password are checked on the server. Signed sessions use HttpOnly cookies; production cookies also require HTTPS. Sign out invalidates the session without deleting local trips or photos. A server restart requires signing in again.

## Deployment state

For phone testing before deployment, run **Start Roam Phone.cmd** and open its printed Wi-Fi URL on a phone connected to the same trusted network. It uses port 8002 and listens on the laptop's network interfaces. Keep the laptop awake; stop the server window when finished. A firewall prompt should be allowed on private networks only. Guest Wi-Fi may isolate devices. This local HTTP mode needs no hosting account; it is for testing on your trusted Wi-Fi, not internet access. The UUID fallback supports trip creation/copying, photo saving, and restores in ordinary HTTP browser contexts.

To run the browser tests through a LAN address, set `ROAM_TEST_HOST` to that address before running `node scripts/check-browser.cjs`. The test also asserts that it is exercising an ordinary, non-secure HTTP context.

Independent hosting is prepared but has not been deployed. The Render integration must be connected to create the new service. The previous ChatGPT Sites deployment is unchanged and is not the new login version.

`python scripts/package-independent.py` creates a validated deployment zip and the `independent-release/` folder. Only deployable app files are included. The original booking HTML, Git metadata, and previous hosting credentials are excluded. The package includes the trip seed behind server authentication; use a private source repository for it.

For Render, create a **Node web service**, not a static site, using the prepared `render.yaml`. Start command: `node server.cjs`. Build command: `node --check server.cjs`. Health check: `/healthz`. The server binds to `0.0.0.0` and the platform-provided `PORT`. `ROAM_USERNAME` and `ROAM_PASSWORD` override the prototype credentials; `NODE_ENV=production` enables Secure cookies. Configuration follows [Render web-service documentation](https://render.com/docs/web-services).

## Data and connection behavior

This is one shared prototype account. Photos, itinerary edits, and spending are still saved in each browser, not in a cloud account. Before moving from the old site, export its backup. On the new site, use Storage & backups to import it; trips are restored as copies. Accessing browser data previously saved locally is not prevented by this website login.

Signing in and reopening the app need a connection. The old cache-first service worker is retired so cached pages cannot bypass logout. An already-open trip can keep saving local changes during a temporary outage. Preserve camera originals and download backups regularly.

## Checks

- `npm test`: login, protected assets, logout, origin checks, throttling, and prototype regression checks.
- `node scripts/check-browser.cjs`: actual login UI, wrong password, session reload, logout, photo and itinerary flows, and mobile layout. Set `CHROME_PATH` if needed.

After deployment, verify the new live URL in a fresh browser before replacing the old hosted link. Do not use the legacy `scripts/build-site.py`/Sites static deployment flow for this authenticated app.
