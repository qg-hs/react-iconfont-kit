import { join, resolve } from 'node:path';
import pc from 'picocolors';
import type { KitConfig, XmlData, XmlSymbol } from '../../core/types.js';
import { emptyDir, ensureDir, writeText } from '../../core/fs.js';
import { copyTemplate, getTemplate } from '../../core/getTemplate.js';
import { pascalCase, trimIconPrefix } from '../../core/names.js';
import {
  replaceCases,
  replaceComponentName,
  replaceComponentXml,
  replaceExports,
  replaceHelper,
  replaceImports,
  replaceNames,
  replaceNamesArray,
  replaceSingleIconContent,
  replaceSize,
  replaceSvgComponents,
} from '../../core/replace.js';
import { addJsxAttribute, eachChild } from '../../core/svg.js';
import { whitespace } from '../../core/whitespace.js';
import { parseLocalSvg } from './parseLocalSvg.js';

const SVG_MAP: Record<string, string> = {
  path: 'Path',
  circle: 'Circle',
  ellipse: 'Ellipse',
  rect: 'Rect',
  line: 'Line',
  polygon: 'Polygon',
  polyline: 'Polyline',
  g: 'G',
  defs: 'Defs',
  linearGradient: 'LinearGradient',
  radialGradient: 'RadialGradient',
  stop: 'Stop',
  use: 'Use',
};

const generateCase = (data: XmlSymbol, baseIdent: number): string => {
  let template = `\n${whitespace(baseIdent)}<Svg viewBox="${data.$.viewBox}" width={size} height={size} {...rest}>\n`;

  const counter = { colorIndex: 0, baseIdent };
  eachChild(data, (domName, sub) => {
    const realDomName = SVG_MAP[domName];
    if (!realDomName) {
      console.error(pc.red(`Unable to transform dom "${domName}"`));
      process.exit(1);
    }
    template += `${whitespace(baseIdent + 2)}<${realDomName}${addJsxAttribute(domName, sub, counter)}\n${whitespace(baseIdent + 2)}/>\n`;
  });

  template += `${whitespace(baseIdent)}</Svg>\n`;
  return template;
};

const collectSvgComponents = (item: XmlSymbol, useTypescript: boolean): Set<string> => {
  const current = new Set<string>(['Svg']);
  if (useTypescript) {
    current.add('GProps');
  }
  eachChild(item, (domName) => {
    const mapped = SVG_MAP[domName];
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
  const imports: string[] = [];
  const saveDir = resolve(config.save_dir);
  const jsxExtension = config.use_typescript ? '.tsx' : '.js';
  const jsExtension = config.use_typescript ? '.ts' : '.js';
  let cases = '';

  if (config.use_typescript) {
    svgComponents.add('GProps');
  }

  ensureDir(saveDir);
  emptyDir(saveDir);

  copyTemplate('rn', `helper${jsExtension}`, join(saveDir, `helper${jsExtension}`));
  if (!config.use_typescript) {
    copyTemplate('rn', 'helper.d.ts', join(saveDir, 'helper.d.ts'));
  }

  data.svg.symbol.forEach((item, index) => {
    const iconId = item.$.id;
    const iconIdAfterTrim = trimIconPrefix(iconId, config.trim_icon_prefix);
    const componentName = pascalCase(iconId);
    const currentSvgComponents = collectSvgComponents(item, config.use_typescript);

    names.push(iconIdAfterTrim);
    imports.push(componentName);
    cases += `${whitespace(4)}case '${iconIdAfterTrim}':\n`;
    cases += `${whitespace(6)}return <${componentName} key="${index + 1}" {...rest} />;\n`;

    let singleFile = getTemplate('rn', `SingleIcon${jsxExtension}`);
    singleFile = replaceSize(singleFile, config.default_icon_size);
    singleFile = replaceSvgComponents(singleFile, currentSvgComponents);
    singleFile = replaceComponentName(singleFile, componentName);
    singleFile = replaceSingleIconContent(singleFile, generateCase(item, 4));
    singleFile = replaceHelper(singleFile);
    writeText(join(saveDir, componentName + jsxExtension), singleFile);

    if (!config.use_typescript) {
      let typeDefinitionFile = getTemplate('rn', 'SingleIcon.d.ts');
      typeDefinitionFile = replaceComponentName(typeDefinitionFile, componentName);
      writeText(join(saveDir, `${componentName}.d.ts`), typeDefinitionFile);
    }

    console.log(`${pc.green('√')} Generated icon "${pc.yellow(iconId)}"`);
  });

  localSvg.forEach(({ name, svgStr, styleType }, index) => {
    const componentName = pascalCase(config.trim_icon_prefix) + pascalCase(name);
    const currentSvgComponents = new Set<string>();
    if (config.use_typescript) {
      currentSvgComponents.add('GProps');
    }
    currentSvgComponents.add(styleType ? 'SvgCss' : 'SvgXml');

    names.push(name);
    imports.push(componentName);
    cases += `${whitespace(4)}case '${name}':\n`;
    cases += `${whitespace(6)}return <${componentName} key="L${index + 1}" {...rest} />;\n`;

    let singleFile = getTemplate('rn', `LocalSingleIcon${jsxExtension}`);
    singleFile = replaceSize(singleFile, config.default_icon_size);
    singleFile = replaceSvgComponents(singleFile, currentSvgComponents);
    singleFile = replaceComponentName(singleFile, componentName);
    singleFile = replaceComponentXml(singleFile, `const xml = \`\n${svgStr}\n\``);
    singleFile = replaceSingleIconContent(
      singleFile,
      `\n${whitespace(4)}<${styleType ? 'SvgCss' : 'SvgXml'} xml={xml}  width={size} height={size} {...rest} />\n`,
    );
    writeText(join(saveDir, componentName + jsxExtension), singleFile);

    if (!config.use_typescript) {
      let typeDefinitionFile = getTemplate('rn', 'SingleIcon.d.ts');
      typeDefinitionFile = replaceComponentName(typeDefinitionFile, componentName);
      writeText(join(saveDir, `${componentName}.d.ts`), typeDefinitionFile);
    }

    console.log(`${pc.green('√')} Generated local icon "${pc.yellow(name)}"`);
  });

  let iconFile = getTemplate('rn', `Icon${jsxExtension}`);
  iconFile = replaceSize(iconFile, config.default_icon_size);
  iconFile = replaceCases(iconFile, cases);
  iconFile = replaceSvgComponents(iconFile, svgComponents);
  iconFile = replaceImports(iconFile, imports);
  iconFile = replaceExports(iconFile, imports);

  if (config.use_typescript) {
    iconFile = replaceNames(iconFile, names);
  } else {
    iconFile = replaceNamesArray(iconFile, names);
    let typeDefinitionFile = getTemplate('rn', 'Icon.d.ts');
    typeDefinitionFile = replaceExports(typeDefinitionFile, imports);
    typeDefinitionFile = replaceNames(typeDefinitionFile, names);
    writeText(join(saveDir, 'index.d.ts'), typeDefinitionFile);
  }

  writeText(join(saveDir, `index${jsxExtension}`), iconFile);
  console.log(`\n${pc.green('√')} All icons have putted into dir: ${pc.green(config.save_dir)}\n`);
};
