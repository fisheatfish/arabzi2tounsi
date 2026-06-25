import { useState } from 'react'

const LAYERS = [
  { name: 'q_proj', dim: '576×576', frozenParams: 331776, loraParams: 9216, desc: 'Projection Query — génère les vecteurs "question" de chaque token.' },
  { name: 'k_proj', dim: '576×576', frozenParams: 331776, loraParams: 9216, desc: 'Projection Key — génère les vecteurs "clé" répondant aux questions.' },
  { name: 'v_proj', dim: '576×576', frozenParams: 331776, loraParams: 9216, desc: 'Projection Value — génère les vecteurs de valeur pondérés par l\'attention.' },
  { name: 'o_proj', dim: '576×576', frozenParams: 331776, loraParams: 9216, desc: 'Projection Output — combine les sorties des 15 têtes.' },
]

export default function LoraDemo() {
  const [activeLayer, setActiveLayer] = useState(0)

  const totalFrozen = 360_000_000
  const totalLora = 16_384
  const pct = ((totalLora / totalFrozen) * 100).toFixed(4)

  const layer = LAYERS[activeLayer]

  return (
    <div className="space-y-5">
      {/* Big number */}
      <div className="neo-card p-5 flex flex-wrap gap-6 items-center">
        <div className="text-center">
          <div className="text-5xl font-black" style={{ color: '#FF6B6B' }}>16 K</div>
          <div className="text-xs font-bold uppercase tracking-wider mt-1">params entraînés</div>
        </div>
        <div className="text-3xl font-black text-ink/20">/</div>
        <div className="text-center">
          <div className="text-5xl font-black text-ink/30">360 M</div>
          <div className="text-xs font-bold uppercase tracking-wider mt-1">params totaux</div>
        </div>
        <div className="flex-1 min-w-40">
          <div className="text-sm font-bold mb-1">
            = <span className="text-2xl font-black" style={{ color: '#86EFAC' }}>0.0045 %</span>
          </div>
          <div className="text-xs text-ink/60">du modèle est modifié — le reste est <strong>gelé</strong>.</div>
          {/* Visual bar */}
          <div className="mt-2 h-5 border-2 border-ink flex overflow-hidden" title={`${pct}%`}>
            <div className="h-full" style={{ width: `${100 - Number(pct)}%`, background: '#e5e5e5' }} />
            <div className="h-full min-w-1" style={{ background: '#FF6B6B' }} />
          </div>
          <div className="flex justify-between text-xs mt-1 text-ink/50">
            <span>gelé (360M)</span>
            <span style={{ color: '#FF6B6B' }}>LoRA (16K)</span>
          </div>
        </div>
      </div>

      {/* Layer selector */}
      <div>
        <div className="text-xs font-black uppercase tracking-wider mb-2">Couches ciblées (× 32 blocs)</div>
        <div className="flex flex-wrap gap-2">
          {LAYERS.map((l, i) => (
            <button
              key={l.name}
              onClick={() => setActiveLayer(i)}
              className="neo-btn px-3 py-1.5 text-sm font-mono"
              style={{ background: activeLayer === i ? '#FFD93D' : '#fff' }}
            >
              {l.name}
            </button>
          ))}
        </div>
      </div>

      {/* Layer detail */}
      <div className="neo-card p-5 space-y-4">
        <div className="flex items-start justify-between flex-wrap gap-2">
          <div>
            <div className="font-black text-lg font-mono">{layer.name}</div>
            <div className="text-sm text-ink/60">{layer.desc}</div>
          </div>
          <div className="neo-badge rotate-1" style={{ background: '#C4B5FD' }}>{layer.dim}</div>
        </div>

        {/* Architecture visuelle */}
        <div className="flex items-center gap-3 flex-wrap">
          {/* Input */}
          <div className="neo-card-sm p-2 text-center text-xs font-black">
            <div className="text-lg font-black">x</div>
            <div className="text-ink/40">entrée</div>
          </div>
          <div className="text-ink/40 font-black">→</div>

          {/* Frozen W */}
          <div
            className="p-3 text-center text-xs font-black border-2 border-dashed border-ink/40"
            style={{ background: '#e5e7eb', minWidth: 80 }}
          >
            <div className="font-black">W</div>
            <div className="text-ink/50">{layer.dim}</div>
            <div
              className="mt-1 text-xs border border-ink/30 px-1"
              style={{ background: '#d1d5db' }}
            >
              gelé
            </div>
          </div>

          <div className="text-2xl font-black" style={{ color: '#86EFAC' }}>+</div>

          {/* LoRA A×B */}
          <div className="flex gap-1 items-center">
            <div
              className="p-3 text-center text-xs font-black border-2 border-ink"
              style={{ background: '#C4B5FD', boxShadow: '3px 3px 0 0 #0f0f0f' }}
            >
              <div className="font-black">A</div>
              <div>576×8</div>
              <div className="text-xs text-ink/60">4 608 p</div>
            </div>
            <div className="font-black text-sm">×</div>
            <div
              className="p-3 text-center text-xs font-black border-2 border-ink"
              style={{ background: '#FDB877', boxShadow: '3px 3px 0 0 #0f0f0f' }}
            >
              <div className="font-black">B</div>
              <div>8×576</div>
              <div className="text-xs text-ink/60">4 608 p</div>
            </div>
          </div>

          <div className="text-ink/40 font-black">→</div>
          <div className="neo-card-sm p-2 text-center text-xs font-black">
            <div className="text-lg font-black">y</div>
            <div className="text-ink/40">sortie</div>
          </div>
        </div>

        {/* Formula */}
        <div className="neo-card-dark p-4">
          <div className="font-mono text-sm leading-loose text-cream">
            <span style={{ color: '#86EFAC' }}>W_out</span>
            <span className="text-cream/60"> = W_frozen + </span>
            <span style={{ color: '#FFD93D' }}>(α/r)</span>
            <span className="text-cream/60"> × </span>
            <span style={{ color: '#C4B5FD' }}>A</span>
            <span className="text-cream/60"> × </span>
            <span style={{ color: '#FDB877' }}>B</span>
            <br />
            <span className="text-cream/40 text-xs">
              α=16, r=8 → scaling = 2.0 | B init à 0 → départ sans impact
            </span>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 text-center text-xs">
          {[
            { label: 'Rank r', val: '8' },
            { label: 'Alpha α', val: '16' },
            { label: 'Scaling α/r', val: '2.0' },
          ].map(s => (
            <div key={s.label} className="neo-card-sm p-2">
              <div className="text-2xl font-black" style={{ color: '#FF6B6B' }}>{s.val}</div>
              <div className="text-ink/50 uppercase tracking-wider">{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
