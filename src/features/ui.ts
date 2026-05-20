import type { ToastType } from '@/types';
import { progressBar, progressText, toast } from '@/utils';

export function setProgress(current: number, total: number, label: string): void {
  const percent = total > 0 ? Math.round((current / total) * 100) : 0;
  progressBar.style.width = `${percent}%`;
  progressText.textContent = `${current}/${total}  ${label}`;
}

let toastTimer: ReturnType<typeof setTimeout>;
export function showToast(msg: string, type: ToastType = 'default'): void {
  clearTimeout(toastTimer);
  toast.textContent = msg;
  toast.className = `toast ${type === 'default' ? '' : type}`;
  toastTimer = setTimeout(() => toast.classList.add('hidden'), 5000);
}
