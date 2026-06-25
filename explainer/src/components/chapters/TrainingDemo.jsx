import { useRef, useEffect, useState, useCallback } from 'react'

function seededRand(seed) {
  let s = seed
  return () => {
    s = (s * 16807) % 2147483647
    return (s - 1) / 2147483646
  }
}

function generateLoss(n, start, end, noiseSeed, noiseAmp) {
  const rand = seededRand(noiseSeed)
  const data = []
  for (let i = 0; i < n; i++) {
    const t = i / (n - 1)
    const base = start * Math.exp(-3.8 * t) + end
    const noise = noiseAmp * (rand() - 0.5) * (1 - t * 0.6)
    data.push(Math.max(0.05, base + noise))
  }
  return data
}

const TRAIN_LOSS = generateLoss(300, 3.1, 0.19, 42, 0.35)
const VAL_LOSS   = generateLoss(300, 3.3, 0.26, 77, 0.18)

export default function TrainingDemo() {
  const canvasRef = useRef(null)
  const [drawnTo, setDrawnTo] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const rafRef = useRef(null)
  const currentRef = useRef(0)

  const drawLoss = useCallback((upTo) => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const W = canvas.width, H = canvas.height
    const pad = { t: 28, r: 16, b: 38, l: 44 }
    const cw = W - pad.l - pad.r
    const ch = H - pad.t - pad.b

    ctx.clearRect(0, 0, W, H)
    ctx.fillStyle = '#0f0f0f'
    ctx.fillRect(0, 0, W, H)

    // Grid
    ctx.strokeStyle = 'rgba(255,255,255,0.07)'
    ctx.lineWidth = 1
    for (let i = 1; i <= 5; i++) {
      const y = pad.t + ch * i / 5
      ctx.beginPath(); ctx.moveTo(pad.l, y); ctx.lineTo(pad.l + cw, y); ctx.stroke()
      ctx.fillStyle = 'rgba(255,255,255,0.35)'
      ctx.font = '10px "Space Grotesk", monospace'
      ctx.textAlign = 'right'
      ctx.fillText((3.3 * (1 - i / 5)).toFixed(1), pad.l - 6, y + 4)
    }

    // Y=0 axis
    ctx.strokeStyle = 'rgba(255,255,255,0.15)'
    ctx.lineWidth = 1.5
    ctx.beginPath(); ctx.moveTo(pad.l, pad.t); ctx.lineTo(pad.l, pad.t + ch); ctx.stroke()

    // Epoch separators
    ;[100, 200].forEach((x, ei) => {
      const px = pad.l + (x / 299) * cw
      ctx.strokeStyle = 'rgba(255,211,61,0.3)'
      ctx.lineWidth = 1.5
      ctx.setLineDash([5, 4])
      ctx.beginPath(); ctx.moveTo(px, pad.t); ctx.lineTo(px, pad.t + ch); ctx.stroke()
      ctx.setLineDash([])
      ctx.fillStyle = '#FFD93D'
      ctx.font = 'bold 9px "Space Grotesk", monospace'
      ctx.textAlign = 'center'
      ctx.fillText(`epoch ${ei + 2}`, px, pad.t - 8)
    })

    // Epoch 1 label
    const ep1x = pad.l + (50 / 299) * cw
    ctx.fillStyle = '#FFD93D88'
    ctx.font = 'bold 9px "Space Grotesk", monospace'
    ctx.textAlign = 'center'
    ctx.fillText('epoch 1', ep1x, pad.t - 8)

    // Curves
    const drawCurve = (data, color, dashed) => {
      ctx.beginPath()
      ctx.strokeStyle = color
      ctx.lineWidth = 2.5
      if (dashed) ctx.setLineDash([6, 4])
      else ctx.setLineDash([])
      const n = Math.min(upTo + 1, data.length)
      for (let i = 0; i < n; i++) {
        const x = pad.l + (i / 299) * cw
        const y = pad.t + ch - (data[i] / 3.3) * ch
        if (i === 0) ctx.moveTo(x, y)
        else ctx.lineTo(x, y)
      }
      ctx.stroke()
      ctx.setLineDash([])

      // Dot at current position
      if (upTo < data.length) {
        const cx2 = pad.l + (upTo / 299) * cw
        const cy2 = pad.t + ch - (data[Math.min(upTo, data.length - 1)] / 3.3) * ch
        ctx.beginPath()
        ctx.arc(cx2, cy2, 5, 0, Math.PI * 2)
        ctx.fillStyle = color
        ctx.fill()
        ctx.strokeStyle = '#0f0f0f'
        ctx.lineWidth = 2
        ctx.stroke()
      }
    }

    drawCurve(TRAIN_LOSS, '#C4B5FD', false)
    drawCurve(VAL_LOSS, '#FF6B6B', true)

    // Final values
    if (upTo >= 299) {
      const tFinal = TRAIN_LOSS[299]
      const vFinal = VAL_LOSS[299]
      const lx = pad.l + cw - 4
      ctx.fillStyle = '#C4B5FD'
      ctx.font = 'bold 11px "Space Grotesk", monospace'
      ctx.textAlign = 'right'
      ctx.fillText(tFinal.toFixed(2), lx, pad.t + ch - (tFinal / 3.3) * ch - 8)
      ctx.fillStyle = '#FF6B6B'
      ctx.fillText(vFinal.toFixed(2), lx, pad.t + ch - (vFinal / 3.3) * ch - 8)
    }

    // Legend
    ctx.fillStyle = '#C4B5FD'
    ctx.fillRect(pad.l + 4, pad.t + 4, 20, 3)
    ctx.fillStyle = 'rgba(255,255,255,0.6)'
    ctx.font = '10px "Space Grotesk", monospace'
    ctx.textAlign = 'left'
    ctx.fillText('train loss', pad.l + 28, pad.t + 10)
    ctx.strokeStyle = '#FF6B6B'
    ctx.lineWidth = 2
    ctx.setLineDash([5, 3])
    ctx.beginPath(); ctx.moveTo(pad.l + 4, pad.t + 20); ctx.lineTo(pad.l + 24, pad.t + 20); ctx.stroke()
    ctx.setLineDash([])
    ctx.fillStyle = 'rgba(255,255,255,0.6)'
    ctx.fillText('val loss', pad.l + 28, pad.t + 24)

    // X labels
    ;[0, 100, 200, 299].forEach((x) => {
      const px = pad.l + (x / 299) * cw
      ctx.fillStyle = 'rgba(255,255,255,0.3)'
      ctx.font = '9px monospace'
      ctx.textAlign = 'center'
      ctx.fillText(x === 299 ? '~810' : `${x} steps`, px, pad.t + ch + 16)
    })
  }, [])

  const resize = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const rect = canvas.getBoundingClientRect()
    canvas.width = rect.width
    canvas.height = 240
    drawLoss(currentRef.current)
  }, [drawLoss])

  useEffect(() => {
    resize()
    window.addEventListener('resize', resize)
    return () => window.removeEventListener('resize', resize)
  }, [resize])

  const play = useCallback((from = 0, to = 299) => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current)
    setIsPlaying(true)
    currentRef.current = from
    setDrawnTo(from)

    const step = () => {
      currentRef.current = Math.min(currentRef.current + 3, to)
      setDrawnTo(currentRef.current)
      drawLoss(currentRef.current)
      if (currentRef.current < to) {
        rafRef.current = requestAnimationFrame(step)
      } else {
        setIsPlaying(false)
      }
    }
    rafRef.current = requestAnimationFrame(step)
  }, [drawLoss])

  const playEpoch = (ep) => {
    const ranges = [[0, 99], [100, 199], [200, 299]]
    const [start, end] = ranges[ep - 1]
    play(start, end)
  }

  const currentTrain = TRAIN_LOSS[Math.min(drawnTo, 299)]
  const currentVal = VAL_LOSS[Math.min(drawnTo, 299)]

  return (
    <div className="space-y-4">
      {/* Canvas */}
      <div className="loss-wrap">
        <canvas ref={canvasRef} className="w-full" style={{ display: 'block' }} />
      </div>

      {/* Controls */}
      <div className="flex flex-wrap gap-2 items-center">
        <button className="neo-btn px-4 py-2 text-sm" style={{ background: '#FFD93D' }} onClick={() => play()}>
          Tout rejouer
        </button>
        {[1, 2, 3].map(ep => (
          <button key={ep} className="neo-btn px-3 py-2 text-sm" onClick={() => playEpoch(ep)}>
            Epoch {ep}
          </button>
        ))}
      </div>

      {/* Live values */}
      <div className="flex gap-3">
        <div className="neo-card-sm p-3 flex-1 text-center">
          <div className="text-xs font-black uppercase tracking-wider mb-1 text-ink/50">Train loss</div>
          <div className="text-2xl font-black" style={{ color: '#C4B5FD' }}>{currentTrain.toFixed(3)}</div>
        </div>
        <div className="neo-card-sm p-3 flex-1 text-center">
          <div className="text-xs font-black uppercase tracking-wider mb-1 text-ink/50">Val loss</div>
          <div className="text-2xl font-black" style={{ color: '#FF6B6B' }}>{currentVal.toFixed(3)}</div>
        </div>
        <div className="neo-card-sm p-3 flex-1 text-center">
          <div className="text-xs font-black uppercase tracking-wider mb-1 text-ink/50">Step</div>
          <div className="text-2xl font-black">{Math.round(drawnTo * 2.7)}</div>
        </div>
      </div>

      {/* Config */}
      <div className="neo-card-dark p-4 text-sm font-mono">
        <span className="text-yellow-300">SFTConfig</span>
        <span className="text-cream/50">(</span>
        <span className="text-blue-300">lr</span><span className="text-cream/50">=</span><span className="text-green-300">2e-4</span><span className="text-cream/50">, </span>
        <span className="text-blue-300">batch</span><span className="text-cream/50">=</span><span className="text-green-300">4</span><span className="text-cream/50">, </span>
        <span className="text-blue-300">epochs</span><span className="text-cream/50">=</span><span className="text-green-300">3</span><span className="text-cream/50">, </span>
        <span className="text-blue-300">fp16</span><span className="text-cream/50">=</span><span className="text-green-300">True</span>
        <span className="text-cream/50">)</span>
      </div>
    </div>
  )
}
