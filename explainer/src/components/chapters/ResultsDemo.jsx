const BASE_PREDS = [
  { input: 'sbeh el khir', output: 'sbeh el khir', cer: 1.0, type: 'copy' },
  { input: 'kifeh 7alek', output: 'kifeh 7alek...', cer: 1.1, type: 'copy' },
  { input: 'nheb nrou7', output: 'nheb nrou7...', cer: 1.2, type: 'halluc' },
  { input: 'ma n9addarch', output: 'je ne peux pas', cer: 0.9, type: 'lang' },
  { input: 'merci barcha', output: 'merci barcha!!', cer: 0.8, type: 'copy' },
  { input: 'bislema', output: 'bisléma (arab…)', cer: 1.4, type: 'halluc' },
]

const TUNED_PREDS = [
  { input: 'sbeh el khir', output: 'صباح الخير', cer: 0.0, correct: true },
  { input: 'kifeh 7alek', output: 'كيفاش حالك', cer: 0.0, correct: true },
  { input: 'nheb nrou7', output: 'نحب نروح', cer: 0.05, correct: true },
  { input: 'ma n9addarch', output: 'ما نكدرش', cer: 0.18, correct: false, note: 'خ→ك' },
  { input: 'merci barcha', output: 'مرسي برشا', cer: 0.0, correct: true },
  { input: 'bislema', output: 'بالسلامة', cer: 0.12, correct: true },
]

function typeLabel(t) {
  if (t === 'copy') return { label: 'recopie', bg: '#e5e7eb' }
  if (t === 'halluc') return { label: 'hallucination', bg: '#FDB877' }
  if (t === 'lang') return { label: 'mauvaise langue', bg: '#FF6B6B', text: '#fff' }
  return {}
}

function CerBar({ cer, max = 1.5 }) {
  const w = Math.min(cer / max, 1) * 100
  const color = cer > 0.5 ? '#FF6B6B' : cer > 0.15 ? '#FFD93D' : '#86EFAC'
  return (
    <div className="flex items-center gap-2 text-xs mt-1">
      <div className="flex-1 h-2 border border-ink/20" style={{ background: '#f5f3eb' }}>
        <div className="h-full transition-all" style={{ width: `${w}%`, background: color }} />
      </div>
      <span className="font-mono font-black w-10 text-right" style={{ color }}>{cer.toFixed(2)}</span>
    </div>
  )
}

export default function ResultsDemo() {
  return (
    <div className="space-y-6">
      {/* Summary cards */}
      <div className="grid grid-cols-2 gap-4">
        <div className="neo-card p-4">
          <div className="neo-badge mb-3 rotate-1 inline-block" style={{ background: '#FF6B6B', color: '#fff' }}>
            Modèle de base
          </div>
          <div className="text-5xl font-black" style={{ color: '#FF6B6B' }}>2.72</div>
          <div className="text-sm font-bold text-ink/60 mt-1">CER moyen</div>
          <div className="mt-2 text-sm font-bold">
            <span style={{ color: '#FF6B6B' }}>0</span>
            <span className="text-ink/50"> / 135 exact match</span>
          </div>
        </div>
        <div className="neo-card p-4">
          <div className="neo-badge mb-3 -rotate-1 inline-block" style={{ background: '#86EFAC' }}>
            Fine-tuné (LoRA)
          </div>
          <div className="text-5xl font-black" style={{ color: '#86EFAC' }}>0.26</div>
          <div className="text-sm font-bold text-ink/60 mt-1">CER moyen</div>
          <div className="mt-2 text-sm font-bold">
            <span style={{ color: '#86EFAC' }}>14</span>
            <span className="text-ink/50"> / 135 exact match</span>
          </div>
        </div>
      </div>

      {/* Side-by-side predictions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Base model */}
        <div>
          <div className="font-black text-sm uppercase tracking-wider mb-2" style={{ color: '#FF6B6B' }}>
            Avant fine-tuning
          </div>
          <div className="neo-card overflow-hidden">
            {BASE_PREDS.map((p, i) => {
              const t = typeLabel(p.type)
              return (
                <div key={i} className="px-3 py-2 border-b border-ink/10 last:border-0">
                  <div className="flex justify-between items-start gap-2">
                    <span className="font-mono font-bold text-sm" style={{ color: '#FF6B6B' }}>{p.input}</span>
                    {t.label && (
                      <span
                        className="text-xs font-bold px-1.5 py-0.5 shrink-0"
                        style={{ background: t.bg, color: t.text || '#0f0f0f', border: '1px solid #0f0f0f' }}
                      >
                        {t.label}
                      </span>
                    )}
                  </div>
                  <div className="font-mono text-sm mt-0.5 text-ink/50">{p.output}</div>
                  <CerBar cer={p.cer} />
                </div>
              )
            })}
          </div>
        </div>

        {/* Fine-tuned */}
        <div>
          <div className="font-black text-sm uppercase tracking-wider mb-2" style={{ color: '#86EFAC' }}>
            Après fine-tuning
          </div>
          <div className="neo-card overflow-hidden">
            {TUNED_PREDS.map((p, i) => (
              <div key={i} className="px-3 py-2 border-b border-ink/10 last:border-0">
                <div className="flex justify-between items-start gap-2">
                  <span className="font-mono font-bold text-sm" style={{ color: '#86EFAC' }}>{p.input}</span>
                  {!p.correct && p.note && (
                    <span
                      className="text-xs font-bold px-1.5 py-0.5 shrink-0"
                      style={{ background: '#FFD93D', border: '1px solid #0f0f0f' }}
                    >
                      {p.note}
                    </span>
                  )}
                </div>
                <div
                  className="font-mono text-sm mt-0.5 arabic"
                  style={{ color: p.correct ? '#86EFAC' : '#FFD93D' }}
                >
                  {p.output}
                </div>
                <CerBar cer={p.cer} />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Error analysis */}
      <div className="neo-card-dark p-5">
        <div className="font-black text-sm uppercase tracking-wider mb-3" style={{ color: '#FFD93D' }}>
          Analyse des erreurs résiduelles
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
          {[
            { error: 'خ ↔ ك', label: 'kh vs k', ex: 'n9addarch → نكدرش vs نخدرش', freq: 'fréquent' },
            { error: 'ن ↔ ع', label: 'n vs ayn', ex: 'ana → أنا vs أعا', freq: 'occasionnel' },
            { error: 'Shadda oublié', label: 'géminées', ex: 'chkoun → شكون vs شكّون', freq: 'rare' },
            { error: 'Ta marbuta', label: 'ة finale', ex: 'barcha → برشا vs برشة', freq: 'fréquent' },
          ].map(e => (
            <div key={e.error} className="border border-cream/20 p-3 space-y-1">
              <div className="flex justify-between">
                <span className="font-black" style={{ color: '#FF6B6B' }}>{e.error}</span>
                <span
                  className="text-xs px-2 py-0.5 font-bold"
                  style={{
                    background: e.freq === 'fréquent' ? '#FF6B6B' : e.freq === 'occasionnel' ? '#FFD93D' : '#86EFAC',
                    color: e.freq === 'occasionnel' || e.freq === 'rare' ? '#0f0f0f' : '#fff',
                  }}
                >
                  {e.freq}
                </span>
              </div>
              <div className="text-cream/50 text-xs">{e.label}</div>
              <div className="font-mono text-xs text-cream/70">{e.ex}</div>
            </div>
          ))}
        </div>
        <div className="mt-4 text-sm text-cream/70">
          <strong className="text-cream">Hypothèse</strong> : augmenter à ~3 000 exemples ciblant ces confusions réduirait le CER sous <strong className="text-yellow-300">0.08</strong>.
        </div>
      </div>
    </div>
  )
}
