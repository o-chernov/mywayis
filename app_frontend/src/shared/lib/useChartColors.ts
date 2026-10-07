import { useEffect, useState } from 'react';

import { useTheme } from '@/app/providers/ThemeProvider';

/**
 * Recharts принимает строки цветов, а не CSS-переменные, поэтому значения
 * приходится вычитывать из документа и пересчитывать при смене темы. Без
 * этого графики остаются тёмными на светлой теме.
 */
export interface ChartColors {
  viz: string[];
  accent: string;
  grid: string;
  axis: string;
  surface: string;
  border: string;
  text: string;
  muted: string;
  success: string;
  danger: string;
}

function readColors(): ChartColors {
  const style = getComputedStyle(document.documentElement);
  const read = (name: string) => style.getPropertyValue(name).trim();

  return {
    viz: [1, 2, 3, 4, 5, 6, 7, 8].map((index) => read(`--viz-${index}`)),
    accent: read('--accent'),
    grid: read('--border-subtle'),
    axis: read('--text-muted'),
    surface: read('--bg-elevated'),
    border: read('--border-default'),
    text: read('--text-primary'),
    muted: read('--text-muted'),
    success: read('--success'),
    danger: read('--danger'),
  };
}

export function useChartColors(): ChartColors {
  const { resolved } = useTheme();
  const [colors, setColors] = useState<ChartColors>(readColors);

  useEffect(() => {
    // Токены меняются в том же кадре, что и data-theme, но перечитываем
    // на следующем тике — так надёжнее при переходах.
    const id = window.requestAnimationFrame(() => setColors(readColors()));
    return () => window.cancelAnimationFrame(id);
  }, [resolved]);

  return colors;
}
