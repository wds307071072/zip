'use client'

import Image from 'next/image'
import { useEffect, useMemo, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react'
import { cn } from '@/lib/utils'

type TarotFanProps = {
  /** Total number of face-down cards spread out in the fan. */
  count: number
  /** Number of cards the seeker has to pick for the current spread. */
  need: number
  /** Fan indices in the order they were picked. */
  selected: number[]
  /** True once the seeker picked every card and the chosen ones fly into place. */
  flying: boolean
  onSelect: (index: number) => void
}

/** Total width of the arc the whole deck is spread across. */
const ARC_DEGREES = 162
/** How far a card is pulled out of the fan when hovered or selected. */
const LIFT_PIXELS = 22
const EASE_OUT = 'cubic-bezier(0.22, 0.61, 0.36, 1)'

export function TarotFan({ count, need, selected, flying, onSelect }: TarotFanProps) {
  const areaRef = useRef<HTMLDivElement>(null)
  const [metrics, setMetrics] = useState({ width: 0, viewportHeight: 0 })
  const [hovered, setHovered] = useState<number | null>(null)

  useEffect(() => {
    const element = areaRef.current
    if (!element) return

    const measure = () => {
      setMetrics({
        width: element.getBoundingClientRect().width,
        viewportHeight: window.innerHeight,
      })
    }

    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(element)
    return () => observer.disconnect()
  }, [])

  // Every card centre sits on the same circle around a pivot below the fan, so the
  // deck opens into a wide symmetric arc and each card keeps a visible sliver.
  const layout = useMemo(() => {
    const { width, viewportHeight } = metrics
    if (!width) return null

    const cardWidth = Math.round(Math.min(Math.max(width / 13, 32), 66))
    const cardHeight = Math.round(cardWidth * 1.5)
    const halfArc = (ARC_DEGREES / 2) * (Math.PI / 180)

    const radiusByWidth = (width - 24 - cardWidth * 1.5) / (2 * Math.sin(halfArc))
    const availableHeight = Math.max(280, viewportHeight * 0.62)
    const radiusByHeight = (availableHeight - cardHeight - LIFT_PIXELS) / (1 - Math.cos(halfArc))
    const radius = Math.max(90, Math.min(radiusByWidth, radiusByHeight))

    const stepDegrees = count > 1 ? ARC_DEGREES / (count - 1) : 0
    const cards = Array.from({ length: count }, (_, index) => {
      const radians =
        count > 1 ? (-ARC_DEGREES / 2 + stepDegrees * index) * (Math.PI / 180) : 0
      return {
        degrees: (radians * 180) / Math.PI,
        sin: Math.sin(radians),
        cos: Math.cos(radians),
        offsetX: Math.sin(radians) * radius,
        offsetY: -Math.cos(radians) * radius,
      }
    })

    const containerHeight = Math.round(
      radius * (1 - Math.cos(halfArc)) + cardHeight + LIFT_PIXELS + 16,
    )
    const pivotY = containerHeight - cardHeight / 2 - 8 + radius * Math.cos(halfArc)
    const rowWidth = Math.min(width - 24, need * cardWidth * 2.6)
    const rowSpacing = need > 0 ? rowWidth / need : 0
    const rowOffsetY = containerHeight / 2 - pivotY

    return {
      cardWidth,
      cardHeight,
      radius,
      cards,
      containerHeight,
      pivotY,
      rowWidth,
      rowSpacing,
      rowOffsetY,
    }
  }, [count, need, metrics])

  // With 78 cards every sliver is only a few pixels wide, so instead of relying on
  // DOM hover we always expand whichever card the pointer angle points at.
  function highlightNearestCard(event: ReactPointerEvent<HTMLDivElement>) {
    if (flying || !layout) return

    const rect = event.currentTarget.getBoundingClientRect()
    const dx = event.clientX - rect.left - rect.width / 2
    const dy = event.clientY - rect.top - layout.pivotY

    const radians = Math.atan2(dx, -dy)
    const degrees = (radians * 180) / Math.PI
    const halfArc = ARC_DEGREES / 2
    const distance = Math.hypot(dx, dy)

    if (Math.abs(degrees) > halfArc + 4 || distance > layout.radius * 1.45) {
      setHovered(null)
      return
    }

    const step = count > 1 ? ARC_DEGREES / (count - 1) : 1
    const index = count > 1 ? Math.round((degrees + halfArc) / step) : 0
    setHovered(Math.min(count - 1, Math.max(0, index)))
  }

  return (
    <div className="flex w-full max-w-6xl flex-col items-center gap-6">
      <div ref={areaRef} className="relative w-full">
        {layout && (
          <div
            className="relative w-full touch-pan-y"
            style={{ height: layout.containerHeight }}
            onPointerMove={highlightNearestCard}
            onPointerDown={highlightNearestCard}
            onPointerLeave={() => setHovered(null)}
          >
            {layout.cards.map((card, index) => {
              const order = selected.indexOf(index)
              const picked = order !== -1
              const isHovered = hovered === index

              const pull = isHovered ? LIFT_PIXELS : picked ? LIFT_PIXELS * 0.55 : 0
              const scale = isHovered ? 1.5 : picked ? 1.28 : 1

              const transform = flying && picked
                ? `translate(-50%, -50%) translate(${-layout.rowWidth / 2 + layout.rowSpacing * (order + 0.5)}px, ${layout.rowOffsetY}px) rotate(0deg) scale(1.06)`
                : `translate(-50%, -50%) translate(${card.offsetX + card.sin * pull}px, ${card.offsetY - card.cos * pull}px) rotate(${card.degrees}deg) scale(${scale})`

              return (
                <button
                  key={index}
                  type="button"
                  onClick={() => onSelect(index)}
                  onFocus={() => setHovered(index)}
                  aria-label={`Face-down card ${index + 1}`}
                  aria-pressed={picked}
                  aria-disabled={flying || undefined}
                  className={cn(
                    'absolute overflow-hidden rounded-md border origin-center transition-[transform,opacity,box-shadow] duration-200 ease-out motion-reduce:transition-none',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-4 focus-visible:ring-offset-background',
                    flying ? 'pointer-events-none cursor-default' : 'cursor-pointer',
                    picked
                      ? 'border-gold shadow-[0_0_35px_-4px_oklch(0.82_0.13_85/0.8)]'
                      : 'border-gold/40 shadow-[0_0_18px_-8px_oklch(0.82_0.13_85/0.5)]',
                  )}
                  style={{
                    width: layout.cardWidth,
                    height: layout.cardHeight,
                    left: '50%',
                    top: layout.pivotY,
                    transform,
                    opacity: flying && !picked ? 0 : 1,
                    zIndex: isHovered ? 200 : picked ? 150 : Math.abs(index - (count - 1) / 2) < 1 ? 120 : index,
                    transition: flying
                      ? `transform 650ms ${EASE_OUT}, opacity 320ms ease-out`
                      : undefined,
                  }}
                >
                  <Image
                    src="/cards/back.webp"
                    alt=""
                    fill
                    sizes={`${layout.cardWidth}px`}
                    className="object-cover"
                  />

                  {picked && !flying && (
                    <span className="absolute top-0.5 left-1/2 grid size-4 -translate-x-1/2 place-items-center rounded-full border border-gold bg-background/90 font-display text-[0.55rem] font-bold text-gold animate-in zoom-in duration-200">
                      {order + 1}
                    </span>
                  )}
                </button>
              )
            })}
          </div>
        )}
      </div>

      <div className="flex flex-col items-center gap-2 text-center">
        <p className="font-display text-sm tracking-[0.25em] text-gold uppercase">
          Choose {need} {need === 1 ? 'card' : 'cards'}
        </p>
        <p className="font-display text-xs tracking-[0.2em] text-gold/70 uppercase">
          {selected.length} / {need} selected
        </p>
        <p className="text-sm italic text-muted-foreground">
          Hover to lift a card out of the fan, then follow your instinct and click.
        </p>
      </div>
    </div>
  )
}
