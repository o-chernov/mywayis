import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';

import { useSession } from '@/app/providers/SessionProvider';
import { AI_CONVERSATION_ID, buildMessages } from '@/mocks/conversations';
import { useFormatters } from '@/shared/lib/useFormatters';
import { LockIcon, SparkleIcon } from '@/shared/icons';
import { Badge, Button, Card } from '@/shared/ui';

import styles from './Dashboard.module.css';

/**
 * На Free — тизер с размытой заглушкой отчёта. На Pro — настоящий свежий
 * разбор со ссылкой в чат агента.
 */
export function AiPanel() {
  const { t } = useTranslation(['dashboard', 'common']);
  const { isPro } = useSession();
  const navigate = useNavigate();
  const formatters = useFormatters();

  if (!isPro) {
    return (
      <div className={styles.teaser}>
        <div className={styles.teaserHead}>
          <SparkleIcon width={16} height={16} style={{ color: 'var(--accent-text)' }} />
          <span className={styles.teaserTitle}>{t('dashboard:ai.teaserTitle')}</span>
          <Badge tone="accent">{t('common:plan.proBadge')}</Badge>
        </div>

        <p className={styles.teaserText}>{t('dashboard:ai.teaserText')}</p>

        <div className={styles.teaserPreview} aria-hidden="true">
          <span className={styles.teaserLine} style={{ width: '82%' }} />
          <span className={styles.teaserLine} style={{ width: '64%' }} />
          <span className={styles.teaserLine} style={{ width: '73%' }} />
        </div>

        <Button
          variant="primary"
          iconLeft={<LockIcon width={14} height={14} />}
          onClick={() => navigate('/settings/subscription')}
        >
          {t('dashboard:ai.teaserCta')}
        </Button>
      </div>
    );
  }

  const messages = buildMessages(AI_CONVERSATION_ID, true);
  const latest = messages[messages.length - 1]?.report;
  if (!latest) return null;

  return (
    <Card
      title={
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--space-2)' }}>
          <SparkleIcon width={15} height={15} style={{ color: 'var(--accent-text)' }} />
          {t('dashboard:ai.reportTitle')}
        </span>
      }
      subtitle={t('dashboard:ai.reportHint', { period: latest.periodLabel })}
      actions={
        <Button size="sm" onClick={() => navigate('/messages?conversation=c-ai')}>
          {t('dashboard:ai.openChat')}
        </Button>
      }
    >
      <div style={{ display: 'flex', gap: 'var(--space-6)', marginBottom: 'var(--space-4)' }}>
        <div>
          <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
            {t('dashboard:kpi.total')}
          </div>
          <div
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 'var(--text-xl)',
              fontWeight: 600,
            }}
          >
            {formatters.duration(latest.totalSeconds)}
          </div>
        </div>
        <div>
          <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
            {t('dashboard:ai.focus')}
          </div>
          <div
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 'var(--text-xl)',
              fontWeight: 600,
            }}
          >
            {latest.focusScore}
          </div>
        </div>
      </div>

      <div className={styles.insights}>
        {latest.bullets.map((bullet) => (
          <p key={bullet} className={styles.insight}>
            <span className={styles.insightBullet} aria-hidden="true" />
            {bullet}
          </p>
        ))}
      </div>
    </Card>
  );
}
