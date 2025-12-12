-- Create the role enum type
CREATE TYPE roles AS ENUM ('USER', 'ADMIN');

CREATE TABLE users
(
    id UUID PRIMARY KEY REFERENCES auth.users(id),
    first_name text,
    last_name text,
    email text UNIQUE NOT NULL,
    avatar_url text,
    role roles NOT   NULL DEFAULT 'USER',
    updated_at timestamp DEFAULT CURRENT_TIMESTAMP,
    created_at timestamp DEFAULT CURRENT_TIMESTAMP
);

-- Trigger to auto-update `updated_at`
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON public.users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();


-- RLS
alter table public.users enable row level security;

-- Policies
create policy "Public users are viewable by everyone"
on public.users
for select
using (true);

create policy "Users can update their own profile"
on public.users
for update
using (auth.uid() = id);


create policy "Users can insert their own profile"
on public.users
for insert
with check (auth.uid() = id);
