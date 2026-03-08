// ─── POSICIONES ───────────────────────────────────────────────────────────────
export const POSICIONES = [
  'Arquero', 'Extremo Izquierdo', 'Extremo Derecho',
  'Lateral Izquierdo', 'Lateral Derecho', 'Central', 'Pivote',
]

// ─── TIPOS DE EVENTO ─────────────────────────────────────────────────────────
export const TIPOS_EVENTO = {
  GOL:         'gol',
  TIRO_ERRADO: 'tiro_errado',
  ATAJADA:     'atajada',
  PERDIDA:     'perdida',
  RECUPERACION:'recuperacion',
  EXCLUSION:   'exclusion',
  TIMEOUT:     'timeout',
}

// ─── TIPOS DE GOL ────────────────────────────────────────────────────────────
export const TIPOS_GOL = {
  CAMPO:         'campo',
  CONTRAATAQUE:  'contraataque',
  SIETE_METROS:  '7m',
  CAMPO_A_CAMPO: 'campo_a_campo',
  NUEVE_METROS:  '9m',
}

// ─── RESULTADO ───────────────────────────────────────────────────────────────
export const RESULTADOS = {
  GOL:     'gol',
  ATAJADA: 'atajada',
  POSTE:   'poste',
  FUERA:   'fuera',
}

// ─── CONTEXTO TÁCTICO ────────────────────────────────────────────────────────
export const DISTANCIAS         = { SEIS:'6m', NUEVE:'9m', SIETE:'7m', CAMPO:'campo' }
export const ZONAS_ATAQUE       = { A:'A', B:'B', C:'C', D:'D', E:'E', F:'F' }
export const CUADRANTES         = { SUP_IZQ:'sup_izq', SUP_DER:'sup_der', INF_IZQ:'inf_izq', INF_DER:'inf_der', CENTRO:'centro' }
export const TIPOS_LANZAMIENTO  = { PENETRACION:'penetracion', FINTA:'finta', HABILIDAD:'habilidad', SALTO:'salto', APOYO:'apoyo' }
export const TIPOS_ATAQUE       = { CONTRAATAQUE:'contraataque', POSICIONAL:'posicional', CAMPO:'campo' }
export const SITUACIONES        = { IGUALDAD:'igualdad', SUPERIORIDAD:'superioridad', INFERIORIDAD:'inferioridad' }

// ─── LABELS ───────────────────────────────────────────────────────────────────
export const LABELS = {
  equipo:        { local:'Local', visitante:'Visitante' },
  tipoEvento: {
    gol:'Gol', tiro_errado:'Tiro Errado', atajada:'Atajada',
    perdida:'Pérdida', recuperacion:'Recuperación',
    exclusion:'Exclusión', timeout:'Time Out',
  },
  tipoGol: {
    campo:'Gol de Campo', contraataque:'Contraataque',
    '7m':'7 Metros', campo_a_campo:'Campo a Campo', '9m':'9 Metros',
  },
  resultado: { gol:'Gol ✅', atajada:'Atajada 🧤', poste:'Poste 🟡', fuera:'Fuera ❌' },
  distancia: { '6m':'6m', '9m':'9m', '7m':'Penal', campo:'Campo' },
  distanciaFull: { '6m':'6 Metros', '9m':'9 Metros', '7m':'Penal (7m)', campo:'Campo Contrario' },
  zonaAtaque: { A:'Ext.Izq', B:'Lat.Izq', C:'Cen.Izq', D:'Cen.Der', E:'Lat.Der', F:'Ext.Der' },
  zonaAtaqueFull: { A:'Extremo Izq.', B:'Lateral Izq.', C:'Central Izq.', D:'Central Der.', E:'Lateral Der.', F:'Extremo Der.' },
  cuadrante: { sup_izq:'↖ Sup.Izq', sup_der:'↗ Sup.Der', inf_izq:'↙ Inf.Izq', inf_der:'↘ Inf.Der', centro:'• Centro' },
  cuadranteFull: { sup_izq:'Superior Izquierdo', sup_der:'Superior Derecho', inf_izq:'Inferior Izquierdo', inf_der:'Inferior Derecho', centro:'Centro' },
  tipoLanzamiento: { penetracion:'Penetración', finta:'Finta', habilidad:'Habilidad', salto:'Salto', apoyo:'Apoyo' },
  tipoAtaque: { contraataque:'Contraataque', posicional:'Posicional', campo:'Campo' },
  situacion: { igualdad:'Igualdad (6v6)', superioridad:'Superioridad (7v6)', inferioridad:'Inferioridad (6v7)' },
  posicion: {
    'Arquero':'ARQ','Extremo Izquierdo':'EI','Extremo Derecho':'ED',
    'Lateral Izquierdo':'LI','Lateral Derecho':'LD','Central':'CE','Pivote':'PI',
  }
}

// ─── EMPTY FACTORIES ──────────────────────────────────────────────────────────
export const emptyEvento = () => ({
  equipo:'local', jugadorId:'', arqueroId:'',
  tipoEvento:'gol', tipoGol:'campo', resultado:'gol',
  posX:null, posY:null, zonaCancha:'',
  cuadrantePorteria:'', distancia:'6m', zonaAtaque:'',
  tipoAtaque:'posicional', situacionNumerica:'igualdad',
  tipoLanzamiento:'', minuto:'',
})
