import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useSearchParams } from 'react-router';

import { useSession } from '@/app/providers/SessionProvider';
import { useToast } from '@/app/providers/ToastProvider';
import { ConversationList } from '@/features/messages/ConversationList';
import { MessageThread } from '@/features/messages/MessageThread';
import { buildConversations, buildMessages } from '@/mocks/conversations';
import { findUserByUsername } from '@/mocks/users';
import { MessageIcon, SearchIcon } from '@/shared/icons';
import { Button, EmptyState, Input, Modal, Tabs } from '@/shared/ui';
import type { Conversation, Message } from '@/types';

import styles from '@/features/messages/Messages.module.css';

type TabId = 'all' | 'unread' | 'support';

export function MessagesPage() {
  const { t } = useTranslation(['messages', 'common']);
  const { isPro, mutedConversationIds, privacy, blockUser } = useSession();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [tab, setTab] = useState<TabId>('all');
  const [query, setQuery] = useState('');
  /** Явный выбор пользователя. Пока его нет, диалог берём из query-параметров. */
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [blockTarget, setBlockTarget] = useState<Conversation | null>(null);
  // Отправленные в прототипе сообщения живут только в памяти страницы.
  const [sent, setSent] = useState<Record<string, Message[]>>({});

  const baseConversations = useMemo(() => buildConversations(isPro), [isPro]);

  // Переход «Написать» с профиля: ?to=username открывает или заводит диалог.
  const draftUsername = searchParams.get('to');
  const draftUser = draftUsername ? findUserByUsername(draftUsername) : undefined;

  const conversations = useMemo(() => {
    if (!draftUser) return baseConversations;
    const existing = baseConversations.find((item) => item.participant?.id === draftUser.id);
    if (existing) return baseConversations;

    const draft: Conversation = {
      id: `draft-${draftUser.id}`,
      kind: 'user',
      participant: {
        id: draftUser.id,
        username: draftUser.username,
        avatarColor: draftUser.avatarColor,
        lastSeenAt: draftUser.lastSeenAt,
      },
      lastMessagePreview: t('messages:draft.hint'),
      lastMessageAt: new Date().toISOString(),
      unreadCount: 0,
      muted: false,
      blocked: false,
      pinned: false,
    };
    return [draft, ...baseConversations];
  }, [baseConversations, draftUser, t]);

  // Какой диалог открыт: явный выбор → ?conversation → ?to → ничего.
  const requestedId = searchParams.get('conversation');
  const activeId =
    selectedId ??
    (requestedId && conversations.some((item) => item.id === requestedId)
      ? requestedId
      : draftUser
        ? (conversations.find((item) => item.participant?.id === draftUser.id)?.id ?? null)
        : null);

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return conversations.filter((conversation) => {
      if (tab === 'support' && conversation.kind !== 'support') return false;
      if (
        tab === 'unread' &&
        (conversation.unreadCount === 0 || mutedConversationIds.includes(conversation.id))
      ) {
        return false;
      }
      if (!normalized) return true;

      const title =
        conversation.participant?.username ??
        (conversation.kind === 'ai' ? t('messages:system.ai') : t('messages:system.support'));
      return (
        title.toLowerCase().includes(normalized) ||
        conversation.lastMessagePreview.toLowerCase().includes(normalized)
      );
    });
  }, [conversations, tab, query, mutedConversationIds, t]);

  const active = conversations.find((item) => item.id === activeId) ?? null;

  const messages = useMemo(() => {
    if (!active) return [];
    const base = active.id.startsWith('draft-') ? [] : buildMessages(active.id, isPro);
    return [...base, ...(sent[active.id] ?? [])];
  }, [active, isPro, sent]);

  const unreadCount = conversations
    .filter((item) => !mutedConversationIds.includes(item.id))
    .reduce((sum, item) => sum + item.unreadCount, 0);

  function handleSend(text: string) {
    if (!active) return;
    setSent((current) => ({
      ...current,
      [active.id]: [
        ...(current[active.id] ?? []),
        {
          id: `local-${Date.now()}`,
          conversationId: active.id,
          authorId: 'u1',
          text,
          sentAt: new Date().toISOString(),
          read: true,
        },
      ],
    }));
    toast(t('messages:thread.sent'));
  }

  return (
    <div className={styles.layout}>
      <aside className={styles.sidebar}>
        <div className={styles.sidebarHead}>
          <Input
            value={query}
            placeholder={t('messages:search')}
            aria-label={t('messages:search')}
            leadingIcon={<SearchIcon width={15} height={15} />}
            onChange={(event) => setQuery(event.target.value)}
          />
          <Tabs<TabId>
            ariaLabel={t('messages:title')}
            value={tab}
            onChange={setTab}
            items={[
              { value: 'all', label: t('messages:tabs.all') },
              { value: 'unread', label: t('messages:tabs.unread'), badge: unreadCount },
              { value: 'support', label: t('messages:tabs.support') },
            ]}
          />
        </div>

        {filtered.length === 0 ? (
          <EmptyState
            compact
            title={query ? t('messages:empty.noResults') : t('messages:empty.noConversations')}
            description={query ? undefined : t('messages:empty.noConversationsHint')}
            actions={
              !query && (
                <Button size="sm" onClick={() => navigate('/leaderboard')}>
                  {t('messages:empty.openLeaderboard')}
                </Button>
              )
            }
          />
        ) : (
          <ConversationList
            conversations={filtered}
            activeId={activeId}
            mutedIds={mutedConversationIds}
            blockedUserIds={privacy.blockedUserIds}
            onSelect={(id) => {
              setSelectedId(id);
              // Убираем ?to/?conversation, чтобы выбор не «отскакивал» назад.
              if (searchParams.size > 0) setSearchParams({}, { replace: true });
            }}
          />
        )}
      </aside>

      {active ? (
        <MessageThread
          conversation={active}
          messages={messages}
          onSend={handleSend}
          onBlockRequest={() => setBlockTarget(active)}
        />
      ) : (
        <div className={styles.thread}>
          <EmptyState
            icon={<MessageIcon width={22} height={22} />}
            title={t('messages:empty.title')}
            description={t('messages:empty.description')}
          />
        </div>
      )}

      <Modal
        open={Boolean(blockTarget)}
        onClose={() => setBlockTarget(null)}
        size="sm"
        iconTone="danger"
        title={t('messages:blocked.modalTitle', {
          username: blockTarget?.participant?.username ?? '',
        })}
        subtitle={t('messages:blocked.modalText')}
        footer={
          <>
            <Button variant="ghost" onClick={() => setBlockTarget(null)}>
              {t('common:actions.cancel')}
            </Button>
            <Button
              variant="danger"
              onClick={() => {
                if (blockTarget?.participant) blockUser(blockTarget.participant.id);
                setBlockTarget(null);
              }}
            >
              {t('common:actions.block')}
            </Button>
          </>
        }
      />
    </div>
  );
}
