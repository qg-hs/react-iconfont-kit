import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import pc from 'picocolors';
import type { GeneratePlatform, KitConfig, StandalonePlatform } from './types.js';

const DEFAULTS: KitConfig = {
  save_dir: './src/components/iconfont',
  use_typescript: false,
  trim_icon_prefix: 'icon',
  default_icon_size: 18,
  unit: 'px',
  use_rpx: true,
  design_width: 750,
  platforms: [],
};

export const DEFAULT_CONFIG_FILE = {
  symbol_url: '请参考 README.md，复制 iconfont.cn 提供的 JS 链接',
  save_dir: './src/components/iconfont',
  use_typescript: false,
  trim_icon_prefix: 'icon',
  default_icon_size: 18,
  unit: 'px',
  use_rpx: true,
  design_width: 750,
  local_svgs: '',
  platforms: '*',
} as const;

export const ALL_TARO_PLATFORMS: GeneratePlatform[] = [
  'weapp',
  'alipay',
  'swan',
  'tt',
  'qq',
  'kuaishou',
  'h5',
  'rn',
];

export const STANDALONE_PLATFORMS: StandalonePlatform[] = [
  'h5',
  'rn',
  'weapp',
  'alipay',
  'swan',
  'tt',
  'qq',
  'kuaishou',
];

const ALIASES: Record<string, GeneratePlatform> = {
  wechat: 'weapp',
  baidu: 'swan',
  toutiao: 'tt',
};

export const canonicalizePlatform = (value: string): GeneratePlatform => {
  const key = value.trim().toLowerCase();
  if (key in ALIASES) {
    return ALIASES[key];
  }
  return key as GeneratePlatform;
};

const parsePlatforms = (raw: unknown): GeneratePlatform[] => {
  if (raw === '*' || raw === undefined) {
    return [...ALL_TARO_PLATFORMS];
  }
  if (Array.isArray(raw)) {
    return [...new Set(raw.map((item) => canonicalizePlatform(String(item))))];
  }
  if (typeof raw === 'string' && raw.trim()) {
    if (raw.trim() === '*') {
      return [...ALL_TARO_PLATFORMS];
    }
    return [...new Set(raw.split(',').map((item) => canonicalizePlatform(item)))];
  }
  return [];
};

export const loadConfig = (configFilePath = 'iconfont.json'): KitConfig => {
  const targetFile = resolve(configFilePath);
  if (!existsSync(targetFile)) {
    console.warn(pc.red(`File "${configFilePath}" doesn't exist, did you forget to generate it?`));
    process.exit(1);
  }

  const raw = JSON.parse(readFileSync(targetFile, 'utf8')) as Partial<KitConfig> & {
    platforms?: unknown;
  };

  const config: KitConfig = {
    ...DEFAULTS,
    ...raw,
    save_dir: raw.save_dir || DEFAULTS.save_dir,
    default_icon_size: raw.default_icon_size || DEFAULTS.default_icon_size,
    unit: raw.unit || DEFAULTS.unit,
    design_width: raw.design_width || DEFAULTS.design_width,
    platforms: parsePlatforms(raw.platforms),
  };

  if (config.symbol_url) {
    if (!/^(https?:)?\/\//.test(config.symbol_url)) {
      console.warn(pc.red('You are required to provide a valid symbol_url'));
      process.exit(1);
    }
    if (config.symbol_url.startsWith('//')) {
      config.symbol_url = `https:${config.symbol_url}`;
    }
  }

  return config;
};

export const assertSource = (config: KitConfig, platform: GeneratePlatform): void => {
  if (platform === 'rn' && config.local_svgs) {
    return;
  }
  if (!config.symbol_url) {
    console.warn(pc.red('You are required to provide symbol_url (or local_svgs for RN)'));
    process.exit(1);
  }
};
