import { useEffect, useRef, useState } from 'react'
import { Eraser, PenLine } from 'lucide-react'

export default function SignaturePad({ value, onChange }: { value: string; onChange: (data: string) => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const drawing = useRef(false)
  const [hasInk, setHasInk] = useState(false)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const dpr = window.devicePixelRatio || 1
    const rect = canvas.getBoundingClientRect()
    canvas.width = rect.width * dpr
    canvas.height = rect.height * dpr
    const ctx = canvas.getContext('2d')!
    ctx.scale(dpr, dpr)
    ctx.lineWidth = 2.2
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    ctx.strokeStyle = '#0d3b34'
    if (value) {
      const img = new Image()
      img.onload = () => ctx.drawImage(img, 0, 0, rect.width, rect.height)
      img.src = value
    }
  }, [])

  const pos = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    return { x: e.clientX - rect.left, y: e.clientY - rect.top }
  }

  const start = (e: React.PointerEvent<HTMLCanvasElement>) => {
    drawing.current = true
    e.currentTarget.setPointerCapture(e.pointerId)
    const p = pos(e)
    e.currentTarget.getContext('2d')!.beginPath()
    e.currentTarget.getContext('2d')!.moveTo(p.x, p.y)
  }

  const move = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!drawing.current) return
    const p = pos(e)
    const ctx = e.currentTarget.getContext('2d')!
    ctx.lineTo(p.x, p.y)
    ctx.stroke()
    setHasInk(true)
  }

  const end = (e: React.PointerEvent<HTMLCanvasElement>) => {
    drawing.current = false
    onChange(e.currentTarget.toDataURL('image/png'))
  }

  const clear = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    canvas.getContext('2d')!.clearRect(0, 0, canvas.width, canvas.height)
    setHasInk(false)
    onChange('')
  }

  return (
    <div className="signature-box">
      <canvas
        ref={canvasRef}
        onPointerDown={start}
        onPointerMove={move}
        onPointerUp={end}
        onPointerLeave={end}
      />
      {!hasInk && !value && <div className="signature-hint"><PenLine size={18} /> Signez ici avec votre doigt ou la souris</div>}
      <button type="button" className="signature-clear" onClick={clear}><Eraser size={14} /> Effacer</button>
      <div className="signature-line" />
    </div>
  )
}
