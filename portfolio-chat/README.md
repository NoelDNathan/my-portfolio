# portfolio-chat

Backend for the portfolio chat widget: Cloudflare Worker (production) and Node server (local dev).

## Local development

1. Add your Groq API key to a `.env` file in this folder (or in `portafolio-chat/.env` if running from there):
   ```
   GROQ_API_KEY=your-groq-key-here
   ```
   Or use `GROQ` or `MODEL_API_KEY`; the server accepts any of these.

2. Install and run the Node server (from `portfolio-chat`):
   ```
   npm install
   npm run chat-server
   ```
   The API will be at `http://localhost:8787/api/chat`. Run the frontend (noel-cv) with its default `VITE_CHAT_API_URL` so it uses this URL.

## Production (Cloudflare Worker)

1. Set the secret (use your Groq API key, e.g. from [console.groq.com](https://console.groq.com)):
   ```
   npx wrangler secret put GROQ_API_KEY
   ```
   Or `GROQ` or `MODEL_API_KEY`; the Worker checks these in order.

2. Deploy:
   ```
   npx wrangler deploy
   ```
3. Use the Worker URL (e.g. `https://portfolio-chat.<subdomain>.workers.dev/api/chat`) as `VITE_CHAT_API_URL` when building the frontend for GitHub Pages.
