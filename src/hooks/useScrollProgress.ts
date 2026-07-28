import { useEffect, useState } from 'react'

/** Fraction of the document scrolled, 0 → 1. Drives the reading bar on articles. */
export function useScrollProgress(): number {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    let frame = 0

    function update() {
      frame = 0
      const scrollable = document.documentElement.scrollHeight - window.innerHeight
      setProgress(scrollable > 0 ? window.scrollY / scrollable : 0)
    }

    function onScroll() {
      if (frame) return
      frame = requestAnimationFrame(update)
    }

    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      if (frame) cancelAnimationFrame(frame)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [])

  return progress
}

/** True once the page has scrolled past `threshold` pixels. Used by the navbar. */
export function useScrolledPast(threshold = 24): boolean {
  const [passed, setPassed] = useState(false)

  useEffect(() => {
    let frame = 0

    function update() {
      frame = 0
      setPassed(window.scrollY > threshold)
    }

    function onScroll() {
      if (frame) return
      frame = requestAnimationFrame(update)
    }

    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      if (frame) cancelAnimationFrame(frame)
      window.removeEventListener('scroll', onScroll)
    }
  }, [threshold])

  return passed
}
