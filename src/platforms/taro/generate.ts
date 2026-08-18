import { unlinkSync } from 'node:fs';
import { join, relative, resolve } from 'node:path';
import { globSync } from 'tinyglobby';
import pc from 'picocolors';
import type { KitConfig, XmlData } from '../../core/types.js';
import { emptyDir, ensureDir, writeText } from '../../core/fs.js';
import { getTemplate } from '../../core/getTemplate.js';
import { trimIconPrefix } from '../../core/names.js';
import {
  replaceDesignWidth,
  replaceIsRpx,
  replaceNames,
  replacePlatform,
  replaceSize,
} from '../../core/replace.js';
import { generateH5 } from '../h5/generate.js';
import { generateMP, MP_PLATFORMS } from '../mp/generate.js';
import { generateRN } from '../rn/generate.js';

const getIconNames = (data: XmlData, config: KitConfig): string[] =>
  data.svg.symbol.map((item) => trimIconPrefix(item.$.id, config.trim_icon_prefix));

const replaceRelativePath = (content: string, saveDir: string): string => {
  const relativePath = relative(resolve('src'), resolve(saveDir)).replace(/\\/g, '/');
  return content.replace(/#relativePath#/g, relativePath);
};

const generateUsingComponent = (config: KitConfig, names: string[], platform?: string): void => {
  const saveDir = resolve(config.save_dir);
  const jsxExtension = config.use_typescript ? '.tsx' : '.js';

  let iconFile: string;
  if (platform) {
    const specific = `index.${platform}${jsxExtension}`;
    try {
      iconFile = getTemplate('taro', specific);
    } catch {
      iconFile = getTemplate('taro', `index.platform${jsxExtension}`);
    }
  } else {
    iconFile = getTemplate('taro', `index${jsxExtension}`);
  }

  iconFile = replaceNames(iconFile, names);
  iconFile = replaceSize(iconFile, config.default_icon_size);

  if (platform === 'h5' && config.use_rpx) {
    iconFile = replaceDesignWidth(iconFile, config.design_width || 750);
  }

  iconFile = replaceIsRpx(iconFile, config.use_rpx);
  if (platform) {
    iconFile = replacePlatform(iconFile, platform);
  }

  if (!platform && !config.use_typescript) {
    let definitionFile = getTemplate('taro', 'index.d.ts');
    definitionFile = replaceNames(definitionFile, names);
    writeText(join(saveDir, 'index.d.ts'), definitionFile);
  }

  let helperFile = getTemplate('taro', 'helper.js');
  helperFile = replaceRelativePath(helperFile, config.save_dir);
  writeText(join(saveDir, 'helper.js'), helperFile);
  writeText(join(saveDir, 'helper.d.ts'), getTemplate('taro', 'helper.d.ts'));
  writeText(join(saveDir, `index${platform ? `.${platform}` : ''}${jsxExtension}`), iconFile);
};

const withSaveDir = (config: KitConfig, platform: string): KitConfig => ({
  ...config,
  save_dir: join(config.save_dir, platform),
});

export const generateTaro = (data: XmlData, config: KitConfig): void => {
  if (!config.platforms.length) {
    console.warn('\nPlatform is required.\n');
    return;
  }

  const saveDir = resolve(config.save_dir);
  ensureDir(saveDir);
  emptyDir(saveDir);

  const iconNames = getIconNames(data, config);
  generateUsingComponent(config, iconNames);

  for (const platform of config.platforms) {
    if (platform === 'taro') {
      continue;
    }

    console.log(`\nCreating icons for platform ${pc.green(platform)}\n`);
    const nested = withSaveDir(config, platform);

    if (platform === 'h5') {
      generateH5(data, { ...nested, unit: config.use_rpx ? 'rem' : 'px' });
      for (const file of globSync('**/*.d.ts', { cwd: resolve(nested.save_dir), absolute: true })) {
        unlinkSync(file);
      }
    } else if (platform === 'rn') {
      generateRN(data, nested);
      for (const file of globSync('**/*.d.ts', { cwd: resolve(nested.save_dir), absolute: true })) {
        unlinkSync(file);
      }
    } else if (MP_PLATFORMS[platform]) {
      generateMP(data, nested, platform);
    } else {
      console.warn(`\nThe platform ${pc.red(platform)} is not exist.\n`);
      continue;
    }

    generateUsingComponent(config, iconNames, platform);
  }
};
