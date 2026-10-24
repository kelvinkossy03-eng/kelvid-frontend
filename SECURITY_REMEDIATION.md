# Security and deployment notes

## Required before production
- Configure `KELVID_API_KEY` as a server-side secret on the backend. The API now fails closed when it is missing.
- Configure `CORS_ORIGINS` as a comma-separated allowlist of exact deployed frontend origins. Do not use `*`.
- The frontend must not contain a shared backend secret. A key entered in browser settings is visible to the user and to any script running on the page; it is not a substitute for user authentication. Put a trusted server-side proxy or real user authentication/authorization in front of paid inference before production.
- The login form intentionally reports that authentication is not configured rather than creating a fake local account. Implement a real identity provider (for example Firebase Auth or another server-verified provider) before enabling account creation.
- Credits, plans, and upgrades must be stored and enforced server-side. The current client-side plan display is not billing or entitlement enforcement.
- Job/gallery routes are protected by the API key, but they are not yet scoped to individual users. Add owner IDs and enforce ownership before enabling multiple customer accounts.
- The job queue and metadata are local disk/thread based. Use durable shared storage and a managed queue for horizontally scaled production deployments.
- Set Firebase project/target in CLI configuration or deploy with the correct project explicitly; project IDs do not belong in the Hosting object in `firebase.json`.

## Changes in this branch
- Fail-closed API-key check with constant-time comparison.
- Configurable explicit CORS origins; no wildcard origin.
- Authentication required for gallery and job-list/status reads.
- Model/provider combinations restricted to configured recommendations.
- Correct Firebase Hosting JSON shape.
- Ignore debug logs and generated output metadata.
- Removed committed Firebase CLI debug log.
- Login UI no longer reports a fake successful login.
