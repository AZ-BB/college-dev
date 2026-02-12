CREATE TYPE payment_type_enum AS ENUM
('SUBSCRIPTION_MONTHLY_FEE', 'SUBSCRIPTION_YEARLY_FEE', 'SUBSCRIPTION_ONE_TIME_PAYMENT', 'CLASSROOM_ONE_TIME_PAYMENT');

CREATE TYPE payment_status_enum AS ENUM
('PENDING', 'PAID', 'FAILED');

CREATE TABLE payments
(
    id SERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    comm_id INTEGER DEFAULT NULL REFERENCES communities(id) ON DELETE CASCADE,
    community_member_classrooms_id INTEGER DEFAULT NULL REFERENCES community_member_classrooms(id) ON DELETE CASCADE,

    -- Payout id TODO
    -- Payout status TODO

    amount NUMERIC DEFAULT 0,


    paid_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    type payment_type_enum NOT NULL,

    status payment_status_enum NOT NULL DEFAULT 'PENDING',

    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON payments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security on payments table
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- ============================================
-- RLS Policies for payments table
-- ============================================
-- SELECT: Users can view their own payments; admins/owners can view payments in their community
CREATE POLICY "Users see own payments admins see community payments" ON payments
FOR SELECT
TO authenticated
USING (
  user_id = auth.uid()
  OR (comm_id IS NOT NULL AND is_community_admin_or_owner(comm_id))
);

-- UPDATE: Disabled (no policy)
-- DELETE: Disabled (no policy)

-- INSERT: Any authenticated user can insert
CREATE POLICY "Authenticated users can insert payments" ON payments
FOR INSERT
TO authenticated
WITH CHECK (true);
