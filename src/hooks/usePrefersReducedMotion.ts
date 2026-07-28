import { useMediaQuery } from './useMediaQuery'

/**
 * Honours the OS-level "reduce motion" setting.
 *
 * The CSS in `index.css` already neutralises transitions, but the 3D hero needs
 * this in JS so it can avoid creating a WebGL context at all rather than
 * creating one and animating it slowly.
 */
export function usePrefersReducedMotion(): boolean {
  return useMediaQuery('(prefers-reduced-motion: reduce)')
}
