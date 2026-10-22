-- SERİK USTAM — yerel hizmet pazaryeri tabloları
-- Supabase SQL Editor > New query > bu dosyanın tamamını yapıştır > Run
-- Site yalnızca sunucudaki service_role anahtarıyla okur/yazar (RLS açık, herkese açık politika yok).

-- Ustalar (başvuru → yönetici onayı → yayında)
create table if not exists public.ustam_ustalar (
  id              bigint generated always as identity primary key,
  slug            text not null unique,
  ad              text not null,                 -- ad soyad veya işletme unvanı
  telefon         text not null,                 -- herkese gösterilmez
  whatsapp        text not null default '',
  kategoriler     text[] not null default '{}',  -- uzmanlık alanları (kategori slug'ları)
  mahalleler      text[] not null default '{}',  -- hizmet verdiği bölgeler
  deneyim_yil     int not null default 0,
  isyeri          text not null default '',      -- iş yeri bilgisi (açık adres herkese gösterilmez)
  hakkinda        text not null default '',
  calisma_saatleri text not null default '',
  foto            text not null default '',
  galeri          text[] not null default '{}',
  belge_notu      text not null default '',      -- yeterlilik/ruhsat bilgisi (yalnız yönetici görür)
  dogrulandi      boolean not null default false, -- "Doğrulanmış Usta" rozeti
  paket           text not null default 'ucretsiz', -- ucretsiz | profesyonel | premium (ödeme alınınca yönetici etkinleştirir)
  istenen_paket   text not null default 'ucretsiz', -- kayıtta seçilen paket; paket'ten farklıysa ödeme bekliyor
  tamamlanan_is   int not null default 0,
  durum           text not null default 'beklemede', -- beklemede | onayli | reddedildi
  created_at      timestamptz not null default now()
);
create index if not exists ustam_ustalar_durum_idx on public.ustam_ustalar (durum);
create index if not exists ustam_ustalar_kategori_idx on public.ustam_ustalar using gin (kategoriler);

-- Hizmet talepleri (vatandaş → ücretsiz teklif al)
create table if not exists public.ustam_talepler (
  id            bigint generated always as identity primary key,
  kod           text not null unique,            -- müşteriye verilen takip kodu
  kategori      text not null,
  mahalle       text not null,
  aciklama      text not null default '',
  fotolar       text[] not null default '{}',
  zaman         text not null default 'en-kisa',  -- en-kisa | bugun | yarin | tarih
  tarih         date,
  ad            text not null,
  telefon       text not null,                   -- herkese gösterilmez
  durum         text not null default 'yeni',     -- yeni | iletildi | teklif | tamamlandi | iptal
  yonetici_notu text not null default '',
  istenen_usta  text not null default '',   -- profilden "Teklif İste" ile gelindiyse ustanın slug'ı
  created_at    timestamptz not null default now()
);
create index if not exists ustam_talepler_durum_idx on public.ustam_talepler (durum, created_at desc);

-- Teklifler (ilk sürümde yönetici, ustadan gelen teklifi girer; ikinci aşamada usta panelinden)
create table if not exists public.ustam_teklifler (
  id          bigint generated always as identity primary key,
  talep_id    bigint not null references public.ustam_talepler(id) on delete cascade,
  usta_id     bigint not null references public.ustam_ustalar(id) on delete cascade,
  fiyat       text not null default '',
  aciklama    text not null default '',
  durum       text not null default 'gonderildi', -- gonderildi | kabul | red
  created_at  timestamptz not null default now()
);
create index if not exists ustam_teklifler_talep_idx on public.ustam_teklifler (talep_id);

-- Değerlendirmeler (yalnız tamamlanan işler için)
create table if not exists public.ustam_degerlendirmeler (
  id          bigint generated always as identity primary key,
  usta_id     bigint not null references public.ustam_ustalar(id) on delete cascade,
  talep_id    bigint references public.ustam_talepler(id) on delete set null,
  puan        int not null check (puan between 1 and 5),
  yorum       text not null default '',
  ad          text not null default '',
  onayli      boolean not null default false,
  created_at  timestamptz not null default now()
);

alter table public.ustam_ustalar enable row level security;
alter table public.ustam_talepler enable row level security;
alter table public.ustam_teklifler enable row level security;
alter table public.ustam_degerlendirmeler enable row level security;

insert into storage.buckets (id, name, public) values ('ustam-gorseller','ustam-gorseller', true) on conflict (id) do nothing;
