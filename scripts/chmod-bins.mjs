import { chmodSync, readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const chmodFiles = (dir) => {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      chmodFiles(full);
    } else if (entry.name.endsWith('.js')) {
      chmodSync(full, 0o755);
    }
  }
};

chmodFiles(join(dirname(fileURLToPath(import.meta.url)), '../dist'));
