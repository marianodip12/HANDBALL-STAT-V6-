import { useState } from 'react'
import { useMatch } from '../context/MatchContext.jsx'
import { Card, Section, Btn, BigBtn, FormInput, Modal, EmptyState, T } from '../components/ui/index.jsx'
import { POSICIONES, LABELS, emptyEvento } from '../data/eventSchema.js'

const ZONES = [
  { key:'A', label:'Extremo\nIzquierdo', icon:'◀', color:'#06b6d4' },
  { key:'B', label:'Lateral\nIzquierdo',  icon:'↖', color:'#8b5cf6' },
  { key:'C', label:'Central\nIzquierdo',  icon:'↑', color:'#f59e0b' },
  { key:'D', label:'Central\nDerecho',    icon:'↑', color:'#f59e0b' },
  { key:'E', label:'Lateral\nDerecho',    icon:'↗', color:'#8b5cf6' },
  { key:'F', label:'Extremo\nDerecho',    icon:'▶', color:'#06b6d4' },
]
const TIPO_GOL_LIST = [
  { key:'6m',           label:'6 Metros',           icon:'6️⃣', color:'#00ff87' },
  { key:'9m',           label:'9 Metros',            icon:'9️⃣', color:'#a29bfe' },
  { key:'7m',           label:'7 Metros (Penal)',    icon:'⚡',  color:'#ffa502' },
  { key:'contraataque', label:'Contraataque',        icon:'🏃',  color:'#00d4ff' },
  { key:'campo_a_campo',label:'Campo a Campo',       icon:'🌐',  color:'#ff6b35' },
]
const eventIcon = t => ({gol:'⚽',tiro_errado:'❌',atajada:'🧤',perdida:'💨',recuperacion:'🔄',exclusion:'🚫',timeout:'⏸'})[t]||'📋'

export const RegisterPage = () => {
  const {activeMatch,addEvento,deleteEvento,addJugador,removeJugador,addArquero,removeArquero,teams} = useMatch()
  const [step,setStep]         = useState('main')
  const [equipo,setEquipo]     = useState('local')
  const [form,setForm]         = useState(emptyEvento())
  const [saving,setSaving]     = useState(false)
  const [showRoster,setShowRoster] = useState(false)
  const [rosterEq,setRosterEq]     = useState('local')
  const [rName,setRName]           = useState('')
  const [rNum,setRNum]             = useState('')
  const [rPos,setRPos]             = useState('')
  const [rIsArq,setRIsArq]         = useState(false)
  const [rSaving,setRSaving]       = useState(false)

  if (!activeMatch) return <EmptyState icon="⚡" title="Sin partido activo" sub="Activá un partido en Partidos"/>

  const myTeam   = teams.find(t=>t.id===activeMatch.myTeamId)
  const jugL     = activeMatch.jugadoresLocales   || []
  const jugV     = activeMatch.jugadoresVisitantes || []
  const arqueros = activeMatch.arqueros            || []
  const jugActivos = equipo==='local' ? jugL : jugV
  const arquEq     = arqueros.filter(a=>a.equipo!==equipo)
  const colorEq    = equipo==='local' ? T.accent : T.cyan
  const evL = (activeMatch.eventos||[]).filter(e=>e.equipo==='local'&&e.tipoEvento==='gol').length
  const evV = (activeMatch.eventos||[]).filter(e=>e.equipo==='visitante'&&e.tipoEvento==='gol').length

  const saveQuick = async tipo => { await addEvento(activeMatch.id,{...emptyEvento(),equipo,tipoEvento:tipo}) }
  const saveEvento = async () => {
    if(saving) return; setSaving(true)
    await addEvento(activeMatch.id,{...form,equipo})
    setSaving(false); setForm(emptyEvento()); setStep('main')
  }
  const addRosterPlayer = async () => {
    if(!rName.trim()) return; setRSaving(true)
    if(rIsArq) await addArquero(activeMatch.id,rName.trim(),rosterEq)
    else await addJugador(activeMatch.id,rosterEq,rName.trim(),rNum,rPos)
    setRName(''); setRNum(''); setRPos(''); setRIsArq(false); setRSaving(false)
  }
  const importFromTeam = async team => {
    const existing = (rosterEq==='local'?jugL:jugV).map(j=>j.nombre.toLowerCase())
    for(const p of team.jugadores){
      if(existing.includes(p.nombre.toLowerCase())) continue
      if(p.esArquero) await addArquero(activeMatch.id,p.nombre,rosterEq)
      else await addJugador(activeMatch.id,rosterEq,p.nombre,p.numero||'',p.posicion||'')
    }
  }
  const jugNombre = id => { const j=[...jugL,...jugV,...arqueros].find(p=>p.id===id); return j?(j.numero?`#${j.numero} ${j.nombre}`:j.nombre):'—' }
  const recent = [...(activeMatch.eventos||[])].reverse().slice(0,8)

  // ── MAIN ─────────────────────────────────────────────────────────────────────
  if(step==='main') return(<div>
    {/* Scoreboard */}
    <Card style={{marginBottom:16,background:T.card2}}>
      <div style={{display:'grid',gridTemplateColumns:'1fr auto 1fr',alignItems:'center',gap:8,marginBottom:8}}>
        <div style={{textAlign:'center'}}>
          <div style={{fontSize:10,color:T.accent,fontWeight:'bold',letterSpacing:1,marginBottom:4}}>LOCAL</div>
          <div style={{fontSize:48,fontWeight:'bold',color:T.accent,fontFamily:'monospace',lineHeight:1}}>{evL}</div>
          <div style={{fontSize:10,color:T.muted,marginTop:4}}>{myTeam?.nombre||'Mi equipo'}</div>
        </div>
        <div style={{fontSize:22,color:T.muted,fontWeight:'bold'}}>:</div>
        <div style={{textAlign:'center'}}>
          <div style={{fontSize:10,color:T.cyan,fontWeight:'bold',letterSpacing:1,marginBottom:4}}>VISITANTE</div>
          <div style={{fontSize:48,fontWeight:'bold',color:T.cyan,fontFamily:'monospace',lineHeight:1}}>{evV}</div>
          <div style={{fontSize:10,color:T.muted,marginTop:4}}>{activeMatch.rival}</div>
        </div>
      </div>
      <div style={{textAlign:'center',fontSize:11,color:T.muted}}>{(activeMatch.eventos||[]).length} eventos · {activeMatch.fecha||''}</div>
    </Card>

    {/* Team selector */}
    <Section title="¿Quién realiza la acción?">
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12,marginBottom:8}}>
        {[
          {eq:'local',    icon:'🏠',label:'Local',    name:myTeam?.nombre||'Mi equipo', color:T.accent},
          {eq:'visitante',icon:'✈️',label:'Visitante',name:activeMatch.rival,            color:T.cyan},
        ].map(({eq,icon,label,name,color})=>(
          <button key={eq} onClick={()=>setEquipo(eq)} style={{
            background:equipo===eq?`${color}20`:T.card2,color:equipo===eq?color:T.muted,
            border:`2px solid ${equipo===eq?color:T.border}`,borderRadius:14,padding:'16px 10px',
            cursor:'pointer',WebkitTapHighlightColor:'transparent',transition:'all .15s',
          }}>
            <div style={{fontSize:26,marginBottom:4}}>{icon}</div>
            <div style={{fontSize:13,fontWeight:'bold'}}>{label}</div>
            <div style={{fontSize:10,opacity:0.75,marginTop:2,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{name}</div>
          </button>
        ))}
      </div>
      <div style={{textAlign:'center'}}>
        <span style={{fontSize:11,color:colorEq,background:`${colorEq}18`,borderRadius:20,padding:'4px 14px',fontWeight:'bold'}}>
          Registrando para: {equipo==='local'?(myTeam?.nombre||'Local'):activeMatch.rival}
        </span>
      </div>
    </Section>

    {/* Event buttons */}
    <Section title="Registrar evento">
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12,marginBottom:12}}>
        {[
          {tipo:'gol',       icon:'⚽',label:'GOL',         color:T.accent, detail:true},
          {tipo:'tiro_errado',icon:'❌',label:'TIRO ERRADO', color:T.red,   detail:true},
        ].map(({tipo,icon,label,color,detail})=>(
          <button key={tipo} onClick={()=>{setForm({...emptyEvento(),equipo,tipoEvento:tipo});setStep('event')}} style={{
            background:`${color}18`,border:`2px solid ${color}`,color,
            borderRadius:16,padding:'20px 10px',cursor:'pointer',WebkitTapHighlightColor:'transparent',
          }}>
            <div style={{fontSize:32,marginBottom:6}}>{icon}</div>
            <div style={{fontSize:15,fontWeight:'bold'}}>{label}</div>
          </button>
        ))}
      </div>
      <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:8,marginBottom:8}}>
        {[
          {tipo:'atajada',   icon:'🧤',label:'Atajada',   color:T.cyan},
          {tipo:'perdida',   icon:'💨',label:'Pérdida',   color:T.warn},
          {tipo:'exclusion', icon:'🚫',label:'Exclusión', color:T.red},
        ].map(({tipo,icon,label,color})=>(
          <button key={tipo} onClick={()=>saveQuick(tipo)} style={{
            background:`${color}15`,border:`1.5px solid ${color}44`,color,
            borderRadius:12,padding:'12px 6px',cursor:'pointer',WebkitTapHighlightColor:'transparent',
          }}>
            <div style={{fontSize:22,marginBottom:3}}>{icon}</div>
            <div style={{fontSize:11,fontWeight:'bold'}}>{label}</div>
          </button>
        ))}
      </div>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8}}>
        {[
          {tipo:'recuperacion',icon:'🔄',label:'Recuperación'},
          {tipo:'timeout',     icon:'⏸',label:'Time Out'},
        ].map(({tipo,icon,label})=>(
          <button key={tipo} onClick={()=>saveQuick(tipo)} style={{
            background:T.card2,border:`1px solid ${T.border}`,color:T.muted,
            borderRadius:12,padding:'10px',cursor:'pointer',WebkitTapHighlightColor:'transparent',
          }}>
            <span style={{fontSize:18}}>{icon}</span>
            <span style={{fontSize:11,marginLeft:6}}>{label}</span>
          </button>
        ))}
      </div>
    </Section>

    {/* Recent */}
    {recent.length>0&&(
      <Section title="Últimos eventos">
        {recent.map(e=>(
          <Card key={e.id} style={{marginBottom:7,padding:'10px 12px',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
            <div style={{display:'flex',alignItems:'center',gap:8,flex:1,minWidth:0}}>
              <span style={{fontSize:18,flexShrink:0}}>{eventIcon(e.tipoEvento)}</span>
              <div style={{minWidth:0}}>
                <div style={{fontSize:12,fontWeight:'bold',color:T.text,whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>
                  {LABELS.tipoEvento[e.tipoEvento]||e.tipoEvento}{e.tipoGol?' — '+(LABELS.tipoGol[e.tipoGol]||e.tipoGol):''}
                </div>
                <div style={{fontSize:10,color:T.muted}}>
                  {e.equipo==='local'?'🏠':'✈️'} {e.jugadorId?' · '+jugNombre(e.jugadorId):''}
                  {e.zonaAtaque?' · '+(LABELS.zonaAtaqueFull[e.zonaAtaque]||e.zonaAtaque):''}
                  {e.minuto!=null&&e.minuto!==''?' · min '+e.minuto:''}
                </div>
              </div>
            </div>
            <button onClick={()=>{if(confirm('¿Eliminar?'))deleteEvento(activeMatch.id,e.id)}}
              style={{background:'none',border:'none',color:T.muted,cursor:'pointer',fontSize:18,padding:'4px 8px',flexShrink:0}}>×</button>
          </Card>
        ))}
      </Section>
    )}

    {/* Roster panel */}
    <Section title="Plantel del partido" action={
      <button onClick={()=>setShowRoster(true)} style={{background:T.accent,color:T.bg,border:'none',borderRadius:8,padding:'7px 14px',fontSize:12,fontWeight:'bold',cursor:'pointer'}}>Gestionar</button>
    }>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}>
        {[
          {label:'🏠 Local',   color:T.accent, jugs:jugL, arqs:arqueros.filter(a=>a.equipo==='local')},
          {label:'✈️ Rival',   color:T.cyan,   jugs:jugV, arqs:arqueros.filter(a=>a.equipo==='visitante')},
        ].map(({label,color,jugs,arqs})=>(
          <Card key={label} style={{padding:12}}>
            <div style={{fontSize:11,color,fontWeight:'bold',marginBottom:6}}>{label}</div>
            {arqs.map(a=><div key={a.id} style={{fontSize:11,color:T.cyan,marginBottom:2}}>🧤 {a.nombre}</div>)}
            {jugs.slice(0,4).map(j=><div key={j.id} style={{fontSize:11,color:T.text,marginBottom:2}}>{j.numero?`#${j.numero} `:''}{ j.nombre}</div>)}
            {jugs.length>4&&<div style={{fontSize:10,color:T.muted}}>+{jugs.length-4} más</div>}
            {jugs.length===0&&arqs.length===0&&<div style={{fontSize:10,color:T.muted}}>Sin jugadores</div>}
          </Card>
        ))}
      </div>
    </Section>

    {/* Roster Modal */}
    {showRoster&&(
      <Modal title="Plantel del Partido" onClose={()=>setShowRoster(false)}>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8,marginBottom:16}}>
          {['local','visitante'].map(eq=>(
            <button key={eq} onClick={()=>setRosterEq(eq)} style={{
              background:rosterEq===eq?(eq==='local'?T.accent:T.cyan):T.card2,
              color:rosterEq===eq?T.bg:T.muted,border:'none',borderRadius:10,
              padding:'11px',fontWeight:'bold',cursor:'pointer',fontSize:13,
            }}>{eq==='local'?'🏠 Local':'✈️ Rival'}</button>
          ))}
        </div>
        {teams.length>0&&(
          <div style={{marginBottom:12}}>
            {teams.map(t=>(
              <button key={t.id} onClick={()=>importFromTeam(t)} style={{width:'100%',background:T.card2,color:T.muted,border:`1px solid ${T.border}`,borderRadius:10,padding:'10px 14px',marginBottom:6,cursor:'pointer',textAlign:'left',fontSize:13}}>
                📋 Importar: <strong style={{color:T.text}}>{t.nombre}</strong>
              </button>
            ))}
          </div>
        )}
        <div style={{maxHeight:180,overflowY:'auto',marginBottom:14,background:T.card2,borderRadius:10,padding:'8px 12px'}}>
          {[...(rosterEq==='local'?jugL:jugV),...arqueros.filter(a=>a.equipo===rosterEq)].length===0
            ? <div style={{textAlign:'center',color:T.muted,padding:12,fontSize:12}}>Sin jugadores aún</div>
            : [...(rosterEq==='local'?jugL:jugV),...arqueros.filter(a=>a.equipo===rosterEq)].map(j=>(
              <div key={j.id} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'8px 0',borderBottom:`1px solid ${T.border}`}}>
                <span style={{fontSize:13,color:j.equipo===undefined?T.cyan:T.text}}>
                  {j.equipo===undefined?'🧤 ':''}{j.numero?`#${j.numero} `:''}{ j.nombre}{j.posicion?` — ${j.posicion}`:''}
                </span>
                <button onClick={()=>j.equipo===undefined?removeArquero(activeMatch.id,j.id):removeJugador(activeMatch.id,rosterEq,j.id)}
                  style={{background:'none',border:'none',color:T.red,cursor:'pointer',fontSize:18,padding:'0 6px'}}>×</button>
              </div>
            ))
          }
        </div>
        <div style={{display:'grid',gridTemplateColumns:'1fr 70px',gap:8,marginBottom:8}}>
          <input value={rName} onChange={e=>setRName(e.target.value)} placeholder="Nombre del jugador"
            style={{background:T.bg,color:T.text,border:`1px solid ${T.border}`,borderRadius:10,padding:'12px',fontSize:14,fontFamily:'inherit'}}/>
          <input value={rNum} onChange={e=>setRNum(e.target.value)} placeholder="#" type="number"
            style={{background:T.bg,color:T.text,border:`1px solid ${T.border}`,borderRadius:10,padding:'12px',fontSize:16,fontFamily:'inherit',textAlign:'center'}}/>
        </div>
        <select value={rPos} onChange={e=>setRPos(e.target.value)}
          style={{width:'100%',background:T.bg,color:rPos?T.text:T.muted,border:`1px solid ${T.border}`,borderRadius:10,padding:'12px',fontSize:14,fontFamily:'inherit',marginBottom:10}}>
          <option value="">— Posición —</option>
          {POSICIONES.map(p=><option key={p} value={p}>{p}</option>)}
        </select>
        <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:14,background:T.bg,borderRadius:10,padding:'12px 14px'}}>
          <input type="checkbox" id="isArq2" checked={rIsArq} onChange={e=>setRIsArq(e.target.checked)} style={{width:22,height:22,cursor:'pointer'}}/>
          <label htmlFor="isArq2" style={{fontSize:14,color:T.text,cursor:'pointer'}}>🧤 Es arquero</label>
        </div>
        <Btn fullWidth onClick={addRosterPlayer} disabled={rSaving||!rName.trim()}>
          {rSaving?'Guardando...':'+ Agregar al plantel'}
        </Btn>
      </Modal>
    )}
  </div>)

  // ── EVENT FORM ───────────────────────────────────────────────────────────────
  if(step==='event') return(<div>
    <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:20}}>
      <button onClick={()=>setStep('main')} style={{background:T.card2,border:`1px solid ${T.border}`,color:T.text,borderRadius:10,padding:'10px 16px',fontSize:14,cursor:'pointer'}}>← Volver</button>
      <div>
        <div style={{fontSize:15,fontWeight:'bold',color:colorEq}}>{equipo==='local'?'🏠 '+(myTeam?.nombre||'Local'):'✈️ '+activeMatch.rival}</div>
        <div style={{fontSize:12,color:T.muted}}>{LABELS.tipoEvento[form.tipoEvento]||form.tipoEvento}</div>
      </div>
    </div>

    {/* Tipo de gol */}
    {form.tipoEvento==='gol'&&(
      <Section title="Tipo de gol">
        {TIPO_GOL_LIST.map(({key,label,icon,color})=>(
          <button key={key} onClick={()=>setForm(f=>({...f,tipoGol:key}))} style={{
            width:'100%',marginBottom:8,
            background:form.tipoGol===key?`${color}28`:T.card2,
            color:form.tipoGol===key?color:T.muted,
            border:`2px solid ${form.tipoGol===key?color:T.border}`,
            borderRadius:12,padding:'14px 18px',cursor:'pointer',
            display:'flex',alignItems:'center',gap:12,fontSize:14,fontWeight:'bold',
            textAlign:'left',WebkitTapHighlightColor:'transparent',transition:'all .15s',
          }}>
            <span style={{fontSize:24}}>{icon}</span>
            <span style={{flex:1}}>{label}</span>
            {form.tipoGol===key&&<span style={{fontSize:18}}>✅</span>}
          </button>
        ))}
      </Section>
    )}

    {/* Resultado tiro */}
    {(form.tipoEvento==='tiro_errado'||form.tipoEvento==='atajada')&&(
      <Section title="Resultado del tiro">
        <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:8}}>
          {[{key:'atajada',label:'🧤 Atajada',color:T.cyan},{key:'poste',label:'🟡 Poste',color:T.warn},{key:'fuera',label:'❌ Fuera',color:T.red}].map(({key,label,color})=>(
            <BigBtn key={key} active={form.resultado===key} color={color} onClick={()=>setForm(f=>({...f,resultado:key}))} style={{minHeight:56,fontSize:12}}>{label}</BigBtn>
          ))}
        </div>
      </Section>
    )}

    {/* Zona de lanzamiento — position buttons */}
    {(form.tipoEvento==='gol'||form.tipoEvento==='tiro_errado'||form.tipoEvento==='atajada')&&(
      <Section title="Zona de lanzamiento">
        <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:8,marginBottom:8}}>
          {ZONES.slice(0,3).map(z=>(
            <button key={z.key} onClick={()=>setForm(f=>({...f,zonaAtaque:z.key}))} style={{
              background:form.zonaAtaque===z.key?`${z.color}30`:T.card2,
              color:form.zonaAtaque===z.key?z.color:T.muted,
              border:`2px solid ${form.zonaAtaque===z.key?z.color:T.border}`,
              borderRadius:12,padding:'14px 6px',cursor:'pointer',textAlign:'center',
              fontSize:11,fontWeight:'bold',lineHeight:1.4,minHeight:64,
              WebkitTapHighlightColor:'transparent',transition:'all .15s',
              whiteSpace:'pre-line',
            }}>
              <div style={{fontSize:18,marginBottom:4}}>{z.icon}</div>{z.label}
            </button>
          ))}
        </div>
        <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:8,marginBottom:8}}>
          {ZONES.slice(3).map(z=>(
            <button key={z.key} onClick={()=>setForm(f=>({...f,zonaAtaque:z.key}))} style={{
              background:form.zonaAtaque===z.key?`${z.color}30`:T.card2,
              color:form.zonaAtaque===z.key?z.color:T.muted,
              border:`2px solid ${form.zonaAtaque===z.key?z.color:T.border}`,
              borderRadius:12,padding:'14px 6px',cursor:'pointer',textAlign:'center',
              fontSize:11,fontWeight:'bold',lineHeight:1.4,minHeight:64,
              WebkitTapHighlightColor:'transparent',transition:'all .15s',
              whiteSpace:'pre-line',
            }}>
              <div style={{fontSize:18,marginBottom:4}}>{z.icon}</div>{z.label}
            </button>
          ))}
        </div>
        <button onClick={()=>setForm(f=>({...f,zonaAtaque:'pivot'}))} style={{
          width:'100%',background:form.zonaAtaque==='pivot'?`${T.red}30`:T.card2,
          color:form.zonaAtaque==='pivot'?T.red:T.muted,
          border:`2px solid ${form.zonaAtaque==='pivot'?T.red:T.border}`,
          borderRadius:12,padding:'12px',cursor:'pointer',fontSize:12,fontWeight:'bold',
          WebkitTapHighlightColor:'transparent',transition:'all .15s',
        }}>⬟ Pivote (zona 6m central)</button>
        {form.zonaAtaque&&(
          <div style={{textAlign:'center',marginTop:8,fontSize:11,color:colorEq}}>
            ✅ <strong>{LABELS.zonaAtaqueFull[form.zonaAtaque]||'Pivote'}</strong>
          </div>
        )}
      </Section>
    )}

    {/* Jugador */}
    <Section title="Jugador que lanzó">
      <div style={{display:'flex',flexWrap:'wrap',gap:8}}>
        <button onClick={()=>setForm(f=>({...f,jugadorId:''}))} style={{background:!form.jugadorId?T.muted:T.card2,color:!form.jugadorId?T.bg:T.muted,border:`1.5px solid ${!form.jugadorId?T.muted:T.border}`,borderRadius:10,padding:'10px 14px',cursor:'pointer',fontSize:12,WebkitTapHighlightColor:'transparent'}}>Sin asignar</button>
        {jugActivos.map(j=>(
          <button key={j.id} onClick={()=>setForm(f=>({...f,jugadorId:j.id}))} style={{background:form.jugadorId===j.id?`${colorEq}30`:T.card2,color:form.jugadorId===j.id?colorEq:T.text,border:`2px solid ${form.jugadorId===j.id?colorEq:T.border}`,borderRadius:10,padding:'10px 14px',cursor:'pointer',fontSize:12,fontWeight:'bold',WebkitTapHighlightColor:'transparent',transition:'all .15s'}}>
            {j.numero?`#${j.numero} `:''}{ j.nombre.split(' ')[0]}
          </button>
        ))}
        {jugActivos.length===0&&<div style={{color:T.muted,fontSize:12,padding:8}}>Sin jugadores — agregá desde "Plantel"</div>}
      </div>
    </Section>

    {/* Arquero rival */}
    {(form.tipoEvento==='gol'||form.tipoEvento==='tiro_errado'||form.tipoEvento==='atajada')&&arquEq.length>0&&(
      <Section title="Arquero rival">
        <div style={{display:'flex',flexWrap:'wrap',gap:8}}>
          <button onClick={()=>setForm(f=>({...f,arqueroId:''}))} style={{background:!form.arqueroId?T.muted:T.card2,color:!form.arqueroId?T.bg:T.muted,border:`1.5px solid ${!form.arqueroId?T.muted:T.border}`,borderRadius:10,padding:'10px 14px',cursor:'pointer',fontSize:12}}>Sin asignar</button>
          {arquEq.map(a=>(
            <button key={a.id} onClick={()=>setForm(f=>({...f,arqueroId:a.id}))} style={{background:form.arqueroId===a.id?`${T.orange}30`:T.card2,color:form.arqueroId===a.id?T.orange:T.text,border:`2px solid ${form.arqueroId===a.id?T.orange:T.border}`,borderRadius:10,padding:'10px 14px',cursor:'pointer',fontSize:12,fontWeight:'bold'}}>🧤 {a.nombre.split(' ')[0]}</button>
          ))}
        </div>
      </Section>
    )}

    {/* Cuadrante portería */}
    {(form.tipoEvento==='gol'||form.tipoEvento==='tiro_errado'||form.tipoEvento==='atajada')&&(
      <Section title="Cuadrante de portería">
        <div style={{background:T.card2,borderRadius:12,padding:12,border:`1px solid ${T.border}`}}>
          <div style={{fontSize:9,color:T.muted,textAlign:'center',marginBottom:8,letterSpacing:1}}>═ TRAVESAÑO ═</div>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:6,marginBottom:6}}>
            {[{key:'sup_izq',label:'↖ Sup.Izq'},{key:'sup_der',label:'↗ Sup.Der'}].map(({key,label})=>(
              <BigBtn key={key} active={form.cuadrantePorteria===key} color={T.cyan} onClick={()=>setForm(f=>({...f,cuadrantePorteria:key}))} style={{minHeight:52,fontSize:12}}>{label}</BigBtn>
            ))}
          </div>
          <div style={{display:'grid',gridTemplateColumns:'1fr 0.65fr 1fr',gap:6}}>
            {[{key:'inf_izq',label:'↙ Inf.Izq'},{key:'centro',label:'• Centro'},{key:'inf_der',label:'↘ Inf.Der'}].map(({key,label})=>(
              <BigBtn key={key} active={form.cuadrantePorteria===key} color={T.cyan} onClick={()=>setForm(f=>({...f,cuadrantePorteria:key}))} style={{minHeight:52,fontSize:11}}>{label}</BigBtn>
            ))}
          </div>
        </div>
      </Section>
    )}

    {/* Contexto */}
    <Section title="Contexto (opcional)">
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}>
        <div>
          <div style={{fontSize:11,color:T.muted,marginBottom:6,letterSpacing:1}}>SITUACIÓN NUMÉRICA</div>
          {[{key:'igualdad',label:'6 vs 6'},{key:'superioridad',label:'7 vs 6 (sup.)'},{key:'inferioridad',label:'6 vs 7 (inf.)'}].map(({key,label})=>(
            <button key={key} onClick={()=>setForm(f=>({...f,situacionNumerica:key}))} style={{width:'100%',marginBottom:6,background:form.situacionNumerica===key?`#a29bfe28`:T.card2,color:form.situacionNumerica===key?'#a29bfe':T.muted,border:`1.5px solid ${form.situacionNumerica===key?'#a29bfe':T.border}`,borderRadius:10,padding:'10px',cursor:'pointer',fontSize:12,fontWeight:'bold'}}>{label}</button>
          ))}
        </div>
        <div>
          <div style={{fontSize:11,color:T.muted,marginBottom:6,letterSpacing:1}}>MINUTO</div>
          <input type="number" value={form.minuto} onChange={e=>setForm(f=>({...f,minuto:e.target.value}))} placeholder="0–60" min={0} max={70}
            style={{width:'100%',background:T.card2,color:T.text,border:`1px solid ${T.border}`,borderRadius:10,padding:'14px 12px',fontSize:22,fontFamily:'monospace',textAlign:'center'}}/>
        </div>
      </div>
    </Section>

    <button onClick={saveEvento} disabled={saving} style={{width:'100%',marginBottom:90,background:saving?T.card2:T.accent,color:saving?T.muted:T.bg,border:'none',borderRadius:16,padding:'18px',fontSize:16,fontWeight:'bold',cursor:saving?'not-allowed':'pointer',minHeight:58,WebkitTapHighlightColor:'transparent'}}>
      {saving?'Guardando...':'✅ Guardar '+( LABELS.tipoEvento[form.tipoEvento]||'evento')}
    </button>
  </div>)

  return null
}
