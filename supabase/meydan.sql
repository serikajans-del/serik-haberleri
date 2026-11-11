-- OKUR HABERLERİ (serikhaberleri.com/okur) — kullanıcıların şehirde olup biteni paylaştığı bölüm (tablolar meydan_ önekli)
-- Supabase SQL Editor > New query > bu dosyanın tamamını yapıştır > Run (tekrar çalıştırmak güvenlidir)
-- Site yalnızca sunucudaki service_role anahtarıyla okur/yazar (RLS açık, herkese açık politika yok).

-- Üyeler: ekranda yalnız rumuz görünür. Şifre scrypt ile özetlenir, düz şifre tutulmaz.
create table if not exists public.meydan_uyeler (
  id            bigint generated always as identity primary key,
  rumuz         text not null,
  rumuz_kucuk   text not null unique,              -- benzersizlik için küçük harfli hâli
  sifre_hash    text not null,
  cinsiyet      text not null default 'belirtilmedi', -- kadin | erkek | belirtilmedi
  mahalle       text not null default '',
  guvenilir     boolean not null default false,   -- true: paylaşımları onaysız yayına girer
  engelli       boolean not null default false,   -- true: giriş ve paylaşım kapalı
  kayit_ip      text not null default '',         -- 5651: erişim kaydı
  kvkk_onay_at  timestamptz not null default now(),
  created_at    timestamptz not null default now()
);

create table if not exists public.meydan_oturumlar (
  token_hash  text primary key,                   -- çerezdeki rastgele anahtarın SHA-256 özeti
  uye_id      bigint not null references public.meydan_uyeler(id) on delete cascade,
  ip          text not null default '',
  bitis       timestamptz not null,
  created_at  timestamptz not null default now()
);
create index if not exists meydan_oturumlar_uye_idx on public.meydan_oturumlar (uye_id);

create table if not exists public.meydan_paylasimlar (
  id             bigint generated always as identity primary key,
  slug           text not null unique,
  uye_id         bigint not null references public.meydan_uyeler(id) on delete cascade,
  kategori       text not null,
  baslik         text not null,
  icerik         text not null,
  fotolar        text[] not null default '{}',
  mahalle        text not null default '',
  yer            text not null default '',        -- kullanıcının yazdığı yer (sokak, mevki)
  olay_tarihi    date,
  olay_saati     text not null default '',        -- "14:30"
  isletme_adi    text not null default '',        -- işletme tavsiyesinde
  durum          text not null default 'beklemede', -- beklemede | yayinda | reddedildi | kaldirildi
  cozum          text not null default 'acik',    -- şikâyetlerde: acik | iletildi | cozuldu
  red_nedeni     text not null default '',
  begeni_sayisi  int not null default 0,
  yorum_sayisi   int not null default 0,
  faydali_sayisi int not null default 0,
  goruntulenme   int not null default 0,
  ip             text not null default '',
  created_at     timestamptz not null default now(),
  yayin_at       timestamptz
);
create index if not exists meydan_paylasim_durum_idx on public.meydan_paylasimlar (durum, yayin_at desc);
create index if not exists meydan_paylasim_kat_idx on public.meydan_paylasimlar (kategori, durum);
create index if not exists meydan_paylasim_uye_idx on public.meydan_paylasimlar (uye_id);

create table if not exists public.meydan_yorumlar (
  id           bigint generated always as identity primary key,
  paylasim_id  bigint not null references public.meydan_paylasimlar(id) on delete cascade,
  uye_id       bigint not null references public.meydan_uyeler(id) on delete cascade,
  icerik       text not null,
  durum        text not null default 'yayinda',   -- yayinda | beklemede | kaldirildi
  ip           text not null default '',
  created_at   timestamptz not null default now()
);
create index if not exists meydan_yorum_paylasim_idx on public.meydan_yorumlar (paylasim_id, created_at);

create table if not exists public.meydan_begeniler (
  paylasim_id  bigint not null references public.meydan_paylasimlar(id) on delete cascade,
  uye_id       bigint not null references public.meydan_uyeler(id) on delete cascade,
  created_at   timestamptz not null default now(),
  primary key (paylasim_id, uye_id)
);

create table if not exists public.meydan_faydali (
  paylasim_id  bigint not null references public.meydan_paylasimlar(id) on delete cascade,
  uye_id       bigint not null references public.meydan_uyeler(id) on delete cascade,
  created_at   timestamptz not null default now(),
  primary key (paylasim_id, uye_id)
);

create table if not exists public.meydan_bildirimler (
  id           bigint generated always as identity primary key,
  paylasim_id  bigint references public.meydan_paylasimlar(id) on delete cascade,
  yorum_id     bigint references public.meydan_yorumlar(id) on delete cascade,
  uye_id       bigint references public.meydan_uyeler(id) on delete set null,
  neden        text not null,
  aciklama     text not null default '',
  durum        text not null default 'yeni',      -- yeni | incelendi
  ip           text not null default '',
  created_at   timestamptz not null default now()
);

-- Her ayın kazananı (ay = ayın ilk günü, Türkiye saatine göre)
create table if not exists public.meydan_ay_kazananlari (
  ay          date primary key,
  uye_id      bigint references public.meydan_uyeler(id) on delete set null,
  rumuz       text not null,
  cinsiyet    text not null default 'belirtilmedi',
  puan        numeric not null,
  created_at  timestamptz not null default now()
);

-- Sayaçlar: beğeni / yorum / faydalı değişince paylaşımdaki sayı güncellenir
create or replace function public.meydan_sayac() returns trigger language plpgsql as $$
declare pid bigint; begin
  pid := coalesce(new.paylasim_id, old.paylasim_id);
  update public.meydan_paylasimlar p set
    begeni_sayisi  = (select count(*) from public.meydan_begeniler b where b.paylasim_id = pid),
    faydali_sayisi = (select count(*) from public.meydan_faydali f where f.paylasim_id = pid),
    yorum_sayisi   = (select count(*) from public.meydan_yorumlar y where y.paylasim_id = pid and y.durum = 'yayinda')
  where p.id = pid;
  return null;
end $$;

drop trigger if exists meydan_begeni_sayac on public.meydan_begeniler;
create trigger meydan_begeni_sayac after insert or delete on public.meydan_begeniler for each row execute function public.meydan_sayac();
drop trigger if exists meydan_faydali_sayac on public.meydan_faydali;
create trigger meydan_faydali_sayac after insert or delete on public.meydan_faydali for each row execute function public.meydan_sayac();
drop trigger if exists meydan_yorum_sayac on public.meydan_yorumlar;
create trigger meydan_yorum_sayac after insert or update or delete on public.meydan_yorumlar for each row execute function public.meydan_sayac();

-- AYIN LİDERLERİ PUANI (yalnız [p_bas, p_bit) aralığında olan etkileşimler sayılır)
--   yayındaki paylaşım: 2 puan
--   beğeni: her farklı kişi 1 puan (aynı kişinin o ayki tüm beğenileri 1 sayılır), 7 günden yeni hesaplar 0,5
--   yorum: her paylaşıma yorum yapan her farklı kişi 2 puan
--   "işime yaradı": 5 puan
--   kendi paylaşımına yapılan etkileşim, engelli üyelerin etkileşimi ve yayında olmayan paylaşımlar sayılmaz
create or replace function public.meydan_ay_puanlari(p_bas timestamptz, p_bit timestamptz, adet int default 5)
returns table (uye_id bigint, rumuz text, cinsiyet text, puan numeric, paylasim bigint, begeni numeric, yorum bigint, faydali bigint)
language sql stable as $$
  with yp as (
    select p.id, p.uye_id from public.meydan_paylasimlar p where p.durum = 'yayinda'
  ),
  pay as (
    select p.uye_id, count(*) as n from public.meydan_paylasimlar p
    where p.durum = 'yayinda' and p.yayin_at >= p_bas and p.yayin_at < p_bit group by p.uye_id
  ),
  beg as (
    select x.yazar, sum(x.agirlik) as n from (
      select distinct on (yp.uye_id, b.uye_id) yp.uye_id as yazar,
        case when u.created_at > b.created_at - interval '7 days' then 0.5 else 1 end as agirlik
      from public.meydan_begeniler b
      join yp on yp.id = b.paylasim_id
      join public.meydan_uyeler u on u.id = b.uye_id and not u.engelli
      where b.created_at >= p_bas and b.created_at < p_bit and b.uye_id <> yp.uye_id
      order by yp.uye_id, b.uye_id, b.created_at
    ) x group by x.yazar
  ),
  yor as (
    select yp.uye_id as yazar, count(distinct (y.paylasim_id, y.uye_id)) as n
    from public.meydan_yorumlar y
    join yp on yp.id = y.paylasim_id
    join public.meydan_uyeler u on u.id = y.uye_id and not u.engelli
    where y.durum = 'yayinda' and y.created_at >= p_bas and y.created_at < p_bit and y.uye_id <> yp.uye_id
    group by yp.uye_id
  ),
  fay as (
    select yp.uye_id as yazar, count(*) as n
    from public.meydan_faydali f
    join yp on yp.id = f.paylasim_id
    join public.meydan_uyeler u on u.id = f.uye_id and not u.engelli
    where f.created_at >= p_bas and f.created_at < p_bit and f.uye_id <> yp.uye_id
    group by yp.uye_id
  )
  select u.id, u.rumuz, u.cinsiyet,
    coalesce(pay.n,0)*2 + coalesce(beg.n,0) + coalesce(yor.n,0)*2 + coalesce(fay.n,0)*5 as puan,
    coalesce(pay.n,0), coalesce(beg.n,0), coalesce(yor.n,0), coalesce(fay.n,0)
  from public.meydan_uyeler u
  left join pay on pay.uye_id = u.id
  left join beg on beg.yazar = u.id
  left join yor on yor.yazar = u.id
  left join fay on fay.yazar = u.id
  where not u.engelli and (pay.n is not null or beg.n is not null or yor.n is not null or fay.n is not null)
  order by puan desc, u.created_at asc
  limit adet;
$$;

create or replace function public.meydan_goruntulenme(pid bigint) returns void language sql as $$
  update public.meydan_paylasimlar set goruntulenme = goruntulenme + 1 where id = pid;
$$;

alter table public.meydan_uyeler enable row level security;
alter table public.meydan_oturumlar enable row level security;
alter table public.meydan_paylasimlar enable row level security;
alter table public.meydan_yorumlar enable row level security;
alter table public.meydan_begeniler enable row level security;
alter table public.meydan_faydali enable row level security;
alter table public.meydan_bildirimler enable row level security;
alter table public.meydan_ay_kazananlari enable row level security;

insert into storage.buckets (id, name, public) values ('meydan-gorseller','meydan-gorseller', true) on conflict (id) do nothing;
