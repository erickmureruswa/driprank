import { useRef } from 'react'
import { Trash2, Eye, EyeOff, ChevronUp, ChevronDown, Image, Type, Smile } from 'lucide-react'
import gsap from 'gsap'
import { useStudioStore } from '../../store/studioStore'

const TYPE_ICON = { image: Image, text: Type, sticker: Smile }
const TYPE_LABEL = { image: 'IMG', text: 'TXT', sticker: 'STK' }

function LayerRow({ layer, isActive, index, total }) {
  const rowRef = useRef(null)
  const { selectLayer, removeLayer, updateLayer, moveLayerUp, moveLayerDown } = useStudioStore()

  const del = (e) => {
    e.stopPropagation()
    gsap.to(rowRef.current, {
      x: 60, opacity: 0, duration: 0.25, ease: 'power2.in',
      onComplete: () => removeLayer(layer.id),
    })
  }

  const toggleVis = (e) => {
    e.stopPropagation()
    updateLayer(layer.id, { visible: !layer.visible })
  }

  const Icon = TYPE_ICON[layer.type] ?? Image

  return (
    <div
      ref={rowRef}
      onClick={() => selectLayer(layer.id)}
      className={`
        tap-target flex items-center gap-3 px-3 py-2.5 cursor-pointer
        border-l-2 transition-all duration-150 select-none
        ${isActive
          ? 'border-[#B6FF00] bg-[#B6FF00]/8 text-[#F5F5F5]'
          : 'border-transparent hover:border-white/20 hover:bg-white/3 text-[#888]'
        }
      `}
    >
      {/* Type badge */}
      <div className={`
        w-8 h-8 shrink-0 flex items-center justify-center border text-[10px]
        font-display font-black uppercase tracking-wide
        ${isActive ? 'border-[#B6FF00]/40 text-[#B6FF00]' : 'border-white/10'}
      `}>
        <Icon size={13} strokeWidth={isActive ? 2.5 : 1.8} />
      </div>

      {/* Label */}
      <div className="flex-1 min-w-0">
        <p className={`font-display font-bold text-xs uppercase tracking-widest truncate
          ${isActive ? 'text-[#F5F5F5]' : 'text-[#888]'}`}>
          {layer.type === 'text'
            ? layer.text.slice(0, 14)
            : layer.type === 'sticker'
              ? `${layer.sticker} Sticker`
              : `Image ${TYPE_LABEL[layer.type]}`}
        </p>
        <p className="font-display text-[9px] uppercase tracking-widest text-[#444] mt-0.5">
          S:{layer.scale.toFixed(2)} R:{((layer.rotationZ * 180) / Math.PI).toFixed(0)}°
        </p>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-1 shrink-0">
        <button
          onClick={(e) => { e.stopPropagation(); moveLayerUp(layer.id) }}
          disabled={index === total - 1}
          className="tap-target p-1 text-[#555] hover:text-[#F5F5F5] disabled:opacity-20 transition-colors"
        ><ChevronUp size={12} strokeWidth={2.5} /></button>
        <button
          onClick={(e) => { e.stopPropagation(); moveLayerDown(layer.id) }}
          disabled={index === 0}
          className="tap-target p-1 text-[#555] hover:text-[#F5F5F5] disabled:opacity-20 transition-colors"
        ><ChevronDown size={12} strokeWidth={2.5} /></button>
        <button onClick={toggleVis} className="tap-target p-1 text-[#555] hover:text-[#F5F5F5] transition-colors">
          {layer.visible ? <Eye size={12} strokeWidth={2} /> : <EyeOff size={12} strokeWidth={2} />}
        </button>
        <button onClick={del} className="tap-target p-1 text-[#555] hover:text-[#FF006E] transition-colors">
          <Trash2 size={12} strokeWidth={2} />
        </button>
      </div>
    </div>
  )
}

export default function LayerPanel() {
  const { layers, activeLayerId } = useStudioStore()

  if (!layers.length) {
    return (
      <div className="flex flex-col items-center justify-center py-10 px-4 gap-3 text-center">
        <div className="w-12 h-12 border border-dashed border-white/15 flex items-center justify-center">
          <Image size={20} className="text-[#444]" strokeWidth={1.5} />
        </div>
        <p className="font-display font-bold text-xs uppercase tracking-widest text-[#444]">
          No layers yet
        </p>
        <p className="font-body text-[11px] text-[#333] leading-relaxed">
          Add an image, text, or sticker using the tools below.
        </p>
      </div>
    )
  }

  return (
    <div className="py-1">
      <div className="px-3 pb-2 pt-1 flex items-center justify-between">
        <span className="font-display font-black text-[10px] uppercase tracking-widest text-[#888]">
          Layers ({layers.length}/8)
        </span>
        <span className="font-display text-[10px] text-[#444] uppercase tracking-widest">
          Tap to select
        </span>
      </div>

      <div className="flex flex-col divide-y divide-white/4">
        {[...layers].reverse().map((layer, i) => (
          <LayerRow
            key={layer.id}
            layer={layer}
            isActive={layer.id === activeLayerId}
            index={layers.length - 1 - i}
            total={layers.length}
          />
        ))}
      </div>
    </div>
  )
}
