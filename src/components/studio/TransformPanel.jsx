import { useCallback } from 'react'
import { RotateCcw } from 'lucide-react'
import { useStudioStore } from '../../store/studioStore'

function Slider({ label, value, min, max, step = 0.01, format, onChange }) {
  const pct = ((value - min) / (max - min)) * 100

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <span className="font-display font-black text-[10px] uppercase tracking-widest text-[#888]">
          {label}
        </span>
        <span className="font-display font-bold text-xs text-[#B6FF00]">
          {format ? format(value) : value.toFixed(2)}
        </span>
      </div>
      <div className="relative h-1.5 bg-[#222] group">
        <div
          className="absolute left-0 top-0 bottom-0 bg-[#B6FF00]"
          style={{ width: `${pct}%` }}
        />
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(parseFloat(e.target.value))}
          className="absolute inset-0 w-full opacity-0 cursor-pointer h-full"
        />
        <div
          className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-[#B6FF00] border-2 border-[#0D0D0D] pointer-events-none"
          style={{ left: `calc(${pct}% - 6px)` }}
        />
      </div>
    </div>
  )
}

const SNAP_POSITIONS = [
  { label: 'Center', pos: [0, -0.05] },
  { label: 'Chest',  pos: [0,  0.05] },
  { label: 'Mid',    pos: [0, -0.3 ] },
  { label: 'Lower',  pos: [0, -0.65] },
]

export default function TransformPanel() {
  const { layers, activeLayerId, updateLayer } = useStudioStore()
  const layer = layers.find((l) => l.id === activeLayerId)

  const update = useCallback((patch) => {
    if (activeLayerId) updateLayer(activeLayerId, patch)
  }, [activeLayerId, updateLayer])

  const resetTransform = () => update({
    position:  [0, -0.05, 0.13],
    rotationZ: 0,
    scale:     0.38,
    opacity:   1,
  })

  if (!layer) {
    return (
      <div className="flex flex-col items-center justify-center py-10 px-4 text-center gap-2">
        <p className="font-display font-bold text-xs uppercase tracking-widest text-[#444]">
          Select a layer to transform
        </p>
      </div>
    )
  }

  const rotDeg = (layer.rotationZ * 180) / Math.PI

  return (
    <div className="space-y-5 p-4">

      {/* Sliders */}
      <Slider
        label="Scale"
        value={layer.scale}
        min={0.07} max={1.9} step={0.01}
        onChange={(v) => update({ scale: v })}
      />

      <Slider
        label="Rotation"
        value={rotDeg}
        min={-180} max={180} step={1}
        format={(v) => `${Math.round(v)}°`}
        onChange={(v) => update({ rotationZ: (v * Math.PI) / 180 })}
      />

      <Slider
        label="Opacity"
        value={layer.opacity}
        min={0.1} max={1} step={0.05}
        format={(v) => `${Math.round(v * 100)}%`}
        onChange={(v) => update({ opacity: v })}
      />

      {/* Snap positions */}
      <div>
        <p className="font-display font-black text-[10px] uppercase tracking-widest text-[#888] mb-2">
          Snap Position
        </p>
        <div className="grid grid-cols-4 gap-1.5">
          {SNAP_POSITIONS.map(({ label, pos }) => (
            <button
              key={label}
              onClick={() => update({ position: [pos[0], pos[1], 0.13] })}
              className="
                tap-target py-2 text-center border border-white/10
                font-display font-bold text-[10px] uppercase tracking-wider
                text-[#888] hover:border-[#B6FF00]/50 hover:text-[#B6FF00]
                transition-colors duration-150
              "
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Reset */}
      <button
        onClick={resetTransform}
        className="
          tap-target w-full flex items-center justify-center gap-2 py-2.5
          border border-white/10 text-[#888]
          font-display font-bold text-xs uppercase tracking-widest
          hover:border-white/30 hover:text-[#F5F5F5] transition-colors
        "
      >
        <RotateCcw size={12} strokeWidth={2} />
        Reset Transform
      </button>

      {/* Flip buttons */}
      <div className="grid grid-cols-2 gap-2">
        {[
          { label: 'Flip H', action: () => update({ rotationZ: -layer.rotationZ }) },
          { label: 'Mirror', action: () => update({ position: [-layer.position[0], layer.position[1], layer.position[2]] }) },
        ].map(({ label, action }) => (
          <button
            key={label}
            onClick={action}
            className="
              tap-target py-2.5 border border-white/10 text-[#888]
              font-display font-bold text-[10px] uppercase tracking-widest
              hover:border-white/30 hover:text-[#F5F5F5] transition-colors
            "
          >{label}</button>
        ))}
      </div>
    </div>
  )
}
