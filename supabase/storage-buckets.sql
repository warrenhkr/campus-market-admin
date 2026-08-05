-- Création des buckets (s'ils n'existent pas déjà)
insert into storage.buckets (id, name, public)
values
  ('products', 'products', true),
  ('avatars', 'avatars', true),
  ('shops', 'shops', true)
on conflict (id) do nothing;

-- ==========================================
-- BUCKET: products
-- Le code actuel (ImageUpload.tsx) upload les fichiers directement à la racine (ex: "1691234567-abcde.jpg").
-- On ne peut donc pas utiliser (storage.foldername(name))[1] pour vérifier le propriétaire.
-- On s'appuie sur le rôle 'authenticated' pour l'upload, et sur la colonne 'owner' pour UPDATE/DELETE.
-- ==========================================

-- SELECT: Tout le monde peut lire
create policy "products_select" on storage.objects for select using ( bucket_id = 'products' );

-- INSERT: Tout utilisateur authentifié peut uploader
create policy "products_insert" on storage.objects for insert with check (
  bucket_id = 'products'
  and auth.role() = 'authenticated'
);

-- UPDATE: Uniquement le propriétaire du fichier (ou un admin)
create policy "products_update" on storage.objects for update using (
  bucket_id = 'products'
  and (auth.uid() = owner)
);

-- DELETE: Uniquement le propriétaire du fichier (ou un admin)
create policy "products_delete" on storage.objects for delete using (
  bucket_id = 'products'
  and (auth.uid() = owner)
);


-- ==========================================
-- BUCKET: avatars
-- Anticipation : on impose la convention {user_id}/fichier
-- ==========================================

-- SELECT: Tout le monde peut lire
create policy "avatars_select" on storage.objects for select using ( bucket_id = 'avatars' );

-- INSERT: Authentifié, et doit uploader dans son propre dossier {user_id}
create policy "avatars_insert" on storage.objects for insert with check (
  bucket_id = 'avatars'
  and auth.role() = 'authenticated'
  and auth.uid()::text = (storage.foldername(name))[1]
);

-- UPDATE: Authentifié, dans son propre dossier
create policy "avatars_update" on storage.objects for update using (
  bucket_id = 'avatars'
  and auth.role() = 'authenticated'
  and auth.uid()::text = (storage.foldername(name))[1]
);

-- DELETE: Authentifié, dans son propre dossier
create policy "avatars_delete" on storage.objects for delete using (
  bucket_id = 'avatars'
  and auth.role() = 'authenticated'
  and auth.uid()::text = (storage.foldername(name))[1]
);


-- ==========================================
-- BUCKET: shops
-- Anticipation : on impose la convention {user_id}/fichier
-- ==========================================

-- SELECT: Tout le monde peut lire
create policy "shops_select" on storage.objects for select using ( bucket_id = 'shops' );

-- INSERT: Authentifié, et doit uploader dans son propre dossier {user_id}
create policy "shops_insert" on storage.objects for insert with check (
  bucket_id = 'shops'
  and auth.role() = 'authenticated'
  and auth.uid()::text = (storage.foldername(name))[1]
);

-- UPDATE: Authentifié, dans son propre dossier
create policy "shops_update" on storage.objects for update using (
  bucket_id = 'shops'
  and auth.role() = 'authenticated'
  and auth.uid()::text = (storage.foldername(name))[1]
);

-- DELETE: Authentifié, dans son propre dossier
create policy "shops_delete" on storage.objects for delete using (
  bucket_id = 'shops'
  and auth.role() = 'authenticated'
  and auth.uid()::text = (storage.foldername(name))[1]
);
