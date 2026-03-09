-- ═══════════════════════════════════════════════════════════════
-- HANDBALL PRO V6 — SQL Schema
-- Correr completo en Supabase SQL Editor
-- ═══════════════════════════════════════════════════════════════

-- Temporadas
create table if not exists seasons (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  año_inicio integer,
  año_fin integer,
  activa boolean default true,
  created_at timestamptz default now()
);

-- Equipos (ya existe, agregar columna si falta)
create table if not exists teams (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  categoria text,
  temporada text,
  created_at timestamptz default now()
);

-- Jugadores permanentes del equipo
create table if not exists team_players (
  id uuid primary key default gen_random_uuid(),
  team_id uuid references teams(id) on delete cascade,
  nombre text not null,
  numero text,
  posicion text,
  es_arquero boolean default false,
  activo boolean default true
);

-- Partidos (ya existe, extender)
create table if not exists matches (
  id uuid primary key default gen_random_uuid(),
  rival text not null,
  fecha date,
  competicion text,
  temporada text,
  sede text default 'local',
  my_team_id uuid references teams(id),
  season_id uuid references seasons(id),
  goles_local integer default 0,
  goles_visitante integer default 0,
  created_at timestamptz default now()
);

-- Jugadores por partido
create table if not exists players (
  id uuid primary key default gen_random_uuid(),
  match_id uuid references matches(id) on delete cascade,
  equipo text,
  nombre text,
  numero text,
  posicion text
);

-- Arqueros por partido
create table if not exists goalkeepers (
  id uuid primary key default gen_random_uuid(),
  match_id uuid references matches(id) on delete cascade,
  nombre text,
  equipo text
);

-- Eventos del partido (versión V6 extendida)
create table if not exists events (
  id uuid primary key default gen_random_uuid(),
  match_id uuid references matches(id) on delete cascade,
  equipo text,                    -- 'local' | 'visitante'
  jugador_id uuid,
  arquero_id uuid,
  tipo_evento text,               -- 'gol' | 'tiro_errado' | 'atajada' | 'perdida' | 'recuperacion' | 'exclusion' | 'timeout'
  tipo_gol text,                  -- 'campo' | 'contraataque' | '7m' | 'campo_a_campo' | '9m'
  resultado text,                 -- 'gol' | 'atajada' | 'poste' | 'fuera'
  -- Posición en cancha (coordenadas %)
  pos_x float,                    -- 0-100% del ancho de la cancha
  pos_y float,                    -- 0-100% del alto de la cancha
  zona_cancha text,               -- zona calculada del click
  -- Zona de portería
  cuadrante_porteria text,        -- 'sup_izq'|'sup_der'|'inf_izq'|'inf_der'|'centro'
  -- Contexto táctico
  distancia text,                 -- '6m'|'9m'|'7m'|'campo'
  zona_ataque text,               -- 'A'|'B'|'C'|'D'|'E'|'F'
  tipo_ataque text,               -- 'contraataque'|'posicional'|'campo'
  situacion_numerica text,        -- 'igualdad'|'superioridad'|'inferioridad'
  tipo_lanzamiento text,          -- 'penetracion'|'finta'|'habilidad'|'salto'|'apoyo'
  minuto integer,
  created_at timestamptz default now()
);

-- RLS (políticas abiertas — sin login por ahora)
alter table seasons      enable row level security;
alter table teams        enable row level security;
alter table team_players enable row level security;
alter table matches      enable row level security;
alter table players      enable row level security;
alter table goalkeepers  enable row level security;
alter table events       enable row level security;

drop policy if exists "open seasons"      on seasons;
drop policy if exists "open teams"        on teams;
drop policy if exists "open team_players" on team_players;
drop policy if exists "open matches"      on matches;
drop policy if exists "open players"      on players;
drop policy if exists "open goalkeepers"  on goalkeepers;
drop policy if exists "open events"       on events;

create policy "open seasons"      on seasons      for all using (true) with check (true);
create policy "open teams"        on teams        for all using (true) with check (true);
create policy "open team_players" on team_players for all using (true) with check (true);
create policy "open matches"      on matches      for all using (true) with check (true);
create policy "open players"      on players      for all using (true) with check (true);
create policy "open goalkeepers"  on goalkeepers  for all using (true) with check (true);
create policy "open events"       on events       for all using (true) with check (true);
