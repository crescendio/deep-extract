import { useEffect, useRef } from 'react';
import { Progress } from './ui/progress';
import { cn } from '@/lib/utils';
import type { LogEntry } from '@/types';

interface ExtractionProgressProps {
  progress: number;
  logs: LogEntry[];
  totalArchives?: number;
}

const LOG_COLOR: Record<LogEntry['level'], string> = {
  default: 'text-muted-foreground',
  info: 'text-sky-400',
  success: 'text-green-400',
  warning: 'text-yellow-400',
  error: 'text-red-400',
};

export function ExtractionProgress({ progress, logs, totalArchives = 0 }: ExtractionProgressProps) {
  const logEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs.length]);

  // 아카이브 처리 진행 카운트 (progress 0~90이 아카이브 처리 구간)
  const processedArchives = totalArchives > 0
    ? Math.min(Math.round(progress * totalArchives / 90), totalArchives)
    : 0;

  const isDone = progress >= 100;
  const isZipping = progress > 90 && !isDone;

  return (
    <div className="space-y-3 rounded-xl border border-border bg-card p-4">
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium">
          {isDone ? '완료' : isZipping ? 'ZIP 생성 중...' : '처리 중...'}
        </span>
        <div className="flex items-center gap-3">
          {totalArchives > 0 && !isDone && (
            <span className="text-xs text-muted-foreground">
              {processedArchives} / {totalArchives}개 완료
            </span>
          )}
          <span className="text-muted-foreground">{progress}%</span>
        </div>
      </div>

      <Progress value={progress} />

      <div className="h-48 overflow-y-auto rounded-lg bg-secondary/50 p-3 font-mono text-xs leading-5">
        {logs.length === 0 ? (
          <p className="text-muted-foreground">압축 해제를 시작하면 로그가 표시됩니다...</p>
        ) : (
          logs.map((log) => (
            <div key={log.id} className={cn('whitespace-pre-wrap', LOG_COLOR[log.level])}>
              {log.message}
            </div>
          ))
        )}
        <div ref={logEndRef} />
      </div>
    </div>
  );
}
