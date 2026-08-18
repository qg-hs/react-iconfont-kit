#!/usr/bin/env node
import { defineCommand, runMain } from 'citty';
import { runGenerate, runInit } from './commands/run.js';

const init = defineCommand({
  meta: {
    name: 'init',
    description: 'Generate iconfont.json',
  },
  args: {
    output: {
      type: 'string',
      description: 'Config file path',
      default: 'iconfont.json',
      alias: 'o',
    },
  },
  run({ args }) {
    runInit(args.output);
  },
});

const generate = defineCommand({
  meta: {
    name: 'generate',
    description: 'Generate icon components',
  },
  args: {
    config: {
      type: 'string',
      description: 'Path to iconfont.json',
      default: 'iconfont.json',
      alias: 'c',
    },
    platform: {
      type: 'string',
      description: 'h5 | rn | weapp | alipay | swan | tt | qq | kuaishou | taro',
      alias: 'p',
    },
  },
  async run({ args }) {
    await runGenerate({ config: args.config, platform: args.platform });
  },
});

const main = defineCommand({
  meta: {
    name: 'iconfont',
    description: 'Generate React / RN / Mini Program / Taro icons from iconfont.cn',
  },
  subCommands: {
    init,
    generate,
  },
});

runMain(main);
