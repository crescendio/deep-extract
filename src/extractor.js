import { Archive } from 'libarchive.js';
import { isArchive, fmtSize } from './utils.js';

export const collectedFiles = new Map(); // 최종적으로 File 객체들만 모아놓을 Map

/**
 * 압축 해제 결과를 평탄화하는 함수
 * @param {*} obj
 * @returns {{ name: string, file: File }[]}
 * @description
 * - libarchive.js는 압축 해제 결과를 디렉터리 구조 그대로 중첩 객체로 반환한다. ex) { "폴더A": { "폴더B": { "파일.txt": File } } }
 * - 반환된 중첩 객체를 재귀적으로 탐색해서, File 인스턴스만 골라 [{ name, file }, ...] 형태의 배열로 평탄화한다.
 */
export function flattenEntries(obj) {
  const output = [];
  if (!obj || typeof obj !== 'object') return output;

  for (const [key, value] of Object.entries(obj)) {
    if (value instanceof File) {
      // File 인스턴스인 경우 결과 배열에 추가
      output.push({ name: value.name || key, file: value });
    } else if (value && typeof value === 'object') {
      // 디렉터리인 경우 재귀 탐색
      output.push(...flattenEntries(value));
    }
  }

  return output;
}

/**
 * collectedFiles에 파일을 등록하는 함수
 * @param {*} rawName 압축 해제된 파일의 원래 경로를 포함한 이름 (예: "폴더A/폴더B/파일.txt")
 * @param {*} file File 객체
 * @returns 최종적으로 저장된 고유한 파일명
 * @description
 * - 파일명 앞의 경로 접두사를 제거하고, 순수 파일명만 추출해서 collectedFiles에 저장한다.
 * - 만약 동일한 파일명이 이미 collectedFiles에 존재할 경우, "파일 (1).txt" 식으로 자동 넘버링한다.
 */
export function addCollected(rawName, file) {
  const name = rawName.split('/').filter(Boolean).pop() || rawName;

  if (!collectedFiles.has(name)) {
    collectedFiles.set(name, file);
    return name;
  }

  const dot = name.lastIndexOf('.');
  const base = dot > 0 ? name.slice(0, dot) : name;
  const ext = dot > 0 ? name.slice(dot) : '';

  let n = 1;
  let candidate;
  do {
    candidate = `${base} (${n++})${ext}`;
  } while (collectedFiles.has(candidate));
  collectedFiles.set(candidate, file);

  return candidate;
}

export async function extractRecursive(file, depth, log) {
  if (depth > 12) {
    log(`  [건너뜀] 최대 재귀 깊이 초과: ${file.name}`, 'warn');
    return;
  }

  let archive;
  try {
    archive = await Archive.open(file);
  } catch (error) {
    log(`  [열기 실패] ${file.name}: ${error.message}`, 'error');
    return;
  }

  let extracted;
  try {
    extracted = await archive.extractFiles();
  } catch (error) {
    log(`  [추출 실패] ${file.name}: ${error.message}`, 'error');
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
      log(`  + ${saved} (${fmtSize(inner.size)})`, 'ok');
    }
  }
}
