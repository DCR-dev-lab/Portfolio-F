# Portfolio Frontend

A React + Vite portfolio website with public pages, animated UI sections, and an admin area for managing profile, projects, and skills.

## Tech Stack
- React
- Vite
- Tailwind CSS
- React Router
- Axios
- Framer Motion / Motion
- Lucide Icons

## Getting Started

### 1. Install dependencies
```bash
npm install
```

### 2. Configure environment
Copy the example file and set your API URL:
```bash
copy .env.example .env
```

Then update the value in .env:
```env
VITE_API_URL=http://localhost:3005/api
```

### 3. Run locally
```bash
npm run dev
```

### 4. Build for production
```bash
npm run build
```

## Deployment
Deploy the contents of the dist folder to Vercel, Netlify, Cloudflare Pages, or another static host.

Make sure to set the environment variable:
- VITE_API_URL = https://your-backend-url/api

## Notes
- The frontend expects the backend to be running and reachable.
- Admin pages require a valid admin token from the backend.
