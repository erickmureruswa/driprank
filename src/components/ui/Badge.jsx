export default function Badge({ children, variant = 'lime', className = '' }) {
  const variants = {
    lime: 'bg-[#B6FF00] text-[#0D0D0D]',
    blue: 'bg-[#00D1FF] text-[#0D0D0D]',
    magenta: 'bg-[#FF006E] text-white',
    ghost: 'bg-[#1A1A1A] text-[#888888] border border-[#3A3A3A]',
    live: 'bg-[#FF006E] text-white animate-pulse',
  }

  return (
    <span className={`
      inline-flex items-center gap-1
      font-display font-black text-xs uppercase tracking-widest
      px-2 py-0.5
      ${variants[variant]}
      ${className}
    `}>
      {variant === 'live' && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
      {children}
    </span>
  )
}
