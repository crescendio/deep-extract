export const ARCHIVE_EXTS = new Set(['.zip', '.7z', '.rar', '.tar', '.gz', '.tgz', '.bz2', '.tbz', '.tbz2', '.xz', '.cab', '.iso', '.cbr', '.cbz']);

export function isArchive(name) {
  const lower = name.toLowerCase();
  if (lower.endsWith('.tar.gz') || lower.endsWith('.tar.bz2') || lower.endsWith('.tar.xz')) return true;

  const dot = lower.lastIndexOf('.');
  return dot !== -1 && ARCHIVE_EXTS.has(lower.slice(dot));
}

export function fmtSize(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 ** 2) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 ** 3) return `${(bytes / 1024 ** 2).toFixed(1)} MB`;
  return `${(bytes / 1024 ** 3).toFixed(2)} GB`;
}

export function archiveIcon(name) {
  const ext = name.toLowerCase().split('.').pop();
  const map = { zip: '📦', '7z': '📦', rar: '📦', tar: '📦', gz: '📦', bz2: '📦', xz: '📦', tgz: '📦' };
  return map[ext] || '📦';
}

export function fileIcon(name) {
  const ext = name.toLowerCase().split('.').pop();
  const map = {
    pdf: '📄',
    txt: '📝',
    md: '📝',
    doc: '📝',
    docx: '📝',
    ppt: '📊',
    pptx: '📊',
    xls: '📊',
    xlsx: '📊',
    csv: '📊',
    jpg: '🖼️',
    jpeg: '🖼️',
    png: '🖼️',
    gif: '🖼️',
    svg: '🖼️',
    webp: '🖼️',
    bmp: '🖼️',
    mp4: '🎬',
    avi: '🎬',
    mov: '🎬',
    mkv: '🎬',
    webm: '🎬',
    mp3: '🎵',
    wav: '🎵',
    flac: '🎵',
    ogg: '🎵',
    aac: '🎵',
    js: '💻',
    ts: '💻',
    py: '💻',
    java: '💻',
    cpp: '💻',
    c: '💻',
    go: '💻',
    rs: '💻',
    html: '🌐',
    css: '🎨',
    json: '📋',
    xml: '📋',
    yaml: '📋',
    yml: '📋',
    exe: '⚙️',
    sh: '⚙️',
    bat: '⚙️',
  };
  return map[ext] || '📄';
}
