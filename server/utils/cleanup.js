import { unlink } from 'node:fs/promises';

export async function cleanupFile(filePath) {
  try {
    await unlink(filePath);
  } catch {
    // File may already be deleted — ignore
  }
}
