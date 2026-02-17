<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run the app (Next.js + Server Actions)

This contains everything you need to run your app locally.

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set `GEMINI_API_KEY` in `.env.local` (server-side only)
3. Run the app:
   `npm run dev`

## Notes

- The AI calls run via **Next.js Server Actions** in `app/actions.ts`, so your `GEMINI_API_KEY` is never bundled to the browser.
