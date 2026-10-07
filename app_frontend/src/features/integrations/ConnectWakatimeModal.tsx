import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { mockSlowRequest } from '@/mocks/mockApi';
import { ExternalIcon, PlugIcon } from '@/shared/icons';
import { Button, Field, Input, Modal, ProgressBar } from '@/shared/ui';

/**
 * Подключение WakaTime в два экрана: ввод ключа → синхронизация.
 * После успеха вызывающая сторона открывает модалку выбора тегов.
 */
export function ConnectWakatimeModal({
  open,
  onClose,
  onConnected,
}: {
  open: boolean;
  onClose: () => void;
  onConnected: (apiKeyMask: string) => void;
}) {
  const { t } = useTranslation(['integrations', 'common']);
  const [apiKey, setApiKey] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [syncing, setSyncing] = useState(false);

  function reset() {
    setApiKey('');
    setError(null);
    setSyncing(false);
  }

  async function submit() {
    const value = apiKey.trim();
    if (!value) {
      setError(t('integrations:wakatime.keyRequired'));
      return;
    }
    if (!value.startsWith('waka_') || value.length < 20) {
      setError(t('integrations:wakatime.keyInvalid'));
      return;
    }

    setError(null);
    setSyncing(true);
    await mockSlowRequest(() => true);

    // Показываем только хвост ключа — так делает и настоящий WakaTime.
    onConnected(`waka_${'•'.repeat(20)}${value.slice(-4)}`);
    reset();
  }

  if (syncing) {
    return (
      <Modal
        open={open}
        onClose={() => undefined}
        mandatory
        size="sm"
        icon={<PlugIcon width={18} height={18} />}
        title={t('integrations:wakatime.syncing')}
        subtitle={t('integrations:wakatime.syncingHint')}
      >
        <ProgressBar value={0.7} ariaLabel={t('integrations:wakatime.syncing')} />
      </Modal>
    );
  }

  return (
    <Modal
      open={open}
      onClose={() => {
        reset();
        onClose();
      }}
      size="md"
      icon={<PlugIcon width={18} height={18} />}
      title={t('integrations:wakatime.connectTitle')}
      subtitle={t('integrations:wakatime.connectSubtitle')}
      footer={
        <>
          <Button
            variant="link"
            size="sm"
            iconRight={<ExternalIcon width={12} height={12} />}
            className="footerStart"
            style={{ marginRight: 'auto' }}
            onClick={() => window.open('https://wakatime.com/settings/api-key', '_blank', 'noopener')}
          >
            {t('integrations:wakatime.whereToGet')}
          </Button>
          <Button
            variant="ghost"
            onClick={() => {
              reset();
              onClose();
            }}
          >
            {t('common:actions.cancel')}
          </Button>
          <Button variant="primary" onClick={submit}>
            {t('common:actions.connect')}
          </Button>
        </>
      }
    >
      <Field
        label={t('integrations:wakatime.keyLabel')}
        hint={t('integrations:wakatime.keyHint')}
        error={error ?? undefined}
      >
        {(props) => (
          <Input
            {...props}
            type="password"
            value={apiKey}
            invalid={Boolean(error)}
            placeholder={t('integrations:wakatime.keyPlaceholder')}
            autoComplete="off"
            onChange={(event) => {
              setApiKey(event.target.value);
              setError(null);
            }}
            onKeyDown={(event) => {
              if (event.key === 'Enter') void submit();
            }}
          />
        )}
      </Field>
    </Modal>
  );
}
