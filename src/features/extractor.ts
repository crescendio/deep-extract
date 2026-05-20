import type { FlatEntry, LogFn, NestedArchiveEntries } from '@/types';
import { Archive } from 'libarchive.js';
import { isArchive, formatSize } from '@/utils';

export const collectedFiles = new Map<string, File>();

// libarchive.js에서 반환된 중첩 객체를 재귀적으로 탐색한다.
export function flattenEntries(obj: NestedArchiveEntries): FlatEntry[] {
  const output: FlatEntry[] = [];
  if (!obj || typeof obj !== 'object') return output;

  for (const [key, value] of Object.entries(obj)) {
    if (value instanceof File) {
      output.push({ name: value.name || key, file: value });
    } else if (value && typeof value === 'object') {
      output.push(...flattenEntries(value as NestedArchiveEntries));
    }
  }

  return output;
}

// 출력이 단순하도록 디렉터리 접두사를 제거합니다. 중복 처리도 수행
export function addCollected(rawName: string, file: File): string {
  const name = rawName.split('/').filter(Boolean).pop() || rawName;

  if (!collectedFiles.has(name)) {
    collectedFiles.set(name, file);
    return name;
  }

  const dot = name.lastIndexOf('.');
  const base = dot > 0 ? name.slice(0, dot) : name;
  const ext = dot > 0 ? name.slice(dot) : '';

  let n = 1;
  let candidate: string;
  do {
    candidate = `${base} (${n++})${ext}`;
  } while (collectedFiles.has(candidate));
  collectedFiles.set(candidate, file);

  return candidate;
}

export async function extractRecursive(file: File, depth: number, log: LogFn): Promise<void> {
  if (depth > 12) {
    log(`  [건너뜀] 최대 재귀 깊이 초과: ${file.name}`, 'warning');
    return;
  }

  let archive: Archive;
  try {
    archive = await Archive.open(file);
  } catch (error) {
    log(`  [열기 실패] ${file.name}: ${(error as Error).message}`, 'error');
    return;
  }

  let extracted: NestedArchiveEntries;
  try {
    extracted = (await archive.extractFiles()) as NestedArchiveEntries;
  } catch (error) {
    log(`  [추출 실패] ${file.name}: ${(error as Error).message}`, 'error');
    return;
  }

  const entries = flattenEntries(extracted);
  log(`  ${entries.length}개 항목 발견`);

  for (const { name, file: inner } of entries) {
    if (!inner || inner.size === 0) continue;

    if (isArchive(name)) {
      log(`  → 내부 압축 파일: ${name}`, 'inner');
      await extractRecursive(inner, depth + 1, log);
    } else {
      const saved = addCollected(name, inner);
      log(`  + ${saved} (${formatSize(inner.size)})`, 'success');
    }
  }
}
