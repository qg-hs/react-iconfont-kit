import { join, resolve } from 'node:path';
import pc from 'picocolors';
import type { KitConfig, SvgSymbol, XmlData } from '../../core/types.js';
import { emptyDir, ensureDir, writeText } from '../../core/fs.js';
import { pascalCase, trimIconPrefix } from '../../core/names.js';
import { eachChild, renderJsxSvg, RN_SVG_MAP } from '../../core/svg.js';
import { renderGetIconColor, renderGetIconColorDts } from '../../emit/helper.js';
import {
  renderRnIndex,
  renderRnIndexDts,
  renderRnLocalIcon,
  renderRnSingleIcon,
  renderRnSingleIconDts,
} from '../../emit/rn.js';
import { renderSwitchCases } from '../../emit/shared.js';
import { parseLocalSvg } from './parseLocalSvg.js';

const generateCase = (symbol: SvgSymbol): string =>
  renderJsxSvg(symbol, {
    indent: 4,
    tag: 'Svg',
    sizeExpr: 'size',
    mapTag: (name) => RN_SVG_MAP[name],
    onUnknownTag: (name) => {
      console.error(pc.red(`Unable to transform dom "${name}"`));
      process.exit(1);
    },
  });

const collectSvgComponents = (item: SvgSymbol, useTypescript: boolean): Set<string> => {
  const current = new Set<string>(['Svg']);
  if (useTypescript) {
    current.add('GProps');
  }
  eachChild(item, (node) => {
    const mapped = RN_SVG_MAP[node.name];
    if (mapped) {
      current.add(mapped);
    }
  });
  return current;
};

export const generateRN = (data: XmlData, config: KitConfig): void => {
  const localSvg = parseLocalSvg(config);
  const svgComponents = new Set<string>();
  const names: string[] = [];
  const components: string[] = [];
  const entries: Array<{ name: string; component: string }> = [];
  const saveDir = resolve(config.save_dir);
  const jsxExtension = config.use_typescript ? '.tsx' : '.js';
  const jsExtension = config.use_typescript ? '.ts' : '.js';

  if (config.use_typescript) {
    svgComponents.add('GProps');
  }

  ensureDir(saveDir);
  emptyDir(saveDir);

  writeText(join(saveDir, `helper${jsExtension}`), renderGetIconColor(config.use_typescript));
  if (!config.use_typescript) {
    writeText(join(saveDir, 'helper.d.ts'), renderGetIconColorDts());
  }

  for (const item of data.svg.symbol) {
    const iconIdAfterTrim = trimIconPrefix(item.id, config.trim_icon_prefix);
    const componentName = pascalCase(item.id);
    const currentSvgComponents = collectSvgComponents(item, config.use_typescript);

    names.push(iconIdAfterTrim);
    components.push(componentName);
    entries.push({ name: iconIdAfterTrim, component: componentName });

    writeText(
      join(saveDir, componentName + jsxExtension),
      renderRnSingleIcon({
        ts: config.use_typescript,
        componentName,
        size: config.default_icon_size,
        iconJsx: generateCase(item),
        svgComponents: currentSvgComponents,
      }),
    );

    if (!config.use_typescript) {
      writeText(join(saveDir, `${componentName}.d.ts`), renderRnSingleIconDts(componentName));
    }

    console.log(`${pc.green('√')} Generated icon "${pc.yellow(item.id)}"`);
  }

  for (const { name, svgStr, styleType } of localSvg) {
    const componentName = pascalCase(config.trim_icon_prefix) + pascalCase(name);
    const currentSvgComponents = new Set<string>();
    if (config.use_typescript) {
      currentSvgComponents.add('GProps');
    }
    currentSvgComponents.add(styleType ? 'SvgCss' : 'SvgXml');

    names.push(name);
    components.push(componentName);
    entries.push({ name, component: componentName });

    writeText(
      join(saveDir, componentName + jsxExtension),
      renderRnLocalIcon({
        ts: config.use_typescript,
        componentName,
        size: config.default_icon_size,
        svgStr,
        styleType,
        svgComponents: currentSvgComponents,
      }),
    );

    if (!config.use_typescript) {
      writeText(join(saveDir, `${componentName}.d.ts`), renderRnSingleIconDts(componentName));
    }

    console.log(`${pc.green('√')} Generated local icon "${pc.yellow(name)}"`);
  }

  writeText(
    join(saveDir, `index${jsxExtension}`),
    renderRnIndex({
      ts: config.use_typescript,
      names,
      components,
      cases: renderSwitchCases(entries),
      svgComponents,
    }),
  );

  if (!config.use_typescript) {
    writeText(join(saveDir, 'index.d.ts'), renderRnIndexDts({ names, components }));
  }

  console.log(`\n${pc.green('√')} All icons have been put into dir: ${pc.green(config.save_dir)}\n`);
};
