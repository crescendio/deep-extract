/** libarchive.js extractFiles()가 반환하는 중첩 디렉터리 구조 */
export interface NestedArchiveEntries {
  [key: string]: File | NestedArchiveEntries;
}

/** 중첩 구조를 평탄화한 단일 파일 항목 */
export interface FlatEntry {
  name: string;
  file: File;
}

/** 추출 완료 후 결과 목록에 표시되는 파일 항목 */
export interface ExtractedFile {
  name: string;
  size: number;
  file: File;
}
