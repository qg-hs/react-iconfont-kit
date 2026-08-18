import { existsSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import pc from 'picocolors';
import { fetchXml } from '../core/fetchXml.js';
import { assertSource, canonicalizePlatform, DEFAULT_CONFIG_FILE, loadConfig } from '../core/getConfig.js';
import type { GeneratePlatform, KitConfig, XmlData } from '../core/types.js';
import { generateH5 } from '../platforms/h5/generate.js';
import { generateMP, MP_PLATFORMS } from '../platforms/mp/generate.js';
import { generateRN } from '../platforms/rn/generate.js';
import { generateTaro } from '../platforms/taro/generate.js';

export const runInit = (outputPath = 'iconfont.json'): void => {
  let output = outputPath;
  if (!output.endsWith('.json')) {
    output += '.json';
  }
  const targetFile = resolve(output);
  if (existsSync(targetFile)) {
    console.error(pc.red(`File "${output}" already exists.`));
    process.exit(1);
  }
  writeFileSync(targetFile, `${JSON.stringify(DEFAULT_CONFIG_FILE, null, 2)}\n`);
  console.log(pc.green(`Created "${output}". Add it to version control.`));
};

const emptyXml = (): XmlData => ({ svg: { symbol: [] } });

const loadXml = async (config: KitConfig, platform: GeneratePlatform): Promise<XmlData> => {
  if (config.symbol_url) {
    return fetchXml(config.symbol_url);
  }
  if (platform === 'rn' && config.local_svgs) {
    return emptyXml();
  }
  throw new Error('symbol_url is required');
};

export const runGenerate = async (options: { config?: string; platform?: string }): Promise<void> => {
  const config = loadConfig(options.config || 'iconfont.json');
  const platformArg = options.platform?.trim();

  try {
    if (!platformArg || platformArg === 'taro' || platformArg === 'all') {
      assertSource(config, 'taro');
      const data = await loadXml(config, 'taro');
      generateTaro(data, config);
      return;
    }

    const platform = canonicalizePlatform(platformArg);

    if (platform === 'h5') {
      assertSource(config, 'h5');
      generateH5(await loadXml(config, 'h5'), config);
      return;
    }

    if (platform === 'rn') {
      assertSource(config, 'rn');
      generateRN(await loadXml(config, 'rn'), config);
      return;
    }

    if (MP_PLATFORMS[platform]) {
      assertSource(config, platform);
      generateMP(await loadXml(config, platform), config, platform);
      return;
    }

    console.warn(pc.red(`Unknown platform: ${platformArg}`));
    process.exit(1);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown Error';
    console.error(pc.red(message));
    process.exit(1);
  }
};
