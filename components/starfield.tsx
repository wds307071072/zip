import type { CSSProperties } from 'react'

function seededRandom(seed: number) {
  let value = seed
  return () => {
    value = (value * 16807) % 2147483647
    return (value - 1) / 2147483646
  }
}

const random = seededRandom(42)

const STARS = Array.from({ length: 140 }, (_, i) => ({
  id: i,
  top: random() * 100,
  left: random() * 100,
  size: random() < 0.85 ? 1 + random() * 1.2 : 2 + random() * 1.5,
  duration: 2.5 + random() * 4,
  delay: random() * 5,
}))

const SHOOTING_STARS = [
  { top: 6, left: 88, delay: 0.5, duration: 9 },
  { top: 18, left: 70, delay: 4, duration: 11 },
  { top: 2, left: 55, delay: 7.5, duration: 13 },
  { top: 28, left: 98, delay: 2.5, duration: 10 },
  { top: 12, left: 40, delay: 10, duration: 14 },
]

export function Starfield() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
    >
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,oklch(0.3_0.12_295)_0%,oklch(0.18_0.07_285)_45%,oklch(0.11_0.04_270)_100%)]" />
      <div className="absolute -left-1/4 top-1/3 h-[60vh] w-[80vw] rounded-full bg-[oklch(0.45_0.18_300/0.18)] blur-3xl" />
      <div className="absolute -right-1/4 bottom-0 h-[50vh] w-[70vw] rounded-full bg-[oklch(0.4_0.14_260/0.2)] blur-3xl" />

      {STARS.map((star) => (
        <span
          key={star.id}
          className="star absolute rounded-full bg-white"
          style={
            {
              top: `${star.top}%`,
              left: `${star.left}%`,
              width: star.size,
              height: star.size,
              boxShadow: star.size > 2 ? '0 0 6px 1px oklch(0.95 0.05 300 / 0.8)' : undefined,
              '--twinkle-duration': `${star.duration}s`,
              '--twinkle-delay': `${star.delay}s`,
            } as CSSProperties
          }
        />
      ))}

      {SHOOTING_STARS.map((star, i) => (
        <span
          key={i}
          className="shooting-star absolute origin-left"
          style={
            {
              top: `${star.top}%`,
              left: `${star.left}%`,
              '--shoot-delay': `${star.delay}s`,
              '--shoot-duration': `${star.duration}s`,
            } as CSSProperties
          }
        />
      ))}
    </div>
  )
}
