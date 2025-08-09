CREATE OR REPLACE FUNCTION search_travelers(
    search_query TEXT,
    from_country_query TEXT,
    to_country_query TEXT,
    min_budget NUMERIC
)
RETURNS TABLE(
    id BIGINT,
    user_id UUID,
    traveler_name TEXT,
    from_country TEXT,
    to_country TEXT,
    departure_date TIMESTAMPTZ,
    return_date TIMESTAMPTZ,
    notes TEXT,
    created_at TIMESTAMPTZ
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        t.id,
        t.user_id,
        t.traveler_name,
        t.from_country,
        t.to_country,
        t.departure_date,
        t.return_date,
        t.notes,
        t.created_at
    FROM
        travel t
    WHERE
        t.departure_date >= NOW()
        AND (search_query IS NULL OR t.traveler_name ILIKE '%' || search_query || '%')
        AND (from_country_query IS NULL OR t.from_country ILIKE '%' || from_country_query || '%')
        AND (to_country_query IS NULL OR t.to_country ILIKE '%' || to_country_query || '%')
        AND (
            min_budget IS NULL OR min_budget = 0 OR
            -- Extract numbers from the 'notes' field and cast to numeric for comparison
            CAST(regexp_replace(t.notes, '[^0-9.]', '', 'g') AS NUMERIC) >= min_budget
        )
    ORDER BY
        t.departure_date ASC
    LIMIT 10;
END;
$$ LANGUAGE plpgsql;
