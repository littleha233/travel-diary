create table if not exists users (
  id varchar(64) primary key,
  nickname varchar(128) not null,
  avatar_url varchar(1024),
  phone varchar(32),
  level varchar(32) not null,
  title varchar(128) not null,
  created_at timestamp not null default current_timestamp,
  updated_at timestamp not null default current_timestamp
);

create table if not exists cities (
  id varchar(64) primary key,
  name varchar(128) not null,
  province varchar(128) not null,
  lat double not null,
  lng double not null,
  map_x int not null,
  map_y int not null,
  cover_url varchar(1024),
  description text,
  spot_ids text,
  tags text,
  created_at timestamp not null default current_timestamp,
  updated_at timestamp not null default current_timestamp
);

create table if not exists spots (
  id varchar(64) primary key,
  city_id varchar(64) not null,
  name varchar(128) not null,
  lat double not null,
  lng double not null,
  radius int not null,
  cover_url varchar(1024),
  description text,
  tags text,
  quest_ids text,
  photo_ids text,
  created_at timestamp not null default current_timestamp,
  updated_at timestamp not null default current_timestamp
);

create table if not exists user_city_states (
  user_id varchar(64) not null,
  city_id varchar(64) not null,
  lit boolean not null default false,
  manually_lit boolean not null default false,
  wished boolean not null default false,
  visited_at date,
  created_at timestamp not null default current_timestamp,
  updated_at timestamp not null default current_timestamp,
  primary key (user_id, city_id)
);

create table if not exists user_spot_states (
  user_id varchar(64) not null,
  spot_id varchar(64) not null,
  status varchar(32) not null default 'available',
  can_check_in boolean not null default true,
  created_at timestamp not null default current_timestamp,
  updated_at timestamp not null default current_timestamp,
  primary key (user_id, spot_id)
);

create table if not exists trips (
  id varchar(96) primary key,
  user_id varchar(64) not null,
  title varchar(255) not null,
  start_date date not null,
  end_date date not null,
  days int not null,
  photo_count int not null default 0,
  cover_url varchar(1024),
  ai_memory_id varchar(96),
  summary varchar(512),
  visibility varchar(32) not null default 'private',
  created_at timestamp not null default current_timestamp,
  updated_at timestamp not null default current_timestamp
);

create table if not exists trip_cities (
  trip_id varchar(96) not null,
  city_id varchar(64) not null,
  sort_order int not null default 0,
  primary key (trip_id, city_id)
);

create table if not exists trip_spots (
  trip_id varchar(96) not null,
  spot_id varchar(64) not null,
  sort_order int not null default 0,
  primary key (trip_id, spot_id)
);

create table if not exists check_ins (
  id varchar(128) primary key,
  user_id varchar(64) not null,
  city_id varchar(64) not null,
  spot_id varchar(64) not null,
  trip_id varchar(96),
  type varchar(32) not null,
  visited_at timestamp not null,
  mood_text text,
  lat double,
  lng double,
  distance_meters int,
  photo_ids text,
  client_request_id varchar(128),
  created_at timestamp not null default current_timestamp
);

create table if not exists trip_check_ins (
  trip_id varchar(96) not null,
  check_in_id varchar(128) not null,
  primary key (trip_id, check_in_id)
);

create table if not exists images (
  id varchar(96) primary key,
  user_id varchar(64) not null,
  url varchar(1024),
  thumbnail_url varchar(1024),
  content_type varchar(128),
  byte_size bigint,
  linked_type varchar(64),
  linked_id varchar(128),
  status varchar(32) not null default 'pending',
  created_at timestamp not null default current_timestamp,
  updated_at timestamp not null default current_timestamp
);

create table if not exists ai_memories (
  id varchar(96) primary key,
  trip_id varchar(96) not null,
  user_id varchar(64) not null,
  title varchar(255) not null,
  summary varchar(512),
  content text,
  share_text text,
  style varchar(128),
  status varchar(32) not null default 'completed',
  generated_at timestamp,
  created_at timestamp not null default current_timestamp,
  updated_at timestamp not null default current_timestamp
);

create table if not exists achievements (
  id varchar(96) primary key,
  title varchar(255) not null,
  description text,
  tone varchar(32) not null,
  created_at timestamp not null default current_timestamp
);

create table if not exists user_achievements (
  user_id varchar(64) not null,
  achievement_id varchar(96) not null,
  unlocked boolean not null default false,
  unlocked_at date,
  created_at timestamp not null default current_timestamp,
  updated_at timestamp not null default current_timestamp,
  primary key (user_id, achievement_id)
);

create table if not exists theme_quests (
  id varchar(96) primary key,
  title varchar(255) not null,
  subtitle varchar(255),
  description text,
  total int not null,
  cover_url varchar(1024),
  reward_achievement_id varchar(96),
  created_at timestamp not null default current_timestamp
);

create table if not exists theme_quest_spots (
  quest_id varchar(96) not null,
  spot_id varchar(64) not null,
  sort_order int not null default 0,
  primary key (quest_id, spot_id)
);

create table if not exists theme_quest_cities (
  quest_id varchar(96) not null,
  city_id varchar(64) not null,
  sort_order int not null default 0,
  primary key (quest_id, city_id)
);

create table if not exists plans (
  id varchar(96) primary key,
  user_id varchar(64) not null,
  title varchar(255) not null,
  days int not null,
  progress int not null default 0,
  total int not null default 0,
  cover_url varchar(1024),
  start_hint varchar(255),
  created_at timestamp not null default current_timestamp,
  updated_at timestamp not null default current_timestamp
);

create table if not exists plan_cities (
  plan_id varchar(96) not null,
  city_id varchar(64) not null,
  sort_order int not null default 0,
  primary key (plan_id, city_id)
);

create table if not exists plan_spots (
  plan_id varchar(96) not null,
  spot_id varchar(64) not null,
  sort_order int not null default 0,
  primary key (plan_id, spot_id)
);

create table if not exists community_posts (
  id varchar(96) primary key,
  author_id varchar(64) not null,
  type varchar(32) not null,
  title varchar(255) not null,
  subtitle varchar(512),
  body text,
  image_url varchar(1024),
  linked_id varchar(128),
  action_label varchar(128),
  progress int,
  status varchar(32) not null default 'published',
  created_at timestamp not null default current_timestamp,
  updated_at timestamp not null default current_timestamp
);
