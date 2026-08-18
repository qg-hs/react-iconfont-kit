import { runGenerate } from '../commands/run.js';

export const runPlatformBin = async (platform: string): Promise<void> => {
  const configFlag = process.argv.findIndex((arg) => arg === '--config' || arg === '-c');
  const config = configFlag >= 0 ? process.argv[configFlag + 1] : 'iconfont.json';
  await runGenerate({ config, platform });
};
