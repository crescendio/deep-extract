import { ARCHIVE_EXTENSIONS } from './constants';

export function isArchive(fileName: string): boolean {
  const lower = fileName.trim().toLowerCase();
  const parts = lower.split('.').filter(Boolean);

  // 이중 확장자 검사
  const doubleExtension = parts.slice(-2).join('.');
  if (ARCHIVE_EXTENSIONS.has(doubleExtension)) return true;

  // 이중 확장자가 아닌 경우
  const singleExtension = parts[parts.length - 1];
  return ARCHIVE_EXTENSIONS.has(singleExtension);
}

export function formatSize(bytes: number): string {
  const KB = 1024;
  const MB = KB ** 2;
  const GB = KB ** 3;

  if (bytes < KB) return `${bytes} B`;
  if (bytes < MB) return `${(bytes / KB).toFixed(1)} KB`;
  if (bytes < GB) return `${(bytes / MB).toFixed(1)} MB`;

  return `${(bytes / GB).toFixed(2)} GB`;
}
