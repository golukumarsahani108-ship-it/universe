-- Run once in Supabase SQL Editor.
-- Adds the admin-controlled visibility switch for published surprise websites.
alter table public.platform_settings
add column if not exists hide_surprise_buttons boolean not null default false;
