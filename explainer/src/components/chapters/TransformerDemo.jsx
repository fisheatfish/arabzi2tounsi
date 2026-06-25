import { useState } from 'react'

const BLOCKS = [
  {
    id: 'input',
    label: 'Tokens d\'entrée',
    sub: '[82, 527, 71, 398, ...]',
    color: '#FFD93D',
    text: '#0f0f0f',
    icon: '',
    desc: {
      title: 'Tokens → IDs entiers',
      body: 'Le tokenizer a converti le texte en IDs. À ce stade c\'est juste une liste d\'entiers — le modèle ne "comprend" rien encore.',
      code: 'tokens = [82, 527, 71, 398, 4821, 343]',
    },
  },
  {
    id: 'embed',
    label: 'Embedding + RoPE',
    sub: 'R^(seq × 576)',
    color: '#C4B5FD',
    text: '#0f0f0f',
    icon: '',
    desc: {
      title: 'ID → Vecteur dense',
      body: 'Chaque ID est mappé sur un vecteur de 576 dimensions. On y additionne un RoPE (Rotary Position Embedding) pour encoder la position.',
      code: 'x = embed(token_id)  # shape: [6, 576]\nx = x + rope(position)',
    },
  },
  {
    id: 'block',
    label: '× 32 Blocs Transformer',
    sub: 'LayerNorm → Attn → Res → MLP',
    color: '#93C5FD',
    text: '#0f0f0f',
    icon: '',
    isGroup: true,
    desc: {
      title: 'Pile de 32 blocs identiques',
      body: 'Chaque bloc raffine les représentations. Les premières couches capturent la syntaxe, les dernières la sémantique haute-niveau.',
      code: 'for i in range(32):\n  x = attn(norm(x)) + x  # résiduel\n  x = mlp(norm(x))  + x  # résiduel',
    },
    children: [
      {
        id: 'norm1', label: 'LayerNorm', color: '#e5e7eb', text: '#0f0f0f', icon: '',
        desc: {
          title: 'Normalisation de couche',
          body: 'Normalise les activations (moyenne≈0, variance≈1) avant l\'attention. Stabilise l\'entraînement sur des piles profondes.',
          code: 'x = (x - mean(x)) / std(x) * γ + β',
        },
      },
      {
        id: 'attn', label: 'Multi-Head Attention', color: '#93C5FD', text: '#0f0f0f', icon: '',
        desc: {
          title: '15 têtes × (Q, K, V)',
          body: 'Chaque tête calcule Q·Kᵀ/√d_k pour obtenir les poids d\'attention, puis pondère V. Les 15 sorties sont concaténées.',
          code: 'Q, K, V = W_q(x), W_k(x), W_v(x)\nattn = softmax(Q@K.T / √576) @ V',
        },
      },
      {
        id: 'res1', label: 'Connexion Résiduelle', color: '#e5e7eb', text: '#0f0f0f', icon: '',
        desc: {
          title: 'Skip connection',
          body: 'x = x + attn(norm(x)). Permet aux gradients de traverser 32 couches sans disparaître (gradient highway).',
          code: 'x = x + attn_output  # skip!',
        },
      },
      {
        id: 'mlp', label: 'MLP Feed-Forward', color: '#FDB877', text: '#0f0f0f', icon: '',
        desc: {
          title: 'Réseau 576 → 1536 → 576',
          body: 'Deux couches linéaires avec activation SiLU. Le MLP "stocke" les associations token→concept. C\'est là que réside la "mémoire" du modèle.',
          code: 'x = W2( silu(W1(x)) )  # 576→1536→576',
        },
      },
    ],
  },
  {
    id: 'output',
    label: 'Projection + Softmax',
    sub: 'logits sur vocab (49 152)',
    color: '#86EFAC',
    text: '#0f0f0f',
    icon: '',
    desc: {
      title: 'Prédiction du prochain token',
      body: 'Une couche linéaire projette le vecteur final (576D) sur les 49 152 tokens du vocabulaire. Softmax donne les probabilités.',
      code: 'logits = W_out(x)  # [seq, 49152]\nprobs  = softmax(logits[-1])  # dernier tok',
    },
  },
]

export default function TransformerDemo() {
  const [active, setActive] = useState('attn')

  function findDesc(id) {
    for (const b of BLOCKS) {
      if (b.id === id) return b.desc
      if (b.children) {
        const c = b.children.find(c => c.id === id)
        if (c) return c.desc
      }
    }
    return null
  }

  const desc = findDesc(active)

  return (
    <div className="flex flex-col md:flex-row gap-6 items-start">
      {/* Diagram */}
      <div className="w-full md:w-56 flex flex-col items-center gap-0 shrink-0">
        {BLOCKS.map((b, i) => (
          <div key={b.id} className="w-full flex flex-col items-center">
            {b.isGroup ? (
              <div
                className="w-full border-2 border-dashed border-ink p-3 relative"
                style={{ background: 'rgba(147,197,253,0.06)' }}
              >
                <div className="absolute -top-3 left-3 bg-cream border border-ink px-2 text-xs font-black">
                  {b.label}
                </div>
                <div className="flex flex-col items-center gap-1.5 mt-3">
                  {b.children.map((c, ci) => (
                    <div key={c.id} className="flex flex-col items-center w-full">
                      <button
                        onClick={() => setActive(c.id)}
                        className="w-full py-2 px-3 border-2 border-ink text-xs font-black text-center transition-all duration-150 cursor-pointer hover:-translate-y-0.5"
                        style={{
                          background: c.color,
                          color: c.text,
                          boxShadow: active === c.id ? '4px 4px 0 0 #0f0f0f' : '2px 2px 0 0 #0f0f0f',
                          transform: active === c.id ? 'translate(-2px,-2px)' : undefined,
                        }}
                      >
                        {c.label}
                      </button>
                      {ci < b.children.length - 1 && (
                        <div className="w-0.5 h-3 bg-ink/30 my-0" />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <button
                onClick={() => setActive(b.id)}
                className="w-full py-3 px-3 border-2 border-ink text-sm font-black text-center transition-all duration-150 cursor-pointer hover:-translate-y-0.5"
                style={{
                  background: b.color,
                  color: b.text,
                  boxShadow: active === b.id ? '6px 6px 0 0 #0f0f0f' : '4px 4px 0 0 #0f0f0f',
                  transform: active === b.id ? 'translate(-2px,-2px)' : undefined,
                }}
              >
                {b.label}
                <div className="text-xs font-normal mt-0.5 opacity-60">{b.sub}</div>
              </button>
            )}
            {i < BLOCKS.length - 1 && (
              <div className="flex flex-col items-center">
                <div className="w-0.5 h-4 bg-ink/40" />
                <div className="text-ink/40 text-xs">▼</div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Description */}
      <div className="flex-1">
        {desc && (
          <div className="neo-card p-5 space-y-4">
            <h3 className="text-xl font-black">{desc.title}</h3>
            <p className="font-medium leading-relaxed text-ink/80">{desc.body}</p>
            <div className="neo-card-dark p-4">
              <pre className="text-sm font-mono whitespace-pre-wrap text-green-300 leading-relaxed">{desc.code}</pre>
            </div>
          </div>
        )}

        {/* Dimensions summary */}
        <div className="neo-card mt-4 p-4">
          <div className="text-xs font-black uppercase tracking-wider mb-3 text-ink/60">Dimensions SmolLM2-360M</div>
          <div className="grid grid-cols-2 gap-2">
            {[
              ['Couches', '32'],
              ['Dim. modèle (d)', '576'],
              ['Têtes attention', '15'],
              ['Dim. MLP', '1 536'],
              ['Vocab size', '49 152'],
              ['Params total', '360M'],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between text-sm border-b border-ink/10 pb-1">
                <span className="text-ink/60 font-medium">{k}</span>
                <span className="font-black">{v}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
