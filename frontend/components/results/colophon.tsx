import { Logo } from '@/components/layout/logo'

interface ColophonProps {
  generatedAt?: string
}

export function Colophon({ generatedAt }: ColophonProps) {
  const date = generatedAt
    ? new Date(generatedAt).toLocaleDateString(undefined, {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      })
    : new Date().toLocaleDateString(undefined, {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      })

  return (
    <div
      className="flex flex-col items-center gap-2 pt-16 pb-20"
      aria-label="Document end"
    >
      {/* Logo mark only — wordmark omitted for restraint */}
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        aria-hidden="true"
        style={{ color: 'var(--color-text-quarternary)' }}
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
      <p
        className="text-[12px] font-normal"
        style={{ color: 'var(--color-text-quarternary)' }}
      >
        Generated on {date}
      </p>
    </div>
  )
}
