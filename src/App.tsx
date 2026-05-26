import { useDropzone } from 'react-dropzone';
import { Toaster } from 'sonner';
import { Loader2, PackageOpen } from 'lucide-react';
import { Header } from './components/Header';
import { FileDropzone } from './components/FileDropzone';
import { UploadedFileList } from './components/UploadedFileList';
import { ExtractionProgress } from './components/ExtractionProgress';
import { ExtractionResults } from './components/ExtractionResults';
import { Button } from './components/ui/button';
import { useExtraction } from './hooks/useExtraction';

export default function App() {
  const { state, addFiles, removeFile, clearFiles, extract, reset } = useExtraction();

  const isIdle = state.status === 'idle';
  const isExtracting = state.status === 'extracting';
  const isDone = state.status === 'done';
  const isError = state.status === 'error';

  // 전체 페이지가 Dropzone, noClick으로 클릭은 FileDropzone의 onOpen으로만 처리
  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
    onDrop: addFiles,
    noClick: true,
    noKeyboard: true,
    disabled: isExtracting || isDone,
    multiple: true,
  });

  return (
    <>
      <Toaster richColors theme="dark" position="top-right" />

      <div {...getRootProps()} tabIndex={-1} className="flex min-h-screen flex-col bg-background text-foreground outline-none">
        <input {...getInputProps()} />

        {/* 화면 어디에서든 드래그 중일 때 전체 테두리 오버레이 */}
        {isDragActive && <div className="pointer-events-none fixed inset-0 z-50 rounded-none bg-primary/4 ring-2 ring-inset ring-primary/50" />}

        <Header />

        <main className="mx-auto w-full max-w-2xl flex-1 space-y-4 px-4 py-8">
          {/* 업로드 영역: 추출 완료 후 숨김, 추출 중 inert로 잠금 */}
          {!isDone && (
            <section className="space-y-3" {...(isExtracting ? { inert: true } : {})}>
              <FileDropzone isDragActive={isDragActive} onOpen={open} disabled={isExtracting} />
              <UploadedFileList files={state.uploadedFiles} onRemove={removeFile} onClearAll={clearFiles} isLoading={isDragActive} disabled={isExtracting} />
            </section>
          )}

          {(isIdle || isError) && (
            <Button className="w-full" size="lg" onClick={extract} disabled={state.uploadedFiles.length === 0 || isDragActive}>
              <PackageOpen className="h-5 w-5" />
              압축 해제하기
            </Button>
          )}

          {isExtracting && (
            <Button className="w-full" size="lg" disabled>
              <Loader2 className="h-5 w-5 animate-spin" />
              압축 해제 중...
            </Button>
          )}

          {(isExtracting || isDone || isError) && <ExtractionProgress progress={state.progress} logs={state.logs} totalArchives={state.totalArchives} />}

          {isDone && <ExtractionResults files={state.extractedFiles} downloadUrl={state.downloadUrl} onReset={reset} />}
        </main>

        <footer className="border-t border-border py-4 text-center text-xs text-muted-foreground">
          모든 처리는 브라우저에서만 이루어지며, 서버로 파일이 전송되지 않습니다.
        </footer>
      </div>
    </>
  );
}
