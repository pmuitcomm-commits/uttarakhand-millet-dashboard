# _headers Fix Report

## File Created
- Path: `d:\millet-dashboard\frontend\public\_headers`

## Backend API URL Found
- Not found. Placeholder used in `_headers`: `https://<backend-api-domain>`
- Comment: no concrete production FastAPI backend URL was found in `frontend/src/services/api.js`, `.env*`, config files, docs, or Render config. The only concrete Render URL found was `https://uttarakhand-millet-dashboard.onrender.com`, which appears as a frontend/CORS origin rather than the backend API base URL.

## External Domains Found
- `https://fonts.googleapis.com` - `frontend/src/index.css:8`; Google Fonts stylesheet import.
- `https://fonts.gstatic.com` - inferred from the Google Fonts stylesheet referenced in `frontend/src/index.css:8`; required Google Fonts font-file host.
- `https://images.unsplash.com` - `frontend/src/pages/aboutpage.jsx:696` and `frontend/src/pages/aboutpage.jsx:1010`; CSS background images.
- `https://static.pib.gov.in` - `frontend/src/data/schemes.js:12`; PDF URL opened from `frontend/src/components/TopBar.js:89`.
- `https://nfsm.gov.in` - `frontend/src/data/schemes.js:16`; PDF URL opened from `frontend/src/components/TopBar.js:89`.
- `https://cdnbbsr.s3waas.gov.in` - `frontend/src/data/schemes.js:21`; PDF URL opened from `frontend/src/components/TopBar.js:89`.
- `https://www.pib.gov.in` - `frontend/src/data/schemes.js:25`; external scheme URL opened from `frontend/src/components/TopBar.js:89`.
- `https://pmfby.gov.in` - `frontend/src/data/schemes.js:29`; PDF URL opened from `frontend/src/components/TopBar.js:89`.
- `https://india.gov.in` - `frontend/src/pages/aboutpage.jsx:1308`; footer outbound link.
- `https://uk.gov.in` - `frontend/src/pages/aboutpage.jsx:1309`; footer outbound link.
- `https://agriculture.uk.gov.in` - `frontend/src/pages/aboutpage.jsx:1310`; footer outbound link.
- `https://agricoop.nic.in` - `frontend/src/pages/aboutpage.jsx:1311`; footer outbound link.
- `https://mkisan.gov.in` - `frontend/src/pages/aboutpage.jsx:1312`; footer outbound link.
- `http://localhost:8000` - `frontend/src/services/api.js:17`; local development API fallback, excluded from `_headers` because the file is production-only.

## Final CSP Policy
default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; img-src 'self' data: https://images.unsplash.com; font-src 'self' data: https://fonts.gstatic.com; connect-src 'self' https://<backend-api-domain>;

## What to do next
1. git add frontend/public/_headers
2. git commit -m "fix: add security headers for Render static site"
3. git push
4. Wait for Render to redeploy (2-3 minutes)
5. Re-run securityheaders.com - target grade: A or B
6. Re-run observatory.mozilla.org
7. Open browser DevTools -> Console - look for any CSP violation errors
8. If violations appear: note the blocked domain, add it to the correct
   CSP directive in _headers, commit and push again

## Known Risks
- 'unsafe-inline' in script-src: flag for future tightening with nonces
- 'unsafe-inline' in style-src: required for React inline styles and Tailwind
- Any external domains in connect-src that are not your own API should be
  reviewed - do you need them, or can they be removed?
