import type { ReactNode } from 'react';

import { cn } from '@/shared/lib/cn';

import styles from './IntegrationCard.module.css';

interface IntegrationCardProps {
  /** Инициал или иконка в цветном квадрате слева. */
  logo: ReactNode;
  logoColor: string;
  name: string;
  badges?: ReactNode;
  description: string;
  meta?: ReactNode;
  actions?: ReactNode;
  /** Нижняя строка с тумблером — отделяется линией. */
  control?: ReactNode;
  muted?: boolean;
}

export function IntegrationCard({
  logo,
  logoColor,
  name,
  badges,
  description,
  meta,
  actions,
  control,
  muted = false,
}: IntegrationCardProps) {
  return (
    <div className={cn(styles.card, muted && styles.muted)}>
      <span className={styles.logo} style={{ background: logoColor }} aria-hidden="true">
        {logo}
      </span>

      <div className={styles.body}>
        <div className={styles.titleRow}>
          <span className={styles.name}>{name}</span>
          {badges}
        </div>
        <p className={styles.description}>{description}</p>
        {meta && <div className={styles.meta}>{meta}</div>}
        {control && <div className={styles.control}>{control}</div>}
      </div>

      {actions && <div className={styles.actions}>{actions}</div>}
    </div>
  );
}

export { styles as integrationStyles };
