-- Run once in Supabase SQL Editor.
alter table public.website_templates
add column if not exists editor_note text;
