import { basename, join, resolve } from 'node:path';
import pc from 'picocolors';
import type { KitConfig, XmlData } from '../../core/types.js';
import { emptyDir, ensureDir, writeText } from '../../core/fs.js';
import { trimIconPrefix } from '../../core/names.js';
import { renderMpSvgUri } from '../../core/svg.js';
import { MP_PLATFORMS, renderMpCss, renderMpJs, renderMpJson, renderMpXml } from '../../emit/mp.js';

export type { MpPlatformSpec } from '../../emit/mp.js';
export { MP_PLATFORMS };

export const generateMP = (data: XmlData, config: KitConfig, platformId: string): void => {
  const spec = MP_PLATFORMS[platformId];
  if (!spec) {
    console.warn(pc.red(`Unknown mini program platform: ${platformId}`));
    return;
  }

  const names: string[] = [];
  const icons: Array<{ name: string; svgUri: string }> = [];
  const saveDir = resolve(config.save_dir);
  const fileName = basename(config.save_dir) || 'iconfont';

  ensureDir(saveDir);
  emptyDir(saveDir);

  for (const item of data.svg.symbol) {
    const iconIdAfterTrim = trimIconPrefix(item.id, config.trim_icon_prefix);
    names.push(iconIdAfterTrim);
    icons.push({ name: iconIdAfterTrim, svgUri: renderMpSvgUri(item, spec.hexToRgb) });
    console.log(`${pc.green('√')} Generated icon "${pc.yellow(item.id)}"`);
  }

  writeText(join(saveDir, `${fileName}.${spec.cssExt}`), renderMpCss());
  writeText(join(saveDir, `${fileName}.${spec.xmlExt}`), renderMpXml(icons, spec));
  writeText(
    join(saveDir, `${fileName}.js`),
    renderMpJs({
      spec,
      names,
      size: config.default_icon_size,
      useRpx: config.use_rpx,
    }),
  );
  writeText(join(saveDir, `${fileName}.json`), renderMpJson(spec));

  console.log(`\n${pc.green('√')} All icons have been put into dir: ${pc.green(config.save_dir)}\n`);
};
