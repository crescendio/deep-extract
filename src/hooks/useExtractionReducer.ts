import type { ExtractionState, ExtractionAction, LogEntry } from '@/types';

export const DEFAULT_OPTIONS: ExtractionState['options'] = {
  mode: 'flatten',
  encoding: 'utf-8',
  maxDepth: 12,
};

export const initialState: ExtractionState = {
  uploadedFiles: [],
  status: 'idle',
  progress: 0,
  logs: [],
  extractedFiles: [],
  downloadUrl: null,
  options: DEFAULT_OPTIONS,
  totalArchives: 0,
};

function makeLog(level: LogEntry['level'], message: string): LogEntry {
  return { id: `${Date.now()}-${Math.random().toString(36).slice(2)}`, level, message };
}

export function extractionReducer(
  state: ExtractionState,
  action: ExtractionAction,
): ExtractionState {
  switch (action.type) {
    case 'FILES_ADDED':
      return { ...state, uploadedFiles: [...state.uploadedFiles, ...action.payload] };

    case 'FILE_REMOVED':
      return {
        ...state,
        uploadedFiles: state.uploadedFiles.filter((f) => f.name !== action.payload),
      };

    case 'ALL_FILES_CLEARED':
      return { ...state, uploadedFiles: [] };

    case 'EXTRACTION_STARTED':
      return {
        ...state,
        status: 'extracting',
        progress: 0,
        logs: [],
        extractedFiles: [],
        downloadUrl: null,
        totalArchives: state.uploadedFiles.length,
      };

    case 'PROGRESS_UPDATED':
      return { ...state, progress: action.payload };

    case 'LOG_ADDED':
      return {
        ...state,
        logs: [...state.logs, makeLog(action.payload.level, action.payload.message)],
      };

    case 'FILE_EXTRACTED':
      return { ...state, extractedFiles: [...state.extractedFiles, action.payload] };

    case 'DOWNLOAD_URL_SET':
      return { ...state, downloadUrl: action.payload };

    case 'EXTRACTION_COMPLETED':
      return { ...state, status: 'done', progress: 100 };

    case 'EXTRACTION_FAILED':
      return {
        ...state,
        status: 'error',
        logs: [...state.logs, makeLog('error', `추출 실패: ${action.payload}`)],
      };

    case 'RESET':
      return { ...initialState, options: state.options }; // 설정값은 초기화하지 않음

    case 'OPTIONS_CHANGED':
      return { ...state, options: { ...state.options, ...action.payload } };
  }
}
