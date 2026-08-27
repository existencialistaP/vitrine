-- Configuração do Supabase Storage para o bucket de imagens da vitrine.
-- Executar no SQL Editor do projeto (ou via migration).

-- 1) Bucket público para imagens de produtos e logotipos.
insert into storage.buckets (id, name, public)
values ('vitrine-imagens', 'vitrine-imagens', true)
on conflict (id) do nothing;

-- 2) RLS: leitura pública das imagens.
create policy "Imagens de vitrine são públicas"
on storage.objects for select
to anon, authenticated
using ( bucket_id = 'vitrine-imagens' );

-- 3) RLS: apenas usuários autenticados podem enviar imagens, isoladas por tipo.
create policy "Lojista pode enviar imagens"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'vitrine-imagens'
  and (storage.foldername(name))[1] in ('produtos', 'logos')
);
