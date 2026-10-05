-- Serik Haberleri — Supabase şeması
-- Yeni Supabase projesinde: SQL Editor > New query > bu dosyanın tamamını yapıştır > Run

-- ───────── Haberler ─────────
create table if not exists public.haberler (
  id            bigint generated always as identity primary key,
  slug          text not null unique,
  title         text not null,
  summary       text not null default '',
  content       text not null default '',
  category      text not null default 'Gündem',
  category_slug text not null default 'gundem',
  image         text not null default '',
  author        text not null default 'Serik Haberleri',
  published_at  timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  featured      boolean not null default false,
  tags          text[] not null default '{}',
  views         integer not null default 0,
  created_at    timestamptz not null default now()
);

create index if not exists haberler_published_at_idx on public.haberler (published_at desc);
create index if not exists haberler_category_idx on public.haberler (category_slug, published_at desc);
create index if not exists haberler_views_idx on public.haberler (views desc);

-- İçerik alanları değiştiğinde updated_at'i yenile (okunma sayacı artışı güncelleme sayılmaz)
create or replace function public.haberler_set_updated_at()
returns trigger language plpgsql as $$
begin
  if (new.title, new.summary, new.content, new.image, new.category_slug)
     is distinct from
     (old.title, old.summary, old.content, old.image, old.category_slug) then
    new.updated_at = now();
  end if;
  return new;
end $$;

drop trigger if exists haberler_updated_at on public.haberler;
create trigger haberler_updated_at
  before update on public.haberler
  for each row execute function public.haberler_set_updated_at();

-- Okunma sayacı (app/api/views bunu çağırır)
create or replace function public.increment_views(haber_slug text)
returns void language sql security definer set search_path = public as $$
  update public.haberler set views = views + 1 where slug = haber_slug;
$$;

-- ───────── Şikayetler ─────────
create table if not exists public.sikayetler (
  id         bigint generated always as identity primary key,
  ad_soyad   text not null,
  email      text,
  telefon    text,
  baslik     text not null,
  icerik     text not null,
  adres      text,
  foto_urls  text[] not null default '{}',
  durum      text not null default 'beklemede',
  created_at timestamptz not null default now()
);

-- ───────── Güvenlik ─────────
-- Site yalnızca sunucudaki service_role anahtarıyla okur/yazar; anon anahtara izin verilmez.
alter table public.haberler enable row level security;
alter table public.sikayetler enable row level security;

-- ───────── Şikayet fotoğrafları ─────────
insert into storage.buckets (id, name, public)
values ('sikayet-fotograflar', 'sikayet-fotograflar', true)
on conflict (id) do nothing;
