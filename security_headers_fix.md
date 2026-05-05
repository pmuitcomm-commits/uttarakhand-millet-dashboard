# Security Headers Fix Report

## File Modified
- Path: `backend/app/main.py`

## Changes Made
No existing security header middleware was found. The only existing match for the requested security header names was a documentation finding in `security_report.md`.

### Imports Added
- `from starlette.middleware.base import BaseHTTPMiddleware`
- `from starlette.requests import Request`
- `from starlette.responses import Response`

### Middleware Added
```python
class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next) -> Response:
        response = await call_next(request)
        response.headers["X-Frame-Options"] = "SAMEORIGIN"
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
        response.headers["Permissions-Policy"] = "camera=(), microphone=(), geolocation=()"
        response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
        response.headers["Content-Security-Policy"] = (
            "default-src 'self'; "
            "script-src 'self' 'unsafe-inline'; "
            "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; "
            "img-src 'self' data: "
            "https://images.unsplash.com "
            "https://static.pib.gov.in "
            "https://nfsm.gov.in "
            "https://cdnbbsr.s3waas.gov.in "
            "https://www.pib.gov.in "
            "https://pmfby.gov.in "
            "https://india.gov.in "
            "https://uk.gov.in "
            "https://agriculture.uk.gov.in "
            "https://agricoop.nic.in "
            "https://mkisan.gov.in; "
            "font-src 'self' data: https://fonts.gstatic.com; "
            "connect-src 'self' "
            "https://uttarakhand-millet-dashboard.onrender.com "
            "https://images.unsplash.com "
            "https://static.pib.gov.in "
            "https://nfsm.gov.in "
            "https://cdnbbsr.s3waas.gov.in "
            "https://www.pib.gov.in "
            "https://pmfby.gov.in "
            "https://india.gov.in "
            "https://uk.gov.in "
            "https://agriculture.uk.gov.in "
            "https://agricoop.nic.in "
            "https://mkisan.gov.in;"
        )
        return response
```

### CORS Updated
- Before: `allow_origins=allowed_origins`, where `allowed_origins` was:
```python
[
    "https://uttarakhand-millet-dashboard.onrender.com",
    "http://localhost:3000",
    "http://localhost:5173",
]
```
- Before methods/headers: `allow_methods=["*"]`, `allow_headers=["*"]`
- After: `allow_origins=["https://uttarakhand-millet-dashboard.onrender.com"]`
- After methods/headers: `allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"]`, `allow_headers=["Authorization", "Content-Type", "Accept"]`

### Middleware Registration Order
```python
app.add_middleware(SecurityHeadersMiddleware)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://uttarakhand-millet-dashboard.onrender.com"],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type", "Accept"],
)
```

## External Resources Found in Frontend
- `fonts.googleapis.com` - Google Fonts stylesheet import in `frontend/src/index.css`
- `fonts.gstatic.com` - Google Fonts font files required by the Google Fonts stylesheet
- `images.unsplash.com` - CSS background images in `frontend/src/pages/aboutpage.jsx`
- `localhost:8000` - local development API fallback in `frontend/src/services/api.js`; not included in production CORS
- `static.pib.gov.in` - scheme PDF link in `frontend/src/data/schemes.js`
- `nfsm.gov.in` - scheme PDF link in `frontend/src/data/schemes.js`
- `cdnbbsr.s3waas.gov.in` - scheme PDF link in `frontend/src/data/schemes.js`
- `www.pib.gov.in` - scheme page link in `frontend/src/data/schemes.js`
- `pmfby.gov.in` - scheme PDF link in `frontend/src/data/schemes.js`
- `india.gov.in` - footer external link in `frontend/src/pages/aboutpage.jsx`
- `uk.gov.in` - footer external link in `frontend/src/pages/aboutpage.jsx`
- `agriculture.uk.gov.in` - footer external link in `frontend/src/pages/aboutpage.jsx`
- `agricoop.nic.in` - footer external link in `frontend/src/pages/aboutpage.jsx`
- `mkisan.gov.in` - footer external link in `frontend/src/pages/aboutpage.jsx`

No CDN script tags were found in `frontend/src`. `chart.js` is imported from the bundled npm package, not from a CDN.

## CSP Policy Written
```text
default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; img-src 'self' data: https://images.unsplash.com https://static.pib.gov.in https://nfsm.gov.in https://cdnbbsr.s3waas.gov.in https://www.pib.gov.in https://pmfby.gov.in https://india.gov.in https://uk.gov.in https://agriculture.uk.gov.in https://agricoop.nic.in https://mkisan.gov.in; font-src 'self' data: https://fonts.gstatic.com; connect-src 'self' https://uttarakhand-millet-dashboard.onrender.com https://images.unsplash.com https://static.pib.gov.in https://nfsm.gov.in https://cdnbbsr.s3waas.gov.in https://www.pib.gov.in https://pmfby.gov.in https://india.gov.in https://uk.gov.in https://agriculture.uk.gov.in https://agricoop.nic.in https://mkisan.gov.in;
```

## What to Test After Deploying
1. Run securityheaders.com against the live URL - target grade: A or B
2. Open the app in browser - check DevTools console for any CSP violation errors
3. If CSP violations appear, note the blocked domain and add it to connect-src/img-src/font-src accordingly
4. Test login, data fetch, charts, maps - all functionality should still work

## Known CSP Risks
- `script-src 'unsafe-inline'` is allowed because the requested baseline policy included it. Future tightening should replace this with nonces or hashes if inline script execution is not required.
- `style-src 'unsafe-inline'` is allowed because the React frontend uses inline style attributes and Tailwind-generated utility styling patterns. Future tightening should move inline styles into stylesheet classes or use hashes where practical.
- External document/navigation links were included in `img-src` and `connect-src` because the frontend scan found them in React source. If they remain simple outbound links only, they can be removed from those directives in a later CSP tightening pass.
