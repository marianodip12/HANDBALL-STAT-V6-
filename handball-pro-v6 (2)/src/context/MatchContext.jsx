import { createContext, useContext, useState, useCallback, useMemo, useEffect } from 'react'
import { db } from '../services/supabase.js'
import { computeMatchStats } from '../services/statsEngine.js'

const Ctx = createContext(null)
export const useMatch = () => useContext(Ctx)

const AID = 'hb_v6_active'
const loadAID = () => { try{return localStorage.getItem(AID)||null}catch{return null} }
const saveAID = id => { try{id?localStorage.setItem(AID,id):localStorage.removeItem(AID)}catch{} }

export const MatchProvider = ({ children }) => {
  const [matches,       setMatches]       = useState([])
  const [teams,         setTeams]         = useState([])
  const [activeMatchId, setActiveMatchId] = useState(loadAID)
  const [loading,       setLoading]       = useState(true)
  const [error,         setError]         = useState(null)

  useEffect(()=>{
    Promise.all([db.loadAll(), db.loadTeams()])
      .then(([m,t])=>{ setMatches(m); setTeams(t); setLoading(false) })
      .catch(e=>{ setError(e.message); setLoading(false) })
  },[])

  const selectMatch = useCallback(id=>{ setActiveMatchId(id); saveAID(id) },[])

  // Teams
  const createTeam = useCallback(async d=>{
    try{ const id=await db.createTeam(d); setTeams(p=>[{id,...d,jugadores:[]}, ...p]); return id }
    catch(e){ setError(e.message) }
  },[])
  const updateTeam = useCallback(async(id,d)=>{
    try{ await db.updateTeam(id,d); setTeams(p=>p.map(t=>t.id===id?{...t,...d}:t)) }
    catch(e){ setError(e.message) }
  },[])
  const deleteTeam = useCallback(async id=>{
    try{ await db.deleteTeam(id); setTeams(p=>p.filter(t=>t.id!==id)) }
    catch(e){ setError(e.message) }
  },[])
  const addTeamPlayer = useCallback(async(teamId,player)=>{
    try{ const id=await db.addTeamPlayer(teamId,player); setTeams(p=>p.map(t=>t.id===teamId?{...t,jugadores:[...(t.jugadores||[]),{id,...player}]}:t)); return id }
    catch(e){ setError(e.message) }
  },[])
  const updateTeamPlayer = useCallback(async(teamId,pId,data)=>{
    try{ await db.updateTeamPlayer(pId,data); setTeams(p=>p.map(t=>t.id===teamId?{...t,jugadores:t.jugadores.map(j=>j.id===pId?{...j,...data}:j)}:t)) }
    catch(e){ setError(e.message) }
  },[])
  const deleteTeamPlayer = useCallback(async(teamId,pId)=>{
    try{ await db.deleteTeamPlayer(pId); setTeams(p=>p.map(t=>t.id===teamId?{...t,jugadores:t.jugadores.filter(j=>j.id!==pId)}:t)) }
    catch(e){ setError(e.message) }
  },[])

  // Matches
  const createMatch = useCallback(async data=>{
    try{ const id=await db.createMatch(data); setMatches(p=>[{id,...data,jugadoresLocales:[],jugadoresVisitantes:[],arqueros:[],eventos:[]}, ...p]); selectMatch(id); return id }
    catch(e){ setError(e.message) }
  },[selectMatch])
  const updateMatch = useCallback(async(id,data)=>{
    try{ await db.updateMatch(id,data); setMatches(p=>p.map(m=>m.id===id?{...m,...data}:m)) }
    catch(e){ setError(e.message) }
  },[])
  const deleteMatch = useCallback(async id=>{
    try{ await db.deleteMatch(id); setMatches(p=>p.filter(m=>m.id!==id)); if(activeMatchId===id){setActiveMatchId(null);saveAID(null)} }
    catch(e){ setError(e.message) }
  },[activeMatchId])

  // Events
  const addEvento = useCallback(async(matchId,data)=>{
    try{ const id=await db.addEvent(matchId,data); setMatches(p=>p.map(m=>m.id===matchId?{...m,eventos:[...(m.eventos||[]),{...data,id}]}:m)); return id }
    catch(e){ setError(e.message) }
  },[])
  const deleteEvento = useCallback(async(matchId,eId)=>{
    try{ await db.deleteEvent(eId); setMatches(p=>p.map(m=>m.id===matchId?{...m,eventos:m.eventos.filter(e=>e.id!==eId)}:m)) }
    catch(e){ setError(e.message) }
  },[])

  // Players
  const addJugador = useCallback(async(matchId,equipo,nombre,numero,posicion)=>{
    try{ const id=await db.addPlayer(matchId,equipo,nombre,numero,posicion); const j={id,nombre,numero,posicion,equipo}; const f=equipo==='local'?'jugadoresLocales':'jugadoresVisitantes'; setMatches(p=>p.map(m=>m.id===matchId?{...m,[f]:[...(m[f]||[]),j]}:m)); return id }
    catch(e){ setError(e.message) }
  },[])
  const removeJugador = useCallback(async(matchId,equipo,jId)=>{
    try{ await db.deletePlayer(jId); const f=equipo==='local'?'jugadoresLocales':'jugadoresVisitantes'; setMatches(p=>p.map(m=>m.id===matchId?{...m,[f]:m[f].filter(j=>j.id!==jId)}:m)) }
    catch(e){ setError(e.message) }
  },[])
  const addArquero = useCallback(async(matchId,nombre,equipo)=>{
    try{ const id=await db.addArquero(matchId,nombre,equipo); setMatches(p=>p.map(m=>m.id===matchId?{...m,arqueros:[...(m.arqueros||[]),{id,nombre,equipo}]}:m)); return id }
    catch(e){ setError(e.message) }
  },[])
  const removeArquero = useCallback(async(matchId,aId)=>{
    try{ await db.deleteArquero(aId); setMatches(p=>p.map(m=>m.id===matchId?{...m,arqueros:m.arqueros.filter(a=>a.id!==aId)}:m)) }
    catch(e){ setError(e.message) }
  },[])

  const activeMatch = useMemo(()=>matches.find(m=>m.id===activeMatchId)||null,[matches,activeMatchId])
  const activeStats = useMemo(()=>activeMatch?computeMatchStats(activeMatch):null,[activeMatch])

  const exportCSV = useCallback(matchId=>{
    const match=matches.find(m=>m.id===matchId); if(!match) return
    const h=['id','equipo','jugadorId','tipoEvento','tipoGol','resultado','posX','posY','distancia','zonaAtaque','cuadrantePorteria','tipoAtaque','situacionNumerica','minuto','arqueroId']
    const csv=[h.join(','),...match.eventos.map(e=>h.map(k=>e[k]??'').join(','))].join('\n')
    const a=document.createElement('a'); a.href=URL.createObjectURL(new Blob([csv],{type:'text/csv'}))
    a.download=`handball_${match.rival}_${match.fecha}.csv`; a.click()
  },[matches])

  return <Ctx.Provider value={{
    matches, teams, activeMatch, activeMatchId, activeStats, loading, error,
    selectMatch, createMatch, updateMatch, deleteMatch,
    addEvento, deleteEvento, addJugador, removeJugador, addArquero, removeArquero, exportCSV,
    createTeam, updateTeam, deleteTeam, addTeamPlayer, updateTeamPlayer, deleteTeamPlayer,
  }}>{children}</Ctx.Provider>
}
