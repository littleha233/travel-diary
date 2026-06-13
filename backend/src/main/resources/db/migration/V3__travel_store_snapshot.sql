create table if not exists travel_store_snapshots (
  id varchar(64) primary key,
  payload longtext not null,
  updated_at timestamp not null default current_timestamp
);
