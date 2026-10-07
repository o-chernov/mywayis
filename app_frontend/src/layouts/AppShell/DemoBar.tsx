import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { useSession } from '@/app/providers/SessionProvider';
import { useToast } from '@/app/providers/ToastProvider';
import { SegmentedControl } from '@/shared/ui';
import { Button } from '@/shared/ui';
import type { Persona } from '@/types';

import styles from './AppShell.module.css';

/**
 * Панель переключения демо-сценариев. Регистрации в прототипе нет, поэтому
 * состояния «новичок / free / pro» выбираются здесь.
 */
export function DemoBar() {
  const { t } = useTranslation('common');
  const { persona, switchPersona, resetDemo } = useSession();
  const { toast } = useToast();
  const [visible, setVisible] = useState(true);

  if (!visible) {
    return (
      <button type="button" className={styles.demoToggle} onClick={() => setVisible(true)}>
        {t('demo.show')}
      </button>
    );
  }

  return (
    <div className={styles.demoBar}>
      <span className={styles.demoLabel}>{t('demo.title')}</span>
      <SegmentedControl<Persona>
        ariaLabel={t('demo.persona')}
        value={persona}
        onChange={switchPersona}
        options={[
          { value: 'new', label: t('demo.new') },
          { value: 'free', label: t('demo.free') },
          { value: 'pro', label: t('demo.pro') },
        ]}
      />
      <span className={styles.demoDivider} />
      <Button
        variant="ghost"
        size="sm"
        onClick={() => {
          resetDemo();
          toast(t('demo.resetDone'), { tone: 'info' });
        }}
      >
        {t('demo.reset')}
      </Button>
      <Button variant="ghost" size="sm" onClick={() => setVisible(false)}>
        {t('demo.hide')}
      </Button>
    </div>
  );
}
