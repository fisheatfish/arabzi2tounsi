export default function FooterSection() {
  return (
    <footer
      className="relative overflow-hidden"
      style={{ background: '#0f0f0f', color: '#FFFDF5' }}
    >
      <div className="absolute inset-0 texture-dots pointer-events-none" style={{ opacity: 0.08 }} aria-hidden="true" />

      <div className="relative z-10 max-w-6xl mx-auto px-6 py-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {/* Title */}
          <div className="md:col-span-2">
            <div
              className="neo-badge inline-block mb-4 rotate-1"
              style={{ background: '#FFD93D', color: '#0f0f0f', borderColor: '#FFD93D' }}
            >
              arabzi2tounsi
            </div>
            <h2 className="text-4xl md:text-5xl font-black mb-4 leading-tight">
              Fine-tuning LoRA<br />
              <span style={{ WebkitTextStroke: '3px #FFFDF5', color: 'transparent' }}>
                sur cas réel
              </span>
            </h2>
            <p className="text-cream/60 font-medium leading-relaxed max-w-md">
              Projet pédagogique de SFT avec LoRA sur la translittération du tunisien
              arabizi vers le script arabe. Chaque étape est documentée et reproductible.
            </p>
          </div>

          {/* Links & stats */}
          <div className="space-y-6">
            <div>
              <div className="text-xs font-black uppercase tracking-widest mb-3 text-cream/40">Stack</div>
              <div className="space-y-1 text-sm font-medium text-cream/70">
                {['SmolLM2-360M-Instruct', 'LoRA r=8 α=16 (PEFT)', 'SFTTrainer (TRL)', 'Google Colab T4', 'uv · Python 3.13'].map(s => (
                  <div key={s} className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-yellow-400 shrink-0" />
                    {s}
                  </div>
                ))}
              </div>
            </div>

            <div>
              <div className="text-xs font-black uppercase tracking-widest mb-3 text-cream/40">Résultats</div>
              <div className="grid grid-cols-2 gap-2">
                {[
                  ['CER base', '2.72'],
                  ['CER SFT', '0.26'],
                  ['Exact match', '10.4%'],
                  ['LoRA params', '16K'],
                ].map(([k, v]) => (
                  <div key={k} className="border border-cream/15 p-2">
                    <div className="text-lg font-black" style={{ color: '#FFD93D' }}>{v}</div>
                    <div className="text-xs text-cream/50">{k}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-cream/10 flex flex-wrap items-center justify-between gap-4 text-xs text-cream/30 font-medium">
          <span>Inspiré de <a href="https://ko-microgpt.vercel.app/en" className="text-yellow-400 hover:text-yellow-300">ko-microgpt.vercel.app</a></span>
          <span>React + Vite + Tailwind CSS v4 + GSAP</span>
        </div>
      </div>
    </footer>
  )
}
