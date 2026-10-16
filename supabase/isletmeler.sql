-- Serik Esnaf Rehberi — işletmeler tablosu
-- Supabase SQL Editor > New query > bu dosyanın tamamını yapıştır > Run

create table if not exists public.isletmeler (
  id            bigint generated always as identity primary key,
  slug          text not null unique,
  ad            text not null,
  kategori      text not null default 'hizmet',
  kategori_ad   text not null default 'Hizmet & Diğer',
  adres         text not null default '',
  telefon       text not null default '',
  whatsapp      text not null default '',
  instagram     text not null default '',
  website       text not null default '',
  calisma_saatleri text not null default '',
  harita        text not null default '',
  aciklama      text not null default '',
  durum         text not null default 'beklemede',  -- beklemede | onayli | reddedildi
  created_at    timestamptz not null default now()
);

create index if not exists isletmeler_durum_idx on public.isletmeler (durum, kategori);
create index if not exists isletmeler_kategori_idx on public.isletmeler (kategori, ad);

-- Site yalnızca sunucudaki service_role anahtarıyla okur/yazar.
alter table public.isletmeler enable row level security;

-- Görsel alanı ve depolama kutusu (sonradan eklendi)
alter table public.isletmeler add column if not exists gorsel text not null default '';
insert into storage.buckets (id, name, public) values ('isletme-gorseller','isletme-gorseller', true) on conflict (id) do nothing;
