const SHIRT   = "M35,18 L18,10 L4,52 L20,57 L20,108 L80,108 L80,57 L96,52 L82,10 L65,18 C60,28 40,28 35,18Z"
const COLLAR  = "M35,18 C40,28 60,28 65,18"

const DIMS = {
  xs: { w: 44,  h: 53  },
  sm: { w: 56,  h: 68  },
  md: { w: 88,  h: 106 },
  lg: { w: 120, h: 145 },
  xl: { w: 200, h: 241 },
}

const FONT_SIZES = { xs: 16, sm: 20, md: 24, lg: 30, xl: 48 }
const LABEL_SIZES = { xs: 0, sm: 0, md: 5.5, lg: 6.5, xl: 9 }

export default function ShirtThumb({ design, size = 'md', className = '' }) {
  const { w, h } = DIMS[size] ?? DIMS.md
  const emojiSize  = FONT_SIZES[size] ?? 24
  const labelSize  = LABEL_SIZES[size] ?? 5.5
  const gid = `s_${design.id}_${size}`

  return (
    <div
      className={`shrink-0 relative ${className}`}
      style={{ width: w, height: h }}
    >
      <svg viewBox="0 0 100 120" width={w} height={h} xmlns="http://www.w3.org/2000/svg">
        <defs>
          {/* Radial color fill */}
          <radialGradient id={`${gid}_rg`} cx="50%" cy="38%" r="62%">
            <stop offset="0%"   stopColor={design.color} stopOpacity="0.32" />
            <stop offset="65%"  stopColor={design.color} stopOpacity="0.10" />
            <stop offset="100%" stopColor="#000000"       stopOpacity="0.60" />
          </radialGradient>

          {/* Highlight gradient (top-left shoulder) */}
          <linearGradient id={`${gid}_hl`} x1="0%" y1="0%" x2="60%" y2="80%">
            <stop offset="0%"   stopColor="#ffffff" stopOpacity="0.08" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0.00" />
          </linearGradient>

          {/* Glow drop-shadow on stroke */}
          <filter id={`${gid}_glow`} x="-25%" y="-25%" width="150%" height="150%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="2" result="blur" />
            <feColorMatrix in="blur" type="matrix"
              values={`0 0 0 0 ${hexR(design.color)}
                       0 0 0 0 ${hexG(design.color)}
                       0 0 0 0 ${hexB(design.color)}
                       0 0 0 1 0`}
              result="coloredBlur"
            />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          {/* Scan-line texture */}
          <pattern id={`${gid}_sl`} x="0" y="0" width="100" height="3" patternUnits="userSpaceOnUse">
            <rect width="100" height="0.6" fill="white" fillOpacity="0.025" />
          </pattern>

          {/* Clip path */}
          <clipPath id={`${gid}_clip`}>
            <path d={SHIRT} />
          </clipPath>
        </defs>

        {/* ── Base: very dark shirt body ── */}
        <path d={SHIRT} fill="#0E0E0E" />

        {/* ── Color radial fill ── */}
        <path d={SHIRT} fill={`url(#${gid}_rg)`} />

        {/* ── Highlight ── */}
        <path d={SHIRT} fill={`url(#${gid}_hl)`} />

        {/* ── Scan lines (clipped) ── */}
        <rect x="0" y="0" width="100" height="120"
          fill={`url(#${gid}_sl)`}
          clipPath={`url(#${gid}_clip)`}
        />

        {/* ── Print box (chest) ── */}
        <rect x="29" y="46" width="42" height="42" rx="1"
          fill={design.color} fillOpacity="0.05"
          stroke={design.color} strokeWidth="0.5" strokeOpacity="0.35"
        />

        {/* ── Hype emoji ── */}
        <text
          x="50" y="70"
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize={emojiSize}
          style={{ userSelect: 'none' }}
        >{design.hype}</text>

        {/* ── Design name label ── */}
        {labelSize > 0 && (
          <text
            x="50" y="100"
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize={labelSize}
            fontFamily="'Barlow Condensed', 'Arial Narrow', sans-serif"
            fontWeight="900"
            letterSpacing="2"
            fill={design.color}
            fillOpacity="0.65"
          >
            {design.name.slice(0, 13).toUpperCase()}
          </text>
        )}

        {/* ── Shirt outline with color glow ── */}
        <path
          d={SHIRT}
          fill="none"
          stroke={design.color}
          strokeWidth="1"
          strokeOpacity="0.55"
          filter={`url(#${gid}_glow)`}
        />

        {/* ── Collar accent ── */}
        <path
          d={COLLAR}
          fill="none"
          stroke={design.color}
          strokeWidth="1.4"
          strokeOpacity="0.7"
        />

        {/* ── Subtle seam lines ── */}
        <line x1="20" y1="57" x2="20" y2="108" stroke="white" strokeWidth="0.4" strokeOpacity="0.06" />
        <line x1="80" y1="57" x2="80" y2="108" stroke="white" strokeWidth="0.4" strokeOpacity="0.06" />
        <line x1="20" y1="108" x2="80" y2="108" stroke={design.color} strokeWidth="0.7" strokeOpacity="0.45" />
      </svg>
    </div>
  )
}

/* ── hex → 0–1 channel helpers for feColorMatrix ── */
function hexR(hex) { return parseInt(hex.slice(1,3),16)/255 }
function hexG(hex) { return parseInt(hex.slice(3,5),16)/255 }
function hexB(hex) { return parseInt(hex.slice(5,7),16)/255 }
