import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router';

import { useSession } from '@/app/providers/SessionProvider';
import { buildConversations } from '@/mocks/conversations';
import { cn } from '@/shared/lib/cn';
import {
  DashboardIcon,
  LogoutIcon,
  MessageIcon,
  PlugIcon,
  SettingsIcon,
  SparkleIcon,
  TrophyIcon,
  UserIcon,
} from '@/shared/icons';
import { Avatar, Badge, Button, Menu, MenuItem, MenuSeparator } from '@/shared/ui';

import styles from './AppShell.module.css';
import { DemoBar } from './DemoBar';
import { ThemeLanguageControls } from './ThemeLanguageControls';

/** Разделы, где содержимое занимает всю высоту без общих отступов. */
const FLUSH_ROUTES = ['/messages'];

export function AppShell() {
  const { t } = useTranslation('common');
  const { user, isPro, logout, mutedConversationIds } = useSession();
  const location = useLocation();
  const navigate = useNavigate();

  // Непрочитанные считаем без диалогов в тихом режиме — в этом и смысл режима.
  const unreadCount = useMemo(() => {
    return buildConversations(isPro)
      .filter((conversation) => !mutedConversationIds.includes(conversation.id))
      .reduce((sum, conversation) => sum + conversation.unreadCount, 0);
  }, [isPro, mutedConversationIds]);

  const navItems = [
    { to: '/', label: t('nav.dashboard'), icon: <DashboardIcon />, anchor: 'nav-dashboard', end: true },
    { to: '/integrations', label: t('nav.integrations'), icon: <PlugIcon />, anchor: 'nav-integrations' },
    { to: '/leaderboard', label: t('nav.leaderboard'), icon: <TrophyIcon />, anchor: 'nav-leaderboard' },
    {
      to: '/messages',
      label: t('nav.messages'),
      icon: <MessageIcon />,
      anchor: 'nav-messages',
      badge: unreadCount,
    },
    { to: '/settings', label: t('nav.settings'), icon: <SettingsIcon />, anchor: 'nav-settings' },
  ];

  const activeItem = navItems.find((item) =>
    item.end ? location.pathname === item.to : location.pathname.startsWith(item.to),
  );
  const isFlush = FLUSH_ROUTES.some((route) => location.pathname.startsWith(route));

  return (
    <div className={styles.shell}>
      <aside className={styles.sidebar}>
        <div className={styles.brand}>
          <span className={styles.logo}>M</span>
          <span className={styles.brandText}>
            <span className={styles.brandName}>{t('app.name')}</span>
            <span className={styles.brandTagline}>{t('app.tagline')}</span>
          </span>
        </div>

        <nav className={styles.nav} aria-label={t('a11y.mainNavigation')} data-tour="nav">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              data-tour={item.anchor}
              className={({ isActive }) => cn(styles.navLink, isActive && styles.navLinkActive)}
            >
              <span className={styles.navIcon}>{item.icon}</span>
              {item.label}
              {item.badge ? <span className={styles.navBadge}>{item.badge}</span> : null}
            </NavLink>
          ))}
        </nav>

        {!isPro && (
          <div className={styles.planCard}>
            <span className={styles.planTitle}>
              <SparkleIcon width={14} height={14} />
              MyWay Pro
            </span>
            <span className={styles.planText}>{t('plan.proPitch')}</span>
            <Button
              variant="primary"
              size="sm"
              fullWidth
              onClick={() => navigate('/settings/subscription')}
            >
              {t('actions.upgrade')}
            </Button>
          </div>
        )}
      </aside>

      <div className={styles.main}>
        <header className={styles.topbar}>
          <span className={styles.pageTitle}>{activeItem?.label ?? t('app.name')}</span>

          <div className={styles.topbarActions}>
            <ThemeLanguageControls />

            <Menu
              trigger={({ open, toggle }) => (
                <button
                  type="button"
                  className={cn(styles.userButton, open && styles.userButtonOpen)}
                  onClick={toggle}
                  aria-label={t('a11y.userMenu')}
                >
                  <Avatar username={user.username} src={user.avatarUrl} color={user.avatarColor} size="sm" />
                  <span className={styles.userName}>{user.username}</span>
                  {isPro && <Badge tone="accent">{t('plan.proBadge')}</Badge>}
                </button>
              )}
            >
              {({ close }) => (
                <>
                  <MenuItem
                    icon={<UserIcon width={14} height={14} />}
                    onClick={() => {
                      navigate(`/u/${user.username}`);
                      close();
                    }}
                  >
                    {t('nav.profile')}
                  </MenuItem>
                  <MenuItem
                    icon={<SettingsIcon width={14} height={14} />}
                    onClick={() => {
                      navigate('/settings');
                      close();
                    }}
                  >
                    {t('nav.settings')}
                  </MenuItem>
                  <MenuSeparator />
                  <MenuItem
                    icon={<LogoutIcon width={14} height={14} />}
                    danger
                    onClick={() => {
                      logout();
                      navigate('/login');
                    }}
                  >
                    {t('nav.logout')}
                  </MenuItem>
                </>
              )}
            </Menu>
          </div>
        </header>

        <main className={cn(styles.content, isFlush && styles.contentFlush)} data-tour="content">
          <Outlet />
        </main>
      </div>

      <DemoBar />
    </div>
  );
}
