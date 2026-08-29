'use client';

import { useState, useEffect, useRef } from 'react';

/**
 * Hook to detect scroll direction and trigger autohide for mobile header and footerbar.
 * Returns `true` when navigation should be visible, and `false` when it should hide.
 */
export function useAutoHideOnScroll(threshold: number = 8): boolean {
  const [isVisible, setIsVisible] = useState(true);
  const lastScrollY = useRef(0);
  const touchStartY = useRef(0);

  useEffect(() => {
    // 1. Handle scroll events on window/document
    const handleScroll = () => {
      const currentScrollY = window.scrollY || document.documentElement.scrollTop || document.body.scrollTop || 0;

      // Always show when near the very top (< 25px)
      if (currentScrollY < 25) {
        setIsVisible(true);
        lastScrollY.current = currentScrollY;
        return;
      }

      const diff = currentScrollY - lastScrollY.current;

      if (diff > threshold && currentScrollY > 40) {
        // Scrolling DOWN -> Hide
        setIsVisible(false);
      } else if (diff < -threshold) {
        // Scrolling UP -> Show
        setIsVisible(true);
      }

      lastScrollY.current = currentScrollY;
    };

    // 2. Handle touch gestures on mobile for instant response
    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches && e.touches[0]) {
        touchStartY.current = e.touches[0].clientY;
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!e.touches || !e.touches[0]) return;
      const touchEndY = e.touches[0].clientY;
      const diffY = touchStartY.current - touchEndY;
      const currentScrollY = window.scrollY || document.documentElement.scrollTop || document.body.scrollTop || 0;

      if (currentScrollY < 25) {
        setIsVisible(true);
        return;
      }

      if (diffY > 12) {
        // Swiping UP (scrolling down the page) -> Hide
        setIsVisible(false);
      } else if (diffY < -12) {
        // Swiping DOWN (scrolling up the page) -> Show
        setIsVisible(true);
      }
    };

    // 3. Handle scroll events on internal main container if page uses element scroll
    const mainEl = document.getElementById('student-main-content') || document.querySelector('main');
    const handleMainScroll = () => {
      if (!mainEl) return;
      const currentScrollY = mainEl.scrollTop;

      if (currentScrollY < 25) {
        setIsVisible(true);
        lastScrollY.current = currentScrollY;
        return;
      }

      const diff = currentScrollY - lastScrollY.current;

      if (diff > threshold && currentScrollY > 40) {
        setIsVisible(false);
      } else if (diff < -threshold) {
        setIsVisible(true);
      }

      lastScrollY.current = currentScrollY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    document.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: true });
    
    if (mainEl) {
      mainEl.addEventListener('scroll', handleMainScroll, { passive: true });
    }

    return () => {
      window.removeEventListener('scroll', handleScroll);
      document.removeEventListener('scroll', handleScroll);
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
      if (mainEl) {
        mainEl.removeEventListener('scroll', handleMainScroll);
      }
    };
  }, [threshold]);

  return isVisible;
}
