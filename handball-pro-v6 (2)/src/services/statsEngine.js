import { pct, efectividad, buildStatsRow } from '../utils/calculations.js'
import { soloTiros, soloGoles, porEquipo, porJugador, porArquero, buildTimeline } from '../utils/filters.js'
import { ZONAS_ATAQUE, DISTANCIAS, SITUACIONES, TIPOS_ATAQUE, TIPOS_GOL, CUADRANTES } from '../data/eventSchema.js'

// ── Team Stats ────────────────────────────────────────────────────────────────
export const computeTeamStats = (eventos, equipo) => {
  const evs  = porEquipo(eventos, equipo)
  const tiros = soloTiros(evs)
  const goles = soloGoles(evs).length
  const ataj  = evs.filter(e=>e.resultado==='atajada'||e.tipoEvento==='atajada').length
  const timeline = buildTimeline(evs,5).map(b=>{
    const bg=soloGoles(b.eventos).length
    return {min:b.min, goles:bg, tiros:soloTiros(b.eventos).length, eficacia:pct(bg,soloTiros(b.eventos).length)}
  })
  // Goals by type
  const porTipoGol = ['6m','9m','7m','contraataque','campo_a_campo'].map(t=>({
    tipo:t, goles:soloGoles(evs).filter(e=>e.tipoGol===t).length
  }))
  return {
    equipo, tiros:tiros.length, goles, atajadas:ataj,
    postes:evs.filter(e=>e.resultado==='poste').length,
    fuera:evs.filter(e=>e.resultado==='fuera').length,
    alArco:goles+ataj, eficacia:pct(goles,tiros.length),
    exclusiones:evs.filter(e=>e.tipoEvento==='exclusion').length,
    perdidas:evs.filter(e=>e.tipoEvento==='perdida').length,
    recuperaciones:evs.filter(e=>e.tipoEvento==='recuperacion').length,
    timeouts:evs.filter(e=>e.tipoEvento==='timeout').length,
    porZona:     Object.values(ZONAS_ATAQUE).map(z=>buildStatsRow(z,evs.filter(e=>e.zonaAtaque===z))),
    porDistancia:Object.values(DISTANCIAS).map(d=>buildStatsRow(d,evs.filter(e=>e.distancia===d))),
    porSituacion:Object.values(SITUACIONES).map(s=>buildStatsRow(s,evs.filter(e=>e.situacionNumerica===s))),
    porTipoGol, timeline,
    // Shot map data
    shotMap: tiros.filter(e=>e.posX!=null&&e.posY!=null).map(e=>({x:e.posX,y:e.posY,gol:e.tipoEvento==='gol',jugadorId:e.jugadorId}))
  }
}

// ── Player Stats ──────────────────────────────────────────────────────────────
export const computePlayerStats = (jugador, eventos) => {
  const evs   = porJugador(eventos, jugador.id)
  const tiros = soloTiros(evs)
  const goles = soloGoles(evs).length
  const ataj  = evs.filter(e=>e.resultado==='atajada').length
  return {
    jugador, totalEventos:evs.length, tiros:tiros.length, goles, atajadas:ataj,
    postes:evs.filter(e=>e.resultado==='poste').length,
    fuera:evs.filter(e=>e.resultado==='fuera').length,
    eficacia:pct(goles,tiros.length),
    exclusiones:evs.filter(e=>e.tipoEvento==='exclusion').length,
    perdidas:evs.filter(e=>e.tipoEvento==='perdida').length,
    porZona:Object.values(ZONAS_ATAQUE).map(z=>({...buildStatsRow(z,evs.filter(e=>e.zonaAtaque===z)),zona:z})),
    porTipoGol:['6m','9m','7m','contraataque','campo_a_campo'].map(t=>({tipo:t,goles:soloGoles(evs).filter(e=>e.tipoGol===t).length})),
    porDistancia:Object.values(DISTANCIAS).map(d=>({...buildStatsRow(d,evs.filter(e=>e.distancia===d)),distancia:d})),
    score: goles*10 + evs.filter(e=>e.tipoEvento==='recuperacion').length*3 - evs.filter(e=>e.tipoEvento==='exclusion').length*5 - evs.filter(e=>e.tipoEvento==='perdida').length*3,
  }
}

export const computeAllPlayerStats = (jugadores, eventos) =>
  jugadores.map(j=>computePlayerStats(j,eventos)).filter(s=>s.totalEventos>0).sort((a,b)=>b.goles-a.goles)

// ── Goalkeeper (Arquero) Stats ─────────────────────────────────────────────────
export const computeArqueroStats = (arquero, eventos) => {
  const evs   = porArquero(eventos, arquero.id)
  const tiros = soloTiros(evs)
  const goles = soloGoles(evs).length
  const ataj  = evs.filter(e=>e.resultado==='atajada'||e.tipoEvento==='atajada').length
  const ef    = efectividad(ataj, goles)
  return {
    arquero, recibidos:tiros.length, goles, atajadas:ataj,
    postes:evs.filter(e=>e.resultado==='poste').length,
    fuera:evs.filter(e=>e.resultado==='fuera').length,
    efectividad:ef, ratingLabel:'',
    porCuadrante:Object.values(CUADRANTES).map(q=>({...buildStatsRow(q,evs.filter(e=>e.cuadrantePorteria===q)),cuadrante:q})),
    porZona:Object.values(ZONAS_ATAQUE).map(z=>({...buildStatsRow(z,evs.filter(e=>e.zonaAtaque===z)),zona:z})),
    porDistancia:Object.values(DISTANCIAS).map(d=>({...buildStatsRow(d,evs.filter(e=>e.distancia===d)),distancia:d})),
  }
}

export const computeAllArqueroStats = (arqueros, eventos) =>
  arqueros.map(a=>computeArqueroStats(a,eventos)).filter(s=>s.recibidos>0).sort((a,b)=>b.efectividad-a.efectividad)

// ── MVP Engine ────────────────────────────────────────────────────────────────
export const computeMVP = (allStats) =>
  allStats.map(s=>({...s,mvpScore:s.score})).sort((a,b)=>b.mvpScore-a.mvpScore).map((s,i)=>({...s,rank:i+1}))

// ── Full Match Stats ──────────────────────────────────────────────────────────
export const computeMatchStats = (match) => {
  if(!match?.eventos) return null
  const {eventos,jugadoresLocales=[],jugadoresVisitantes=[],arqueros=[]} = match
  const tL = computeTeamStats(eventos,'local')
  const tV = computeTeamStats(eventos,'visitante')
  const pL = computeAllPlayerStats(jugadoresLocales, porEquipo(eventos,'local'))
  const pV = computeAllPlayerStats(jugadoresVisitantes, porEquipo(eventos,'visitante'))
  const aStats = computeAllArqueroStats(arqueros, eventos)
  return {
    match, teamLocal:tL, teamVisitante:tV,
    playersLocal:pL, playersVisitante:pV, arqueroStats:aStats,
    mvpLocal:computeMVP(pL), mvpVisitante:computeMVP(pV),
    meta:{ totalEventos:eventos.length, golesLocal:tL.goles, golesVisitante:tV.goles }
  }
}
