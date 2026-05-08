import { useRef, useState } from 'react'
import { Upload, X, ImageIcon } from 'lucide-react'
import gsap from 'gsap'
import { useDesignStore } from '../../store/designStore'

export default function UploadPanel() {
  const uploadedImage   = useDesignStore((s) => s.uploadedImage)
  const setUploadedImage = useDesignStore((s) => s.setUploadedImage)
  const [dragging, setDragging]  = useState(false)
  const dropRef = useRef(null)
  const inputRef = useRef(null)

  const processFile = (file) => {
    if (!file || !file.type.startsWith('image/')) return
    const reader = new FileReader()
    reader.onload = (e) => {
      setUploadedImage(e.target.result)
      gsap.fromTo(dropRef.current, { scale: 0.95 }, { scale: 1, duration: 0.4, ease: 'elastic.out(1.5, 0.4)' })
    }
    reader.readAsDataURL(file)
  }

  const onFileChange = (e) => processFile(e.target.files?.[0])

  const onDrop = (e) => {
    e.preventDefault()
    setDragging(false)
    processFile(e.dataTransfer.files?.[0])
  }

  const onDragOver = (e) => { e.preventDefault(); setDragging(true) }
  const onDragLeave = () => setDragging(false)

  return (
    <div className="space-y-4 p-4">
      <h3 className="font-display font-black text-xs uppercase tracking-widest text-[#888]">
        Upload Image
      </h3>

      {!uploadedImage ? (
        <div
          ref={dropRef}
          onClick={() => inputRef.current?.click()}
          onDrop={onDrop}
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          className={`
            tap-target w-full h-36 border-2 border-dashed flex flex-col items-center justify-center gap-2
            cursor-pointer transition-all duration-200
            ${dragging
              ? 'border-[#B6FF00] bg-[#B6FF00]/5'
              : 'border-white/20 hover:border-white/40 hover:bg-white/2'
            }
          `}
        >
          <Upload size={24} className={dragging ? 'text-[#B6FF00]' : 'text-[#888]'} strokeWidth={1.5} />
          <p className="font-display font-bold text-xs uppercase tracking-widest text-[#888] text-center">
            {dragging ? 'Drop it!' : 'Tap or drag image'}
          </p>
          <p className="font-body text-[10px] text-[#444]">PNG · JPG · WEBP</p>
        </div>
      ) : (
        <div className="relative">
          <img
            src={uploadedImage}
            alt="Uploaded design"
            className="w-full h-36 object-contain bg-[#1A1A1A] border border-white/10"
          />
          <button
            onClick={() => setUploadedImage(null)}
            className="
              tap-target absolute top-2 right-2 w-7 h-7
              bg-[#FF006E] text-white flex items-center justify-center
              hover:bg-red-500 transition-colors
            "
          >
            <X size={14} strokeWidth={2.5} />
          </button>
          <div className="mt-2 flex items-center gap-2">
            <ImageIcon size={12} className="text-[#B6FF00]" />
            <span className="font-display font-bold text-xs uppercase tracking-widest text-[#B6FF00]">
              Applied to shirt
            </span>
          </div>
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={onFileChange}
      />

      <p className="font-body text-xs text-[#444] leading-relaxed">
        Your image is applied to the chest area. Best results with transparent PNG files.
      </p>
    </div>
  )
}
