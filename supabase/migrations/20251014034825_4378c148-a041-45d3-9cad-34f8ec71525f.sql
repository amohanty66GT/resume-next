-- Fix security vulnerabilities in career_cards table

-- 1. Clean up orphaned cards with NULL user_id
DELETE FROM career_cards WHERE user_id IS NULL;

-- 2. Add NOT NULL constraint to user_id to prevent future orphaned records
ALTER TABLE career_cards ALTER COLUMN user_id SET NOT NULL;

-- 3. Add size constraint to card_data to prevent storage abuse (1MB limit)
ALTER TABLE career_cards ADD CONSTRAINT card_data_size_check 
CHECK (octet_length(card_data::text) < 1048576);