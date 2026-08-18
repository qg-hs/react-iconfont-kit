import { existsSync, mkdirSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

export const ensureDir = (dir: string): void => {
  mkdirSync(dir, { recursive: true });
};

export const emptyDir = (dir: string): void => {
  if (!existsSync(dir)) {
    return;
  }

  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    rmSync(join(dir, entry.name), { recursive: true, force: true });
  }
};

export const writeText = (filePath: string, content: string): void => {
  writeFileSync(filePath, content);
};
