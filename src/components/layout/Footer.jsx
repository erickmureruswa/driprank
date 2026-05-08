import { Link } from 'react-router-dom'
import { Zap } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="border-t border-white/6 bg-[#0D0D0D] mt-auto">
      {/* Top strip */}
      <div className="bg-[#B6FF00] py-3 overflow-hidden">
        <div className="animate-ticker flex gap-16 whitespace-nowrap">
          {Array(8).fill('DESIGN. COMPETE. DOMINATE.').map((t, i) => (
            <span key={i} className="font-display font-black text-sm uppercase tracking-widest text-[#0D0D0D]">
              {t} ★
            </span>
          ))}
        </div>
      </div>

      <div className="max-w-screen-xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">

          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-[#B6FF00] flex items-center justify-center">
                <Zap size={16} className="text-[#0D0D0D] fill-[#0D0D0D]" strokeWidth={3} />
              </div>
              <span className="font-display font-black text-2xl uppercase text-[#F5F5F5]">DRIPRANK</span>
            </div>
            <p className="text-[#888888] text-sm font-body leading-relaxed">
              The social fashion arena where your designs compete for status.
              Design. Submit. Climb the ranks.
            </p>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#B6FF00] animate-pulse" />
              <span className="text-xs font-display font-bold uppercase tracking-widest text-[#B6FF00]">
                Live drops active
              </span>
            </div>
          </div>

          {/* Links */}
          <div className="space-y-4">
            <h4 className="font-display font-black text-sm uppercase tracking-widest text-[#F5F5F5]">
              Platform
            </h4>
            <div className="flex flex-col gap-2">
              {[
                ['/', 'Arena'],
                ['/studio', 'Design Studio'],
                ['/leaderboard', 'Rankings'],
                ['/drops', 'Drops'],
              ].map(([to, label]) => (
                <Link
                  key={to}
                  to={to}
                  className="tap-target text-sm font-body text-[#888888] hover:text-[#B6FF00] transition-colors duration-150 w-fit"
                >
                  {label}
                </Link>
              ))}
            </div>
          </div>

          {/* Commerce rules */}
          <div className="space-y-4">
            <h4 className="font-display font-black text-sm uppercase tracking-widest text-[#F5F5F5]">
              How It Works
            </h4>
            <div className="flex flex-col gap-3">
              {[
                ['01', 'Design your drip in the 3D Studio'],
                ['02', 'Submit public — enter the arena'],
                ['03', 'Orders = rank. Rank = status.'],
                ['04', 'Order via WhatsApp. COD only.'],
              ].map(([num, text]) => (
                <div key={num} className="flex items-start gap-3">
                  <span className="font-display font-black text-xs text-[#B6FF00] mt-0.5 shrink-0">{num}</span>
                  <span className="text-sm font-body text-[#888888]">{text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-12 pt-6 border-t border-white/6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs font-body text-[#3A3A3A] uppercase tracking-widest">
            © 2025 DRIPRANK. All rights reserved.
          </p>
          <p className="text-xs font-body text-[#3A3A3A] uppercase tracking-widest">
            Cash on Delivery · WhatsApp Orders · Street Fashion
          </p>
        </div>
      </div>
    </footer>
  )
}
