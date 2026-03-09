import { useState } from 'react'
import { useMatch } from '../context/MatchContext.jsx'
import { Card, Section, Btn, FormInput, Modal, EmptyState, T } from '../components/ui/index.jsx'

const emptyForm = () => ({rival:'',fecha:new Date().toISOString().split('T')[0],competicion:'',temporada:'',sede:'local',myTeamId:''})

export const MatchesPage = ({setTab}) => {
  const {matches,teams,activeMatchId,createMatch,updateMatch,deleteMatch,selectMatch,exportCSV} = useMatch()
  const [showModal,  setShowModal]   = useState(false)
  const [editing,    setEditing]     = useState(null)
  const [form,       setForm]        = useState(emptyForm())
  const [saving,     setSaving]      = useState(false)

  const openNew  = () => { setEditing(null); setForm(emptyForm()); setShowModal(true) }
  const openEdit = m => { setEditing(m); setForm({rival:m.rival,fecha:m.fecha||'',competicion:m.competicion||'',temporada:m.temporada||'',sede:m.sede||'local',myTeamId:m.myTeamId||''}); setShowModal(true) }

  const save = async () => {
    if(!form.rival.trim()) return
    setSaving(true)
    if(editing) await updateMatch(editing.id,form)
    else { await createMatch(form); setTab('register') }
    setSaving(false); setShowModal(false)
  }

  const teamOpts = teams.map(t=>({value:t.id,label:`${t.nombre}${t.categoria?' — '+t.categoria:''}`}))

  return(
    <div>
      <Section title="Partidos" action={<Btn small onClick={openNew}>+ Nuevo</Btn>}>
        {matches.length===0
          ? <EmptyState icon="🏆" title="Sin partidos" sub="Creá tu primer partido para empezar" action={<Btn onClick={openNew}>+ Crear Partido</Btn>}/>
          : <div style={{display:'flex',flexDirection:'column',gap:10}}>
              {matches.map(m=>{
                const isActive=m.id===activeMatchId
                const golesL=m.eventos?.filter(e=>e.equipo==='local'&&e.tipoEvento==='gol').length||0
                const golesV=m.eventos?.filter(e=>e.equipo==='visitante'&&e.tipoEvento==='gol').length||0
                const myTeam=teams.find(t=>t.id===m.myTeamId)
                return(
                  <Card key={m.id} style={{border:`1.5px solid ${isActive?T.accent:T.border}`}}>
                    <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:8}}>
                      <div style={{flex:1}}>
                        <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:4,flexWrap:'wrap'}}>
                          {isActive&&<span style={{fontSize:9,background:T.accent,color:T.bg,borderRadius:4,padding:'2px 6px',fontWeight:'bold'}}>ACTIVO</span>}
                          <span style={{fontSize:15,fontWeight:'bold',color:T.text}}>vs {m.rival}</span>
                        </div>
                        {myTeam&&<div style={{fontSize:11,color:T.cyan,marginBottom:2}}>👕 {myTeam.nombre}</div>}
                        <div style={{fontSize:11,color:T.muted}}>
                          {m.fecha&&<span style={{marginRight:8}}>📅 {m.fecha}</span>}
                          {m.competicion&&<span>{m.competicion}</span>}
                        </div>
                      </div>
                      <div style={{textAlign:'center',background:T.card2,borderRadius:10,padding:'8px 14px',minWidth:76}}>
                        <div style={{fontSize:22,fontWeight:'bold',fontFamily:'monospace',color:T.text}}>{golesL}:{golesV}</div>
                        <div style={{fontSize:8,color:T.muted}}>L — V</div>
                      </div>
                    </div>
                    <div style={{fontSize:11,color:T.muted,marginBottom:10}}>
                      {m.eventos?.length||0} eventos · {m.jugadoresLocales?.length||0}+{m.jugadoresVisitantes?.length||0} jugadores
                    </div>
                    <div style={{display:'flex',gap:6,flexWrap:'wrap'}}>
                      {!isActive&&<Btn small variant="cyan" onClick={()=>selectMatch(m.id)}>Activar</Btn>}
                      {isActive&&<Btn small onClick={()=>setTab('register')}>⚡ Registrar</Btn>}
                      <Btn small variant="ghost" onClick={()=>openEdit(m)}>✏️</Btn>
                      <Btn small variant="ghost" onClick={()=>exportCSV(m.id)}>📥 CSV</Btn>
                      <Btn small variant="danger" onClick={()=>{if(confirm('¿Eliminar?'))deleteMatch(m.id)}}>🗑</Btn>
                    </div>
                  </Card>
                )
              })}
            </div>
        }
      </Section>

      {showModal&&(
        <Modal title={editing?'Editar Partido':'Nuevo Partido'} onClose={()=>setShowModal(false)}>
          <FormInput label="Rival *" value={form.rival} onChange={v=>setForm(f=>({...f,rival:v}))} placeholder="Nombre del equipo rival" required/>
          <FormInput label="Mi Equipo" value={form.myTeamId} onChange={v=>setForm(f=>({...f,myTeamId:v}))} options={teamOpts}/>
          <FormInput label="Fecha" value={form.fecha} onChange={v=>setForm(f=>({...f,fecha:v}))} type="date"/>
          <FormInput label="Competición" value={form.competicion} onChange={v=>setForm(f=>({...f,competicion:v}))} placeholder="Liga, Copa, Amistoso..."/>
          <FormInput label="Temporada" value={form.temporada} onChange={v=>setForm(f=>({...f,temporada:v}))} placeholder="2025/2026"/>
          <FormInput label="Sede" value={form.sede} onChange={v=>setForm(f=>({...f,sede:v}))} options={[{value:'local',label:'🏠 Local'},{value:'visitante',label:'✈️ Visitante'}]}/>
          <Btn fullWidth onClick={save} disabled={saving||!form.rival.trim()}>
            {saving?'Guardando...':(editing?'Guardar cambios':'Crear partido')}
          </Btn>
        </Modal>
      )}
    </div>
  )
}
