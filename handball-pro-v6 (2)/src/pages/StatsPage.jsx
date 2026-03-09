import { useState } from 'react'
import { useMatch } from '../context/MatchContext.jsx'
import { Card, Section, StatBox, StatsTable, EmptyState, PctBar, T } from '../components/ui/index.jsx'
import { VBarChart, HBarChart, TimelineChart, RadarCompare } from '../components/charts/StatsCharts.jsx'
import { GoalMap } from '../components/court/HandballCourt.jsx'
import HandballCourtZones from '../components/charts/HandballCourtZones.jsx'
import { LABELS, ZONAS_ATAQUE, DISTANCIAS, SITUACIONES, TIPOS_GOL } from '../data/eventSchema.js'
import { generatePlayerAnalysis } from '../services/mvpEngine.js'

const SUBTABS = [
  {id:'equipo',    label:'Equipo',   icon:'📊'},
  {id:'jugadores', label:'Jugadores',icon:'👥'},
  {id:'arqueros',  label:'Arqueros', icon:'🧤'},
  {id:'avanzado',  label:'Avanzado', icon:'📈'},
  {id:'zonas',     label:'Zonas',    icon:'🏟️'},
  {id:'mvp',       label:'MVP',      icon:'🥇'},
]

export const StatsPage = () => {
  const {activeMatch,activeStats} = useMatch()
  const [subtab,setSubtab] = useState('equipo')
  if(!activeMatch||!activeStats) return <EmptyState icon="📊" title="Sin partido activo" sub="Activá un partido para ver estadísticas"/>
  return(<div>
    <div style={{overflowX:'auto',WebkitOverflowScrolling:'touch',marginBottom:20}}>
      <div style={{display:'flex',gap:6,minWidth:'max-content',paddingBottom:6}}>
        {SUBTABS.map(t=>(
          <button key={t.id} onClick={()=>setSubtab(t.id)} style={{
            background:subtab===t.id?T.accent:T.card2,color:subtab===t.id?T.bg:T.muted,
            border:'none',borderRadius:20,padding:'9px 16px',fontSize:12,
            fontWeight:subtab===t.id?'bold':'normal',cursor:'pointer',whiteSpace:'nowrap',
            WebkitTapHighlightColor:'transparent',
          }}>{t.icon} {t.label}</button>
        ))}
      </div>
    </div>
    {subtab==='equipo'    && <EquipoTab    stats={activeStats}/>}
    {subtab==='jugadores' && <JugadoresTab stats={activeStats}/>}
    {subtab==='arqueros'  && <ArquerosTab  stats={activeStats}/>}
    {subtab==='avanzado'  && <AvanzadoTab  stats={activeStats}/>}
    {subtab==='zonas'     && <ZonasTab     stats={activeStats}/>}
    {subtab==='mvp'       && <MVPTab       stats={activeStats}/>}
  </div>)
}

// ─── helpers ─────────────────────────────────────────────────────────────────
const ratingC = v => v>=60?T.accent:v>=45?T.warn:T.red

// ─── EQUIPO ───────────────────────────────────────────────────────────────────
const EquipoTab = ({stats}) => {
  const {teamLocal:L,teamVisitante:V} = stats
  return(<div>
    <TeamPanel team={L} label="Local" color={T.accent}/>
    <TeamPanel team={V} label="Visitante" color={T.cyan}/>
    <Section title="Comparativa">
      <VBarChart data={[
        {name:'Goles',    Local:L.goles,         Visitante:V.goles},
        {name:'Tiros',    Local:L.tiros,          Visitante:V.tiros},
        {name:'% Gol',   Local:L.eficacia,       Visitante:V.eficacia},
        {name:'Excl.',   Local:L.exclusiones,    Visitante:V.exclusiones},
        {name:'Pérd.',   Local:L.perdidas,       Visitante:V.perdidas},
        {name:'Rec.',    Local:L.recuperaciones, Visitante:V.recuperaciones},
      ]} dataKeys={[{key:'Local',color:T.accent},{key:'Visitante',color:T.cyan}]} height={220}/>
    </Section>
  </div>)
}

const TeamPanel = ({team:t,label,color}) => (<Section title={label}>
  <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:8,marginBottom:10}}>
    <StatBox label="Goles"  value={t.goles}         color={T.red}                                    small/>
    <StatBox label="Tiros"  value={t.tiros}          color={color}                                    small/>
    <StatBox label="% Gol"  value={`${t.eficacia}%`} color={t.eficacia>=50?T.accent:T.warn}          small/>
    <StatBox label="Excl."  value={t.exclusiones}   color={T.red}                                    small/>
  </div>
  <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:8,marginBottom:14}}>
    <StatBox label="Pérd."  value={t.perdidas}       color={T.warn}  small/>
    <StatBox label="Recup." value={t.recuperaciones} color={T.accent}small/>
    <StatBox label="Postes" value={t.postes||0}      color={T.warn}  small/>
    <StatBox label="Fuera"  value={t.fuera||0}       color={T.muted} small/>
  </div>
  {/* Por tipo de gol */}
  <div style={{marginBottom:14}}>
    <div style={{fontSize:11,color:T.muted,letterSpacing:1,marginBottom:8,textTransform:'uppercase'}}>Goles por tipo</div>
    <div style={{display:'grid',gridTemplateColumns:'repeat(5,1fr)',gap:6}}>
      {t.porTipoGol?.map(({tipo,goles})=>(
        <Card key={tipo} style={{textAlign:'center',padding:'10px 4px'}}>
          <div style={{fontSize:16,fontWeight:'bold',color:goles>0?T.accent:T.muted}}>{goles}</div>
          <div style={{fontSize:8,color:T.muted,marginTop:2,lineHeight:1.2}}>{LABELS.tipoGol[tipo]||tipo}</div>
        </Card>
      ))}
    </div>
  </div>
  {/* Timeline */}
  {t.timeline?.length>0&&(<>
    <div style={{fontSize:11,color:T.muted,letterSpacing:1,marginBottom:8,textTransform:'uppercase'}}>Línea de tiempo</div>
    <TimelineChart data={t.timeline} dataKeys={[{key:'goles',name:'Goles',color:T.red},{key:'tiros',name:'Tiros',color:color,dashed:true}]} height={180}/>
  </>)}
  <div style={{marginTop:14}}>
    <div style={{fontSize:11,color:T.muted,letterSpacing:1,marginBottom:8,textTransform:'uppercase'}}>Por zona</div>
    <StatsTable rows={t.porZona.map(r=>({...r,label:LABELS.zonaAtaqueFull[r.label]||r.label}))}/>
  </div>
</Section>)

// ─── JUGADORES ────────────────────────────────────────────────────────────────
const JugadoresTab = ({stats}) => {
  const [equipo,setEquipo] = useState('local')
  const [selected,setSelected] = useState(null)
  const [ptab,setPtab] = useState('zona')
  const players = equipo==='local' ? stats.playersLocal : stats.playersVisitante
  const color   = equipo==='local' ? T.accent : T.cyan
  const MEDAL   = ['🥇','🥈','🥉']
  return(<div>
    <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8,marginBottom:16}}>
      {['local','visitante'].map(eq=>(
        <button key={eq} onClick={()=>{setEquipo(eq);setSelected(null)}} style={{background:equipo===eq?(eq==='local'?T.accent:T.cyan):T.card2,color:equipo===eq?T.bg:T.muted,border:'none',borderRadius:10,padding:'11px',fontSize:13,fontWeight:'bold',cursor:'pointer'}}>
          {eq==='local'?'🏠 Local':'✈️ Visitante'}
        </button>
      ))}
    </div>
    {players.length===0
      ? <EmptyState icon="👤" title="Sin jugadores registrados"/>
      : players.map((p,i)=>{
          const isOpen = selected===p.jugador.id
          return(<Card key={p.jugador.id} style={{marginBottom:10,cursor:'pointer',border:`1.5px solid ${isOpen?color:T.border}`}} onClick={()=>setSelected(isOpen?null:p.jugador.id)}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
              <div style={{display:'flex',alignItems:'center',gap:10}}>
                <div style={{fontSize:18,fontWeight:'bold',color:i<3?T.warn:T.muted,minWidth:28}}>{MEDAL[i]||`#${i+1}`}</div>
                <div>
                  <div style={{fontSize:14,fontWeight:'bold',color:T.text}}>{p.jugador.numero?`#${p.jugador.numero} `:''}{ p.jugador.nombre}</div>
                  <div style={{fontSize:11,color:T.muted}}>{p.tiros} tiros · {p.goles} goles · {p.eficacia}% eficacia</div>
                </div>
              </div>
              <div style={{textAlign:'right'}}><div style={{fontSize:16,fontWeight:'bold',color}}>{p.goles}</div><div style={{fontSize:9,color:T.muted}}>GOL</div></div>
            </div>
            {isOpen&&(<div style={{marginTop:14,paddingTop:14,borderTop:`1px solid ${T.border}`}}>
              <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:6,marginBottom:10}}>
                <StatBox label="Goles"  value={p.goles}          color={T.red}    small/>
                <StatBox label="Tiros"  value={p.tiros}           color={color}    small/>
                <StatBox label="% Gol"  value={`${p.eficacia}%`} color={T.accent} small/>
                <StatBox label="Excl."  value={p.exclusiones}    color={T.red}    small/>
              </div>
              {/* Player subtabs */}
              <div style={{display:'flex',gap:6,marginBottom:10,overflowX:'auto'}}>
                {['zona','tipo gol','distancia','situación'].map(t=>(
                  <button key={t} onClick={e=>{e.stopPropagation();setPtab(t)}} style={{background:ptab===t?color:T.card2,color:ptab===t?T.bg:T.muted,border:'none',borderRadius:16,padding:'6px 12px',fontSize:11,cursor:'pointer',whiteSpace:'nowrap'}}>{t}</button>
                ))}
              </div>
              {ptab==='zona'     &&<StatsTable rows={p.porZona.map(r=>({...r,label:LABELS.zonaAtaqueFull[r.zona]||r.zona}))}/>}
              {ptab==='tipo gol' &&(
                <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:6}}>
                  {p.porTipoGol?.filter(r=>r.goles>0).map(({tipo,goles})=>(
                    <Card key={tipo} style={{textAlign:'center',padding:'10px 6px'}}>
                      <div style={{fontSize:18,fontWeight:'bold',color:T.accent}}>{goles}</div>
                      <div style={{fontSize:9,color:T.muted,marginTop:2,lineHeight:1.3}}>{LABELS.tipoGol[tipo]||tipo}</div>
                    </Card>
                  ))}
                </div>
              )}
              {ptab==='distancia'&&<StatsTable rows={p.porDistancia.map(r=>({...r,label:LABELS.distanciaFull?.[r.distancia]||r.distancia}))}/>}
              {ptab==='situación'&&<StatsTable rows={p.porDistancia.map(r=>({...r,label:LABELS.situacion?.[r.situacion]||r.situacion}))}/>}
              {generatePlayerAnalysis(p).length>0&&(
                <div style={{marginTop:10,background:T.card2,borderRadius:10,padding:12}}>
                  <div style={{fontSize:11,color:T.accent,marginBottom:6,letterSpacing:1}}>💡 ANÁLISIS</div>
                  {generatePlayerAnalysis(p).map((ins,j)=><div key={j} style={{fontSize:12,color:T.text,marginBottom:3}}>{ins}</div>)}
                </div>
              )}
            </div>)}
          </Card>)
        })
    }
  </div>)
}

// ─── ARQUEROS ─────────────────────────────────────────────────────────────────
const ArquerosTab = ({stats}) => {
  const [selected,setSelected] = useState(null)
  const [ptab,setPtab] = useState('cuadrante')
  const {arqueroStats=[]} = stats
  if(!arqueroStats.length) return <EmptyState icon="🧤" title="Sin datos de arqueros" sub="Asociá arqueros al registrar lanzamientos"/>
  return(<div>
    {arqueroStats.length>=2&&(
      <Section title="Comparativa">
        <VBarChart data={arqueroStats.map(a=>({
          name:a.arquero.nombre.split(' ')[0],
          Atajadas:a.atajadas, Goles:a.goles,
          '% Ef.':a.efectividad,
        }))} dataKeys={[{key:'Atajadas',color:T.accent},{key:'Goles',color:T.red}]} height={200}/>
      </Section>
    )}
    {arqueroStats.map(gk=>(
      <Card key={gk.arquero.id} style={{marginBottom:12,cursor:'pointer',border:`1.5px solid ${selected===gk.arquero.id?T.orange:T.border}`}} onClick={()=>setSelected(selected===gk.arquero.id?null:gk.arquero.id)}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:10}}>
          <div>
            <div style={{fontSize:15,fontWeight:'bold',color:T.text}}>🧤 {gk.arquero.nombre}</div>
            <div style={{fontSize:11,color:T.muted,marginTop:2}}>
              {gk.recibidos} disparos · {gk.atajadas} atajadas · {gk.goles} goles
            </div>
          </div>
          <div style={{textAlign:'right'}}>
            <div style={{fontSize:26,fontWeight:'bold',color:ratingC(gk.efectividad)}}>{gk.efectividad}%</div>
            <div style={{fontSize:9,color:T.muted}}>ATAJADAS</div>
          </div>
        </div>
        <PctBar value={gk.efectividad} color={ratingC(gk.efectividad)} height={6}/>
        {selected===gk.arquero.id&&(<div style={{marginTop:14,paddingTop:14,borderTop:`1px solid ${T.border}`}}>
          <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:6,marginBottom:14}}>
            <StatBox label="Atajadas" value={gk.atajadas}   color={T.accent} small/>
            <StatBox label="Goles"    value={gk.goles}       color={T.red}    small/>
            <StatBox label="Postes"   value={gk.postes||0}   color={T.warn}   small/>
            <StatBox label="% Ataj."  value={`${gk.efectividad}%`} color={ratingC(gk.efectividad)} small/>
          </div>
          <GoalMap porCuadrante={gk.porCuadrante} title="Mapa de portería"/>
          <div style={{display:'flex',gap:6,marginTop:14,marginBottom:10,overflowX:'auto'}}>
            {['cuadrante','zona','distancia'].map(t=>(
              <button key={t} onClick={e=>{e.stopPropagation();setPtab(t)}} style={{background:ptab===t?T.orange:T.card2,color:ptab===t?T.bg:T.muted,border:'none',borderRadius:16,padding:'6px 12px',fontSize:11,cursor:'pointer',whiteSpace:'nowrap'}}>{t}</button>
            ))}
          </div>
          {ptab==='cuadrante'&&<StatsTable rows={gk.porCuadrante.map(r=>({...r,label:LABELS.cuadranteFull?.[r.cuadrante]||r.cuadrante}))}/>}
          {ptab==='zona'     &&<StatsTable rows={gk.porZona.map(r=>({...r,label:LABELS.zonaAtaqueFull[r.zona]||r.zona}))}/>}
          {ptab==='distancia'&&<StatsTable rows={gk.porDistancia.map(r=>({...r,label:LABELS.distanciaFull?.[r.distancia]||r.distancia}))}/>}
        </div>)}
      </Card>
    ))}
  </div>)
}

// ─── AVANZADO (v3 style — side-by-side H-bar charts) ─────────────────────────
const AvanzadoTab = ({stats}) => {
  const {teamLocal:L,teamVisitante:V} = stats
  const [dim,setDim]   = useState('zona')
  const [eq,setEq]     = useState('local')
  const DIMS = [{id:'zona',label:'Zona Ataque'},{id:'distancia',label:'Distancia'},{id:'situacion',label:'Numérica'},{id:'tipoGol',label:'Tipo de Gol'}]
  const team = eq==='local' ? L : V

  const rows = () => {
    if(dim==='zona')      return team.porZona.map(r=>({...r,label:LABELS.zonaAtaqueFull[r.label]||r.label}))
    if(dim==='distancia') return team.porDistancia.map(r=>({...r,label:LABELS.distanciaFull?.[r.label]||r.label}))
    if(dim==='situacion') return team.porSituacion.map(r=>({...r,label:LABELS.situacion?.[r.label]||r.label}))
    if(dim==='tipoGol')   return (team.porTipoGol||[]).map(r=>({label:LABELS.tipoGol[r.tipo]||r.tipo,tiros:r.goles,goles:r.goles,atajadas:0,postes:0,fuera:0,alArco:r.goles,eficacia:r.goles>0?100:0,efectividad:0}))
    return []
  }

  const active = rows().filter(r=>(r.tiros||0)>0||(r.goles||0)>0)
  const hBarData = active.map(r=>({name:r.label,Atajadas:r.atajadas||0,Goles:r.goles}))
  const effData  = active.map(r=>({name:r.label,'% Gol':r.eficacia,'% Ataj.':r.efectividad}))

  return(<div>
    {/* Equipo selector */}
    <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8,marginBottom:12}}>
      {['local','visitante'].map(e=>(
        <button key={e} onClick={()=>setEq(e)} style={{background:eq===e?(e==='local'?T.accent:T.cyan):T.card2,color:eq===e?T.bg:T.muted,border:'none',borderRadius:10,padding:'10px',fontWeight:'bold',cursor:'pointer',fontSize:13}}>
          {e==='local'?'🏠 Local':'✈️ Visitante'}
        </button>
      ))}
    </div>
    {/* Dim selector */}
    <div style={{display:'flex',gap:6,marginBottom:16,overflowX:'auto'}}>
      {DIMS.map(d=>(
        <button key={d.id} onClick={()=>setDim(d.id)} style={{background:dim===d.id?T.accent:T.card2,color:dim===d.id?T.bg:T.muted,border:'none',borderRadius:16,padding:'8px 14px',fontSize:12,fontWeight:dim===d.id?'bold':'normal',cursor:'pointer',whiteSpace:'nowrap'}}>{d.label}</button>
      ))}
    </div>

    {active.length===0
      ? <div style={{textAlign:'center',color:T.muted,padding:32,fontSize:12}}>Sin datos para este filtro</div>
      : (<>
          {/* Two charts side by side like v3 */}
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12,marginBottom:16}}>
            <Card style={{padding:12}}>
              <div style={{fontSize:10,color:T.accent,letterSpacing:1,marginBottom:10,textTransform:'uppercase'}}>Atajadas y Goles</div>
              <HBarChart data={hBarData} dataKeys={[{key:'Atajadas',color:T.accent,name:'Atajadas'},{key:'Goles',color:T.red,name:'Goles'}]} height={Math.max(160,active.length*36)}/>
            </Card>
            <Card style={{padding:12}}>
              <div style={{fontSize:10,color:T.cyan,letterSpacing:1,marginBottom:10,textTransform:'uppercase'}}>Efectividad %</div>
              <HBarChart data={effData} dataKeys={[{key:'% Gol',color:T.red,name:'% Gol'},{key:'% Ataj.',color:T.accent,name:'% Ataj.'}]} height={Math.max(160,active.length*36)}/>
            </Card>
          </div>
          {/* Table below */}
          <StatsTable rows={active}/>
        </>)
    }
  </div>)
}

// ─── ZONAS (HandballCourtZones component) ─────────────────────────────────────
const ZonasTab = ({stats}) => {
  const [eq,setEq] = useState('local')
  const events = stats.match?.eventos||[]
  const eqEvents = events.filter(e=>e.equipo===eq)
  // Convert to format HandballCourtZones expects: {zone, result, player, number}
  const zoneMap = {A:'left_wing',B:'left_back',C:'center',D:'center',E:'right_back',F:'right_wing',pivot:'pivot'}
  const allJugs = [...(stats.match?.jugadoresLocales||[]),...(stats.match?.jugadoresVisitantes||[])]
  const shots = eqEvents
    .filter(e=>['gol','tiro_errado','atajada'].includes(e.tipoEvento) && e.zonaAtaque)
    .map(e=>{
      const jug = allJugs.find(j=>j.id===e.jugadorId)
      return {
        zone:   zoneMap[e.zonaAtaque] || 'center',
        result: e.tipoEvento==='gol' ? 'goal' : e.resultado==='atajada'||e.tipoEvento==='atajada' ? 'saved' : 'miss',
        player: jug?.nombre || 'Sin asignar',
        number: jug?.numero ? Number(jug.numero) : null,
      }
    })

  return(<div>
    <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8,marginBottom:16}}>
      {['local','visitante'].map(e=>(
        <button key={e} onClick={()=>setEq(e)} style={{background:eq===e?(e==='local'?T.accent:T.cyan):T.card2,color:eq===e?T.bg:T.muted,border:'none',borderRadius:10,padding:'11px',fontWeight:'bold',cursor:'pointer',fontSize:13}}>
          {e==='local'?'🏠 Local':'✈️ Visitante'}
        </button>
      ))}
    </div>
    {shots.length===0
      ? <EmptyState icon="🏟️" title="Sin tiros con zona registrada" sub="Registrá tiros seleccionando la zona de lanzamiento"/>
      : <HandballCourtZones shots={shots}/>
    }
  </div>)
}

// ─── MVP ──────────────────────────────────────────────────────────────────────
const MVPTab = ({stats}) => {
  const [equipo,setEquipo] = useState('local')
  const ranking = equipo==='local' ? stats.mvpLocal : stats.mvpVisitante
  const maxScore = Math.max(1,...(ranking||[]).map(r=>r.mvpScore||r.score||0))
  const MEDAL = ['🥇','🥈','🥉']
  return(<div>
    <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8,marginBottom:20}}>
      {['local','visitante'].map(eq=>(
        <button key={eq} onClick={()=>setEquipo(eq)} style={{background:equipo===eq?(eq==='local'?T.accent:T.cyan):T.card2,color:equipo===eq?T.bg:T.muted,border:'none',borderRadius:10,padding:'11px',fontSize:13,fontWeight:'bold',cursor:'pointer'}}>
          {eq==='local'?'🏠 Local':'✈️ Visitante'}
        </button>
      ))}
    </div>
    {(!ranking||ranking.length===0)
      ? <div style={{textAlign:'center',color:T.muted,padding:32}}>Sin jugadores</div>
      : <>
          {ranking.length>=3&&(
            <Section title="Podio">
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:8,marginBottom:16}}>
                {[ranking[1],ranking[0],ranking[2]].filter(Boolean).map((p,i)=>{
                  const pos=i===0?1:i===1?0:2; const isFirst=pos===0
                  return(<Card key={p.jugador.id} style={{textAlign:'center',padding:'14px 8px',border:`1.5px solid ${isFirst?T.warn:T.border}`,background:isFirst?`${T.warn}10`:T.card}}>
                    <div style={{fontSize:isFirst?28:22,marginBottom:4}}>{MEDAL[pos]}</div>
                    <div style={{fontSize:12,fontWeight:'bold',color:T.text}}>{p.jugador.nombre.split(' ')[0]}</div>
                    <div style={{fontSize:18,fontWeight:'bold',color:isFirst?T.warn:T.accent,marginTop:4}}>{p.mvpScore||p.score||0}</div>
                    <div style={{fontSize:9,color:T.muted}}>pts</div>
                  </Card>)
                })}
              </div>
            </Section>
          )}
          <Section title="Ranking completo">
            {ranking.map((p,i)=>{
              const score = p.mvpScore||p.score||0
              return(<Card key={p.jugador.id} style={{marginBottom:8}}>
                <div style={{display:'flex',alignItems:'center',gap:10}}>
                  <div style={{fontSize:16,minWidth:28,textAlign:'center'}}>{MEDAL[i]||`#${i+1}`}</div>
                  <div style={{flex:1}}>
                    <div style={{fontSize:14,fontWeight:'bold',color:T.text}}>{p.jugador.nombre}</div>
                    <div style={{fontSize:11,color:T.muted}}>{p.goles} goles · {p.tiros} tiros · {p.exclusiones} excl.</div>
                    <div style={{marginTop:6}}>
                      <div style={{display:'flex',justifyContent:'space-between',fontSize:10,color:T.muted,marginBottom:3}}><span>Score</span><span style={{color:T.warn}}>{score} pts</span></div>
                      <PctBar value={(score/maxScore)*100} color={T.warn}/>
                    </div>
                  </div>
                </div>
                {generatePlayerAnalysis(p).length>0&&(
                  <div style={{marginTop:10,paddingTop:10,borderTop:`1px solid ${T.border}`,display:'flex',flexDirection:'column',gap:3}}>
                    {generatePlayerAnalysis(p).map((ins,j)=><div key={j} style={{fontSize:11,color:T.text}}>{ins}</div>)}
                  </div>
                )}
              </Card>)
            })}
          </Section>
        </>
    }
  </div>)
}
