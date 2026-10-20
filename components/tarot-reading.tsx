'use client'

import { useEffect, useRef, useState, type FormEvent } from 'react'
import { Sparkles, LoaderCircle } from 'lucide-react'
import { drawCards, SPREADS, type DrawnCard, type SpreadKey } from '@/lib/tarot'
import { cn } from '@/lib/utils'
import { TarotCard } from '@/components/tarot-card'
import { TarotFan } from '@/components/tarot-fan'
import { TarotShuffle } from '@/components/tarot-shuffle'
import { ReadingLoader } from '@/components/reading-loader'
import { TypewriterText } from '@/components/typewriter-text'

type Status = 'idle' | 'loading' | 'done' | 'error'
type Phase = 'idle' | 'shuffling' | 'selecting' | 'flying' | 'landing' | 'spread'

const FAN_SIZE = 78
const SHUFFLE_MS = 1500
const FLIGHT_MS = 700
const FADE_MS = 300

// Each spread keeps every card on one aligned row: below its breakpoint the row
// becomes a horizontal scroll rail, above it the cards share equal grid columns.
const SPREAD_LAYOUT: Record<SpreadKey, { rail: string; card: string; width: string }> = {
  'three-card': {
    rail: 'card-rail grid grid-cols-3 gap-2 sm:gap-6',
    card: '',
    width: 'max-w-4xl',
  },
  'five-card-cross': {
    rail: 'card-rail flex snap-x snap-mandatory gap-4 overflow-x-auto px-[15vw] pb-2 md:grid md:grid-cols-5 md:gap-4 md:overflow-x-visible md:px-0 md:pb-0 md:snap-none',
    card: 'w-[70vw] max-w-[220px] shrink-0 snap-center md:w-auto md:max-w-none md:shrink md:snap-align-none',
    width: 'max-w-4xl',
  },
  'seven-card-love': {
    rail: 'card-rail flex snap-x snap-mandatory gap-4 overflow-x-auto px-[15vw] pb-2 lg:grid lg:grid-cols-7 lg:gap-3 lg:overflow-x-visible lg:px-0 lg:pb-0 lg:snap-none',
    card: 'w-[70vw] max-w-[220px] shrink-0 snap-center lg:w-auto lg:max-w-none lg:shrink lg:snap-align-none',
    width: 'max-w-6xl',
  },
}

export function TarotReading() {
  const [question, setQuestion] = useState('')
  const [spread, setSpread] = useState<SpreadKey>('three-card')
  const [cards, setCards] = useState<DrawnCard[] | null>(null)
  const [activeSpread, setActiveSpread] = useState<SpreadKey>('three-card')
  const [revealed, setRevealed] = useState(false)
  const [phase, setPhase] = useState<Phase>('idle')
  const [selection, setSelection] = useState<number[]>([])
  const [reading, setReading] = useState('')
  const [status, setStatus] = useState<Status>('idle')
  const [error, setError] = useState('')
  const [readingId, setReadingId] = useState(0)
  const resultRef = useRef<HTMLElement>(null)
  const drawnRef = useRef<DrawnCard[]>([])
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([])

  const needed = SPREADS[activeSpread].positions.length

  useEffect(() => {
    const timers = timersRef.current
    return () => timers.forEach(clearTimeout)
  }, [])

  useEffect(() => {
    if (phase === 'landing') {
      resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }, [phase])

  function clearTimers() {
    timersRef.current.forEach(clearTimeout)
    timersRef.current = []
  }

  function later(fn: () => void, ms: number) {
    timersRef.current.push(setTimeout(fn, ms))
  }

  async function handleSubmit(event?: FormEvent<HTMLFormElement>) {
    event?.preventDefault()

    const trimmed = question.trim()
    if (!trimmed) {
      alert('Please enter a question')
      return
    }
    if (status === 'loading' || phase === 'shuffling' || phase === 'flying') return

    const drawn = drawCards(spread)
    drawnRef.current = drawn

    clearTimers()
    setCards(drawn)
    setActiveSpread(spread)
    setSelection([])
    setRevealed(false)
    setReading('')
    setError('')
    setStatus('idle')
    setReadingId((id) => id + 1)
    setPhase('shuffling')

    later(() => setPhase('selecting'), SHUFFLE_MS)
  }

  function handleFanSelect(index: number) {
    if (phase !== 'selecting') return

    const next = selection.includes(index)
      ? selection.filter((picked) => picked !== index)
      : selection.length < needed
        ? [...selection, index]
        : selection

    if (next.length === selection.length && next.every((v, i) => v === selection[i])) return

    setSelection(next)
    if (next.length === needed) void beginReveal()
  }

  async function beginReveal() {
    const drawn = drawnRef.current
    if (!drawn.length) return

    setPhase('flying')
    setStatus('loading')
    setError('')

    later(() => setPhase('landing'), FLIGHT_MS)
    later(() => {
      setPhase('spread')
      setRevealed(true)
    }, FLIGHT_MS + FADE_MS)

    try {
      const response = await fetch('/api/reading', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: question.trim(),
          spread: activeSpread,
          cards: drawn.map((card) => ({ id: card.id, reversed: card.reversed })),
        }),
      })
      const data: { reading?: string; error?: string } = await response.json()
      if (!response.ok || !data.reading) {
        throw new Error(
          response.status >= 500
            ? 'The AI service is unavailable right now. No reading was invented for you — please try again in a moment.'
            : (data.error ?? 'The stars are clouded right now. Please try again.'),
        )
      }
      setReading(data.reading)
      setStatus('done')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.')
      setStatus('error')
    }
  }

  const showOverlay = phase === 'selecting' || phase === 'flying' || phase === 'landing'
  const showResults = cards && (phase === 'landing' || phase === 'spread')

  return (
    <div className="flex w-full flex-col items-center gap-16">
      <form
        onSubmit={handleSubmit}
        className="flex w-full max-w-2xl flex-col items-center gap-6"
      >
        <label htmlFor="question" className="sr-only">
          Your question
        </label>
        <div className="relative w-full">
          <textarea
            id="question"
            name="question"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            onKeyDown={(e) => {
              if (e.key !== 'Enter' || e.shiftKey) return
              if (e.nativeEvent.isComposing || e.keyCode === 229) return
              e.preventDefault()
              e.currentTarget.form?.requestSubmit()
            }}
            maxLength={300}
            rows={3}
            placeholder="Type the question weighing on your heart (e.g. Will my ex reach out to me?)"
            className="w-full resize-none rounded-2xl border border-input bg-card px-6 py-5 text-center text-lg text-foreground shadow-[inset_0_0_30px_oklch(0.5_0.15_300/0.15),0_0_40px_-10px_oklch(0.55_0.18_300/0.5)] backdrop-blur-md transition placeholder:text-muted-foreground/80 focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/40 md:text-xl"
          />
        </div>

        <fieldset className="w-full">
          <legend className="sr-only">Choose a tarot spread</legend>
          <div className="grid w-full gap-3 sm:grid-cols-3">
            {Object.values(SPREADS).map((option) => (
              <label
                key={option.key}
                className={cn(
                  'cursor-pointer rounded-2xl border px-4 py-4 text-center transition backdrop-blur-md',
                  'has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-gold/50 has-[:focus-visible]:ring-offset-2 has-[:focus-visible]:ring-offset-background',
                  spread === option.key
                    ? 'border-gold bg-gold/10 shadow-[0_0_30px_-8px_oklch(0.82_0.13_85/0.6)]'
                    : 'border-border bg-card hover:border-gold/60',
                )}
              >
                <input
                  type="radio"
                  name="spread"
                  value={option.key}
                  checked={spread === option.key}
                  onChange={() => setSpread(option.key)}
                  className="sr-only"
                />
                <span className="block font-display text-sm font-bold tracking-[0.15em] text-gold uppercase">
                  {option.label}
                </span>
                <span className="mt-1 block text-xs italic text-muted-foreground">
                  {option.description}
                </span>
              </label>
            ))}
          </div>
        </fieldset>

        <button
          type="button"
          onClick={() => void handleSubmit()}
          className="gold-button group inline-flex items-center gap-3 rounded-full px-8 py-4 font-display text-sm font-bold tracking-[0.2em] text-gold-foreground shadow-[0_0_30px_oklch(0.82_0.13_85/0.55),0_0_80px_-10px_oklch(0.82_0.13_85/0.5)] transition hover:scale-[1.03] hover:shadow-[0_0_45px_oklch(0.85_0.13_85/0.8),0_0_100px_-10px_oklch(0.82_0.13_85/0.6)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-4 focus-visible:ring-offset-background md:px-10 md:text-base"
        >
          {status === 'loading' ? (
            <LoaderCircle className="size-5 animate-spin" aria-hidden="true" />
          ) : (
            <Sparkles className="size-5 transition-transform group-hover:rotate-12" aria-hidden="true" />
          )}
          {phase === 'shuffling'
            ? 'SHUFFLING…'
            : status === 'loading'
              ? 'CONSULTING THE STARS…'
              : 'DRAW CARDS & REVEAL'}
        </button>

        {phase === 'shuffling' && <TarotShuffle />}
      </form>

      {showOverlay && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Choose your cards"
          className={cn(
            'fixed inset-0 z-50 flex items-center justify-center bg-background/85 px-4 backdrop-blur-sm transition-opacity duration-300',
            phase === 'landing' ? 'pointer-events-none opacity-0' : 'opacity-100',
          )}
        >
          <TarotFan
            count={FAN_SIZE}
            need={needed}
            selected={selection}
            flying={phase !== 'selecting'}
            onSelect={handleFanSelect}
          />
        </div>
      )}

      {showResults && (
        <section
          ref={resultRef}
          aria-labelledby="reading-title"
          className={cn(
            'flex w-full scroll-mt-8 flex-col items-center gap-12',
            SPREAD_LAYOUT[activeSpread].width,
          )}
        >
          <h2 id="reading-title" className="sr-only">
            Your {cards.length}-card reading
          </h2>

          <div key={readingId} className={cn('w-full', SPREAD_LAYOUT[activeSpread].rail)}>
            {cards.map((card, index) => (
              <TarotCard
                key={card.id}
                card={card}
                revealed={revealed}
                index={index}
                className={SPREAD_LAYOUT[activeSpread].card}
              />
            ))}
          </div>

          <div className="w-full max-w-3xl rounded-2xl border border-border bg-card px-6 py-8 backdrop-blur-md md:px-12 md:py-10">
            <div className="mb-6 flex items-center justify-center gap-4" aria-hidden="true">
              <span className="h-px w-12 bg-gradient-to-r from-transparent to-gold/70" />
              <span className="font-display text-xs tracking-[0.35em] text-gold uppercase">
                Your Reading
              </span>
              <span className="h-px w-12 bg-gradient-to-l from-transparent to-gold/70" />
            </div>

            {status !== 'done' && (
              <ReadingLoader
                label={
                  phase === 'landing'
                    ? 'Your chosen cards are turning over…'
                    : 'Selene is reading your cards…'
                }
                hint={status === 'loading' ? 'The stars take a moment to answer.' : undefined}
              />
            )}

            {status === 'error' && (
              <p role="alert" className="text-center text-lg text-destructive">
                {error}
              </p>
            )}

            {status === 'done' && <TypewriterText key={readingId} text={reading} />}
          </div>
        </section>
      )}
    </div>
  )
}
