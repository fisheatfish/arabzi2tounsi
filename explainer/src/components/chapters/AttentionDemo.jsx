import { useState } from 'react'

const TOKENS = ['ma', 'n9add', 'arch', 'el', '7ob', 'a']
const TOKEN_LABELS = {
  'ma': 'négation',
  'n9add': 'verbe',
  'arch': 'suffixe',
  'el': 'article',
  '7ob': 'nom',
  'a': 'suffixe',
}

// Pre-computed attention weights (row = query, col = key)
const ATTN = [
  [0.68, 0.12, 0.06, 0.06, 0.04, 0.04],
  [0.42, 0.28, 0.12, 0.08, 0.06, 0.04],
  [0.28, 0.32, 0.22, 0.08, 0.06, 0.04],
  [0.05, 0.05, 0.05, 0.55, 0.20, 0.10],
  [0.04, 0.04, 0.04, 0.22, 0.48, 0.18],
  [0.04, 0.04, 0.04, 0.18, 0.38, 0.32],
]

const DESCS = [
  '"ma" : se regarde surtout lui-même (0.68) — il est le début de la négation et n\'a pas besoin de contexte gauche.',
  '"n9add" : regarde fortement "ma" (0.42) — il sait qu\'il est nié par "ma" avant lui.',
  '"arch" : regarde "n9add" (0.32) et "ma" (0.28) — c\'est le suffixe négatif, lié aux deux tokens.',
  '"el" : regarde surtout lui-même (0.55) — début d\'un syntagme nominal indépendant.',
  '"7ob" : regarde "el" (0.22) — il s\'agit du nom précédé par l\'article.',
  '"a" : regarde "7ob" (0.38) — c\'est le suffixe de "7oba" (amour).',
]

function lerp(a, b, t) { return a + (b - a) * t }

function weightToColor(w) {
  // from white/light → dark purple
  const r = Math.round(lerp(255, 15, w))
  const g = Math.round(lerp(253, 10, w))
  const b = Math.round(lerp(245, 50, w))
  return { bg: `rgb(${r},${g},${b})`, text: w > 0.4 ? '#FFFDF5' : '#0f0f0f' }
}

export default function AttentionDemo() {
  const [activeRow, setActiveRow] = useState(1) // default: n9add
  const [activeCol, setActiveCol] = useState(null)

  const handleCell = (ri, ci) => {
    setActiveRow(ri)
    setActiveCol(ci)
  }

  return (
    <div className="space-y-5">
      {/* Matrix */}
      <div className="overflow-x-auto">
        <div className="inline-block">
          {/* Column headers */}
          <div className="flex">
            <div className="w-16" />
            {TOKENS.map((t, ci) => (
              <div
                key={ci}
                className="w-[50px] text-center text-xs font-black uppercase py-1"
                style={{ color: activeRow !== null && activeCol === ci ? '#FF6B6B' : '#0f0f0f' }}
              >
                {t}
              </div>
            ))}
            <div className="w-20 text-xs font-black text-center py-1 text-ink/40">rôle</div>
          </div>

          {/* Rows */}
          {TOKENS.map((rowT, ri) => {
            const isActiveRow = activeRow === ri
            return (
              <div key={ri} className="flex items-center mb-0.5">
                {/* Row label */}
                <div
                  className="w-16 text-right pr-2 text-xs font-black uppercase truncate"
                  style={{ color: isActiveRow ? '#FF6B6B' : '#0f0f0f' }}
                >
                  {rowT}
                </div>

                {ATTN[ri].map((w, ci) => {
                  const { bg, text } = weightToColor(w)
                  const isActive = activeRow === ri && activeCol === ci
                  return (
                    <div
                      key={ci}
                      className="attn-cell"
                      style={{
                        background: bg,
                        color: text,
                        border: isActive ? '3px solid #FF6B6B' : isActiveRow ? '2px solid #0f0f0f' : '1px solid rgba(15,15,15,0.2)',
                        boxShadow: isActive ? '4px 4px 0 0 #FF6B6B' : isActiveRow ? '2px 2px 0 0 #0f0f0f' : 'none',
                      }}
                      onClick={() => handleCell(ri, ci)}
                    >
                      {w.toFixed(2)}
                    </div>
                  )
                })}

                {/* Role badge */}
                <div
                  className="w-20 ml-1 text-xs font-bold px-1.5 py-0.5 border border-ink/20 text-center truncate"
                  style={{ background: isActiveRow ? '#FFD93D' : 'transparent' }}
                >
                  {TOKEN_LABELS[rowT]}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Description */}
      <div
        className="neo-card p-4 transition-all duration-300"
        style={{ borderLeft: '6px solid #FF6B6B' }}
      >
        <div className="text-xs font-black uppercase tracking-wider mb-2" style={{ color: '#FF6B6B' }}>
          → {TOKENS[activeRow]} regarde :
        </div>
        <p className="text-sm font-medium leading-relaxed">
          {DESCS[activeRow]}
        </p>

        {/* Bar chart of attention weights */}
        <div className="mt-3 space-y-1.5">
          {ATTN[activeRow].map((w, ci) => (
            <div key={ci} className="flex items-center gap-2 text-xs">
              <span className="w-14 font-black text-right">{TOKENS[ci]}</span>
              <div className="flex-1 h-4 border border-ink/20" style={{ background: '#f5f3eb' }}>
                <div
                  className="h-full transition-all duration-500"
                  style={{
                    width: `${w * 100}%`,
                    background: ci === activeCol ? '#FF6B6B' : '#0f0f0f',
                  }}
                />
              </div>
              <span className="w-10 font-mono font-bold">{(w * 100).toFixed(0)}%</span>
            </div>
          ))}
        </div>
      </div>

      {/* Multi-head note */}
      <div className="neo-card-dark p-4 text-sm">
        <span className="font-black" style={{ color: '#FFD93D' }}>SmolLM2-360M</span>
        <span className="text-cream/70"> utilise </span>
        <span className="font-black text-cream">15 têtes</span>
        <span className="text-cream/70"> d'attention en parallèle. Chacune apprend un aspect différent : syntaxe, négation, position, coréférence… Ce qui est affiché ici est </span>
        <span style={{ color: '#86EFAC' }} className="font-black">une tête simplifiée</span>
        <span className="text-cream/70"> pour l'exemple "ma n9addarch el 7oba".</span>
      </div>
    </div>
  )
}
