import { useEffect } from 'react'
import { site } from '@/data/site'

/**
 * Sets `document.title` for the lifetime of a page component and restores the
 * previous value on unmount. Keeps titles meaningful for browser history and
 * screen readers without pulling in a head-management library.
 */
export function useDocumentTitle(title: string, description?: string): void {
  useEffect(() => {
    const previous = document.title
    document.title = `${title} — ${site.shortName}`

    let previousDescription: string | null = null
    const meta = document.querySelector<HTMLMetaElement>('meta[name="description"]')
    if (description && meta) {
      previousDescription = meta.content
      meta.content = description
    }

    return () => {
      document.title = previous
      if (previousDescription !== null && meta) meta.content = previousDescription
    }
  }, [title, description])
}
