export const pct         = (n, d)     => d > 0 ? Math.round((n / d) * 100) : 0
export const efectividad = (ata, gol) => pct(ata, ata + gol)
export const ratingColor = v => v >= 70 ? '#00ff87' : v >= 55 ? '#ffa502' : v >= 40 ? '#ff6b35' : '#ff4757'
export const ratingLabel = v => v >= 70 ? 'Excelente' : v >= 55 ? 'Bueno' : v >= 40 ? 'Regular' : 'Bajo'

export const buildStatsRow = (label, eventos) => {
  const tiros  = eventos.filter(e => e.tipoEvento === 'gol' || e.tipoEvento === 'tiro_errado' || e.tipoEvento === 'atajada')
  const goles  = eventos.filter(e => e.tipoEvento === 'gol').length
  const ataj   = eventos.filter(e => e.resultado === 'atajada' || e.tipoEvento === 'atajada').length
  const postes = eventos.filter(e => e.resultado === 'poste').length
  const fuera  = eventos.filter(e => e.resultado === 'fuera').length
  return { label, tiros:tiros.length, goles, atajadas:ataj, postes, fuera, alArco:goles+ataj, eficacia:pct(goles,tiros.length), efectividad:efectividad(ataj,goles) }
}
