const PALETTE = ['#B6FF00', '#00D1FF', '#FF006E', '#FFB800', '#A855F7']

function hashColor(str) {
  let h = 0
  for (const c of (str || '')) h = c.charCodeAt(0) + ((h << 5) - h)
  return PALETTE[Math.abs(h) % PALETTE.length]
}

export default function Avatar({ username = '?', url, size = 64, className = '' }) {
  const color  = hashColor(username)
  const letter = (username[0] || '?').toUpperCase()
  const px     = `${size}px`

  if (url) {
    return (
      <img
        src={url}
        alt={username}
        style={{ width: px, height: px }}
        className={`object-cover border-2 border-white/10 shrink-0 ${className}`}
      />
    )
  }

  return (
    <div
      style={{ width: px, height: px, background: color, flexShrink: 0 }}
      className={`flex items-center justify-center border-2 border-white/10 ${className}`}
    >
      <span
        style={{ fontSize: `${size * 0.42}px`, color: '#0D0D0D', lineHeight: 1 }}
        className="font-display font-black select-none"
      >
        {letter}
      </span>
    </div>
  )
}
