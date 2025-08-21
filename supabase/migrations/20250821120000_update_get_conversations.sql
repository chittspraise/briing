CREATE OR REPLACE FUNCTION get_conversations(user_id_param uuid)
RETURNS TABLE(
  id text,
  name text,
  avatar text,
  rating real,
  last_message text,
  updated_at timestamptz,
  unread_count bigint,
  other_user_id uuid
) AS $$
BEGIN
  RETURN QUERY
  WITH conversation_partners AS (
    SELECT
      m.chat_id,
      CASE
        WHEN m.sender_id = user_id_param THEN m.receiver_id
        ELSE m.sender_id
      END AS partner_id
    FROM messages m
    WHERE m.sender_id = user_id_param OR m.receiver_id = user_id_param
  ),
  latest_messages AS (
    SELECT
      chat_id,
      MAX(created_at) AS max_created_at
    FROM messages
    GROUP BY chat_id
  )
  SELECT
    cp.chat_id AS id,
    p.first_name AS name,
    p.image_url AS avatar,
    COALESCE((SELECT AVG(r.rating) FROM ratings r WHERE r.rated_id = p.id), 5) AS rating,
    m.message AS last_message,
    m.created_at AS updated_at,
    (
      SELECT COUNT(*)
      FROM messages unread
      WHERE unread.chat_id = cp.chat_id
        AND unread.receiver_id = user_id_param
        AND unread.is_read = false
    ) AS unread_count,
    cp.partner_id as other_user_id
  FROM conversation_partners cp
  JOIN latest_messages lm ON cp.chat_id = lm.chat_id
  JOIN messages m ON m.chat_id = lm.chat_id AND m.created_at = lm.max_created_at
  JOIN profiles p ON p.id = cp.partner_id
  GROUP BY cp.chat_id, p.first_name, p.image_url, m.message, m.created_at, p.rating, cp.partner_id
  ORDER BY m.created_at DESC;
END;
$$ LANGUAGE plpgsql;
