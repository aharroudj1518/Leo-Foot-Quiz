# Expo web deployment

The public deployment checked on 9 September 2026 returned the raw 307-byte
`index.ts` entry point with Content-Type `video/mp2t`. It was serving source,
not an Expo web export.

The root `vercel.json` now selects `npm run build:web` and serves only `dist`.
Vercel checks existing static files before the SPA fallback rewrite, so JavaScript,
images and fonts remain accessible at their exported paths.

In the Vercel project, use the directory containing this file and `package.json`
as Root Directory. This directory is the root of the Leo-Foot-Quiz Git repository;
its longer local Windows path is not a Git repository subdirectory.
Use the Other framework preset. Deploy a revision containing this configuration
and the intended app changes; redeploying an older revision will not include them.

Verify that `/` returns HTML, that its referenced JavaScript and images load,
and play a complete quiz on a phone-sized viewport. A local export passing does
not establish that the production deployment has been updated.

Reference: https://docs.expo.dev/guides/publishing-websites/

## Recovery verified

The signed-in Vercel project was corrected to use `npx expo export --platform web`
and output `dist`. Redeployment `E9M99GPnrowpTL9HKJkqvUxvntJt` finished successfully
and the public URL opened the app in the browser. This recovered deployment uses
the old `128313c` revision; it does not include the local visual edition.
