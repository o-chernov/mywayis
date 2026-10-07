import { useTranslation } from 'react-i18next';

import { cn } from '@/shared/lib/cn';
import { useFormatters } from '@/shared/lib/useFormatters';
import { BellOffIcon, ShieldIcon, SparkleIcon } from '@/shared/icons';
import { Avatar, Badge } from '@/shared/ui';
import type { Conversation } from '@/types';

import styles from './Messages.module.css';

interface ConversationListProps {
  conversations: Conversation[];
  activeId: string | null;
  mutedIds: string[];
  blockedUserIds: string[];
  onSelect: (id: string) => void;
}

/** Аватар зависит от типа диалога: у системных вместо инициалов иконка. */
function ConversationAvatar({ conversation }: { conversation: Conversation }) {
  if (conversation.kind === 'ai') {
    return (
      <span
        style={{
          width: 36,
          height: 36,
          borderRadius: 'var(--radius-full)',
          background: 'var(--viz-6)',
          color: '#fff',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        <SparkleIcon width={17} height={17} />
      </span>
    );
  }

  if (conversation.kind === 'support') {
    return (
      <span
        style={{
          width: 36,
          height: 36,
          borderRadius: 'var(--radius-full)',
          background: 'var(--info)',
          color: '#fff',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        <ShieldIcon width={17} height={17} />
      </span>
    );
  }

  return (
    <Avatar
      username={conversation.participant?.username ?? '?'}
      color={conversation.participant?.avatarColor}
      size="md"
    />
  );
}

export function ConversationList({
  conversations,
  activeId,
  mutedIds,
  blockedUserIds,
  onSelect,
}: ConversationListProps) {
  const { t } = useTranslation(['messages', 'common']);
  const formatters = useFormatters();

  const pinned = conversations.filter((item) => item.pinned);
  const regular = conversations.filter((item) => !item.pinned);

  function renderItem(conversation: Conversation) {
    const muted = mutedIds.includes(conversation.id);
    const blocked =
      conversation.blocked ||
      (conversation.participant
        ? blockedUserIds.includes(conversation.participant.id)
        : false);

    const title =
      conversation.kind === 'ai'
        ? t('messages:system.ai')
        : conversation.kind === 'support'
          ? t('messages:system.support')
          : (conversation.participant?.username ?? '');

    return (
      <button
        key={conversation.id}
        type="button"
        className={cn(styles.item, conversation.id === activeId && styles.itemActive)}
        onClick={() => onSelect(conversation.id)}
      >
        <ConversationAvatar conversation={conversation} />

        <span className={styles.itemBody}>
          <span className={styles.itemTop}>
            <span className={styles.itemName}>{title}</span>
            <span className={styles.itemTime}>{formatters.relative(conversation.lastMessageAt)}</span>
          </span>

          <span className={styles.itemPreview}>
            {blocked ? t('messages:blocked.notice') : conversation.lastMessagePreview}
          </span>

          {(conversation.kind !== 'user' || muted || blocked || conversation.unreadCount > 0) && (
            <span className={styles.itemMeta}>
              {conversation.kind === 'ai' && <Badge tone="accent">{t('common:plan.proBadge')}</Badge>}
              {conversation.kind === 'support' && (
                <Badge tone="info">{t('messages:system.supportBadge')}</Badge>
              )}
              {blocked && <Badge tone="danger">{t('messages:blocked.badge')}</Badge>}
              {muted && <BellOffIcon className={styles.mutedIcon} width={13} height={13} />}
              {/* В тихом режиме счётчик не показываем — в этом и смысл. */}
              {conversation.unreadCount > 0 && !muted && (
                <span className={styles.unread} style={{ marginLeft: 'auto' }}>
                  {conversation.unreadCount}
                </span>
              )}
            </span>
          )}
        </span>
      </button>
    );
  }

  return (
    <div className={styles.list}>
      {pinned.length > 0 && <div className={styles.pinnedGroup}>{pinned.map(renderItem)}</div>}
      {regular.map(renderItem)}
    </div>
  );
}
