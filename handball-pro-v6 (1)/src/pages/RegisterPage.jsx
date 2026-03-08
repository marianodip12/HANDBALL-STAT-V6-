import { useState, useCallback } from 'react'
import { useMatch } from '../context/MatchContext.jsx'
import { Card, Section, Btn, BigBtn, FormInput, Modal, EmptyState, T, Badge } from '../components/ui/index.jsx'
import { HandballCourt, GoalMap, getZoneFromPos, getDistanciaFromPos } from '../components/court/HandballCourt.jsx'
import { POSICIONES, LABELS, TIPOS_GOL, TIPOS_LANZAMIENTO, SITUACIONES, TIPOS_ATAQUE, CUADRANTES, emptyEvento } from '../data/eventSchema.js'

const STEPS = ['equipo','evento','jugador','cancha','contexto','arquero']

export const RegisterPage = () => {
  const { activeMatch, addEvento, deleteEvento, addJugador, removeJugador, addArquero, removeArquero, teams } = useMatch()
  const [step,        setStep]    = useState('main')     // main | event | roster
  const [equipo,      setEquipo]  = useState('local')    // which team we're registering for
  const [form,        setForm]    = useState(emptyEvento())
  const [saving,      setSaving]  = useState(false)
  const [lastShot,    setLastShot]= useState(null)
  // Roster modal
  const [showRoster,  setShowRoster] = useState(false)
  const [rosterEq,    setRosterEq]   = useState('local')
  const [rName,       setRName]      = useState('')
  const [rNum,        setRNum]       = useState('')
  const [rPos,        setRPos]       = useState('')
  const [rIsArq,      setRIsArq]     = useState(false)
  const [rSaving,     setRSaving]    = useState(false)
  // Import from team
  const [showImport,  setShowImport] = useState(false)
  const [importEq,    setImportEq]   = useState('local')

  if (!activeMatch) return <EmptyState icon="⚡" title="Sin partido activo" sub="Activá un partido en la pestaña Partidos"/>

  const myTeam  = teams.find(t => t.id === activeMatch.myTeamId)
  const jugL    = activeMatch.jugadoresLocales  || []
  const jugV    = activeMatch.jugadoresVisitantes || []
  const arqueros = (activeMatch.arqueros || [])
  const jugActivos = equipo === 'local' ? jugL : jugV
  const arquEq    = arqueros.filter(a => a.equipo !== equipo) // arquero del equipo que recibe el tiro

  // Scores
  const evL = (activeMatch.eventos||[]).filter(e=>e.equipo==='local'&&e.tipoEvento==='gol').length
  const evV = (activeMatch.eventos||[]).filter(e=>e.equipo==='visitante'&&e.tipoEvento==='gol').length

  // Court shot handler
  const handleShot = useCallback(({posX,posY,zonaCancha,distancia})=>{
    setForm(f=>({...f,posX,posY,zonaCancha,distancia}))
    setLastShot({posX,posY})
  },[])

  // Save event
  const saveEvento = async () => {
    if (saving) return
    setSaving(true)
    await addEvento(activeMatch.id, { ...form, equipo })
    setSaving(false)
    setForm(emptyEvento())
    setLastShot(null)
    setStep('main')
  }

  // Roster add
  const addRosterPlayer = async () => {
    if (!rName.trim()) return
    setRSaving(true)
    if (rIsArq) await addArquero(activeMatch.id, rName.trim(), rosterEq)
    else await addJugador(activeMatch.id, rosterEq, rName.trim(), rNum, rPos)
    setRName(''); setRNum(''); setRPos(''); setRIsArq(false)
    setRSaving(false)
  }

  // Import from saved team
  const importFromTeam = async (team, eqTarget) => {
    const existing = eqTarget==='local' ? jugL : jugV
    const existingNames = existing.map(j=>j.nombre.toLowerCase())
    const toImport = team.jugadores.filter(p=>!existingNames.includes(p.nombre.toLowerCase()))
    for (const p of toImport) {
      if (p.esArquero) await addArquero(activeMatch.id, p.nombre, eqTarget)
      else await addJugador(activeMatch.id, eqTarget, p.nombre, p.numero||'', p.posicion||'')
    }
    setShowImport(false)
  }

  const recentEvents = [...(activeMatch.eventos||[])].reverse().slice(0,8)
  const jugadorNombre = id => {
    const all = [...jugL,...jugV,...arqueros]
    const j = all.find(p=>p.id===id)
    return j ? (j.numero?`#${j.numero} ${j.nombre}`:j.nombre) : '—'
  }

  // ─── MAIN VIEW ────────────────────────────────────────────────────────────
  if (step === 'main') return (
    <div>
      {/* Scoreboard */}
      <Card style={{marginBottom:16,textAlign:'center',background:T.card2,border:`1px solid ${T.border}`}}>
        <div style={{display:'grid',gridTemplateColumns:'1fr auto 1fr',alignItems:'center',gap:8}}>
          <div style={{textAlign:'center'}}>
            <div style={{fontSize:11,color:T.accent,marginBottom:4,fontWeight:'bold'}}>LOCAL</div>
            <div style={{fontSize:42,fontWeight:'bold',color:T.accent,fontFamily:'monospace'}}>{evL}</div>
            <div style={{fontSize:10,color:T.muted,marginTop:2}}>{myTeam?.nombre||'Mi Equipo'}</div>
          </div>
          <div style={{fontSize:20,color:T.muted,fontWeight:'bold'}}>:</div>
          <div style={{textAlign:'center'}}>
            <div style={{fontSize:11,color:T.cyan,marginBottom:4,fontWeight:'bold'}}>VISITANTE</div>
            <div style={{fontSize:42,fontWeight:'bold',color:T.cyan,fontFamily:'monospace'}}>{evV}</div>
            <div style={{fontSize:10,color:T.muted,marginTop:2}}>vs {activeMatch.rival}</div>
          </div>
        </div>
        <div style={{marginTop:10,fontSize:11,color:T.muted}}>{(activeMatch.eventos||[]).length} eventos registrados</div>
      </Card>

      {/* Which team */}
      <Section title="¿Quién realiza la acción?">
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10,marginBottom:16}}>
          <BigBtn active={equipo==='local'} color={T.accent} onClick={()=>setEquipo('local')} style={{minHeight:64,fontSize:14}}>
            🏠 Local<br/><span style={{fontSize:11,opacity:0.8}}>{myTeam?.nombre||'Mi Equipo'}</span>
          </BigBtn>
          <BigBtn active={equipo==='visitante'} color={T.cyan} onClick={()=>setEquipo('visitante')} style={{minHeight:64,fontSize:14}}>
            ✈️ Rival<br/><span style={{fontSize:11,opacity:0.8}}>{activeMatch.rival}</span>
          </BigBtn>
        </div>
      </Section>

      {/* Register buttons */}
      <Section title="Registrar evento">
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10,marginBottom:10}}>
          <BigBtn color={T.accent} onClick={()=>{ setForm({...emptyEvento(),equipo,tipoEvento:'gol'}); setStep('event') }} style={{minHeight:72,fontSize:16}}>
            ⚽<br/>GOL
          </BigBtn>
          <BigBtn color={T.red} onClick={()=>{ setForm({...emptyEvento(),equipo,tipoEvento:'tiro_errado'}); setStep('event') }} style={{minHeight:72,fontSize:16}}>
            ❌<br/>TIRO ERRADO
          </BigBtn>
        </div>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:8,marginBottom:10}}>
          <BigBtn color={T.cyan} onClick={()=>{ setForm({...emptyEvento(),equipo,tipoEvento:'atajada'}); setStep('event') }} style={{minHeight:60,fontSize:13}}>
            🧤<br/>Atajada
          </BigBtn>
          <BigBtn color={T.warn} onClick={()=>{ setForm({...emptyEvento(),equipo,tipoEvento:'perdida'}); saveQuick('perdida') }} style={{minHeight:60,fontSize:13}}>
            💨<br/>Pérdida
          </BigBtn>
          <BigBtn color={T.purple} onClick={()=>{ saveQuick('exclusion') }} style={{minHeight:60,fontSize:13}}>
            🚫<br/>Exclusión
          </BigBtn>
        </div>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8}}>
          <BigBtn color={T.orange} onClick={()=>saveQuick('recuperacion')} style={{minHeight:52,fontSize:12}}>
            🔄 Recuperación
          </BigBtn>
          <BigBtn color={T.muted} onClick={()=>saveQuick('timeout')} style={{minHeight:52,fontSize:12}}>
            ⏸ Time Out
          </BigBtn>
        </div>
      </Section>

      {/* Recent events */}
      {recentEvents.length>0&&(
        <Section title="Últimos eventos">
          <div style={{display:'flex',flexDirection:'column',gap:6}}>
            {recentEvents.map(e=>(
              <Card key={e.id} style={{padding:'10px 12px',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                <div style={{display:'flex',alignItems:'center',gap:8}}>
                  <span style={{fontSize:16}}>{eventIcon(e.tipoEvento)}</span>
                  <div>
                    <div style={{fontSize:12,color:T.text,fontWeight:'bold'}}>{LABELS.tipoEvento[e.tipoEvento]||e.tipoEvento} {e.tipoGol?'— '+LABELS.tipoGol[e.tipoGol]:''}</div>
                    <div style={{fontSize:10,color:T.muted}}>{e.equipo==='local'?'🏠 Local':'✈️ Rival'}{e.jugadorId?' · '+jugadorNombre(e.jugadorId):''}{e.minuto?' · min '+e.minuto:''}</div>
                  </div>
                </div>
                <button onClick={()=>{if(confirm('¿Eliminar?'))deleteEvento(activeMatch.id,e.id)}} style={{background:'none',border:'none',color:T.muted,cursor:'pointer',fontSize:16,padding:'4px 8px'}}>×</button>
              </Card>
            ))}
          </div>
        </Section>
      )}

      {/* Roster management */}
      <Section title="Plantel del partido" action={<Btn small onClick={()=>setShowRoster(true)}>Gestionar</Btn>}>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8}}>
          <Card style={{padding:12}}>
            <div style={{fontSize:11,color:T.accent,marginBottom:6,fontWeight:'bold'}}>🏠 LOCAL</div>
            <div style={{fontSize:13,color:T.muted,marginBottom:4}}>{jugL.length} jugadores · {arqueros.filter(a=>a.equipo==='local').length} arq.</div>
            {jugL.slice(0,3).map(j=><div key={j.id} style={{fontSize:11,color:T.text,marginBottom:2}}>{j.numero?`#${j.numero} `:''}{ j.nombre}</div>)}
            {jugL.length>3&&<div style={{fontSize:10,color:T.muted}}>+{jugL.length-3} más...</div>}
          </Card>
          <Card style={{padding:12}}>
            <div style={{fontSize:11,color:T.cyan,marginBottom:6,fontWeight:'bold'}}>✈️ RIVAL</div>
            <div style={{fontSize:13,color:T.muted,marginBottom:4}}>{jugV.length} jugadores · {arqueros.filter(a=>a.equipo==='visitante').length} arq.</div>
            {jugV.slice(0,3).map(j=><div key={j.id} style={{fontSize:11,color:T.text,marginBottom:2}}>{j.numero?`#${j.numero} `:''}{ j.nombre}</div>)}
            {jugV.length>3&&<div style={{fontSize:10,color:T.muted}}>+{jugV.length-3} más...</div>}
          </Card>
        </div>
      </Section>

      {/* Roster Modal */}
      {showRoster&&(
        <Modal title="Plantel del Partido" onClose={()=>setShowRoster(false)}>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8,marginBottom:16}}>
            {['local','visitante'].map(eq=>(
              <button key={eq} onClick={()=>setRosterEq(eq)} style={{background:rosterEq===eq?(eq==='local'?T.accent:T.cyan):T.card2,color:rosterEq===eq?T.bg:T.muted,border:'none',borderRadius:10,padding:'10px',fontWeight:'bold',cursor:'pointer',fontSize:13}}>{eq==='local'?'🏠 Local':'✈️ Rival'}</button>
            ))}
          </div>

          {/* Import from team */}
          {teams.length>0&&(
            <div style={{marginBottom:14}}>
              {teams.map(t=>(
                <Btn key={t.id} small variant="ghost" fullWidth style={{marginBottom:6}} onClick={()=>importFromTeam(t,rosterEq)}>
                  📋 Importar plantilla: {t.nombre}
                </Btn>
              ))}
            </div>
          )}

          {/* Current roster */}
          <div style={{maxHeight:200,overflowY:'auto',marginBottom:14}}>
            {(rosterEq==='local'?jugL:jugV).map(j=>(
              <div key={j.id} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'8px 0',borderBottom:`1px solid ${T.border}`}}>
                <span style={{fontSize:13,color:T.text}}>{j.numero?`#${j.numero} `:''}{ j.nombre}{j.posicion?` — ${LABELS.posicion[j.posicion]||j.posicion}`:''}</span>
                <button onClick={()=>removeJugador(activeMatch.id,rosterEq,j.id)} style={{background:'none',border:'none',color:T.red,cursor:'pointer',fontSize:16}}>×</button>
              </div>
            ))}
            {arqueros.filter(a=>a.equipo===rosterEq).map(a=>(
              <div key={a.id} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'8px 0',borderBottom:`1px solid ${T.border}`}}>
                <span style={{fontSize:13,color:T.cyan}}>🧤 {a.nombre}</span>
                <button onClick={()=>removeArquero(activeMatch.id,a.id)} style={{background:'none',border:'none',color:T.red,cursor:'pointer',fontSize:16}}>×</button>
              </div>
            ))}
          </div>

          {/* Add player */}
          <div style={{display:'grid',gridTemplateColumns:'1fr 60px',gap:8}}>
            <input value={rName} onChange={e=>setRName(e.target.value)} placeholder="Nombre del jugador" style={{background:T.card2,color:T.text,border:`1px solid ${T.border}`,borderRadius:10,padding:'12px',fontSize:14,fontFamily:'inherit'}}/>
            <input value={rNum} onChange={e=>setRNum(e.target.value)} placeholder="#" type="number" style={{background:T.card2,color:T.text,border:`1px solid ${T.border}`,borderRadius:10,padding:'12px',fontSize:14,fontFamily:'inherit',textAlign:'center'}}/>
          </div>
          <FormInput label="" value={rPos} onChange={v=>setRPos(v)} options={POSICIONES.map(p=>({value:p,label:p}))}/>
          <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:12}}>
            <input type="checkbox" id="isArq" checked={rIsArq} onChange={e=>setRIsArq(e.target.checked)} style={{width:20,height:20}}/>
            <label htmlFor="isArq" style={{fontSize:14,color:T.text,cursor:'pointer'}}>🧤 Es arquero</label>
          </div>
          <Btn fullWidth onClick={addRosterPlayer} disabled={rSaving||!rName.trim()}>
            {rSaving?'Guardando...':'+ Agregar al plantel'}
          </Btn>
        </Modal>
      )}
    </div>
  )

  // Quick save (no detail needed)
  function saveQuick(tipo) {
    addEvento(activeMatch.id, { ...emptyEvento(), equipo, tipoEvento: tipo })
  }

  // ─── EVENT DETAIL FORM ─────────────────────────────────────────────────────
  if (step === 'event') return (
    <div>
      <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:20}}>
        <button onClick={()=>setStep('main')} style={{background:T.card2,border:'none',color:T.text,borderRadius:10,padding:'10px 14px',fontSize:14,cursor:'pointer'}}>← Volver</button>
        <div>
          <div style={{fontSize:15,fontWeight:'bold',color:equipo==='local'?T.accent:T.cyan}}>{equipo==='local'?'🏠 Local':'✈️ Rival'}</div>
          <div style={{fontSize:12,color:T.muted}}>{LABELS.tipoEvento[form.tipoEvento]||form.tipoEvento}</div>
        </div>
      </div>

      {/* Tipo de gol */}
      {form.tipoEvento==='gol'&&(
        <Section title="Tipo de gol">
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8,marginBottom:4}}>
            {Object.entries(LABELS.tipoGol).map(([v,l])=>(
              <BigBtn key={v} active={form.tipoGol===v} color={T.accent} onClick={()=>setForm(f=>({...f,tipoGol:v}))} style={{minHeight:52,fontSize:12}}>{l}</BigBtn>
            ))}
          </div>
        </Section>
      )}

      {/* Resultado */}
      {(form.tipoEvento==='tiro_errado'||form.tipoEvento==='atajada')&&(
        <Section title="Resultado del tiro">
          <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:8}}>
            {[['atajada','🧤 Atajada'],['poste','🟡 Poste'],['fuera','❌ Fuera']].map(([v,l])=>(
              <BigBtn key={v} active={form.resultado===v} color={T.cyan} onClick={()=>setForm(f=>({...f,resultado:v}))} style={{minHeight:52,fontSize:11}}>{l}</BigBtn>
            ))}
          </div>
        </Section>
      )}

      {/* Jugador */}
      <Section title="Jugador">
        {jugActivos.length===0
          ? <div style={{color:T.muted,fontSize:12,textAlign:'center',padding:12}}>Sin jugadores — agregá desde "Plantel"</div>
          : <div style={{display:'flex',flexWrap:'wrap',gap:8}}>
              <BigBtn active={!form.jugadorId} color={T.muted} onClick={()=>setForm(f=>({...f,jugadorId:''}))} style={{minWidth:80,fontSize:11}}>Sin asignar</BigBtn>
              {jugActivos.map(j=>(
                <BigBtn key={j.id} active={form.jugadorId===j.id} color={equipo==='local'?T.accent:T.cyan} onClick={()=>setForm(f=>({...f,jugadorId:j.id}))} style={{minWidth:80,fontSize:11}}>
                  {j.numero?`#${j.numero}`:''}
                  <br/>{j.nombre.split(' ')[0]}
                </BigBtn>
              ))}
            </div>
        }
      </Section>

      {/* Arquero contrario */}
      {(form.tipoEvento==='gol'||form.tipoEvento==='tiro_errado'||form.tipoEvento==='atajada')&&arquEq.length>0&&(
        <Section title="Arquero rival">
          <div style={{display:'flex',flexWrap:'wrap',gap:8}}>
            <BigBtn active={!form.arqueroId} color={T.muted} onClick={()=>setForm(f=>({...f,arqueroId:''}))} style={{minWidth:80,fontSize:11}}>Sin asignar</BigBtn>
            {arquEq.map(a=>(
              <BigBtn key={a.id} active={form.arqueroId===a.id} color={T.orange} onClick={()=>setForm(f=>({...f,arqueroId:a.id}))} style={{minWidth:80,fontSize:11}}>🧤 {a.nombre.split(' ')[0]}</BigBtn>
            ))}
          </div>
        </Section>
      )}

      {/* Cancha interactiva */}
      {(form.tipoEvento==='gol'||form.tipoEvento==='tiro_errado')&&(
        <Section title="Posición en cancha — tocá donde fue el tiro">
          <HandballCourt onShot={handleShot} shots={lastShot?[{...lastShot,gol:form.tipoEvento==='gol'}]:[]} height={220}/>
          {form.posX&&<div style={{fontSize:11,color:T.accent,textAlign:'center',marginTop:6}}>📍 Zona: {form.zonaCancha} · Distancia: {LABELS.distanciaFull[form.distancia]||form.distancia}</div>}
        </Section>
      )}

      {/* Cuadrante portería */}
      {(form.tipoEvento==='gol'||form.tipoEvento==='tiro_errado'||form.tipoEvento==='atajada')&&(
        <Section title="Cuadrante de portería">
          <div style={{background:T.card2,borderRadius:10,padding:10,border:`1px solid ${T.border}`}}>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:6,marginBottom:6}}>
              {[['sup_izq','↖ Sup.Izq'],['sup_der','↗ Sup.Der']].map(([v,l])=>(
                <BigBtn key={v} active={form.cuadrantePorteria===v} color={T.cyan} onClick={()=>setForm(f=>({...f,cuadrantePorteria:v}))} style={{minHeight:52,fontSize:12}}>{l}</BigBtn>
              ))}
            </div>
            <div style={{display:'grid',gridTemplateColumns:'1fr 0.6fr 1fr',gap:6}}>
              {[['inf_izq','↙ Inf.Izq'],['centro','• Centro'],['inf_der','↘ Inf.Der']].map(([v,l])=>(
                <BigBtn key={v} active={form.cuadrantePorteria===v} color={T.cyan} onClick={()=>setForm(f=>({...f,cuadrantePorteria:v}))} style={{minHeight:52,fontSize:11}}>{l}</BigBtn>
              ))}
            </div>
          </div>
        </Section>
      )}

      {/* Contexto */}
      <Section title="Contexto táctico (opcional)">
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8,marginBottom:8}}>
          <div>
            <div style={{fontSize:11,color:T.muted,marginBottom:6}}>SITUACIÓN NUMÉRICA</div>
            {Object.entries(LABELS.situacion).map(([v,l])=>(
              <BigBtn key={v} active={form.situacionNumerica===v} color={T.purple} onClick={()=>setForm(f=>({...f,situacionNumerica:v}))} style={{width:'100%',marginBottom:6,minHeight:44,fontSize:11}}>{l}</BigBtn>
            ))}
          </div>
          <div>
            <div style={{fontSize:11,color:T.muted,marginBottom:6}}>TIPO DE ATAQUE</div>
            {Object.entries(LABELS.tipoAtaque).map(([v,l])=>(
              <BigBtn key={v} active={form.tipoAtaque===v} color={T.warn} onClick={()=>setForm(f=>({...f,tipoAtaque:v}))} style={{width:'100%',marginBottom:6,minHeight:44,fontSize:11}}>{l}</BigBtn>
            ))}
          </div>
        </div>
        <div style={{marginBottom:8}}>
          <div style={{fontSize:11,color:T.muted,marginBottom:6}}>TIPO DE LANZAMIENTO</div>
          <div style={{display:'flex',flexWrap:'wrap',gap:6}}>
            {Object.entries(LABELS.tipoLanzamiento).map(([v,l])=>(
              <BigBtn key={v} active={form.tipoLanzamiento===v} color={T.orange} onClick={()=>setForm(f=>({...f,tipoLanzamiento:v}))} style={{minHeight:40,fontSize:11}}>{l}</BigBtn>
            ))}
          </div>
        </div>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8}}>
          <div>
            <div style={{fontSize:11,color:T.muted,marginBottom:4}}>MINUTO</div>
            <input type="number" value={form.minuto} onChange={e=>setForm(f=>({...f,minuto:e.target.value}))} placeholder="0–60" min={0} max={70}
              style={{width:'100%',background:T.card2,color:T.text,border:`1px solid ${T.border}`,borderRadius:10,padding:'12px',fontSize:18,fontFamily:'monospace',textAlign:'center'}}/>
          </div>
          <div>
            <div style={{fontSize:11,color:T.muted,marginBottom:4}}>ZONA (A–F)</div>
            <div style={{display:'flex',flexWrap:'wrap',gap:4}}>
              {['A','B','C','D','E','F'].map(z=>(
                <BigBtn key={z} active={form.zonaAtaque===z} color={T.accent} onClick={()=>setForm(f=>({...f,zonaAtaque:z}))} style={{width:36,minHeight:36,fontSize:13,padding:4}}>{z}</BigBtn>
              ))}
            </div>
          </div>
        </div>
      </Section>

      <Btn fullWidth onClick={saveEvento} disabled={saving} style={{marginBottom:80,minHeight:54,fontSize:16}}>
        {saving ? 'Guardando...' : `✅ Guardar ${LABELS.tipoEvento[form.tipoEvento]||'evento'}`}
      </Btn>
    </div>
  )

  return null
}

const eventIcon = tipo => ({ gol:'⚽', tiro_errado:'❌', atajada:'🧤', perdida:'💨', recuperacion:'🔄', exclusion:'🚫', timeout:'⏸' })[tipo] || '📋'
