import { useState } from 'react'

/**
 * Real photo with colour-grade overlay + design identity.
 * aspect: 'portrait' (3:4) | 'square' (1:1) | 'thumb' (4:5)
 */
export default function DesignImage({ design, aspect = 'portrait', className = '', showLabel = true }) {
  const [imgError, setImgError] = useState(false)

  const aspectClass = {
    portrait: 'aspect-[3/4]',
    square:   'aspect-square',
    thumb:    'aspect-[4/5]',
  }[aspect] ?? 'aspect-[3/4]'

  // If className contains 'w-full h-full', skip the aspect class so parent controls sizing
  const useAspect = !className.includes('h-full')

  return (
    <div className={`relative overflow-hidden bg-[#0E0E0E] ${useAspect ? aspectClass : ''} ${className}`}>

      {/* Photo */}
      {design.image && !imgError ? (
        <img
          src={design.image}
          alt={design.name}
          onError={() => setImgError(true)}
          className="absolute inset-0 w-full h-full object-cover object-center"
          loading="lazy"
        />
      ) : (
        /* Fallback: solid colour block */
        <div
          className="absolute inset-0"
          style={{ background: `${design.color}22` }}
        />
      )}

      {/* Dark vignette so text is always readable */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/30" />

      {/* Colour grade: thin colour wash matching the design */}
      <div
        className="absolute inset-0 mix-blend-color"
        style={{ background: design.color, opacity: 0.18 }}
      />

      {/* Scanline texture */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.04) 2px, rgba(0,0,0,0.04) 4px)',
        }}
      />

      {/* Top-left: rank badge */}
      <div className="absolute top-2.5 left-2.5">
        <div
          className="px-2 py-0.5 font-display font-black text-[9px] uppercase tracking-widest text-[#0D0D0D]"
          style={{ background: design.color }}
        >
          #{design.rank}
        </div>
      </div>

      {/* Top-right: hype */}
      <div className="absolute top-2 right-2.5 text-xl leading-none">
        {design.hype}
      </div>

      {showLabel && (
        /* Bottom: name + designer */
        <div className="absolute bottom-0 left-0 right-0 px-3 pb-3">
          <p
            className="font-display font-black text-xs sm:text-sm uppercase tracking-widest leading-tight"
            style={{ color: design.color }}
          >
            {design.name}
          </p>
          <p className="font-display text-[9px] text-white/50 uppercase tracking-widest mt-0.5">
            {design.designer}
          </p>
        </div>
      )}

      {/* Colour glow border on bottom edge */}
      <div
        className="absolute bottom-0 left-0 right-0 h-[2px]"
        style={{ background: design.color, boxShadow: `0 0 8px ${design.color}` }}
      />
    </div>
  )
}
