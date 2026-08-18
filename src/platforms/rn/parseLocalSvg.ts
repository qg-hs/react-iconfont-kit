import { existsSync, readFileSync } from 'node:fs';
import { basename, resolve } from 'node:path';
import { globSync } from 'tinyglobby';
import type { KitConfig } from '../../core/types.js';

export interface LocalSvg {
  svgStr: string;
  name: string;
  styleType: boolean;
}

export const parseLocalSvg = ({ local_svgs }: KitConfig): LocalSvg[] => {
  if (!local_svgs) {
    return [];
  }

  const localDir = resolve(local_svgs);
  if (!existsSync(localDir)) {
    return [];
  }
  const files = globSync('**/*.svg', { cwd: localDir, absolute: true });

  return files.map((filePath) => {
    let svgStr = readFileSync(filePath, 'utf8');
    const start = svgStr.indexOf('<svg ');
    const end = svgStr.indexOf('</svg>');
    svgStr = svgStr
      .substring(start, end + 6)
      .replace(/<!--([\s\S]*?)-->/g, '')
      .replace(/<title>([\s\S]*?)<\/title>/g, '')
      .replace(/<desc>([\s\S]*?)<\/desc>/g, '');

    return {
      svgStr,
      name: basename(filePath, '.svg'),
      styleType: svgStr.includes('</style>'),
    };
  });
};
