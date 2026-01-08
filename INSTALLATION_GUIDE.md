# FitMood App - Complete Installation Guide

This guide will walk you through setting up and deploying the FitMood mood tracking application.

## 📋 Table of Contents

1. [Prerequisites](#prerequisites)
2. [Local Development Setup](#local-development-setup)
3. [Production Build](#production-build)
4. [Deployment Options](#deployment-options)
5. [Backend Setup (Google Apps Script)](#backend-setup-google-apps-script)
6. [PWA Installation](#pwa-installation)
7. [Troubleshooting](#troubleshooting)

## Prerequisites

Before you begin, ensure you have:

- ✅ **Node.js** v16 or higher ([Download](https://nodejs.org/))
- ✅ **npm** (comes with Node.js) or **yarn**
- ✅ A code editor (VS Code recommended)
- ✅ A Google account (for Apps Script backend)
- ✅ A modern web browser (Chrome, Firefox, Edge, Safari)

## Local Development Setup

### Step 1: Install Node.js

1. Download Node.js from [nodejs.org](https://nodejs.org/)
2. Install it following the installer instructions
3. Verify installation:
   ```bash
   node --version
   npm --version
   ```

### Step 2: Clone or Download the Project

If using Git:
```bash
git clone <repository-url>
cd fitmood-app
```

Or download and extract the ZIP file, then navigate to the folder.

### Step 3: Install Dependencies

Open terminal/command prompt in the project folder and run:

```bash
npm install
```

This will install all required packages:
- React and React DOM
- Vite (build tool)
- Tailwind CSS
- Recharts (charts)
- Lucide React (icons)
- vite-plugin-pwa (PWA support)

**Expected time:** 2-5 minutes depending on internet speed

### Step 4: Configure API URL

1. Open `src/App.jsx` in your code editor
2. Find the line:
   ```javascript
   const API_URL = 'https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec';
   ```
3. Replace `YOUR_SCRIPT_ID` with your Google Apps Script Web App URL
   (See [Backend Setup](#backend-setup-google-apps-script) section)

### Step 5: Start Development Server

```bash
npm run dev
```

You should see:
```
  VITE v4.x.x  ready in xxx ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

Open `http://localhost:5173` in your browser.

### Step 6: Test the Application

1. The app should load with a splash screen
2. Navigate to the auth page
3. Try registering a new account
4. Test mood logging
5. Check dark mode toggle
6. Test offline mode (disable network in DevTools)

## Production Build

### Step 1: Build the Application

```bash
npm run build
```

This creates an optimized production build in the `dist` folder.

**Build output:**
- Optimized JavaScript bundles
- Minified CSS
- Service worker files
- PWA manifest
- Static assets

### Step 2: Preview Production Build

```bash
npm run preview
```

This serves the production build locally for testing.

### Step 3: Verify Build

Check the `dist` folder contains:
- `index.html`
- `assets/` folder with JS and CSS files
- `sw.js` (service worker)
- `manifest.webmanifest`
- Icon files

## Deployment Options

### Option 1: Netlify (Recommended)

1. **Install Netlify CLI:**
   ```bash
   npm install -g netlify-cli
   ```

2. **Build the app:**
   ```bash
   npm run build
   ```

3. **Deploy:**
   ```bash
   netlify deploy --prod --dir=dist
   ```

4. **Or use Netlify Dashboard:**
   - Go to [netlify.com](https://netlify.com)
   - Drag and drop the `dist` folder
   - Your app is live!

### Option 2: Vercel

1. **Install Vercel CLI:**
   ```bash
   npm install -g vercel
   ```

2. **Deploy:**
   ```bash
   vercel --prod
   ```

3. **Or use Vercel Dashboard:**
   - Connect your Git repository
   - Vercel auto-detects Vite
   - Automatic deployments on push

### Option 3: GitHub Pages

1. **Install gh-pages:**
   ```bash
   npm install --save-dev gh-pages
   ```

2. **Update `package.json`:**
   ```json
   "scripts": {
     "deploy": "npm run build && gh-pages -d dist"
   }
   ```

3. **Deploy:**
   ```bash
   npm run deploy
   ```

### Option 4: Traditional Web Hosting

1. Build the app:
   ```bash
   npm run build
   ```

2. Upload the `dist` folder contents to your web server
3. Ensure your server supports:
   - HTTPS (required for PWA features)
   - Service workers
   - SPA routing (redirect all routes to index.html)

## Backend Setup (Google Apps Script)

The app requires a backend API. Here's how to set it up:

### Step 1: Create Google Apps Script

1. Go to [script.google.com](https://script.google.com)
2. Click "New Project"
3. Delete the default code

### Step 2: Add Your Backend Code

Copy your Google Apps Script code (the one that handles API calls) into the editor.

**Required endpoints:**
- `login` - User authentication
- `register` - User registration  
- `getUserMoods` - Get mood history
- `getUserStats` - Get statistics
- `addMood` - Save mood entry
- `getAllUsers` - Admin endpoint
- `getUserDetails` - Admin endpoint

### Step 3: Deploy as Web App

1. Click "Deploy" → "New deployment"
2. Select type: "Web app"
3. Configure:
   - **Execute as:** Me
   - **Who has access:** Anyone
4. Click "Deploy"
5. Copy the Web App URL

### Step 4: Update API URL in App

Update `src/App.jsx` with your Web App URL:
```javascript
const API_URL = 'https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec';
```

## PWA Installation

### For Users

#### Desktop (Chrome/Edge)

1. Open the app in browser
2. Look for install icon in address bar
3. Click "Install" or use menu → "Install FitMood"
4. App opens in standalone window

#### Mobile (Android)

1. Open app in Chrome
2. Tap menu (3 dots)
3. Select "Add to Home screen"
4. App icon appears on home screen

#### Mobile (iOS Safari)

1. Open app in Safari
2. Tap Share button
3. Select "Add to Home Screen"
4. App icon appears on home screen

### For Developers

Ensure your deployment:
- ✅ Uses HTTPS
- ✅ Has valid manifest.webmanifest
- ✅ Service worker is registered
- ✅ Icons are properly sized (192x192, 512x512)

## Troubleshooting

### "Module not found" errors

```bash
# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Build fails

1. Check Node.js version: `node --version` (should be v16+)
2. Clear npm cache: `npm cache clean --force`
3. Reinstall: `npm install`

### Offline mode not working

1. Check browser console for errors
2. Verify IndexedDB is enabled in browser
3. Check service worker registration:
   - Open DevTools → Application → Service Workers
   - Should see registered worker

### Notifications not showing

1. **HTTPS required** - Notifications only work on HTTPS
2. Check browser permissions:
   - Chrome: Settings → Privacy → Notifications
3. Verify service worker is active
4. Check browser console for permission errors

### Dark mode not working

1. Verify `tailwind.config.js` has:
   ```javascript
   darkMode: 'class'
   ```
2. Check if `dark` class is added to `<html>` element
3. Clear browser cache

### API calls failing

1. Verify API URL is correct in `src/App.jsx`
2. Check CORS settings in Google Apps Script
3. Ensure Web App is deployed and accessible
4. Check browser console for error messages

### Charts not displaying

1. Verify Recharts is installed: `npm list recharts`
2. Check browser console for errors
3. Ensure data is in correct format
4. Verify ResponsiveContainer has width/height

## Development Tips

### Hot Module Replacement (HMR)

Vite provides instant HMR. Changes to files automatically update in browser.

### Debugging

1. **React DevTools:** Install browser extension
2. **Network Tab:** Monitor API calls
3. **Application Tab:** Check localStorage, IndexedDB, Service Workers
4. **Console:** Check for errors and warnings

### Performance

- Production build is optimized automatically
- Code splitting is handled by Vite
- Images are optimized during build
- Service worker caches assets for offline use

## Next Steps

After installation:

1. ✅ Test all features locally
2. ✅ Set up backend API
3. ✅ Build for production
4. ✅ Deploy to hosting
5. ✅ Test PWA installation
6. ✅ Configure notifications
7. ✅ Test offline functionality

## Support

For issues:
1. Check this guide
2. Review browser console errors
3. Check [FUTURE_ENHANCEMENTS.md](./FUTURE_ENHANCEMENTS.md)
4. Contact development team

---

**Happy Coding! 🚀**

