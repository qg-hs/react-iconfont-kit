import { unlinkSync } from 'node:fs';
import { join, relative, resolve } from 'node:path';
import { globSync } from 'tinyglobby';
import pc from 'picocolors';
import type { KitConfig, XmlData } from '../../core/types.js';
import { emptyDir, ensureDir, writeText } from '../../core/fs.js';
import { trimIconPrefix } from '../../core/names.js';
import {
  renderTaroDummyDts,
  renderTaroDummyIndex,
  renderTaroH5Wrapper,
  renderTaroHelper,
  renderTaroHelperDts,
  renderTaroPlatformWrapper,
  renderTaroRnWrapper,
} from '../../emit/taro.js';
import { generateH5 } from '../h5/generate.js';
import { generateMP, MP_PLATFORMS } from '../mp/generate.js';
import { generateRN } from '../rn/generate.js';

const getIconNames = (data: XmlData, config: KitConfig): string[] =>
  data.svg.symbol.map((item) => trimIconPrefix(item.id, config.trim_icon_prefix));

const relativeFromSrc = (saveDir: string): string => relative(resolve('src'), resolve(saveDir)).replace(/\\/g, '/');

const generateUsingComponent = (config: KitConfig, names: string[], platform?: string): void => {
  const saveDir = resolve(config.save_dir);
  const jsxExtension = config.use_typescript ? '.tsx' : '.js';
  const wrapperOpts = {
    ts: config.use_typescript,
    names,
    size: config.default_icon_size,
    useRpx: config.use_rpx,
    designWidth: config.design_width || 750,
  };

  let iconFile: string;
  if (platform === 'h5') {
    iconFile = renderTaroH5Wrapper(wrapperOpts);
  } else if (platform === 'rn') {
    iconFile = renderTaroRnWrapper(wrapperOpts);
  } else if (platform) {
    iconFile = renderTaroPlatformWrapper(wrapperOpts);
  } else {
    iconFile = renderTaroDummyIndex({ ts: config.use_typescript, names });
    if (!config.use_typescript) {
      writeText(join(saveDir, 'index.d.ts'), renderTaroDummyDts(names));
    }
  }

  writeText(join(saveDir, `index${platform ? `.${platform}` : ''}${jsxExtension}`), iconFile);
};

const withSaveDir = (config: KitConfig, platform: string): KitConfig => ({
  ...config,
  save_dir: join(config.save_dir, platform),
});

const stripNestedDts = (dir: string): void => {
  for (const file of globSync('**/*.d.ts', { cwd: resolve(dir), absolute: true })) {
    unlinkSync(file);
  }
};

export const generateTaro = (data: XmlData, config: KitConfig): void => {
  if (!config.platforms.length) {
    console.warn('\nPlatform is required.\n');
    return;
  }

  const saveDir = resolve(config.save_dir);
  ensureDir(saveDir);
  emptyDir(saveDir);

  const iconNames = getIconNames(data, config);
  writeText(join(saveDir, 'helper.js'), renderTaroHelper(relativeFromSrc(config.save_dir)));
  writeText(join(saveDir, 'helper.d.ts'), renderTaroHelperDts());
  generateUsingComponent(config, iconNames);

  for (const platform of config.platforms) {
    if (platform === 'taro') {
      continue;
    }

    console.log(`\nCreating icons for platform ${pc.green(platform)}\n`);
    const nested = withSaveDir(config, platform);

    if (platform === 'h5') {
      generateH5(data, { ...nested, unit: config.use_rpx ? 'rem' : 'px' });
      stripNestedDts(nested.save_dir);
    } else if (platform === 'rn') {
      generateRN(data, nested);
      stripNestedDts(nested.save_dir);
    } else if (MP_PLATFORMS[platform]) {
      generateMP(data, nested, platform);
    } else {
      console.warn(`\nThe platform ${pc.red(platform)} is not exist.\n`);
      continue;
    }

    generateUsingComponent(config, iconNames, platform);
  }
};
