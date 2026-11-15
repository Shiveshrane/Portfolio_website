# Portfolio

This is a personal portfolio website built with React, Vite, and Tailwind CSS.

## Run Locally

**Prerequisites:**  Node.js

1. Install dependencies:
   ```bash
   npm install
   ```

2. Create a `.env` file in the root directory with the following variables:
   ```env
   VITE_NAME="Your Name"
   VITE_LOCATION="Your Location"
   VITE_EMAIL="your.email@example.com"
   VITE_GITHUB_URL="https://github.com/yourusername"
   VITE_LINKEDIN_URL="https://linkedin.com/in/yourusername"
   VITE_GITHUB_USERNAME="yourusername"

   # Optional — arXiv papers (defaults to VITE_NAME)
   VITE_ARXIV_AUTHOR="Your Name"
   # Optional — pin exact papers instead of searching by name
   # VITE_ARXIV_IDS="2611.07610,2610.12496"
   ```

3. Run the app:
   ```bash
   npm run dev
   ```

## arXiv papers

The Research section lists your arXiv preprints automatically. arXiv's API
doesn't allow browser requests (no CORS), so `plugins/arxiv.ts` queries it when
`npm run dev` starts or `npm run build` runs, and bakes the results into the
bundle. Each successful sync is saved to `data/arxiv-papers.json`; if arXiv is
unreachable the build falls back to that snapshot. New papers appear on the
next build/deploy.

If someone else shares your name on arXiv, set `VITE_ARXIV_IDS` to list your
papers explicitly.

## Build

To build the project for production:

```bash
npm run build
```

