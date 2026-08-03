import type { Variants, Transition } from 'framer-motion'

// ─── Transitions ──────────────────────────────────────────
export const springTransition: Transition = {
  type: 'spring',
  stiffness: 400,
  damping: 30,
}

export const smoothOut: Transition = {
  duration: 0.26,
  ease: [0.16, 1, 0.3, 1],
}

export const fastFade: Transition = {
  duration: 0.15,
  ease: 'easeOut',
}

// ─── Page / Section Variants ──────────────────────────────
export const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 6 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.26, ease: [0.16, 1, 0.3, 1] },
  },
}

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.25, ease: 'easeOut' },
  },
}

export const staggerContainer: Variants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.035, delayChildren: 0 },
  },
}

export const staggerContainerSlow: Variants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.06, delayChildren: 0 },
  },
}

// ─── Results Document Reveal ─────────────────────────────
export const titleReveal: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.4, ease: 'easeOut' },
  },
}

export const documentCascade: Variants = {
  hidden: { opacity: 0, y: 6 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3, ease: [0.16, 1, 0.3, 1] },
  },
}

// ─── Stage Poem ───────────────────────────────────────────
export const stageActiveAppear: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.3, ease: 'easeOut' },
  },
  exit: {
    opacity: 0,
    scale: 0.96,
    y: -4,
    transition: { duration: 0.22, ease: 'easeIn' },
  },
}

export const stageCompletedItem: Variants = {
  hidden: { opacity: 0, y: 4 },
  visible: {
    opacity: 0.5,
    y: 0,
    transition: { duration: 0.25, ease: 'easeOut' },
  },
}

// ─── Upload Zone ──────────────────────────────────────────
export const uploadZoneHover: Variants = {
  rest: { scale: 1 },
  hover: { scale: 1.005, transition: { duration: 0.2, ease: 'easeOut' } },
  drag: { scale: 1.02, transition: { duration: 0.14, ease: 'easeOut' } },
}

// ─── Action Item Toggle ───────────────────────────────────
export const toggleFill: Variants = {
  unchecked: { scale: 0 },
  checked: {
    scale: 1,
    transition: { type: 'spring', stiffness: 500, damping: 28 },
  },
}

// ─── Chat / Ask ───────────────────────────────────────────
export const answerAppear: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.25, ease: 'easeOut' },
  },
}

// ─── Popover ──────────────────────────────────────────────
export const popoverVariants: Variants = {
  hidden: { opacity: 0, scale: 0.95, y: -4 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { duration: 0.18, ease: [0.16, 1, 0.3, 1] },
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    y: -4,
    transition: { duration: 0.14, ease: 'easeIn' },
  },
}

// ─── Sticky Header ────────────────────────────────────────
export const stickyHeaderVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.2, ease: 'easeOut' },
  },
}

// ─── Modal / Dialog ───────────────────────────────────────
export const overlayVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.2 } },
  exit: { opacity: 0, transition: { duration: 0.15 } },
}
