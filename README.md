

  ## Running the code

  Run `npm i` to install the dependencies.

  Run `npm run dev` to start the development server.

  ## R2 image uploads

  New uploads use the `/api/upload-image` endpoint and Cloudflare R2. Existing Supabase image URLs remain valid.

  Configure these server-side environment variables in Vercel before enabling uploads:

  - `R2_ENDPOINT` (or `R2_ACCOUNT_ID`)
  - `R2_ACCESS_KEY_ID`
  - `R2_SECRET_ACCESS_KEY`
  - `R2_BUCKET_NAME`
  - `R2_PUBLIC_BASE_URL` (the public R2 custom domain, without a trailing slash)

  The R2 custom domain must allow public `GET` and `HEAD` requests. Admin uploads also use the existing `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` values to validate the signed-in session.
  
