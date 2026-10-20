'use client'

import Image from 'next/image'
import type { CSSProperties } from 'react'

const STACK_SIZE = 9

export function TarotShuffle() {
  return (
    <div className="flex flex-col items-center gap-4" role="status" aria-live="polite">
      <div
        className="relative h-[150px] w-[104px] sm:h-[200px] sm:w-[138px]"
        aria-hidden="true"
      >
        {Array.from({ length: STACK_SIZE }).map((_, index) => {
          const rotation = (index - (STACK_SIZE - 1) / 2) * 5
          return (
            <div
              key={index}
              className="shuffle-card absolute inset-0 overflow-hidden rounded-xl border border-gold/50 shadow-[0_0_35px_-6px_oklch(0.82_0.13_85/0.5)]"
              style={
                {
                  zIndex: index,
                  transform: `rotate(${rotation}deg)`,
                  animationDelay: `${index * 90}ms`,
                  '--shuffle-rot': `${rotation}deg`,
                } as CSSProperties
              }
            >
              <Image
                src="/cards/back.webp"
                alt=""
                fill
                sizes="(max-width: 768px) 110px, 140px"
                className="object-cover"
              />
            </div>
          )
        })}
      </div>

      <p className="animate-pulse font-display text-xs tracking-[0.3em] text-gold/80 uppercase">
        Shuffling the deck…
      </p>
    </div>
  )
}
