import { useRef } from 'react'
import { Heart } from 'lucide-react'
import gsap from 'gsap'
import { useLikeStore } from '../../store/likeStore'

export default function LikeButton({ designId, size = 'sm' }) {
  const btnRef   = useRef(null)
  const counts   = useLikeStore((s) => s.counts)
  const liked    = useLikeStore((s) => s.liked)
  const toggleLike = useLikeStore((s) => s.toggleLike)

  const isLiked = liked.has(designId)
  const count   = counts[designId] ?? 0

  const sm = size === 'sm'

  const handleClick = (e) => {
    e.stopPropagation()
    e.preventDefault()
    toggleLike(designId)
    gsap.timeline()
      .to(btnRef.current, { scale: 0.75, duration: 0.08 })
      .to(btnRef.current, { scale: 1.25, duration: 0.18, ease: 'back.out(3)' })
      .to(btnRef.current, { scale: 1,    duration: 0.15 })
  }

  return (
    <button
      ref={btnRef}
      onClick={handleClick}
      className={`
        tap-target shrink-0 flex items-center gap-1 transition-colors duration-150
        ${sm ? 'px-2 py-1.5' : 'px-3 py-2'}
        ${isLiked
          ? 'text-[#FF006E]'
          : 'text-[#444] hover:text-[#FF006E]'
        }
      `}
    >
      <Heart
        size={sm ? 12 : 15}
        strokeWidth={isLiked ? 0 : 2}
        fill={isLiked ? '#FF006E' : 'none'}
        className="transition-all duration-150"
      />
      {count > 0 && (
        <span className={`font-display font-black tabular-nums leading-none ${sm ? 'text-[9px]' : 'text-xs'}`}>
          {count}
        </span>
      )}
    </button>
  )
}
