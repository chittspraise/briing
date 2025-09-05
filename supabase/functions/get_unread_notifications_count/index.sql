
create or replace function get_unread_notifications_count(user_id_param uuid)
returns int as $$
  select count(*)
  from notifications
  where user_id = user_id_param and is_read = false;
$$ language sql;
