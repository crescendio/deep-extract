import { X, FileArchive, Trash2, Loader2 } from 'lucide-react';
import { Button } from './ui/button';
import { formatSize } from '@/lib/file-utils';
import { cn } from '@/lib/utils';

interface UploadedFileListProps {
  files: File[];
  onRemove: (filename: string) => void;
  onClearAll: () => void;
  isLoading?: boolean;
  disabled?: boolean;
}

export function UploadedFileList({ files, onRemove, onClearAll, isLoading, disabled }: UploadedFileListProps) {
  if (files.length === 0) return null;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium text-muted-foreground">
          선택된 파일 ({files.length}개)
        </p>
        {!disabled && !isLoading && (
          <Button
            variant="ghost"
            size="sm"
            className="h-6 gap-1 px-2 text-xs text-muted-foreground hover:text-destructive"
            onClick={onClearAll}
          >
            <Trash2 className="h-3 w-3" />
            전체 삭제
          </Button>
        )}
      </div>

      <ul className={cn('space-y-1.5 transition-opacity duration-150', isLoading && 'opacity-40 pointer-events-none')}>
        {files.map((file) => (
          <li
            key={file.name}
            className="flex items-center gap-2 rounded-lg bg-secondary px-3 py-2 text-sm"
          >
            <FileArchive className="h-4 w-4 shrink-0 text-muted-foreground" />
            <span className="flex-1 truncate">{file.name}</span>
            <span className="shrink-0 text-xs text-muted-foreground">{formatSize(file.size)}</span>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 shrink-0"
              onClick={() => onRemove(file.name)}
              disabled={disabled}
              aria-label={`${file.name} 제거`}
            >
              <X className="h-3 w-3" />
            </Button>
          </li>
        ))}
      </ul>

      {isLoading && (
        <div className="flex items-center justify-center gap-2 py-1">
          <Loader2 className="h-4 w-4 animate-spin text-primary" />
          <span className="text-xs text-muted-foreground">파일 추가 중...</span>
        </div>
      )}
    </div>
  );
}
