-- GET_TRENDING_PRODUCTS
-- This function returns the top 10 most frequently ordered products.
-- The `product_orders` table is queried to get the `item_name`, `price`, and `image_url` of each product.
-- The products are grouped by `item_name`, `price`, and `image_url`, and the number of occurrences of each product is counted.
-- The results are ordered by the count in descending order, and the top 10 products are returned.
CREATE OR REPLACE FUNCTION get_trending_products()
RETURNS TABLE (
  item_name TEXT,
  price NUMERIC,
  image_url TEXT,
  order_count BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    po.item_name,
    po.price,
    po.image_url,
    COUNT(*) AS order_count
  FROM
    product_orders po
  GROUP BY
    po.item_name,
    po.price,
    po.image_url
  ORDER BY
    order_count DESC
  LIMIT 10;
END;
$$ LANGUAGE plpgsql;
