import { useMemo } from 'react'
import { useMatch } from '../context/MatchContext.jsx'
import { Card, Section, StatBox, StatsTable, EmptyState, PctBar, T } from '../components/ui/index.jsx'
import { VBarChart, TimelineChart } from '../components/charts/StatsCharts.jsx'
import { computeMatchStats } from '../services/statsEngine.js'

export const SeasonPage = () => {
  const { matches } = useMatch()

  const data = useMemo(() => {
    if (!matches.length) return null
    const ms = matches.filter(m => m.eventos?.length > 0)
    if (!ms.length) return null

    let totalGolesL=0,totalGolesV=0,totalTirosL=0,totalTirosV=0
    const playerTotals = {}
    const arqueroTotals = {}
    const resultados = {G:0,E:0,P:0}
    const porFecha = []

    ms.forEach(m => {
      const st = computeMatchStats(m)
      if (!st) return
      const gl = st.teamLocal.goles, gv = st.teamVisitante.goles
      totalGolesL += gl; totalGolesV += gv
      totalTirosL += st.teamLocal.tiros; totalTirosV += st.teamVisitante.tiros
      if (gl>gv) resultados.G++ ; else if (gl===gv) resultados.E++ ; else resultados.P++
      porFecha.push({fecha:m.fecha||m.id.slice(0,8), golesL:gl, golesV:gv, rival:m.rival})
      // Accumulate player stats
      st.playersLocal.forEach(p => {
        const id=p.jugador.id, n=p.jugador.nombre
        if (!playerTotals[id]) playerTotals[id]={id,nombre:n,goles:0,tiros:0,partidos:0}
        playerTotals[id].goles  += p.goles
        playerTotals[id].tiros  += p.tiros
        playerTotals[id].partidos++
      })
      // Accumulate goalkeeper stats
      st.arqueroStats.forEach(a => {
        const id=a.arquero.id, n=a.arquero.nombre
        if (!arqueroTotals[id]) arqueroTotals[id]={id,nombre:n,atajadas:0,recibidos:0,partidos:0}
        arqueroTotals[id].atajadas  += a.atajadas
        arqueroTotals[id].recibidos += a.recibidos
        arqueroTotals[id].partidos++
      })
    })

    const topPlayers = Object.values(playerTotals).sort((a,b)=>b.goles-a.goles)
    const topArqueros = Object.values(arqueroTotals).sort((a,b)=>{
      const efA = a.recibidos>0?Math.round(a.atajadas/a.recibidos*100):0
      const efB = b.recibidos>0?Math.round(b.atajadas/b.recibidos*100):0
      return efB-efA
    })
    const n = ms.length
    return {
      partidos:n, ganados:resultados.G, empatados:resultados.E, perdidos:resultados.P,
      promedioGolesL:Math.round(totalGolesL/n*10)/10, promedioGolesV:Math.round(totalGolesV/n*10)/10,
      eficaciaL: totalTirosL>0?Math.round(totalGolesL/totalTirosL*100):0,
      eficaciaV: totalTirosV>0?Math.round(totalGolesV/totalTirosV*100):0,
      topPlayers, topArqueros, porFecha,
      totalGolesL, totalGolesV,
    }
  }, [matches])

  if (!data) return <EmptyState icon="📅" title="Sin datos de temporada" sub="Cargá partidos con eventos para ver estadísticas acumuladas"/>

  const { partidos, ganados, empatados, perdidos, promedioGolesL, promedioGolesV, eficaciaL, topPlayers, topArqueros, porFecha, totalGolesL, totalGolesV } = data

  const pct = v => partidos > 0 ? Math.round(v/partidos*100) : 0

  return (
    <div>
      <Section title="Resumen de Temporada">
        <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:8,marginBottom:8}}>
          <StatBox label="Partidos" value={partidos} color={T.accent} small/>
          <StatBox label="Ganados"  value={ganados}  color={T.accent} small/>
          <StatBox label="Empatados" value={empatados} color={T.warn} small/>
          <StatBox label="Perdidos" value={perdidos}  color={T.red}  small/>
        </div>
        <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:8}}>
          <StatBox label="Goles/PJ" value={promedioGolesL} color={T.cyan} small/>
          <StatBox label="% Efectiv." value={`${eficaciaL}%`} color={T.accent} small/>
          <StatBox label="Total Goles" value={totalGolesL} color={T.red} small/>
        </div>
      </Section>

      {/* Win rate bar */}
      <Section title="Rendimiento">
        <Card>
          <div style={{display:'flex',height:32,borderRadius:8,overflow:'hidden',gap:2}}>
            {[{v:pct(ganados),c:T.accent,l:'V'},{v:pct(empatados),c:T.warn,l:'E'},{v:pct(perdidos),c:T.red,l:'D'}].filter(x=>x.v>0).map((x,i)=>(
              <div key={i} style={{flex:x.v,background:x.c,display:'flex',alignItems:'center',justifyContent:'center',fontSize:11,fontWeight:'bold',color:T.bg}}>{x.l} {x.v}%</div>
            ))}
          </div>
        </Card>
      </Section>

      {/* Timeline */}
      {porFecha.length>1&&(
        <Section title="Goles por partido">
          <VBarChart data={porFecha.map(p=>({name:p.rival.slice(0,6),Local:p.golesL,Rival:p.golesV}))}
            dataKeys={[{key:'Local',color:T.accent},{key:'Rival',color:T.cyan}]} height={200}/>
        </Section>
      )}

      {/* Top scorers */}
      {topPlayers.length>0&&(
        <Section title="Goleadores de Temporada">
          {topPlayers.slice(0,10).map((p,i)=>{
            const max = topPlayers[0].goles||1
            return(
              <Card key={p.id} style={{marginBottom:8,padding:'12px 14px'}}>
                <div style={{display:'flex',alignItems:'center',justifyContent:'space-between'}}>
                  <div style={{display:'flex',alignItems:'center',gap:10}}>
                    <span style={{fontSize:16,minWidth:28,textAlign:'center'}}>{['🥇','🥈','🥉'][i]||`#${i+1}`}</span>
                    <div>
                      <div style={{fontSize:14,fontWeight:'bold',color:T.text}}>{p.nombre}</div>
                      <div style={{fontSize:11,color:T.muted}}>{p.partidos} partido{p.partidos>1?'s':''} · {p.tiros} tiros</div>
                    </div>
                  </div>
                  <div style={{textAlign:'right'}}>
                    <div style={{fontSize:20,fontWeight:'bold',color:T.accent,fontFamily:'monospace'}}>{p.goles}</div>
                    <div style={{fontSize:9,color:T.muted}}>GOLES</div>
                  </div>
                </div>
                <PctBar value={(p.goles/max)*100} color={T.accent}/>
              </Card>
            )
          })}
        </Section>
      )}

      {/* Top arqueros */}
      {topArqueros.length>0&&(
        <Section title="Arqueros de Temporada">
          {topArqueros.map(a=>{
            const ef = a.recibidos>0?Math.round(a.atajadas/a.recibidos*100):0
            return(
              <Card key={a.id} style={{marginBottom:8,padding:'12px 14px'}}>
                <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:8}}>
                  <div>
                    <div style={{fontSize:14,fontWeight:'bold',color:T.text}}>🧤 {a.nombre}</div>
                    <div style={{fontSize:11,color:T.muted}}>{a.partidos} part. · {a.recibidos} disparos · {a.atajadas} atajadas</div>
                  </div>
                  <div style={{textAlign:'right'}}>
                    <div style={{fontSize:20,fontWeight:'bold',color:ef>=55?T.accent:ef>=40?T.warn:T.red}}>{ef}%</div>
                    <div style={{fontSize:9,color:T.muted}}>ATAJADAS</div>
                  </div>
                </div>
                <PctBar value={ef} color={ef>=55?T.accent:ef>=40?T.warn:T.red}/>
              </Card>
            )
          })}
        </Section>
      )}
    </div>
  )
}
