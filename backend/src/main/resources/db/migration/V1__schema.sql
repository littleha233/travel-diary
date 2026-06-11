create table if not exists schema_marker (
  id bigint primary key,
  name varchar(64) not null,
  created_at timestamp not null default current_timestamp
);
