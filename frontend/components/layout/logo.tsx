import { cn } from '@/lib/utils'

interface LogoProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const sizes = {
  sm: { mark: 16, text: 'text-[14px]', gap: 'gap-[7px]' },
  md: { mark: 20, text: 'text-[16px]', gap: 'gap-[9px]' },
  lg: { mark: 24, text: 'text-[18px]', gap: 'gap-[10px]' },
}

export function Logo({ size = 'md', className }: LogoProps) {
  const s = sizes[size]
  return (
    <div
      className={cn(
        'flex items-center select-none',
        s.gap,
        className
      )}
      aria-label="Voxa"
    >
      {/* Abstract convergence mark — three lines flowing to one point */}
      <svg
        width={s.mark}
        height={s.mark}
        viewBox="0 0 24 24"
        fill="none"
        aria-hidden="true"
        className="flex-shrink-0"
        style={{ color: 'var(--color-accent)' }}
      >
        <path
          d="M4 6L12 18L20 6"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M7 6L12 15L17 6"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity="0.5"
        />
      </svg>
      <span
        className={cn(
          'font-semibold tracking-[-0.02em] leading-none',
          s.text
        )}
        style={{ color: 'var(--color-text-primary)' }}
      >
        Voxa
      </span>
    </div>
  )
}
