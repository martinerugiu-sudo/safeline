-- Bucket pour les factures
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'invoices',
  'invoices',
  true,
  10485760,  -- 10 Mo
  array['application/pdf', 'image/jpeg', 'image/png', 'image/webp']
) on conflict (id) do nothing;

-- Bucket pour les certificats d'inspection
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'certificates',
  'certificates',
  false,
  10485760,
  array['application/pdf', 'image/jpeg', 'image/png']
) on conflict (id) do nothing;

-- Policies : chaque utilisateur gère son propre dossier
create policy "invoices_user_upload" on storage.objects
  for insert with check (bucket_id = 'invoices' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "invoices_user_read" on storage.objects
  for select using (bucket_id = 'invoices' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "invoices_user_delete" on storage.objects
  for delete using (bucket_id = 'invoices' and auth.uid()::text = (storage.foldername(name))[1]);
