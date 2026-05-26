import { useReducer, useCallback, useRef } from 'react';
import { toast } from 'sonner';
import { extractionReducer, initialState } from './useExtractionReducer';
import { extractArchives } from '@/lib/extractor';
import { packToZip } from '@/lib/packer';
import { isArchive } from '@/lib/file-utils';
import type { ExtractionOptions, ExtractedFile } from '@/types';

export function useExtraction() {
  const [state, dispatch] = useReducer(extractionReducer, initialState);
  const downloadUrlRef = useRef<string | null>(null);

  const addFiles = useCallback(
    (newFiles: File[]) => {
      const existingNames = new Set(state.uploadedFiles.map((f) => f.name));
      const valid: File[] = [];
      const duplicates: string[] = [];
      const invalid: string[] = [];

      for (const file of newFiles) {
        if (!isArchive(file.name)) {
          invalid.push(file.name);
        } else if (existingNames.has(file.name)) {
          duplicates.push(file.name);
        } else {
          valid.push(file);
        }
      }

      if (invalid.length > 0)
        toast.error(`지원하지 않는 파일 형식: ${invalid.join(', ')}`);
      if (duplicates.length > 0)
        toast.warning(`이미 추가된 파일: ${duplicates.join(', ')}`);
      if (valid.length > 0)
        dispatch({ type: 'FILES_ADDED', payload: valid });
    },
    [state.uploadedFiles],
  );

  const removeFile = useCallback((filename: string) => {
    dispatch({ type: 'FILE_REMOVED', payload: filename });
  }, []);

  const clearFiles = useCallback(() => {
    dispatch({ type: 'ALL_FILES_CLEARED' });
  }, []);

  const extract = useCallback(async () => {
    if (state.uploadedFiles.length === 0) {
      toast.error('추출할 파일을 먼저 선택해주세요.');
      return;
    }

    dispatch({ type: 'EXTRACTION_STARTED' });

    if (downloadUrlRef.current) {
      URL.revokeObjectURL(downloadUrlRef.current);
      downloadUrlRef.current = null;
    }

    const collectedFiles: ExtractedFile[] = [];

    try {
      await extractArchives(state.uploadedFiles, state.options, {
        onLog: (level, message) => dispatch({ type: 'LOG_ADDED', payload: { level, message } }),
        onProgress: (progress) => dispatch({ type: 'PROGRESS_UPDATED', payload: progress }),
        onFile: (file) => {
          collectedFiles.push(file);
          dispatch({ type: 'FILE_EXTRACTED', payload: file });
        },
      });

      dispatch({ type: 'LOG_ADDED', payload: { level: 'default', message: '\nZIP 생성 중...' } });

      const zipBlob = await packToZip(collectedFiles);
      const url = URL.createObjectURL(zipBlob);
      downloadUrlRef.current = url;

      dispatch({ type: 'DOWNLOAD_URL_SET', payload: url });
      dispatch({ type: 'EXTRACTION_COMPLETED' });
      dispatch({
        type: 'LOG_ADDED',
        payload: { level: 'success', message: `완료! 총 ${collectedFiles.length}개 파일 추출됨` },
      });

      toast.success(`${collectedFiles.length}개 파일 추출 완료`);
    } catch (error) {
      dispatch({ type: 'EXTRACTION_FAILED', payload: String(error) });
      toast.error('압축 해제 중 오류가 발생했습니다.');
    }
  }, [state.uploadedFiles, state.options]);

  const reset = useCallback(() => {
    if (downloadUrlRef.current) {
      URL.revokeObjectURL(downloadUrlRef.current);
      downloadUrlRef.current = null;
    }
    dispatch({ type: 'RESET' });
  }, []);

  const changeOptions = useCallback((options: Partial<ExtractionOptions>) => {
    dispatch({ type: 'OPTIONS_CHANGED', payload: options });
  }, []);

  return { state, addFiles, removeFile, clearFiles, extract, reset, changeOptions };
}
