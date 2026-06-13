create table if not exists community_post_likes (
  user_id varchar(64) not null,
  post_id varchar(96) not null,
  created_at timestamp not null default current_timestamp,
  primary key (user_id, post_id)
);

create table if not exists community_post_saves (
  user_id varchar(64) not null,
  post_id varchar(96) not null,
  created_at timestamp not null default current_timestamp,
  primary key (user_id, post_id)
);

create table if not exists community_comments (
  id varchar(128) primary key,
  post_id varchar(96) not null,
  user_id varchar(64) not null,
  body text not null,
  status varchar(32) not null default 'published',
  created_at timestamp not null default current_timestamp,
  updated_at timestamp not null default current_timestamp
);
