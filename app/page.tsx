import { Moon } from 'lucide-react'
import { Starfield } from '@/components/starfield'
import { TarotReading } from '@/components/tarot-reading'

export default function Page() {
  return (
    <>
      <Starfield />
      <main className="relative flex min-h-dvh flex-col items-center px-4 pt-16 pb-24 md:pt-24">
        <header className="mb-12 flex max-w-2xl flex-col items-center gap-5 text-center">
          <Moon className="size-8 text-gold" aria-hidden="true" />
          <p className="font-display text-xs tracking-[0.4em] text-gold/80 uppercase">
            Celestial Tarot
          </p>
          <h1 className="text-balance font-display text-4xl font-semibold leading-tight text-foreground md:text-6xl">
            Ask the Cards. <span className="text-gold">Hear the Stars.</span>
          </h1>
          <p className="text-pretty text-lg italic text-muted-foreground md:text-xl">
            Quiet your mind, hold your question close, and choose a spread of
            three, five or seven cards to illuminate your path.
          </p>
        </header>

        <TarotReading />

        <footer className="mt-24 text-center text-sm text-muted-foreground/70">
          For reflection and entertainment. Your choices remain your own.
        </footer>
      </main>
    </>
  )
}
