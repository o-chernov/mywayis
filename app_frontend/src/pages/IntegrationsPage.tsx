import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';

import { useSession } from '@/app/providers/SessionProvider';
import { useToast } from '@/app/providers/ToastProvider';
import { ConnectWakatimeModal } from '@/features/integrations/ConnectWakatimeModal';
import {
  IntegrationCard,
  integrationStyles as styles,
} from '@/features/integrations/IntegrationCard';
import { TrackedTagsModal } from '@/features/integrations/TrackedTagsModal';
import { PageHeader } from '@/layouts/PageHeader/PageHeader';
import { useFormatters } from '@/shared/lib/useFormatters';
import { AlertIcon, ClockIcon, SparkleIcon, TrophyIcon } from '@/shared/icons';
import { Badge, Button, Modal, Switch, Tooltip } from '@/shared/ui';

const SOON_INTEGRATIONS = [
  { id: 'github', color: '#3d4250', initial: 'GH' },
  { id: 'gitlab', color: '#c1502b', initial: 'GL' },
  { id: 'figma', color: '#a259ff', initial: 'F' },
  { id: 'jira', color: '#2a6fd6', initial: 'J' },
  { id: 'toggl', color: '#c73a5a', initial: 'T' },
] as const;

export function IntegrationsPage() {
  const { t } = useTranslation(['integrations', 'common']);
  const { user, integrations, isPro, updateIntegrations, connectWakatime, disconnectWakatime } =
    useSession();
  const { toast } = useToast();
  const formatters = useFormatters();
  const navigate = useNavigate();

  const [connectOpen, setConnectOpen] = useState(false);
  const [tagsOpen, setTagsOpen] = useState(false);
  const [tagsFirstRun, setTagsFirstRun] = useState(false);
  const [disconnectOpen, setDisconnectOpen] = useState(false);
  const [leaveOpen, setLeaveOpen] = useState(false);

  const wakatimeConnected = integrations.wakatime.status === 'connected';
  const hasError = integrations.wakatime.status === 'error';

  function onTournamentToggle(next: boolean) {
    if (!next) {
      setLeaveOpen(true);
      return;
    }
    updateIntegrations({ leaderboard: { participating: true } });
    toast(t('integrations:leaderboard.joined'));
  }

  return (
    <>
      <PageHeader title={t('integrations:page.title')} subtitle={t('integrations:page.subtitle')} />

      <div style={{ display: 'grid', gap: 'var(--space-8)' }}>
        <section className={styles.section}>
          <span className={styles.sectionTitle}>
            {wakatimeConnected
              ? t('integrations:sections.connected')
              : t('integrations:sections.available')}
          </span>

          <div className={styles.grid}>
            <IntegrationCard
              logo="W"
              logoColor="#3d5a9e"
              name={t('integrations:wakatime.name')}
              description={t('integrations:wakatime.description')}
              badges={
                hasError ? (
                  <Badge tone="danger" dot>
                    {t('integrations:status.error')}
                  </Badge>
                ) : wakatimeConnected ? (
                  <Badge tone="success" dot>
                    {t('integrations:status.connected')}
                  </Badge>
                ) : (
                  <Badge tone="neutral">{t('integrations:status.disconnected')}</Badge>
                )
              }
              meta={
                wakatimeConnected && (
                  <>
                    <span className={styles.metaItem}>
                      <ClockIcon width={13} height={13} />
                      {integrations.wakatime.lastSyncedAt
                        ? t('integrations:status.lastSync', {
                            time: formatters.relative(integrations.wakatime.lastSyncedAt),
                          })
                        : t('integrations:status.neverSynced')}
                    </span>
                    <span className={styles.metaItem}>
                      {t('integrations:wakatime.currentKey')}:{' '}
                      <span className={styles.key}>{integrations.wakatime.apiKeyMask}</span>
                    </span>
                  </>
                )
              }
              actions={
                wakatimeConnected ? (
                  <>
                    <Button
                      onClick={() => {
                        setTagsFirstRun(false);
                        setTagsOpen(true);
                      }}
                    >
                      {t('integrations:wakatime.configure')}
                    </Button>
                    <Button variant="dangerGhost" onClick={() => setDisconnectOpen(true)}>
                      {t('common:actions.disconnect')}
                    </Button>
                  </>
                ) : (
                  <Button variant="primary" onClick={() => setConnectOpen(true)}>
                    {t('integrations:wakatime.connect')}
                  </Button>
                )
              }
            />

            <IntegrationCard
              logo={<TrophyIcon width={19} height={19} />}
              logoColor="var(--accent)"
              name={t('integrations:leaderboard.name')}
              description={t('integrations:leaderboard.description')}
              muted={!wakatimeConnected}
              badges={
                <>
                  <Badge tone="accent">{t('integrations:leaderboard.internal')}</Badge>
                  {integrations.leaderboard.participating && (
                    <Badge tone="success" dot>
                      {t('integrations:status.connected')}
                    </Badge>
                  )}
                </>
              }
              control={
                <Tooltip
                  content={!wakatimeConnected ? t('integrations:leaderboard.requiresWakatime') : ''}
                >
                  <Switch
                    checked={integrations.leaderboard.participating}
                    disabled={!wakatimeConnected}
                    onChange={onTournamentToggle}
                    label={t('integrations:leaderboard.toggle')}
                  />
                </Tooltip>
              }
              actions={
                integrations.leaderboard.participating && (
                  <Button onClick={() => navigate('/leaderboard')}>
                    {t('common:nav.leaderboard')}
                  </Button>
                )
              }
            />

            <IntegrationCard
              logo={<SparkleIcon width={19} height={19} />}
              logoColor="var(--viz-6)"
              name={t('integrations:aiAgent.name')}
              description={t('integrations:aiAgent.description')}
              muted={!isPro}
              badges={
                isPro ? (
                  <Badge tone="success" dot>
                    {t('integrations:aiAgent.enabled')}
                  </Badge>
                ) : (
                  <Badge tone="accent">{t('common:plan.proBadge')}</Badge>
                )
              }
              meta={!isPro && <span>{t('integrations:aiAgent.requiresPro')}</span>}
              actions={
                isPro ? (
                  <Button onClick={() => navigate('/messages')}>{t('common:nav.messages')}</Button>
                ) : (
                  <Button variant="primary" onClick={() => navigate('/settings/subscription')}>
                    {t('common:actions.upgrade')}
                  </Button>
                )
              }
            />
          </div>
        </section>

        <section className={styles.section}>
          <span className={styles.sectionTitle}>{t('integrations:sections.soon')}</span>

          <div className={`${styles.grid} ${styles.gridTwo}`}>
            {SOON_INTEGRATIONS.map((item) => (
              <IntegrationCard
                key={item.id}
                logo={item.initial}
                logoColor={item.color}
                name={t(`integrations:soon.${item.id}`)}
                description={t(`integrations:soon.${item.id}Description`)}
                badges={<Badge tone="neutral">{t('integrations:soon.badge')}</Badge>}
                muted
                actions={
                  <Button
                    size="sm"
                    onClick={() =>
                      toast(
                        t('integrations:soon.notified', { name: t(`integrations:soon.${item.id}`) }),
                        { tone: 'info' },
                      )
                    }
                  >
                    {t('integrations:soon.notify')}
                  </Button>
                }
              />
            ))}
          </div>
        </section>
      </div>

      <ConnectWakatimeModal
        open={connectOpen}
        onClose={() => setConnectOpen(false)}
        onConnected={(mask) => {
          connectWakatime(mask);
          setConnectOpen(false);
          toast(t('integrations:wakatime.connected'));
          // Сразу спрашиваем, что отслеживать и участвовать ли в турнире.
          setTagsFirstRun(true);
          setTagsOpen(true);
        }}
      />

      {tagsOpen && (
        <TrackedTagsModal
          open
          firstRun={tagsFirstRun}
          specialty={user.specialty}
          initialTags={integrations.trackedTags}
          initialParticipating={integrations.leaderboard.participating}
          onClose={() => setTagsOpen(false)}
          onSave={(tags, participating) => {
            updateIntegrations({ trackedTags: tags, leaderboard: { participating } });
            setTagsOpen(false);
            toast(t('integrations:tags.saved'));
          }}
        />
      )}

      <Modal
        open={disconnectOpen}
        onClose={() => setDisconnectOpen(false)}
        size="sm"
        iconTone="danger"
        icon={<AlertIcon width={18} height={18} />}
        title={t('integrations:wakatime.disconnectTitle')}
        subtitle={t('integrations:wakatime.disconnectText')}
        footer={
          <>
            <Button variant="ghost" onClick={() => setDisconnectOpen(false)}>
              {t('common:actions.cancel')}
            </Button>
            <Button
              variant="danger"
              onClick={() => {
                disconnectWakatime();
                setDisconnectOpen(false);
                toast(t('integrations:wakatime.disconnected'), { tone: 'info' });
              }}
            >
              {t('common:actions.disconnect')}
            </Button>
          </>
        }
      >
        {/* Каскад — самое неочевидное последствие, выносим отдельным блоком. */}
        <div
          style={{
            display: 'flex',
            gap: 'var(--space-2)',
            padding: 'var(--space-3)',
            borderRadius: 'var(--radius-md)',
            background: 'var(--warning-subtle)',
            color: 'var(--warning-text)',
            fontSize: 'var(--text-base)',
            lineHeight: 'var(--leading-normal)',
          }}
        >
          <TrophyIcon width={15} height={15} style={{ flexShrink: 0, marginTop: 2 }} />
          {t('integrations:wakatime.disconnectCascade')}
        </div>
      </Modal>

      <Modal
        open={leaveOpen}
        onClose={() => setLeaveOpen(false)}
        size="sm"
        iconTone="warning"
        icon={<TrophyIcon width={18} height={18} />}
        title={t('integrations:leaderboard.leaveTitle')}
        subtitle={t('integrations:leaderboard.leaveText')}
        footer={
          <>
            <Button variant="ghost" onClick={() => setLeaveOpen(false)}>
              {t('common:actions.cancel')}
            </Button>
            <Button
              variant="danger"
              onClick={() => {
                updateIntegrations({ leaderboard: { participating: false } });
                setLeaveOpen(false);
                toast(t('integrations:leaderboard.left'), { tone: 'info' });
              }}
            >
              {t('common:actions.confirm')}
            </Button>
          </>
        }
      />
    </>
  );
}
