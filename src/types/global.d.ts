/**
 * Global type augmentations.
 */
export {};

declare global {
  interface Window {
    /**
     * Set to true while a programmatic scroll is in flight (Lenis scrollTo).
     * Read by IntersectionObserver callbacks in HomePage/Navbar/Hero to suppress
     * active-section updates during the animation.
     */
    isProgrammaticScroll?: boolean;
  }
}
