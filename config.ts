
// Configuration file for external APIs

export const GITHUB_CONFIG = {
  USERNAME: import.meta.env.VITE_GITHUB_USERNAME || "shiveshrane",
  // Optional: Add your GitHub Personal Access Token here to increase rate limits
  // and access private repository counts.
  // WARNING: In a real production app, never expose tokens in client-side code.
  // This is a static portfolio demo.
  TOKEN: import.meta.env.VITE_GITHUB_TOKEN || "" 
};
