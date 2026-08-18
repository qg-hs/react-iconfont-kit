export const replaceSize = (content: string, size: number): string =>
  content.replace(/#size#/g, String(size));

export const replaceCases = (content: string, cases: string): string =>
  content.replace(/#cases#/g, cases);

export const replaceNames = (content: string, names: string[]): string =>
  content.replace(/#names#/g, names.join(`' | '`));

export const replaceNamesArray = (content: string, names: string[]): string =>
  content.replace(
    /#namesArray#/g,
    JSON.stringify(names)
      .replace(/"/g, "'")
      .replace(/','/g, "', '"),
  );

export const replaceComponentName = (content: string, name: string): string =>
  content.replace(/#componentName#/g, name);

export const replaceSingleIconContent = (content: string, render: string): string =>
  content.replace(/#iconContent#/g, render);

export const replaceImports = (content: string, imports: string[]): string =>
  content.replace(
    /#imports#/g,
    imports.map((item) => `import ${item} from './${item}';`).join('\n'),
  );

export const replaceExports = (content: string, exported: string[]): string =>
  content.replace(
    /#exports#/g,
    exported.map((item) => `export { default as ${item} } from './${item}';`).join('\n'),
  );

export const replaceSizeUnit = (content: string, unit: string): string =>
  content.replace(/\{size\}/g, `{size + '${unit}'}`);

export const replaceSvgComponents = (content: string, components: Set<string>): string => {
  const used = Array.from(components);
  return content.replace(
    /#svgComponents#/g,
    used.length ? `import { ${used.join(', ')} } from 'react-native-svg';` : '',
  );
};

export const replaceHelper = (content: string): string =>
  content.replace(/#helper#/g, "import { getIconColor } from './helper';");

export const replaceComponentXml = (content: string, svgStr: string): string =>
  content.replace(/#xml#/g, svgStr);

export const replacePlatform = (content: string, platform: string): string =>
  content.replace(/#platform#/g, platform);

export const replaceIsRpx = (content: string, useRpx: boolean): string =>
  content
    .replace(/#rpx-1:(.+?):#/g, useRpx ? '$1' : '')
    .replace(/#rpx-0:(.+?):#/g, useRpx ? '' : '$1');

export const replaceDesignWidth = (content: string, designWidth: number): string =>
  content.replace(/#designWidth#/g, String(designWidth));

export const replaceHexToRgb = (hex: string): string => {
  let value = hex.startsWith('#') ? hex.slice(1) : hex;
  const rgb: number[] = [];

  if (value.length === 3) {
    value = value.replace(/(.)/g, '$1$1');
  }

  value.replace(/../g, (color) => {
    rgb.push(parseInt(color, 16));
    return color;
  });

  return `rgb(${rgb.join(',')})`;
};
