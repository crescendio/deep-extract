// libarchive.js가 extractFiles()로 반환하는 중첩 디렉터리 구조
export type NestedArchiveEntries = {
  [key: string]: File | NestedArchiveEntries;
};

// flattenEntries가 반환하는 평탄화된 파일 항목
export type FlatEntry = {
  name: string;
  file: File;
};

export type LogType = 'default' | 'success' | 'warning' | 'error' | 'inner';
export type LogFn = (msg: string, type?: LogType) => void;
