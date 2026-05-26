import { mkdirSync, copyFileSync, existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

// 빌드 전 준비 스크립트
// node_modules/libarchive.js/dist/에서 필요한 파일들을 public/으로 복사한다.
const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');
const distDir = resolve(root, 'node_modules/libarchive.js/dist');

if (!existsSync(distDir)) {
  console.warn('[setup] libarchive.js 파일을 찾을 수 없습니다 — npm install 먼저 실행해 주세요.');
  process.exit(0);
}

const pub = resolve(root, 'public');
mkdirSync(pub, { recursive: true });

// 1. worker-bundle.js 복사
// 압축 해제 작업을 메인 스레드 밖에서 실행하는 워커 스크립트 (ES module 형식)
copyFileSync(resolve(distDir, 'worker-bundle.js'), resolve(pub, 'worker-bundle.js'));

// 2. libarchive.wasm 복사 (libarchive.js 2.x: dist 루트에 위치)
// worker-bundle.js가 import.meta.url 기준으로 libarchive.wasm을 로드하므로
// worker와 같은 위치(public/)에 있어야 함
copyFileSync(resolve(distDir, 'libarchive.wasm'), resolve(pub, 'libarchive.wasm'));

console.log('[setup] libarchive 워커 파일과 WASM 파일이 public 폴더에 성공적으로 복사되었습니다.');
