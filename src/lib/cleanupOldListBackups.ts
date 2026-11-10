import { listBackups } from "./store.svelte";

const MAX_BACKUP_AGE_MS = 30 * 24 * 60 * 60 * 1000;

export function cleanupOldListBackups() {
  const cutoffDate = Date.now() - MAX_BACKUP_AGE_MS;

  for (let i = listBackups.length - 1; i >= 0; i--) {
    if (new Date(listBackups[i].dateIso).getTime() <= cutoffDate) {
      listBackups.splice(i, 1);
    }
  }
}
