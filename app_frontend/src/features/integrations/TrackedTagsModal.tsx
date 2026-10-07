import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { SPECIALTY_PRESETS, TAG_CATALOG, tagLabel } from '@/mocks/tags';
import { AlertIcon, PlusIcon, SearchIcon, TrophyIcon } from '@/shared/icons';
import { Button, Chip, Input, Modal, RadioCard, RadioCardGroup } from '@/shared/ui';
import type { SpecialtyId, TagCategory } from '@/types';

import styles from './TrackedTagsModal.module.css';

const GROUPS: TagCategory[] = ['language', 'tool', 'offtopic'];

interface TrackedTagsModalProps {
  open: boolean;
  onClose: () => void;
  /** Специальность для предзаполнения и подписи в подзаголовке. */
  specialty: SpecialtyId | null;
  initialTags: string[];
  initialParticipating: boolean;
  /** true — модалка открыта сразу после подключения, а не из настроек. */
  firstRun: boolean;
  onSave: (tags: string[], participating: boolean) => void;
}

export function TrackedTagsModal({
  open,
  onClose,
  specialty,
  initialTags,
  initialParticipating,
  firstRun,
  onSave,
}: TrackedTagsModalProps) {
  const { t } = useTranslation(['integrations', 'common']);

  // Предзаполняем по специальности только в первый заход.
  const [selected, setSelected] = useState<string[]>(() =>
    initialTags.length > 0 ? initialTags : (specialty ? SPECIALTY_PRESETS[specialty] : []),
  );
  const [participating, setParticipating] = useState(initialParticipating);
  const [customTags, setCustomTags] = useState<string[]>(() =>
    initialTags.filter((tag) => !TAG_CATALOG.some((option) => option.id === tag)),
  );
  const [query, setQuery] = useState('');

  const normalizedQuery = query.trim().toLowerCase();

  const suggestions = useMemo(() => {
    if (!normalizedQuery) return [];
    return TAG_CATALOG.filter(
      (tag) =>
        tag.label.toLowerCase().includes(normalizedQuery) && !selected.includes(tag.id),
    ).slice(0, 8);
  }, [normalizedQuery, selected]);

  const exactMatch = TAG_CATALOG.some((tag) => tag.label.toLowerCase() === normalizedQuery);

  function toggle(id: string) {
    setSelected((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id],
    );
  }

  function addCustom(value: string) {
    const id = value.trim().toLowerCase().replace(/\s+/g, '-');
    if (!id) return;
    if (!TAG_CATALOG.some((tag) => tag.id === id) && !customTags.includes(id)) {
      setCustomTags((current) => [...current, id]);
    }
    setSelected((current) => (current.includes(id) ? current : [...current, id]));
    setQuery('');
  }

  /** Каталог плюс то, что пользователь добавил руками. */
  function tagsOfGroup(category: TagCategory) {
    const catalog = TAG_CATALOG.filter((tag) => tag.category === category).map((tag) => tag.id);
    return category === 'offtopic' ? [...catalog, ...customTags] : catalog;
  }

  const specialtyLabel = specialty ? t(`common:specialty.${specialty}`) : '';

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="xl"
      title={t('integrations:tags.title')}
      subtitle={
        firstRun && specialty
          ? t('integrations:tags.subtitlePreset', { specialty: specialtyLabel })
          : t('integrations:tags.subtitleEdit')
      }
      footer={
        <>
          <span className={styles.counter} style={{ marginRight: 'auto' }}>
            {t('integrations:tags.selected', { count: selected.length })}
          </span>
          <Button variant="ghost" onClick={onClose}>
            {t('common:actions.later')}
          </Button>
          <Button
            variant="primary"
            disabled={selected.length === 0}
            onClick={() => onSave(selected, participating)}
          >
            {t('common:actions.save')}
          </Button>
        </>
      }
    >
      <div className={styles.content}>
        <div className={styles.search}>
          <Input
            value={query}
            placeholder={t('integrations:tags.searchPlaceholder')}
            leadingIcon={<SearchIcon width={15} height={15} />}
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                event.preventDefault();
                if (suggestions.length > 0) toggle(suggestions[0].id);
                else addCustom(query);
              }
            }}
          />

          {normalizedQuery && (
            <div className={styles.suggestions}>
              {suggestions.map((tag) => (
                <button
                  key={tag.id}
                  type="button"
                  className={styles.suggestion}
                  onClick={() => {
                    toggle(tag.id);
                    setQuery('');
                  }}
                >
                  <PlusIcon width={13} height={13} />
                  {tag.label}
                  <span className={styles.suggestionCategory}>
                    {t(`integrations:tags.groups.${tag.category}`)}
                  </span>
                </button>
              ))}

              {!exactMatch && (
                <button type="button" className={styles.suggestion} onClick={() => addCustom(query)}>
                  <PlusIcon width={13} height={13} />
                  {t('integrations:tags.addCustom', { value: query.trim() })}
                </button>
              )}

              {suggestions.length === 0 && exactMatch && (
                <p className={styles.emptySuggestion}>{t('integrations:tags.nothingFound')}</p>
              )}
            </div>
          )}
        </div>

        {GROUPS.map((category) => {
          const ids = tagsOfGroup(category);
          const selectedInGroup = ids.filter((id) => selected.includes(id)).length;

          return (
            <div key={category} className={styles.group}>
              <div className={styles.groupHeader}>
                <span className={styles.groupTitle}>
                  {t(`integrations:tags.groups.${category}`)}
                </span>
                <span className={styles.groupCount}>
                  {selectedInGroup} / {ids.length}
                </span>
              </div>

              {category === 'offtopic' && (
                <p className={styles.groupHint}>{t('integrations:tags.offtopicHint')}</p>
              )}

              <div className={styles.chips}>
                {ids.map((id) => (
                  <Chip key={id} selected={selected.includes(id)} onClick={() => toggle(id)}>
                    {tagLabel(id)}
                  </Chip>
                ))}
              </div>
            </div>
          );
        })}

        {selected.length === 0 && (
          <span className={styles.warning}>
            <AlertIcon width={14} height={14} />
            {t('integrations:tags.emptyWarning')}
          </span>
        )}

        <div className={styles.divider} />

        <div className={styles.tournament}>
          <span className={styles.tournamentTitle}>
            <TrophyIcon width={16} height={16} />
            {t('integrations:tags.tournamentQuestion')}
          </span>

          <RadioCardGroup legend={t('integrations:tags.tournamentQuestion')}>
            <RadioCard
              name="tournament"
              value="yes"
              checked={participating}
              onChange={() => setParticipating(true)}
              title={t('integrations:tags.tournamentYes')}
              description={t('integrations:tags.tournamentYesHint')}
            />
            <RadioCard
              name="tournament"
              value="no"
              checked={!participating}
              onChange={() => setParticipating(false)}
              title={t('integrations:tags.tournamentNo')}
              description={t('integrations:tags.tournamentNoHint')}
            />
          </RadioCardGroup>
        </div>
      </div>
    </Modal>
  );
}
