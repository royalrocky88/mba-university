import { useEffect } from 'react'

/**
 * Freezes background scrolling while a modal surface is open (mobile nav drawer,
 * gallery lightbox, chat panel on phones). Compensates for the disappearing
 * scrollbar so the layout does not jump on desktop.
 */
export function useLockBodyScroll(locked: boolean): void {
  useEffect(() => {
    if (!locked) return

    const { overflow, paddingRight } = document.body.style
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth

    document.body.style.overflow = 'hidden'
    if (scrollbarWidth > 0) document.body.style.paddingRight = `${scrollbarWidth}px`

    return () => {
      document.body.style.overflow = overflow
      document.body.style.paddingRight = paddingRight
    }
  }, [locked])
}
