export const T = {
  bg:'#060c18', card:'#0b1525', card2:'#0f1e35', border:'#182d4a',
  accent:'#00ff87', cyan:'#00d4ff', red:'#ff4757', warn:'#ffa502', orange:'#ff6b35', purple:'#a29bfe',
  text:'#e2e8f0', muted:'#4a6080',
  font:"-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
}
export const CHART_COLORS = [T.accent,T.cyan,T.warn,T.red,T.purple,T.orange,'#55efc4','#fdcb6e']

export const Card = ({children,style={},onClick})=>(
  <div onClick={onClick} style={{background:T.card,border:`1px solid ${T.border}`,borderRadius:14,padding:16,...style}}>{children}</div>
)
export const Section = ({title,children,action})=>(
  <div style={{marginBottom:24}}>
    <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:12}}>
      <h2 style={{margin:0,fontSize:12,fontWeight:'bold',color:T.accent,letterSpacing:2,textTransform:'uppercase'}}>▸ {title}</h2>
      {action}
    </div>
    {children}
  </div>
)
export const Btn = ({children,onClick,variant='primary',small=false,disabled=false,style={},fullWidth=false})=>{
  const bg=variant==='primary'?T.accent:variant==='danger'?T.red:variant==='cyan'?T.cyan:variant==='warn'?T.warn:variant==='purple'?T.purple:T.card2
  const color=['primary','cyan','warn','purple'].includes(variant)?T.bg:T.text
  return <button onClick={onClick} disabled={disabled} style={{background:bg,color,border:variant==='ghost'?`1px solid ${T.border}`:'none',borderRadius:10,padding:small?'8px 14px':'13px 20px',fontSize:small?12:14,fontFamily:T.font,fontWeight:'bold',cursor:disabled?'not-allowed':'pointer',opacity:disabled?0.5:1,transition:'all .15s',width:fullWidth?'100%':'auto',minHeight:small?36:46,WebkitTapHighlightColor:'transparent',...style}}>{children}</button>
}
export const BigBtn = ({children,onClick,active=false,color=T.accent,disabled=false,style={}})=>(
  <button onClick={onClick} disabled={disabled} style={{background:active?color:`${color}18`,color:active?T.bg:color,border:`2px solid ${active?color:`${color}40`}`,borderRadius:12,padding:'12px 8px',fontSize:12,fontWeight:'bold',fontFamily:T.font,cursor:disabled?'not-allowed':'pointer',transition:'all .15s',minHeight:50,WebkitTapHighlightColor:'transparent',...style}}>{children}</button>
)
export const FormInput = ({label,value,onChange,type='text',options,placeholder,required})=>(
  <div style={{marginBottom:14}}>
    {label&&<label style={{display:'block',fontSize:11,color:T.muted,letterSpacing:1,marginBottom:5,textTransform:'uppercase'}}>{label}{required&&' *'}</label>}
    {options
      ?<select value={value} onChange={e=>onChange(e.target.value)} style={{width:'100%',background:T.card2,color:value?T.text:T.muted,border:`1px solid ${T.border}`,borderRadius:10,padding:'12px 14px',fontSize:15,fontFamily:T.font,appearance:'none',minHeight:46}}><option value="">— Seleccionar —</option>{options.map(o=><option key={o.value??o} value={o.value??o}>{o.label??o}</option>)}</select>
      :<input type={type} value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder} style={{width:'100%',background:T.card2,color:T.text,border:`1px solid ${T.border}`,borderRadius:10,padding:'12px 14px',fontSize:15,fontFamily:T.font,boxSizing:'border-box',minHeight:46}}/>
    }
  </div>
)
export const StatBox = ({label,value,sub,color=T.accent,small=false})=>(
  <Card style={{textAlign:'center',padding:small?'12px 8px':'16px 10px'}}>
    <div style={{fontSize:small?20:28,fontWeight:'bold',color,fontFamily:'monospace'}}>{value}</div>
    <div style={{fontSize:9,color:T.muted,marginTop:3,letterSpacing:1,textTransform:'uppercase'}}>{label}</div>
    {sub&&<div style={{fontSize:11,color:T.text,marginTop:2}}>{sub}</div>}
  </Card>
)
export const PctBar = ({value,color=T.accent,height=4})=>(
  <div style={{background:T.border,borderRadius:4,height,marginTop:4}}>
    <div style={{width:`${Math.min(value,100)}%`,background:color,borderRadius:4,height:'100%',transition:'width .4s'}}/>
  </div>
)
export const StatsTable = ({rows=[],emptyText='Sin datos'})=>{
  const active=rows.filter(r=>r.tiros>0||r.lanzamientos>0)
  if(!active.length) return <div style={{textAlign:'center',color:T.muted,padding:24,fontSize:12}}>{emptyText}</div>
  return(
    <div style={{overflowX:'auto',WebkitOverflowScrolling:'touch'}}>
      <table style={{width:'100%',borderCollapse:'collapse',fontSize:12,fontFamily:T.font,minWidth:360}}>
        <thead><tr style={{borderBottom:`1px solid ${T.border}`}}>
          {['','Tiros','Goles','Ataj.','% Gol','% Ataj.'].map(h=>(
            <th key={h} style={{padding:'8px 8px',color:T.muted,fontWeight:'normal',textAlign:h===''?'left':'center',whiteSpace:'nowrap'}}>{h}</th>
          ))}
        </tr></thead>
        <tbody>{active.map((r,i)=>(
          <tr key={i} style={{borderBottom:`1px solid ${T.border}22`}}>
            <td style={{padding:'10px 8px',color:T.text,fontWeight:'bold',whiteSpace:'nowrap'}}>{r.label}</td>
            <td style={{padding:'10px 8px',color:T.muted,textAlign:'center'}}>{r.tiros||r.lanzamientos||0}</td>
            <td style={{padding:'10px 8px',color:T.accent,textAlign:'center',fontWeight:'bold'}}>{r.goles}</td>
            <td style={{padding:'10px 8px',color:T.cyan,textAlign:'center'}}>{r.atajadas||r.paradas||0}</td>
            <td style={{padding:'10px 8px',textAlign:'center'}}><span style={{color:r.eficacia>=50?T.accent:T.warn,fontWeight:'bold'}}>{r.eficacia}%</span><PctBar value={r.eficacia} color={r.eficacia>=50?T.accent:T.warn}/></td>
            <td style={{padding:'10px 8px',textAlign:'center'}}><span style={{color:r.efectividad>=50?T.cyan:T.muted,fontWeight:'bold'}}>{r.efectividad}%</span><PctBar value={r.efectividad} color={T.cyan}/></td>
          </tr>
        ))}</tbody>
      </table>
    </div>
  )
}
export const Modal = ({children,onClose,title})=>(
  <div style={{position:'fixed',inset:0,background:'#000d',display:'flex',alignItems:'flex-end',justifyContent:'center',zIndex:1000}} onClick={e=>e.target===e.currentTarget&&onClose()}>
    <div style={{background:T.card,border:`1px solid ${T.border}`,borderRadius:'20px 20px 0 0',width:'100%',maxWidth:600,maxHeight:'92vh',overflowY:'auto',padding:20}}>
      <div style={{width:40,height:4,background:T.border,borderRadius:2,margin:'0 auto 16px'}}/>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:18}}>
        <h3 style={{margin:0,color:T.accent,fontSize:15,fontWeight:'bold'}}>{title}</h3>
        <button onClick={onClose} style={{background:'none',border:'none',color:T.muted,fontSize:22,cursor:'pointer',padding:'4px 8px'}}>×</button>
      </div>
      {children}
    </div>
  </div>
)
export const EmptyState = ({icon='📋',title,sub,action})=>(
  <Card style={{textAlign:'center',padding:48}}>
    <div style={{fontSize:44,marginBottom:12}}>{icon}</div>
    <div style={{fontSize:16,color:T.text,marginBottom:6}}>{title}</div>
    {sub&&<div style={{fontSize:13,color:T.muted,marginBottom:20}}>{sub}</div>}
    {action}
  </Card>
)
export const Badge = ({children,color=T.accent})=>(
  <span style={{background:`${color}22`,color,border:`1px solid ${color}44`,borderRadius:6,padding:'3px 8px',fontSize:11,fontWeight:'bold'}}>{children}</span>
)
