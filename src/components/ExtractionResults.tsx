import { Download, RotateCcw } from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { getFileIcon, formatSize } from '@/lib/file-utils';
import type { ExtractedFile } from '@/types';

interface ExtractionResultsProps {
  files: ExtractedFile[];
  downloadUrl: string | null;
  onReset: () => void;
}

export function ExtractionResults({ files, downloadUrl, onReset }: ExtractionResultsProps) {
  const totalSize = files.reduce((sum, f) => sum + f.size, 0);

  const handleDownload = () => {
    if (!downloadUrl) return;
    const a = document.createElement('a');
    a.href = downloadUrl;
    a.download = 'extracted_files.zip';
    a.click();
  };

  return (
    <div className="space-y-4 rounded-xl border border-border bg-card p-4">
      {/* 헤더: 결과 요약 + 액션 버튼 */}
      <div className="flex flex-wrap items-center gap-3">
        <h2 className="font-semibold">추출 완료</h2>
        <div className="flex gap-2">
          <Badge variant="secondary">{files.length}개 파일</Badge>
          <Badge variant="outline">{formatSize(totalSize)}</Badge>
        </div>
        <div className="ml-auto flex gap-2">
          <Button variant="ghost" size="sm" onClick={onReset}>
            <RotateCcw className="h-4 w-4" />
            초기화
          </Button>
          <Button size="sm" onClick={handleDownload} disabled={!downloadUrl}>
            <Download className="h-4 w-4" />
            ZIP 다운로드
          </Button>
        </div>
      </div>

      {/* 추출된 파일 목록 */}
      <ul className="max-h-64 space-y-0.5 overflow-y-auto rounded-lg border border-border">
        {files.map((entry) => (
          <li
            key={entry.name}
            className="flex items-center gap-2 px-3 py-1.5 text-sm hover:bg-accent/50"
          >
            <span className="shrink-0 text-base leading-none">{getFileIcon(entry.name)}</span>
            <span className="flex-1 truncate font-mono text-xs">{entry.name}</span>
            <span className="shrink-0 text-xs text-muted-foreground">{formatSize(entry.size)}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
