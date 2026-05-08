import { useEffect, useRef, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import gsap from 'gsap'
import {
  ArrowLeft, Share2, Calendar,
  Package, Heart, Trophy, Palette,
} from 'lucide-react'
import { useProfileStore } from '../store/profileStore'
import { useLikeStore } from '../store/likeStore'
import { useAuthStore } from '../store/authStore'
import Avatar    from '../components/ui/Avatar'
import LikeButton from '../components/ui/LikeButton'
import BuyModal  from '../components/leaderboard/BuyModal'

/* ── helpers ─────────────────────────────────────────────── */
function fmt(n) { return Number(n || 0).toLocaleString() }

/* ── stat cell ───────────────────────────────────────────── */
function Stat({ Icon, label, value, color }) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center py-5 border-r border-white/6 last:border-r-0 min-w-0 px-2">
      <p className="font-display font-black text-xl sm:text-2xl leading-none" style={{ color }}>
        {value}
      </p>
      <div className="flex items-center gap-1 mt-1.5">
        <Icon size={9} strokeWidth={2} className="text-[#444] shrink-0" />
        <p className="font-display font-bold text-[8px] uppercase tracking-widest text-[#444] truncate">
          {label}
        </p>
      </div>
    </div>
  )
}

/* ── profile design card ─────────────────────────────────── */
function DesignCard({ design, index }) {
  const cardRef  = useRef(null)
  const isTop    = design.rank != null && design.rank <= 3

  useEffect(() => {
    gsap.fromTo(cardRef.current,
      { y: 22, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.42, ease: 'power3.out', delay: index * 0.05 }
    )
  }, [index])

  return (
    <div
      ref={cardRef}
      className="border border-white/8 bg-[#111111] overflow-hidden group"
      style={isTop ? { borderTopColor: design.color, borderTopWidth: 2 } : {}}
    >
      {/* Thumbnail */}
      <Link to={`/design/${design.id}`} className="block relative overflow-hidden" style={{ paddingTop: '125%' }}>
        <div className="absolute inset-0">
          {design.image ? (
            <img
              src={design.image}
              alt={design.name}
              className="w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
              loading="lazy"
            />
          ) : (
            <div
              className="w-full h-full flex items-center justify-center"
              style={{ background: `${design.color}18` }}
            >
              <span className="text-4xl">{design.hype}</span>
            </div>
          )}
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#111111]/90 via-transparent to-transparent" />
          {/* Colour wash */}
          <div
            className="absolute inset-0"
            style={{ background: design.color, opacity: 0.07, mixBlendMode: 'color' }}
          />
          {/* Rank badge */}
          {design.rank != null && (
            <span
              className="absolute top-2 left-2 font-display font-black text-[9px] uppercase tracking-widest px-1.5 py-0.5 text-[#0D0D0D]"
              style={{ background: design.color }}
            >
              #{design.rank}
            </span>
          )}
          {/* Hype */}
          <span className="absolute top-1.5 right-2 text-lg leading-none">{design.hype}</span>
        </div>
      </Link>

      {/* Footer */}
      <div className="p-2.5 sm:p-3">
        <Link to={`/design/${design.id}`}>
          <p className="font-display font-black text-[10px] sm:text-xs uppercase tracking-widest text-[#F5F5F5] leading-tight truncate hover:text-[#B6FF00] transition-colors">
            {design.name}
          </p>
        </Link>
        <div className="flex items-center justify-between mt-1.5">
          <span className="font-display font-bold text-[8px] uppercase tracking-widest text-[#444] flex items-center gap-0.5">
            <Package size={8} strokeWidth={2} className="shrink-0" />
            {fmt(design.orders)}
          </span>
          <LikeButton designId={design.id} size="sm" />
        </div>
      </div>
    </div>
  )
}

/* ── skeleton ─────────────────────────────────────────────── */
function Skeleton() {
  return (
    <main className="pt-[88px] min-h-screen bg-[#0D0D0D]">
      <div className="max-w-3xl mx-auto px-4 py-8 space-y-4">
        <div className="h-36 bg-[#111111] border border-white/6 animate-pulse" />
        <div className="h-[76px] bg-[#111111] border border-white/6 animate-pulse" />
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {Array(6).fill(null).map((_, i) => (
            <div key={i} className="bg-[#111111] border border-white/6 animate-pulse" style={{ paddingTop: '125%' }} />
          ))}
        </div>
      </div>
    </main>
  )
}

/* ── page ─────────────────────────────────────────────────── */
export default function Profile() {
  const { username }  = useParams()
  const navigate      = useNavigate()

  const { profile, designs, stats, loading, error, notFound, fetchProfile, reset } = useProfileStore()
  const fetchLikes    = useLikeStore((s) => s.fetchLikes)
  const currentProfile = useAuthStore((s) => s.profile)

  const [buyDesign, setBuyDesign] = useState(null)
  const headerRef = useRef(null)
  const bodyRef   = useRef(null)

  const isOwnProfile = currentProfile?.username === username

  useEffect(() => {
    fetchProfile(username)
    return () => reset()
  }, [username])                    // re-fetch if route changes

  useEffect(() => {
    if (designs.length) fetchLikes(designs.map((d) => d.id))
  }, [designs.length])

  useEffect(() => {
    if (loading || !profile) return
    gsap.fromTo(headerRef.current,
      { y: -20, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.45, ease: 'power3.out' }
    )
    gsap.fromTo(bodyRef.current,
      { y: 30, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.5, ease: 'power3.out', delay: 0.1 }
    )
  }, [loading, profile])

  const handleShare = () => {
    const url = window.location.href
    navigator.share?.({ title: `@${username} on DRIPRANK`, url }) ??
    navigator.clipboard?.writeText(url)
  }

  if (loading) return <Skeleton />

  if (notFound || error) return (
    <main className="pt-[88px] min-h-screen flex items-center justify-center">
      <div className="text-center px-4">
        <p className="font-display font-black text-5xl text-[#1A1A1A] uppercase mb-3">@{username}</p>
        <p className="font-body text-sm text-[#444] mb-6">
          {notFound ? 'This profile doesn\'t exist.' : error}
        </p>
        <Link
          to="/leaderboard"
          className="font-display font-bold text-xs text-[#B6FF00] uppercase tracking-widest hover:text-[#ccff33] transition-colors"
        >
          ← Browse Designs
        </Link>
      </div>
    </main>
  )

  if (!profile) return null

  const joined = new Date(profile.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })

  return (
    <>
      <main className="pt-[88px] min-h-screen bg-[#0D0D0D]">
        <div className="max-w-3xl mx-auto px-4 pb-24">

          {/* Nav row */}
          <div ref={headerRef} className="flex items-center justify-between py-5">
            <button
              onClick={() => navigate(-1)}
              className="tap-target flex items-center gap-1.5 text-[#555] hover:text-[#F5F5F5] transition-colors"
            >
              <ArrowLeft size={14} strokeWidth={2} />
              <span className="font-display font-bold text-xs uppercase tracking-widest">Back</span>
            </button>
            <button
              onClick={handleShare}
              className="tap-target flex items-center gap-1.5 text-[#555] hover:text-[#F5F5F5] transition-colors"
            >
              <Share2 size={14} strokeWidth={2} />
              <span className="font-display font-bold text-xs uppercase tracking-widest">Share</span>
            </button>
          </div>

          <div ref={bodyRef} className="space-y-4">

            {/* ── Profile header ─────────────────────────── */}
            <div className="border border-white/10 bg-[#111111] p-5 sm:p-6">
              <div className="flex items-start gap-5">

                <Avatar username={profile.username} url={profile.avatar_url} size={80} />

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h1 className="font-display font-black text-xl sm:text-2xl uppercase tracking-tight text-[#F5F5F5] leading-none">
                      {profile.username}
                    </h1>
                    {isOwnProfile && (
                      <span className="font-display font-black text-[8px] uppercase tracking-widest px-1.5 py-0.5 bg-[#B6FF00]/10 border border-[#B6FF00]/30 text-[#B6FF00]">
                        You
                      </span>
                    )}
                  </div>

                  <p className="font-display text-[10px] text-[#444] uppercase tracking-widest mt-1">
                    @{profile.username}
                  </p>

                  {profile.bio && (
                    <p className="font-body text-sm text-[#888] mt-3 leading-relaxed max-w-sm">
                      {profile.bio}
                    </p>
                  )}

                  <div className="flex items-center gap-1.5 mt-3 text-[#444]">
                    <Calendar size={10} strokeWidth={2} />
                    <span className="font-display font-bold text-[9px] uppercase tracking-widest">
                      Joined {joined}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* ── Stats bar ──────────────────────────────── */}
            <div className="border border-white/10 bg-[#111111] flex overflow-hidden">
              <Stat Icon={Palette} label="Designs"   value={stats?.totalDesigns ?? 0}                        color="#F5F5F5" />
              <Stat Icon={Heart}   label="Likes"     value={fmt(stats?.totalLikes)}                           color="#FF006E" />
              <Stat Icon={Package} label="Orders"    value={fmt(stats?.totalOrders)}                          color="#B6FF00" />
              <Stat Icon={Trophy}  label="Best Rank" value={stats?.bestRank != null ? `#${stats.bestRank}` : '—'} color="#00D1FF" />
            </div>

            {/* ── Designs grid ───────────────────────────── */}
            <section>
              <div className="flex items-center gap-2 mb-3">
                <p className="font-display font-black text-[10px] uppercase tracking-widest text-[#555]">
                  Designs
                </p>
                <div className="flex-1 h-px bg-white/6" />
                <span className="font-display font-bold text-[9px] uppercase tracking-widest text-[#333]">
                  {designs.length}
                </span>
              </div>

              {designs.length === 0 ? (
                <div className="border border-white/6 bg-[#111111] py-16 flex flex-col items-center gap-3">
                  <Palette size={28} strokeWidth={1.2} className="text-[#222]" />
                  <p className="font-display font-bold text-xs uppercase tracking-widest text-[#2A2A2A]">
                    No designs yet
                  </p>
                  {isOwnProfile && (
                    <Link
                      to="/studio"
                      className="tap-target font-display font-black text-[10px] uppercase tracking-widest text-[#B6FF00] hover:text-[#ccff33] transition-colors"
                    >
                      + Create Your First Design
                    </Link>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {designs.map((design, i) => (
                    <DesignCard key={design.id} design={design} index={i} />
                  ))}
                </div>
              )}
            </section>

            {/* ── Studio CTA (own profile, empty) ─────────── */}
            {isOwnProfile && designs.length > 0 && (
              <Link
                to="/studio"
                className="
                  flex items-center justify-center gap-2 py-3 border border-dashed border-white/10
                  font-display font-black text-[10px] uppercase tracking-widest
                  text-[#333] hover:text-[#B6FF00] hover:border-[#B6FF00]/30 transition-all duration-200
                "
              >
                <Palette size={11} strokeWidth={2.5} />
                Add New Design
              </Link>
            )}

          </div>
        </div>
      </main>

      {buyDesign && <BuyModal design={buyDesign} onClose={() => setBuyDesign(null)} />}
    </>
  )
}
