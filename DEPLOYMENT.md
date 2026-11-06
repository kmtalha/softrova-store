# 🚀 Softrova App Store — Cloudflare Pages & FastAPI Deployment Guide

This guide details how to deploy the **Softrova App Store** frontend to **Cloudflare Pages (Free Tier)**, point it to `store.softrova.com`, and connect the `/admin/upload` portal to a secure **FastAPI** backend storing binaries in **Cloudflare R2**.

---

## 1. Cloudflare Pages Deployment (Frontend)

The frontend is built with **Next.js 14 App Router** and configured for **Static Site Generation (SSG)** (`output: 'export'`), outputting directly to the `out/` directory.

### Step-by-Step Setup:
1. Push this repository to GitHub or GitLab.
2. Go to the [Cloudflare Dashboard](https://dash.cloudflare.com/) > **Compute (Workers & Pages)** > **Create application** > **Pages** > **Connect to Git**.
3. Select your repository (`Softrova`).
4. Set the **Build settings**:
   - **Framework preset**: `Next.js (Static HTML Export)`
   - **Build command**: `npm run build`
   - **Build output directory**: `out`
   - **Node.js Version**: `18.x` or `20.x` (set environment variable `NODE_VERSION` = `20.15.0`)
5. Click **Save and Deploy**. Cloudflare will deploy your site globally across 300+ edge locations in under a minute.

---

## 2. Subdomain Setup (`store.softrova.com`)

1. In the Cloudflare Dashboard, select your domain **softrova.com**.
2. Navigate to **DNS** > **Records**.
3. Click **Add Record**:
   - **Type**: `CNAME`
   - **Name**: `store`
   - **Target**: `<your-pages-project-name>.pages.dev` (e.g. `softrova-store.pages.dev`)
   - **Proxy status**: `Proxied (Orange Cloud)`
   - **TTL**: `Auto`
4. Now open your Pages project > **Custom domains** tab > **Set up a custom domain** > enter `store.softrova.com`. Cloudflare will automatically provision SSL certificates.

---

## 3. Security & Content Security Policy (CSP)

Cloudflare Pages automatically reads the included [`public/_headers`](file:///c:/Users/K%20M%20Talha/Downloads/Softrova/public/_headers) file upon deployment. This enforces:
- `Content-Security-Policy`: Restricts scripts, styles, and frames to prevent XSS.
- `Strict-Transport-Security`: HSTS with preload.
- `X-Frame-Options: DENY`: Clickjacking protection.
- `X-Content-Type-Options: nosniff`: MIME-type sniffing mitigation.
- Long-term immutable caching for static assets in `/_next/static/*`.

---

## 4. Admin Upload Logic (FastAPI + Cloudflare R2)

The route [`/admin/upload`](file:///c:/Users/K%20M%20Talha/Downloads/Softrova/src/app/admin/upload/page.tsx) provides a visual publishing portal. To connect it to your live storage:

### Architecture Flow:
```
Admin Browser (/admin/upload) 
  --> [POST with JWT] --> FastAPI Server (Python)
    --> Calculates SHA-256 Checksum
    --> Streams binary to Cloudflare R2 Bucket (Zero Egress Fees)
    --> Triggers Cloudflare Pages Deploy Hook (Re-generates SSG Store Catalog)
```

### FastAPI Implementation Example:
```python
# main.py
import os, hashlib, boto3
from fastapi import FastAPI, UploadFile, File, Form, Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="Softrova Store API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://store.softrova.com", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

auth_scheme = HTTPBearer()

# Connect to Cloudflare R2 via S3-compatible Boto3 API
r2 = boto3.client(
    "s3",
    endpoint_url=f"https://{os.environ['CLOUDFLARE_ACCOUNT_ID']}.r2.cloudflarestorage.com",
    aws_access_key_id=os.environ["R2_ACCESS_KEY_ID"],
    aws_secret_access_key=os.environ["R2_SECRET_ACCESS_KEY"],
    region_name="auto"
)
BUCKET_NAME = "softrova-apps"

def verify_jwt(creds: HTTPAuthorizationCredentials = Depends(auth_scheme)):
    if creds.credentials != os.environ.get("ADMIN_JWT_SECRET"):
        raise HTTPException(status_code=401, detail="Unauthorized")
    return True

@app.post("/api/v1/apps/upload")
async def upload_app(
    file: UploadFile = File(...),
    app_name: str = Form(...),
    version: str = Form(...),
    category: str = Form(...),
    authenticated: bool = Depends(verify_jwt)
):
    body = await file.read()
    sha256 = hashlib.sha256(body).hexdigest()
    
    key = f"{category.lower()}/{file.filename}"
    r2.put_object(
        Bucket=BUCKET_NAME,
        Key=key,
        Body=body,
        ContentType=file.content_type
    )
    
    return {
        "status": "success",
        "name": app_name,
        "version": version,
        "sha256": sha256,
        "download_url": f"https://cdn.softrova.com/{key}"
    }
```

---

## 5. Local Development Commands

- **Start Dev Server**: `npm run dev` (Runs on `http://localhost:3000`)
- **Build Static Site**: `npm run build` (Outputs ready-to-deploy static files into `out/`)
