# Simple CRM web (Module 4 · Option 3)

My Module 2 Simple CRM React app (React 19 + Vite), now connected to the Simple CRM API on Render instead of json-server.

- **Live:** https://jefkong-simple-crm.netlify.app (demo login: `jialat007@tamjiak.com` / `password321`)
- **API:** https://simple-crm-api-0ge9.onrender.com/customers (source in [`../simple-crm-api`](../simple-crm-api))
- **Full write-up, screenshots and errors:** see the [main README](../README.md#option-3--simple-crm-project-render--postgresql--netlify)

## Run locally

```bash
npm ci
export VITE_API_BASE_URL=http://localhost:8411   # the API from simple-crm-api/docker-compose.yml
npm run dev                                       # http://localhost:5173
```

`VITE_API_BASE_URL` is built into the app at build time, so after changing it on Netlify you need to redeploy. Netlify build settings are in [`netlify.toml`](netlify.toml).
