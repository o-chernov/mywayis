/**
 * Сверяет наборы ключей во всех словарях с эталонным языком (ru).
 *
 * Суффиксы множественного числа отбрасываются: в русском это _one/_few/_many,
 * в английском _one/_other, и сравнивать их напрямую нельзя — расхождение
 * здесь нормально, а вот пропущенный ключ нет.
 */
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const LOCALES_DIR = join(import.meta.dirname, '..', 'src', 'i18n', 'locales');
const BASE_LANGUAGE = 'ru';
const PLURAL_SUFFIX = /_(zero|one|two|few|many|other)$/;

function flatten(object, prefix = '') {
  return Object.entries(object).flatMap(([key, value]) => {
    const path = prefix ? `${prefix}.${key}` : key;
    if (value && typeof value === 'object' && !Array.isArray(value)) return flatten(value, path);
    return [path.replace(PLURAL_SUFFIX, '')];
  });
}

function readNamespace(language, file) {
  return JSON.parse(readFileSync(join(LOCALES_DIR, language, file), 'utf8'));
}

const languages = readdirSync(LOCALES_DIR);
const namespaces = readdirSync(join(LOCALES_DIR, BASE_LANGUAGE));
const problems = [];

for (const file of namespaces) {
  const baseKeys = new Set(flatten(readNamespace(BASE_LANGUAGE, file)));

  for (const language of languages) {
    if (language === BASE_LANGUAGE) continue;

    let keys;
    try {
      keys = new Set(flatten(readNamespace(language, file)));
    } catch {
      problems.push(`${language}/${file}: файл отсутствует или содержит невалидный JSON`);
      continue;
    }

    for (const key of baseKeys) {
      if (!keys.has(key)) problems.push(`${language}/${file}: нет ключа "${key}"`);
    }
    for (const key of keys) {
      if (!baseKeys.has(key)) problems.push(`${language}/${file}: лишний ключ "${key}"`);
    }
  }
}

if (problems.length > 0) {
  console.error(`Расхождения в словарях (${problems.length}):`);
  problems.forEach((problem) => console.error(`  ${problem}`));
  process.exit(1);
}

console.log(`Словари синхронны: ${namespaces.length} неймспейсов × ${languages.length} языка.`);
