import { T } from '../ui/index.jsx'
import { useMatch } from '../../context/MatchContext.jsx'

const TABS = [
  {id:'matches',  icon:'🏆', label:'Partidos'},
  {id:'teams',    icon:'👕', label:'Equipos'},
  {id:'register', icon:'⚡', label:'Registrar', req:true},
  {id:'stats',    icon:'📊', label:'Stats',     req:true},
  {id:'season',   icon:'📅', label:'Temporada'},
]

export const Header = ({tab,setTab})=>{
  const {activeMatch} = useMatch()
  return(
    <>
      <header style={{background:T.card,borderBottom:`2px solid ${T.accent}`,position:'sticky',top:0,zIndex:100}}>
        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'10px 16px',maxWidth:800,margin:'0 auto'}}>
          <div style={{display:'flex',alignItems:'center',gap:8}}>
            <span style={{fontSize:22}}>🤾</span>
            <div>
              <div style={{fontSize:14,fontWeight:'bold',color:T.accent,letterSpacing:1}}>HANDBALL PRO</div>
              <div style={{fontSize:9,color:T.muted,letterSpacing:1}}>ANALYTICS V6</div>
            </div>
          </div>
          {activeMatch&&(
            <div style={{textAlign:'right'}}>
              <div style={{fontSize:11,color:T.muted}}>vs <span style={{color:T.cyan,fontWeight:'bold'}}>{activeMatch.rival}</span></div>
              <div style={{fontSize:10,color:T.muted}}>{activeMatch.fecha||''}</div>
            </div>
          )}
        </div>
      </header>
      <nav style={{position:'fixed',bottom:0,left:0,right:0,zIndex:100,background:T.card,borderTop:`1px solid ${T.border}`,display:'flex',alignItems:'stretch',paddingBottom:'env(safe-area-inset-bottom)'}}>
        {TABS.map(t=>{
          const disabled=t.req&&!activeMatch, active=tab===t.id
          return(
            <button key={t.id} disabled={disabled} onClick={()=>!disabled&&setTab(t.id)} style={{
              flex:1,background:'transparent',
              color:active?T.accent:disabled?`${T.muted}44`:T.muted,
              border:'none',padding:'10px 4px 8px',
              display:'flex',flexDirection:'column',alignItems:'center',gap:3,
              cursor:disabled?'not-allowed':'pointer',
              borderTop:active?`2px solid ${T.accent}`:'2px solid transparent',
              WebkitTapHighlightColor:'transparent',transition:'color .15s',
            }}>
              <span style={{fontSize:18}}>{t.icon}</span>
              <span style={{fontSize:9,fontWeight:active?'bold':'normal',letterSpacing:0.5}}>{t.label}</span>
            </button>
          )
        })}
      </nav>
    </>
  )
}
