import { useState, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Upload, X, Globe, Lock, CheckCircle, AlertCircle, Loader } from 'lucide-react'
import { publishDesign } from '../../lib/designUpload'
import { useLeaderboardStore } from '../../store/leaderboardStore'

const ACCENT_COLORS = [
  { hex: '#B6FF00', label: 'Lime'    },
  { hex: '#00D1FF', label: 'Cyan'    },
  { hex: '#FF006E', label: 'Magenta' },
]

const MAX_BYTES = 10 * 1024 * 1024 // 10 MB

export default function UploadDesignPanel() {
  const navigate    = useNavigate()
  const fetchDesigns = useLeaderboardStore((s) => s.fetchDesigns)

  const [file,       setFile]       = useState(null)
  const [preview,    setPreview]    = useState(null)
  const [name,       setName]       = useState('')
  const [color,      setColor]      = useState('#B6FF00')
  const [visibility, setVisibility] = useState('public')
  const [dragging,   setDragging]   = useState(false)
  const [status,     setStatus]     = useState('idle') // idle | uploading | success | error
  const [errMsg,     setErrMsg]     = useState('')

  const inputRef = useRef(null)

  const accept = useCallback((f) => {
    if (!f) return
    if (!f.type.startsWith('image/')) { setErrMsg('Must be an image file (PNG, JPG, WEBP).'); return }
    if (f.size > MAX_BYTES) { setErrMsg('File too large — max 10 MB.'); return }
    setErrMsg('')
    setFile(f)
    setPreview(URL.createObjectURL(f))
    if (!name) setName(f.name.replace(/\.[^.]+$/, '').replace(/[-_]/g, ' '))
  }, [name])

  const onDrop = useCallback((e) => {
    e.preventDefault()
    setDragging(false)
    accept(e.dataTransfer.files?.[0])
  }, [accept])

  const clear = () => {
    setFile(null)
    if (preview) URL.revokeObjectURL(preview)
    setPreview(null)
    setStatus('idle')
    setErrMsg('')
  }

  const submit = async () => {
    if (!file || !name.trim()) return
    setStatus('uploading')
    setErrMsg('')
    try {
      await publishDesign({ name, file, visibility, color })
      setStatus('success')
      await fetchDesigns()
      setTimeout(() => navigate('/leaderboard'), 1200)
    } catch (e) {
      setErrMsg(e.message || 'Upload failed. Try again.')
      setStatus('error')
    }
  }

  const canSubmit = file && name.trim().length > 0 && status === 'idle'

  /* ── Render ──────────────────────────────────────────────── */
  return (
    <div className="flex flex-col items-center justify-start p-5 gap-5 max-w-lg w-full">

      {/* Drop zone / preview */}
      {!preview ? (
        <div
          onClick={() => inputRef.current?.click()}
          onDrop={onDrop}
          onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
          onDragLeave={() => setDragging(false)}
          className={`
            w-full aspect-[4/3] border-2 border-dashed cursor-pointer
            flex flex-col items-center justify-center gap-3
            transition-all duration-200
            ${dragging
              ? 'border-[#B6FF00] bg-[#B6FF00]/8 scale-[1.01]'
              : 'border-white/15 hover:border-white/35 bg-white/2'
            }
          `}
        >
          <Upload size={32} strokeWidth={1.5} className={dragging ? 'text-[#B6FF00]' : 'text-[#444]'} />
          <div className="text-center">
            <p className="font-display font-black text-sm uppercase tracking-widest text-[#888]">
              {dragging ? 'Drop it' : 'Drop image or tap to browse'}
            </p>
            <p className="font-body text-xs text-[#444] mt-1">PNG · JPG · WEBP · max 10 MB</p>
          </div>
        </div>
      ) : (
        <div className="w-full relative group">
          <img
            src={preview}
            alt="preview"
            className="w-full object-cover border border-white/10"
            style={{ maxHeight: 340 }}
          />
          <button
            onClick={clear}
            className="absolute top-2 right-2 w-8 h-8 bg-black/70 border border-white/20 flex items-center justify-center text-[#888] hover:text-[#F5F5F5] transition-colors"
          >
            <X size={14} strokeWidth={2} />
          </button>
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => accept(e.target.files?.[0])}
      />

      {/* Design name */}
      <div className="w-full space-y-1.5">
        <label className="font-display font-black text-[10px] uppercase tracking-widest text-[#555] block">
          Design Name *
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. ACID FUTURE"
          maxLength={40}
          className="
            w-full bg-[#1A1A1A] border border-white/10 px-4 py-3
            font-display font-black text-sm uppercase tracking-widest text-[#F5F5F5]
            placeholder:text-[#333] focus:outline-none focus:border-[#B6FF00]
            transition-colors
          "
        />
      </div>

      {/* Accent colour */}
      <div className="w-full space-y-1.5">
        <label className="font-display font-black text-[10px] uppercase tracking-widest text-[#555] block">
          Accent Colour
        </label>
        <div className="flex gap-3">
          {ACCENT_COLORS.map(({ hex, label }) => (
            <button
              key={hex}
              onClick={() => setColor(hex)}
              className={`
                flex-1 py-2.5 border font-display font-black text-[10px] uppercase tracking-widest
                transition-all duration-150
                ${color === hex
                  ? 'border-current text-[#0D0D0D]'
                  : 'border-white/10 text-[#555] hover:border-white/30'
                }
              `}
              style={color === hex ? { background: hex, borderColor: hex, color: '#0D0D0D' } : {}}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Visibility toggle */}
      <div className="w-full space-y-1.5">
        <label className="font-display font-black text-[10px] uppercase tracking-widest text-[#555] block">
          Visibility
        </label>
        <div className="flex border border-white/10 overflow-hidden">
          {[
            { val: 'public',  label: 'Public — enters leaderboard',  Icon: Globe },
            { val: 'private', label: 'Private — hidden',              Icon: Lock  },
          ].map(({ val, label, Icon }) => (
            <button
              key={val}
              onClick={() => setVisibility(val)}
              className={`
                flex-1 flex items-center justify-center gap-2 py-3 text-xs
                font-display font-black uppercase tracking-widest
                transition-all duration-150
                ${visibility === val
                  ? val === 'public'
                    ? 'bg-[#B6FF00] text-[#0D0D0D]'
                    : 'bg-white/10 text-[#F5F5F5]'
                  : 'text-[#555] hover:text-[#888]'
                }
              `}
            >
              <Icon size={11} strokeWidth={2.5} />
              {val === 'public' ? 'Public' : 'Private'}
            </button>
          ))}
        </div>
        <p className="font-body text-[10px] text-[#444]">
          {visibility === 'public'
            ? 'Your design goes live in the leaderboard immediately.'
            : 'Only you can see this design.'}
        </p>
      </div>

      {/* Error */}
      {errMsg && (
        <div className="w-full flex items-center gap-2 p-3 bg-[#FF006E]/8 border border-[#FF006E]/30 text-[#FF006E]">
          <AlertCircle size={14} strokeWidth={2} />
          <span className="font-display font-bold text-xs uppercase tracking-widest">{errMsg}</span>
        </div>
      )}

      {/* Submit */}
      <button
        onClick={submit}
        disabled={!canSubmit || status === 'uploading'}
        className={`
          w-full py-4 flex items-center justify-center gap-2.5
          font-display font-black text-sm uppercase tracking-widest
          transition-all duration-200
          ${canSubmit && status === 'idle'
            ? 'bg-[#B6FF00] text-[#0D0D0D] hover:bg-[#ccff33]'
            : status === 'uploading'
            ? 'bg-[#B6FF00]/40 text-[#0D0D0D]/60 cursor-not-allowed'
            : status === 'success'
            ? 'bg-[#25D366] text-white'
            : 'bg-white/5 text-[#333] cursor-not-allowed border border-white/8'
          }
        `}
      >
        {status === 'uploading' && <Loader size={15} strokeWidth={2.5} className="animate-spin" />}
        {status === 'success'   && <CheckCircle size={15} strokeWidth={2.5} />}
        {status === 'uploading' ? 'Uploading...'
         : status === 'success' ? 'Published! Redirecting...'
         : 'Publish Design'}
      </button>

    </div>
  )
}
