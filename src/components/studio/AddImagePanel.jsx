import { useRef, useState } from 'react'
import { Upload, X, Layers } from 'lucide-react'
import gsap from 'gsap'
import { useStudioStore } from '../../store/studioStore'

const MAX_LAYERS = 8
const MAX_BYTES  = 4 * 1024 * 1024   // 4 MB

function compress(dataUrl, maxW = 1024) {
  return new Promise((resolve) => {
    const img = new Image()
    img.onload = () => {
      const scale  = Math.min(1, maxW / img.width)
      const canvas = document.createElement('canvas')
      canvas.width  = img.width  * scale
      canvas.height = img.height * scale
      canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height)
      resolve({ dataUrl: canvas.toDataURL('image/webp', 0.85), aspect: img.width / img.height })
    }
    img.src = dataUrl
  })
}

export default function AddImagePanel() {
  const dropRef  = useRef(null)
  const inputRef = useRef(null)
  const [dragging, setDragging]  = useState(false)
  const [error, setError]        = useState('')
  const { layers, addImageLayer } = useStudioStore()

  const canAdd = layers.length < MAX_LAYERS

  const process = async (file) => {
    setError('')
    if (!file?.type.startsWith('image/')) { setError('Not an image file.'); return }
    if (file.size > MAX_BYTES) { setError('File too large (max 4 MB).'); return }

    const reader = new FileReader()
    reader.onload = async (e) => {
      const { dataUrl: compressed, aspect } = await compress(e.target.result)
      addImageLayer(compressed, aspect)
      gsap.fromTo(dropRef.current,
        { scale: 0.93 }, { scale: 1, duration: 0.45, ease: 'elastic.out(1.5, 0.4)' }
      )
    }
    reader.readAsDataURL(file)
  }

  const onDrop = (e) => { e.preventDefault(); setDragging(false); process(e.dataTransfer.files?.[0]) }

  return (
    <div className="space-y-4 p-4">
      <h3 className="font-display font-black text-xs uppercase tracking-widest text-[#888]">
        Add Image Layer
      </h3>

      {!canAdd ? (
        <div className="p-4 border border-[#FF006E]/30 bg-[#FF006E]/5 text-[#FF006E] font-display font-bold text-xs uppercase tracking-widest text-center">
          Max {MAX_LAYERS} layers reached
        </div>
      ) : (
        <div
          ref={dropRef}
          onClick={() => inputRef.current?.click()}
          onDrop={onDrop}
          onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
          onDragLeave={() => setDragging(false)}
          className={`
            tap-target w-full h-32 border-2 border-dashed flex flex-col items-center justify-center gap-2 cursor-pointer
            transition-all duration-200
            ${dragging ? 'border-[#B6FF00] bg-[#B6FF00]/6' : 'border-white/15 hover:border-white/35'}
          `}
        >
          <Upload size={22} className={dragging ? 'text-[#B6FF00]' : 'text-[#555]'} strokeWidth={1.5} />
          <p className="font-display font-bold text-xs uppercase tracking-widest text-[#888]">
            {dragging ? 'Drop it!' : 'Tap or drag image'}
          </p>
          <p className="font-body text-[10px] text-[#444]">PNG · JPG · WEBP · max 4 MB</p>
        </div>
      )}

      {error && (
        <p className="font-display font-bold text-xs uppercase tracking-widest text-[#FF006E]">{error}</p>
      )}

      <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={(e) => process(e.target.files?.[0])} />

      {layers.filter(l => l.type === 'image').length > 0 && (
        <div className="border border-white/6 p-3 bg-[#0D0D0D]">
          <div className="flex items-center gap-2 mb-1">
            <Layers size={11} className="text-[#B6FF00]" />
            <span className="font-display font-bold text-[10px] uppercase tracking-widest text-[#B6FF00]">
              {layers.filter(l => l.type === 'image').length} image layer{layers.filter(l => l.type === 'image').length > 1 ? 's' : ''}
            </span>
          </div>
          <p className="font-body text-[11px] text-[#444]">Select a layer, then drag to reposition on the shirt.</p>
        </div>
      )}
    </div>
  )
}
