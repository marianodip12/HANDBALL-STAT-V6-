import { useState } from 'react'
import { useMatch } from '../context/MatchContext.jsx'
import { Card, Section, Btn, FormInput, Modal, EmptyState, T } from '../components/ui/index.jsx'
import { POSICIONES, LABELS } from '../data/eventSchema.js'

const emptyTeam   = () => ({nombre:'',categoria:'',temporada:''})
const emptyPlayer = () => ({nombre:'',numero:'',posicion:'',esArquero:false})

export const TeamsPage = () => {
  const {teams,createTeam,updateTeam,deleteTeam,addTeamPlayer,updateTeamPlayer,deleteTeamPlayer} = useMatch()
  const [showTeamModal,   setShowTeamModal]   = useState(false)
  const [showPlayerModal, setShowPlayerModal] = useState(false)
  const [editingTeam,     setEditingTeam]     = useState(null)
  const [editingPlayer,   setEditingPlayer]   = useState(null)
  const [selectedTeamId,  setSelectedTeamId]  = useState(null)
  const [teamForm,        setTeamForm]        = useState(emptyTeam())
  const [playerForm,      setPlayerForm]      = useState(emptyPlayer())
  const [saving,          setSaving]          = useState(false)

  const selectedTeam = teams.find(t=>t.id===selectedTeamId)

  const saveTeam = async () => {
    if(!teamForm.nombre.trim()) return
    setSaving(true)
    if(editingTeam) { await updateTeam(editingTeam.id,teamForm) }
    else { const id=await createTeam(teamForm); setSelectedTeamId(id) }
    setSaving(false); setShowTeamModal(false)
  }

  const savePlayer = async () => {
    if(!playerForm.nombre.trim()||!selectedTeamId) return
    setSaving(true)
    if(editingPlayer) await updateTeamPlayer(selectedTeamId,editingPlayer.id,playerForm)
    else await addTeamPlayer(selectedTeamId,playerForm)
    setSaving(false); setShowPlayerModal(false)
  }

  const posOpts = POSICIONES.map(p=>({value:p,label:p}))

  return(
    <div>
      <Section title="Mis Equipos" action={<Btn small onClick={()=>{setEditingTeam(null);setTeamForm(emptyTeam());setShowTeamModal(true)}}>+ Nuevo</Btn>}>
        {teams.length===0
          ? <EmptyState icon="👕" title="Sin equipos" sub="Cargá tu plantilla una vez y usala en todos los partidos" action={<Btn onClick={()=>{setEditingTeam(null);setTeamForm(emptyTeam());setShowTeamModal(true)}}>+ Crear Equipo</Btn>}/>
          : <div style={{display:'flex',flexDirection:'column',gap:10}}>
              {teams.map(t=>(
                <Card key={t.id} style={{cursor:'pointer',border:`1.5px solid ${selectedTeamId===t.id?T.accent:T.border}`}} onClick={()=>setSelectedTeamId(selectedTeamId===t.id?null:t.id)}>
                  <div style={{display:'flex',alignItems:'center',justifyContent:'space-between'}}>
                    <div>
                      <div style={{fontSize:15,fontWeight:'bold',color:T.text}}>{t.nombre}</div>
                      <div style={{fontSize:11,color:T.muted,marginTop:2}}>
                        {t.categoria&&<span style={{marginRight:8}}>{t.categoria}</span>}
                        {t.temporada&&<span style={{marginRight:8}}>{t.temporada}</span>}
                        <span style={{color:T.accent}}>{t.jugadores?.length||0} jugadores</span>
                      </div>
                    </div>
                    <div style={{display:'flex',gap:6}}>
                      <Btn small variant="ghost" onClick={e=>{e.stopPropagation();setEditingTeam(t);setTeamForm({nombre:t.nombre,categoria:t.categoria||'',temporada:t.temporada||''});setShowTeamModal(true)}}>✏️</Btn>
                      <Btn small variant="danger" onClick={e=>{e.stopPropagation();if(confirm('¿Eliminar?'))deleteTeam(t.id)}}>🗑</Btn>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
        }
      </Section>

      {selectedTeam&&(
        <Section title={`Plantel — ${selectedTeam.nombre}`} action={<Btn small onClick={()=>{setEditingPlayer(null);setPlayerForm(emptyPlayer());setShowPlayerModal(true)}}>+ Jugador</Btn>}>
          {(!selectedTeam.jugadores||selectedTeam.jugadores.length===0)
            ? <EmptyState icon="👤" title="Sin jugadores" sub="Agregá los jugadores del equipo" action={<Btn onClick={()=>{setEditingPlayer(null);setPlayerForm(emptyPlayer());setShowPlayerModal(true)}}>+ Agregar</Btn>}/>
            : <>
                {/* Arqueros */}
                {selectedTeam.jugadores.filter(j=>j.esArquero).length>0&&(
                  <div style={{marginBottom:14}}>
                    <div style={{fontSize:11,color:T.muted,letterSpacing:1,marginBottom:8,textTransform:'uppercase'}}>🧤 Arqueros</div>
                    <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(150px,1fr))',gap:8}}>
                      {selectedTeam.jugadores.filter(j=>j.esArquero).map(p=>(
                        <PlayerCard key={p.id} player={p} teamId={selectedTeam.id}
                          onEdit={()=>{setEditingPlayer(p);setPlayerForm({nombre:p.nombre,numero:p.numero||'',posicion:p.posicion||'',esArquero:p.esArquero||false});setShowPlayerModal(true)}}
                          onDelete={()=>{if(confirm('¿Eliminar?'))deleteTeamPlayer(selectedTeam.id,p.id)}}/>
                      ))}
                    </div>
                  </div>
                )}
                {/* Jugadores de campo */}
                {selectedTeam.jugadores.filter(j=>!j.esArquero).length>0&&(
                  <div>
                    <div style={{fontSize:11,color:T.muted,letterSpacing:1,marginBottom:8,textTransform:'uppercase'}}>⚽ Jugadores de campo</div>
                    <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(150px,1fr))',gap:8}}>
                      {selectedTeam.jugadores.filter(j=>!j.esArquero).sort((a,b)=>Number(a.numero||99)-Number(b.numero||99)).map(p=>(
                        <PlayerCard key={p.id} player={p} teamId={selectedTeam.id}
                          onEdit={()=>{setEditingPlayer(p);setPlayerForm({nombre:p.nombre,numero:p.numero||'',posicion:p.posicion||'',esArquero:p.esArquero||false});setShowPlayerModal(true)}}
                          onDelete={()=>{if(confirm('¿Eliminar?'))deleteTeamPlayer(selectedTeam.id,p.id)}}/>
                      ))}
                    </div>
                  </div>
                )}
              </>
          }
        </Section>
      )}

      {showTeamModal&&(
        <Modal title={editingTeam?'Editar Equipo':'Nuevo Equipo'} onClose={()=>setShowTeamModal(false)}>
          <FormInput label="Nombre *" value={teamForm.nombre} onChange={v=>setTeamForm(f=>({...f,nombre:v}))} placeholder="Club Atlético..." required/>
          <FormInput label="Categoría" value={teamForm.categoria} onChange={v=>setTeamForm(f=>({...f,categoria:v}))} placeholder="Primera, Sub-20..."/>
          <FormInput label="Temporada" value={teamForm.temporada} onChange={v=>setTeamForm(f=>({...f,temporada:v}))} placeholder="2025/2026"/>
          <Btn fullWidth onClick={saveTeam} disabled={saving||!teamForm.nombre.trim()}>{saving?'Guardando...':'Guardar Equipo'}</Btn>
        </Modal>
      )}

      {showPlayerModal&&(
        <Modal title={editingPlayer?'Editar Jugador':'Nuevo Jugador'} onClose={()=>setShowPlayerModal(false)}>
          <div style={{display:'grid',gridTemplateColumns:'1fr 80px',gap:10}}>
            <FormInput label="Nombre *" value={playerForm.nombre} onChange={v=>setPlayerForm(f=>({...f,nombre:v}))} required/>
            <FormInput label="Nº" value={playerForm.numero} onChange={v=>setPlayerForm(f=>({...f,numero:v}))} type="number" placeholder="7"/>
          </div>
          <FormInput label="Posición" value={playerForm.posicion} onChange={v=>setPlayerForm(f=>({...f,posicion:v,esArquero:v==='Arquero'}))} options={posOpts}/>
          <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:16,background:T.card2,borderRadius:10,padding:'12px 14px'}}>
            <input type="checkbox" id="esArq" checked={playerForm.esArquero} onChange={e=>setPlayerForm(f=>({...f,esArquero:e.target.checked,posicion:e.target.checked?'Arquero':f.posicion}))} style={{width:20,height:20,cursor:'pointer'}}/>
            <label htmlFor="esArq" style={{fontSize:14,color:T.text,cursor:'pointer'}}>🧤 Es arquero</label>
          </div>
          <Btn fullWidth onClick={savePlayer} disabled={saving||!playerForm.nombre.trim()}>{saving?'Guardando...':'Guardar Jugador'}</Btn>
        </Modal>
      )}
    </div>
  )
}

const PlayerCard=({player,onEdit,onDelete})=>(
  <Card style={{padding:'12px 14px'}}>
    <div style={{display:'flex',alignItems:'center',justifyContent:'space-between'}}>
      <div style={{display:'flex',alignItems:'center',gap:8,flex:1,minWidth:0}}>
        {player.numero&&<span style={{fontSize:14,fontWeight:'bold',color:T.accent,minWidth:24}}># {player.numero}</span>}
        <div style={{minWidth:0}}>
          <div style={{fontSize:13,fontWeight:'bold',color:T.text,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{player.nombre}</div>
          {player.posicion&&<div style={{fontSize:10,color:T.muted}}>{player.posicion}</div>}
        </div>
      </div>
      <div style={{display:'flex',gap:4,flexShrink:0}}>
        <button onClick={onEdit}   style={{background:'none',border:'none',cursor:'pointer',fontSize:14,padding:4}}>✏️</button>
        <button onClick={onDelete} style={{background:'none',border:'none',cursor:'pointer',fontSize:14,padding:4}}>🗑</button>
      </div>
    </div>
  </Card>
)
