import { useEffect, useRef, useState } from "react";

/**
 * Custom hook for iOS-style pull-to-refresh functionality
 * Works on mobile devices with touch events
 */
export const usePullToRefresh = (onRefresh, options = {}) => {
  const {
    threshold = 60, // Distance to pull before triggering refresh
    maxPullDistance = 120, // Maximum pull distance
    enabled = true,
  } = options;

  const [isPulling, setIsPulling] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const touchStartY = useRef(0);
  const scrollableRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    if (!enabled) return;

    const container = containerRef.current;
    if (!container) return;

    let startY = 0;
    let currentY = 0;
    let pulling = false;
    let scrollTop = 0;

    const handleTouchStart = (e) => {
      scrollTop = window.pageYOffset || document.documentElement.scrollTop;

      // Only start pull if scrolled to top
      if (scrollTop === 0) {
        startY = e.touches[0].clientY;
        touchStartY.current = startY;
        pulling = true;
      }
    };

    const handleTouchMove = (e) => {
      if (!pulling) return;

      currentY = e.touches[0].clientY;
      const distance = currentY - startY;

      // Only pull down (positive distance) and when at top
      if (distance > 0 && scrollTop === 0) {
        // Prevent default scrolling
        e.preventDefault();

        // Apply elastic resistance (gets harder as you pull more)
        const resistedDistance = Math.min(
          distance * (1 - distance / (maxPullDistance * 3)),
          maxPullDistance
        );

        setPullDistance(resistedDistance);
        setIsPulling(true);
      }
    };

    const handleTouchEnd = async () => {
      if (!pulling) return;

      pulling = false;

      // Trigger refresh if pulled beyond threshold
      if (pullDistance >= threshold) {
        setIsRefreshing(true);
        setIsPulling(false);

        try {
          await onRefresh();
        } finally {
          // Smooth transition back
          setTimeout(() => {
            setIsRefreshing(false);
            setPullDistance(0);
          }, 300);
        }
      } else {
        // Animate back to 0
        setIsPulling(false);
        setPullDistance(0);
      }
    };

    container.addEventListener("touchstart", handleTouchStart, {
      passive: true,
    });
    container.addEventListener("touchmove", handleTouchMove, {
      passive: false,
    });
    container.addEventListener("touchend", handleTouchEnd, { passive: true });

    return () => {
      container.removeEventListener("touchstart", handleTouchStart);
      container.removeEventListener("touchmove", handleTouchMove);
      container.removeEventListener("touchend", handleTouchEnd);
    };
  }, [enabled, threshold, maxPullDistance, pullDistance, onRefresh]);

  return {
    scrollableRef,
    containerRef,
    isPulling,
    pullDistance,
    isRefreshing,
  };
};
