import { useState, useEffect } from 'react'
import { Clock } from 'lucide-react'

function getSecondsUntilMonday() {
  const now = new Date()
  const next = new Date(now)
  const day  = now.getDay()          // 0=Sun … 6=Sat
  const daysUntilMonday = day === 0 ? 1 : 8 - day
  next.setDate(now.getDate() + daysUntilMonday)
  next.setHours(0, 0, 0, 0)
  return Math.max(0, Math.floor((next - now) / 1000))
}

function fmt(s) {
  const d = Math.floor(s / 86400)
  const h = Math.floor((s % 86400) / 3600)
  const m = Math.floor((s % 3600) / 60)
  const sec = s % 60
  return { d, h, m, sec }
}

function Seg({ val, label }) {
  return (
    <div className="flex flex-col items-center">
      <span className="font-display font-black text-xl sm:text-2xl text-[#F5F5F5] tabular-nums leading-none">
        {String(val).padStart(2, '0')}
      </span>
      <span className="font-display font-bold text-[8px] uppercase tracking-widest text-[#555] mt-0.5">
        {label}
      </span>
    </div>
  )
}

export default function WeeklyTimer() {
  const [secs, setSecs] = useState(getSecondsUntilMonday)

  useEffect(() => {
    const id = setInterval(() => setSecs((s) => (s > 0 ? s - 1 : 0)), 1000)
    return () => clearInterval(id)
  }, [])

  const { d, h, m, sec } = fmt(secs)

  return (
    <div className="flex items-center gap-3 px-4 py-2.5 bg-[#111111] border border-white/8">
      <Clock size={13} strokeWidth={2} className="text-[#B6FF00] shrink-0" />
      <span className="font-display font-bold text-[10px] uppercase tracking-widest text-[#555]">
        Resets in
      </span>
      <div className="flex items-center gap-2.5">
        <Seg val={d}   label="D" />
        <span className="font-display font-black text-lg text-[#333] pb-1">:</span>
        <Seg val={h}   label="H" />
        <span className="font-display font-black text-lg text-[#333] pb-1">:</span>
        <Seg val={m}   label="M" />
        <span className="font-display font-black text-lg text-[#333] pb-1">:</span>
        <Seg val={sec} label="S" />
      </div>
    </div>
  )
}
