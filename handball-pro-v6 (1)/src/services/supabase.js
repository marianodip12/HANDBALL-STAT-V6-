import { createClient } from '@supabase/supabase-js'

const URL = 'https://wvndqyudzmqsqxovufey.supabase.co'
const KEY = 'sb_publishable_bQFLfmtLrkWL0U8Mtryjlw_sYTg3ShD'

export const supabase = createClient(URL, KEY)

const ok = (data, error, tag) => {
  if (error) { console.error('[DB]', tag, error.message); throw error }
  return data
}

export const db = {
  // ── Teams ───────────────────────────────────────────────────────────────────
  async loadTeams() {
    const { data, error } = await supabase.from('teams').select('*, team_players(*)').order('created_at',{ascending:false})
    ok(data,error,'loadTeams')
    return data.map(t=>({
      id:t.id, nombre:t.nombre, categoria:t.categoria, temporada:t.temporada,
      jugadores:(t.team_players||[]).map(p=>({
        id:p.id, nombre:p.nombre, numero:p.numero, posicion:p.posicion,
        esArquero:p.es_arquero, activo:p.activo,
      }))
    }))
  },
  async createTeam(d) {
    const {data,error} = await supabase.from('teams').insert({nombre:d.nombre,categoria:d.categoria||null,temporada:d.temporada||null}).select().single()
    return ok(data,error,'createTeam').id
  },
  async updateTeam(id,d) {
    const {error} = await supabase.from('teams').update({nombre:d.nombre,categoria:d.categoria||null,temporada:d.temporada||null}).eq('id',id)
    ok(null,error,'updateTeam')
  },
  async deleteTeam(id) {
    const {error} = await supabase.from('teams').delete().eq('id',id)
    ok(null,error,'deleteTeam')
  },
  async addTeamPlayer(teamId,p) {
    const {data,error} = await supabase.from('team_players').insert({team_id:teamId,nombre:p.nombre,numero:p.numero||null,posicion:p.posicion||null,es_arquero:p.esArquero||false,activo:true}).select().single()
    return ok(data,error,'addTeamPlayer').id
  },
  async updateTeamPlayer(id,p) {
    const {error} = await supabase.from('team_players').update({nombre:p.nombre,numero:p.numero||null,posicion:p.posicion||null,es_arquero:p.esArquero||false}).eq('id',id)
    ok(null,error,'updateTeamPlayer')
  },
  async deleteTeamPlayer(id) {
    const {error} = await supabase.from('team_players').delete().eq('id',id)
    ok(null,error,'deleteTeamPlayer')
  },

  // ── Matches ─────────────────────────────────────────────────────────────────
  async loadAll() {
    const {data,error} = await supabase.from('matches').select('*, players(*), goalkeepers(*), events(*)').order('created_at',{ascending:false})
    ok(data,error,'loadAll')
    return data.map(m=>({
      id:m.id, rival:m.rival, fecha:m.fecha, competicion:m.competicion,
      temporada:m.temporada, sede:m.sede, myTeamId:m.my_team_id,
      golesLocal:m.goles_local||0, golesVisitante:m.goles_visitante||0,
      jugadoresLocales:   (m.players||[]).filter(p=>p.equipo==='local').map(mapP),
      jugadoresVisitantes:(m.players||[]).filter(p=>p.equipo==='visitante').map(mapP),
      arqueros:           (m.goalkeepers||[]).map(mapG),
      eventos:            (m.events||[]).map(mapE),
    }))
  },
  async createMatch(d) {
    const {data,error} = await supabase.from('matches').insert({rival:d.rival,fecha:d.fecha||null,competicion:d.competicion||null,temporada:d.temporada||null,sede:d.sede||'local',my_team_id:d.myTeamId||null}).select().single()
    return ok(data,error,'createMatch').id
  },
  async updateMatch(id,d) {
    const {error} = await supabase.from('matches').update({rival:d.rival,fecha:d.fecha||null,competicion:d.competicion||null,temporada:d.temporada||null,sede:d.sede||'local',my_team_id:d.myTeamId||null}).eq('id',id)
    ok(null,error,'updateMatch')
  },
  async deleteMatch(id) {
    const {error} = await supabase.from('matches').delete().eq('id',id)
    ok(null,error,'deleteMatch')
  },

  // ── Events ──────────────────────────────────────────────────────────────────
  async addEvent(matchId,e) {
    const {data,error} = await supabase.from('events').insert({
      match_id:matchId, equipo:e.equipo||null, jugador_id:e.jugadorId||null,
      arquero_id:e.arqueroId||null, tipo_evento:e.tipoEvento||null,
      tipo_gol:e.tipoGol||null, resultado:e.resultado||null,
      pos_x:e.posX||null, pos_y:e.posY||null, zona_cancha:e.zonaCancha||null,
      cuadrante_porteria:e.cuadrantePorteria||null, distancia:e.distancia||null,
      zona_ataque:e.zonaAtaque||null, tipo_ataque:e.tipoAtaque||null,
      situacion_numerica:e.situacionNumerica||null, tipo_lanzamiento:e.tipoLanzamiento||null,
      minuto:e.minuto!==''&&e.minuto!=null?Number(e.minuto):null,
    }).select().single()
    return ok(data,error,'addEvent').id
  },
  async deleteEvent(id) {
    const {error} = await supabase.from('events').delete().eq('id',id)
    ok(null,error,'deleteEvent')
  },

  // ── Players / Arqueros ──────────────────────────────────────────────────────
  async addPlayer(matchId,equipo,nombre,numero,posicion) {
    const {data,error} = await supabase.from('players').insert({match_id:matchId,equipo,nombre,numero:numero||null,posicion:posicion||null}).select().single()
    return ok(data,error,'addPlayer').id
  },
  async deletePlayer(id) {
    const {error} = await supabase.from('players').delete().eq('id',id)
    ok(null,error,'deletePlayer')
  },
  async addArquero(matchId,nombre,equipo) {
    const {data,error} = await supabase.from('goalkeepers').insert({match_id:matchId,nombre,equipo}).select().single()
    return ok(data,error,'addArquero').id
  },
  async deleteArquero(id) {
    const {error} = await supabase.from('goalkeepers').delete().eq('id',id)
    ok(null,error,'deleteArquero')
  },
}

const mapP = p => ({id:p.id,nombre:p.nombre,numero:p.numero,posicion:p.posicion,equipo:p.equipo})
const mapG = g => ({id:g.id,nombre:g.nombre,equipo:g.equipo})
const mapE = e => ({
  id:e.id, equipo:e.equipo, jugadorId:e.jugador_id, arqueroId:e.arquero_id,
  tipoEvento:e.tipo_evento, tipoGol:e.tipo_gol, resultado:e.resultado,
  posX:e.pos_x, posY:e.pos_y, zonaCancha:e.zona_cancha,
  cuadrantePorteria:e.cuadrante_porteria, distancia:e.distancia,
  zonaAtaque:e.zona_ataque, tipoAtaque:e.tipo_ataque,
  situacionNumerica:e.situacion_numerica, tipoLanzamiento:e.tipo_lanzamiento,
  minuto:e.minuto,
})
