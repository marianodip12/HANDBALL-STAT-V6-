import { useRef } from 'react'
import { T } from '../ui/index.jsx'

// Zone names mapped to court areas (based on click position %)
export const getZoneFromPos = (x, y) => {
  // x: 0=left, 100=right  y: 0=top, 100=bottom
  // Court is shown from attacking perspective (goal on right side)
  if (x > 85) return 'porteria'
  if (x > 65) {
    if (y < 25) return 'A'       // Extremo Izquierdo
    if (y < 45) return 'B'       // Lateral Izquierdo
    if (y < 55) return 'C'       // Central Izquierdo
    if (y < 75) return 'D'       // Central Derecho
    if (y < 90) return 'E'       // Lateral Derecho
    return 'F'                   // Extremo Derecho
  }
  if (x > 40) return '9m'
  return 'campo'
}

export const getDistanciaFromPos = (x) => {
  if (x > 85) return '7m'
  if (x > 70) return '6m'
  if (x > 50) return '9m'
  return 'campo'
}

// ─── HANDBALL COURT SVG ───────────────────────────────────────────────────────
export const HandballCourt = ({ onShot, shots = [], showHeatmap = false, height = 280 }) => {
  const svgRef = useRef(null)

  const handleClick = (e) => {
    if (!onShot) return
    const svg = svgRef.current
    const rect = svg.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * 100
    const y = ((e.clientY - rect.top)  / rect.height) * 100
    const zona   = getZoneFromPos(x, y)
    const dist   = getDistanciaFromPos(x)
    onShot({ posX: Math.round(x*10)/10, posY: Math.round(y*10)/10, zonaCancha: zona, distancia: dist })
  }

  // Heatmap: build 10x6 grid of shot density
  const grid = showHeatmap && shots.length > 0 ? buildHeatGrid(shots) : null

  return (
    <div style={{ position:'relative', width:'100%' }}>
      <svg
        ref={svgRef}
        viewBox="0 0 100 60"
        style={{ width:'100%', height, cursor:onShot?'crosshair':'default', display:'block', borderRadius:10, border:`1px solid ${T.border}` }}
        onClick={handleClick}
      >
        {/* Background */}
        <rect width="100" height="60" fill="#0a1f0a" rx="2"/>
        {/* Center line */}
        <line x1="50" y1="0" x2="50" y2="60" stroke="#1a3a1a" strokeWidth="0.4"/>
        {/* Center circle */}
        <circle cx="50" cy="30" r="6" fill="none" stroke="#1a3a1a" strokeWidth="0.4"/>

        {/* ── LEFT SIDE (defense zone) ── */}
        {/* 6m arc left */}
        <path d="M 0 18 Q 18 30 0 42" fill="none" stroke="#1a5a1a" strokeWidth="0.5"/>
        {/* 9m arc left */}
        <path d="M 0 10 Q 28 30 0 50" fill="none" stroke="#1a4a1a" strokeWidth="0.3" strokeDasharray="1,1"/>
        {/* Goal left */}
        <rect x="0" y="24" width="2" height="12" fill="#2a5a2a" rx="0.3"/>

        {/* ── RIGHT SIDE (attack zone — main focus) ── */}
        {/* 6m arc right */}
        <path d="M 100 18 Q 82 30 100 42" fill="none" stroke="#00441a" strokeWidth="0.7"/>
        {/* 9m dotted arc right */}
        <path d="M 100 10 Q 72 30 100 50" fill="none" stroke="#003314" strokeWidth="0.4" strokeDasharray="1,1"/>
        {/* Free-throw line */}
        <path d="M 100 15 Q 65 30 100 45" fill="none" stroke="#002a10" strokeWidth="0.3"/>
        {/* Goal right */}
        <rect x="98" y="24" width="2" height="12" fill="#00ff8766" rx="0.3"/>
        {/* Goal posts */}
        <line x1="100" y1="24" x2="96" y2="24" stroke={T.accent} strokeWidth="0.6"/>
        <line x1="100" y1="36" x2="96" y2="36" stroke={T.accent} strokeWidth="0.6"/>
        <line x1="96"  y1="24" x2="96" y2="36" stroke={T.accent} strokeWidth="0.6"/>

        {/* Zone labels (right side) */}
        <text x="78" y="6"  fontSize="2.5" fill="#00ff8744" textAnchor="middle">A</text>
        <text x="82" y="17" fontSize="2.5" fill="#00ff8744" textAnchor="middle">B</text>
        <text x="84" y="27" fontSize="2.5" fill="#00ff8744" textAnchor="middle">C</text>
        <text x="84" y="35" fontSize="2.5" fill="#00ff8744" textAnchor="middle">D</text>
        <text x="82" y="45" fontSize="2.5" fill="#00ff8744" textAnchor="middle">E</text>
        <text x="78" y="56" fontSize="2.5" fill="#00ff8744" textAnchor="middle">F</text>
        <text x="60" y="31" fontSize="2.5" fill="#00d4ff33" textAnchor="middle">9m</text>
        <text x="30" y="31" fontSize="2.5" fill="#ffffff22" textAnchor="middle">Campo</text>

        {/* Heatmap overlay */}
        {grid && grid.map((cell,i)=>(
          cell.count > 0 && <rect key={i} x={cell.x} y={cell.y} width={cell.w} height={cell.h}
            fill={`rgba(255,${cell.gol?200:80},0,${Math.min(cell.count*0.15,0.6)})`} rx="0.5"/>
        ))}

        {/* Shot markers */}
        {shots.map((s,i)=>(
          <circle key={i} cx={s.posX??s.x} cy={s.posY??s.y} r="1.8"
            fill={s.tipoEvento==='gol'||s.gol?'#00ff87':'#ff4757'}
            stroke="#fff" strokeWidth="0.3" opacity="0.85"/>
        ))}

        {/* Tap hint */}
        {onShot && shots.length===0 && (
          <text x="50" y="57" fontSize="2.8" fill="#ffffff22" textAnchor="middle">Tocá la cancha para registrar el tiro</text>
        )}
      </svg>

      {/* Legend */}
      <div style={{display:'flex',gap:14,marginTop:6,justifyContent:'center'}}>
        <div style={{display:'flex',alignItems:'center',gap:4}}>
          <div style={{width:10,height:10,background:T.accent,borderRadius:'50%'}}/>
          <span style={{fontSize:10,color:T.muted}}>Gol</span>
        </div>
        <div style={{display:'flex',alignItems:'center',gap:4}}>
          <div style={{width:10,height:10,background:T.red,borderRadius:'50%'}}/>
          <span style={{fontSize:10,color:T.muted}}>Tiro errado / Atajada</span>
        </div>
      </div>
    </div>
  )
}

const buildHeatGrid = (shots) => {
  const cols=10, rows=6, cw=100/cols, ch=60/rows
  const cells = Array.from({length:cols*rows},(_,i)=>({
    x:(i%cols)*cw, y:Math.floor(i/cols)*ch, w:cw, h:ch, count:0, goles:0
  }))
  shots.forEach(s=>{
    const x=s.posX??s.x, y=s.posY??s.y
    if(x==null||y==null) return
    const ci=Math.min(Math.floor(x/cw),cols-1)
    const ri=Math.min(Math.floor(y/ch),rows-1)
    const idx=ri*cols+ci
    cells[idx].count++
    if(s.tipoEvento==='gol'||s.gol) cells[idx].goles++
  })
  return cells
}

// ─── GOAL MAP (portería) ──────────────────────────────────────────────────────
export const GoalMap = ({ porCuadrante=[], onSelect, selected, title='Portería' }) => {
  const data = {}
  porCuadrante.forEach(q=>{ data[q.cuadrante]=q })
  const max = Math.max(1,...Object.values(data).map(d=>d.goles||0))

  const Cell = ({q,label})=>{
    const d = data[q]||{goles:0,atajadas:0,tiros:0,eficacia:0}
    const intensity = (d.goles||0)/max
    const bg = `rgba(255,${Math.round(200-intensity*160)},${Math.round(70-intensity*70)},${0.15+intensity*0.6})`
    const isActive = selected===q
    return(
      <div onClick={()=>onSelect&&onSelect(isActive?null:q)} style={{
        background:bg, border:`2px solid ${isActive?T.accent:T.border}`,
        borderRadius:8, padding:'10px 6px', textAlign:'center',
        cursor:onSelect?'pointer':'default', transition:'all .15s',
        transform:isActive?'scale(1.05)':'scale(1)',
      }}>
        <div style={{fontSize:16,fontWeight:'bold',color:T.text,fontFamily:'monospace'}}>{d.goles||0}</div>
        <div style={{fontSize:8,color:T.muted}}>goles</div>
        <div style={{fontSize:9,color:T.cyan,marginTop:1}}>{d.tiros>0?`${d.eficacia}%`:'—'}</div>
      </div>
    )
  }

  return(
    <div>
      {title&&<div style={{fontSize:11,color:T.accent,letterSpacing:2,marginBottom:8,textTransform:'uppercase'}}>{title}</div>}
      <div style={{background:T.card2,borderRadius:10,padding:10,border:`1px solid ${T.border}`}}>
        <div style={{fontSize:9,color:T.muted,textAlign:'center',marginBottom:6,letterSpacing:1}}>═ TRAVESAÑO ═</div>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:5,marginBottom:5}}>
          <Cell q="sup_izq" label="↖"/><Cell q="sup_der" label="↗"/>
        </div>
        <div style={{display:'grid',gridTemplateColumns:'1fr 60px 1fr',gap:5}}>
          <Cell q="inf_izq" label="↙"/>
          <Cell q="centro" label="•"/>
          <Cell q="inf_der" label="↘"/>
        </div>
      </div>
    </div>
  )
}
