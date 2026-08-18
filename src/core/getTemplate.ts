import { copyFileSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const templatesDir = join(dirname(fileURLToPath(import.meta.url)), '../templates');

export const getTemplate = (platform: string, fileName: string): string =>
  readFileSync(join(templatesDir, platform, `${fileName}.template`), 'utf8');

export const copyTemplate = (platform: string, fileName: string, toFile: string): void => {
  copyFileSync(join(templatesDir, platform, `${fileName}.template`), toFile);
};

export const getDefaultConfigPath = (): string => join(templatesDir, 'iconfont.json');
