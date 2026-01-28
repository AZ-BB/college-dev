-- Indexes to optimize get_votes_result RPC function performance

-- Index for counting total votes by post_id (line 22-24)
CREATE INDEX IF NOT EXISTS idx_poll_votes_post_id ON poll_votes(post_id);

-- Composite index for GROUP BY poll_option_id with post_id filter (line 65-70)
-- This optimizes the vote count aggregation per option
CREATE INDEX IF NOT EXISTS idx_poll_votes_post_id_poll_option_id ON poll_votes(post_id, poll_option_id);

-- Composite index for fetching users per option with ordering (line 47-52)
-- This is the most critical index as it supports:
-- - Filtering by post_id AND poll_option_id
-- - Ordering by created_at DESC
-- - LIMIT 4
-- Putting post_id first as it's more selective (one post vs multiple options)
CREATE INDEX IF NOT EXISTS idx_poll_votes_post_option_created_desc 
ON poll_votes(post_id, poll_option_id, created_at DESC);

-- Index for checking duplicate votes (used in voteOnPoll function)
-- Prevents users from voting twice on the same poll
CREATE INDEX IF NOT EXISTS idx_poll_votes_poll_id_user_id ON poll_votes(poll_id, user_id);

-- Index on poll_options.poll_id for the WHERE clause join (line 72)
CREATE INDEX IF NOT EXISTS idx_poll_options_poll_id ON poll_options(poll_id);
