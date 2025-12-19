-- Seed communities
-- Note: This migration will only run if there's at least one user in the database
-- It will use the first available user as the creator for all sample communities

DO $$
DECLARE
    first_user_id UUID;
BEGIN
    -- Get the first user ID
    SELECT id INTO first_user_id FROM public.users LIMIT 1;
    
    -- Only proceed if we have a user
    IF first_user_id IS NOT NULL THEN
        INSERT INTO communities (name, slug, description, avatar, cover_image, price, currency, member_count, is_public, creator_id)
        VALUES 
            (
                'AI Automation Society',
                'ai-automation-society',
                'A community for mastering AI-driven automation and AI agents. Learn, collaborate, and optimize your workflow with cutting-edge AI tools.',
                'A',
                '/community-placeholder.png',
                200.00,
                'INR',
                0, -- Will be auto-incremented by trigger
                true,
                first_user_id
            ),
            (
                'Web Development Mastery',
                'web-development-mastery',
                'Learn modern web development with React, Next.js, and TypeScript. Build production-ready applications with best practices.',
                'W',
                '/community-placeholder.png',
                150.00,
                'INR',
                0,
                true,
                first_user_id
            ),
            (
                'Digital Marketing Hub',
                'digital-marketing-hub',
                'Master digital marketing strategies, SEO, social media marketing, and content creation. Grow your online presence.',
                'D',
                '/community-placeholder.png',
                175.00,
                'INR',
                0,
                true,
                first_user_id
            ),
            (
                'Startup Founders Network',
                'startup-founders-network',
                'Connect with fellow entrepreneurs, share experiences, and get mentorship from successful founders. Build your startup right.',
                'S',
                '/community-placeholder.png',
                250.00,
                'INR',
                0,
                true,
                first_user_id
            ),
            (
                'Design Thinking Studio',
                'design-thinking-studio',
                'Learn UX/UI design, design thinking methodologies, and create beautiful user experiences. Portfolio building included.',
                'D',
                '/community-placeholder.png',
                180.00,
                'INR',
                0,
                true,
                first_user_id
            ),
            (
                'Financial Freedom Academy',
                'financial-freedom-academy',
                'Master personal finance, investing, trading, and wealth building strategies. Achieve financial independence.',
                'F',
                '/community-placeholder.png',
                300.00,
                'INR',
                0,
                true,
                first_user_id
            ),
            (
                'Content Creators Collective',
                'content-creators-collective',
                'For YouTubers, bloggers, and content creators. Learn content strategy, video editing, and audience growth tactics.',
                'C',
                '/community-placeholder.png',
                120.00,
                'INR',
                0,
                true,
                first_user_id
            ),
            (
                'Data Science Bootcamp',
                'data-science-bootcamp',
                'Learn data science, machine learning, and AI. Hands-on projects with Python, SQL, and popular ML frameworks.',
                'D',
                '/community-placeholder.png',
                350.00,
                'INR',
                0,
                true,
                first_user_id
            ),
            (
                'Fitness & Wellness Circle',
                'fitness-wellness-circle',
                'Transform your health with expert guidance on fitness, nutrition, and mental wellness. Community challenges included.',
                'F',
                '/community-placeholder.png',
                99.00,
                'INR',
                0,
                true,
                first_user_id
            ),
            (
                'Photography Masterclass',
                'photography-masterclass',
                'From beginner to pro photographer. Learn composition, lighting, editing, and build a stunning portfolio.',
                'P',
                '/community-placeholder.png',
                160.00,
                'INR',
                0,
                true,
                first_user_id
            ),
            (
                'Remote Work Professionals',
                'remote-work-professionals',
                'Thrive in remote work. Learn productivity hacks, time management, and networking strategies for digital nomads.',
                'R',
                '/community-placeholder.png',
                90.00,
                'INR',
                0,
                true,
                first_user_id
            ),
            (
                'Blockchain & Crypto Academy',
                'blockchain-crypto-academy',
                'Understand blockchain technology, cryptocurrency trading, DeFi, and NFTs. Navigate the Web3 ecosystem.',
                'B',
                '/community-placeholder.png',
                400.00,
                'INR',
                0,
                true,
                first_user_id
            );
        
        RAISE NOTICE 'Successfully seeded % communities', 12;
    ELSE
        RAISE NOTICE 'No users found in database. Skipping community seed data.';
    END IF;
END $$;
