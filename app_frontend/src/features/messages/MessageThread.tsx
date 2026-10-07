import { Fragment, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router';

import { useSession } from '@/app/providers/SessionProvider';
import { useToast } from '@/app/providers/ToastProvider';
import { cn } from '@/shared/lib/cn';
import { useFormatters } from '@/shared/lib/useFormatters';
import {
  BellIcon,
  BellOffIcon,
  LockIcon,
  MoreIcon,
  SendIcon,
  ShieldIcon,
  SparkleIcon,
  TrashIcon,
} from '@/shared/icons';
import {
  Avatar,
  Badge,
  Button,
  IconButton,
  Menu,
  MenuItem,
  MenuSeparator,
  Textarea,
} from '@/shared/ui';
import type { Conversation, Message } from '@/types';

import { AiReportCard } from './AiReportCard';
import styles from './Messages.module.css';

const ME = 'u1';

interface MessageThreadProps {
  conversation: Conversation;
  messages: Message[];
  onSend: (text: string) => void;
  onBlockRequest: () => void;
}

export function MessageThread({
  conversation,
  messages,
  onSend,
  onBlockRequest,
}: MessageThreadProps) {
  const { t } = useTranslation(['messages', 'common']);
  const { isPro, mutedConversationIds, toggleConversationMute, privacy, unblockUser } =
    useSession();
  const { toast } = useToast();
  const navigate = useNavigate();
  const formatters = useFormatters();

  const [draft, setDraft] = useState('');
  const feedRef = useRef<HTMLDivElement>(null);

  const muted = mutedConversationIds.includes(conversation.id);
  const blocked =
    conversation.blocked ||
    (conversation.participant ? privacy.blockedUserIds.includes(conversation.participant.id) : false);

  const isAi = conversation.kind === 'ai';
  const isSupport = conversation.kind === 'support';
  // Писать агенту можно только на Pro; в остальном ограничение — блокировка.
  const inputLocked = (isAi && !isPro) || blocked;

  // Держим ленту прокрученной вниз — как в любом мессенджере.
  useEffect(() => {
    const node = feedRef.current;
    if (node) node.scrollTop = node.scrollHeight;
  }, [conversation.id, messages.length]);

  const title = isAi
    ? t('messages:system.ai')
    : isSupport
      ? t('messages:system.support')
      : (conversation.participant?.username ?? '');

  function submit() {
    const text = draft.trim();
    if (!text) return;
    onSend(text);
    setDraft('');
  }

  // Разделители по дням: сравниваем календарную дату соседних сообщений.
  function isNewDay(index: number): boolean {
    if (index === 0) return true;
    const current = new Date(messages[index].sentAt).toDateString();
    const previous = new Date(messages[index - 1].sentAt).toDateString();
    return current !== previous;
  }

  return (
    <div className={styles.thread}>
      <header className={styles.threadHead}>
        {isAi ? (
          <span
            style={{
              width: 32,
              height: 32,
              borderRadius: 'var(--radius-full)',
              background: 'var(--viz-6)',
              color: '#fff',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <SparkleIcon width={16} height={16} />
          </span>
        ) : isSupport ? (
          <span
            style={{
              width: 32,
              height: 32,
              borderRadius: 'var(--radius-full)',
              background: 'var(--info)',
              color: '#fff',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <ShieldIcon width={16} height={16} />
          </span>
        ) : (
          <Avatar
            username={conversation.participant?.username ?? '?'}
            color={conversation.participant?.avatarColor}
            size="sm"
          />
        )}

        <div className={styles.threadText}>
          <span className={styles.threadName}>
            {conversation.participant ? (
              <Link
                to={`/u/${conversation.participant.username}`}
                className={styles.threadNameLink}
                title={t('messages:thread.openProfile')}
              >
                {title}
              </Link>
            ) : (
              title
            )}
            {isAi && <Badge tone="accent">{t('common:plan.proBadge')}</Badge>}
            {isSupport && <Badge tone="info">{t('messages:system.supportBadge')}</Badge>}
            {muted && <BellOffIcon width={13} height={13} style={{ color: 'var(--text-muted)' }} />}
          </span>

          <span className={styles.threadStatus}>
            {isSupport
              ? t('messages:system.supportSla')
              : conversation.participant?.lastSeenAt
                ? t('messages:thread.lastSeen', {
                    time: formatters.relative(conversation.participant.lastSeenAt),
                  })
                : t('messages:ai.greeting')}
          </span>
        </div>

        <div className={styles.threadActions}>
          <IconButton
            label={muted ? t('messages:menu.muteOff') : t('messages:menu.muteOn')}
            active={muted}
            onClick={() => {
              toggleConversationMute(conversation.id);
              toast(muted ? t('messages:menu.muteOff') : t('messages:menu.muteOn'), {
                tone: 'info',
                description: muted ? undefined : t('messages:menu.muteHint'),
              });
            }}
          >
            {muted ? <BellOffIcon width={15} height={15} /> : <BellIcon width={15} height={15} />}
          </IconButton>

          <Menu
            trigger={({ toggle }) => (
              <IconButton label={t('common:actions.openMenu')} onClick={toggle}>
                <MoreIcon width={15} height={15} />
              </IconButton>
            )}
          >
            {({ close }) => (
              <>
                <MenuItem
                  icon={<TrashIcon width={14} height={14} />}
                  onClick={() => {
                    toast(t('messages:menu.cleared'), { tone: 'info' });
                    close();
                  }}
                >
                  {t('messages:menu.clear')}
                </MenuItem>

                {conversation.kind === 'user' && (
                  <>
                    <MenuItem
                      onClick={() => {
                        toast(t('messages:menu.reported'), { tone: 'info' });
                        close();
                      }}
                    >
                      {t('messages:menu.report')}
                    </MenuItem>
                    <MenuSeparator />
                    <MenuItem
                      danger={!blocked}
                      onClick={() => {
                        if (blocked && conversation.participant) {
                          unblockUser(conversation.participant.id);
                        } else {
                          onBlockRequest();
                        }
                        close();
                      }}
                    >
                      {blocked ? t('messages:menu.unblock') : t('messages:menu.block')}
                    </MenuItem>
                  </>
                )}
              </>
            )}
          </Menu>
        </div>
      </header>

      <div className={styles.feed} ref={feedRef}>
        {messages.map((message, index) => {
          const own = message.authorId === ME;

          return (
            <Fragment key={message.id}>
              {isNewDay(index) && (
                <div className={styles.dayDivider}>{formatters.dayLabel(message.sentAt)}</div>
              )}

              {message.report ? (
                <AiReportCard report={message.report} />
              ) : (
                <div className={cn(styles.bubbleRow, own && styles.bubbleRowOwn)}>
                  <span className={cn(styles.bubble, own && styles.bubbleOwn)}>{message.text}</span>
                  <span className={styles.bubbleTime}>{formatters.time(message.sentAt)}</span>
                </div>
              )}
            </Fragment>
          );
        })}
      </div>

      {inputLocked ? (
        <div className={styles.composerLocked}>
          <LockIcon width={15} height={15} />
          {blocked ? t('messages:blocked.notice') : t('messages:ai.inputLocked')}
          <span className={styles.composerLockedAction}>
            {blocked && conversation.participant ? (
              <Button size="sm" onClick={() => unblockUser(conversation.participant!.id)}>
                {t('messages:blocked.unblock')}
              </Button>
            ) : (
              <Button
                variant="primary"
                size="sm"
                onClick={() => navigate('/settings/subscription')}
              >
                {t('messages:ai.lockedCta')}
              </Button>
            )}
          </span>
        </div>
      ) : (
        <>
          <div className={styles.composer}>
            <Textarea
              className={styles.composerInput}
              value={draft}
              rows={1}
              placeholder={t('messages:thread.placeholder')}
              aria-label={t('messages:thread.placeholder')}
              onChange={(event) => setDraft(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter' && !event.shiftKey) {
                  event.preventDefault();
                  submit();
                }
              }}
            />
            <Button
              variant="primary"
              disabled={!draft.trim()}
              iconLeft={<SendIcon width={14} height={14} />}
              onClick={submit}
            >
              {t('messages:thread.send')}
            </Button>
          </div>
          <span className={styles.composerHint}>{t('messages:thread.sendHint')}</span>
        </>
      )}
    </div>
  );
}
