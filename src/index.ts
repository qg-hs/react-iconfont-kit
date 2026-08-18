export type { KitConfig, XmlData, SvgSymbol, GeneratePlatform } from './core/types.js';
export { fetchXml, parseSymbolXml } from './core/fetchXml.js';
export { loadConfig } from './core/getConfig.js';
export { generateH5 } from './platforms/h5/generate.js';
export { generateRN } from './platforms/rn/generate.js';
export { generateMP } from './platforms/mp/generate.js';
export { generateTaro } from './platforms/taro/generate.js';
export { runInit, runGenerate } from './commands/run.js';
