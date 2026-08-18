import { join, resolve } from 'node:path';
import pc from 'picocolors';
import type { KitConfig, SvgSymbol, XmlData } from '../../core/types.js';
import { emptyDir, ensureDir, writeText } from '../../core/fs.js';
import { pascalCase, trimIconPrefix } from '../../core/names.js';
import { renderJsxSvg } from '../../core/svg.js';
import { renderGetIconColor, renderGetIconColorDts } from '../../emit/helper.js';
import { renderH5Index, renderH5IndexDts, renderH5SingleIcon, renderH5SingleIconDts } from '../../emit/h5.js';
import { renderSwitchCases } from '../../emit/shared.js';

const generateCase = (symbol: SvgSymbol, unit: string): string =>
  renderJsxSvg(symbol, {
    indent: 4,
    tag: 'svg',
    sizeExpr: `size + '${unit}'`,
    extraOpen: 'className={className} style={style}',
    camelCaseFill: true,
  });

export const generateH5 = (data: XmlData, config: KitConfig): void => {
  const names: string[] = [];
  const components: string[] = [];
  const saveDir = resolve(config.save_dir);
  const jsxExtension = config.use_typescript ? '.tsx' : '.js';
  const jsExtension = config.use_typescript ? '.ts' : '.js';
  const entries: Array<{ name: string; component: string }> = [];

  ensureDir(saveDir);
  emptyDir(saveDir);

  writeText(join(saveDir, `helper${jsExtension}`), renderGetIconColor(config.use_typescript));
  if (!config.use_typescript) {
    writeText(join(saveDir, 'helper.d.ts'), renderGetIconColorDts());
  }

  for (const item of data.svg.symbol) {
    const iconIdAfterTrim = trimIconPrefix(item.id, config.trim_icon_prefix);
    const componentName = pascalCase(item.id);

    names.push(iconIdAfterTrim);
    components.push(componentName);
    entries.push({ name: iconIdAfterTrim, component: componentName });

    writeText(
      join(saveDir, componentName + jsxExtension),
      renderH5SingleIcon({
        ts: config.use_typescript,
        componentName,
        size: config.default_icon_size,
        iconJsx: generateCase(item, config.unit),
      }),
    );

    if (!config.use_typescript) {
      writeText(join(saveDir, `${componentName}.d.ts`), renderH5SingleIconDts(componentName));
    }

    console.log(`${pc.green('√')} Generated icon "${pc.yellow(item.id)}"`);
  }

  const cases = renderSwitchCases(entries);
  writeText(
    join(saveDir, `index${jsxExtension}`),
    renderH5Index({
      ts: config.use_typescript,
      names,
      components,
      cases,
    }),
  );

  if (!config.use_typescript) {
    writeText(join(saveDir, 'index.d.ts'), renderH5IndexDts({ names, components }));
  }

  console.log(`\n${pc.green('√')} All icons have been put into dir: ${pc.green(config.save_dir)}\n`);
};
