import { lazy, Suspense, useRef, useEffect, useState, useCallback } from 'react'
import { Link } from 'react-router-dom'
import gsap from 'gsap'
import {
  ArrowLeft, Zap, RotateCcw, Palette, Type,
  Image, Smile, Layers, Sliders, Globe, Lock, Upload,
} from 'lucide-react'
import { useStudioStore } from '../store/studioStore'
import ColorPanel          from '../components/studio/ColorPanel'
import AddImagePanel       from '../components/studio/AddImagePanel'
import AddTextPanel        from '../components/studio/AddTextPanel'
import AddStickerPanel     from '../components/studio/AddStickerPanel'
import LayerPanel          from '../components/studio/LayerPanel'
import TransformPanel      from '../components/studio/TransformPanel'
import SubmitModal         from '../components/studio/SubmitModal'
import UploadDesignPanel   from '../components/studio/UploadDesignPanel'

const StudioCanvas = lazy(() => import('../components/studio/StudioCanvas'))

/* ── Tool definitions ────────────────────────────────── */
const TOOLS = [
  { id: 'color',     icon: Palette, label: 'Color',    panel: ColorPanel,      hint: 'Fabric'   },
  { id: 'image',     icon: Image,   label: 'Image',    panel: AddImagePanel,   hint: 'Upload'   },
  { id: 'text',      icon: Type,    label: 'Text',     panel: AddTextPanel,    hint: 'Add'      },
  { id: 'sticker',   icon: Smile,   label: 'Sticker',  panel: AddStickerPanel, hint: 'Add'      },
  { id: 'layers',    icon: Layers,  label: 'Layers',   panel: LayerPanel,      hint: 'Manage'   },
  { id: 'transform', icon: Sliders, label: 'Transform',panel: TransformPanel,  hint: 'Edit'     },
]

/* ── Tool button ─────────────────────────────────────── */
function ToolBtn({ tool, active, onClick, badge }) {
  const ref  = useRef(null)
  const Icon = tool.icon

  const tap = () => {
    onClick(tool.id)
    gsap.timeline()
      .to(ref.current, { scale: 0.85, duration: 0.08 })
      .to(ref.current, { scale: 1,    duration: 0.38, ease: 'elastic.out(1.6, 0.4)' })
  }

  return (
    <button
      ref={ref}
      onMouseDown={tap} onTouchStart={tap}
      className={`
        tap-target relative flex flex-col items-center gap-1 p-2 transition-colors duration-150
        ${active ? 'text-[#B6FF00]' : 'text-[#888] hover:text-[#F5F5F5]'}
      `}
    >
      <div className={`
        w-10 h-10 md:w-11 md:h-11 flex items-center justify-center border transition-colors
        ${active ? 'border-[#B6FF00] bg-[#B6FF00]/10' : 'border-white/10 hover:border-white/25'}
      `}>
        <Icon size={17} strokeWidth={active ? 2.5 : 1.8} />
      </div>
      <span className="font-display font-bold text-[8px] md:text-[9px] uppercase tracking-widest leading-none">
        {tool.hint}
      </span>
      {badge > 0 && (
        <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-[#B6FF00] text-[#0D0D0D] rounded-full font-display font-black text-[9px] flex items-center justify-center">
          {badge}
        </span>
      )}
    </button>
  )
}

/* ── Slide panel (desktop right / mobile bottom-sheet) ─ */
function SlidePanel({ toolId, open }) {
  const panelRef = useRef(null)
  const isMobile = window.innerWidth < 768
  const PanelComponent = TOOLS.find((t) => t.id === toolId)?.panel

  useEffect(() => {
    const el = panelRef.current
    if (!el) return
    if (isMobile) {
      gsap.to(el, { y: open ? 0 : '100%', duration: 0.38, ease: open ? 'power3.out' : 'power3.in' })
    } else {
      gsap.to(el, {
        x:       open ? 0 : '105%',
        opacity: open ? 1 : 0,
        duration: 0.32,
        ease: open ? 'power3.out' : 'power2.in',
      })
    }
  }, [open, isMobile])

  return (
    <div
      ref={panelRef}
      style={isMobile ? { transform: 'translateY(100%)' } : { transform: 'translateX(105%)', opacity: 0 }}
      className={`
        ${isMobile
          ? 'fixed bottom-[68px] left-0 right-0 z-30 bg-[#111111] border-t border-white/8 max-h-[60vh] overflow-y-auto'
          : 'absolute top-0 right-0 bottom-0 w-72 bg-[#111111] border-l border-white/8 overflow-y-auto z-10 shadow-2xl'
        }
      `}
    >
      {/* Drag handle (mobile) */}
      {isMobile && (
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 bg-white/20 rounded-full" />
        </div>
      )}
      {/* Panel header */}
      <div className="sticky top-0 bg-[#111111]/95 backdrop-blur border-b border-white/6 px-4 py-2.5 z-10">
        <p className="font-display font-black text-sm uppercase tracking-widest text-[#F5F5F5]">
          {TOOLS.find((t) => t.id === toolId)?.label}
        </p>
      </div>

      {PanelComponent && <PanelComponent />}
    </div>
  )
}

/* ── Visibility toggle (inside top bar) ─────────────── */
function VisibilityBtn() {
  const visibility    = useStudioStore((s) => s.visibility)
  const setVisibility = useStudioStore((s) => s.setVisibility)
  const isPublic = visibility === 'public'

  return (
    <button
      onClick={() => setVisibility(isPublic ? 'private' : 'public')}
      className={`
        tap-target flex items-center gap-1.5 px-3 py-1.5 border text-xs
        font-display font-black uppercase tracking-widest transition-all
        ${isPublic
          ? 'border-[#B6FF00]/50 text-[#B6FF00] bg-[#B6FF00]/8'
          : 'border-white/15 text-[#888]'}
      `}
    >
      {isPublic ? <Globe size={12} strokeWidth={2.5} /> : <Lock size={12} strokeWidth={2.5} />}
      <span className="hidden sm:block">{isPublic ? 'Public' : 'Private'}</span>
    </button>
  )
}

/* ── Mode toggle (3D Studio vs Upload) ───────────────── */
function ModeToggle({ mode, setMode }) {
  return (
    <div className="flex border border-white/10 overflow-hidden">
      {[
        { id: 'studio', label: '3D Studio' },
        { id: 'upload', label: 'Upload',   },
      ].map(({ id, label }) => (
        <button
          key={id}
          onClick={() => setMode(id)}
          className={`
            tap-target flex items-center gap-1.5 px-3 py-1.5
            font-display font-black text-[10px] uppercase tracking-widest
            transition-all duration-150
            ${mode === id
              ? 'bg-[#B6FF00] text-[#0D0D0D]'
              : 'text-[#555] hover:text-[#F5F5F5]'
            }
          `}
        >
          {id === 'upload' && <Upload size={10} strokeWidth={3} />}
          {label}
        </button>
      ))}
    </div>
  )
}

/* ── Main page ───────────────────────────────────────── */
export default function Studio() {
  const [activeTool,  setActiveTool]  = useState(null)
  const [panelOpen,   setPanelOpen]   = useState(false)
  const [showSubmit,  setShowSubmit]  = useState(false)
  const [mode,        setMode]        = useState('studio') // 'studio' | 'upload'

  const { designId, layers, resetDesign } = useStudioStore()
  const layerCount = layers.length
  const headerRef  = useRef(null)
  const footerRef  = useRef(null)

  useEffect(() => {
    gsap.fromTo(headerRef.current,
      { y: -40, opacity: 0 }, { y: 0, opacity: 1, duration: 0.55, ease: 'power3.out', delay: 0.1 }
    )
    gsap.fromTo(footerRef.current,
      { y: 40,  opacity: 0 }, { y: 0, opacity: 1, duration: 0.55, ease: 'power3.out', delay: 0.2 }
    )
  }, [])

  const selectTool = useCallback((id) => {
    if (activeTool === id && panelOpen) {
      setPanelOpen(false)
    } else {
      setActiveTool(id)
      setPanelOpen(true)
    }
  }, [activeTool, panelOpen])

  const isMobile = window.innerWidth < 768
  const panelW   = 288  // pixels

  return (
    <div className="fixed inset-0 bg-[#0D0D0D] flex flex-col overflow-hidden">

      {/* ── Top bar ───────────────────────────────── */}
      <header
        ref={headerRef}
        className="shrink-0 h-13 flex items-center justify-between px-3 border-b border-white/8 bg-[#0D0D0D] z-20"
        style={{ height: 52 }}
      >
        <div className="flex items-center gap-2.5">
          <Link to="/" className="tap-target flex items-center gap-1.5 text-[#888] hover:text-[#F5F5F5] transition-colors">
            <ArrowLeft size={15} strokeWidth={2} />
            <span className="font-display font-bold text-xs uppercase tracking-widest hidden sm:block">Arena</span>
          </Link>
          <div className="w-px h-4 bg-white/10" />
          <ModeToggle mode={mode} setMode={(m) => { setMode(m); if (panelOpen) setPanelOpen(false) }} />
        </div>

        <div className="flex items-center gap-2">
          {mode === 'studio' && (
            <>
              <VisibilityBtn />
              <button
                onClick={resetDesign}
                className="tap-target p-2 text-[#888] hover:text-[#F5F5F5] border border-white/10 hover:border-white/25 transition-colors"
                title="Reset all layers"
              >
                <RotateCcw size={14} strokeWidth={2} />
              </button>
              <button
                onClick={() => setShowSubmit(true)}
                className="
                  tap-target flex items-center gap-1.5
                  bg-[#B6FF00] text-[#0D0D0D]
                  font-display font-black text-xs uppercase tracking-widest
                  px-4 py-2 animate-pulse-glow hover:bg-[#ccff33] transition-colors
                "
              >
                <Zap size={13} strokeWidth={3} />
                <span className="hidden sm:block">Drop</span>
              </button>
            </>
          )}
        </div>
      </header>

      {/* ── Main body: 3D Studio or Upload panel ──── */}
      {mode === 'upload' ? (
        <div className="flex-1 overflow-y-auto flex justify-center bg-[#0D0D0D]">
          <UploadDesignPanel />
        </div>
      ) : (
        <>
          {/* Canvas area */}
          <div
            className="flex-1 relative overflow-hidden"
            style={{ marginRight: !isMobile && panelOpen ? panelW : 0, transition: 'margin-right 0.32s cubic-bezier(0.4,0,0.2,1)' }}
          >
            <Suspense fallback={
              <div className="w-full h-full flex items-center justify-center">
                <div className="text-center space-y-3">
                  <div className="w-10 h-10 border-2 border-[#B6FF00] border-t-transparent rounded-full animate-spin mx-auto" />
                  <p className="font-display font-bold text-xs uppercase tracking-widest text-[#B6FF00] animate-pulse">Loading</p>
                </div>
              </div>
            }>
              <StudioCanvas />
            </Suspense>

            <div className="absolute bottom-3 left-0 right-0 flex flex-col items-center gap-1 pointer-events-none">
              {layerCount === 0 ? (
                <p className="font-display font-bold text-[10px] uppercase tracking-widest text-[#2A2A2A]">
                  Add layers with the tools below
                </p>
              ) : (
                <p className="font-display font-bold text-[10px] uppercase tracking-widest text-[#2A2A2A]">
                  Drag decal · Pinch resize · Two-finger rotate
                </p>
              )}
            </div>

            {!isMobile && <SlidePanel toolId={activeTool} open={panelOpen} />}
          </div>

          {/* Bottom toolbar */}
          <footer
            ref={footerRef}
            className="shrink-0 flex items-center border-t border-white/8 bg-[#0D0D0D] z-20"
            style={{ height: 68 }}
          >
            <div className="flex items-center flex-1 overflow-x-auto gap-0.5 px-1">
              {TOOLS.map((tool) => (
                <ToolBtn
                  key={tool.id}
                  tool={tool}
                  active={activeTool === tool.id && panelOpen}
                  onClick={selectTool}
                  badge={tool.id === 'layers' ? layerCount : undefined}
                />
              ))}
            </div>
          </footer>

          {isMobile && <SlidePanel toolId={activeTool} open={panelOpen} />}
        </>
      )}

      {/* Submit modal */}
      {showSubmit && <SubmitModal onClose={() => setShowSubmit(false)} />}
    </div>
  )
}
