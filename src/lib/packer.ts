import { zip as zipAsync } from 'fflate';
import type { ExtractedFile } from '@/types';

/** 추출된 파일 목록을 하나의 ZIP Blob으로 패킹 (level: 0 = 무압축, 속도 우선) */
export async function packToZip(files: ExtractedFile[]): Promise<Blob> {
  const fileData: Record<string, Uint8Array> = {};

  await Promise.all(
    files.map(async ({ name, file }) => {
      const buffer = await file.arrayBuffer();
      fileData[name] = new Uint8Array(buffer);
    }),
  );

  const data = await new Promise<Uint8Array>((resolve, reject) => {
    zipAsync(fileData, { level: 0 }, (err, result) => (err ? reject(err) : resolve(result)));
  });

  return new Blob([data as Uint8Array<ArrayBuffer>], { type: 'application/zip' });
}
