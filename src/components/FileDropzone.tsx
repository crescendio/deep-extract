import { Upload, FileArchive } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FileDropzoneProps {
  isDragActive: boolean;
  onOpen: () => void;
  disabled?: boolean;
}

export function FileDropzone({ isDragActive, onOpen, disabled }: FileDropzoneProps) {
  return (
    <div
      onClick={disabled ? undefined : onOpen}
      role="button"
      tabIndex={disabled ? -1 : 0}
      onKeyDown={(e) => {
        if (!disabled && (e.key === 'Enter' || e.key === ' ')) onOpen();
      }}
      className={cn(
        'flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed p-12 text-center transition-colors',
        disabled
          ? 'cursor-default opacity-50 pointer-events-none'
          : 'cursor-pointer',
        isDragActive
          ? 'border-primary bg-primary/5'
          : 'border-border hover:border-primary/50 hover:bg-accent/20',
      )}
    >
      <div className={cn('rounded-full p-3 transition-colors', isDragActive ? 'bg-primary/10' : 'bg-secondary')}>
        {isDragActive ? (
          <FileArchive className="h-8 w-8 text-primary" />
        ) : (
          <Upload className="h-8 w-8 text-muted-foreground" />
        )}
      </div>

      {isDragActive ? (
        <p className="font-medium text-primary">파일을 여기에 놓으세요</p>
      ) : (
        <>
          <p className="font-medium">파일을 드래그하거나 클릭하여 선택</p>
          <p className="text-sm text-muted-foreground">ZIP, 7Z, RAR, TAR, GZ 등 다양한 형식 지원</p>
        </>
      )}
    </div>
  );
}
