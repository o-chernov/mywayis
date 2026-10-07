import { useTranslation } from 'react-i18next';

import { useTheme } from '@/app/providers/ThemeProvider';
import { GlobeIcon, MoonIcon, SunIcon } from '@/shared/icons';
import { IconButton, Menu, MenuItem, MenuLabel } from '@/shared/ui';
import { SUPPORTED_LANGUAGES, type SupportedLanguage } from '@/i18n';

/** Переключатели темы и языка. Доступны и до входа — стоят на странице входа. */
export function ThemeLanguageControls() {
  const { t, i18n } = useTranslation('common');
  const { resolved, toggle } = useTheme();

  return (
    <>
      <IconButton label={t('theme.toggle')} onClick={toggle}>
        {resolved === 'dark' ? <SunIcon /> : <MoonIcon />}
      </IconButton>

      <Menu
        trigger={({ toggle: toggleMenu }) => (
          <IconButton label={t('language.switch')} onClick={toggleMenu}>
            <GlobeIcon />
          </IconButton>
        )}
      >
        {({ close }) => (
          <>
            <MenuLabel>{t('language.label')}</MenuLabel>
            {SUPPORTED_LANGUAGES.map((language: SupportedLanguage) => (
              <MenuItem
                key={language}
                trailing={i18n.language.startsWith(language) ? '✓' : undefined}
                onClick={() => {
                  void i18n.changeLanguage(language);
                  close();
                }}
              >
                {t(`language.${language}`)}
              </MenuItem>
            ))}
          </>
        )}
      </Menu>
    </>
  );
}
