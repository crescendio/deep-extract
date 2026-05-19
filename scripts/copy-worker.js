import { mkdirSync, copyFileSync, existsSync, readdirSync } from 'fs';
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
mkdirSync(resolve(pub, 'wasm-gen'), { recursive: true });

// 1. worker-bundle.js 파일 복사
// 압축 해제 작업을 메인 스레드 밖에서 실행하는 워커 스크립트
copyFileSync(resolve(distDir, 'worker-bundle.js'), resolve(pub, 'worker-bundle.js'));

// 2. wasm-gen 폴더 내 모든 파일 복사
// - libarchive.js: 실제 압축 해제 처리를 담당하는 WebAssembly 바이너리
// - libarchive.wasm: WASM 바이너리를 로딩 및 초기화하는 glue 코드
const wasmSrc = resolve(distDir, 'wasm-gen');
for (const file of readdirSync(wasmSrc)) {
  copyFileSync(resolve(wasmSrc, file), resolve(pub, 'wasm-gen', file));
}

console.log('[setup] libarchive 워커 파일과 WASM 파일들이 public 폴더에 성공적으로 복사되었습니다.');
