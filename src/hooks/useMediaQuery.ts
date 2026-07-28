import { useSyncExternalStore } from 'react'

/**
 * Subscribe to a CSS media query.
 *
 * Uses `useSyncExternalStore` so the value is correct on the very first render —
 * important for the hero, which must decide whether to mount a WebGL canvas
 * before anything paints rather than after a flash of the wrong variant.
 */
export function useMediaQuery(query: string): boolean {
  function subscribe(onChange: () => void) {
    const list = window.matchMedia(query)
    list.addEventListener('change', onChange)
    return () => list.removeEventListener('change', onChange)
  }

  function getSnapshot() {
    return window.matchMedia(query).matches
  }

  // No matchMedia during SSR / prerender — assume the lighter variant.
  function getServerSnapshot() {
    return false
  }

  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
}

/** True on phones and small tablets, where the 3D scene is skipped entirely. */
export function useIsSmallScreen(): boolean {
  return useMediaQuery('(max-width: 768px)')
}

/** True when the device has no precise pointer — disables hover-tilt effects. */
export function useIsTouch(): boolean {
  return useMediaQuery('(hover: none)')
}
