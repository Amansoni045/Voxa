import { cn } from '@/lib/utils'

interface EmptyStateProps {
  message: string
  className?: string
}

export function EmptyState({ message, className }: EmptyStateProps) {
  return (
    <p
      className={cn('text-[14px] italic leading-relaxed', className)}
      style={{ color: 'var(--color-text-tertiary)' }}
    >
      {message}
    </p>
  )
}
