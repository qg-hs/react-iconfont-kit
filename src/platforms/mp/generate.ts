import { basename, join, resolve } from 'node:path';
import pc from 'picocolors';
import type { KitConfig, XmlData, XmlSymbol } from '../../core/types.js';
import { emptyDir, ensureDir, writeText } from '../../core/fs.js';
import { getTemplate } from '../../core/getTemplate.js';
import { trimIconPrefix } from '../../core/names.js';
import { replaceHexToRgb, replaceIsRpx, replaceSize } from '../../core/replace.js';
import { eachChild } from '../../core/svg.js';

export interface MpPlatformSpec {
  id: 'weapp' | 'alipay' | 'swan' | 'tt' | 'qq' | 'kuaishou';
  ifAttr: string;
  xmlExt: string;
  cssExt: string;
  template: string;
  hexToRgb: boolean;
}

export const MP_PLATFORMS: Record<string, MpPlatformSpec> = {
  weapp: { id: 'weapp', ifAttr: 'wx:if', xmlExt: 'wxml', cssExt: 'wxss', template: 'wechat', hexToRgb: true },
  wechat: { id: 'weapp', ifAttr: 'wx:if', xmlExt: 'wxml', cssExt: 'wxss', template: 'wechat', hexToRgb: true },
  alipay: { id: 'alipay', ifAttr: 'a:if', xmlExt: 'axml', cssExt: 'acss', template: 'alipay', hexToRgb: true },
  swan: { id: 'swan', ifAttr: 's-if', xmlExt: 'swan', cssExt: 'css', template: 'baidu', hexToRgb: true },
  baidu: { id: 'swan', ifAttr: 's-if', xmlExt: 'swan', cssExt: 'css', template: 'baidu', hexToRgb: true },
  tt: { id: 'tt', ifAttr: 'tt:if', xmlExt: 'ttml', cssExt: 'ttss', template: 'toutiao', hexToRgb: true },
  toutiao: { id: 'tt', ifAttr: 'tt:if', xmlExt: 'ttml', cssExt: 'ttss', template: 'toutiao', hexToRgb: true },
  qq: { id: 'qq', ifAttr: 'qq:if', xmlExt: 'qml', cssExt: 'qss', template: 'qq', hexToRgb: false },
  kuaishou: { id: 'kuaishou', ifAttr: 'ks:if', xmlExt: 'ksml', cssExt: 'css', template: 'kuaishou', hexToRgb: true },
};

const ATTRIBUTE_FILL_MAP = new Set(['path']);

const generateCase = (data: XmlSymbol, hexToRgb: boolean): string => {
  let template = `<svg viewBox='${data.$.viewBox}' xmlns='http://www.w3.org/2000/svg' width='{{svgSize}}px' height='{{svgSize}}px'>`;

  const counter = { colorIndex: 0 };
  eachChild(data, (domName, sub) => {
    template += `<${domName}${addAttribute(domName, sub, counter, hexToRgb)} />`;
  });

  template += `</svg>`;
  return template.replace(/<|>/g, (matched) => encodeURIComponent(matched));
};

const addAttribute = (
  domName: string,
  sub: { $?: Record<string, string> },
  counter: { colorIndex: number },
  hexToRgb: boolean,
): string => {
  let template = '';
  if (!sub?.$) {
    return template;
  }

  if (ATTRIBUTE_FILL_MAP.has(domName)) {
    sub.$.fill = sub.$.fill || '#333333';
  }

  for (const attributeName of Object.keys(sub.$)) {
    if (attributeName === 'fill') {
      const color = hexToRgb ? replaceHexToRgb(sub.$[attributeName]) : sub.$[attributeName];
      const keyword = hexToRgb ? 'colors' : 'color';
      template += ` ${attributeName}='{{(isStr ? ${keyword} : ${keyword}[${counter.colorIndex}]) || '${color}'}}'`;
      counter.colorIndex += 1;
    } else {
      template += ` ${attributeName}='${sub.$[attributeName]}'`;
    }
  }

  return template;
};

export const generateMP = (data: XmlData, config: KitConfig, platformId: string): void => {
  const spec = MP_PLATFORMS[platformId];
  if (!spec) {
    console.warn(pc.red(`Unknown mini program platform: ${platformId}`));
    return;
  }

  const svgTemplates: string[] = [];
  const names: string[] = [];
  const saveDir = resolve(config.save_dir);
  const fileName = basename(config.save_dir) || 'iconfont';

  ensureDir(saveDir);
  emptyDir(saveDir);

  for (const item of data.svg.symbol) {
    const iconId = item.$.id;
    const iconIdAfterTrim = trimIconPrefix(iconId, config.trim_icon_prefix);
    names.push(iconIdAfterTrim);
    svgTemplates.push(
      `<!--${iconIdAfterTrim}-->\n<view ${spec.ifAttr}="{{name === '${iconIdAfterTrim}'}}" style="background-image: url({{quot}}data:image/svg+xml, ${generateCase(item, spec.hexToRgb)}{{quot}});` +
        ' width: {{svgSize}}px; height: {{svgSize}}px; {{customStyle}}" class="icon {{className}}" />',
    );
    console.log(`${pc.green('√')} Generated icon "${pc.yellow(iconId)}"`);
  }

  writeText(join(saveDir, `${fileName}.${spec.cssExt}`), getTemplate('mp', `${spec.template}.${spec.cssExt}`));
  writeText(join(saveDir, `${fileName}.${spec.xmlExt}`), svgTemplates.join('\n\n'));

  let jsFile = getTemplate('mp', `${spec.template}.js`);
  jsFile = replaceSize(jsFile, config.default_icon_size);
  jsFile = jsFile.replace(/#names#/g, names.join(' | '));
  jsFile = replaceIsRpx(jsFile, config.use_rpx);
  writeText(join(saveDir, `${fileName}.js`), jsFile);
  writeText(join(saveDir, `${fileName}.json`), getTemplate('mp', `${spec.template}.json`));

  console.log(`\n${pc.green('√')} All icons have been putted into dir: ${pc.green(config.save_dir)}\n`);
};
