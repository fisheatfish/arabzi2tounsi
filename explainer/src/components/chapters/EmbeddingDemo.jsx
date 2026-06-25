import { useRef, useEffect, useState } from 'react'

const POINTS = [
  // Salutations cluster (top-left)
  { x: 0.12, y: 0.22, label: 'sbeh', cluster: 0 },
  { x: 0.20, y: 0.15, label: 's7ab', cluster: 0 },
  { x: 0.09, y: 0.33, label: 'msa', cluster: 0 },
  { x: 0.24, y: 0.28, label: 'bislema', cluster: 0 },
  // Négations cluster (top-right)
  { x: 0.72, y: 0.18, label: 'ma', cluster: 1 },
  { x: 0.80, y: 0.28, label: 'mich', cluster: 1 },
  { x: 0.76, y: 0.10, label: 'manich', cluster: 1 },
  { x: 0.68, y: 0.32, label: 'walo', cluster: 1 },
  // Verbes cluster (bottom-left)
  { x: 0.16, y: 0.72, label: 'nheb', cluster: 2 },
  { x: 0.24, y: 0.78, label: 'nrou7', cluster: 2 },
  { x: 0.10, y: 0.82, label: 'nel3ab', cluster: 2 },
  { x: 0.28, y: 0.65, label: 'nchof', cluster: 2 },
  // Questions cluster (bottom-right)
  { x: 0.68, y: 0.72, label: 'kifeh', cluster: 3 },
  { x: 0.76, y: 0.65, label: '7alek', cluster: 3 },
  { x: 0.72, y: 0.80, label: 'win', cluster: 3 },
  { x: 0.62, y: 0.78, label: 'chnowa', cluster: 3 },
]

const CLUSTER_META = [
  { label: 'Salutations', color: '#FFD93D', text: '#0f0f0f' },
  { label: 'Négations',   color: '#FF6B6B', text: '#fff' },
  { label: 'Verbes',      color: '#86EFAC', text: '#0f0f0f' },
  { label: 'Questions',   color: '#C4B5FD', text: '#0f0f0f' },
]

function seededRand(seed) {
  let s = seed
  return () => {
    s = (s * 16807 + 0) % 2147483647
    return (s - 1) / 2147483646
  }
}

function getVec(label) {
  const rand = seededRand(label.split('').reduce((a, c) => a + c.charCodeAt(0), 0))
  return Array.from({ length: 32 }, () => rand() * 2 - 1)
}

export default function EmbeddingDemo() {
  const canvasRef = useRef(null)
  const [hovered, setHovered] = useState(null)
  const [selected, setSelected] = useState(POINTS[0])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')

    function draw() {
      const W = canvas.width, H = canvas.height
      ctx.clearRect(0, 0, W, H)

      // Background
      ctx.fillStyle = '#0f0f0f'
      ctx.fillRect(0, 0, W, H)

      // Grid
      ctx.strokeStyle = 'rgba(255,255,255,0.06)'
      ctx.lineWidth = 1
      for (let i = 0; i < W; i += 36) {
        ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, H); ctx.stroke()
      }
      for (let i = 0; i < H; i += 36) {
        ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(W, i); ctx.stroke()
      }

      // Cluster zones
      const clusters = [0, 1, 2, 3].map(ci => POINTS.filter(p => p.cluster === ci))
      clusters.forEach((pts, ci) => {
        const cx = pts.reduce((s, p) => s + p.x * W, 0) / pts.length
        const cy = pts.reduce((s, p) => s + p.y * H, 0) / pts.length
        const meta = CLUSTER_META[ci]

        // Soft zone
        const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, 80)
        grad.addColorStop(0, meta.color + '28')
        grad.addColorStop(1, 'transparent')
        ctx.fillStyle = grad
        ctx.beginPath()
        ctx.arc(cx, cy, 80, 0, Math.PI * 2)
        ctx.fill()

        // Cluster border (dashed)
        ctx.strokeStyle = meta.color + '55'
        ctx.lineWidth = 2
        ctx.setLineDash([6, 4])
        ctx.beginPath()
        ctx.arc(cx, cy, 70, 0, Math.PI * 2)
        ctx.stroke()
        ctx.setLineDash([])

        // Label
        ctx.fillStyle = meta.color
        ctx.font = 'bold 11px "Space Grotesk", monospace'
        ctx.textAlign = 'center'
        ctx.fillText(meta.label, cx, cy - 78)
      })

      // Points
      POINTS.forEach((p, i) => {
        const px = p.x * W, py = p.y * H
        const isHov = hovered === i
        const isSel = selected && selected.label === p.label
        const meta = CLUSTER_META[p.cluster]
        const r = isSel ? 10 : isHov ? 9 : 7

        // Shadow
        ctx.fillStyle = 'rgba(0,0,0,0.5)'
        ctx.beginPath()
        ctx.arc(px + 2, py + 2, r, 0, Math.PI * 2)
        ctx.fill()

        // Point
        ctx.fillStyle = meta.color
        ctx.beginPath()
        ctx.arc(px, py, r, 0, Math.PI * 2)
        ctx.fill()

        // Border
        ctx.strokeStyle = isHov || isSel ? '#fff' : '#0f0f0f'
        ctx.lineWidth = isSel ? 3 : 2
        ctx.stroke()

        // Label
        ctx.fillStyle = isHov || isSel ? '#fff' : 'rgba(255,255,255,0.75)'
        ctx.font = `${isSel ? 'bold ' : ''}${isSel ? '12px' : '10px'} "Space Grotesk", monospace`
        ctx.textAlign = 'center'
        ctx.fillText(p.label, px, py - r - 5)
      })
    }

    function resize() {
      const rect = canvas.getBoundingClientRect()
      canvas.width = rect.width
      canvas.height = rect.height
      draw()
    }

    resize()
    window.addEventListener('resize', resize)

    // Mouse handling
    const onMove = (e) => {
      const rect = canvas.getBoundingClientRect()
      const mx = (e.clientX - rect.left) / rect.width
      const my = (e.clientY - rect.top) / rect.height
      let closest = null, minD = 0.05
      POINTS.forEach((p, i) => {
        const d = Math.hypot(p.x - mx, p.y - my)
        if (d < minD) { minD = d; closest = i }
      })
      setHovered(closest)
      draw()
    }

    const onClick = (e) => {
      const rect = canvas.getBoundingClientRect()
      const mx = (e.clientX - rect.left) / rect.width
      const my = (e.clientY - rect.top) / rect.height
      let closest = null, minD = 0.06
      POINTS.forEach((p, i) => {
        const d = Math.hypot(p.x - mx, p.y - my)
        if (d < minD) { minD = d; closest = i }
      })
      if (closest !== null) setSelected(POINTS[closest])
    }

    canvas.addEventListener('mousemove', onMove)
    canvas.addEventListener('click', onClick)
    return () => {
      window.removeEventListener('resize', resize)
      canvas.removeEventListener('mousemove', onMove)
      canvas.removeEventListener('click', onClick)
    }
  }, [hovered, selected])

  const vec = selected ? getVec(selected.label) : []
  const clusterMeta = selected ? CLUSTER_META[selected.cluster] : null

  return (
    <div className="space-y-4">
      <canvas ref={canvasRef} className="w-full" style={{ height: 260 }} />

      {selected && (
        <div className="neo-card p-4 space-y-3">
          <div className="flex items-center gap-3 flex-wrap">
            <span
              className="neo-badge text-sm px-3 py-1"
              style={{ background: clusterMeta.color, color: clusterMeta.text }}
            >
              {selected.label}
            </span>
            <span className="text-sm font-bold text-ink/60">
              cluster : <span className="text-ink">{clusterMeta.label}</span>
            </span>
          </div>

          {/* Vector heatmap */}
          <div>
            <div className="text-xs font-bold uppercase tracking-wider mb-2 text-ink/60">
              Vecteur embedding (32 dims sur 576)
            </div>
            <div className="flex flex-wrap gap-1">
              {vec.map((v, i) => {
                const norm = (v + 1) / 2
                const r = Math.round(255 * (1 - norm) + 15 * norm)
                const g = Math.round(107 * norm + 15 * (1 - norm))
                const b = Math.round(107 * norm + 15 * (1 - norm))
                return (
                  <div
                    key={i}
                    title={v.toFixed(3)}
                    className="w-7 h-7 border-2 border-ink flex items-center justify-center"
                    style={{ background: `rgb(${r},${g},${b})`, fontSize: '0.5rem', fontWeight: 700, color: Math.abs(v) > 0.5 ? '#fff' : '#0f0f0f' }}
                  >
                    {v.toFixed(1)}
                  </div>
                )
              })}
            </div>
          </div>

          <div className="neo-card-dark p-3 text-sm font-mono">
            <span style={{ color: clusterMeta.color }}>{selected.label}</span>
            <span className="text-cream/50"> → vecteur dans </span>
            <span className="text-green-300">ℝ⁵⁷⁶</span>
            <span className="text-cream/50"> tel que sim(<span style={{ color: clusterMeta.color }}>{selected.label}</span>, cluster) &gt; 0.7</span>
          </div>
        </div>
      )}
    </div>
  )
}
