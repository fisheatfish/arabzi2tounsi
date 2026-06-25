import { useEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'

const PAIRS = [
  ['sbeh el khir', 'صباح الخير'],
  ['kifeh 7alek', 'كيفاش حالك'],
  ['nheb nrou7', 'نحب نروح'],
  ['ma n9addarch', 'ما نقدرش'],
  ['merci barcha', 'مرسي برشا'],
  ['bislema', 'بالسلامة'],
]

export default function HeroSection() {
  const heroRef = useRef(null)
  const titleRef = useRef(null)
  const demoRef = useRef(null)
  const [pairIdx, setPairIdx] = useState(0)
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Staggered entry
      gsap.fromTo('.hero-enter',
        { y: 60, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, stagger: 0.12, ease: 'power3.out', delay: 0.1 }
      )
    }, heroRef)
    return () => ctx.revert()
  }, [])

  // Cycle demo pairs
  useEffect(() => {
    const timer = setInterval(() => {
      setVisible(false)
      setTimeout(() => {
        setPairIdx(i => (i + 1) % PAIRS.length)
        setVisible(true)
      }, 300)
    }, 2800)
    return () => clearInterval(timer)
  }, [])

  const [input, output] = PAIRS[pairIdx]

  return (
    <section
      id="hero"
      ref={heroRef}
      className="chapter-section flex items-center"
      style={{ background: '#FFFDF5' }}
    >
      <div className="absolute inset-0 texture-dots pointer-events-none" style={{ opacity: 0.2 }} aria-hidden="true" />

      <div className="relative z-10 max-w-6xl mx-auto px-6 py-32 md:py-40 w-full">
        <div className="grid grid-cols-1 md:grid-cols-[1fr_0.9fr] gap-12 items-center">
          {/* Left: copy */}
          <div className="space-y-8">
            <div className="hero-enter">
              <div className="neo-badge rotate-2 inline-block mb-4" style={{ background: '#FFD93D' }}>
                Pédagogique · SmolLM2-360M · LoRA
              </div>
              <h1 className="text-5xl md:text-7xl font-black leading-[1.0]">
                Comment un<br />
                <span style={{ WebkitTextStroke: '4px #0f0f0f', color: 'transparent' }}>
                  LLM apprend
                </span><br />
                à translittérer
              </h1>
            </div>

            <p className="hero-enter text-lg font-medium text-ink/70 max-w-md leading-relaxed">
              Un guide visuel et interactif du tokenizer jusqu'au fine-tuning LoRA,
              illustré sur le projet <strong className="text-ink">arabzi2tounsi</strong> —
              tunisien arabizi → script arabe.
            </p>

            <div className="hero-enter flex flex-wrap gap-3">
              <a href="#tokens" className="neo-btn px-5 py-3" style={{ background: '#FF6B6B', color: '#fff' }}>
                Commencer ↓
              </a>
              <a
                href="https://github.com"
                className="neo-btn px-5 py-3"
                style={{ background: '#fff' }}
              >
                GitHub →
              </a>
            </div>

            <div className="hero-enter flex flex-wrap gap-4 text-sm font-bold">
              {[
                ['360M', 'paramètres'],
                ['16K', 'LoRA params'],
                ['791', 'paires train'],
                ['0.26', 'CER final'],
              ].map(([n, l]) => (
                <div key={l} className="neo-card-sm px-3 py-2 text-center">
                  <div className="text-xl font-black" style={{ color: '#FF6B6B' }}>{n}</div>
                  <div className="text-xs text-ink/50 uppercase tracking-wider">{l}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Right: live demo */}
          <div ref={demoRef} className="hero-enter">
            <div className="neo-card p-6 space-y-5">
              <div className="text-xs font-black uppercase tracking-widest text-ink/50 mb-1">
                Démonstration en direct
              </div>

              <div
                style={{
                  transition: 'opacity 0.3s ease',
                  opacity: visible ? 1 : 0,
                }}
              >
                <div className="neo-card-sm p-4">
                  <div className="text-xs font-black uppercase tracking-wider mb-2 text-ink/40">Input (arabizi)</div>
                  <div className="text-2xl font-black font-mono" style={{ color: '#FF6B6B' }}>{input}</div>
                </div>

                <div className="flex justify-center my-3">
                  <div
                    className="text-3xl font-black border-2 border-ink w-10 h-10 flex items-center justify-center"
                    style={{ background: '#FFD93D', boxShadow: '3px 3px 0 0 #0f0f0f' }}
                  >
                    →
                  </div>
                </div>

                <div className="neo-card-dark p-4">
                  <div className="text-xs font-black uppercase tracking-wider mb-2 text-cream/40">Output (arabe)</div>
                  <div className="text-2xl font-black arabic" style={{ color: '#86EFAC' }}>{output}</div>
                </div>
              </div>

              <div className="pt-2 border-t-2 border-ink">
                <div className="text-xs font-medium text-ink/50 text-center">
                  SmolLM2-360M + LoRA (r=8) · 3 epochs · T4 GPU
                </div>
              </div>
            </div>

            {/* Steps preview */}
            <div className="mt-4 grid grid-cols-4 gap-2">
              {[
                { n: '01', label: 'Tokens', color: '#FFD93D' },
                { n: '02', label: 'Embed', color: '#C4B5FD' },
                { n: '03', label: 'Attn', color: '#93C5FD' },
                { n: '04', label: 'LoRA', color: '#86EFAC' },
              ].map(s => (
                <div key={s.n} className="neo-card-sm p-2 text-center">
                  <div className="text-xs font-black" style={{ color: s.color }}>{s.n}</div>
                  <div className="text-xs font-bold">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-ink/40">
        <span className="text-xs font-bold uppercase tracking-widest">défiler</span>
        <div className="w-px h-8 bg-ink/20 relative overflow-hidden">
          <div
            className="absolute top-0 left-0 w-full"
            style={{
              height: '50%',
              background: '#0f0f0f',
              animation: 'scrollLine 1.5s ease-in-out infinite',
            }}
          />
        </div>
      </div>

      <style>{`
        @keyframes scrollLine {
          0%   { transform: translateY(-100%); }
          100% { transform: translateY(200%); }
        }
      `}</style>
    </section>
  )
}
