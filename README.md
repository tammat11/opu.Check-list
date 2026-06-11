# OPU Checklist

A simple, elderly-friendly cleaning checklist application with Web Push notifications, geolocation support, and an admin panel.

## Features

- ✅ **Easy Checklists** - Create and manage cleaning checklists with simple UI
- 🔔 **Web Push Notifications** - Get reminders even when browser is closed
- 📍 **Geolocation Support** - Track cleaning locations
- 👨‍💼 **Admin Panel** - Manage users and send notifications
- 👴 **Elderly-Friendly** - Large buttons, clear instructions, built-in diagnostics

## Tech Stack

### Frontend
- **Next.js 15** - React framework with server/client components
- **TypeScript** - Type-safe code
- **Tailwind CSS** - Responsive design
- **Web Push API** - Browser notifications
- **Service Worker** - Background notification support

### Backend
- **Node.js + Express** - API server
- **PostgreSQL** - Database
- **JWT** - Authentication
- **web-push** - Push notification delivery

## Project Structure

```
.
├── frontend/          # Next.js application (Vercel deployment)
│   ├── app/          # Pages and routes
│   ├── public/       # Static files + Service Worker
│   └── package.json
├── backend/          # Express API server (185.98.7.103)
│   ├── src/
│   │   ├── server.ts
│   │   └── database/
│   └── package.json
└── README.md
```

## Frontend UI Status

- `/` - marketing landing
- `/auth/login` - branded auth flow with 4 steps: check, password, register, request
- `/app/dashboard` - branded operator dashboard
- `/app/admin` - branded admin area with notification box and checklist manager
- `/app/work` - branded cleaner work mode with compact shift briefing
- `/checklist` - branded personal checklist screen

## Frontend Notes

- Main visual language now lives around the `brand-*` palette in `frontend/tailwind.config.ts`.
- Shared app chrome for inner screens is in `frontend/app/components/AppChrome.tsx`.
- `/app/work` still has its own local `AdminNavbar` inside `frontend/app/app/work/page.tsx`; if top nav breaks there, check that file first.
- Push bootstrap lives in `frontend/app/components/PushBootstrap.tsx`: it registers `sw.js`, subscribes with `NEXT_PUBLIC_VAPID_PUBLIC_KEY`, and in preview mode falls back to `userId = 1`.
- The frontend dev script explicitly disables Next Segment Explorer because it was breaking dev HMR with missing chunk errors like `611.js` / `833.js`.
- `frontend/next.config.ts` pins `outputFileTracingRoot` to the frontend folder to avoid incorrect workspace-root inference on this machine.

## Backend Notes

- Real push sending now lives in `backend/src/push.ts`.
- The backend polls every 60 seconds and sends an automatic reminder 5 minutes before `active_checklists.due_date`.
- `POST /api/subscribe` now stores real browser push subscriptions.
- `POST /api/notify` now sends a real broadcast through Web Push instead of frontend-only preview.
- Existing databases are patched on server start with `ensureNotificationSchema()`, because the repo currently has no working `backend/src/database/migrate.ts` despite the npm script reference.

## Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL 14+
- npm or yarn

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Visit `http://localhost:3000`

### Backend Setup

```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your database URL and other settings
npm run db:migrate
npm run dev
```

Server runs on `http://localhost:3001`

### Database Setup

```bash
# Connect to PostgreSQL
psql postgresql://user:password@localhost:5432

# Run schema
\i backend/src/database/schema.sql
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Create new user
- `POST /api/auth/login` - Login user

### Checklists
- `GET /api/checklists` - Get user's checklists
- `POST /api/checklists` - Create new checklist

### Notifications
- `POST /api/subscribe` - Subscribe to push notifications
- `POST /api/notify` - Send push notification

### Geolocation
- `POST /api/location` - Store user location

### Admin
- `GET /api/admin/stats` - Get aggregated statistics

## Web Push Notifications

The app uses the Web Push API with a Service Worker for background notifications.

### Browser Support
- Chrome/Edge: ✅ Full support
- Firefox: ✅ Full support
- Safari: ⚠️ Limited (iOS 16.4+)
- Opera: ✅ Full support

## Deployment

### Frontend (Vercel)
```bash
cd frontend
vercel deploy
```

### Backend (Your Server)
```bash
cd backend
npm run build
npm start
```

## UX for Elderly Users

- Large buttons (min 48px touch target)
- Simple, clear language
- High contrast colors
- Built-in notification diagnostics
- Step-by-step instructions
- Test notification feature on homepage

## Support

For issues or questions, please create an issue in the repository.

## License

MIT
