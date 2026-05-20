import type { LogFn } from './types';
import { Archive } from 'libarchive.js';
import { zip as zipAsync } from 'fflate';
import { collectedFiles, extractRecursive, setProgress, showToast } from '@/features';
import {
  isArchive,
  formatSize,
  dropZone,
  fileInput,
  fileBtn,
  fileList,
  fileCount,
  actionRow,
  clearAllBtn,
  extractBtn,
  progressSec,
  progressLogArea,
  resultSec,
  resultCount,
  resultSize,
  resultList,
  downloadBtn,
  resetBtn,
  ARCHIVE_ICON,
  FILE_ICONS,
  FILE_ICON_DEFAULT,
} from '@/utils';

// 초기화
Archive.init({ workerUrl: '/worker-bundle.js' });

// 업로드된 파일 상태 배열
let uploadedFiles: File[] = [];

// 드래그 앤 드롭
dropZone.addEventListener('dragover', e => {
  e.preventDefault();
  dropZone.classList.add('drag-over');
});

['dragleave', 'dragend'].forEach(evt => {
  dropZone.addEventListener(evt, () => dropZone.classList.remove('drag-over'));
});

dropZone.addEventListener('drop', e => {
  e.preventDefault();
  dropZone.classList.remove('drag-over');
  addFiles(Array.from(e.dataTransfer!.files));
});

dropZone.addEventListener('click', e => {
  if (e.target === fileBtn || fileBtn.contains(e.target as Node)) return;
  fileInput.click();
});

fileBtn.addEventListener('click', e => {
  e.stopPropagation();
  fileInput.click();
});

fileInput.addEventListener('change', () => addFiles(Array.from(fileInput.files ?? [])));

function addFiles(files: File[]): void {
  console.log(files);
  const archives = files.filter(file => isArchive(file.name));
  const skipped = files.length - archives.length;

  if (archives.length === 0) {
    showToast('압축 파일을 선택해 주세요!', 'error');
    return;
  }

  if (skipped > 0) {
    showToast(`압축 파일이 아닌 ${skipped}개 파일은 건너뜁니다.`);
  }

  const existing = new Set(uploadedFiles.map(file => file.name));
  archives.filter(file => !existing.has(file.name)).forEach(file => uploadedFiles.push(file));

  renderFileList();
  fileInput.value = '';
}

function renderFileList(): void {
  if (uploadedFiles.length === 0) {
    fileList.classList.add('hidden');
    fileCount.textContent = '';
    extractBtn.disabled = true;
    clearAllBtn.classList.add('hidden');
    return;
  }

  fileList.classList.remove('hidden');
  fileCount.textContent = `${uploadedFiles.length}개 파일 선택됨`;
  extractBtn.disabled = false;
  clearAllBtn.classList.remove('hidden');

  fileList.innerHTML = uploadedFiles
    .map(
      (file, index) => `
      <div class="file-item">
        <span class="file-icon">${ARCHIVE_ICON}</span>
        <span class="file-name" title="${file.name}">${file.name}</span>
        <span class="file-size">${formatSize(file.size)}</span>
        <button class="remove-btn" data-i="${index}" aria-label="제거">✕</button>
      </div>`,
    )
    .join('');

  fileList.querySelectorAll('.remove-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      uploadedFiles.splice(Number((btn as HTMLElement).dataset.i), 1);
      renderFileList();
    });
  });
}

// 압축 해제 진행
extractBtn.addEventListener('click', runExtraction);

async function runExtraction(): Promise<void> {
  extractBtn.disabled = true;
  dropZone.classList.add('hidden');
  actionRow.classList.add('hidden');
  fileList.classList.add('locked');
  collectedFiles.clear();

  progressSec.classList.remove('hidden');
  resultSec.classList.add('hidden');
  progressLogArea.innerHTML = '';

  const log: LogFn = (msg, type = 'default') => {
    const div = document.createElement('div');
    if (type !== 'default') div.className = `log-${type}`;

    div.textContent = msg;
    progressLogArea.appendChild(div);
    progressLogArea.scrollTop = progressLogArea.scrollHeight;
  };

  try {
    log('추출 시작...');

    for (let i = 0; i < uploadedFiles.length; i++) {
      const file = uploadedFiles[i];
      setProgress(i, uploadedFiles.length, file.name);
      log(`\n[${i + 1}/${uploadedFiles.length}] ${file.name}`);

      try {
        await extractRecursive(file, 0, log);
      } catch (error) {
        log(`  Error: ${(error as Error).message}`, 'error');
        showToast('파일 추출 도중 오류가 발생했습니다.', 'error');
        return;
      }
    }

    setProgress(uploadedFiles.length, uploadedFiles.length, '완료');
    log(`\n총 ${collectedFiles.size}개 파일 추출됨`, 'success');

    await buildResult(log);
  } catch (error) {
    console.error(error);
    log(`Error: ${(error as Error).message}`, 'error');
    showToast('파일 추출 도중 오류가 발생했습니다.', 'error');
    return;
  }
}

// ZIP 파일 생성 및 다운로드
async function buildResult(log: LogFn): Promise<void> {
  try {
    log('\nZIP 생성 중...');

    const filesObj: Record<string, Uint8Array> = {};
    for (const [name, file] of collectedFiles) {
      const buf = await file.arrayBuffer();
      filesObj[name] = new Uint8Array(buf);
    }

    const zipData = await new Promise<Uint8Array>((resolve, reject) => {
      zipAsync(filesObj, { level: 0 }, (error, data) => (error ? reject(error) : resolve(data)));
    });

    const blob = new Blob([zipData as Uint8Array<ArrayBuffer>], { type: 'application/zip' });
    const url = URL.createObjectURL(blob);

    downloadBtn.onclick = () => {
      const a = document.createElement('a');
      a.href = url;
      a.download = 'extracted_files.zip';
      a.click();
    };

    const resultFiles = [...collectedFiles.values()];
    resultList.innerHTML = resultFiles
      .map(file => {
        const extension = file.name.trim().toLowerCase().split('.').pop();
        const fileIcon = (extension && FILE_ICONS[extension]) ?? FILE_ICON_DEFAULT;

        return `
        <div class="result-file">
          <span class="file-icon">${fileIcon}</span>
          <span class="file-name" title="${file.name}">${file.name}</span>
          <span class="file-size">${formatSize(file.size)}</span>
        </div>`;
      })
      .join('');

    resultCount.textContent = `${collectedFiles.size}개 파일`;
    resultSize.textContent = formatSize(zipData.length);
    resultSec.classList.remove('hidden');

    log('완료!', 'success');
  } catch (error) {
    console.error(error);
    log(`Error: ${(error as Error).message}`, 'error');
    showToast('ZIP 파일 생성 도중 오류가 발생했습니다.', 'error');
    return;
  }
}

resetBtn.addEventListener('click', () => {
  uploadedFiles = [];
  collectedFiles.clear();
  renderFileList();

  dropZone.classList.remove('hidden');
  actionRow.classList.remove('hidden');
  fileList.classList.remove('locked');
  progressSec.classList.add('hidden');
  resultSec.classList.add('hidden');
  progressLogArea.innerHTML = '';
});

clearAllBtn.addEventListener('click', () => {
  uploadedFiles = [];
  renderFileList();
  fileInput.value = '';
});
