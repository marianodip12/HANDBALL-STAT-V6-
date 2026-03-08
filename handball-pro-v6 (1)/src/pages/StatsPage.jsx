import { useState } from 'react'
import { useMatch } from '../context/MatchContext.jsx'
import { Card, Section, StatBox, StatsTable, EmptyState, PctBar, Btn, T } from '../components/ui/index.jsx'
import { VBarChart, TimelineChart, RadarCompare } from '../components/charts/StatsCharts.jsx'
import { GoalMap } from '../components/court/HandballCourt.jsx'
import { LABELS, ZONAS_ATAQUE, DISTANCIAS, SITUACIONES, TIPOS_ATAQUE, TIPOS_LANZAMIENTO } from '../data/eventSchema.js'
const SITUACIONES_NUMERICAS = SITUACIONES
import { generatePlayerAnalysis } from '../services/mvpEngine.js'

const SUBTABS = [
  {id:'equipo',label:'Equipo',icon:'📊'},
  {id:'jugadores',label:'Jugadores',icon:'👥'},
  {id:'porteros',label:"Arqueros",icon:'🧤'},
  {id:'avanzado',label:'Avanzado',icon:'📈'},
  {id:'mvp',label:'MVP',icon:'🥇'},
]

export const StatsPage = () => {
  const {activeMatch,activeStats} = useMatch()
  const [subtab,setSubtab] = useState('equipo')
  if(!activeMatch||!activeStats) return <EmptyState icon="📊" title="Sin partido activo" sub="Activá un partido para ver estadísticas"/>
  return(
    <div>
      <div style={{overflowX:'auto',WebkitOverflowScrolling:'touch',marginBottom:20}}>
        <div style={{display:'flex',gap:6,minWidth:'max-content',paddingBottom:6}}>
          {SUBTABS.map(t=>(
            <button key={t.id} onClick={()=>setSubtab(t.id)} style={{
              background:subtab===t.id?T.accent:T.card2,color:subtab===t.id?T.bg:T.muted,
              border:'none',borderRadius:20,padding:'9px 16px',fontSize:12,
              fontWeight:subtab===t.id?'bold':'normal',cursor:'pointer',whiteSpace:'nowrap',
            }}>{t.icon} {t.label}</button>
          ))}
        </div>
      </div>
      {subtab==='equipo'    && <EquipoTab    stats={activeStats}/>}
      {subtab==='jugadores' && <JugadoresTab stats={activeStats}/>}
      {subtab==='porteros'  && <PorterosTab  stats={activeStats}/>}
      {subtab==='avanzado'  && <AvanzadoTab  stats={activeStats}/>}
      {subtab==='mvp'       && <MVPTab       stats={activeStats}/>}
    </div>
  )
}

const TeamPanel=({team:t,label,color})=>(
  <Section title={label}>
    <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:8,marginBottom:12}}>
      <StatBox label="Goles"   value={t.goles}        color={T.red}   small/>
      <StatBox label="Lanz."   value={t.tiros} color={color}   small/>
      <StatBox label="% Gol"   value={`${t.eficacia}%`} color={t.eficacia>=50?T.accent:T.warn} small/>
      <StatBox label="Excl."   value={t.exclusiones}  color={T.red}   small/>
    </div>
    <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:8,marginBottom:16}}>
      <StatBox label="Pérd."   value={t.perdidas}     color={T.warn}  small/>
      <StatBox label="Pasos"   value={t.pasos}        color={T.warn}  small/>
      <StatBox label="% Para." value={`${t.efectividad}%`} color={T.accent} small/>
      <StatBox label="Cta.Gol" value={t.contraataque.goles} color={T.cyan} small/>
    </div>
    <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:8,marginBottom:16}}>
      {[{l:'Contraataque',d:t.contraataque,c:T.cyan},{l:'Posicional',d:t.posicional,c:T.accent},{l:'Campo',d:t.campoContrario,c:T.warn}].map(({l,d,c})=>(
        <Card key={l} style={{textAlign:'center',padding:'12px 6px'}}>
          <div style={{fontSize:18,fontWeight:'bold',color:c}}>{d.goles}</div>
          <div style={{fontSize:9,color:T.muted,marginTop:2}}>{l}</div>
          <div style={{fontSize:10,color:T.text}}>{d.eficacia}%</div>
        </Card>
      ))}
    </div>
    {t.timeline.length>0&&(
      <><div style={{fontSize:11,color:T.muted,letterSpacing:1,marginBottom:8,textTransform:'uppercase'}}>Línea de tiempo</div>
      <TimelineChart data={t.timeline} dataKeys={[{key:'goles',name:'Goles',color:T.red},{key:'lanzamientos',name:'Lanz.',color,dashed:true}]} height={180}/></>
    )}
    <div style={{marginTop:16}}>
      <div style={{fontSize:11,color:T.muted,letterSpacing:1,marginBottom:8,textTransform:'uppercase'}}>Por zona</div>
      <StatsTable rows={t.porZona.map(z=>({...z,label:LABELS.zonaAtaqueFull[z.label]||z.label}))}/>
    </div>
    <div style={{marginTop:12}}>
      <div style={{fontSize:11,color:T.muted,letterSpacing:1,marginBottom:8,textTransform:'uppercase'}}>Por distancia</div>
      <StatsTable rows={t.porDistancia.map(r=>({...r,label:LABELS.distanciaFull?.[r.label]||r.label}))}/>
    </div>
  </Section>
)

const EquipoTab=({stats})=>{
  const {teamLocal:L,teamVisitante:V}=stats
  return(<div>
    <TeamPanel team={L} label="Local" color={T.accent}/>
    <TeamPanel team={V} label="Visitante" color={T.cyan}/>
    <Section title="Comparativa">
      <VBarChart data={[
        {name:'Goles',Local:L.goles,Visitante:V.goles},
        {name:'Lanz.',Local:L.tiros,Visitante:V.tiros},
        {name:'% Gol',Local:L.eficacia,Visitante:V.eficacia},
        {name:'Excl.',Local:L.exclusiones,Visitante:V.exclusiones},
        {name:'Pérd.',Local:L.perdidas,Visitante:V.perdidas},
        {name:'Cta.',Local:L.contraataque.goles,Visitante:V.contraataque.goles},
      ]} dataKeys={[{key:'Local',color:T.accent},{key:'Visitante',color:T.cyan}]} height={220}/>
    </Section>
  </div>)
}

const JugadoresTab=({stats})=>{
  const [equipo,setEquipo]=useState('local')
  const [selected,setSelected]=useState(null)
  const [ptab,setPtab]=useState('zona')
  const players=equipo==='local'?stats.playersLocal:stats.playersVisitante
  const color=equipo==='local'?T.accent:T.cyan
  const MEDAL=['🥇','🥈','🥉']
  return(<div>
    <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8,marginBottom:16}}>
      {['local','visitante'].map(eq=>(
        <button key={eq} onClick={()=>{setEquipo(eq);setSelected(null)}} style={{
          background:equipo===eq?(eq==='local'?T.accent:T.cyan):T.card2,color:equipo===eq?T.bg:T.muted,
          border:'none',borderRadius:10,padding:'11px',fontSize:13,fontWeight:'bold',cursor:'pointer',
        }}>{eq==='local'?'🏠 Local':'✈️ Visitante'}</button>
      ))}
    </div>
    {players.length===0?<div style={{textAlign:'center',color:T.muted,padding:32,fontSize:12}}>Sin jugadores</div>
    :players.map((p,i)=>{
      const isOpen=selected===p.jugador.id
      return(<Card key={p.jugador.id} style={{marginBottom:10,cursor:'pointer',border:`1.5px solid ${isOpen?color:T.border}`}} onClick={()=>setSelected(isOpen?null:p.jugador.id)}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
          <div style={{display:'flex',alignItems:'center',gap:10}}>
            <div style={{fontSize:18,fontWeight:'bold',color:i<3?T.warn:T.muted,minWidth:28}}>{MEDAL[i]||`#${i+1}`}</div>
            <div>
              <div style={{fontSize:14,fontWeight:'bold',color:T.text}}>{p.jugador.numero?`#${p.jugador.numero} `:''}{ p.jugador.nombre}</div>
              <div style={{fontSize:11,color:T.muted}}>{p.tiros} lanz · {p.goles} goles · {p.eficacia}%</div>
            </div>
          </div>
          <div style={{textAlign:'right'}}><div style={{fontSize:16,fontWeight:'bold',color}}>{p.goles}</div><div style={{fontSize:9,color:T.muted}}>GOL</div></div>
        </div>
        {isOpen&&(<div style={{marginTop:14,paddingTop:14,borderTop:`1px solid ${T.border}`}}>
          <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:6,marginBottom:12}}>
            <StatBox label="Goles"  value={p.goles}          color={T.red}    small/>
            <StatBox label="Lanz."  value={p.tiros}   color={color}    small/>
            <StatBox label="% Gol"  value={`${p.eficacia}%`} color={T.accent} small/>
            <StatBox label="Excl."  value={p.exclusiones}    color={T.red}    small/>
          </div>
          <div style={{display:'flex',gap:6,marginBottom:10,overflowX:'auto'}}>
            {['zona','cuadrante','técnica','situación','distancia'].map(t=>(
              <button key={t} onClick={e=>{e.stopPropagation();setPtab(t)}} style={{background:ptab===t?color:T.card2,color:ptab===t?T.bg:T.muted,border:'none',borderRadius:16,padding:'6px 12px',fontSize:11,cursor:'pointer',whiteSpace:'nowrap'}}>{t}</button>
            ))}
          </div>
          {ptab==='zona'      &&<StatsTable rows={p.porZona.map(z=>({...z,label:LABELS.zonaAtaqueFull[z.zona]||z.zona}))}/>}
          {ptab==='cuadrante' &&<StatsTable rows={p.porCuadrante.map(q=>({...q,label:LABELS.cuadranteFull[q.cuadrante]||q.cuadrante}))}/>}
          {ptab==='técnica'   &&<StatsTable rows={p.porTipoLanzamiento.map(r=>({...r,label:LABELS.tipoLanzamiento[r.tipo]||r.tipo}))}/>}
          {ptab==='situación' &&<StatsTable rows={p.porSituacion.map(r=>({...r,label:LABELS.situacion[r.situacion]||r.situacion}))}/>}
          {ptab==='distancia' &&<StatsTable rows={p.porDistancia.map(r=>({...r,label:LABELS.distanciaFull?.[r.distancia]||r.distancia}))}/>}
          {generatePlayerAnalysis(p).length>0&&(
            <div style={{marginTop:10,background:T.card2,borderRadius:10,padding:12}}>
              <div style={{fontSize:11,color:T.accent,marginBottom:6,letterSpacing:1}}>💡 ANÁLISIS IA</div>
              {generatePlayerAnalysis(p).map((ins,j)=><div key={j} style={{fontSize:12,color:T.text,marginBottom:3}}>{ins}</div>)}
            </div>
          )}
        </div>)}
      </Card>)
    })}
  </div>)
}

const PorterosTab=({stats})=>{
  const [selected,setSelected]=useState(null)
  const [ptab,setPtab]=useState('cuadrante')
  const {arqueroStats}=stats
  if(!arqueroStats.length) return <EmptyState icon="🧤" title="Sin datos de porteros" sub="Asociá porteros al registrar lanzamientos"/>
  const radarData=Object.values(ZONAS_ATAQUE).map(z=>{
    const row={zona:LABELS.zonaAtaque[z]}
    arqueroStats.forEach(gk=>{const zd=gk.porZona.find(r=>r.zona===z);row[gk.arquero.nombre]=zd?.efectividad||0})
    return row
  })
  return(<div>
    {arqueroStats.length>=2&&(
      <Section title="Comparativa"><RadarCompare data={radarData} subjects={arqueroStats.map(gk=>({key:gk.arquero.nombre,name:gk.arquero.nombre}))} height={240}/></Section>
    )}
    {arqueroStats.map(gk=>(
      <Card key={gk.arquero.id} style={{marginBottom:12,cursor:'pointer',border:`1.5px solid ${selected===gk.arquero.id?T.orange:T.border}`}} onClick={()=>setSelected(selected===gk.arquero.id?null:gk.arquero.id)}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:10}}>
          <div>
            <div style={{fontSize:15,fontWeight:'bold',color:T.text}}>🧤 {gk.arquero.nombre}</div>
            <div style={{fontSize:11,color:T.muted,marginTop:2}}>{gk.recibidos} disp · {gk.atajadas} paradas · {gk.goles} goles</div>
          </div>
          <div style={{textAlign:'right'}}>
            <div style={{fontSize:24,fontWeight:'bold',color:gk.efectividad>=60?T.accent:gk.efectividad>=45?T.warn:T.red}}>{gk.efectividad}%</div>
            <div style={{fontSize:9,color:T.muted}}>{gk.ratingLabel||''}</div>
          </div>
        </div>
        <PctBar value={gk.efectividad} color={gk.efectividad>=60?T.accent:gk.efectividad>=45?T.warn:T.red} height={6}/>
        {selected===gk.arquero.id&&(<div style={{marginTop:14,paddingTop:14,borderTop:`1px solid ${T.border}`}}>
          <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:6,marginBottom:14}}>
            <StatBox label="Paradas"  value={gk.atajadas}     color={T.accent} small/>
            <StatBox label="Goles"    value={gk.goles}       color={T.red}    small/>
            <StatBox label="Postes"   value={gk.postes||0}   color={T.warn}   small/>
            <StatBox label="Valor."   value={gk.valoracion||0} color={gk.efectividad>=60?T.accent:T.warn} small/>
          </div>
          <GoalMap porCuadrante={gk.porCuadrante} title="Mapa de portería"/>
          <div style={{display:'flex',gap:6,marginTop:14,marginBottom:10,overflowX:'auto'}}>
            {['cuadrante','distancia','zona','técnica','situación'].map(t=>(
              <button key={t} onClick={e=>{e.stopPropagation();setPtab(t)}} style={{background:ptab===t?T.orange:T.card2,color:ptab===t?T.bg:T.muted,border:'none',borderRadius:16,padding:'6px 12px',fontSize:11,cursor:'pointer',whiteSpace:'nowrap'}}>{t}</button>
            ))}
          </div>
          {ptab==='cuadrante'&&<StatsTable rows={gk.porCuadrante.map(r=>({...r,label:LABELS.cuadranteFull[r.cuadrante]||r.cuadrante}))}/>}
          {ptab==='distancia'&&<StatsTable rows={gk.porDistancia.map(r=>({...r,label:LABELS.distanciaFull?.[r.distancia]||r.distancia}))}/>}
          {ptab==='zona'     &&<StatsTable rows={gk.porZona.map(r=>({...r,label:LABELS.zonaAtaqueFull[r.zona]||r.zona}))}/>}
          {ptab==='técnica'  &&<StatsTable rows={gk.porTipoLanzamiento.map(r=>({...r,label:LABELS.tipoLanzamiento[r.tipo]||r.tipo}))}/>}
          {ptab==='situación'&&<StatsTable rows={gk.porSituacion.map(r=>({...r,label:LABELS.situacion[r.situacion]||r.situacion}))}/>}
        </div>)}
      </Card>
    ))}
  </div>)
}

const AvanzadoTab=({stats})=>{
  const {teamLocal:L,teamVisitante:V}=stats
  const [dim,setDim]=useState('zona')
  const DIMS=[{id:'zona',label:'Zona'},{id:'distancia',label:'Distancia'},{id:'situacion',label:'Numérica'},{id:'ataque',label:'T.Ataque'}]
  const mkRow=d=>({lanzamientos:d.total,goles:d.goles,paradas:0,postes:0,fuera:0,alArco:d.goles,eficacia:d.eficacia,efectividad:0})
  const rows=t=>{
    if(dim==='zona')      return t.porZona.map(r=>({...r,label:LABELS.zonaAtaqueFull[r.label]||r.label}))
    if(dim==='distancia') return t.porDistancia.map(r=>({...r,label:LABELS.distanciaFull?.[r.label]||r.label}))
    if(dim==='situacion') return t.porSituacion.map(r=>({...r,label:LABELS.situacion[r.label]||r.label}))
    return [{label:'Contraataque',...mkRow(t.contraataque)},{label:'Posicional',...mkRow(t.posicional)},{label:'Campo Cont.',...mkRow(t.campoContrario)}]
  }
  const chartData=rows(L).map((r,i)=>({name:r.label,'Goles L':r.goles,'Goles V':rows(V)[i]?.goles||0,'% L':r.eficacia,'% V':rows(V)[i]?.eficacia||0}))
  return(<div>
    <div style={{display:'flex',gap:6,marginBottom:16,overflowX:'auto'}}>
      {DIMS.map(d=>(
        <button key={d.id} onClick={()=>setDim(d.id)} style={{background:dim===d.id?T.accent:T.card2,color:dim===d.id?T.bg:T.muted,border:'none',borderRadius:16,padding:'8px 14px',fontSize:12,fontWeight:dim===d.id?'bold':'normal',cursor:'pointer',whiteSpace:'nowrap'}}>{d.label}</button>
      ))}
    </div>
    <Section title={`Local — ${DIMS.find(d=>d.id===dim)?.label}`}><StatsTable rows={rows(L)}/></Section>
    <Section title={`Visitante — ${DIMS.find(d=>d.id===dim)?.label}`}><StatsTable rows={rows(V)}/></Section>
    <Section title="Comparativa goles">
      <VBarChart data={chartData} dataKeys={[{key:'Goles L',color:T.accent},{key:'Goles V',color:T.cyan}]} height={200}/>
    </Section>
    <Section title="Comparativa % gol">
      <VBarChart data={chartData} dataKeys={[{key:'% L',color:T.accent},{key:'% V',color:T.cyan}]} height={200}/>
    </Section>
  </div>)
}

const MVPTab=({stats})=>{
  const [equipo,setEquipo]=useState('local')
  const ranking=equipo==='local'?stats.mvpLocal:stats.mvpVisitante
  const maxScore=Math.max(1,...ranking.map(r=>r.mvpScore))
  const MEDAL=['🥇','🥈','🥉']
  return(<div>
    <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8,marginBottom:20}}>
      {['local','visitante'].map(eq=>(
        <button key={eq} onClick={()=>setEquipo(eq)} style={{background:equipo===eq?(eq==='local'?T.accent:T.cyan):T.card2,color:equipo===eq?T.bg:T.muted,border:'none',borderRadius:10,padding:'11px',fontSize:13,fontWeight:'bold',cursor:'pointer'}}>{eq==='local'?'🏠 Local':'✈️ Visitante'}</button>
      ))}
    </div>
    {ranking.length===0?<div style={{textAlign:'center',color:T.muted,padding:32}}>Sin jugadores</div>:<>
      {ranking.length>=3&&(
        <Section title="Podio">
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:8,marginBottom:16}}>
            {[ranking[1],ranking[0],ranking[2]].filter(Boolean).map((p,i)=>{
              const pos=i===0?1:i===1?0:2;const isFirst=pos===0
              return(<Card key={p.jugador.id} style={{textAlign:'center',padding:'14px 8px',border:`1.5px solid ${isFirst?T.warn:T.border}`,background:isFirst?`${T.warn}10`:T.card}}>
                <div style={{fontSize:isFirst?28:22,marginBottom:4}}>{MEDAL[pos]}</div>
                <div style={{fontSize:12,fontWeight:'bold',color:T.text}}>{p.jugador.nombre.split(' ')[0]}</div>
                <div style={{fontSize:18,fontWeight:'bold',color:isFirst?T.warn:T.accent,marginTop:4}}>{p.mvpScore}</div>
                <div style={{fontSize:9,color:T.muted}}>pts</div>
              </Card>)
            })}
          </div>
        </Section>
      )}
      {ranking.length>0&&(
        <Section title="Gráfico MVP">
          <VBarChart data={ranking.slice(0,8).map(r=>({name:r.jugador.nombre.split(' ')[0],Score:r.mvpScore,Goles:r.goles}))} dataKeys={[{key:'Score',color:T.warn,cells:true},{key:'Goles',color:T.red}]} height={200}/>
        </Section>
      )}
      <Section title="Ranking completo">
        {ranking.map((p,i)=>(
          <Card key={p.jugador.id} style={{marginBottom:8}}>
            <div style={{display:'flex',alignItems:'center',gap:10}}>
              <div style={{fontSize:16,minWidth:28,textAlign:'center'}}>{MEDAL[i]||`#${i+1}`}</div>
              <div style={{flex:1}}>
                <div style={{fontSize:14,fontWeight:'bold',color:T.text}}>{p.jugador.nombre}</div>
                <div style={{fontSize:11,color:T.muted}}>{p.goles} goles · {p.tiros} lanz. · {p.exclusiones} excl.</div>
                <div style={{marginTop:6}}>
                  <div style={{display:'flex',justifyContent:'space-between',fontSize:10,color:T.muted,marginBottom:3}}><span>Score</span><span style={{color:T.warn}}>{p.mvpScore} pts</span></div>
                  <PctBar value={(p.mvpScore/maxScore)*100} color={T.warn}/>
                </div>
              </div>
            </div>
            {generatePlayerAnalysis(p).length>0&&(
              <div style={{marginTop:10,paddingTop:10,borderTop:`1px solid ${T.border}`,display:'flex',flexDirection:'column',gap:3}}>
                {generatePlayerAnalysis(p).map((ins,j)=><div key={j} style={{fontSize:11,color:T.text}}>{ins}</div>)}
              </div>
            )}
          </Card>
        ))}
      </Section>
    </>}
  </div>)
}
