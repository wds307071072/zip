import { Moon } from 'lucide-react'

export default function Loading() {
  return (
    <main className="relative flex min-h-dvh flex-col items-center justify-center gap-8 px-6">
      <div className="relative flex size-24 items-center justify-center" aria-hidden="true">
        <span className="absolute inset-0 rounded-full border border-gold/20" />
        <span className="absolute inset-0 rounded-full border-t border-gold animate-spin [animation-duration:2.4s]" />
        <span className="absolute inset-3 rounded-full border-b border-gold/50 animate-spin [animation-duration:3.6s] [animation-direction:reverse]" />
        <Moon className="size-8 animate-pulse text-gold" />
      </div>

      <p
        role="status"
        aria-live="polite"
        className="animate-pulse text-center font-display text-xs tracking-[0.4em] text-gold/80 uppercase"
      >
        Aligning the stars…
      </p>
    </main>
  )
}
