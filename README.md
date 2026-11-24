# CLAMOTAG – Interactive RFID Reader Demo

A premium, interactive 3D RFID Reader demonstration application built with React, TypeScript, Vite and Three.js.

The application provides an interactive RFID punching experience with a realistic 3D reader model, employee card selection, device status indicators, audio feedback and real-time activity updates.

## 1. Technology Stack

| Technology | Purpose |
|---|---|
| React 19 | Frontend UI |
| TypeScript | Type safety |
| Vite | Development and production build |
| Tailwind CSS 4 | Styling |
| Three.js | 3D rendering |
| React Three Fiber | React-based 3D integration |
| Drei | 3D utilities and model loading |

## 2. Project Structure

```text
clamotag-rfid-demo/
│
├── public/
│   ├── brands/
│   │   ├── clamotag-Darkmode.png
│   │   └── clamotag-Lightmode.png
│   │
│   ├── models/
│   │   └── rfid/
│   │       └── clamotag_rfid.glb
│   │
│   └── sounds/
│       └── rfid/
│           └── rfid_beep_sound.mp3
│
├── src/
│   ├── components/
│   ├── state/
│   ├── assets/
│   ├── styles/
│   ├── App.tsx
│   └── main.tsx
│
├── index.html
├── package.json
├── package-lock.json
├── vite.config.ts
├── tsconfig.json
└── README.md
```

*Update this structure if the actual project folders differ.*

## 3. Prerequisites

Install the following:

- Node.js (compatible with the project dependencies)
- npm
- Git

Check installed versions:

```bash
node -v
npm -v
git --version
```

## 4. Local Development Setup

Clone the repository:

```bash
git clone YOUR_GITHUB_REPOSITORY_URL
```

Navigate into the project:

```bash
cd clamotag-rfid-demo
```

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Open:

```text
http://localhost:5173/
```

## 5. Production Build

Generate the production build:

```bash
npm run build
```

The production-ready files will be generated inside:

```text
dist/
```

Preview the production build locally:

```bash
npm run preview
```

Run lint checks:

```bash
npm run lint
```

## 6. Production Server Details

**Hosting Environment**

| Configuration | Value |
|---|---|
| Server Provider | DigitalOcean |
| Operating System | Ubuntu 24.04 LTS |
| Web Server | Nginx |
| Domain | https://tamsen.in |
| Application Directory | `/var/www/html/clamotag3ddemo` |
| Application URL | `https://tamsen.in/clamotag3ddemo/` |

## 7. Production Deployment

### Step 1: Connect to the server

```bash
ssh YOUR_SERVER_USER@YOUR_SERVER_IP
```

### Step 2: Navigate to the deployment directory

```bash
cd /var/www/html/clamotag3ddemo
```

### Step 3: Build the application locally

On your development machine:

```bash
npm install
npm run build
```

### Step 4: Upload production files

Upload the contents of the local `dist/` directory to:

```text
/var/www/html/clamotag3ddemo/
```

Example using SCP from your local project directory:

```bash
scp -r dist/* YOUR_SERVER_USER@YOUR_SERVER_IP:/var/www/html/clamotag3ddemo/
```

Ensure the upload includes:

- `index.html`
- `assets/`
- All required public model, sound and branding assets.

### Step 5: Verify deployment

Open:

```text
https://tamsen.in/clamotag3ddemo/
```

Check the browser console and Network tab for missing assets or 404 errors.

## 8. Nginx Configuration

The application is hosted under the `/clamotag3ddemo/` URL path.

The Nginx configuration must serve the application from:

```text
/var/www/html/clamotag3ddemo/
```

Example location configuration:

```nginx
location = /clamotag3ddemo {
    return 301 /clamotag3ddemo/;
}

location ^~ /clamotag3ddemo/ {
    alias /var/www/html/clamotag3ddemo/;
    index index.html;
    try_files $uri $uri/ /clamotag3ddemo/index.html;
}
```

Before applying this configuration, inspect the existing Nginx server block and avoid duplicate location definitions.

Validate Nginx:

```bash
sudo nginx -t
```

Reload Nginx:

```bash
sudo systemctl reload nginx
```

## 9. Vite Base Path Configuration

Since the application is hosted inside a subdirectory, configure the correct Vite base path.

In `vite.config.ts`:

```ts
export default defineConfig({
  base: "/clamotag3ddemo/",
  plugins: [react()],
});
```

For assets referenced in TypeScript, use the configured base URL rather than hardcoding domain-root paths.

Example:

```ts
const MODEL_URL = `${import.meta.env.BASE_URL}models/rfid/clamotag_rfid.glb`;

const SOUND_URL = `${import.meta.env.BASE_URL}sounds/rfid/rfid_beep_sound.mp3`;

const LOGO_DARK = `${import.meta.env.BASE_URL}brands/clamotag-Darkmode.png`;

const LOGO_LIGHT = `${import.meta.env.BASE_URL}brands/clamotag-Lightmode.png`;
```

This ensures assets resolve correctly under `/clamotag3ddemo/`.

## 10. Production Asset Paths

Expected public asset locations:

| Asset | Production URL |
|---|---|
| RFID 3D Model | `/clamotag3ddemo/models/rfid/clamotag_rfid.glb` |
| RFID Beep | `/clamotag3ddemo/sounds/rfid/rfid_beep_sound.mp3` |
| Dark Logo | `/clamotag3ddemo/brands/clamotag-Darkmode.png` |
| Light Logo | `/clamotag3ddemo/brands/clamotag-Lightmode.png` |

Verify each asset returns HTTP 200 after deployment.

## 11. Deployment Checklist

- [ ] Install dependencies successfully.
- [ ] Run production build.
- [ ] Confirm `dist/` contains all required assets.
- [ ] Upload production files to the correct server directory.
- [ ] Verify Nginx configuration.
- [ ] Verify application URL.
- [ ] Verify GLB model loads successfully.
- [ ] Verify branding images and audio files load.
- [ ] Check browser console for errors.
- [ ] Test Light Mode and Dark Mode.
- [ ] Test RFID punching and existing functionality.

## 12. Important Notes

- Never upload `node_modules/` to the production web directory.
- Never expose `.env` files or private credentials.
- Upload the contents of `dist/`, not the entire development project.
- Keep the public asset folder structure consistent.
- Ensure Vite's `base` configuration matches the actual hosting path.
- Preserve the existing Nginx configuration when deploying.
- Test production builds before uploading them to the live server.

---

**Project:** CLAMOTAG RFID Interactive Demo

**Deployment URL:** https://tamsen.in/clamotag3ddemo/