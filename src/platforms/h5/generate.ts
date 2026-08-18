import { join, resolve } from 'node:path';
import pc from 'picocolors';
import type { KitConfig, XmlData, XmlSymbol } from '../../core/types.js';
import { emptyDir, ensureDir, writeText } from '../../core/fs.js';
import { copyTemplate, getTemplate } from '../../core/getTemplate.js';
import { pascalCase, trimIconPrefix } from '../../core/names.js';
import {
  replaceCases,
  replaceComponentName,
  replaceExports,
  replaceImports,
  replaceNames,
  replaceNamesArray,
  replaceSingleIconContent,
  replaceSize,
  replaceSizeUnit,
} from '../../core/replace.js';
import { addJsxAttribute, eachChild } from '../../core/svg.js';
import { whitespace } from '../../core/whitespace.js';

const generateCase = (data: XmlSymbol, baseIdent: number): string => {
  let template = `\n${whitespace(baseIdent)}<svg viewBox="${data.$.viewBox}" width={size} height={size} style={style} {...rest}>\n`;

  const counter = { colorIndex: 0, baseIdent };
  eachChild(data, (domName, sub) => {
    template += `${whitespace(baseIdent + 2)}<${domName}${addJsxAttribute(domName, sub, counter, { camelCaseFill: true })}\n${whitespace(baseIdent + 2)}/>\n`;
  });

  template += `${whitespace(baseIdent)}</svg>\n`;
  return template;
};

export const generateH5 = (data: XmlData, config: KitConfig): void => {
  const names: string[] = [];
  const imports: string[] = [];
  const saveDir = resolve(config.save_dir);
  const jsxExtension = config.use_typescript ? '.tsx' : '.js';
  const jsExtension = config.use_typescript ? '.ts' : '.js';
  let cases = '';

  ensureDir(saveDir);
  emptyDir(saveDir);

  copyTemplate('h5', `helper${jsExtension}`, join(saveDir, `helper${jsExtension}`));
  if (!config.use_typescript) {
    copyTemplate('h5', 'helper.d.ts', join(saveDir, 'helper.d.ts'));
  }

  for (const item of data.svg.symbol) {
    const iconId = item.$.id;
    const iconIdAfterTrim = trimIconPrefix(iconId, config.trim_icon_prefix);
    const componentName = pascalCase(iconId);

    names.push(iconIdAfterTrim);
    imports.push(componentName);
    cases += `${whitespace(4)}case '${iconIdAfterTrim}':\n`;
    cases += `${whitespace(6)}return <${componentName} {...rest} />;\n`;

    let singleFile = getTemplate('h5', `SingleIcon${jsxExtension}`);
    singleFile = replaceSize(singleFile, config.default_icon_size);
    singleFile = replaceComponentName(singleFile, componentName);
    singleFile = replaceSingleIconContent(singleFile, generateCase(item, 4));
    singleFile = replaceSizeUnit(singleFile, config.unit);
    writeText(join(saveDir, componentName + jsxExtension), singleFile);

    if (!config.use_typescript) {
      let typeDefinitionFile = getTemplate('h5', 'SingleIcon.d.ts');
      typeDefinitionFile = replaceComponentName(typeDefinitionFile, componentName);
      writeText(join(saveDir, `${componentName}.d.ts`), typeDefinitionFile);
    }

    console.log(`${pc.green('√')} Generated icon "${pc.yellow(iconId)}"`);
  }

  let iconFile = getTemplate('h5', `Icon${jsxExtension}`);
  iconFile = replaceCases(iconFile, cases);
  iconFile = replaceImports(iconFile, imports);
  iconFile = replaceExports(iconFile, imports);

  if (config.use_typescript) {
    iconFile = replaceNames(iconFile, names);
  } else {
    iconFile = replaceNamesArray(iconFile, names);
    let typeDefinitionFile = getTemplate('h5', 'Icon.d.ts');
    typeDefinitionFile = replaceExports(typeDefinitionFile, imports);
    typeDefinitionFile = replaceNames(typeDefinitionFile, names);
    writeText(join(saveDir, 'index.d.ts'), typeDefinitionFile);
  }

  writeText(join(saveDir, `index${jsxExtension}`), iconFile);
  console.log(`\n${pc.green('√')} All icons have putted into dir: ${pc.green(config.save_dir)}\n`);
};
