-- 1. Enforce logical constraints on trading_accounts
ALTER TABLE "public"."trading_accounts" 
  ADD CONSTRAINT "check_current_balance_non_negative" CHECK (current_balance >= 0),
  ADD CONSTRAINT "check_starting_balance_non_negative" CHECK (starting_balance >= 0);

-- 2. Create atomic function to delete a trade and its associated daily journal
-- Note: Change p_trade_id type to BIGINT if your trades.id column is BIGINT
CREATE OR REPLACE FUNCTION delete_trade_atomic(p_trade_id UUID, p_user_id UUID)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_trade_date DATE;
BEGIN
    -- Ensure the user owns the trade and get the date
    SELECT date INTO v_trade_date
    FROM "public"."trades"
    WHERE id = p_trade_id AND user_id = p_user_id;

    IF v_trade_date IS NULL THEN
        RETURN FALSE; -- Trade not found or unauthorized
    END IF;

    -- Delete the daily journal entry for that date and user
    DELETE FROM "public"."daily_journals" 
    WHERE user_id = p_user_id AND date = v_trade_date;

    -- Delete the trade
    DELETE FROM "public"."trades" 
    WHERE id = p_trade_id AND user_id = p_user_id;

    RETURN TRUE;
END;
$$;
