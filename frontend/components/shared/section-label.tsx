import { cn } from '@/lib/utils'

interface SectionLabelProps {
  children: React.ReactNode
  className?: string
  withAccentBar?: boolean
}

export function SectionLabel({ children, className, withAccentBar = false }: SectionLabelProps) {
  return (
    <div className={cn('flex items-center gap-3', className)}>
      {withAccentBar && (
        <div
          className="w-[2px] h-6 flex-shrink-0 rounded-full"
          style={{ backgroundColor: 'var(--color-accent)' }}
          aria-hidden="true"
        />
      )}
      <span
        className={cn(
          'text-[11px] font-semibold uppercase tracking-[0.08em] leading-none',
        )}
        style={{ color: 'var(--color-text-tertiary)' }}
      >
        {children}
      </span>
    </div>
  )
}
