const KEY = 'comp3133_employee_flash';

export function readEmployeeFlash(): string | null {
  try {
    if (typeof sessionStorage === 'undefined') return null;
    return sessionStorage.getItem(KEY);
  } catch {
    return null;
  }
}

export function writeEmployeeFlash(message: string): void {
  try {
    if (typeof sessionStorage === 'undefined') return;
    sessionStorage.setItem(KEY, message);
  } catch {}
}

export function clearEmployeeFlash(): void {
  try {
    if (typeof sessionStorage === 'undefined') return;
    sessionStorage.removeItem(KEY);
  } catch {}
}
