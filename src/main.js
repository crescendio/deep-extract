import { Archive } from 'libarchive.js';
import { zip as zipAsync } from 'fflate';
import { isArchive, fmtSize, archiveIcon, fileIcon } from './utils.js';
import { collectedFiles, extractRecursive } from './extractor.js';

// ── Init ──────────────────────────────────────────────────────────────────────
Archive.init({ workerUrl: '/worker-bundle.js' });

// ── DOM ───────────────────────────────────────────────────────────────────────
const dropZone = document.getElementById('drop-zone');
const fileInput = document.getElementById('file-input');
const fileBtn = document.getElementById('file-btn');
const fileList = document.getElementById('file-list');
const fileCount = document.getElementById('file-count');
const actionRow = document.getElementById('action-row');
const clearAllBtn = document.getElementById('clear-all-btn');
const extractBtn = document.getElementById('extract-btn');
const progressSec = document.getElementById('progress-section');
const progressBar = document.getElementById('progress-bar');
const progressText = document.getElementById('progress-text');
const progressLogArea = document.getElementById('progress-log-area');
const resultSec = document.getElementById('result-section');
const resultCount = document.getElementById('result-count');
const resultSize = document.getElementById('result-size');
const resultList = document.getElementById('result-list');
const downloadBtn = document.getElementById('download-btn');
const resetBtn = document.getElementById('reset-btn');
const toast = document.getElementById('toast');

// ── State ─────────────────────────────────────────────────────────────────────
let uploadedFiles = [];

// ── Drag and drop ─────────────────────────────────────────────────────────────
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
  addFiles(Array.from(e.dataTransfer.files));
});

dropZone.addEventListener('click', e => {
  if (e.target === fileBtn || fileBtn.contains(e.target)) return;
  fileInput.click();
});

fileBtn.addEventListener('click', e => {
  e.stopPropagation();
  fileInput.click();
});

fileInput.addEventListener('change', () => addFiles(Array.from(fileInput.files)));

function addFiles(files) {
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

function renderFileList() {
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
        <span class="file-icon">${archiveIcon(file.name)}</span>
        <span class="file-name" title="${file.name}">${file.name}</span>
        <span class="file-size">${fmtSize(file.size)}</span>
        <button class="remove-btn" data-i="${index}" aria-label="제거">✕</button>
      </div>`,
    )
    .join('');

  fileList.querySelectorAll('.remove-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      uploadedFiles.splice(Number(btn.dataset.i), 1);
      renderFileList();
    });
  });
}

// ── Extraction ────────────────────────────────────────────────────────────────
extractBtn.addEventListener('click', runExtraction);

async function runExtraction() {
  extractBtn.disabled = true;
  dropZone.classList.add('hidden');
  actionRow.classList.add('hidden');
  fileList.classList.add('locked');
  collectedFiles.clear();

  progressSec.classList.remove('hidden');
  resultSec.classList.add('hidden');
  progressLogArea.innerHTML = '';

  const log = (msg, type = '') => {
    const div = document.createElement('div');
    if (type) div.className = `log-${type}`;

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
        log(`  Error: ${error.message}`, 'error');
        showToast('파일 추출 도중 오류가 발생했습니다.', 'error');
        return;
      }
    }

    setProgress(uploadedFiles.length, uploadedFiles.length, '완료');
    log(`\n총 ${collectedFiles.size}개 파일 추출됨`, 'ok');

    await buildResult(log);
  } catch (error) {
    console.error(error);
    log(`Error: ${error.message}`, 'error');
    showToast('파일 추출 도중 오류가 발생했습니다.', 'error');
    return;
  }
}

// ── Result & download ─────────────────────────────────────────────────────────
async function buildResult(log) {
  try {
    log('\nZIP 생성 중...');

    const filesObj = {};
    for (const [name, file] of collectedFiles) {
      const buf = await file.arrayBuffer();
      filesObj[name] = new Uint8Array(buf);
    }

    const zipData = await new Promise((resolve, reject) => {
      zipAsync(filesObj, { level: 0 }, (error, data) => (error ? reject(error) : resolve(data)));
    });

    const blob = new Blob([zipData], { type: 'application/zip' });
    const url = URL.createObjectURL(blob);

    downloadBtn.onclick = () => {
      const a = document.createElement('a');
      a.href = url;
      a.download = 'extracted_files.zip';
      a.click();
    };

    const resultFiles = [...collectedFiles.values()];
    resultList.innerHTML = resultFiles
      .map(
        (file, index) => `
      <div class="result-file">
        <span class="file-icon">${fileIcon(file.name)}</span>
        <span class="file-name" title="${file.name}">${file.name}</span>
        <span class="file-size">${fmtSize(file.size)}</span>
      </div>`,
      )
      .join('');

    resultCount.textContent = `${collectedFiles.size}개 파일`;
    resultSize.textContent = fmtSize(zipData.length);
    resultSec.classList.remove('hidden');

    log('완료!', 'ok');
  } catch (error) {
    console.error(error);
    log(`Error: ${error.message}`, 'error');
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

// ── UI helpers ────────────────────────────────────────────────────────────────
function setProgress(cur, total, label) {
  const pct = total > 0 ? Math.round((cur / total) * 100) : 0;
  progressBar.style.width = `${pct}%`;
  progressText.textContent = `${cur}/${total}  ${label}`;
}

let toastTimer;
function showToast(msg, type = 'default') {
  clearTimeout(toastTimer);
  toast.textContent = msg;
  toast.className = `toast ${type ?? 'default'}`;
  toastTimer = setTimeout(() => toast.classList.add('hidden'), 5000);
}
