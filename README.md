# EduXelBolt Frontend

Next.js 14 frontend for the multi-tenant school management system.

## Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment
```bash
cp .env.local.example .env.local
```

Edit `.env.local`:
```
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

### 3. Start Development Server
```bash
npm run dev
```

Frontend will run on `http://localhost:3000`

### 4. Build for Production
```bash
npm run build
npm start
```

## Features

- ✅ Modern, responsive design
- ✅ Role-based routing
- ✅ Authentication with JWT
- ✅ Auto token refresh
- ✅ TypeScript support
- ✅ Tailwind CSS styling

## Pages

- `/` - Home (redirects based on role)
- `/login` - Login page
- `/register` - Registration page
- `/admin/dashboard` - Admin dashboard
- More dashboards to be implemented...

## Project Structure

```
frontend/
├── app/              # Next.js 14 app directory
│   ├── layout.tsx   # Root layout
│   ├── page.tsx     # Home page
│   ├── login/       # Login page
│   ├── register/    # Registration page
│   └── admin/       # Admin pages
├── contexts/        # React contexts
│   └── AuthContext.tsx
├── lib/            # Utility libraries
│   └── api.ts      # API client
└── public/         # Static files
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint

## Authentication

The app uses JWT tokens stored in localStorage:
- `token` - Access token
- `refreshToken` - Refresh token
- `user` - User data

Tokens are automatically refreshed when expired.

## Role-Based Routing

After login, users are redirected based on their role:
- Super Admin → `/super-admin/dashboard`
- Admin → `/admin/dashboard`
- Teacher → `/teacher/dashboard`
- Staff → `/staff/dashboard`
- Parent → `/parent/dashboard`
- Student → `/student/dashboard`
