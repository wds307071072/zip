type ReadingLoaderProps = {
  label: string
  hint?: string
}

export function ReadingLoader({ label, hint }: ReadingLoaderProps) {
  return (
    <div className="flex flex-col items-center gap-5 py-2" role="status" aria-live="polite">
      <div className="relative flex h-20 items-end justify-center gap-3" aria-hidden="true">
        <span className="loader-halo absolute inset-0 rounded-full bg-[radial-gradient(circle,oklch(0.82_0.13_85/0.25),transparent_70%)]" />
        {[0, 1, 2].map((index) => (
          <span
            key={index}
            className="loader-card h-14 w-9 rounded-lg border border-gold/60 bg-gold/10 shadow-[0_0_25px_-6px_oklch(0.82_0.13_85/0.75)]"
            style={{ animationDelay: `${index * 180}ms` }}
          />
        ))}
      </div>

      <p className="text-center text-lg italic text-muted-foreground">{label}</p>

      {hint && (
        <p className="text-center text-sm italic text-muted-foreground/70">{hint}</p>
      )}
    </div>
  )
}
