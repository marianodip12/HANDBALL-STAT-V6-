import React from 'react'
import ReactDOM from 'react-dom/client'
import { MatchProvider } from './context/MatchContext.jsx'
import App from './App.jsx'
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode><MatchProvider><App/></MatchProvider></React.StrictMode>
)
