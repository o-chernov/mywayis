import type { SpecialtyId, TagOption } from '@/types';

/**
 * Словарь тегов для отслеживания. Метки намеренно не переводятся: названия
 * языков и инструментов интернациональны. Переводятся только категории.
 */
export const TAG_CATALOG: TagOption[] = [
  // Языки
  { id: 'python', label: 'Python', category: 'language' },
  { id: 'javascript', label: 'JavaScript', category: 'language' },
  { id: 'typescript', label: 'TypeScript', category: 'language' },
  { id: 'go', label: 'Go', category: 'language' },
  { id: 'rust', label: 'Rust', category: 'language' },
  { id: 'java', label: 'Java', category: 'language' },
  { id: 'kotlin', label: 'Kotlin', category: 'language' },
  { id: 'swift', label: 'Swift', category: 'language' },
  { id: 'csharp', label: 'C#', category: 'language' },
  { id: 'cpp', label: 'C++', category: 'language' },
  { id: 'php', label: 'PHP', category: 'language' },
  { id: 'ruby', label: 'Ruby', category: 'language' },
  { id: 'sql', label: 'SQL', category: 'language' },
  { id: 'html', label: 'HTML', category: 'language' },
  { id: 'css', label: 'CSS', category: 'language' },
  { id: 'bash', label: 'Bash', category: 'language' },
  { id: 'yaml', label: 'YAML', category: 'language' },
  { id: 'dart', label: 'Dart', category: 'language' },
  { id: 'scala', label: 'Scala', category: 'language' },
  { id: 'r', label: 'R', category: 'language' },

  // Инструменты и фреймворки
  { id: 'docker', label: 'Docker', category: 'tool' },
  { id: 'kubernetes', label: 'Kubernetes', category: 'tool' },
  { id: 'postgresql', label: 'PostgreSQL', category: 'tool' },
  { id: 'redis', label: 'Redis', category: 'tool' },
  { id: 'git', label: 'Git', category: 'tool' },
  { id: 'react', label: 'React', category: 'tool' },
  { id: 'vue', label: 'Vue', category: 'tool' },
  { id: 'django', label: 'Django', category: 'tool' },
  { id: 'fastapi', label: 'FastAPI', category: 'tool' },
  { id: 'terraform', label: 'Terraform', category: 'tool' },
  { id: 'ansible', label: 'Ansible', category: 'tool' },
  { id: 'figma', label: 'Figma', category: 'tool' },
  { id: 'jupyter', label: 'Jupyter', category: 'tool' },
  { id: 'pytorch', label: 'PyTorch', category: 'tool' },
  { id: 'nginx', label: 'Nginx', category: 'tool' },
  { id: 'playwright', label: 'Playwright', category: 'tool' },
  { id: 'pytest', label: 'Pytest', category: 'tool' },
  { id: 'xcode', label: 'Xcode', category: 'tool' },
  { id: 'android-studio', label: 'Android Studio', category: 'tool' },
  { id: 'flutter', label: 'Flutter', category: 'tool' },

  // Вне специальности — то, что человек может отслеживать «для себя»
  { id: 'gaming', label: 'gaming', category: 'offtopic' },
  { id: 'learning', label: 'learning', category: 'offtopic' },
  { id: 'pet-projects', label: 'pet-projects', category: 'offtopic' },
  { id: 'writing', label: 'writing', category: 'offtopic' },
  { id: 'courses', label: 'courses', category: 'offtopic' },
  { id: 'open-source', label: 'open-source', category: 'offtopic' },
];

/**
 * Что предвыбирать после подключения WakaTime. Пользователь может снять
 * лишнее и добавить что угодно своё, в том числе не по специальности.
 */
export const SPECIALTY_PRESETS: Record<SpecialtyId, string[]> = {
  backend: ['python', 'sql', 'docker', 'postgresql', 'git', 'fastapi'],
  frontend: ['typescript', 'javascript', 'css', 'html', 'react', 'git'],
  fullstack: ['typescript', 'python', 'sql', 'react', 'docker', 'git'],
  mobile: ['kotlin', 'swift', 'dart', 'flutter', 'xcode', 'git'],
  devops: ['bash', 'yaml', 'docker', 'kubernetes', 'terraform', 'ansible'],
  data: ['python', 'sql', 'jupyter', 'pytorch', 'r', 'git'],
  qa: ['python', 'typescript', 'playwright', 'pytest', 'docker', 'git'],
  design: ['figma', 'css', 'html', 'writing'],
  other: ['git', 'learning'],
};

export function findTag(id: string): TagOption | undefined {
  return TAG_CATALOG.find((tag) => tag.id === id);
}

/** Метка тега: из каталога, иначе — сам идентификатор (пользовательский тег). */
export function tagLabel(id: string): string {
  return findTag(id)?.label ?? id;
}
