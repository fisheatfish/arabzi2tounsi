import { useState, useRef, useEffect } from 'react'
import { gsap } from 'gsap'

const CHIP_COLORS = [
  { bg: '#FFD93D', border: '#0f0f0f' },
  { bg: '#FF6B6B', border: '#0f0f0f', text: '#fff' },
  { bg: '#C4B5FD', border: '#0f0f0f' },
  { bg: '#93C5FD', border: '#0f0f0f' },
  { bg: '#86EFAC', border: '#0f0f0f' },
  { bg: '#FDB877', border: '#0f0f0f' },
  { bg: '#F9A8D4', border: '#0f0f0f' },
  { bg: '#A5F3FC', border: '#0f0f0f' },
]

const EXAMPLES = [
  { text: 'sbeh el khir', desc: 'bonjour' },
  { text: 'kifeh 7alek', desc: 'comment tu vas' },
  { text: 'ma n9addarch', desc: 'je ne peux pas' },
  { text: 'nheb nrou7', desc: 'je veux partir' },
  { text: 'merci barcha', desc: 'merci beaucoup' },
]

// Simplified BPE-like tokenizer for Arabizi
function tokenize(text) {
  const tokens = []
  const parts = text.split(/(\s+)/)
  for (let wi = 0; wi < parts.length; wi++) {
    const w = parts[wi]
    if (!w || /^\s+$/.test(w)) continue
    const isFirst = tokens.length === 0
    const prefix = isFirst ? '' : '▁'

    if (w.length <= 2) {
      tokens.push({ text: prefix + w, id: Math.abs(w.charCodeAt(0) * 13 + w.length * 7) % 49152 })
    } else {
      // Sub-word split
      let i = 0
      while (i < w.length) {
        const p = i === 0 ? prefix : ''
        if (/[0-9]/.test(w[i])) {
          tokens.push({ text: p + w[i], id: w.charCodeAt(i) * 17 % 49152 })
          i++
        } else if (i + 3 <= w.length && i === 0) {
          const chunk = w.slice(i, i + 3)
          tokens.push({ text: p + chunk, id: Math.abs(chunk.charCodeAt(0) * 31 + chunk.length * 11) % 49152 })
          i += 3
        } else if (i + 2 <= w.length) {
          const chunk = w.slice(i, i + 2)
          tokens.push({ text: chunk, id: Math.abs(chunk.charCodeAt(0) * 29 + i * 7) % 49152 })
          i += 2
        } else {
          tokens.push({ text: w[i], id: w.charCodeAt(i) * 13 % 49152 })
          i++
        }
      }
    }
  }
  return tokens
}

export default function TokenizationDemo() {
  const [text, setText] = useState('sbeh el khir')
  const [tokens, setTokens] = useState([])
  const [exIdx, setExIdx] = useState(0)
  const chipsRef = useRef(null)

  useEffect(() => {
    const t = tokenize(text)
    setTokens(t)
  }, [text])

  useEffect(() => {
    if (!chipsRef.current) return
    const chips = chipsRef.current.querySelectorAll('.token-chip')
    if (!chips.length) return
    gsap.fromTo(chips,
      { y: 20, opacity: 0, scale: 0.7, rotation: -8 },
      { y: 0, opacity: 1, scale: 1, rotation: 0, duration: 0.3, stagger: 0.05, ease: 'back.out(1.5)' }
    )
  }, [tokens])

  const loadExample = (i) => {
    setExIdx(i)
    setText(EXAMPLES[i].text)
  }

  return (
    <div className="space-y-5">
      {/* Example buttons */}
      <div className="flex flex-wrap gap-2">
        {EXAMPLES.map((ex, i) => (
          <button
            key={i}
            onClick={() => loadExample(i)}
            className="neo-btn px-3 py-1.5 text-sm"
            style={{ background: exIdx === i ? '#FFD93D' : '#fff' }}
          >
            {ex.text}
          </button>
        ))}
      </div>

      {/* Input */}
      <div>
        <label className="block text-xs font-900 uppercase tracking-widest mb-2">
          Tape du texte arabizi
        </label>
        <input
          type="text"
          className="neo-input"
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder="Ex: 3andek wa9t ?"
        />
      </div>

      {/* Token chips */}
      <div>
        <div className="text-xs font-bold uppercase tracking-widest mb-3 flex items-center gap-2">
          <span
            className="inline-block w-2.5 h-2.5 rounded-full border-2 border-ink"
            style={{ background: '#86EFAC', animation: 'chip-pop 1s ease infinite alternate' }}
          />
          Tokens générés
        </div>
        <div ref={chipsRef} className="flex flex-wrap gap-2 min-h-12">
          {tokens.map((tok, i) => (
            <span
              key={i}
              className="token-chip"
              style={{
                background: CHIP_COLORS[i % CHIP_COLORS.length].bg,
                color: CHIP_COLORS[i % CHIP_COLORS.length].text || '#0f0f0f',
                animationDelay: `${i * 0.04}s`,
              }}
              title={`ID: ${tok.id}`}
            >
              {tok.text}
            </span>
          ))}
        </div>
      </div>

      {/* Stats row */}
      <div className="flex gap-4">
        {[
          { label: 'tokens', val: tokens.length },
          { label: 'chars', val: text.length },
          { label: 'chars/token', val: tokens.length ? (text.length / tokens.length).toFixed(1) : '–' },
        ].map(s => (
          <div key={s.label} className="neo-card-sm p-3 text-center flex-1">
            <div className="text-3xl font-black" style={{ color: '#FF6B6B' }}>{s.val}</div>
            <div className="text-xs font-bold uppercase tracking-wider mt-1 text-ink/60">{s.label}</div>
          </div>
        ))}
      </div>

      {/* ID table */}
      <div className="neo-card-sm overflow-hidden">
        <div className="grid text-xs font-bold uppercase tracking-wider px-3 py-2 border-b-2 border-ink"
          style={{ gridTemplateColumns: '1fr 1fr 1fr', background: '#FFD93D' }}>
          <span>#</span>
          <span>Token</span>
          <span>Vocab ID</span>
        </div>
        <div className="max-h-36 overflow-y-auto">
          {tokens.map((tok, i) => (
            <div key={i}
              className="grid text-xs px-3 py-1.5 border-b border-ink/10 hover:bg-yellow-50 transition-colors"
              style={{ gridTemplateColumns: '1fr 1fr 1fr' }}>
              <span className="font-bold text-ink/40">{i}</span>
              <span
                className="font-black font-mono px-1.5 py-0.5 inline-block"
                style={{
                  background: CHIP_COLORS[i % CHIP_COLORS.length].bg,
                  border: '1px solid #0f0f0f',
                }}
              >
                {tok.text}
              </span>
              <span className="font-mono font-bold">{tok.id}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
