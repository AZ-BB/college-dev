# Communities Database Setup

This guide explains how to set up the communities feature in your database.

## Database Structure

The communities feature consists of two main tables:

### 1. `communities` Table
Stores all community information:
- `id` (UUID) - Primary key
- `name` (TEXT) - Community name
- `slug` (TEXT) - URL-friendly identifier
- `description` (TEXT) - Community description
- `cover_image` (TEXT) - Cover image URL
- `avatar` (TEXT) - Avatar letter or URL
- `creator_id` (UUID) - Reference to the user who created it
- `member_count` (INTEGER) - Number of members
- `price` (NUMERIC) - Membership price
- `currency` (TEXT) - Currency (default: INR)
- `is_active` (BOOLEAN) - Whether community is active
- `is_public` (BOOLEAN) - Whether community is publicly visible
- `is_free` (BOOLEAN) - Whether community is free or paid
- `audience_size` (TEXT) - Expected audience size (under_10k, 10k_to_100k, 100k_to_1m, over_1m)
- `created_at` / `updated_at` (TIMESTAMP)

### 2. `community_members` Table
Manages the many-to-many relationship between users and communities:
- `id` (UUID) - Primary key
- `community_id` (UUID) - Reference to community
- `user_id` (UUID) - Reference to user
- `role` (TEXT) - Member role (owner, admin, moderator, member)
- `joined_at` (TIMESTAMP)

## Features

### Automated Features
1. **Auto-increment member count** - Automatically updates when members join/leave
2. **Auto-add creator as owner** - Creator is automatically added as owner when creating a community
3. **Row Level Security (RLS)** - Proper security policies for data access

### Security
- RLS enabled on both tables
- Public communities viewable by everyone
- Only creators can update/delete their communities
- Members can view other members in their communities

## Running the Migrations

### Option 1: Using Supabase CLI (Recommended)

1. Make sure you have Supabase CLI installed:
```bash
npm install -g supabase
```

2. Link your project (if not already linked):
```bash
supabase link --project-ref YOUR_PROJECT_REF
```

3. Run the migrations:
```bash
supabase db push
```

This will apply all new migration files to your database.

### Option 2: Using Supabase Dashboard

1. Go to your Supabase Dashboard
2. Navigate to **SQL Editor**
3. Copy and paste the contents of each migration file in order:
   - `20251219170000_create_communities.sql`
   - `20251219170001_seed_communities.sql`
4. Execute each one

### Option 3: Manual Migration

1. Open your Supabase SQL Editor
2. Copy the entire content of `supabase/migrations/20251219170000_create_communities.sql`
3. Execute it
4. Then copy and execute `supabase/migrations/20251219170001_seed_communities.sql`

## Updating TypeScript Types

After running the migrations, update your TypeScript types:

```bash
supabase gen types typescript --linked > src/database.types.ts
```

Or if using a local project:

```bash
supabase gen types typescript --local > src/database.types.ts
```

## Verifying the Setup

After running migrations, verify everything is set up correctly:

```sql
-- Check if tables exist
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('communities', 'community_members');

-- Check if seed data was inserted
SELECT COUNT(*) FROM communities;

-- Check if policies are enabled
SELECT tablename, policyname FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename IN ('communities', 'community_members');
```

## Seed Data

The seed migration creates 12 sample communities:
1. AI Automation Society
2. Web Development Mastery
3. Digital Marketing Hub
4. Startup Founders Network
5. Design Thinking Studio
6. Financial Freedom Academy
7. Content Creators Collective
8. Data Science Bootcamp
9. Fitness & Wellness Circle
10. Photography Masterclass
11. Remote Work Professionals
12. Blockchain & Crypto Academy

**Note:** The seed data requires at least one user in the database. It will use the first available user as the creator for all sample communities.

## Testing

After setup, you can test the communities page:

1. Start your development server:
```bash
npm run dev
```

2. Navigate to `/communities`

3. You should see the seeded communities displayed in a grid

## API Functions

The following server action functions are available in `src/action/communities.ts`:

- `getCommunities()` - Fetch all public communities
- `getCommunityBySlug(slug)` - Fetch a single community by slug
- `getCommunityById(id)` - Fetch a single community by ID
- `searchCommunities(query)` - Search communities
- `isUserMember(userId, communityId)` - Check membership
- `getUserCommunities(userId)` - Get user's communities
- `joinCommunity(userId, communityId)` - Join a community
- `leaveCommunity(userId, communityId)` - Leave a community
- `createCommunity(userId, data)` - Create a new community
- `formatMemberCount(count)` - Format member count for display
- `formatPrice(price, currency)` - Format price for display

## Troubleshooting

### Migration fails with "relation already exists"
The tables might already exist. Drop them first:
```sql
DROP TABLE IF EXISTS community_members CASCADE;
DROP TABLE IF EXISTS communities CASCADE;
```

### Seed data not inserted
Make sure you have at least one user in your `users` table:
```sql
SELECT COUNT(*) FROM users;
```

### RLS policies blocking access
Check if you're authenticated and policies are correct:
```sql
SELECT * FROM pg_policies WHERE tablename = 'communities';
```

## Community Creation Flow

The community creation flow is implemented as a multi-step form with three steps:

### Step 1: Choose Plan
Users can select between:
- **Free Community**: No cost, create up to 10 free communities
- **Paid Community**: 3% fee per paying member, create up to 10 paid communities

### Step 2: Choose Name
Users enter a community name (max 30 characters). The slug is automatically generated from the name.

### Step 3: Choose Audience Size
Users select their expected audience size:
- Under 10K
- 10K to 100K
- 100K to 1m
- Over 1m

### Access Points
Users can access the create community flow from:
- Communities list page: Click "Create Yours Now" link in the header
- User dropdown menu: Click "Create Community" option (when logged in)
- Direct URL: `/create-community` (protected route)

### Route: `/create-community`
- Location: `src/app/(protected)/create-community/page.tsx`
- Authentication required
- Redirects to community page after creation

## Next Steps

1. ✅ Run migrations
2. ✅ Update TypeScript types
3. ✅ Verify setup
4. ✅ Implement community creation form
5. 🔄 Customize community data
6. 🔄 Add community detail pages
7. 🔄 Add member management features

