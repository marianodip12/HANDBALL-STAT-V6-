export const generatePlayerAnalysis = (p) => {
  const insights = []
  if (!p || !p.tiros) return insights
  if (p.goles >= 5)   insights.push(`🔥 Partido excepcional: ${p.goles} goles`)
  if (p.eficacia >= 80) insights.push(`🎯 Eficacia elite: ${p.eficacia}% en ${p.tiros} tiros`)
  else if (p.eficacia >= 60) insights.push(`✅ Buena eficacia ofensiva (${p.eficacia}%)`)
  if (p.exclusiones >= 2) insights.push(`⚠️ ${p.exclusiones} exclusiones — alto riesgo disciplinario`)
  if (p.perdidas >= 3) insights.push(`💨 ${p.perdidas} pérdidas — mejorar control de balón`)
  if (p.tiros >= 8 && p.eficacia < 40) insights.push(`📉 Bajo rendimiento en ${p.tiros} intentos`)
  return insights
}
