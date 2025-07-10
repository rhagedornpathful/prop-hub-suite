import { useEffect, useState, RefObject } from 'react';

interface ContainerSize {
  width: number;
  height: number;
}

interface ContainerBreakpoints {
  sm: number;
  md: number;
  lg: number;
  xl: number;
}

const defaultBreakpoints: ContainerBreakpoints = {
  sm: 320,
  md: 640,
  lg: 1024,
  xl: 1280,
};

export function useContainerQueries(
  containerRef: RefObject<HTMLElement>,
  customBreakpoints?: Partial<ContainerBreakpoints>
) {
  const [size, setSize] = useState<ContainerSize>({ width: 0, height: 0 });
  const breakpoints = { ...defaultBreakpoints, ...customBreakpoints };

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const updateSize = () => {
      const rect = container.getBoundingClientRect();
      setSize({
        width: rect.width,
        height: rect.height,
      });
    };

    // Initial measurement
    updateSize();

    // Use ResizeObserver for efficient container size tracking
    const resizeObserver = new ResizeObserver(updateSize);
    resizeObserver.observe(container);

    return () => {
      resizeObserver.disconnect();
    };
  }, [containerRef]);

  const containerClasses = {
    'container-sm': size.width >= breakpoints.sm,
    'container-md': size.width >= breakpoints.md,
    'container-lg': size.width >= breakpoints.lg,
    'container-xl': size.width >= breakpoints.xl,
  };

  return {
    size,
    isSmall: size.width < breakpoints.sm,
    isMedium: size.width >= breakpoints.sm && size.width < breakpoints.md,
    isLarge: size.width >= breakpoints.md && size.width < breakpoints.lg,
    isExtraLarge: size.width >= breakpoints.lg,
    containerClasses,
    width: size.width,
    height: size.height,
  };
}

// Hook for CSS container query class generation
export function useContainerQueryClasses(
  containerRef: RefObject<HTMLElement>,
  customBreakpoints?: Partial<ContainerBreakpoints>
) {
  const { containerClasses } = useContainerQueries(containerRef, customBreakpoints);
  
  return Object.entries(containerClasses)
    .filter(([_, isActive]) => isActive)
    .map(([className]) => className)
    .join(' ');
}