import { useCallback, useEffect, useRef } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { createPortal } from 'react-dom'
import { Icon } from './Icon'
import { useFocusTrap } from '@/hooks/useFocusTrap'
import { useLockBodyScroll } from '@/hooks/useLockBodyScroll'
import type { GalleryItem } from '@/data/types'

/**
 * Full-screen gallery viewer.
 *
 * Keyboard: Escape closes, ← / → move between items. Focus is trapped inside the
 * dialog and returned to the thumbnail that opened it.
 */

type LightboxProps = {
  items: GalleryItem[]
  index: number | null
  onClose: () => void
  onNavigate: (index: number) => void
}

export function Lightbox({ items, index, onClose, onNavigate }: LightboxProps) {
  const panelRef = useRef<HTMLDivElement>(null)
  const open = index !== null

  useLockBodyScroll(open)
  useFocusTrap(panelRef, open)

  const goPrevious = useCallback(() => {
    if (index === null) return
    onNavigate((index - 1 + items.length) % items.length)
  }, [index, items.length, onNavigate])

  const goNext = useCallback(() => {
    if (index === null) return
    onNavigate((index + 1) % items.length)
  }, [index, items.length, onNavigate])

  useEffect(() => {
    if (!open) return

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') onClose()
      if (event.key === 'ArrowLeft') goPrevious()
      if (event.key === 'ArrowRight') goNext()
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [open, onClose, goPrevious, goNext])

  const item = index !== null ? items[index] : null

  return createPortal(
    <AnimatePresence>
      {open && item && (
        <motion.div
          className="fixed inset-0 z-[90] flex items-center justify-center bg-ink-950/92 p-4 backdrop-blur-sm sm:p-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          onClick={onClose}
          role="dialog"
          aria-modal="true"
          aria-label={`${item.title} — image ${index + 1} of ${items.length}`}
        >
          <div
            ref={panelRef}
            className="relative w-full max-w-4xl"
            onClick={(event) => event.stopPropagation()}
          >
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className={`aspect-[16/10] w-full rounded-2xl bg-gradient-to-br ${item.tone} shadow-[0_40px_120px_-30px_rgba(0,0,0,0.8)]`}
            />

            <div className="mt-5 flex items-start justify-between gap-6">
              <div>
                <h3 className="font-display text-xl text-ivory">{item.title}</h3>
                <p className="mt-1 max-w-xl text-sm text-ivory/60">{item.caption}</p>
              </div>
              <span className="shrink-0 pt-1 text-xs tracking-widest text-ivory/40 tabular-nums">
                {String(index + 1).padStart(2, '0')} / {String(items.length).padStart(2, '0')}
              </span>
            </div>

            <button
              type="button"
              onClick={goPrevious}
              aria-label="Previous image"
              className="absolute top-1/2 -left-2 grid size-11 -translate-y-1/2 place-items-center rounded-full border border-ivory/20 bg-ink-900/70 text-ivory backdrop-blur transition-colors hover:bg-ink-800 sm:-left-16"
            >
              <Icon name="chevron-left" size={20} />
            </button>
            <button
              type="button"
              onClick={goNext}
              aria-label="Next image"
              className="absolute top-1/2 -right-2 grid size-11 -translate-y-1/2 place-items-center rounded-full border border-ivory/20 bg-ink-900/70 text-ivory backdrop-blur transition-colors hover:bg-ink-800 sm:-right-16"
            >
              <Icon name="chevron-right" size={20} />
            </button>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close gallery"
            className="absolute top-4 right-4 grid size-11 place-items-center rounded-full border border-ivory/20 text-ivory transition-colors hover:bg-ivory/10 sm:top-6 sm:right-6"
          >
            <Icon name="close" size={20} />
          </button>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  )
}
