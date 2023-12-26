import { get } from "svelte/store";
import { listBackupStore } from "./store";

export function cleanupOldListBackups() {
  const cutoffDate = Date.now() - 2592000000; // 30 days before now
  let backups = get(listBackupStore);

  backups = backups.filter((backup) => {
    return new Date(backup.dateIso).getTime() > cutoffDate;
  });

  listBackupStore.set(backups);
}
