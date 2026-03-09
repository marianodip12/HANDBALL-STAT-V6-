import { useState } from 'react'
import { useMatch } from './context/MatchContext.jsx'
import { Header }       from './components/layout/Header.jsx'
import { T }            from './components/ui/index.jsx'
import { MatchesPage }  from './pages/MatchesPage.jsx'
import { TeamsPage }    from './pages/TeamsPage.jsx'
import { RegisterPage } from './pages/RegisterPage.jsx'
import { StatsPage }    from './pages/StatsPage.jsx'
import { SeasonPage }   from './pages/SeasonPage.jsx'

export default function App() {
  const { loading, error } = useMatch()
  const [tab, setTab] = useState('matches')

  if (loading) return (
    <div style={{height:'100vh',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',background:T.bg,gap:16}}>
      <div style={{fontSize:40}}>🤾</div>
      <div style={{color:T.accent,fontSize:14,letterSpacing:2}}>CARGANDO HANDBALL PRO...</div>
    </div>
  )

  if (error) return (
    <div style={{height:'100vh',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',background:T.bg,gap:16,padding:24,textAlign:'center'}}>
      <div style={{fontSize:40}}>⚠️</div>
      <div style={{color:T.red,fontSize:16}}>Error de conexión</div>
      <div style={{color:T.muted,fontSize:12,maxWidth:300}}>{error}</div>
      <button onClick={()=>window.location.reload()} style={{background:T.accent,color:T.bg,border:'none',borderRadius:12,padding:'14px 28px',fontSize:14,fontWeight:'bold',cursor:'pointer',marginTop:8}}>🔄 Reintentar</button>
    </div>
  )

  return (
    <div style={{background:T.bg,color:T.text,minHeight:'100vh',fontFamily:T.font}}>
      <Header tab={tab} setTab={setTab}/>
      <main style={{maxWidth:800,margin:'0 auto',padding:'16px 16px 100px'}}>
        {tab==='matches'  && <MatchesPage  setTab={setTab}/>}
        {tab==='teams'    && <TeamsPage/>}
        {tab==='register' && <RegisterPage/>}
        {tab==='stats'    && <StatsPage/>}
        {tab==='season'   && <SeasonPage/>}
      </main>
    </div>
  )
}
