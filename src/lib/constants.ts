/** 지원하는 압축 파일 확장자 목록 (점 없이, 단일/이중 확장자 모두 포함) */
export const ARCHIVE_EXTENSIONS = new Set([
  'zip', '7z', 'rar', 'tar', 'gz', 'tgz', 'bz2', 'tbz', 'tbz2', 'xz', 'cab', 'iso', 'cbr', 'cbz',
  'tar.gz', 'tar.bz2', 'tar.xz',
]);

export const MAX_EXTRACTION_DEPTH = 12;

export const FILE_ICON_DEFAULT = '📄';

export const FILE_ICONS: Readonly<Record<string, string>> = {
  // 텍스트 / 문서
  txt: '📄', md: '📄', pdf: '📄', doc: '📄', docx: '📄',
  csv: '📄', ppt: '📄', pptx: '📄', xls: '📄', xlsx: '📄',
  // 이미지
  jpg: '🖼️', jpeg: '🖼️', png: '🖼️', gif: '🖼️', svg: '🖼️', webp: '🖼️', bmp: '🖼️',
  // 비디오
  mp4: '🎬', avi: '🎬', mov: '🎬', mkv: '🎬', webm: '🎬',
  // 오디오
  mp3: '🎵', wav: '🎵', flac: '🎵', ogg: '🎵', aac: '🎵',
  // 코드
  js: '💻', ts: '💻', jsx: '💻', tsx: '💻', py: '💻',
  java: '💻', cpp: '💻', c: '💻', go: '💻', rs: '💻',
  // 웹 / 스타일
  html: '🌐', css: '🎨',
  // 데이터
  json: '📋', xml: '📋', yaml: '📋', yml: '📋',
  // 실행 / 스크립트
  exe: '⚙️', sh: '⚙️', bat: '⚙️',
};
