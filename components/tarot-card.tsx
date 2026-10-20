import Image from 'next/image'
import { cn } from '@/lib/utils'
import type { DrawnCard } from '@/lib/tarot'

type TarotCardProps = {
  card: DrawnCard
  revealed: boolean
  index: number
  className?: string
}

export function TarotCard({ card, revealed, index, className }: TarotCardProps) {
  return (
    <figure
      className={cn(
        'flex h-full min-w-0 flex-col items-center gap-3 animate-in fade-in slide-in-from-bottom-8 fill-mode-both duration-700 sm:gap-4',
        className,
      )}
      style={{ animationDelay: `${index * 150}ms` }}
    >
      <p className="flex h-9 w-full items-center justify-center text-center font-display text-[0.6rem] leading-tight tracking-[0.15em] text-gold/80 uppercase sm:h-10 sm:text-xs">
        <span className="line-clamp-2">{card.position}</span>
      </p>

      <div className="perspective-distant w-full max-w-[220px]">
        <div
          className={cn(
            'relative aspect-[2/3] w-full transition-transform duration-1000 ease-out transform-3d',
            revealed && 'rotate-y-180',
          )}
          style={{ transitionDelay: revealed ? `${index * 350}ms` : '0ms' }}
        >
          <div className="absolute inset-0 overflow-hidden rounded-xl border border-gold/40 shadow-[0_0_40px_-8px_oklch(0.82_0.13_85/0.45)] backface-hidden">
            <Image
              src="/cards/back.webp"
              alt=""
              fill
              sizes="(max-width: 768px) 45vw, 220px"
              className="object-cover"
            />
          </div>

          <div className="absolute inset-0 overflow-hidden rounded-xl border border-gold/60 shadow-[0_0_50px_-6px_oklch(0.82_0.13_85/0.6)] rotate-y-180 backface-hidden">
            <Image
              src={card.image}
              alt={`${card.name} tarot card${card.reversed ? ', reversed' : ''}`}
              fill
              sizes="(max-width: 768px) 45vw, 220px"
              className={cn('object-cover', card.reversed && 'rotate-180')}
            />
          </div>
        </div>
      </div>

      <figcaption
        className={cn(
          'flex min-h-14 w-full flex-col items-start gap-1 text-center transition-opacity duration-700',
          revealed ? 'opacity-100' : 'opacity-0',
        )}
        style={{ transitionDelay: revealed ? `${index * 350 + 800}ms` : '0ms' }}
      >
        <span className="w-full text-balance font-display text-sm font-semibold text-foreground md:text-base">
          {card.name}
        </span>
        <span className="w-full text-xs italic text-muted-foreground">
          {card.reversed ? 'Reversed' : 'Upright'}
        </span>
      </figcaption>
    </figure>
  )
}
