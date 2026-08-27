const STORAGE_KEY = 'duality.progress.v1';

type Progress = {
  completed: string[];
};

function readProgress(): Progress {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { completed: [] };
    const parsed = JSON.parse(raw) as Partial<Progress>;
    return { completed: Array.isArray(parsed.completed) ? parsed.completed.filter((id): id is string => typeof id === 'string') : [] };
  } catch {
    return { completed: [] };
  }
}

function writeProgress(progress: Progress): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
}

export function isLevelCompleted(levelId: string): boolean {
  return readProgress().completed.includes(levelId);
}

export function completeLevel(levelId: string): void {
  const progress = readProgress();
  if (!progress.completed.includes(levelId)) {
    progress.completed.push(levelId);
    writeProgress(progress);
  }
}

export function resetProgress(): void {
  localStorage.removeItem(STORAGE_KEY);
}

export function getCompletedCount(): number {
  return readProgress().completed.length;
}
