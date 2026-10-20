'use client'

import { useEffect, useState } from 'react'

type TypewriterTextProps = {
  text: string
  speed?: number
}

export function TypewriterText({ text, speed = 22 }: TypewriterTextProps) {
  const [count, setCount] = useState(0)
  const done = count >= text.length

  useEffect(() => {
    if (done) return
    const timer = setTimeout(() => {
      const char = text[count]
      const step = char === ' ' ? 2 : 1
      setCount((c) => Math.min(c + step, text.length))
    }, /[.,!?;]/.test(text[count - 1] ?? '') ? speed * 6 : speed)
    return () => clearTimeout(timer)
  }, [count, done, speed, text])

  return (
    <div className="flex flex-col gap-6">
      <p className="sr-only" aria-live="polite">
        {done ? text : ''}
      </p>
      <p
        aria-hidden="true"
        className="whitespace-pre-wrap text-pretty text-lg leading-relaxed text-foreground/90 md:text-xl"
      >
        {text.slice(0, count)}
        {!done && (
          <span className="typewriter-caret ml-0.5 inline-block h-[1.1em] w-[2px] translate-y-[0.2em] bg-gold" />
        )}
      </p>
      {!done && (
        <button
          type="button"
          onClick={() => setCount(text.length)}
          className="self-center font-display text-xs tracking-[0.25em] text-gold/80 uppercase underline-offset-4 transition-colors hover:text-gold hover:underline"
        >
          Reveal full reading
        </button>
      )}
    </div>
  )
}
