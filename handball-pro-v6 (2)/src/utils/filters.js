export const soloTiros      = evs => evs.filter(e => ['gol','tiro_errado','atajada'].includes(e.tipoEvento))
export const soloGoles      = evs => evs.filter(e => e.tipoEvento === 'gol')
export const porEquipo      = (evs, eq) => evs.filter(e => e.equipo === eq)
export const porJugador     = (evs, id) => evs.filter(e => e.jugadorId === id)
export const porArquero     = (evs, id) => evs.filter(e => e.arqueroId === id)
export const buildTimeline  = (evs, size=5) => {
  const b = {}
  evs.filter(e=>e.minuto!=null&&e.minuto!=='').forEach(e=>{
    const k = Math.floor(Number(e.minuto)/size)*size
    if(!b[k]) b[k]=[]
    b[k].push(e)
  })
  return Object.entries(b).sort(([a],[b])=>Number(a)-Number(b)).map(([min,eventos])=>({min:Number(min),eventos}))
}
