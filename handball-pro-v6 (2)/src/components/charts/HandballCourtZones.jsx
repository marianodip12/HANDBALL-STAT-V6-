import { useState } from "react";

// ─── THEME ────────────────────────────────────────────────────────────────────
const T = {
  bg: "#060c18", card: "#0d1526", card2: "#111e35",
  accent: "#3b82f6", green: "#22c55e", red: "#ef4444", yellow: "#f59e0b",
  text: "#e2e8f0", muted: "#64748b", border: "#1a2d4a",
  font: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
};

// ─── DEMO DATA ────────────────────────────────────────────────────────────────
const DEMO_SHOTS = [
  { zone: "left_wing",  result: "goal",  player: "Pérez",     number: 7  },
  { zone: "left_wing",  result: "goal",  player: "Pérez",     number: 7  },
  { zone: "left_wing",  result: "miss",  player: "Rodríguez", number: 11 },
  { zone: "left_wing",  result: "saved", player: "Rodríguez", number: 11 },
  { zone: "left_back",  result: "goal",  player: "López",     number: 5  },
  { zone: "left_back",  result: "goal",  player: "López",     number: 5  },
  { zone: "left_back",  result: "goal",  player: "Fernández", number: 9  },
  { zone: "left_back",  result: "saved", player: "López",     number: 5  },
  { zone: "left_back",  result: "miss",  player: "Fernández", number: 9  },
  { zone: "center",     result: "goal",  player: "Martínez",  number: 10 },
  { zone: "center",     result: "goal",  player: "García",    number: 4  },
  { zone: "center",     result: "saved", player: "Martínez",  number: 10 },
  { zone: "center",     result: "saved", player: "García",    number: 4  },
  { zone: "center",     result: "miss",  player: "Martínez",  number: 10 },
  { zone: "right_back", result: "goal",  player: "García",    number: 4  },
  { zone: "right_back", result: "miss",  player: "Sosa",      number: 8  },
  { zone: "right_back", result: "miss",  player: "Sosa",      number: 8  },
  { zone: "right_back", result: "saved", player: "García",    number: 4  },
  { zone: "right_wing", result: "miss",  player: "Fernández", number: 9  },
  { zone: "right_wing", result: "miss",  player: "Fernández", number: 9  },
  { zone: "right_wing", result: "saved", player: "Ruiz",      number: 13 },
  { zone: "pivot",      result: "goal",  player: "Torres",    number: 6  },
  { zone: "pivot",      result: "goal",  player: "Torres",    number: 6  },
  { zone: "pivot",      result: "saved", player: "Torres",    number: 6  },
];

// ─── PRE-COMPUTED COURT GEOMETRY ──────────────────────────────────────────────
// Scale: 14px = 1m  |  Half-court: 20m × 20m  |  Goal at top (y = 0)
//
// Center of goal line: GX=140, GY=0
// 6m arc radius: GR=84   |  9m arc radius: FT=126
//
// Arc points — angle θ from positive-x axis, centre (140,0):
//   x = 140 + r·cos(θ)   y = r·sin(θ)   (θ=180° → left end, θ=0° → right end)
//
// 6m arc:
//   θ=180° → (56,  0)
//   θ=150° → (67,  42)   cos150°=−.866 sin150°=.5
//   θ=120° → (98,  73)   cos120°=−.5   sin120°=.866
//   θ= 90° → (140, 84)
//   θ= 60° → (182, 73)
//   θ= 30° → (213, 42)
//   θ=  0° → (224,  0)
//
// 9m arc:
//   θ=180° → (14,   0)
//   θ=150° → (31,  63)
//   θ=120° → (77, 109)
//   θ= 90° → (140,126)
//   θ= 60° → (203,109)
//   θ= 30° → (249, 63)
//   θ=  0° → (266,  0)
//
// SVG arc flags:
//   Main arcs (going clockwise on screen, from left to right through bottom):
//     sweep=1, large-arc=0 for arcs ≤ 180°
//   Return arcs (going back, counterclockwise):
//     sweep=0, large-arc=0

const ZONES = {
  left_wing: {
    label: "Extremo Izq.", shortLabel: "EI", emoji: "◀",
    color: "#06b6d4",
    // Goal line → 6m arc (150°→180°) → divider to 9m → 9m arc back (150°→180°) → close
    path: "M 0 0  L 56 0  A 84 84 0 0 1 67 42  L 31 63  A 126 126 0 0 0 14 0  Z",
    lx: 24, ly: 32,
  },
  left_back: {
    label: "Back Izq.", shortLabel: "LI", emoji: "↖",
    color: "#8b5cf6",
    // 6m arc (120°→150°) → divider down → 9m arc back (120°→150°) → close (divider up)
    path: "M 67 42  A 84 84 0 0 1 98 73  L 77 109  A 126 126 0 0 0 31 63  Z",
    lx: 57, ly: 73,
  },
  center: {
    label: "Central", shortLabel: "CE", emoji: "↑",
    color: "#f59e0b",
    // 6m arc (60°→120°) → divider right → 9m arc back (60°→120°) → close (divider left)
    path: "M 98 73  A 84 84 0 0 1 182 73  L 203 109  A 126 126 0 0 0 77 109  Z",
    lx: 140, ly: 90,
  },
  right_back: {
    label: "Back Der.", shortLabel: "LD", emoji: "↗",
    color: "#8b5cf6",
    // 6m arc (30°→60°) → divider down → 9m arc back (30°→60°) → close
    path: "M 182 73  A 84 84 0 0 1 213 42  L 249 63  A 126 126 0 0 0 203 109  Z",
    lx: 223, ly: 73,
  },
  right_wing: {
    label: "Extremo Der.", shortLabel: "ED", emoji: "▶",
    color: "#06b6d4",
    // Mirror of left_wing
    path: "M 280 0  L 224 0  A 84 84 0 0 0 213 42  L 249 63  A 126 126 0 0 1 266 0  Z",
    lx: 256, ly: 32,
  },
  pivot: {
    label: "Pivote", shortLabel: "PI", emoji: "⬟",
    color: "#ef4444",
    // Slice inside 6m arc, between 60°–120° (centre forward area)
    path: "M 98 73  A 84 84 0 0 1 182 73  L 140 0  Z",
    lx: 140, ly: 52,
  },
};

// ─── STATS CALCULATOR ─────────────────────────────────────────────────────────
function calcStats(shots) {
  return Object.keys(ZONES).reduce((acc, z) => {
    const zs = shots.filter(s => s.zone === z);
    const goals = zs.filter(s => s.result === "goal").length;
    const saved = zs.filter(s => s.result === "saved").length;
    const miss  = zs.filter(s => s.result === "miss").length;
    acc[z] = { goals, saved, miss, total: zs.length,
               pct: zs.length ? Math.round(goals / zs.length * 100) : 0 };
    return acc;
  }, {});
}

// ─── HEAT OVERLAY ─────────────────────────────────────────────────────────────
function heatFill(value, max, mode) {
  if (!value || !max) return "rgba(0,0,0,0)";
  const alpha = Math.min(0.78, 0.18 + (value / max) * 0.60);
  const cols = { goals:"34,197,94", saved:"96,165,250", miss:"239,68,68", total:"245,158,11" };
  return `rgba(${cols[mode] || cols.total},${alpha})`;
}

// ─── COURT SVG ────────────────────────────────────────────────────────────────
function CourtSVG({ stats, mode, selected, onSelect }) {
  const [hov, setHov] = useState(null);

  const maxVal = Math.max(
    ...Object.values(stats).map(z =>
      mode==="goals"?z.goals : mode==="saved"?z.saved : mode==="miss"?z.miss : z.total
    ), 1
  );
  const getVal = k => mode==="goals"?stats[k]?.goals : mode==="saved"?stats[k]?.saved :
                      mode==="miss" ?stats[k]?.miss  : stats[k]?.total;

  const modeColor = { goals:T.green, saved:"#93c5fd", miss:T.red, total:T.yellow }[mode];

  // ViewBox: CW=280, CH=280 (half-court), plus 24px above for goal, 8px padding around
  return (
    <svg
      viewBox="-10 -32 300 322"
      width="100%"
      preserveAspectRatio="xMidYMid meet"
      style={{ display:"block", maxWidth:340, margin:"0 auto" }}
    >
      {/* ── OUTER SURROUND (stadium wall) ── */}
      <rect x="-10" y="-32" width="300" height="322" fill="#0f2a5a" rx="10"/>

      {/* ── COURT FLOOR (bright blue) ── */}
      <rect x="0" y="0" width="280" height="280" fill="#2196c4" rx="5"/>

      {/* ── 6m GOAL AREA (dark blue filled semicircle) ── */}
      {/* Filled region: M 56,0 arc to 224,0 then line back */}
      <path d="M 56 0  A 84 84 0 0 1 224 0  Z" fill="#1565a0"/>

      {/* ── ZONE HEAT OVERLAYS ── */}
      {Object.entries(ZONES).map(([key, zone]) => {
        const val  = getVal(key);
        const isSel = selected === key;
        const isHov = hov === key;
        return (
          <path
            key={key}
            d={zone.path}
            fill={heatFill(val, maxVal, mode)}
            stroke={isSel ? "#fff" : isHov ? "rgba(255,255,255,0.7)" : "transparent"}
            strokeWidth={isSel ? 2.5 : 1.5}
            style={{ cursor:"pointer", transition:"all .15s" }}
            onMouseEnter={() => setHov(key)}
            onMouseLeave={() => setHov(null)}
            onClick={() => onSelect(key)}
          />
        );
      })}

      {/* ── WHITE COURT LINES (drawn on top of overlays) ── */}

      {/* Court outline */}
      <rect x="0" y="0" width="280" height="280" fill="none"
        stroke="white" strokeWidth="2.5" rx="5"/>

      {/* 6m solid arc */}
      <path d="M 56 0  A 84 84 0 0 1 224 0"
        fill="none" stroke="white" strokeWidth="2.5"/>

      {/* 9m dashed arc */}
      <path d="M 14 0  A 126 126 0 0 1 266 0"
        fill="none" stroke="white" strokeWidth="2" strokeDasharray="8 5" opacity="0.9"/>

      {/* Zone divider lines — white, drawn explicitly for crispness */}
      {/* Left wing / Left back divider: (67,42)→(31,63) */}
      <line x1="67" y1="42" x2="31" y2="63" stroke="white" strokeWidth="1.5" opacity="0.7"/>
      {/* Left back / Center divider: (98,73)→(77,109) */}
      <line x1="98" y1="73" x2="77" y2="109" stroke="white" strokeWidth="1.5" opacity="0.7"/>
      {/* Center / Right back divider: (182,73)→(203,109) */}
      <line x1="182" y1="73" x2="203" y2="109" stroke="white" strokeWidth="1.5" opacity="0.7"/>
      {/* Right back / Right wing divider: (213,42)→(249,63) */}
      <line x1="213" y1="42" x2="249" y2="63" stroke="white" strokeWidth="1.5" opacity="0.7"/>
      {/* Pivot dividers (inside 6m): (98,73)→(140,0) and (182,73)→(140,0) */}
      <line x1="98"  y1="73" x2="140" y2="0" stroke="white" strokeWidth="1.2" opacity="0.5" strokeDasharray="4 3"/>
      <line x1="182" y1="73" x2="140" y2="0" stroke="white" strokeWidth="1.2" opacity="0.5" strokeDasharray="4 3"/>

      {/* 7m penalty spot */}
      <circle cx="140" cy="98" r="3.5" fill="white"/>
      {/* Centre line hint */}
      <line x1="0" y1="280" x2="280" y2="280"
        stroke="white" strokeWidth="1.5" opacity="0.4" strokeDasharray="8 5"/>

      {/* ── GOAL BOX ── */}
      <rect x="119" y="-24" width="42" height="24"
        fill="#081220" stroke="white" strokeWidth="2.5" rx="3"/>
      {/* Horizontal net line */}
      <line x1="119" y1="-12" x2="161" y2="-12" stroke="rgba(255,255,255,0.25)" strokeWidth="1"/>
      {/* Vertical net lines */}
      <line x1="133" y1="-24" x2="133" y2="0" stroke="rgba(255,255,255,0.15)" strokeWidth="1"/>
      <line x1="147" y1="-24" x2="147" y2="0" stroke="rgba(255,255,255,0.15)" strokeWidth="1"/>
      <text x="140" y="-9" textAnchor="middle"
        fill="rgba(255,255,255,0.5)" fontSize="6.5" fontWeight="700" letterSpacing="1">ARCO</text>

      {/* ── ZONE LABELS & VALUES ── */}
      {Object.entries(ZONES).map(([key, zone]) => {
        const val = getVal(key);
        const z   = stats[key];
        if (!z) return null;
        return (
          <g key={`lbl-${key}`} style={{ pointerEvents:"none" }}>
            <text x={zone.lx} y={zone.ly - 6} textAnchor="middle"
              fill="rgba(255,255,255,0.8)" fontSize="8.5" fontWeight="600">
              {zone.shortLabel}
            </text>
            {val > 0 && (
              <text x={zone.lx} y={zone.ly + 12} textAnchor="middle"
                fill={modeColor} fontSize="19" fontWeight="900"
                style={{ filter:"drop-shadow(0 1px 5px rgba(0,0,0,0.9))" }}>
                {val}
              </text>
            )}
          </g>
        );
      })}

      {/* ── DISTANCE TICKS ── */}
      <line x1="284" y1="0" x2="284" y2="84" stroke="rgba(255,255,255,0.3)" strokeWidth="1"/>
      <text x="288" y="44" fill="rgba(255,255,255,0.35)" fontSize="7.5">6m</text>
      <line x1="284" y1="86" x2="284" y2="126" stroke="rgba(255,255,255,0.2)"
        strokeWidth="1" strokeDasharray="3 2"/>
      <text x="288" y="116" fill="rgba(255,255,255,0.25)" fontSize="7.5">9m</text>
    </svg>
  );
}

// ─── PLAYER AVATAR ────────────────────────────────────────────────────────────
function PlayerAvatar({ player, number, result }) {
  const colors = { goal:"#22c55e", saved:"#60a5fa", miss:"#ef4444" };
  const icons  = { goal:"⚽", saved:"🧤", miss:"❌" };
  const c = colors[result];
  return (
    <div style={{ display:"flex", alignItems:"center", gap:10, padding:"9px 12px",
      background:c+"0f", borderRadius:10, border:`1px solid ${c}28` }}>
      {/* Avatar circle */}
      <div style={{ width:34, height:34, borderRadius:"50%", background:c+"22",
        border:`2px solid ${c}55`, display:"flex", alignItems:"center",
        justifyContent:"center", flexShrink:0 }}>
        <span style={{ fontSize:12, fontWeight:800, color:c }}>
          {number ? `#${number}` : player?.[0]?.toUpperCase()}
        </span>
      </div>
      {/* Name */}
      <div style={{ flex:1, minWidth:0 }}>
        <div style={{ fontSize:13, fontWeight:700, color:T.text,
          whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>
          {player || "Jugador"}
        </div>
        <div style={{ fontSize:10, color:T.muted, marginTop:1 }}>
          {result==="goal"?"Convirtió el gol":result==="saved"?"Lo atajaron":"Erró el tiro"}
        </div>
      </div>
      {/* Result badge */}
      <span style={{ fontSize:16 }}>{icons[result]}</span>
    </div>
  );
}

// ─── ZONE DETAIL CARD ─────────────────────────────────────────────────────────
function ZoneDetail({ zoneKey, stats, allShots }) {
  const [tab, setTab] = useState("goals");
  if (!zoneKey || !stats[zoneKey]) return null;

  const z    = stats[zoneKey];
  const zone = ZONES[zoneKey];
  const pG = z.total ? (z.goals / z.total * 100).toFixed(0) : 0;
  const pS = z.total ? (z.saved / z.total * 100).toFixed(0) : 0;
  const pM = z.total ? (z.miss  / z.total * 100).toFixed(0) : 0;

  // Shots for this zone, grouped
  const zoneShots = allShots.filter(s => s.zone === zoneKey);
  const byResult  = {
    goals: zoneShots.filter(s => s.result === "goal"),
    saved: zoneShots.filter(s => s.result === "saved"),
    miss:  zoneShots.filter(s => s.result === "miss"),
  };

  // Per-player summary for this zone
  const playerMap = {};
  zoneShots.forEach(s => {
    const key = s.player || "Desconocido";
    if (!playerMap[key]) playerMap[key] = { player:s.player, number:s.number, goals:0, saved:0, miss:0 };
    playerMap[key][s.result === "goal" ? "goals" : s.result === "saved" ? "saved" : "miss"]++;
  });
  const playerList = Object.values(playerMap).sort((a,b) => b.goals - a.goals);

  const tabs = [
    { key:"goals", label:"⚽ Goles",    color:T.green,   shots: byResult.goals },
    { key:"saved", label:"🧤 Atajados", color:"#60a5fa", shots: byResult.saved },
    { key:"miss",  label:"❌ Errados",  color:T.red,     shots: byResult.miss  },
    { key:"players", label:"👤 Jugadores", color:T.yellow, shots: [] },
  ];
  const activeTab = tabs.find(t => t.key === tab);

  return (
    <div style={{ background:T.card2, borderRadius:14, border:`1px solid ${zone.color}44`,
      marginTop:12, overflow:"hidden",
      animation:"pop .22s cubic-bezier(.34,1.56,.64,1)" }}>
      <style>{`@keyframes pop{from{opacity:0;transform:scale(.96)}to{opacity:1;transform:scale(1)}}`}</style>

      {/* Header */}
      <div style={{ padding:"14px 16px 12px", borderBottom:`1px solid ${T.border}` }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:12 }}>
          <span style={{ fontWeight:800, fontSize:15, color:zone.color }}>
            {zone.emoji} {zone.label}
          </span>
          <span style={{ fontSize:11, color:T.muted }}>{z.total} tiros</span>
        </div>

        {/* KPI mini row */}
        <div style={{ display:"flex", gap:8 }}>
          {[
            { l:"Goles",    v:z.goals, p:pG, c:T.green    },
            { l:"Atajados", v:z.saved, p:pS, c:"#60a5fa"  },
            { l:"Errados",  v:z.miss,  p:pM, c:T.red      },
          ].map(i => (
            <div key={i.l} style={{ flex:1, textAlign:"center", borderRadius:9, padding:"8px 4px",
              background:i.c+"12", border:`1px solid ${i.c}28` }}>
              <div style={{ fontSize:20, fontWeight:800, color:i.c, lineHeight:1 }}>{i.v}</div>
              <div style={{ fontSize:9, color:T.muted, margin:"2px 0" }}>{i.l}</div>
              <div style={{ fontSize:10, fontWeight:700, color:i.c }}>{i.p}%</div>
            </div>
          ))}
        </div>

        {/* Progress bar */}
        <div style={{ height:5, borderRadius:3, display:"flex", overflow:"hidden",
          background:T.border, marginTop:10 }}>
          <div style={{ width:`${pG}%`, background:T.green,  transition:"width .5s" }}/>
          <div style={{ width:`${pS}%`, background:"#60a5fa",transition:"width .5s" }}/>
          <div style={{ width:`${pM}%`, background:T.red,    transition:"width .5s" }}/>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display:"flex", borderBottom:`1px solid ${T.border}` }}>
        {tabs.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            style={{ flex:1, background:"transparent", border:"none",
              borderBottom:`2px solid ${tab===t.key ? t.color : "transparent"}`,
              color:tab===t.key ? t.color : T.muted,
              padding:"10px 4px", fontSize:10, fontWeight:700,
              cursor:"pointer", transition:"all .15s" }}>
            {t.label}
            {t.key !== "players" && (
              <span style={{ marginLeft:4, background:t.color+"22",
                color:t.color, borderRadius:10, padding:"1px 6px", fontSize:9 }}>
                {t.shots.length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div style={{ padding:"12px 14px", minHeight:100 }}>

        {/* Goals / Saved / Miss — list of player shots */}
        {tab !== "players" && (
          activeTab.shots.length === 0
            ? <div style={{ textAlign:"center", padding:"20px 0", color:T.muted, fontSize:12 }}>
                Sin registros en esta categoría
              </div>
            : <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
                {activeTab.shots.map((s, i) => (
                  <PlayerAvatar key={i} player={s.player} number={s.number} result={s.result}/>
                ))}
              </div>
        )}

        {/* Players summary */}
        {tab === "players" && (
          playerList.length === 0
            ? <div style={{ textAlign:"center", padding:"20px 0", color:T.muted, fontSize:12 }}>
                Sin datos de jugadores
              </div>
            : <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
                {playerList.map((p, i) => {
                  const total = p.goals + p.saved + p.miss;
                  const pct   = total ? Math.round(p.goals / total * 100) : 0;
                  return (
                    <div key={i} style={{ background:T.card, borderRadius:10,
                      padding:"10px 12px", border:`1px solid ${T.border}` }}>
                      <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:8 }}>
                        <div style={{ width:32, height:32, borderRadius:"50%",
                          background:`${T.accent}22`, border:`2px solid ${T.accent}44`,
                          display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                          <span style={{ fontSize:11, fontWeight:800, color:T.accent }}>
                            {p.number ? `#${p.number}` : p.player?.[0]}
                          </span>
                        </div>
                        <div style={{ flex:1 }}>
                          <div style={{ fontSize:13, fontWeight:700, color:T.text }}>{p.player}</div>
                          <div style={{ fontSize:10, color:T.muted }}>{total} tiros · {pct}% conversión</div>
                        </div>
                        {/* Mini pills */}
                        <div style={{ display:"flex", gap:5 }}>
                          {p.goals > 0  && <span style={{ background:`${T.green}20`, color:T.green,
                            border:`1px solid ${T.green}40`, borderRadius:8, padding:"2px 7px",
                            fontSize:11, fontWeight:700 }}>⚽{p.goals}</span>}
                          {p.saved > 0  && <span style={{ background:"#60a5fa20", color:"#60a5fa",
                            border:"1px solid #60a5fa40", borderRadius:8, padding:"2px 7px",
                            fontSize:11, fontWeight:700 }}>🧤{p.saved}</span>}
                          {p.miss > 0   && <span style={{ background:`${T.red}20`, color:T.red,
                            border:`1px solid ${T.red}40`, borderRadius:8, padding:"2px 7px",
                            fontSize:11, fontWeight:700 }}>❌{p.miss}</span>}
                        </div>
                      </div>
                      {/* Mini progress bar */}
                      <div style={{ height:4, borderRadius:2, display:"flex",
                        overflow:"hidden", background:T.border }}>
                        <div style={{ width:`${total?p.goals/total*100:0}%`, background:T.green }}/>
                        <div style={{ width:`${total?p.saved/total*100:0}%`, background:"#60a5fa" }}/>
                        <div style={{ width:`${total?p.miss/total*100:0}%`,  background:T.red }}/>
                      </div>
                    </div>
                  );
                })}
              </div>
        )}
      </div>
    </div>
  );
}

// ─── RANKING ──────────────────────────────────────────────────────────────────
function Ranking({ stats, mode }) {
  const color = { goals:T.green, saved:"#60a5fa", miss:T.red, total:T.yellow }[mode];
  const getV  = z => mode==="goals"?z.goals : mode==="saved"?z.saved : mode==="miss"?z.miss : z.total;
  const sorted = Object.entries(stats)
    .map(([k,v]) => ({ key:k, zone:ZONES[k], ...v }))
    .filter(z => z.total > 0)
    .sort((a,b) => getV(b) - getV(a));
  const max = Math.max(...sorted.map(getV), 1);

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:9 }}>
      {sorted.map((z, i) => (
        <div key={z.key} style={{ display:"flex", alignItems:"center", gap:10 }}>
          <div style={{ width:22, textAlign:"center",
            fontSize:i<3?14:11, color:i<3?T.yellow:T.muted, fontWeight:700 }}>
            {["🥇","🥈","🥉"][i] ?? `${i+1}`}
          </div>
          <div style={{ flex:1 }}>
            <div style={{ display:"flex", justifyContent:"space-between", marginBottom:3 }}>
              <span style={{ fontSize:12, fontWeight:600, color:T.text }}>
                {z.zone.emoji} {z.zone.label}
              </span>
              <span style={{ fontSize:13, fontWeight:800, color }}>{getV(z)}</span>
            </div>
            <div style={{ height:5, borderRadius:3, background:T.border, overflow:"hidden" }}>
              <div style={{ width:`${getV(z)/max*100}%`, height:"100%",
                background:color, borderRadius:3, transition:"width .5s" }}/>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── MAIN ─────────────────────────────────────────────────────────────────────
export default function HandballCourtZones({ shots = DEMO_SHOTS }) {
  const [mode,     setMode]     = useState("goals");
  const [selected, setSelected] = useState(null);
  const stats = calcStats(shots);

  const totals = Object.values(stats).reduce(
    (a,z) => ({ goals:a.goals+z.goals, saved:a.saved+z.saved, miss:a.miss+z.miss, total:a.total+z.total }),
    { goals:0, saved:0, miss:0, total:0 }
  );
  const conv = totals.total ? Math.round(totals.goals/totals.total*100) : 0;

  const modes = [
    { key:"goals", label:"⚽ Goles",    color:T.green   },
    { key:"saved", label:"🧤 Atajados", color:"#60a5fa" },
    { key:"miss",  label:"❌ Errados",  color:T.red     },
    { key:"total", label:"📊 Total",    color:T.yellow  },
  ];

  return (
    <div style={{ fontFamily:T.font, color:T.text }}>

      {/* Header */}
      <div style={{ marginBottom:18 }}>
        <div style={{ fontSize:11, color:T.accent, letterSpacing:3,
          textTransform:"uppercase", marginBottom:4 }}>Análisis Táctico</div>
        <div style={{ fontSize:22, fontWeight:800 }}>Zonas de Ataque</div>
        <div style={{ fontSize:12, color:T.muted, marginTop:2 }}>
          Tocá una zona para ver el detalle
        </div>
      </div>

      {/* KPIs */}
      <div style={{ display:"flex", gap:8, marginBottom:18 }}>
        {[
          { l:"Tiros",    v:totals.total,  c:T.text   },
          { l:"Goles",    v:totals.goals,  c:T.green  },
          { l:"Conv.",    v:`${conv}%`,    c:conv>=50?T.green:T.yellow },
          { l:"Atajados", v:totals.saved,  c:"#60a5fa"},
        ].map(k => (
          <div key={k.l} style={{ flex:1, background:T.card, borderRadius:10,
            padding:"10px 6px", border:`1px solid ${T.border}`, textAlign:"center" }}>
            <div style={{ fontSize:20, fontWeight:800, color:k.c, lineHeight:1 }}>{k.v}</div>
            <div style={{ fontSize:10, color:T.muted, marginTop:3 }}>{k.l}</div>
          </div>
        ))}
      </div>

      {/* Mode pills */}
      <div style={{ display:"flex", gap:6, marginBottom:14 }}>
        {modes.map(m => (
          <button key={m.key} onClick={() => setMode(m.key)}
            style={{ flex:1, background:mode===m.key?m.color+"28":T.card,
              color:mode===m.key?m.color:T.muted,
              border:`1px solid ${mode===m.key?m.color:T.border}`,
              borderRadius:9, padding:"8px 2px", fontSize:11, fontWeight:700,
              cursor:"pointer", transition:"all .2s", whiteSpace:"nowrap" }}>
            {m.label}
          </button>
        ))}
      </div>

      {/* Court */}
      <div style={{ background:"#0f2a5a", borderRadius:16, padding:"14px 12px",
        border:"1px solid #1e407a" }}>
        <CourtSVG
          stats={stats} mode={mode} selected={selected}
          onSelect={k => setSelected(selected===k ? null : k)}
        />
        {/* Legend */}
        <div style={{ display:"flex", justifyContent:"center", gap:20, marginTop:12,
          fontSize:10, color:"rgba(255,255,255,0.38)" }}>
          <span style={{ display:"flex", alignItems:"center", gap:5 }}>
            <svg width="18" height="6"><line x1="0" y1="3" x2="18" y2="3" stroke="white" strokeWidth="2"/></svg>
            Área 6m
          </span>
          <span style={{ display:"flex", alignItems:"center", gap:5 }}>
            <svg width="18" height="6">
              <line x1="0" y1="3" x2="18" y2="3" stroke="white" strokeWidth="2" strokeDasharray="5 3"/>
            </svg>
            Línea 9m
          </span>
          <span>● Penal 7m</span>
        </div>
      </div>

      {/* Zone detail */}
      <ZoneDetail zoneKey={selected} stats={stats} allShots={shots}/>

      {/* Ranking */}
      <div style={{ background:T.card, borderRadius:14, padding:16,
        border:`1px solid ${T.border}`, marginTop:16 }}>
        <div style={{ fontWeight:700, fontSize:13, marginBottom:14 }}>
          Ranking — {modes.find(m => m.key===mode)?.label}
        </div>
        <Ranking stats={stats} mode={mode}/>
      </div>
    </div>
  );
}
