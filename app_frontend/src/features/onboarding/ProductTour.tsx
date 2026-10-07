import { useEffect, useLayoutEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';

import { TOUR_STEPS, useOnboarding } from '@/app/providers/OnboardingProvider';
import { cn } from '@/shared/lib/cn';
import { Button } from '@/shared/ui';

import styles from './ProductTour.module.css';

interface Rect {
  top: number;
  left: number;
  width: number;
  height: number;
}

const PADDING = 6;
const BUBBLE_WIDTH = 330;
const BUBBLE_HEIGHT = 260;
const GAP = 14;
const EDGE = 16;

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(value, max));
}

/**
 * Позиция подсказки: справа от цели, если места хватает; иначе снизу, а если
 * и снизу не влезает — сверху. Итог в любом случае прижимаем к окну, чтобы
 * крупная цель (например, вся область контента) не вытолкнула пузырь за экран.
 */
function placeBubble(target: Rect): { top: number; left: number } {
  const maxTop = window.innerHeight - BUBBLE_HEIGHT - EDGE;
  const maxLeft = window.innerWidth - BUBBLE_WIDTH - EDGE;

  const rightEdge = target.left + target.width + GAP;
  const fitsRight = rightEdge + BUBBLE_WIDTH < window.innerWidth - EDGE;

  if (fitsRight) {
    return { top: clamp(target.top - 8, EDGE, maxTop), left: rightEdge };
  }

  const below = target.top + target.height + GAP;
  const fitsBelow = below + BUBBLE_HEIGHT < window.innerHeight - EDGE;
  const top = fitsBelow ? below : target.top - BUBBLE_HEIGHT - GAP;

  return { top: clamp(top, EDGE, maxTop), left: clamp(target.left, EDGE, maxLeft) };
}

export function ProductTour() {
  const { t } = useTranslation(['onboarding', 'common']);
  const { tourStep, totalSteps, nextStep, prevStep, skipTour } = useOnboarding();
  const [rect, setRect] = useState<Rect | null>(null);

  const step = TOUR_STEPS[tourStep];

  // Пересчитываем вырез при смене шага, ресайзе и скролле.
  useLayoutEffect(() => {
    function measure() {
      const node = step.anchors.reduce<HTMLElement | null>(
        (found, anchor) =>
          found ?? document.querySelector<HTMLElement>(`[data-tour="${anchor}"]`),
        null,
      );
      if (!node) {
        setRect(null);
        return;
      }
      const box = node.getBoundingClientRect();
      setRect({
        top: box.top - PADDING,
        left: box.left - PADDING,
        width: box.width + PADDING * 2,
        height: box.height + PADDING * 2,
      });
    }

    measure();
    window.addEventListener('resize', measure);
    window.addEventListener('scroll', measure, true);
    return () => {
      window.removeEventListener('resize', measure);
      window.removeEventListener('scroll', measure, true);
    };
  }, [step.anchors]);

  // Стрелки и Esc — тур должен управляться с клавиатуры.
  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'ArrowRight' || event.key === 'Enter') nextStep();
      if (event.key === 'ArrowLeft') prevStep();
      if (event.key === 'Escape') skipTour();
    }
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [nextStep, prevStep, skipTour]);

  const root = document.getElementById('modal-root');
  if (!root || !rect) return null;

  const bubble = placeBubble(rect);
  const isLast = tourStep === totalSteps - 1;

  return createPortal(
    <div className={styles.layer} role="dialog" aria-modal="true" aria-label={t('onboarding:tour.progress', { current: tourStep + 1, total: totalSteps })}>
      <div
        className={styles.spotlight}
        style={{ top: rect.top, left: rect.left, width: rect.width, height: rect.height }}
      />

      <div className={styles.bubble} style={{ top: bubble.top, left: bubble.left }}>
        <span className={styles.progress}>
          {t('onboarding:tour.progress', { current: tourStep + 1, total: totalSteps })}
        </span>
        <span className={styles.title}>{t(`onboarding:tour.steps.${step.id}.title`)}</span>
        <p className={styles.text}>{t(`onboarding:tour.steps.${step.id}.text`)}</p>

        <div className={styles.dots} aria-hidden="true">
          {TOUR_STEPS.map((item, index) => (
            <span
              key={item.id}
              className={cn(
                styles.dot,
                index === tourStep && styles.dotActive,
                index < tourStep && styles.dotDone,
              )}
            />
          ))}
        </div>

        <div className={styles.actions}>
          <Button variant="ghost" size="sm" onClick={skipTour}>
            {t('onboarding:tour.skipAll')}
          </Button>
          <span className={styles.spacer} />
          {tourStep > 0 && (
            <Button variant="secondary" size="sm" onClick={prevStep}>
              {t('common:actions.back')}
            </Button>
          )}
          <Button variant="primary" size="sm" onClick={nextStep}>
            {isLast ? t('onboarding:tour.finish') : t('common:actions.next')}
          </Button>
        </div>
      </div>
    </div>,
    root,
  );
}
