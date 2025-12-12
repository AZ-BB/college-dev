# Next.js App Template

A modern, production-ready Next.js application template with authentication, role-based access control, OAuth integration, and a beautiful UI built with shadcn/ui components.

## Features

### 🔐 Authentication System
- **Email/Password Authentication**: Complete signup and login flows with email verification
- **OAuth Integration**: Support for Google, GitHub, Facebook, Twitter, and Discord OAuth providers
- **Password Reset**: Forgot password and reset password functionality with secure token handling
- **Email Confirmation**: Configurable email confirmation flow (email, OTP, or none)
- **Session Management**: Secure session handling with Supabase SSR

### 🛡️ Authorization & Access Control
- **Role-Based Access Control (RBAC)**: Built-in role system with USER and ADMIN roles
- **Access Control Component**: Easy-to-use component for protecting routes and UI elements based on user roles
- **Middleware Protection**: Automatic route protection via Next.js middleware
- **Role Context**: React context for accessing user roles throughout the application

### 🎨 UI Components
- **shadcn/ui Integration**: Pre-configured with a comprehensive set of accessible UI components
- **Dark Mode Support**: Built-in theme switching with next-themes
- **Responsive Design**: Mobile-first approach with responsive utilities
- **Modern Styling**: Tailwind CSS v4 with custom animations

### 🗄️ Database & ORM
- **Supabase Integration**: Full Supabase setup for authentication and database
- **Drizzle ORM**: Type-safe database queries with Drizzle ORM
- **Database Migrations**: Supabase migration system for schema management
- **TypeScript Support**: Fully typed database schemas and queries

### 🚀 Developer Experience
- **TypeScript**: Full type safety throughout the application
- **Biome**: Fast linter and formatter configured
- **Server Actions**: Modern Next.js server actions for form handling
- **Error Handling**: Comprehensive error handling utilities

## Configuration

### config.ts

The `config.ts` file allows you to customize authentication behavior:

```typescript
export default {
    confirmation: 'email',  // 'email' | 'otp' | 'none'
    oauth_types: [
        "google"
    ] as OAuthProvider[]  // 'google' | 'github' | 'facebook' | 'twitter' | 'discord'
}
```

#### Configuration Options

- **`confirmation`**: Determines the email confirmation flow
  - `'email'`: Users receive an email confirmation link (default)
  - `'otp'`: Users receive a one-time password via email
  - `'none'`: No email confirmation required

- **`oauth_types`**: Array of OAuth providers to enable
  - Available providers: `"google"`, `"github"`, `"facebook"`, `"twitter"`, `"discord"`
  - Empty array `[]` disables OAuth buttons
  - Multiple providers can be enabled simultaneously

#### Example Configurations

**Email confirmation with Google OAuth:**
```typescript
export default {
    confirmation: 'email',
    oauth_types: ['google']
}
```

**No confirmation with multiple OAuth providers:**
```typescript
export default {
    confirmation: 'none',
    oauth_types: ['google', 'github', 'discord']
}
```

**OTP confirmation, no OAuth:**
```typescript
export default {
    confirmation: 'otp',
    oauth_types: []
}
```

## Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Database Connection (Supabase PostgreSQL connection string)
DATABASE_URL=postgresql://postgres:[password]@[host]:[port]/postgres

# Application URL (used for OAuth redirects and email links)
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### Environment Variables Explained

- **`NEXT_PUBLIC_SUPABASE_URL`**: Your Supabase project URL (found in Supabase dashboard → Settings → API)
- **`NEXT_PUBLIC_SUPABASE_ANON_KEY`**: Your Supabase anonymous/public key (safe to expose in client-side code)
- **`SUPABASE_SERVICE_ROLE_KEY`**: Your Supabase service role key (keep secret, server-side only)
- **`DATABASE_URL`**: PostgreSQL connection string for Drizzle ORM (use your Supabase database connection string)
- **`NEXT_PUBLIC_SITE_URL`**: Your application's base URL (used for OAuth redirects and email confirmation links)

### Getting Your Supabase Credentials

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Create a new project or select an existing one
3. Navigate to **Settings** → **API**
4. Copy the **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
5. Copy the **anon/public** key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
6. Copy the **service_role** key → `SUPABASE_SERVICE_ROLE_KEY`
7. Navigate to **Settings** → **Database**
8. Copy the connection string → `DATABASE_URL`

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm, yarn, pnpm, or bun
- A Supabase account and project

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd next-app-template
```

2. Install dependencies:
```bash
npm install
# or
yarn install
# or
pnpm install
# or
bun install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
# Edit .env.local with your Supabase credentials
```

4. Set up the database:
```bash
# Push database migrations to Supabase
npm run db:push
```

5. Run the development server:
```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run Biome linter
- `npm run format` - Format code with Biome
- `npm run db:migration` - Create a new database migration
- `npm run db:generate` - Generate Drizzle schema from database
- `npm run db:push` - Push database migrations to Supabase

## Project Structure

```
├── src/
│   ├── app/              # Next.js app router pages
│   │   ├── auth/         # Authentication pages (callback, reset-password)
│   │   ├── login/        # Login page
│   │   ├── signup/       # Signup page
│   │   └── forget-password/ # Password recovery page
│   ├── components/       # React components
│   │   ├── ui/           # shadcn/ui components
│   │   └── ...           # Custom components (forms, OAuth, etc.)
│   ├── contexts/         # React contexts (RoleContext)
│   ├── db/               # Database schema and configuration
│   ├── action/           # Server actions
│   ├── utils/            # Utility functions
│   └── middleware.ts     # Next.js middleware for route protection
├── config.ts             # Application configuration
├── drizzle.config.ts     # Drizzle ORM configuration
└── supabase/             # Supabase migrations
```

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Drizzle ORM Documentation](https://orm.drizzle.team)
- [shadcn/ui Documentation](https://ui.shadcn.com)

## Deploy on Vercel

The easiest way to deploy your Next.js app is using the [Vercel Platform](https://vercel.com/new):

1. Push your code to GitHub
2. Import your repository in Vercel
3. Add your environment variables in Vercel dashboard
4. Deploy!

Make sure to set all environment variables in your Vercel project settings.
