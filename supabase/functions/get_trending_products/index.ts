CREATE OR REPLACE FUNCTION get_trending_products()
RETURNS TABLE (
  item_name TEXT,
  price NUMERIC,
  image_url TEXT,
  created_at TIMESTAMPTZ -- Changed to created_at for ordering
) AS $
BEGIN
  RETURN QUERY
  SELECT
    po.item_name,
    po.price,
    po.image_url,
    po.created_at
  FROM
    product_orders po
  ORDER BY
    po.created_at DESC -- Order by creation date
  LIMIT 10;
END;
$ LANGUAGE plpgsql;
