#!/usr/bin/env node
import { runInit } from '../commands/run.js';

const outputFlag = process.argv.findIndex((arg) => arg === '--output' || arg === '-o');
const output = outputFlag >= 0 ? process.argv[outputFlag + 1] : 'iconfont.json';
runInit(output);
