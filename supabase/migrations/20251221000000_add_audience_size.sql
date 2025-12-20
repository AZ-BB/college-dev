-- Add audience_size field to communities table
ALTER TABLE communities 
ADD COLUMN audience_size TEXT CHECK (audience_size IN ('under_10k', '10k_to_100k', '100k_to_1m', 'over_1m'));

-- Add comment for documentation
COMMENT ON COLUMN communities.audience_size IS 'Expected audience size: under_10k, 10k_to_100k, 100k_to_1m, over_1m';

