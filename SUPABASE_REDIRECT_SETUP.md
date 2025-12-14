# Supabase Email Redirect Configuration

## Problem
Email confirmation links are redirecting to `localhost:3000` instead of your production URL `cozy-pixel-glow.vercel.app`.

## Solution

### 1. Update Environment Variables

Add the following to your `.env` file (and set it in Vercel environment variables):

```env
VITE_SITE_URL=https://cozy-pixel-glow.vercel.app
```

### 2. Configure Supabase Dashboard

You need to whitelist your production URL in Supabase:

1. Go to your Supabase Dashboard: https://supabase.com/dashboard
2. Select your project
3. Go to **Authentication** → **URL Configuration**
4. Under **Redirect URLs**, add:
   - `https://cozy-pixel-glow.vercel.app/**`
   - `https://cozy-pixel-glow.vercel.app/*`
   - `https://cozy-pixel-glow.vercel.app/`
5. Under **Site URL**, set it to:
   - `https://cozy-pixel-glow.vercel.app`
6. Click **Save**

### 3. Vercel Environment Variables

Make sure to add `VITE_SITE_URL` to your Vercel project:

1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Add:
   - **Name**: `VITE_SITE_URL`
   - **Value**: `https://cozy-pixel-glow.vercel.app`
   - **Environment**: Production, Preview, Development (or just Production)
3. Redeploy your application

### 4. Code Changes

The code has been updated to use `VITE_SITE_URL` environment variable. If the variable is not set, it will fall back to `window.location.origin` (which works for local development).

## Testing

After making these changes:
1. Sign up with a new email
2. Check the confirmation email
3. The confirmation link should now redirect to `https://cozy-pixel-glow.vercel.app` instead of `localhost:3000`
