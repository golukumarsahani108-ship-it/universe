# My Little Universe — Google Login Patch

## Files
Replace these files in your existing project with the matching files in this patch:
- `app/login/page.tsx`
- `app/login/login.css`

The existing OAuth callback is included for reference at:
- `app/api/auth/callback/route.ts`

The login page now places **Continue with Google directly below Login** and supports both email/password login and username/password login through the project's existing `/api/auth/username-login` endpoint.

## Supabase / Google setup (required; no SQL migration is required for the button itself)

1. Open Supabase Dashboard → Authentication → Sign In / Providers → Google and enable Google.
2. In Google Cloud Console, create/configure an OAuth client (Web application).
3. In the Google OAuth client, add the **Authorized redirect URI** shown by Supabase on its Google provider setup page. It normally looks like:
   `https://<YOUR_SUPABASE_PROJECT_REF>.supabase.co/auth/v1/callback`
   Use the exact URI displayed in your own Supabase dashboard; do not guess the project ref.
4. In Supabase Dashboard → Authentication → URL Configuration, add these **Redirect URLs**:
   - `https://universe-c.netlify.app/api/auth/callback`
   - `http://localhost:3000/api/auth/callback` (for local development)
   Set the Site URL to `https://universe-c.netlify.app` if that is the production domain you use.
5. Save the Google Client ID and Client Secret in the Supabase Google provider settings.
6. Ensure Netlify has the existing app environment variables configured, especially:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY` (server-side only, required by the existing username login API)
7. Deploy the updated files, then test Google sign-in and email/username login.

## SQL
No SQL is required just to enable Google OAuth. Do not run random SQL or expose the service-role key. If the app's `profiles` table has required fields/policies for new OAuth users, those need to be checked against the actual schema before any SQL is written.

## Important note about existing username accounts
The login page previously called `signInWithPassword` using the username field as though it were always an email address. The patch routes non-email usernames through the existing username-login API. That API expects a matching row in `profiles` and `SUPABASE_SERVICE_ROLE_KEY` to be set in the server environment.
